"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Scissors,
  Loader2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  User,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToastContext } from "@/providers/toast-provider";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  addMonths,
  subMonths,
  parse,
  getDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";

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

function Calendar({ selectedDate, onSelect }: { selectedDate: string; onSelect: (date: string) => void }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) return parse(selectedDate, "yyyy-MM-dd", new Date());
    return new Date();
  });

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const today = new Date();

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
          className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer text-neutral-600"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-semibold text-neutral-900 text-sm">
          {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
        </span>
        <button
          onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
          className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer text-neutral-600"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[11px] font-semibold text-neutral-400 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isPast = isBefore(day, today) && !isSameDay(day, today);
          const isSelected = selectedDate === dateStr;
          const isDayToday = isToday(day);

          return (
            <button
              key={dateStr}
              disabled={isPast || !isCurrentMonth}
              onClick={() => onSelect(dateStr)}
              className={`relative p-1.5 text-center text-sm rounded-lg transition-all cursor-pointer
                ${!isCurrentMonth ? "text-neutral-200" : ""}
                ${isPast || !isCurrentMonth ? "cursor-not-allowed opacity-40" : ""}
                ${isSelected
                  ? "bg-primary text-white shadow-md shadow-primary/20 font-bold"
                  : isDayToday && !isSelected
                    ? "bg-primary-light text-primary font-semibold border border-primary/20"
                    : isCurrentMonth && !isPast
                      ? "hover:bg-neutral-100 text-neutral-700"
                      : "text-neutral-300"
                }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepIndicator({ current }: { current: string }) {
  const steps = [
    { key: "service", label: "Serviço" },
    { key: "barber", label: "Barbeiro" },
    { key: "datetime", label: "Data" },
    { key: "confirm", label: "Confirmar" },
  ];
  const stepKeys = ["service", "barber", "datetime", "confirm"];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => {
        const isCompleted = stepKeys.indexOf(s.key) < stepKeys.indexOf(current);
        const isActive = s.key === current;
        return (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
                    : isCompleted
                      ? "bg-primary-dark text-white"
                      : "bg-stone-200 text-stone-400"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[10px] md:text-xs font-medium transition-colors hidden md:block ${
                  isActive ? "text-primary" : isCompleted ? "text-stone-800" : "text-stone-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 md:w-16 h-0.5 mx-1 md:mx-2 rounded transition-colors duration-300 ${
                  isCompleted ? "bg-neutral-800" : "bg-neutral-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function AnimatedStep({ step, children }: { step: Step; children: React.ReactNode }) {
  return (
    <div
      key={step}
      className="animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      {children}
    </div>
  );
}

const TIME_PERIODS = [
  { label: "Manhã", start: "08:00", end: "12:00" },
  { label: "Tarde", start: "12:00", end: "18:00" },
  { label: "Noite", start: "18:00", end: "23:00" },
];

function groupSlotsByPeriod(slots: string[]) {
  return TIME_PERIODS.map((period) => ({
    ...period,
    slots: slots.filter((t) => t >= period.start && t < period.end),
  })).filter((p) => p.slots.length > 0);
}

export default function AgendamentoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToast } = useToastContext();

  const [step, setStep] = useState<Step>("service");
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [barbers, setBarbers] = useState<BarberOption[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<BarberOption | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setServices(d.data.filter((s: ServiceOption) => s.active));
      });
    fetch("/api/barbers?activeOnly=true")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setBarbers(d.data);
      });
  }, []);

  useEffect(() => {
    if (selectedBarber && selectedDate) {
      setLoadingSlots(true);
      setSelectedTime("");
      const params = new URLSearchParams({
        barberId: selectedBarber.barber?.id || "",
        date: selectedDate,
      });
      if (selectedService) {
        params.set("serviceId", selectedService.id);
      }
      fetch(`/api/appointments/available-slots?${params}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.ok) setSlots(d.data);
          else setSlots([]);
        })
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedBarber, selectedDate, selectedService]);

  async function handleConfirm() {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;

    if (!session) {
      router.push("/login?callbackUrl=/agendamento");
      return;
    }

    setSubmitting(true);
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
    setSubmitting(false);

    if (data.ok) {
      setStep("done");
      addToast("Agendamento confirmado!", "success");
    } else {
      addToast(data.error || "Erro ao agendar", "error");
    }
  }

  const groupedSlots = useMemo(() => groupSlotsByPeriod(slots), [slots]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 max-w-3xl mx-auto">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg md:text-xl text-foreground">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm shadow-primary/20">
              <Scissors className="h-4 w-4 text-white" />
            </div>
            Barber<span className="text-primary">App</span>
          </Link>
          {session ? (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
          ) : (
            <div className="flex gap-1.5">
              <Link href="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="sm">Cadastrar</Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 md:py-10">
        <StepIndicator current={step} />

        {step === "done" ? (
          <AnimatedStep step={step}>
            <Card className="text-center py-8 md:py-12 border-t-4 border-t-green-500">
              <CardContent>
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-200">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Agendamento Confirmado!</h2>
                <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
                  Seu horário foi reservado com sucesso.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 md:p-6 mb-8 text-left max-w-sm mx-auto space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Scissors className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-neutral-700">{selectedService?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-neutral-700">{selectedBarber?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarDays className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-neutral-700">
                      {selectedDate && format(parse(selectedDate, "yyyy-MM-dd", new Date()), "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-neutral-700">{selectedTime}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm border-t border-green-200 pt-2">
                    <span className="font-bold text-neutral-900">Valor:</span>
                    <span className="font-bold text-green-700">{formatCurrency(selectedService?.price || 0)}</span>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Link href="/dashboard">
                    <Button>Ir para Dashboard</Button>
                  </Link>
                  <Link href="/agendamento">
                    <Button variant="outline">Novo Agendamento</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </AnimatedStep>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {step === "service" && "Escolha o Serviço"}
                {step === "barber" && "Escolha o Barbeiro"}
                {step === "datetime" && "Escolha a Data e Horário"}
                {step === "confirm" && "Confirme o Agendamento"}
              </CardTitle>
              <p className="text-sm text-neutral-400">
                {step === "service" && "Selecione o serviço desejado"}
                {step === "barber" && "Selecione o profissional"}
                {step === "datetime" && "Escolha a melhor data e horário"}
                {step === "confirm" && "Revise os detalhes antes de confirmar"}
              </p>
            </CardHeader>
            <CardContent>
              {step === "service" && (
                <AnimatedStep step={step}>
                  <div className="grid gap-2.5">
                    {services.map((service) => {
                      const isSelected = selectedService?.id === service.id;
                      return (
                        <button
                          key={service.id}
                          onClick={() => { setSelectedService(service); setStep("barber"); }}
                          className={`group text-left w-full p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "border-red-500 bg-primary-light/50 shadow-md shadow-red-100"
                              : "border-neutral-200 bg-white hover:border-red-300 hover:shadow-md hover:bg-neutral-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-neutral-900">{service.name}</p>
                                <span className="text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded font-medium">
                                  {service.category}
                                </span>
                              </div>
                              {service.description && (
                                <p className="text-sm text-neutral-500 mt-0.5">{service.description}</p>
                              )}
                              <p className="text-xs text-neutral-400 mt-1">{service.duration} min</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-lg text-primary">{formatCurrency(service.price)}</p>
                              <ArrowRight className={`h-4 w-4 ml-auto transition-opacity ${isSelected ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-40"}`} />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </AnimatedStep>
              )}

              {step === "barber" && (
                <AnimatedStep step={step}>
                  <div className="grid gap-2.5">
                    {barbers.map((barber) => {
                      const isSelected = selectedBarber?.id === barber.id;
                      const initials = barber.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                      return (
                        <button
                          key={barber.id}
                          onClick={() => { setSelectedBarber(barber); setStep("datetime"); }}
                          className={`group text-left w-full p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "border-red-500 bg-primary-light/50 shadow-md shadow-red-100"
                              : "border-neutral-200 bg-white hover:border-red-300 hover:shadow-md hover:bg-neutral-50"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                              {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-neutral-900">{barber.name}</p>
                                {barber.barber?.specialties && (
                                  <span className="text-[10px] uppercase tracking-wider text-primary bg-primary-light px-1.5 py-0.5 rounded font-medium">
                                    {barber.barber.specialties}
                                  </span>
                                )}
                              </div>
                              {barber.barber?.bio && (
                                <p className="text-sm text-neutral-500 mt-0.5">{barber.barber.bio}</p>
                              )}
                            </div>
                            <ArrowRight className={`h-4 w-4 flex-shrink-0 transition-opacity ${isSelected ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-40 text-neutral-400"}`} />
                          </div>
                        </button>
                      );
                    })}
                    <Button variant="ghost" onClick={() => setStep("service")} className="mt-1">
                      <ChevronLeft className="h-4 w-4" />
                      Voltar
                    </Button>
                  </div>
                </AnimatedStep>
              )}

              {step === "datetime" && (
                <AnimatedStep step={step}>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Selecione a Data
                      </label>
                      <Calendar
                        selectedDate={selectedDate}
                        onSelect={(date) => { setSelectedDate(date); setSelectedTime(""); }}
                      />
                    </div>

                    {selectedDate && (
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          Selecione o Horário
                        </label>
                        {loadingSlots ? (
                          <div className="flex items-center justify-center py-8 text-neutral-400">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Carregando horários...
                          </div>
                        ) : groupedSlots.length === 0 ? (
                          <p className="text-sm text-neutral-400 text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
                            Nenhum horário disponível nesta data
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {groupedSlots.map((period) => (
                              <div key={period.label}>
                                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                  {period.label}
                                </p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {period.slots.map((time) => (
                                    <button
                                      key={time}
                                      onClick={() => setSelectedTime(time)}
                                      className={`p-2.5 text-center rounded-lg border-2 text-sm font-medium transition-all duration-150 cursor-pointer ${
                                        selectedTime === time
                                          ? "border-red-500 bg-primary text-white shadow-md shadow-red-200 scale-105"
                                          : "border-neutral-200 bg-white text-neutral-700 hover:border-red-300 hover:bg-primary-light hover:shadow-sm"
                                      }`}
                                    >
                                      {time}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="ghost" onClick={() => setStep("barber")}>
                        <ChevronLeft className="h-4 w-4" />
                        Voltar
                      </Button>
                      <Button
                        className="flex-1"
                        disabled={!selectedDate || !selectedTime}
                        onClick={() => setStep("confirm")}
                      >
                        Continuar
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AnimatedStep>
              )}

              {step === "confirm" && (
                <AnimatedStep step={step}>
                  <div className="space-y-5">
                    <div className="bg-primary-light/70 border border-red-200 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                            <Scissors className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Serviço</p>
                            <p className="font-semibold text-neutral-900">{selectedService?.name}</p>
                          </div>
                        </div>
                        <span className="font-bold text-primary">{formatCurrency(selectedService?.price || 0)}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Barbeiro</p>
                          <p className="font-semibold text-neutral-900">{selectedBarber?.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                          <CalendarDays className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Data</p>
                          <p className="font-semibold text-neutral-900">
                            {selectedDate && format(parse(selectedDate, "yyyy-MM-dd", new Date()), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Horário</p>
                          <p className="font-semibold text-neutral-900">{selectedTime}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 border-t border-red-200 pt-4">
                        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-neutral-500">Valor Total</p>
                        </div>
                        <span className="font-bold text-xl text-primary">{formatCurrency(selectedService?.price || 0)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setStep("datetime")}>
                        <ChevronLeft className="h-4 w-4" />
                        Voltar
                      </Button>
                      <Button className="flex-1" onClick={handleConfirm} disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Confirmando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Confirmar Agendamento
                          </>
                        )}
                      </Button>
                    </div>

                    {!session && (
                      <p className="text-sm text-neutral-500 text-center bg-amber-50 border border-amber-200 py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        Você precisará fazer login para confirmar.
                      </p>
                    )}
                  </div>
                </AnimatedStep>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
