"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPhone } from "@/lib/utils";
import { useToastContext } from "@/providers/toast-provider";
import { ROLES } from "@/constants";
import { Search, Plus, Loader2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export default function ClientesPage() {
  const { addToast } = useToastContext();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setUsers(data.data.users);
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current }),
    });
    const data = await res.json();
    if (data.ok) {
      setUsers(users.map((u) => (u.id === id ? { ...u, active: !current } : u)));
      addToast("Status atualizado!", "success");
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">Nenhum cliente encontrado</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-neutral-500">
                      {user.email} | {formatPhone(user.phone)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.active ? "success" : "danger"}>
                      {user.active ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(user.id, user.active)}
                    >
                      {user.active ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
