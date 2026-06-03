import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const Route = createFileRoute("/box-sospesa")({
  head: () => ({
    meta: [
      { title: "Box sospesa — Salva Pasti" },
      {
        name: "description",
        content:
          "Come il caffè sospeso napoletano: offri una box di cibo al tuo locale di fiducia. L'app la consegna a chi ne ha bisogno.",
      },
      { property: "og:title", content: "Box sospesa — Salva Pasti" },
      {
        property: "og:description",
        content:
          "Offri una box di cibo al tuo locale di fiducia. Una donazione al quadrato.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://salvapasti.lovable.app/box-sospesa" },
    ],
  }),
  component: BoxSospesa,
});

type Registration = {
  nome: string;
  email: string;
  ruolo: string;
};

type SuspendedBox = {
  id: string;
  restaurant_name: string;
  description: string;
  address: string;
  portions: number;
  status: string;
  donor_name: string | null;
  food_tags: string[];
  created_at: string;
};

const REG_KEY = "salvapasti:registration";

const FOOD_TAGS = [
  "Vegetariano",
  "Vegano",
  "Senza glutine",
  "Halal",
  "Kosher",
  "Per bambini",
  "Caldo",
  "Da scaldare",
] as const;

const PRESETS = [
  {
    label: "Un pasto caldo",
    portions: 1,
    desc: "Un pasto completo per una persona: primo, secondo e pane.",
  },
  {
    label: "Cena di famiglia (4)",
    portions: 4,
    desc: "Cena per una famiglia di 4 persone: primo, secondo, contorno e pane.",
  },
  {
    label: "Colazione per 2",
    portions: 2,
    desc: "Colazione dolce con cornetto, pane e bevanda calda per due persone.",
  },
];

