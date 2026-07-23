"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateBarberForm({
  form, onChange, onSave, saving,
}: {
  form: { name: string; email: string; phone: string; password: string; bio: string; specialties: string };
  onChange: (field: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Nome</Label>
          <Input value={form.name} onChange={(e) => onChange("name", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Telefone</Label>
          <Input value={form.phone} onChange={(e) => onChange("phone", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>E-mail</Label>
        <Input type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Senha</Label>
        <Input type="password" value={form.password} onChange={(e) => onChange("password", e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Bio</Label>
        <Input value={form.bio} onChange={(e) => onChange("bio", e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Especialidades</Label>
        <Input value={form.specialties} onChange={(e) => onChange("specialties", e.target.value)} />
      </div>
      <Button className="w-full" onClick={onSave} disabled={saving}>
        Cadastrar Barbeiro
      </Button>
    </div>
  );
}
