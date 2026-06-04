import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { downloadLiberatoria } from "@/lib/liberatoria-pdf";

export const Route = createFileRoute("/mie-prenotazioni")({
  component: MieePrenotazioni,
});

type Registration = {
  nome: string;
  email: string;
  ruolo: "ristoratore" | "associazione" | "volontario" | "cittadino";
};

type ReservationRow = {
  id: string;
  food_box_id: string;
  reserver_name: string;
  reserver_email: string;
  reserver_role: string;
  status: "confirmed" | "cancelled" | "picked_up";
  pickup_code: string | null;
  created_at: string;
};

type FoodBox = {
  id: string;
  restaurant_name: string;
  description: string;
  address: string;
  pickup_from: string;
  pickup_to: string;
  portions: number;
  status: string;
  suspended: boolean;
  food_tags: string[];
};

const REG_KEY = "salvapasti:registration";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABEL: Record<ReservationRow["status"], string> = {
  confirmed: "Confermata",
  picked_up: "Ritirata",
  cancelled: "Annullata",
};

const STATUS_COLOR: Record<ReservationRow["status"], string> = {
  confirmed: "bg-sage/15 text-sage",
  picked_up: "bg-primary/15 text-primary",
  cancelled: "bg-muted text-muted-foreground",
};

