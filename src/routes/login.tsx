import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, isValidEmail } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Droplets } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");

  if (loading) return null;
  if (user) return <Navigate to="/" />;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setErr("Informe um email válido.");
      return;
    }
    const u = login(email);
    toast.success(`Bem-vindo${u.role === "admin" ? " (Admin)" : ""}!`);
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Droplets className="size-6" />
          </div>
          <h1 className="text-xl font-bold">AquaLoss</h1>
          <p className="text-sm text-muted-foreground">Acesse com seu email corporativo</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu.nome@empresa.com.br"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErr(""); }}
              autoFocus
            />
            {err && <p className="text-xs text-destructive">{err}</p>}
          </div>
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
      </Card>
    </div>
  );
}
