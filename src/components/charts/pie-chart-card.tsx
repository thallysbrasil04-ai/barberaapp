"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface Props {
  title: string;
  icon?: React.ReactNode;
  data: PieData[];
  emptyMessage?: string;
}

export function PieChartCard({ title, icon, data, emptyMessage }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-neutral-400 text-sm text-center py-8">{emptyMessage || "Nenhum dado"}</p>
        ) : (
          <div className="flex flex-col items-center">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "13px", border: "1px solid #E5E5E5" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 w-full">
              {data.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-neutral-600 truncate">{s.name}</span>
                  <span className="font-semibold text-neutral-800 ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
