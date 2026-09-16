import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, PackageCheck, AlertTriangle } from "lucide-react";

type Search = { id?: string; code?: string };

export const Route = createFileRoute("/ritiro")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    id: typeof search.id === "string" ? search.id : undefined,
    code: typeof search.code === "string" ? search.code : undefined,
  }),
  component: RitiroPage,
  head: () => ({
    meta: [
      { title: "Conferma ritiro box | Salva Pasti" },
      {
        name: "description",
        content:
          "Il locale scansiona il codice QR della prenotazione Salva Pasti e conferma la consegna della box in un tap.",
      },
      { property: "og:title", content: "Conferma ritiro box | Salva Pasti" },
      {
        property: "og:description",
        content: "Scansiona il QR della prenotazione e conferma la consegna della box.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type PickupRow = {
  id: string;
  status: string;
  reserver_name: string;
  reserver_role: string;
  created_at: string;
  restaurant_name: string;
  description: string;
  address: string;
  portions: number;
  pickup_from: string;
  pickup_to: string;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const LABEL: Record<string, string> = {
  confirmed: "Da consegnare",
  picked_up: "Consegnata",
  cancelled: "Annullata",
  no_show: "Mancato ritiro",
};

function RitiroPage() {
  const { id, code } = Route.useSearch();
  const [manualId, setManualId] = useState(id ?? "");
  const [manualCode, setManualCode] = useState(code ?? "");
  const qc = useQueryClient();

  const activeId = id ?? manualId;
  const activeCode = code ?? manualCode;
  const enabled = Boolean(activeId && activeCode);

  const { data, isLoading, error } = useQuery({
    queryKey: ["pickup", activeId, activeCode],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_reservation_for_pickup", {
        p_reservation_id: activeId,
        p_pickup_code: activeCode,
      });
      if (error) throw error;
      return ((data as PickupRow[] | null) ?? [])[0] ?? null;
    },
  });

  const confirm = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("update_reservation_status", {
        p_reservation_id: activeId,
        p_pickup_code: activeCode,
        p_next_status: "picked_up",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pickup"] }),
  });

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-24">
      <h1 className="text-3xl font-bold text-foreground">Conferma consegna</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Scansiona il codice QR della prenotazione oppure inserisci i dati a mano per confermare
        la consegna della box.
      </p>

      {!enabled && (
        <div className="mt-8 space-y-3 rounded-2xl border border-border bg-card p-5">
          <label className="block text-sm font-medium text-foreground">
            Identificativo prenotazione
            <input
              value={manualId}
              onChange={(e) => setManualId(e.target.value.trim())}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="es. 3f0c…"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Codice ritiro
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.trim().toUpperCase())}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
              placeholder="ABC123"
            />
          </label>
        </div>
      )}

      {enabled && isLoading && (
        <p className="mt-8 text-sm text-muted-foreground">Verifica del codice in corso…</p>
      )}

      {enabled && !isLoading && (error || !data) && (
        <div className="mt-8 flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-foreground">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p>
            Prenotazione non trovata o codice errato. Chiedi di mostrare di nuovo il codice QR
            dalla pagina “Le mie prenotazioni”.
          </p>
        </div>
      )}

      {data && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
            {LABEL[data.status] ?? data.status}
          </span>
          <h2 className="mt-4 text-xl font-semibold text-foreground">{data.restaurant_name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{data.description}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Ritira</dt>
              <dd className="text-foreground">
                {data.reserver_name} ({data.reserver_role})
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Porzioni</dt>
              <dd className="text-foreground">{data.portions}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase text-muted-foreground">Finestra ritiro</dt>
              <dd className="text-foreground">
                {fmt(data.pickup_from)} → {fmt(data.pickup_to)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase text-muted-foreground">Indirizzo</dt>
              <dd className="text-foreground">{data.address}</dd>
            </div>
          </dl>

          {data.status === "confirmed" ? (
            <>
              <button
                onClick={() => confirm.mutate()}
                disabled={confirm.isPending}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <PackageCheck className="h-4 w-4" />
                {confirm.isPending ? "Conferma in corso…" : "Confermo la consegna"}
              </button>
              {confirm.isError && (
                <p className="mt-3 text-sm text-destructive">
                  {(confirm.error as Error).message}
                </p>
              )}
            </>
          ) : (
            <p className="mt-6 flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Nessuna azione necessaria: questa prenotazione è già “{LABEL[data.status]}”.
            </p>
          )}
        </div>
      )}

      <Link to="/mie-prenotazioni" className="mt-8 inline-block text-sm text-primary underline">
        Vai a “Le mie prenotazioni”
      </Link>
    </main>
  );
}
