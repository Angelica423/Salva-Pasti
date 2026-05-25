import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/registrati")({
  component: Registrati,
});

const STORAGE_KEY = "salvapasti:registration";

type Registration = {
  nome: string;
  email: string;
  ruolo: "ristoratore" | "associazione" | "volontario" | "cittadino";
  liberatoriaAccettata: true;
  liberatoriaVersione: string;
  accettataIl: string;
};

const LIBERATORIA_VERSIONE = "1.0";

function Registrati() {
  const [existing, setExisting] = useState<Registration | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [ruolo, setRuolo] = useState<Registration["ruolo"]>("ristoratore");
  const [accettata, setAccettata] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setExisting(JSON.parse(raw) as Registration);
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrore(null);

    const nomeTrim = nome.trim();
    const emailTrim = email.trim();

    if (nomeTrim.length < 2 || nomeTrim.length > 80) {
      setErrore("Inserisci un nome valido (2-80 caratteri).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim) || emailTrim.length > 120) {
      setErrore("Inserisci un'email valida.");
      return;
    }
    if (!accettata) {
      setErrore("Devi accettare la liberatoria per continuare.");
      return;
    }

    const reg: Registration = {
      nome: nomeTrim,
      email: emailTrim,
      ruolo,
      liberatoriaAccettata: true,
      liberatoriaVersione: LIBERATORIA_VERSIONE,
      accettataIl: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reg));
      setExisting(reg);
      setSubmitted(true);
    } catch {
      setErrore("Impossibile salvare la registrazione sul dispositivo.");
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          ← Torna alla home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Unisciti a <em className="font-serif italic text-terracotta">Salva Pasti</em>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Una sola registrazione, una sola liberatoria. Niente moduli ogni volta.
          </p>
        </motion.div>

        {existing && !submitted ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-8">
            <p className="text-sm font-medium uppercase tracking-widest text-sage">
              Registrazione attiva
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Ciao {existing.nome} 👋
            </h2>
            <p className="mt-3 text-muted-foreground">
              Hai già accettato la liberatoria il{" "}
              {new Date(existing.accettataIl).toLocaleDateString("it-IT", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              (versione {existing.liberatoriaVersione}). Non dovrai più rifarla.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Vai alla mappa
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  setExisting(null);
                  setSubmitted(false);
                }}
                className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted"
              >
                Elimina registrazione
              </button>
            </div>
          </div>
        ) : submitted && existing ? (
          <div className="mt-10 rounded-2xl border border-sage/40 bg-sage/5 p-8">
            <p className="text-sm font-medium uppercase tracking-widest text-sage">
              Tutto fatto
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Grazie {existing.nome}, sei dentro.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Liberatoria accettata e salvata. Non te la chiederemo di nuovo.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Inizia ora
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label htmlFor="nome" className="text-sm font-medium text-foreground">
                Nome e cognome
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={80}
                required
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
                placeholder="Mario Rossi"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={120}
                required
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
                placeholder="mario@esempio.it"
              />
            </div>

            <div>
              <label htmlFor="ruolo" className="text-sm font-medium text-foreground">
                Ruolo
              </label>
              <select
                id="ruolo"
                value={ruolo}
                onChange={(e) => setRuolo(e.target.value as Registration["ruolo"])}
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
              >
                <option value="ristoratore">Ristoratore / negozio</option>
                <option value="associazione">Associazione</option>
                <option value="volontario">Volontario rider</option>
                <option value="cittadino">Cittadino</option>
              </select>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-6">
              <h3 className="text-base font-semibold text-foreground">
                Liberatoria (versione {LIBERATORIA_VERSIONE})
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Donando cibo in buono stato sei tutelato dalla{" "}
                <strong className="text-foreground">Legge Gadda (L. 166/2016)</strong>.
                La tua responsabilità finisce al momento della consegna. Salva Pasti
                è un servizio gratuito che mette in contatto chi dona e chi riceve:
                non è responsabile della qualità degli alimenti né del trasporto.
                Dichiari di donare/ricevere cibo in buona fede, nel rispetto delle
                norme igienico-sanitarie di base.
              </p>
              <label className="mt-4 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accettata}
                  onChange={(e) => setAccettata(e.target.checked)}
                  required
                  className="mt-1 h-5 w-5 cursor-pointer rounded border-border accent-primary"
                />
                <span className="text-sm text-foreground">
                  Ho letto e accetto la liberatoria. Capisco che verrà salvata una
                  sola volta e non mi sarà più richiesta.
                </span>
              </label>
            </div>

            {errore && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {errore}
              </div>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
              disabled={!accettata}
            >
              Completa registrazione
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
