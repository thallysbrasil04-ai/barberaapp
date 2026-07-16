"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Scissors, Loader2, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToastContext } from "@/providers/toast-provider";

interface BarberOption {
  id: string;
  name: string;
  avatar: string | null;
  barber: {
    id: string;
    bio: string | null;
    specialties: string | null;
  } | null;
}

interface ServiceOption {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  category: string;
  active: boolean;
}

type Step = "service" | "barber" | "datetime" | "confirm" | "done";

export default function AgendamentoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToast } = useToastContext();

  const [step, setStep] = useState<Step>("service");
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [barbers, setBarbers] = useState<BarberOption[]>([]);
  const [slots, setSlots] = useState<string[]>([]);

  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<BarberOption | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setServices(d.data.filter((s: ServiceOption) => s.active)); });
    fetch("/api/barbers?activeOnly=true")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setBarbers(d.data); });
  }, []);

  useEffect(() => {
    if (selectedBarber && selectedDate) {
      fetch(`/api/appointments/available-slots?barberId=${selectedBarber.barber?.id}&date=${selectedDate}`)
        .then((r) => r.json())
        .then((d) => { if (d.ok) setSlots(d.data); else setSlots([]); });
    }
  }, [selectedBarber, selectedDate]);

  async function handleConfirm() {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;

    if (!session) {
      router.push("/login?callbackUrl=/agendamento");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barberId: selectedBarber.barber?.id,
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.ok) {
      setStep("done");
      addToast("Agendamento confirmado!", "success");
    } else {
      addToast(data.error || "Erro ao agendar", "error");
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-red-200 bg-white/95 backdrop-blur sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-neutral-900">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Scissors className="h-4 w-4 text-white" />
            </div>
            BarberApp
          </Link>
          {session ? (
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">Cadastrar</Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-8 text-sm">
          {["service", "barber", "datetime", "confirm"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s
                    ? "bg-red-600 text-white shadow-md shadow-red-200"
                    : step === "done" || (["service", "barber", "datetime", "confirm"].indexOf(s) <
                        ["service", "barber", "datetime", "confirm"].indexOf(step))
                      ? "bg-neutral-800 text-white"
                      : "bg-neutral-200 text-neutral-400"
                }`}
              >
                {["service", "barber", "datetime", "confirm"].indexOf(s) <
                  ["service", "barber", "datetime", "confirm"].indexOf(step) &&
                step !== s ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 3 && (
                <div
                  className={`w-10 h-0.5 transition-colors ${
                    ["service", "barber", "datetime", "confirm"].indexOf(s) <
                    ["service", "barber", "datetime", "confirm"].indexOf(step)
                      ? "bg-neutral-800"
                      : "bg-neutral-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {step === "done" ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border-2 border-red-200">
                  <CheckCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Agendamento Confirmado!</h2>
              <p className="text-neutral-600 mb-6">
                {selectedService?.name} com {selectedBarber?.name}
                <br />
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR")} às {selectedTime}
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/dashboard">
                  <Button>Ir para Dashboard</Button>
                </Link>
                <Link href="/agendamento">
                  <Button variant="outline">Novo Agendamento</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {step === "service" && "Escolha o Serviço"}
                {step === "barber" && "Escolha o Barbeiro"}
                {step === "datetime" && "Escolha a Data e Horário"}
                {step === "confirm" && "Confirme o Agendamento"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === "service" && (
                <div className="grid gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => { setSelectedService(service); setStep("barber"); }}
                      className={`text-left w-full p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedService?.id === service.id
                          ? "border-red-500 bg-red-50 shadow-sm"
                          : "border-neutral-200 bg-white hover:border-red-300 hover:bg-red-50/30"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-neutral-900">{service.name}</p>
                          <p className="text-sm text-neutral-500">{service.description}</p>
                          <p className="text-xs text-neutral-400 mt-1">{service.duration} min</p>
                        </div>
                        <p className="font-bold text-red-600">{formatCurrency(service.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === "barber" && (
                <div className="grid gap-3">
                  {barbers.map((barber) => (
                    <button
                      key={barber.id}
                      onClick={() => { setSelectedBarber(barber); setStep("datetime"); }}
                      className={`text-left w-full p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedBarber?.id === barber.id
                          ? "border-red-500 bg-red-50 shadow-sm"
                          : "border-neutral-200 bg-white hover:border-red-300 hover:bg-red-50/30"
                      }`}
                    >
                      <p className="font-semibold text-neutral-900">{barber.name}</p>
                      {barber.barber?.bio && (
                        <p className="text-sm text-neutral-500">{barber.barber.bio}</p>
                      )}
                      {barber.barber?.specialties && (
                        <p className="text-xs text-neutral-400 mt-1">{barber.barber.specialties}</p>
                      )}
                    </button>
                  ))}
                  <Button variant="ghost" onClick={() => setStep("service")}>
                    Voltar
                  </Button>
                </div>
              )}

              {step === "datetime" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Data</label>
                    <input
                      type="date"
                      min={today}
                      value={selectedDate}
                      onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(""); }}
                      className="flex h-10 w-full rounded-lg border-2 border-neutral-200 bg-white px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                    />
                  </div>

                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2">Horário</label>
                      {slots.length === 0 ? (
                        <p className="text-sm text-neutral-400 text-center py-6 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                          Nenhum horário disponível nesta data
                        </p>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {slots.map((time) => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`p-2.5 text-center rounded-lg border-2 text-sm font-medium transition-all cursor-pointer ${
                                selectedTime === time
                                  ? "border-red-500 bg-red-600 text-white shadow-md"
                                  : "border-neutral-200 bg-white text-neutral-700 hover:border-red-300 hover:bg-red-50"
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="ghost" onClick={() => setStep("barber")}>Voltar</Button>
                    <Button
                      className="flex-1"
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => setStep("confirm")}
                    >
                      Continuar
                    </Button>
                  </div>
                </div>
              )}

              {step === "confirm" && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-5 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Serviço</span>
                      <span className="font-semibold text-neutral-900">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Barbeiro</span>
                      <span className="font-semibold text-neutral-900">{selectedBarber?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Data</span>
                      <span className="font-semibold text-neutral-900">
                        {selectedDate && new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Horário</span>
                      <span className="font-semibold text-neutral-900">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between border-t border-red-200 pt-3 font-bold text-lg">
                      <span className="text-neutral-900">Valor</span>
                      <span className="text-red-600">{formatCurrency(selectedService?.price || 0)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setStep("datetime")}>Voltar</Button>
                    <Button className="flex-1" onClick={handleConfirm} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Agendamento"}
                    </Button>
                  </div>

                  {!session && (
                    <p className="text-sm text-neutral-500 text-center bg-neutral-50 py-3 rounded-lg border border-dashed border-neutral-300">
                      Você precisará fazer login para confirmar o agendamento.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
