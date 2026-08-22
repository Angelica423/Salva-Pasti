import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { normalizzaTelefono } from "@/lib/auth";

type Props = {
  onVerificato?: (telefono: string) => void;
  titolo?: string;
  sottotitolo?: string;
};

/**
 * Verifica al primo accesso: numero di telefono + codice SMS a 6 cifre.
 * Un numero di telefono corrisponde sempre allo stesso account.
 */
export function PhoneVerification({ onVerificato, titolo, sottotitolo }: Props) {
  const [step, setStep] = useState<"telefono" | "codice">("telefono");
  const [telefono, setTelefono] = useState("");
  const [e164, setE164] = useState("");
  const [codice, setCodice] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const [reinviatoIl, setReinviatoIl] = useState<number | null>(null);

  const inviaCodice = async (numero: string) => {
    setCaricamento(true);
    setErrore(null);
    const { error } = await supabase.auth.signInWithOtp({ phone: numero });
    setCaricamento(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("provider") || msg.includes("disabled") || msg.includes("unsupported")) {
        setErrore(
          "L'invio degli SMS non è ancora attivo su questo progetto. Va configurato il provider SMS nelle impostazioni di autenticazione (sezione Telefono).",
        );
      } else if (msg.includes("rate") || msg.includes("limit")) {
        setErrore("Troppi tentativi. Attendi qualche minuto prima di richiedere un nuovo codice.");
      } else {
        setErrore(error.message);
      }
      return false;
    }
    setReinviatoIl(Date.now());
    return true;
  };

  const handleTelefono = async (e: React.FormEvent) => {
    e.preventDefault();
    const numero = normalizzaTelefono(telefono);
    if (!numero) {
      setErrore("Inserisci un numero di cellulare valido (es. 333 1234567).");
      return;
    }
    setE164(numero);
    if (await inviaCodice(numero)) setStep("codice");
  };

  const handleCodice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(codice)) {
      setErrore("Il codice è composto da 6 cifre.");
      return;
    }
    setCaricamento(true);
    setErrore(null);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: e164,
      token: codice,
      type: "sms",
    });
    if (error || !data.session) {
      setCaricamento(false);
      setErrore(error?.message ?? "Codice non valido o scaduto.");
      return;
    }

    // Un numero = un solo account: il profilo è creato una volta sola,
    // legato all'account telefonico (telefono UNIQUE a livello database).
    const userId = data.session.user.id;
    const { data: esistente } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (!esistente) {
      await supabase.from("profiles").insert({ id: userId, phone: e164, ruolo: "cittadino" });
    }

    setCaricamento(false);
    onVerificato?.(e164);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          {step === "telefono" ? <Phone className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
        </span>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {step === "telefono"
              ? (titolo ?? "Verifica il tuo numero")
              : "Inserisci il codice ricevuto"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {step === "telefono"
              ? (sottotitolo ??
                "Ti inviamo un SMS con un codice a 6 cifre. Un numero di telefono = un solo account.")
              : `Abbiamo inviato un codice a ${e164}.`}
          </p>
        </div>
      </div>

      {step === "telefono" ? (
        <form onSubmit={handleTelefono} className="mt-6 space-y-4">
          <div>
            <label htmlFor="telefono" className="text-sm font-medium text-foreground">
              Numero di cellulare
            </label>
            <input
              id="telefono"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={telefono}
              onChange={(ev) => setTelefono(ev.target.value)}
              maxLength={20}
              required
              placeholder="+39 333 1234567"
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>
          {errore && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {errore}
            </p>
          )}
          <button
            type="submit"
            disabled={caricamento}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {caricamento && <Loader2 className="h-4 w-4 animate-spin" />}
            Invia codice via SMS
          </button>
        </form>
      ) : (
        <form onSubmit={handleCodice} className="mt-6 space-y-4">
          <div>
            <label htmlFor="codice" className="text-sm font-medium text-foreground">
              Codice di verifica
            </label>
            <input
              id="codice"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={codice}
              onChange={(ev) => setCodice(ev.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              required
              placeholder="123456"
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-center text-2xl font-semibold tracking-[0.4em] text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>
          {errore && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {errore}
            </p>
          )}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            type="submit"
            disabled={caricamento || codice.length !== 6}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {caricamento && <Loader2 className="h-4 w-4 animate-spin" />}
            Verifica e continua
          </motion.button>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <button
              type="button"
              onClick={() => {
                setStep("telefono");
                setCodice("");
                setErrore(null);
              }}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Cambia numero
            </button>
            <button
              type="button"
              disabled={caricamento || (reinviatoIl !== null && Date.now() - reinviatoIl < 30000)}
              onClick={() => inviaCodice(e164)}
              className="font-medium text-primary transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              Reinvia codice
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
