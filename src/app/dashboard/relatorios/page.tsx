"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useToastContext } from "@/providers/toast-provider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { APPOINTMENT_LABELS } from "@/constants";
import { Download } from "lucide-react";

type Period = "week" | "month" | "all";

const STATUS_PIE_COLORS: Record<string, string> = {
  AGENDADO: "#3B82F6",
  CONFIRMADO: "#22C55E",
  FINALIZADO: "#737373",
  CANCELADO: "#EF4444",
  NAO_COMPARECEU: "#F97316",
  EM_ANDAMENTO: "#EAB308",
};

export default function RelatoriosPage() {
  const { addToast } = useToastContext();
  const [data, setData] = useState<{
    todayAppointments: number;
    todayConfirmed: number;
    totalClients: number;
    totalBarbers: number;
    totalServices: number;
    revenue: number;
    revenueAll: number;
    completionRate: number;
    dayData: Array<{ date: string; label: string; count: number }>;
    statusDistribution: Record<string, number>;
    topServices: Array<{ name: string; count: number }>;
    barberStats: Array<{ name: string; count: number }>;
    noShowCount: number;
    cancellationCount: number;
  } | null>(null);

  const [period, setPeriod] = useState<Period>("week");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback((p: Period) => {
    setLoading(true);
    fetch(`/api/dashboard?period=${p}`)
      .then((r) => r.json())
      .then((d) => { if (d.ok) setData(d.data); })
      .catch(() => addToast("Erro ao carregar relatórios", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(period); }, [period, loadData]);

  function exportCSV() {
    if (!data) return;
    const headers = "Métrica,Valor\n";
    const rows = [
      `Agendamentos Hoje,${data.todayAppointments}`,
      `Confirmados Hoje,${data.todayConfirmed}`,
      `Total Clientes,${data.totalClients}`,
      `Total Barbeiros,${data.totalBarbers}`,
      `Total Serviços,${data.totalServices}`,
      `Faturamento Período,${data.revenue}`,
      `Faturamento Total,${data.revenueAll}`,
      `Taxa Sucesso,${data.completionRate}%`,
      `Ausências,${data.noShowCount}`,
      `Cancelamentos,${data.cancellationCount}`,
    ].join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-barbearia-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalAppointments = Object.values(data?.statusDistribution || {}).reduce((a, b) => a + b, 0);
  const statusPieData = Object.entries(data?.statusDistribution || {}).map(([key, count]) => ({
    name: APPOINTMENT_LABELS[key] || key,
    value: count,
    color: STATUS_PIE_COLORS[key] || "#A3A3A3",
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Relatórios</h2>
          <p className="text-sm text-neutral-500">Métricas detalhadas da barbearia</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-neutral-100 rounded-lg p-0.5">
            {[
              { key: "week" as const, label: "Semana" },
              { key: "month" as const, label: "Mês" },
              { key: "all" as const, label: "Total" },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                  period === p.key ? "bg-white text-primary shadow-sm" : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse text-neutral-400">Carregando...</div>
      ) : !data ? (
        <p className="text-neutral-500">Erro ao carregar dados.</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <p className="text-xs text-neutral-500">Agendamentos Hoje</p>
              <p className="text-2xl font-bold">{data.todayAppointments}</p>
              <p className="text-[10px] text-green-600">{data.todayConfirmed} confirmados</p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <p className="text-xs text-neutral-500">Clientes</p>
              <p className="text-2xl font-bold">{data.totalClients}</p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <p className="text-xs text-neutral-500">Barbeiros</p>
              <p className="text-2xl font-bold">{data.totalBarbers}</p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <p className="text-xs text-neutral-500">Serviços</p>
              <p className="text-2xl font-bold">{data.totalServices}</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Agendamentos por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                {data.dayData.length === 0 ? (
                  <p className="text-neutral-400 text-sm text-center py-8">Sem dados</p>
                ) : (
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.dayData}>
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#A3A3A3" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#A3A3A3" }} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "13px", border: "1px solid #E5E5E5" }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#DC2626" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuição de Status</CardTitle>
              </CardHeader>
              <CardContent>
                {statusPieData.length === 0 ? (
                  <p className="text-neutral-400 text-sm text-center py-8">Nenhum dado</p>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                            {statusPieData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 w-full">
                      {statusPieData.map((s) => (
                        <div key={s.name} className="flex items-center gap-2 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                          <span>{s.name}</span>
                          <span className="font-semibold ml-auto">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Revenue + Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Faturamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-neutral-900 text-white p-5 rounded-xl">
                  <p className="text-xs text-neutral-300">Faturamento do Período</p>
                  <p className="text-3xl font-bold">{formatCurrency(data.revenue)}</p>
                </div>
                <div className="bg-red-50 p-5 rounded-xl border border-red-200">
                  <p className="text-xs text-red-500">Faturamento Histórico Total</p>
                  <p className="text-3xl font-bold text-red-700">{formatCurrency(data.revenueAll)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Indicadores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Taxa de Sucesso</span>
                  <span className="font-bold text-lg">{data.completionRate}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Ausências (Não Compareceu)</span>
                  <span className="font-bold text-lg text-orange-600">{data.noShowCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Cancelamentos</span>
                  <span className="font-bold text-lg text-primary-dark">{data.cancellationCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Total Agendamentos</span>
                  <span className="font-bold text-lg">{totalAppointments}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Services & Barbers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.topServices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Serviços Mais Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.topServices.map((svc, i) => (
                      <div key={svc.name} className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          i === 0 ? "bg-primary" : i === 1 ? "bg-orange-500" : i === 2 ? "bg-amber-500" : "bg-neutral-400"
                        }`}>{i + 1}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{svc.name}</p>
                          <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-1">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${(svc.count / data.topServices[0].count) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-bold">{svc.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {data.barberStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Atendimentos por Barbeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.barberStats.map((b, i) => (
                      <div key={b.name} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold">
                          {b.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{b.name}</p>
                          <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-1">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${(b.count / data.barberStats[0].count) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-bold">{b.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
