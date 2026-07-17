"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Store,
  Scissors,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Plus,
  BarChart3,
  PieChart,
  User,
  Award,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { APPOINTMENT_COLORS, APPOINTMENT_LABELS } from "@/constants";
import { useCurrentUser } from "@/hooks/use-current-user";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

type Period = "today" | "week" | "month";

interface DashboardMetrics {
  todayAppointments: number;
  todayConfirmed: number;
  totalClients: number;
  totalBarbers: number;
  totalServices: number;
  revenue: number;
  revenueAll: number;
  period: Period;
  completionRate: number;
  nextAppointments: Array<{
    id: string;
    date: string;
    time: string;
    status: string;
    user: { id: string; name: string; phone: string };
    barber: { user: { name: string } };
    service: { name: string; price: number };
  }>;
  dayData: Array<{ date: string; label: string; count: number }>;
  statusDistribution: Record<string, number>;
  topServices: Array<{ name: string; count: number }>;
  barberStats: Array<{ name: string; count: number }>;
  noShowCount: number;
  cancellationCount: number;
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mês" },
];

const STATUS_PIE_COLORS: Record<string, string> = {
  AGENDADO: "#3B82F6",
  CONFIRMADO: "#22C55E",
  FINALIZADO: "#737373",
  CANCELADO: "#EF4444",
  NAO_COMPARECEU: "#F97316",
  EM_ANDAMENTO: "#EAB308",
};

const CHART_COLORS = ["#DC2626", "#F97316", "#EAB308", "#22C55E", "#3B82F6", "#8B5CF6"];

