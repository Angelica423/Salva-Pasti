import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PhoneVerification } from "@/components/phone-verification";
import { useSession } from "@/lib/auth";

export const Route = createFileRoute("/verifica")({
  component: Verifica,
  head: () => ({
    meta: [
      { title: "Verifica il tuo numero — Salva Pasti" },
      {
        name: "description",
        content:
          "Verifica il tuo numero di cellulare con un codice SMS a 6 cifre: un numero di telefono corrisponde a un solo account Salva Pasti.",
      },
      { property: "og:title", content: "Verifica il tuo numero — Salva Pasti" },
      {
        property: "og:description",
        content: "Un codice SMS a 6 cifre per accedere a Salva Pasti in sicurezza.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Verifica() {
  const navigate = useNavigate();
  const { session, loading } = useSession();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-6 py-20">
        <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          ← Torna alla home
        </Link>

        <h1 className="mt-8 text-balance text-4xl font-bold tracking-tight text-foreground">
          Accesso sicuro con <em className="font-serif italic text-terracotta">SMS</em>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Al primo accesso verifichiamo il tuo numero di cellulare. Serve a evitare account falsi e
          prenotazioni fantasma: un numero di telefono = un solo account.
        </p>

        <div className="mt-10">
          {loading ? (
            <p className="text-sm text-muted-foreground">Caricamento…</p>
          ) : session ? (
            <div className="rounded-2xl border border-sage/40 bg-sage/5 p-8">
              <p className="text-sm font-medium uppercase tracking-widest text-sage">
                Numero verificato
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                {session.user.phone ? `+${session.user.phone}` : "Il tuo numero"} è confermato
              </h2>
              <p className="mt-3 text-muted-foreground">
                Puoi completare il profilo e iniziare a usare Salva Pasti.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/registrati"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  Completa il profilo
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted"
                >
                  Vai alla mappa
                </Link>
              </div>
            </div>
          ) : (
            <PhoneVerification onVerificato={() => navigate({ to: "/registrati" })} />
          )}
        </div>
      </div>
    </main>
  );
}
