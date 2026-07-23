"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  title: string;
  icon?: React.ReactNode;
  data: Array<{ label: string; count: number }>;
  dataKey?: string;
  color?: string;
  lastHighlight?: boolean;
  emptyMessage?: string;
}

export function BarChartCard({ title, icon, data, dataKey = "count", color = "#DC2626", lastHighlight, emptyMessage }: Props) {
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
          <p className="text-neutral-400 text-sm text-center py-8">{emptyMessage || "Sem dados no período"}</p>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barCategoryGap="20%">
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#A3A3A3" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#A3A3A3" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #E5E5E5", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", fontSize: "13px" }}
                />
                <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {lastHighlight ? data.map((_, i) => (
                    <Cell key={i} fill={i === data.length - 1 ? color : "#FCA5A5"} />
                  )) : <Cell fill={color} />}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
