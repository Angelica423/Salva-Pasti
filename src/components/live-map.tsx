import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type FoodBox = {
  id: string;
  restaurant_name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  portions: number;
  pickup_from: string;
  pickup_to: string;
  status: "available" | "reserved" | "picked_up";
};

type Registration = {
  nome: string;
  email: string;
  ruolo: "ristoratore" | "associazione" | "volontario" | "cittadino";
};

const REG_KEY = "salvapasti:registration";

function useRegistration() {
  const [reg, setReg] = useState<Registration | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(REG_KEY);
      if (raw) setReg(JSON.parse(raw) as Registration);
    } catch {
      // ignore
    }
  }, []);
  return reg;
}

function formatWindow(from: string, to: string) {
  const f = new Date(from);
  const t = new Date(to);
  const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  return `${f.toLocaleTimeString("it-IT", opts)} – ${t.toLocaleTimeString("it-IT", opts)}`;
}

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatDistance(m: number) {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}


export function LiveMap() {
  const qc = useQueryClient();
  const registration = useRegistration();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ box: FoodBox } | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied" | "unsupported">("idle");

  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("loading");
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setGeoStatus("ok");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);


  const { data: boxes = [], isLoading } = useQuery({
    queryKey: ["food_boxes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_boxes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FoodBox[];
    },
    refetchInterval: 15000,
  });

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("food_boxes_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_boxes" },
        () => qc.invalidateQueries({ queryKey: ["food_boxes"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const reserveMutation = useMutation({
    mutationFn: async (box: FoodBox) => {
      if (!registration) throw new Error("Devi registrarti prima di prenotare.");
      if (registration.ruolo !== "associazione" && registration.ruolo !== "volontario") {
        throw new Error("Solo associazioni e volontari possono prenotare.");
      }
      const { data, error } = await supabase.rpc("reserve_food_box", {
        p_box_id: box.id,
        p_name: registration.nome,
        p_email: registration.email,
        p_role: registration.ruolo,
      });
      if (error) throw new Error(error.message);
      const row = Array.isArray(data) ? data[0] : data;
      return { ...box, status: "reserved", pickup_code: row?.pickup_code } as FoodBox & { pickup_code?: string };
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["food_boxes"] });
      setSelectedId(null);
      setConfirmation({ box: updated });
    },
  });

  // Normalize lat/lng into 0-100% of the map area
  const positions = useMemo(() => {
    if (boxes.length === 0) return new Map<string, { top: string; left: string }>();
    const lats = boxes.map((b) => b.lat);
    const lngs = boxes.map((b) => b.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const padX = 0.12;
    const padY = 0.18;
    return new Map(
      boxes.map((b) => {
        const x = maxLng === minLng ? 0.5 : (b.lng - minLng) / (maxLng - minLng);
        const y = maxLat === minLat ? 0.5 : 1 - (b.lat - minLat) / (maxLat - minLat);
        return [
          b.id,
          {
            left: `${(padX + x * (1 - 2 * padX)) * 100}%`,
            top: `${(padY + y * (1 - 2 * padY)) * 100}%`,
          },
        ];
      }),
    );
  }, [boxes]);

  const selected = boxes.find((b) => b.id === selectedId) ?? null;
  const available = boxes.filter((b) => b.status === "available").length;
  const canReserve =
    registration?.ruolo === "associazione" || registration?.ruolo === "volontario";

  return (
    <section id="mappa" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            In tempo reale
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            La <em className="font-serif italic text-terracotta">mappa</em> del cibo salvato.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Box di cibo disponibili nel tuo quartiere, aggiornati al secondo. Le
            associazioni e i volontari registrati possono prenotare con un tocco.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Map */}
          <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-border shadow-lg">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, oklch(0.94 0.02 80) 0%, oklch(0.88 0.03 110) 50%, oklch(0.92 0.02 90) 100%)",
              }}
            />
            <svg
              className="absolute inset-0 h-full w-full opacity-20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid-map" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="url(#grid-map)"
                className="text-foreground"
              />
            </svg>

            {boxes.map((box, i) => {
              const pos = positions.get(box.id);
              if (!pos) return null;
              const isAvailable = box.status === "available";
              const color = isAvailable ? "var(--terracotta)" : "var(--muted-foreground)";
              return (
                <motion.button
                  key={box.id}
                  onClick={() => setSelectedId(box.id)}
                  className="absolute -translate-x-1/2 -translate-y-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
                  style={{ top: pos.top, left: pos.left }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease: "backOut" }}
                >
                  <div className="relative">
                    {isAvailable && (
                      <motion.div
                        className="absolute -inset-2 rounded-full"
                        style={{ backgroundColor: color, opacity: 0.3 }}
                        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    )}
                    <div
                      className="relative flex h-9 w-9 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white"
                      style={{ backgroundColor: color }}
                    >
                      {isAvailable ? "🍽" : "✓"}
                    </div>
                  </div>
                </motion.button>
              );
            })}

            <div className="absolute bottom-4 left-4 rounded-lg bg-background/90 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-sm">
              <span
                className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full"
                style={{ backgroundColor: "var(--terracotta)" }}
              />
              {available} box disponibili · {boxes.length - available} prenotati
            </div>
          </div>

          {/* Side panel */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {selected.status === "available" ? "Box disponibile" : "Già prenotato"}
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-foreground">
                    {selected.restaurant_name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {selected.description}
                  </p>
                  <dl className="mt-5 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Indirizzo</dt>
                      <dd className="text-right text-foreground">{selected.address}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Porzioni</dt>
                      <dd className="text-foreground">{selected.portions}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Ritiro</dt>
                      <dd className="text-foreground">
                        {formatWindow(selected.pickup_from, selected.pickup_to)}
                      </dd>
                    </div>
                  </dl>

                  {selected.status !== "available" ? (
                    <div className="mt-6 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                      Questo box è già stato prenotato. Grazie comunque! 🙏
                    </div>
                  ) : !registration ? (
                    <div className="mt-6 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Registrati come associazione o volontario per prenotare.
                      </p>
                      <Link
                        to="/registrati"
                        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                      >
                        Registrati
                      </Link>
                    </div>
                  ) : !canReserve ? (
                    <div className="mt-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      Sei registrato come <strong>{registration.ruolo}</strong>. Solo
                      associazioni e volontari possono prenotare i box.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-3">
                      <button
                        onClick={() => reserveMutation.mutate(selected)}
                        disabled={reserveMutation.isPending}
                        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                      >
                        {reserveMutation.isPending
                          ? "Prenotazione in corso…"
                          : `Prenota come ${registration.ruolo}`}
                      </button>
                      {reserveMutation.isError && (
                        <p className="text-sm text-destructive">
                          {(reserveMutation.error as Error).message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Prenotando ti impegni a ritirare entro la finestra indicata.
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {isLoading ? "Caricamento" : "Box in città"}
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-foreground">
                    {isLoading ? "..." : `${available} box disponibili ora`}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Tocca un pin sulla mappa per vedere il dettaglio e prenotare.
                  </p>
                  <ul className="mt-5 space-y-2">
                    {boxes.slice(0, 6).map((b) => (
                      <li key={b.id}>
                        <button
                          onClick={() => setSelectedId(b.id)}
                          className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                        >
                          <span className="font-medium text-foreground">
                            {b.restaurant_name}
                          </span>
                          <span
                            className={
                              b.status === "available"
                                ? "text-xs font-medium text-sage"
                                : "text-xs text-muted-foreground"
                            }
                          >
                            {b.status === "available" ? "Disponibile" : "Prenotato"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Confirmation overlay */}
      <AnimatePresence>
        {confirmation && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmation(null)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-2xl">
                ✓
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-foreground">
                Prenotazione confermata
              </h3>
              <p className="mt-2 text-muted-foreground">
                Hai prenotato il box di <strong>{confirmation.box.restaurant_name}</strong>.
                Mostra questa conferma al ritiro.
              </p>
              <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Indirizzo</span>
                  <span className="font-medium text-foreground">
                    {confirmation.box.address}
                  </span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-muted-foreground">Finestra ritiro</span>
                  <span className="font-medium text-foreground">
                    {formatWindow(
                      confirmation.box.pickup_from,
                      confirmation.box.pickup_to,
                    )}
                  </span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-muted-foreground">Codice</span>
                  <span className="font-mono text-xs font-medium text-foreground">
                    {confirmation.box.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setConfirmation(null)}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Ok, ho capito
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