function BoxSospesa() {
  const [reg, setReg] = useState<Registration | null>(null);
  const [locale, setLocale] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [portions, setPortions] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [recurrence, setRecurrence] = useState<"none" | "weekly" | "monthly">("none");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REG_KEY);
      if (raw) setReg(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const recent = useQuery({
    queryKey: ["suspended-boxes"],
    queryFn: async (): Promise<SuspendedBox[]> => {
      const { data, error } = await supabase
        .from("food_boxes")
        .select(
          "id, restaurant_name, description, address, portions, status, donor_name, food_tags, created_at",
        )
        .eq("suspended", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw new Error(error.message);
      return (data ?? []) as SuspendedBox[];
    },
  });

  const totalSuspended = recent.data?.length ?? 0;
  const totalPortions =
    recent.data?.reduce((s, b) => s + (b.portions ?? 0), 0) ?? 0;

  const mutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const pickupFrom = new Date(now.getTime() + 60 * 60 * 1000);
      const pickupTo = new Date(now.getTime() + 6 * 60 * 60 * 1000);

      // Approximate Milan center with small random offset for demo
      const lat = 45.4642 + (Math.random() - 0.5) * 0.04;
      const lng = 9.19 + (Math.random() - 0.5) * 0.05;

      const fullDescription = message.trim()
        ? `${descrizione.trim()}\n\n💌 ${message.trim()}`
        : descrizione.trim();

      const { error } = await supabase.from("food_boxes").insert({
        restaurant_name: locale.trim(),
        description: fullDescription,
        address: indirizzo.trim(),
        portions,
        pickup_from: pickupFrom.toISOString(),
        pickup_to: pickupTo.toISOString(),
        status: "available",
        suspended: true,
        donor_name: reg?.nome ?? "Anonimo",
        lat,
        lng,
        food_tags: tags,
        recurrence: recurrence === "none" ? null : recurrence,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setSuccess(true);
      qc.invalidateQueries({ queryKey: ["suspended-boxes"] });
    },
  });

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setPortions(p.portions);
    setDescrizione(p.desc);
  };

  const canSubmit =
    locale.trim().length >= 2 &&
    descrizione.trim().length >= 2 &&
    indirizzo.trim().length >= 2 &&
    portions >= 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="mx-auto max-w-5xl px-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Torna alla home
        </Link>

        {/* Hero */}
        <header className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Solidarietà · Napoli style
          </p>
          <h1 className="mt-2 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Box <em className="font-serif italic text-terracotta">sospesa</em>.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Come il caffè sospeso napoletano: paghi una box al tuo locale di fiducia,
            il locale la prepara, l'app la assegna a un'associazione o un volontario
            nella zona. Una donazione al quadrato — il locale offre il prodotto, tu
            compi il gesto.
          </p>
        </header>

        {/* Stats live */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Box sospese attive
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {recent.isLoading ? "—" : totalSuspended}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Porzioni in attesa
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {recent.isLoading ? "—" : totalPortions}
            </p>
          </div>
          <div className="col-span-2 rounded-2xl border border-sage/30 bg-sage/10 p-5 sm:col-span-1">
            <p className="text-xs font-medium uppercase tracking-wider text-sage">
              100% del valore
            </p>
            <p className="mt-2 text-sm leading-snug text-foreground">
              va in cibo a chi ne ha bisogno. Zero commissioni.
            </p>
          </div>
        </div>

        {/* How it works */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Come funziona
          </h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Scegli e offri",
                d: "Selezioni il locale partner, decidi cosa contiene la box e per quante persone.",
              },
              {
                n: "02",
                t: "Il locale prepara",
                d: "Il ristoratore riceve la notifica e prepara la box quando è pronto.",
              },
              {
                n: "03",
                t: "Arriva a chi serve",
                d: "Un'associazione o un volontario in zona la prenota e la consegna.",
              },
            ].map((s) => (
              <li
                key={s.n}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="block text-3xl font-bold tracking-tight text-terracotta/40">
                  {s.n}
                </span>
                <h3 className="mt-3 text-base font-semibold text-foreground">
                  {s.t}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.d}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Form + Recent */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-sage/30 bg-sage/10 p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/20 text-2xl">
                  💚
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-foreground">
                  Grazie, {reg?.nome ?? "amico"}!
                </h2>
                <p className="mt-2 text-muted-foreground">
                  La box sospesa è registrata. La prima associazione o volontario in
                  zona la vedrà sulla mappa e la prenoterà. Riceverai un riepilogo
                  all'indirizzo registrato.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
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
                      setTags([]);
                      setMessage("");
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
                className="space-y-5 rounded-2xl border border-border bg-card p-8"
              >
                <h2 className="text-xl font-semibold text-foreground">
                  Offri una box sospesa
                </h2>

                {!reg && (
                  <div className="rounded-lg border border-amber-300/40 bg-amber-50/40 px-4 py-3 text-sm text-foreground">
                    Non sei registrato. Puoi continuare in modo anonimo, ma non
                    potrai vedere le tue donazioni passate.{" "}
                    <Link
                      to="/registrati"
                      className="font-semibold text-primary hover:underline"
                    >
                      Registrati
                    </Link>
                  </div>
                )}

                {/* Presets */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Inizia veloce
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-terracotta/50 hover:bg-terracotta/5"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Locale (ristorante, bar, panetteria…)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
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
                    maxLength={500}
                    value={descrizione}
                    onChange={(e) => setDescrizione(e.target.value)}
                    placeholder="Es. Un pasto caldo per una persona: primo, secondo e pane"
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-right text-[11px] text-muted-foreground">
                    {descrizione.length}/500
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Indirizzo ritiro
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={indirizzo}
                    onChange={(e) => setIndirizzo(e.target.value)}
                    placeholder="Via, numero, città"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex flex-wrap items-end gap-6">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Porzioni
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={portions}
                      onChange={(e) =>
                        setPortions(
                          Math.max(1, Math.min(50, parseInt(e.target.value) || 1)),
                        )
                      }
                      className="mt-1 w-28 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Una porzione = un pasto per una persona.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">
                    Tag alimentari (opzionale)
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {FOOD_TAGS.map((t) => {
                      const active = tags.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTag(t)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? "border-sage bg-sage/15 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-sage/50"
                          }`}
                        >
                          {active ? "✓ " : ""}
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Messaggio per chi riceverà (opzionale)
                  </label>
                  <textarea
                    maxLength={200}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Es. Buon appetito, da un amico. ❤️"
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-right text-[11px] text-muted-foreground">
                    {message.length}/200
                  </p>
                </div>

                {mutation.isError && (
                  <p className="text-sm text-destructive">
                    {(mutation.error as Error).message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={mutation.isPending || !canSubmit}
                  className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  {mutation.isPending ? "Invio…" : "💚 Offri questa box sospesa"}
                </button>

                <p className="text-xs text-muted-foreground">
                  Demo: per questa anteprima la box è registrata direttamente.
                  La versione definitiva includerà il pagamento al locale partner.
                </p>
              </form>
            )}
          </div>

          {/* Recent suspended boxes */}
          <aside>
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Ultime box sospese
                </h2>
                <span className="text-xs text-muted-foreground">
                  {recent.isLoading ? "…" : `${totalSuspended} attive`}
                </span>
              </div>

              {recent.isLoading ? (
                <div className="mt-5 space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-20 animate-pulse rounded-xl bg-muted"
                    />
                  ))}
                </div>
              ) : recent.data && recent.data.length > 0 ? (
                <ul className="mt-5 space-y-3">
                  {recent.data.map((b) => (
                    <li
                      key={b.id}
                      className="rounded-xl border border-border bg-background p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">
                          {b.restaurant_name}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            b.status === "available"
                              ? "bg-sage/15 text-sage"
                              : b.status === "reserved"
                                ? "bg-caramel/15 text-caramel"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {b.status === "available"
                            ? "Disponibile"
                            : b.status === "reserved"
                              ? "Prenotata"
                              : "Consegnata"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {b.portions} {b.portions === 1 ? "porzione" : "porzioni"}
                        {b.donor_name ? ` · offerta da ${b.donor_name}` : ""}
                      </p>
                      {b.food_tags && b.food_tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {b.food_tags.slice(0, 4).map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm text-muted-foreground">
                  Nessuna box sospesa per ora. Sii il primo a offrirne una.
                </p>
              )}

              <Link
                to="/"
                hash="mappa"
                className="mt-5 block text-center text-xs font-medium text-terracotta hover:underline"
              >
                Vedi tutte sulla mappa →
              </Link>
            </div>
          </aside>
        </div>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Domande frequenti
          </h2>
          <div className="mt-5 space-y-3">
            {[
              {
                q: "Chi riceve la box?",
                a: "Le associazioni partner hanno accesso prioritario per le famiglie che seguono. Se nessuna associazione prenota entro la finestra di ritiro, la box passa ai volontari rider o ai cittadini in modo anonimo.",
              },
              {
                q: "Posso scegliere a chi va?",
                a: "No, e questa è la forza del sistema. La box sospesa va alla prima persona o realtà in difficoltà che la prenota — proprio come il caffè sospeso al bar. Anonimato totale per chi riceve, nessun giudizio.",
              },
              {
                q: "Quanto costa?",
                a: "Nella versione finale, paghi il prezzo del pasto direttamente al locale partner. Salva Pasti non trattiene commissioni: il 100% del valore va in cibo.",
              },
              {
                q: "Posso fare donazioni ricorrenti?",
                a: "In arrivo: una box sospesa ogni venerdì dal tuo locale del cuore, impostata una volta sola.",
              },
            ].map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border bg-card p-5"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-foreground">
                  {f.q}
                  <span className="text-terracotta transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
