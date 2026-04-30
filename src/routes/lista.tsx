import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useLeaks } from "@/hooks/useLeaks";
import { LEAK_STATUS_LABEL, LEAK_TYPE_LABEL, type LeakStatus, type LeakType } from "@/types/leak";
import { StatusBadge, TypeBadge } from "@/components/leaks/Badges";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownAZ, Gauge, Loader2, MapPin } from "lucide-react";

export const Route = createFileRoute("/lista")({
  component: ListPage,
});

function ListPage() {
  const { data: leaks = [], isLoading } = useLeaks();
  const navigate = useNavigate();
  const [type, setType] = useState<LeakType | "all">("all");
  const [status, setStatus] = useState<LeakStatus | "all">("all");
  const [order, setOrder] = useState<"newest" | "oldest">("newest");

  const filtered = useMemo(() => {
    let r = leaks.filter(
      (l) => (type === "all" || l.type === type) && (status === "all" || l.status === status),
    );
    r = [...r].sort((a, b) =>
      order === "newest" ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt),
    );
    return r;
  }, [leaks, type, status, order]);

  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4 p-4">
          <div>
            <h2 className="text-2xl font-bold">Vazamentos</h2>
            <p className="text-sm text-muted-foreground">{filtered.length} ocorrência(s)</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Select value={type} onValueChange={(v) => setType(v as LeakType | "all")}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {(Object.keys(LEAK_TYPE_LABEL) as LeakType[]).map((t) => (
                  <SelectItem key={t} value={t}>{LEAK_TYPE_LABEL[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as LeakStatus | "all")}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                {(Object.keys(LEAK_STATUS_LABEL) as LeakStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{LEAK_STATUS_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={order} onValueChange={(v) => setOrder(v as "newest" | "oldest")}>
              <SelectTrigger className="h-11">
                <ArrowDownAZ className="mr-1 size-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border bg-card py-16 text-center text-sm text-muted-foreground">
              Nenhum vazamento encontrado.
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((leak) => (
                <li key={leak.id}>
                  <button
                    onClick={() => navigate({ to: "/", search: { focus: leak.id } as never })}
                    className="group w-full rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <TypeBadge type={leak.type} />
                      <StatusBadge status={leak.status} />
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(leak.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                    {leak.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-foreground">{leak.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Gauge className="size-3.5" /> {leak.pressure} mca</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {leak.latitude.toFixed(4)}, {leak.longitude.toFixed(4)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
