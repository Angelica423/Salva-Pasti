import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import heroFood from "../assets/hero-food.jpg";
import { UtensilsCrossed, Users, Handshake, ShieldCheck } from "lucide-react";

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
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-sm font-bold">SP</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Salva Pasti
          </span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#come-funziona"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Come funziona
          </a>
          <a
            href="#per-chi"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Per chi è
          </a>
          <a
            href="#contatti"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Contatti
          </a>
          <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20">
            Unisciti a noi
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroFood}
          alt="Tavola italiana ricca di cibo fresco"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "var(--hero-overlay)" }}
        />
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
            Salva Pasti connette ristoranti, sale ricevimenti e negozi con le
            associazioni del territorio. In tempo reale, gratuitamente, con
            dignità.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#come-funziona"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              Scopri il progetto
            </a>
            <a
              href="#per-chi"
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-8 py-3.5 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Unisciti a noi
            </a>
          </div>
        </motion.div>
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
              <p
                className="text-4xl font-bold tracking-tight sm:text-5xl"
                style={{ color: "var(--terracotta)" }}
              >
                {stat.value}
              </p>
              <p className="mt-2 text-sm leading-snug text-muted-foreground">
                {stat.label}
              </p>
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
            Tre passi.{" "}
            <em className="font-serif italic text-sage">Nessuna burocrazia.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Un sistema semplice che trasforma lo spreco quotidiano in una
            risorsa concreta, distribuita con cura dalle associazioni del tuo
            territorio.
          </p>
        </AnimatedSection>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <AnimatedSection key={i}>
              <div className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-terracotta/30 hover:shadow-lg hover:shadow-terracotta/5">
                <span
                  className="mb-6 block text-5xl font-bold tracking-tighter text-muted-foreground/30 transition-colors group-hover:text-terracotta/40"
                >
                  {step.number}
                </span>
                <h3 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForWho() {
  const cards = [
    {
      role: "Per chi offre",
      title: "Ristoratori & negozi",
      description:
        "Riduci lo spreco, aumenta la visibilità e contribuisci al tuo territorio. Un gesto concreto, senza costi.",
      cta: "Registra la tua attività",
      color: "terracotta",
    },
    {
      role: "Per chi riceve",
      title: "Associazioni & volontari",
      description:
        "Accedi in tempo reale alle box di cibo disponibili nel tuo quartiere. Prenota, ritira, distribuisci.",
      cta: "Diventa partner",
      color: "sage",
    },
  ];

  return (
    <section id="per-chi" className="bg-muted/40 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <AnimatedSection className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Per chi è
          </p>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Una rete per tutti.
          </h2>
        </AnimatedSection>
        <div className="grid gap-8 md:grid-cols-2">
          {cards.map((card, i) => (
            <AnimatedSection key={i}>
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-10">
                <div
                  className="absolute right-0 top-0 h-32 w-32 rounded-bl-full opacity-10"
                  style={{ backgroundColor: `var(--${card.color})` }}
                />
                <p
                  className="mb-4 text-xs font-semibold uppercase tracking-widest"
                  style={{ color: `var(--${card.color})` }}
                >
                  {card.role}
                </p>
                <h3 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
                  {card.title}
                </h3>
                <p className="mb-8 text-base leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
                <button
                  className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: `var(--${card.color})` }}
                >
                  {card.cta}
                </button>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden py-28">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--espresso)" }}
      />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-terracotta/20 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-sage/20 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <AnimatedSection>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Pronto a salvare il cibo del tuo territorio?
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/70">
            Unisciti alla rete in pochi minuti. Nessun costo, nessuna
            burocrazia. Solo tante porzioni di cibo che trovano una casa.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20">
              Inizia ora
            </button>
            <button className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10">
              Scopri di più
            </button>
          </div>
        </AnimatedSection>
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-sm font-bold">SP</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Salva Pasti
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Il cibo non si butta. Si condivide.
              <br />
              Una rete italiana contro lo spreco alimentare.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Naviga
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#come-funziona"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Come funziona
                </a>
              </li>
              <li>
                <a
                  href="#per-chi"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Per chi è
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Storia
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Contatti
            </h4>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">
                ciao@salvapasti.it
              </li>
              <li className="text-sm text-muted-foreground">
                Via Roma 1, Milano
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
        <Stats />
        <HowItWorks />
        <ForWho />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
