import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Leaf } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroFood from "../assets/hero-food.jpg";
import logoAsset from "@/assets/salva-pasti-logo.png.asset.json";
import { LiveMap } from "@/components/live-map";
import { ProximityNotifier } from "@/components/proximity-notifier";

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
  const [open, setOpen] = useState(false);
  const linkCls = "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap";
  const navLinks = (
    <>
      <a href="#come-funziona" className={linkCls} onClick={() => setOpen(false)}>Come funziona</a>
      <a href="#mappa" className={linkCls} onClick={() => setOpen(false)}>Mappa</a>
      <Link to="/associazioni" className={linkCls} onClick={() => setOpen(false)}>Associazioni</Link>
      <Link to="/box-sospesa" className={linkCls} onClick={() => setOpen(false)}>Box sospesa</Link>
      <Link to="/mie-prenotazioni" className={linkCls} onClick={() => setOpen(false)}>Prenotazioni</Link>
    </>
  );
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <img src={logoAsset.url} alt="Salva Pasti" className="h-9 w-9 object-contain" />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Salva Pasti
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {navLinks}
        </div>

        <div className="hidden items-center gap-3 lg:flex shrink-0">
          <LanguageSwitcher />
          <Link to="/registrati" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20">
            Unisciti a noi
          </Link>
        </div>

        {/* Mobile trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-foreground transition-colors hover:bg-foreground/5"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {open ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6 [&>a]:rounded-md [&>a]:px-3 [&>a]:py-2 [&>a]:text-sm [&>a]:font-medium [&>a]:text-foreground/80 hover:[&>a]:bg-foreground/5">
            {navLinks}
            <Link to="/registrati" onClick={() => setOpen(false)} className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
              Unisciti a noi
            </Link>
          </div>
        </div>
      )}
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
          <p className="mx-auto mt-6 text-xl leading-relaxed text-muted-foreground sm:text-2xl">
            In quel momento ho capito che non era uno spreco di cibo. Era uno spreco di umanità.
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
    { value: "0", label: "porzioni salvate · unisciti per cambiare questo numero" },
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
          <a
            href="https://salvapasti.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
          >
            <span aria-hidden>➜</span> Apri l'app
          </a>
          <p className="mt-6 text-xs text-muted-foreground">
            Funziona come una vera app: aggiungila alla schermata Home in pochi secondi.
          </p>
        </AnimatedSection>

        <AnimatedSection>
          <PhoneMockup />
        </AnimatedSection>
      </div>
    </section>
  );
}

function PhoneMockup() {
  const { data: boxes = [], isLoading } = useQuery({
    queryKey: ["food_boxes", "preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_boxes")
        .select("id, restaurant_name, address, portions, status")
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
    retry: 1,
  });

  const available = boxes.length;

  return (
    <div className="relative mx-auto h-[520px] w-[260px]">
      <div className="absolute inset-0 rounded-[3rem] border border-border bg-card shadow-2xl shadow-foreground/10">
        <div className="m-3 h-[calc(100%-1.5rem)] overflow-hidden rounded-[2.4rem] bg-gradient-to-br from-sage/15 via-background to-terracotta/15 p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Vicino a te
          </div>
          <div className="mt-2 font-serif text-2xl italic leading-tight text-foreground">
            {isLoading ? (
              <>Box <span className="text-terracotta">in arrivo…</span></>
            ) : available === 0 ? (
              <>Nessuna box <span className="text-terracotta">al momento</span></>
            ) : (
              <>{available} box <span className="text-terracotta">disponibili</span></>
            )}
          </div>
          <div className="mt-5 space-y-3">
            {isLoading &&
              [0, 1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl border border-border bg-muted/40" />
              ))}
            {!isLoading && boxes.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-xs text-muted-foreground">
                Torna più tardi — nuove box vengono aggiunte ogni giorno.
              </div>
            )}
            {!isLoading &&
              boxes.map((b) => (
                <div key={b.id} className="rounded-2xl border border-border bg-card p-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-sage">
                    Disponibile
                  </div>
                  <div className="mt-1 text-sm font-semibold text-foreground">
                    {b.restaurant_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {b.portions} porzioni
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}


function Partners() {
  const categories = [
    {
      label: "Associazioni",
      items: [
        { name: "Diventa partner", role: "" },
        { name: "Diventa partner", role: "" },
        { name: "Diventa partner", role: "" },
        { name: "Diventa partner", role: "" },
      ],
    },
    {
      label: "Attività commerciali",
      items: [
         { name: "Diventa partner", role: "" },
         { name: "Diventa partner", role: "" },
         { name: "Diventa partner", role: "" },
         { name: "Diventa partner", role: "" },
      ],
    },
    {
      label: "Comuni",
      items: [
          { name: "Diventa partner", role: "" },
          { name: "Diventa partner", role: "" },
          { name: "Diventa partner", role: "" },
          { name: "Diventa partner", role: "" },
      ],
    },
    {
      label: "Aziende",
      
      items: [
          { name: "Diventa partner", role: "" },
          { name: "Diventa partner", role: "" },

          { name: "Diventa partner", role: "" },
          { name: "Diventa partner", role: "" },
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
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Leaf className="h-6 w-6" />
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
            <ul className="space-y-2">
              <li>
                <a
                  href="https://instagram.com/salvapasti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  Instagram: @salvapasti
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@salvapasti.it"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                    <path d="M22 7l-8.97 5.7a1.93 1.93 0 0 1-2.06 0L2 7" />
                  </svg>
                  Email: info@salvapasti.it
                </a>
              </li>
            </ul>
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
