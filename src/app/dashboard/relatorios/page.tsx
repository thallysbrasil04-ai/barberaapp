"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function RelatoriosPage() {
  const [data, setData] = useState<{
    todayAppointments: number;
    totalClients: number;
    totalBarbers: number;
    totalServices: number;
    revenue: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        if (d.ok) setData(d.data);
      });
  }, []);

  if (!data) return <div className="animate-pulse text-neutral-400">Carregando...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Relatórios da Barbearia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="text-sm text-neutral-500">Agendamentos (hoje)</p>
              <p className="text-3xl font-bold">{data.todayAppointments}</p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="text-sm text-neutral-500">Clientes</p>
              <p className="text-3xl font-bold">{data.totalClients}</p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="text-sm text-neutral-500">Barbeiros</p>
              <p className="text-3xl font-bold">{data.totalBarbers}</p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="text-sm text-neutral-500">Serviços</p>
              <p className="text-3xl font-bold">{data.totalServices}</p>
            </div>
          </div>

          <div className="bg-neutral-900 text-white p-6 rounded-lg">
            <p className="text-sm text-neutral-300">Faturamento Total (histórico)</p>
            <p className="text-4xl font-bold">{formatCurrency(data.revenue)}</p>
          </div>

          <p className="text-xs text-neutral-400 mt-4">
            * Dados de faturamento consideram apenas agendamentos com status diferente de cancelado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
