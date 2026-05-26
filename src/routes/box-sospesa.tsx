import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const Route = createFileRoute("/box-sospesa")({
  component: BoxSospesa,
});

type Registration = {
  nome: string;
  email: string;
  ruolo: string;
};

const REG_KEY = "salvapasti:registration";

function BoxSospesa() {
  const [reg, setReg] = useState<Registration | null>(null);
  const [locale, setLocale] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [portions, setPortions] = useState(1);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REG_KEY);
      if (raw) setReg(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const pickupFrom = new Date(now.getTime() + 60 * 60 * 1000);
      const pickupTo = new Date(now.getTime() + 6 * 60 * 60 * 1000);

      // Approximate Milan center with small random offset for demo
      const lat = 45.4642 + (Math.random() - 0.5) * 0.04;
      const lng = 9.19 + (Math.random() - 0.5) * 0.05;

      const { error } = await supabase.from("food_boxes").insert({
        restaurant_name: locale.trim(),
        description: descrizione.trim(),
        address: indirizzo.trim(),
        portions,
        pickup_from: pickupFrom.toISOString(),
        pickup_to: pickupTo.toISOString(),
        status: "available",
        suspended: true,
        donor_name: reg?.nome ?? "Anonimo",
        lat,
        lng,
        food_tags: [],
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => setSuccess(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locale.trim().length < 2 || descrizione.trim().length < 2 || indirizzo.trim().length < 2) {
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Torna alla home
        </Link>
        <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Box <em className="font-serif italic text-terracotta">sospesa</em>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Come il caffè sospeso napoletano: paghi una box al tuo locale di fiducia, il locale
          la prepara, l'app la assegna a un'associazione o un volontario nella zona. È
          donazione al quadrato — il locale offre il prodotto, tu compi il gesto.
        </p>

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-2xl border border-sage/30 bg-sage/10 p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/20 text-2xl">
              💚
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-foreground">Grazie!</h2>
            <p className="mt-2 text-muted-foreground">
              La box sospesa è registrata. La prima associazione o volontario in zona la
              vedrà sulla mappa e la prenoterà. Riceverai un riepilogo all'indirizzo
              registrato.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/"
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Torna alla home
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setLocale("");
                  setDescrizione("");
                  setIndirizzo("");
                  setPortions(1);
                }}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                Offri un'altra box
              </button>
            </div>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-5 rounded-2xl border border-border bg-card p-8"
          >
            {!reg && (
              <div className="rounded-lg border border-amber-300/40 bg-amber-50/40 px-4 py-3 text-sm text-foreground">
                Non sei registrato. Puoi continuare in modo anonimo, ma non potrai vedere
                le tue donazioni passate.{" "}
                <Link to="/registrati" className="font-semibold text-primary hover:underline">
                  Registrati
                </Link>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground">
                Locale (ristorante, bar, panetteria…)
              </label>
              <input
                type="text"
                required
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                placeholder="Es. Trattoria Bella"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Cosa contiene la box
              </label>
              <textarea
                required
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                placeholder="Es. Un pasto caldo per una persona: primo, secondo e pane"
                rows={3}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Indirizzo ritiro</label>
              <input
                type="text"
                required
                value={indirizzo}
                onChange={(e) => setIndirizzo(e.target.value)}
                placeholder="Via, numero, città"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Porzioni</label>
              <input
                type="number"
                min={1}
                max={50}
                value={portions}
                onChange={(e) => setPortions(Math.max(1, parseInt(e.target.value) || 1))}
                className="mt-1 w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {mutation.isError && (
              <p className="text-sm text-destructive">
                {(mutation.error as Error).message}
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {mutation.isPending ? "Invio…" : "Offri questa box sospesa"}
            </button>

            <p className="text-xs text-muted-foreground">
              Demo: per questa anteprima la box è registrata direttamente. La versione
              definitiva includerà il pagamento al locale partner.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
