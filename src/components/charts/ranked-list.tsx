"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Item {
  name: string;
  count: number;
}

interface Props {
  title: string;
  icon?: React.ReactNode;
  items: Item[];
  emptyMessage?: string;
  avatar?: (name: string) => React.ReactNode;
}

export function RankedListCard({ title, icon, items, emptyMessage, avatar }: Props) {
  const maxCount = Math.max(...items.map((s) => s.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-neutral-400 text-sm text-center py-4">{emptyMessage || "Nenhum dado"}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                {avatar ? avatar(item.name) : (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                    i === 0 ? "bg-red-600" : i === 1 ? "bg-orange-500" : i === 2 ? "bg-amber-500" : "bg-neutral-400"
                  }`}>
                    {i + 1}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-1">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${(item.count / maxCount) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-neutral-700 flex-shrink-0">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