export default function DashboardPage() {
  const user = useCurrentUser();
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("today");

  const isClient = user?.role === "CLIENT";

  const loadData = useCallback((p: Period) => {
    setLoading(true);
    fetch(`/api/dashboard?period=${p}`)
      .then((r) => r.json())
      .then((d) => { if (d.ok) setData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData(period);
  }, [period, loadData]);

  if (isClient) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-neutral-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Bem-vindo, {user?.name}!</h2>
        <p className="text-neutral-600 mb-6">Acompanhe seus agendamentos ou agende um novo horário.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard/agenda"><Button>Meus Agendamentos</Button></Link>
          <Link href="/agendamento"><Button variant="outline">Novo Agendamento</Button></Link>
        </div>
      </div>
    );
  }

  const totalAppointments = Object.values(data?.statusDistribution || {}).reduce((a, b) => a + b, 0);

  const kpis = [
    {
      label: "Agendamentos",
      value: data?.todayAppointments ?? 0,
      sub: `${data?.todayConfirmed ?? 0} confirmados`,
      icon: Calendar,
    },
    {
      label: "Faturamento",
      value: formatCurrency(data?.revenue ?? 0),
      sub: data?.period === "today" ? "hoje" : `este ${data?.period === "week" ? "mês" : "período"}`,
      icon: DollarSign,
    },
    {
      label: "Clientes",
      value: data?.totalClients ?? 0,
      sub: "cadastrados",
      icon: Users,
    },
    {
      label: "Taxa de Sucesso",
      value: `${data?.completionRate ?? 0}%`,
      sub: `${data?.noShowCount ?? 0} ausências`,
      icon: TrendingUp,
    },
    {
      label: "Cancelamentos",
      value: data?.cancellationCount ?? 0,
      sub: "total histórico",
      icon: XCircle,
    },
  ];

  const statusPieData = Object.entries(data?.statusDistribution || {}).map(([key, count]) => ({
    name: APPOINTMENT_LABELS[key] || key,
    value: count,
    color: STATUS_PIE_COLORS[key] || "#A3A3A3",
  }));

  const maxDayCount = Math.max(...(data?.dayData.map((d) => d.count) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Dashboard</h2>
          <p className="text-sm text-neutral-500">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-neutral-100 rounded-lg p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                  period === p.key
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Link href="/agendamento">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          </Link>
          <Link href="/dashboard/agenda">
            <Button variant="outline" size="sm">Ver Agenda</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-neutral-200 rounded-xl" />
          ))}
        </div>
      ) : !data ? (
        <p className="text-neutral-500">Erro ao carregar dados.</p>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {kpis.map((kpi) => (
              <Card key={kpi.label} className="border-t-4 border-t-red-600 hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                      <kpi.icon className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{kpi.value}</p>
                  <p className="text-xs text-neutral-500 mt-1">{kpi.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Bar Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-red-600" />
                  Agendamentos por Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.dayData.length === 0 ? (
                  <p className="text-neutral-400 text-sm text-center py-8">Sem dados no período</p>
                ) : (
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.dayData} barCategoryGap="20%">
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#A3A3A3" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#A3A3A3" }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #E5E5E5",
                            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                            fontSize: "13px",
                          }}
                          labelFormatter={(label) => `Dia: ${label}`}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                          {data.dayData.map((_, i) => (
                            <Cell key={i} fill={i === data.dayData.length - 1 ? "#DC2626" : "#FCA5A5"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Distribution Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <PieChart className="h-4 w-4 text-red-600" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statusPieData.length === 0 ? (
                  <p className="text-neutral-400 text-sm text-center py-8">Nenhum agendamento</p>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <RPieChart>
                          <Pie
                            data={statusPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            dataKey="value"
                          >
                            {statusPieData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: "8px",
                              border: "1px solid #E5E5E5",
                              fontSize: "13px",
                            }}
                          />
                        </RPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 w-full">
                      {statusPieData.map((s) => (
                        <div key={s.name} className="flex items-center gap-2 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-neutral-600">{s.name}</span>
                          <span className="font-semibold text-neutral-800 ml-auto">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-4 w-4 text-red-600" />
                  Serviços Mais Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.topServices.length === 0 ? (
                  <p className="text-neutral-400 text-sm text-center py-4">Nenhum dado no período</p>
                ) : (
                  <div className="space-y-3">
                    {data.topServices.map((svc, i) => (
                      <div key={svc.name} className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          i === 0 ? "bg-red-600" : i === 1 ? "bg-orange-500" : i === 2 ? "bg-amber-500" : "bg-neutral-400"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">{svc.name}</p>
                          <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-1">
                            <div
                              className="h-full bg-red-500 rounded-full"
                              style={{
                                width: `${(svc.count / Math.max(...data.topServices.map((s) => s.count), 1)) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-neutral-700">{svc.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Barber Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-red-600" />
                  Atendimentos por Barbeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.barberStats.length === 0 ? (
                  <p className="text-neutral-400 text-sm text-center py-4">Nenhum dado no período</p>
                ) : (
                  <div className="space-y-3">
                    {data.barberStats.map((b, i) => (
                      <div key={b.name} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {b.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">{b.name}</p>
                          <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-1">
                            <div
                              className="h-full bg-red-500 rounded-full"
                              style={{
                                width: `${(b.count / Math.max(...data.barberStats.map((s) => s.count), 1)) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-neutral-700">{b.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-red-600" />
                  Próximos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.nextAppointments.length === 0 ? (
                  <p className="text-neutral-400 text-sm text-center py-6">Nenhum agendamento futuro</p>
                ) : (
                  <div className="space-y-2.5">
                    {data.nextAppointments.map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 hover:bg-red-50 transition-colors border border-neutral-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600 flex-shrink-0">
                            {apt.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-neutral-900 truncate">{apt.user.name}</p>
                            <p className="text-[10px] text-neutral-500 truncate">{apt.service.name}</p>
                            <p className="text-[10px] text-neutral-400">{formatDate(apt.date)} às {apt.time}</p>
                          </div>
                        </div>
                        <Badge className={`${APPOINTMENT_COLORS[apt.status]} text-[10px]`}>
                          {APPOINTMENT_LABELS[apt.status]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/dashboard/agenda">
                  <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
                    Ver todos na Agenda
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Section */}
          {data.dayData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4 text-red-600" />
                  Faturamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-xs text-neutral-500">Período atual</p>
                    <p className="text-3xl font-bold text-neutral-900">{formatCurrency(data.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Histórico total</p>
                    <p className="text-xl font-semibold text-neutral-600">{formatCurrency(data.revenueAll)}</p>
                  </div>
                  <div className="text-xs text-neutral-400 ml-auto">
                    * Apenas agendamentos não cancelados
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/agenda"><Button variant="outline" size="sm">📅 Agenda</Button></Link>
            <Link href="/dashboard/barbeiros"><Button variant="outline" size="sm">✂️ Barbeiros</Button></Link>
            <Link href="/dashboard/servicos"><Button variant="outline" size="sm">💈 Serviços</Button></Link>
            <Link href="/dashboard/clientes"><Button variant="outline" size="sm">👥 Clientes</Button></Link>
            <Link href="/dashboard/relatorios"><Button variant="outline" size="sm">📊 Relatórios</Button></Link>
          </div>
        </>
      )}
    </div>
  );
}
