import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const Route = createFileRoute("/associazioni")({
  component: Associazioni,
});

type Registration = {
  nome: string;
  email: string;
  ruolo: "ristoratore" | "associazione" | "volontario" | "cittadino";
};

type FoodBox = {
  id: string;
  restaurant_name: string;
  description: string;
  address: string;
  portions: number;
  pickup_from: string;
  pickup_to: string;
  status: "available" | "reserved" | "picked_up";
  suspended: boolean;
  food_tags: string[];
};

const REG_KEY = "salvapasti:registration";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function Associazioni() {
  const qc = useQueryClient();
  const [reg, setReg] = useState<Registration | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState<{ count: number; codes: string[] } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REG_KEY);
      if (raw) setReg(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const { data: boxes = [], isLoading } = useQuery({
    queryKey: ["available_boxes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_boxes")
        .select("*")
        .eq("status", "available")
        .order("pickup_from", { ascending: true });
      if (error) throw error;
      return data as FoodBox[];
    },
    refetchInterval: 20000,
  });

  const totalPortions = useMemo(
    () => Array.from(selected).reduce((sum, id) => {
      const b = boxes.find((x) => x.id === id);
      return sum + (b?.portions ?? 0);
    }, 0),
    [selected, boxes],
  );

  const canAccess = reg?.ruolo === "associazione" || reg?.ruolo === "volontario";

  const reserveMutation = useMutation({
    mutationFn: async () => {
      if (!reg || !canAccess) throw new Error("Solo associazioni e volontari.");
      const ids = Array.from(selected);
      const codes: string[] = [];

      for (const id of ids) {
        const { data, error } = await supabase.rpc("reserve_food_box", {
          p_box_id: id,
          p_name: reg.nome,
          p_email: reg.email,
          p_role: reg.ruolo,
        });
        if (error) throw new Error(error.message);
        const row = Array.isArray(data) ? data[0] : data;
        if (row?.pickup_code) codes.push(row.pickup_code);
      }
      return { count: ids.length, codes };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["available_boxes"] });
      qc.invalidateQueries({ queryKey: ["food_boxes"] });
      setSelected(new Set());
      setConfirmed(result);
    },
  });

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Torna alla home
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Dashboard <em className="font-serif italic text-terracotta">associazioni</em>
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Tutte le box disponibili nella tua zona in un colpo solo. Seleziona quelle
              che riesci a ritirare stasera e prenotale insieme.
            </p>
          </div>
          <Link
            to="/mie-prenotazioni"
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Le mie prenotazioni →
          </Link>
        </div>

        {!reg ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              Questa dashboard è dedicata ad associazioni e volontari.
            </p>
            <Link
              to="/registrati"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Registrati
            </Link>
          </div>
        ) : !canAccess ? (
          <div className="mt-12 rounded-2xl border border-border bg-muted/40 p-8 text-center">
            <p className="text-foreground">
              Sei registrato come <strong>{reg.ruolo}</strong>. La dashboard di prenotazione
              multipla è riservata ad associazioni e volontari.
            </p>
          </div>
        ) : (
          <>
            {/* Sticky action bar */}
            {selected.size > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-20 z-20 mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur"
              >
                <div>
                  <span className="font-semibold text-foreground">
                    {selected.size} box selezionate
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    · {totalPortions} porzioni totali
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelected(new Set())}
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    Deseleziona
                  </button>
                  <button
                    onClick={() => reserveMutation.mutate()}
                    disabled={reserveMutation.isPending}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {reserveMutation.isPending
                      ? "Prenotazione…"
                      : `Prenota ${selected.size} box`}
                  </button>
                </div>
              </motion.div>
            )}

            {reserveMutation.isError && (
              <p className="mt-4 text-sm text-destructive">
                {(reserveMutation.error as Error).message}
              </p>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading && (
                <p className="text-muted-foreground">Caricamento…</p>
              )}
              {!isLoading && boxes.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                  Nessuna box disponibile al momento.
                </div>
              )}
              {boxes.map((b, i) => {
                const isSel = selected.has(b.id);
                return (
                  <motion.button
                    key={b.id}
                    onClick={() => toggle(b.id)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`text-left rounded-2xl border p-5 transition-all ${
                      isSel
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border bg-card hover:border-foreground/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground">{b.restaurant_name}</h3>
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          isSel
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background"
                        }`}
                      >
                        {isSel && "✓"}
                      </div>
                    </div>
                    {b.suspended && (
                      <span className="mt-2 inline-block rounded-full bg-terracotta/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-terracotta">
                        Box sospesa
                      </span>
                    )}
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {b.description}
                    </p>
                    <dl className="mt-4 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Indirizzo</dt>
                        <dd className="text-foreground">{b.address}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Porzioni</dt>
                        <dd className="font-medium text-foreground">{b.portions}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Ritiro</dt>
                        <dd className="text-foreground">
                          {formatTime(b.pickup_from)}–{formatTime(b.pickup_to)}
                        </dd>
                      </div>
                    </dl>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Confirmation */}
      {confirmed && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setConfirmed(null)}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-2xl"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-2xl">
              ✓
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-foreground">
              {confirmed.count} box prenotate
            </h3>
            <p className="mt-2 text-muted-foreground">
              I codici di ritiro sono stati generati. Mostrali ai locali al momento del
              ritiro.
            </p>
            <div className="mt-4 space-y-1 rounded-lg bg-muted/50 p-4 font-mono text-xs">
              {confirmed.codes.map((c) => (
                <div key={c}>{c}</div>
              ))}
            </div>
            <Link
              to="/mie-prenotazioni"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Vedi le mie prenotazioni
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
