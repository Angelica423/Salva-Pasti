import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import heroFood from "../assets/hero-food.jpg";
import logoAsset from "@/assets/salva-pasti-logo.png.asset.json";
import { LiveMap } from "@/components/live-map";
import { ProximityNotifier } from "@/components/proximity-notifier";
import { useInstallApp, InstallInstructionsModal } from "@/components/install-app";
import { LanguageSwitcher } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  component: Index,
});

function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoAsset.url} alt="Salva Pasti" className="max-w-[120px] mr-4 h-10 w-10 object-contain" />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Salva Pasti
          </span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <a href="#come-funziona" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Come funziona
          </a>
          <a href="#mappa" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Mappa
          </a>
          <Link to="/associazioni" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Associazioni
          </Link>
          <Link to="/box-sospesa" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Box sospesa
          </Link>
          <Link to="/mie-prenotazioni" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Le mie prenotazioni
          </Link>
          <a href="#scarica" className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:bg-foreground/5">
            <span aria-hidden>⬇</span> Scarica l'app
          </a>
          <Link to="/registrati" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20">
            Unisciti a noi
          </Link>
          <LanguageSwitcher />


        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden pt-24">
      <div className="absolute inset-0">
        <img src={heroFood} alt="Tavola italiana ricca di cibo fresco" className="h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ backgroundColor: "var(--hero-overlay)" }} />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-cream/80">
            Solidarietà alimentare · Italia
          </p>
          <h1 className="text-balance text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl">
            Il cibo non si butta.{" "}
            <em className="font-serif italic text-caramel">Si condivide.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cream/85 sm:text-xl">
            Salva Pasti connette ristoranti, sale ricevimenti e negozi con le associazioni del territorio. In tempo reale, gratuitamente, con dignità.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="#scarica" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20">
              <span aria-hidden>⬇</span> Scarica l'app
            </a>
            <a href="#come-funziona" className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-8 py-3.5 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20">
              Scopri il progetto
            </a>
          </div>

        </motion.div>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section id="storia" className="border-b border-border/50 bg-muted/30 py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <AnimatedSection>
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Come è nata l'idea
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            La <em className="font-serif italic text-terracotta">storia</em>.
          </h2>
          <p className="mx-auto mt-8 text-xl leading-relaxed text-muted-foreground sm:text-2xl">
            "Lavorando a stretto contatto con alcune strutture, ho visto buttare cibo per decine di famiglie. Da quel momento ho capito che doveva esistere un modo per connettere chi ha troppo con chi ha poco."
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "30%", label: "del cibo cucinato sprecato ogni giorno" },
    { value: "5M", label: "persone in povertà alimentare in Italia" },
    { value: "0€", label: "costo per chi riceve il cibo" },
    { value: "∞", label: "porzioni già salvate dalla rete" },
  ];

  return (
    <section className="border-b border-border/50 bg-background py-20">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {stats.map((stat, i) => (
          <AnimatedSection key={i}>
            <div className="text-center">
              <p className="text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: "var(--terracotta)" }}>
                {stat.value}
              </p>
              <p className="mt-2 text-sm leading-snug text-muted-foreground">{stat.label}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Il ristoratore segnala",
      description:
        "Pubblica una box a sorpresa con tipologia, porzioni e finestra di ritiro. Trenta secondi e basta.",
    },
    {
      number: "02",
      title: "L'associazione prenota",
      description:
        "Sulla mappa appaiono in tempo reale tutte le box vicine. Un tocco per prenotare con codice di ritiro.",
    },
    {
      number: "03",
      title: "Si distribuisce con dignità",
      description:
        "Il volontario ritira e consegna ai beneficiari registrati con tessera anonima. Nessun documento, nessun giudizio.",
    },
  ];

  return (
    <section id="come-funziona" className="bg-background py-24">
      <div className="mx-auto max-w-5xl px-6">
        <AnimatedSection className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Come funziona
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Tre passi. <em className="font-serif italic text-sage">Nessuna burocrazia.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Un sistema semplice che trasforma lo spreco quotidiano in una risorsa concreta, distribuita con cura dalle associazioni del tuo territorio.
          </p>
          <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-sage/30 bg-sage/5 p-4 text-sm leading-relaxed text-foreground/80">
            <strong className="text-sage">Tutelato per legge.</strong> Donando cibo in buono stato sei tutelato dalla <strong>Legge Gadda (L. 166/2016)</strong>. La tua responsabilità finisce alla consegna. Una sola liberatoria in fase di registrazione, in linguaggio semplice.
          </div>
        </AnimatedSection>

        <AnimatedSection className="mb-14">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-foreground/5">
            <video
              src="/come-funziona.mp4"
              className="block aspect-video w-full"
              autoPlay
              muted
              loop
              playsInline
              controls
              poster=""
            />
          </div>
          <p className="mt-3 text-center text-xs uppercase tracking-widest text-muted-foreground">
            60 secondi · senza parole
          </p>

        </AnimatedSection>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <AnimatedSection key={i}>
              <div className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-terracotta/30 hover:shadow-lg hover:shadow-terracotta/5">
                <span className="mb-6 block text-5xl font-bold tracking-tighter text-muted-foreground/30 transition-colors group-hover:text-terracotta/40">
                  {step.number}
                </span>
                <h3 className="mb-3 text-xl font-semibold tracking-tight text-foreground">{step.title}</h3>
                <p className="text-base leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForOfferers() {
  return (
    <section id="chi-offre" className="bg-background py-24">
      <div className="mx-auto max-w-5xl px-6">
        <AnimatedSection className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">Chi offre</p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Ristoratori, negozi e <em className="font-serif italic text-terracotta">sale ricevimenti</em>.
          </h2>
        </AnimatedSection>
        <div className="grid gap-8 md:grid-cols-2">
          <AnimatedSection>
            <div className="h-full rounded-2xl border border-terracotta/30 bg-terracotta/5 p-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-terracotta">Messaggio ai ristoratori</p>
              <p className="text-lg leading-relaxed text-foreground">
                "Invece di pagare per buttare l'umido, ti generiamo un <strong>report mensile</strong>. Il tuo commercialista sa cosa farne — <strong>sgravi fiscali</strong> e possibile <strong>sconto TARI</strong>, tutto documentato."
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <div className="h-full rounded-2xl border border-border bg-card p-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Vantaggi fiscali</p>
              <p className="text-base leading-relaxed text-muted-foreground">
                La <strong className="text-foreground">Legge Gadda</strong> prevede sgravi fiscali per chi documenta le donazioni, inclusa la possibile <strong className="text-foreground">riduzione della TARI</strong>. L'app genera il report mensile automaticamente. Una volta consegnato il cibo, il ristorante non è più responsabile.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function ForReceivers() {
  const sections = [
    {
      label: "Sezione 1 — Associazioni",
      title: "Caritas, Banco Alimentare, mense, parrocchie",
      body: "Accedi alle box disponibili, prenota e distribuisci alla tua rete.",
      cta: "Diventa partner",
      color: "sage",
    },
    {
      label: "Sezione 2 — Volontari Rider",
      title: "Hai un'ora libera?",
      body: "Ritira il cibo e portalo a chi non può muoversi. Un gesto piccolo, un impatto enorme.",
      cta: "Diventa volontario",
      color: "terracotta",
    },
    {
      label: "Sezione 3 — Cittadini",
      title: "Nessuna registrazione. Nessun documento.",
      body: "Apri la mappa, trova il cibo vicino a te e vai a ritirarlo. Gratis, anonimo, con dignità. Non sei registrato ad alcuna associazione? Nessun problema — accesso libero e anonimo per tutti.",
      cta: "Trova cibo vicino a me",
      color: "caramel",
    },
  ];

  return (
    <section id="per-chi" className="bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <AnimatedSection className="mb-10 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">Per chi riceve</p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Una rete per <em className="font-serif italic text-sage">tutti</em>.
          </h2>
        </AnimatedSection>
        <AnimatedSection className="mx-auto mb-12 max-w-3xl rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-base leading-relaxed text-foreground">
            Le famiglie seguite dalle nostre associazioni partner hanno <strong>accesso prioritario e assistito</strong>. Tutti gli altri accedono <strong>liberamente e in modo anonimo</strong>.
          </p>
        </AnimatedSection>
        <div className="grid gap-6 md:grid-cols-3">
          {sections.map((s, i) => (
            <AnimatedSection key={i}>
              <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-8">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full opacity-10" style={{ backgroundColor: `var(--${s.color})` }} />
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: `var(--${s.color})` }}>
                  {s.label}
                </p>
                <h3 className="mb-3 text-xl font-bold tracking-tight text-foreground">{s.title}</h3>
                <p className="mb-8 flex-1 text-base leading-relaxed text-muted-foreground">{s.body}</p>
                {s.cta === "Diventa partner" ? (
                  <Link
                    to="/registrati"
                    search={{ ruolo: "associazione" }}
                    className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: `var(--${s.color})` }}
                  >
                    👉 {s.cta}
                  </Link>
                ) : s.cta === "Diventa volontario" ? (
                  <Link
                    to="/registrati"
                    search={{ ruolo: "volontario" }}
                    className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: `var(--${s.color})` }}
                  >
                    👉 {s.cta}
                  </Link>
                ) : (
                  <a
                    href="#mappa"
                    className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: `var(--${s.color})` }}
                  >
                    👉 {s.cta}
                  </a>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// LiveMap moved to src/components/live-map.tsx

function FAQ() {
  const faqs = [
    {
      q: "Come funziona la registrazione?",
      a: "Le associazioni partner come Caritas e Banco Alimentare possono registrare le famiglie che seguono, rilasciando un codice di accesso prioritario. Chi non è seguito da nessuna associazione può accedere liberamente e in modo completamente anonimo — nessun documento, nessuna registrazione richiesta.",
    },
    {
      q: "Donare mi fa risparmiare davvero?",
      a: "Sì. La Legge Gadda (L. 166/2016) prevede sgravi fiscali per chi documenta le donazioni alimentari, inclusa la possibilità di riduzione della TARI nei Comuni che hanno recepito la norma. Salva Pasti genera ogni mese un report completo pronto da consegnare al tuo commercialista.",
    },
    {
      q: "Sono responsabile se qualcuno sta male?",
      a: "No. Donando cibo in buono stato sei tutelato dalla Legge Gadda (L. 166/2016). La tua responsabilità finisce al momento della consegna. Una sola liberatoria al momento della registrazione, in linguaggio semplice.",
    },
  ];

  return (
    <section id="faq" className="border-t border-border bg-muted/30 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <AnimatedSection className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">Domande frequenti</p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">FAQ</h2>
        </AnimatedSection>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <AnimatedSection key={i}>
              <details className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-terracotta/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-foreground">
                  {f.q}
                  <span className="text-terracotta transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function RateApp() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="valuta" className="bg-background py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <AnimatedSection>
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">⭐ Aiutaci a migliorare</p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Valuta <em className="font-serif italic text-terracotta">l'app</em>.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Salva Pasti è un progetto in crescita. La tua opinione ci aiuta a diventare migliori ogni giorno.
          </p>

          {!submitted ? (
            <>
              <div className="mt-10 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className="text-5xl transition-transform hover:scale-125"
                    aria-label={`${n} stelle`}
                  >
                    <span style={{ color: (hover || rating) >= n ? "var(--caramel)" : "oklch(0.85 0.02 80)" }}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => rating > 0 && setSubmitted(true)}
                disabled={rating === 0}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40"
              >
                Invia valutazione
              </button>
            </>
          ) : (
            <div className="mt-10 rounded-2xl border border-sage/40 bg-sage/10 p-8">
              <p className="text-2xl font-semibold text-foreground">Grazie! 🙏</p>
              <p className="mt-2 text-muted-foreground">Hai dato {rating} {rating === 1 ? "stella" : "stelle"}. La tua opinione conta davvero.</p>
            </div>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden py-28">
      <div className="absolute inset-0" style={{ backgroundColor: "var(--espresso)" }} />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-terracotta/20 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-sage/20 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <AnimatedSection>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Pronto a salvare il cibo del tuo territorio?
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/70">
            Unisciti alla rete in pochi minuti. Nessun costo, nessuna burocrazia. Solo tante porzioni di cibo che trovano una casa.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="#scarica" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20">
              <span aria-hidden>⬇</span> Scarica l'app
            </a>
            <Link to="/registrati" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10">
              Unisciti alla rete
            </Link>
          </div>

        </AnimatedSection>
      </div>
    </section>
  );
}

function ComingSoon() {
  const items = [
    { icon: "🎟️", title: "Tessera digitale anonima", desc: "QR personale per i beneficiari delle associazioni partner. Ritiro rapido, zero documenti." },
    { icon: "🚲", title: "Rete volontari rider", desc: "Coordinamento volontari per consegna a domicilio a chi non può muoversi." },
    { icon: "🏪", title: "Marketplace partner", desc: "Catalogo dei locali aderenti con offerte ricorrenti, filtri per zona e categoria." },
    { icon: "📈", title: "Report fiscali automatici", desc: "Generazione automatica del report mensile per il commercialista (Legge Gadda)." },
  ];
  return (
    <section className="bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <AnimatedSection className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            In arrivo
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Le prossime <em className="font-serif italic text-terracotta">funzionalità</em>.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Quello su cui stiamo lavorando per rendere Salva Pasti uno strumento davvero
            inclusivo e capillare.
          </p>
        </AnimatedSection>

        <AnimatedSection className="mb-10">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-foreground/5">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <span className="text-2xl" aria-hidden>🎬</span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Come funziona in video</h3>
                <p className="text-sm text-muted-foreground">60 secondi senza parole, solo immagini. Supera la barriera linguistica.</p>
              </div>
            </div>
            <video
              src="/come-funziona.mp4"
              className="block aspect-video w-full"
              autoPlay
              muted
              loop
              playsInline
              controls
            />
          </div>
        </AnimatedSection>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <AnimatedSection key={it.title}>
              <div className="h-full rounded-2xl border border-border bg-card p-6">
                <div className="text-3xl">{it.icon}</div>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{it.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function DownloadApp() {
  const install = useInstallApp();
  return (
    <section id="scarica" className="relative overflow-hidden border-t border-border bg-background py-24">
      <div className="absolute -top-32 right-1/4 h-72 w-72 rounded-full bg-terracotta/10 blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-sage/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center">
        <AnimatedSection>
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Disponibile su iOS e Android
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Scarica <em className="font-serif italic text-terracotta">Salva Pasti</em>.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Mappa in tempo reale, notifiche di prossimità, prenotazione in un tap.
            Gratis, senza pubblicità, con dignità.
          </p>
          {install.installed ? (
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-sage/40 bg-sage/10 px-5 py-3 text-sm font-semibold text-foreground">
              ✓ App già installata sul tuo dispositivo
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => install.trigger("ios")}
                aria-label="Installa su iPhone — Aggiungi a schermata Home"
                className="inline-flex items-center gap-3 rounded-2xl bg-foreground px-6 py-3 text-background transition-all hover:opacity-90"
              >
                <span className="text-3xl leading-none" aria-hidden></span>
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] uppercase tracking-wider opacity-70">Installa su</span>
                  <span className="text-lg font-semibold">iPhone / iPad</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => install.trigger("android")}
                aria-label="Installa su Android"
                className="inline-flex items-center gap-3 rounded-2xl bg-foreground px-6 py-3 text-background transition-all hover:opacity-90"
              >
                <span className="text-2xl leading-none" aria-hidden>▶</span>
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] uppercase tracking-wider opacity-70">Installa su</span>
                  <span className="text-lg font-semibold">Android</span>
                </span>
              </button>
            </div>
          )}
          <p className="mt-6 text-xs text-muted-foreground">
            Funziona come una vera app: aggiungila alla schermata Home in pochi secondi.
          </p>
        </AnimatedSection>

        <AnimatedSection>
          <div className="relative mx-auto h-[520px] w-[260px]">
            <div className="absolute inset-0 rounded-[3rem] border border-border bg-card shadow-2xl shadow-foreground/10">
              <div className="m-3 h-[calc(100%-1.5rem)] overflow-hidden rounded-[2.4rem] bg-gradient-to-br from-sage/15 via-background to-terracotta/15 p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Vicino a te
                </div>
                <div className="mt-2 font-serif text-2xl italic leading-tight text-foreground">
                  3 box <span className="text-terracotta">disponibili</span>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { name: "Trattoria Da Lucia", dist: "420 m", porz: "8 porzioni" },
                    { name: "Panetteria Sole", dist: "780 m", porz: "12 porzioni" },
                    { name: "Gelateria Centrale", dist: "1.1 km", porz: "5 porzioni" },
                  ].map((b) => (
                    <div key={b.name} className="rounded-2xl border border-border bg-card p-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-sage">
                        {b.dist}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-foreground">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.porz}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>

      <InstallInstructionsModal
        open={install.open}
        onClose={() => install.setOpen(false)}
        platform={install.platform}
      />
    </section>
  );
}


function Partners() {
  const categories = [
    {
      label: "Associazioni",
      items: [
        { name: "Caritas Italiana", role: "Distribuzione alimentare" },
        { name: "Banco Alimentare", role: "Raccolta e recupero cibo" },
        { name: "Pane Quotidiano", role: "Mense e comunità" },
        { name: "Assocuore", role: "Rete volontariato" },
      ],
    },
    {
      label: "Attività commerciali",
      items: [
        { name: "Trattoria Da Lucia", role: "Ristorante partner" },
        { name: "Panetteria Sole", role: "Forno aderente" },
        { name: "Gelateria Centrale", role: "Gelateria sostenibile" },
        { name: "Supermercati Eco", role: "Retail anti-spreco" },
      ],
    },
    {
      label: "Comuni",
      items: [
        { name: "Comune di Milano", role: "Sostegno progetto" },
        { name: "Comune di Roma", role: "Patrocinio" },
        { name: "Comune di Napoli", role: "Rete solidale" },
        { name: "Comune di Torino", role: "Collaborazione" },
      ],
    },
    {
      label: "Aziende",
      items: [
        { name: "Slow Food", role: "Sostenibilità alimentare" },
        { name: "Confcommercio", role: "Rete ristoratori" },
        { name: "Barilla", role: "Sostegno alimentare" },
        { name: "Esselunga", role: "Donazioni retail" },
      ],
    },
  ];

  return (
    <section className="border-t border-border bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <AnimatedSection className="mb-14 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Chi ci sostiene
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            I nostri <em className="font-serif italic text-terracotta">partner</em>.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Aziende, attività commerciali, Comuni e organizzazioni che credono nel progetto e ci aiutano a tenerlo gratuito per tutti.
          </p>
        </AnimatedSection>

        {categories.map((cat, ci) => (
          <div key={ci} className={ci > 0 ? "mt-14" : ""}>
            <AnimatedSection>
              <h3 className="mb-6 text-center text-xl font-semibold tracking-tight text-foreground">
                {cat.label}
              </h3>
            </AnimatedSection>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cat.items.map((p, i) => (
                <AnimatedSection key={i}>
                  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-terracotta/30 hover:shadow-lg hover:shadow-terracotta/5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-xl font-bold text-muted-foreground">
                      {p.name.charAt(0)}
                    </div>
                    <h4 className="mt-4 text-base font-semibold text-foreground">{p.name}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{p.role}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contatti" className="border-t border-border bg-background py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <img src={logoAsset.url} alt="Salva Pasti" className="h-10 w-10 object-contain" />
              <span className="text-lg font-semibold tracking-tight text-foreground">Salva Pasti</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Il cibo non si butta. Si condivide.
              <br />
              Una rete italiana contro lo spreco alimentare.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Naviga</h4>
            <ul className="space-y-2">
              <li><a href="#storia" className="text-sm text-muted-foreground transition-colors hover:text-foreground">La storia</a></li>
              <li><a href="#come-funziona" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Come funziona</a></li>
              <li><a href="#per-chi" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Per chi è</a></li>
              <li><a href="#mappa" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Mappa</a></li>
              <li><a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</a></li>
              <li><a href="#scarica" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Scarica l'app</a></li>
              <li><Link to="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy Policy</Link></li>

            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Contatti</h4>
            <p className="text-sm text-muted-foreground">Informazioni in arrivo.</p>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Salva Pasti — {new Date().getFullYear()} · Fatto con cura in Italia
          </p>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Story />
        <Stats />
        <HowItWorks />
        <ForOfferers />
        <ForReceivers />
        <LiveMap />
        <FAQ />
        <ComingSoon />
        <RateApp />
        <DownloadApp />
        <CTA />
        <Partners />
      </main>
      <Footer />
      <ProximityNotifier />
    </>
  );
}
