import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Salva Pasti" },
      { name: "description", content: "Informativa sulla privacy di Salva Pasti: come trattiamo i dati personali ai sensi del GDPR." },
      { property: "og:title", content: "Privacy Policy — Salva Pasti" },
      { property: "og:description", content: "Informativa sulla privacy di Salva Pasti ai sensi del GDPR." },
    ],
    links: [{ rel: "canonical", href: "https://salvapasti.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="bg-background py-20">
      <article className="mx-auto max-w-3xl px-6">
        <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          ← Torna alla home
        </Link>
        <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Privacy <em className="font-serif italic text-terracotta">Policy</em>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="prose mt-10 max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold">1. Titolare del trattamento</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Il titolare del trattamento dei dati personali è <strong>Salva Pasti</strong>, progetto di solidarietà alimentare con sede in Italia. Per qualsiasi richiesta puoi contattarci via email all'indirizzo che verrà pubblicato a breve nella sezione contatti.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. Quali dati raccogliamo</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed text-muted-foreground">
              <li><strong>Dati di registrazione</strong> (ristoratori, associazioni, volontari): nome, email, ruolo, eventuale nome dell'attività o associazione.</li>
              <li><strong>Geolocalizzazione</strong>: posizione approssimativa, usata solo nel tuo browser per centrare la mappa e per gli avvisi di prossimità. Non viene salvata sui nostri server.</li>
              <li><strong>Dati delle box</strong>: ristorante, tipologia di cibo, porzioni, orario di ritiro.</li>
              <li><strong>Prenotazioni</strong>: associazione che prenota, codice di ritiro, stato.</li>
              <li><strong>Cittadini</strong>: accesso libero e anonimo, nessun dato personale richiesto.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Finalità e base giuridica</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Trattiamo i dati per erogare il servizio (art. 6.1.b GDPR), per adempiere obblighi di legge come la generazione dei report mensili previsti dalla Legge Gadda (art. 6.1.c), e per legittimo interesse a far funzionare la rete di solidarietà (art. 6.1.f).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Geolocalizzazione e notifiche</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              La posizione viene richiesta dal browser solo dopo il tuo consenso esplicito e usata in tempo reale per mostrare le box vicine e per inviare avvisi quando una box è entro 500 metri da te. Puoi revocare il permesso in qualsiasi momento dalle impostazioni del browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Conservazione</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              I dati di registrazione sono conservati finché il tuo account è attivo. Le prenotazioni e i dati delle box sono conservati per il tempo necessario alla rendicontazione fiscale (Legge Gadda) e poi cancellati o anonimizzati.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Condivisione dei dati</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Non vendiamo dati a terzi. I dati sono ospitati su infrastruttura cloud europea conforme al GDPR. Possiamo condividere dati aggregati e anonimi con enti pubblici o partner per misurare l'impatto del progetto.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. I tuoi diritti</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Hai diritto di accedere, rettificare, cancellare i tuoi dati, limitarne o opporti al trattamento, e ottenere la portabilità. Puoi esercitare questi diritti scrivendoci. Hai inoltre diritto di proporre reclamo al <strong>Garante per la protezione dei dati personali</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">8. Cookie</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Salva Pasti utilizza solo cookie tecnici essenziali al funzionamento del servizio e alla tua sessione. Non utilizziamo cookie di profilazione o pubblicitari.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">9. Modifiche</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Possiamo aggiornare questa informativa. Le modifiche rilevanti saranno comunicate sull'app o via email.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