function MieePrenotazioni() {
  const qc = useQueryClient();
  const [reg, setReg] = useState<Registration | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | ReservationRow["status"]>("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "past">("all");
  const [pickupTarget, setPickupTarget] = useState<ReservationRow | null>(null);
  const [waiverAccepted, setWaiverAccepted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REG_KEY);
      if (raw) setReg(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["my-reservations", reg?.email],
    queryFn: async () => {
      if (!reg?.email) return [];
      const { data, error } = await supabase.rpc("get_my_reservations", {
        p_email: reg.email,
      });
      if (error) throw error;
      return (data ?? []) as ReservationRow[];
    },
    enabled: !!reg?.email,
  });

  const { data: boxes = [] } = useQuery({
    queryKey: ["food_boxes_for_my_res", rows.map((r) => r.food_box_id).join(",")],
    queryFn: async () => {
      if (rows.length === 0) return [];
      const ids = Array.from(new Set(rows.map((r) => r.food_box_id)));
      const { data, error } = await supabase
        .from("food_boxes")
        .select("*")
        .in("id", ids);
      if (error) throw error;
      return data as FoodBox[];
    },
    enabled: rows.length > 0,
  });

  // Storico personale: anche le donazioni offerte (box sospese a nome dell'utente)
  const { data: myDonations = [] } = useQuery({
    queryKey: ["my-donations", reg?.nome],
    queryFn: async () => {
      if (!reg?.nome) return [];
      const { data, error } = await supabase
        .from("food_boxes")
        .select("id, portions, status, created_at")
        .eq("suspended", true)
        .eq("donor_name", reg.nome);
      if (error) throw error;
      return (data ?? []) as { id: string; portions: number; status: string; created_at: string }[];
    },
    enabled: !!reg?.nome,
  });

  const boxMap = useMemo(() => new Map(boxes.map((b) => [b.id, b])), [boxes]);

  // Storico stats
  const stats = useMemo(() => {
    const pickedUp = rows.filter((r) => r.status === "picked_up");
    const portionsReceived = pickedUp.reduce((sum, r) => {
      const box = boxMap.get(r.food_box_id);
      return sum + (box?.portions ?? 0);
    }, 0);
    // Stima: ~0.4 kg di cibo salvato per porzione (media nazionale spreco ristorazione)
    const kgSaved = (portionsReceived * 0.4).toFixed(1);
    const donationsCount = myDonations.length;
    const donatedPortions = myDonations.reduce((s, d) => s + (d.portions ?? 0), 0);
    return { pickedUpCount: pickedUp.length, portionsReceived, kgSaved, donationsCount, donatedPortions };
  }, [rows, boxMap, myDonations]);

  const filtered = useMemo(() => {
    const now = Date.now();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (timeFilter !== "all") {
        const box = boxMap.get(r.food_box_id);
        if (!box) return true;
        const end = new Date(box.pickup_to).getTime();
        if (timeFilter === "upcoming" && end < now) return false;
        if (timeFilter === "past" && end >= now) return false;
      }
      return true;
    });
  }, [rows, boxMap, statusFilter, timeFilter]);

  const updateMutation = useMutation({
    mutationFn: async ({
      reservation,
      next,
    }: {
      reservation: ReservationRow;
      next: "cancelled" | "picked_up";
    }) => {
      const { error } = await supabase.rpc("update_reservation_status", {
        p_reservation_id: reservation.id,
        p_pickup_code: reservation.pickup_code ?? "",
        p_next_status: next,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-reservations"] });
      qc.invalidateQueries({ queryKey: ["food_boxes"] });
    },
  });

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Torna alla home
        </Link>
        <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Le mie <em className="font-serif italic text-terracotta">prenotazioni</em>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Tutti i box che hai prenotato, con lo stato e le informazioni per il ritiro.
        </p>

        {!reg ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              Devi prima registrarti per vedere le tue prenotazioni.
            </p>
            <Link
              to="/registrati"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Registrati
            </Link>
          </div>
        ) : (
          <>
            {/* Storico personale */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Box ritirate
                </p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stats.pickedUpCount}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Porzioni salvate
                </p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stats.portionsReceived}</p>
              </div>
              <div className="rounded-2xl border border-sage/30 bg-sage/10 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-sage">
                  Kg di cibo salvato
                </p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stats.kgSaved}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">stima (~0,4 kg/porzione)</p>
              </div>
              <div className="rounded-2xl border border-terracotta/30 bg-terracotta/5 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-terracotta">
                  Box sospese offerte
                </p>
                <p className="mt-2 text-3xl font-bold text-foreground">{stats.donationsCount}</p>
                {stats.donatedPortions > 0 && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {stats.donatedPortions} porzioni donate
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex gap-1 rounded-full border border-border bg-card p-1">
                {(["all", "confirmed", "picked_up", "cancelled"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      statusFilter === s
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s === "all" ? "Tutte" : STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 rounded-full border border-border bg-card p-1">
                {(
                  [
                    ["all", "Sempre"],
                    ["upcoming", "Prossime"],
                    ["past", "Passate"],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setTimeFilter(k)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      timeFilter === k
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {isLoading && (
                <p className="text-muted-foreground">Caricamento…</p>
              )}
              {!isLoading && filtered.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                  Nessuna prenotazione trovata.
                </div>
              )}
              {filtered.map((r, i) => {
                const box = boxMap.get(r.food_box_id);
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {box?.restaurant_name ?? "Box"}
                          </h3>
                          {box?.suspended && (
                            <span className="rounded-full bg-terracotta/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-terracotta">
                              Sospesa
                            </span>
                          )}
                        </div>
                        {box && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {box.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[r.status]}`}
                      >
                        {STATUS_LABEL[r.status]}
                      </span>
                    </div>

                    {box && (
                      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                            Indirizzo
                          </dt>
                          <dd className="text-foreground">{box.address}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                            Finestra ritiro
                          </dt>
                          <dd className="text-foreground">
                            {formatDateTime(box.pickup_from)} → {formatDateTime(box.pickup_to)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                            Codice ritiro
                          </dt>
                          <dd className="font-mono text-sm text-foreground">
                            {r.pickup_code ?? r.id.slice(0, 8).toUpperCase()}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                            Porzioni
                          </dt>
                          <dd className="text-foreground">{box.portions}</dd>
                        </div>
                      </dl>
                    )}

                    {r.status === "confirmed" && (
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          onClick={() =>
                            updateMutation.mutate({ reservation: r, next: "picked_up" })
                          }
                          disabled={updateMutation.isPending}
                          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                          Segna come ritirata
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Annullare questa prenotazione?")) {
                              updateMutation.mutate({ reservation: r, next: "cancelled" });
                            }
                          }}
                          disabled={updateMutation.isPending}
                          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
                        >
                          Annulla
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
