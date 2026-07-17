"use client";

import { useEffect, useState } from "react";
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
  BarChart3,
  ArrowRight,
  Plus,
} from "lucide-react";
import { formatCurrency, formatDate, formatPhone } from "@/lib/utils";
import { APPOINTMENT_COLORS, APPOINTMENT_LABELS } from "@/constants";
import { useCurrentUser } from "@/hooks/use-current-user";
import Link from "next/link";

interface DashboardMetrics {
  todayAppointments: number;
  totalClients: number;
  totalBarbers: number;
  totalServices: number;
  revenue: number;
  todayConfirmed: number;
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
  weekData: Array<{ date: string; count: number }>;
  statusDistribution: Record<string, number>;
  noShowCount: number;
  cancellationCount: number;
}

const weekLabels = ["Há 4 dias", "Há 3 dias", "Há 2 dias", "Ontem", "Hoje"];

export default function DashboardPage() {
  const user = useCurrentUser();
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const isClient = user?.role === "CLIENT";

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 bg-neutral-200 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) return <p className="text-neutral-500">Erro ao carregar dados.</p>;

  const maxWeek = Math.max(...data.weekData.map((w) => w.count), 1);
  const totalAppointments = Object.values(data.statusDistribution).reduce((a, b) => a + b, 0);

  const kpis = [
    {
      label: "Agendamentos Hoje",
      value: data.todayAppointments,
      sub: `${data.todayConfirmed} confirmados`,
      icon: Calendar,
      trend: "+12%",
      up: true,
    },
    {
      label: "Faturamento Total",
      value: formatCurrency(data.revenue),
      sub: "histórico completo",
      icon: DollarSign,
      trend: "+8%",
      up: true,
    },
    {
      label: "Clientes",
      value: data.totalClients,
      sub: "cadastrados",
      icon: Users,
      trend: "+5%",
      up: true,
    },
    {
      label: "Taxa de Sucesso",
      value: `${data.completionRate}%`,
      sub: `${data.noShowCount} ausências`,
      icon: TrendingUp,
      trend: data.completionRate >= 70 ? "Bom" : "Atenção",
      up: data.completionRate >= 70,
    },
    {
      label: "Cancelamentos",
      value: data.cancellationCount,
      sub: "total",
      icon: XCircle,
      trend: data.cancellationCount > 0 ? "-3%" : "0",
      up: data.cancellationCount <= 0,
    },
  ];

  const statusColors: Record<string, string> = {
    AGENDADO: "bg-blue-500",
    CONFIRMADO: "bg-green-500",
    FINALIZADO: "bg-neutral-500",
    CANCELADO: "bg-red-500",
    NAO_COMPARECEU: "bg-orange-500",
    EM_ANDAMENTO: "bg-yellow-500",
  };

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
        <div className="flex gap-2">
          <Link href="/agendamento">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          </Link>
          <Link href="/dashboard/agenda">
            <Button variant="outline" size="sm">
              Ver Agenda
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-t-4 border-t-red-600 hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <kpi.icon className="h-5 w-5 text-red-600" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  kpi.up ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {kpi.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{kpi.value}</p>
              <p className="text-xs text-neutral-500 mt-1">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-red-600" />
              Agendamentos (Últimos 5 Dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {data.weekData.map((day, i) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-xs font-bold text-neutral-700">{day.count}</span>
                  <div
                    className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-md transition-all hover:from-red-700"
                    style={{ height: `${(day.count / maxWeek) * 100}%`, minHeight: day.count > 0 ? "8px" : "0" }}
                  />
                  <span className="text-[10px] text-neutral-400">{weekLabels[i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-red-600" />
              Status dos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.statusDistribution).map(([status, count]) => {
                const pct = totalAppointments > 0 ? Math.round((count / totalAppointments) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-neutral-600">{APPOINTMENT_LABELS[status] || status}</span>
                      <span className="font-semibold text-neutral-900">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${statusColors[status] || "bg-neutral-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {totalAppointments === 0 && (
                <p className="text-sm text-neutral-400 text-center py-4">Nenhum agendamento</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-red-600" />
              Próximos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.nextAppointments.length === 0 ? (
              <p className="text-neutral-400 text-sm text-center py-6">Nenhum agendamento futuro</p>
            ) : (
              <div className="space-y-3">
                {data.nextAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-red-50 transition-colors border border-neutral-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-bold text-neutral-600 flex-shrink-0">
                        {apt.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-neutral-900 truncate">{apt.user.name}</p>
                        <p className="text-xs text-neutral-500 truncate">
                          {apt.service.name} — {apt.barber.user.name}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {formatDate(apt.date)} às {apt.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={APPOINTMENT_COLORS[apt.status]}>
                        {APPOINTMENT_LABELS[apt.status]}
                      </Badge>
                      <Link href="/dashboard/agenda">
                        <ArrowRight className="h-4 w-4 text-neutral-400 hover:text-red-600 transition-colors" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/agenda">
              <Button variant="outline" className="w-full justify-start">📅 Gerenciar Agenda</Button>
            </Link>
            <Link href="/dashboard/barbeiros">
              <Button variant="outline" className="w-full justify-start">✂️ Gerenciar Barbeiros</Button>
            </Link>
            <Link href="/dashboard/servicos">
              <Button variant="outline" className="w-full justify-start">💈 Gerenciar Serviços</Button>
            </Link>
            <Link href="/dashboard/clientes">
              <Button variant="outline" className="w-full justify-start">👥 Ver Clientes</Button>
            </Link>
            <Link href="/dashboard/relatorios">
              <Button variant="outline" className="w-full justify-start">📊 Ver Relatórios</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
