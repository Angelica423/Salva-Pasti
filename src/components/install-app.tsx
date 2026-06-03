import { useEffect, useState, useCallback } from "react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS
    // @ts-expect-error - iOS-only property
    window.navigator.standalone === true
  );
}

export function useInstallApp() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [installed, setInstalled] = useState(false);
  const [open, setOpen] = useState(false);
  const [forcedPlatform, setForcedPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      setOpen(false);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const trigger = useCallback(
    async (preferred?: Platform) => {
      if (preferred) setForcedPlatform(preferred);
      if (deferred && (!preferred || preferred === "android" || preferred === "desktop")) {
        try {
          await deferred.prompt();
          await deferred.userChoice;
          setDeferred(null);
          return;
        } catch {
          // fall through to instructions
        }
      }
      setOpen(true);
    },
    [deferred]
  );

  return {
    platform: forcedPlatform ?? platform,
    installed,
    canPromptNative: !!deferred,
    open,
    setOpen,
    trigger,
  };
}

export function InstallInstructionsModal({
  open,
  onClose,
  platform,
}: {
  open: boolean;
  onClose: () => void;
  platform: Platform;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Aggiungi Salva Pasti alla schermata Home"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
              Installa Salva Pasti
            </p>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground">
              Aggiungi alla schermata Home
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {platform === "ios" ? (
          <ol className="mt-5 space-y-3 text-sm leading-relaxed text-foreground">
            <li>
              <strong>1.</strong> Tocca l'icona <strong>Condividi</strong>{" "}
              <span aria-hidden>⬆️</span> nella barra di Safari.
            </li>
            <li>
              <strong>2.</strong> Scorri e seleziona{" "}
              <strong>"Aggiungi alla schermata Home"</strong>.
            </li>
            <li>
              <strong>3.</strong> Tocca <strong>Aggiungi</strong> in alto a destra.
            </li>
          </ol>
        ) : platform === "android" ? (
          <ol className="mt-5 space-y-3 text-sm leading-relaxed text-foreground">
            <li>
              <strong>1.</strong> Tocca il menu <strong>⋮</strong> in alto a destra in Chrome.
            </li>
            <li>
              <strong>2.</strong> Scegli <strong>"Installa app"</strong> o{" "}
              <strong>"Aggiungi a schermata Home"</strong>.
            </li>
            <li>
              <strong>3.</strong> Conferma con <strong>Installa</strong>.
            </li>
          </ol>
        ) : (
          <ol className="mt-5 space-y-3 text-sm leading-relaxed text-foreground">
            <li>
              <strong>1.</strong> Apri questa pagina su <strong>Chrome</strong> o{" "}
              <strong>Edge</strong>.
            </li>
            <li>
              <strong>2.</strong> Clicca l'icona <strong>Installa</strong>{" "}
              <span aria-hidden>⊕</span> nella barra degli indirizzi.
            </li>
            <li>
              <strong>3.</strong> Conferma con <strong>Installa</strong>.
            </li>
          </ol>
        )}

        <p className="mt-5 text-xs text-muted-foreground">
          L'app si apre a tutto schermo, è più rapida da aprire e funziona anche con segnale scarso.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
        >
          Ho capito
        </button>
      </div>
    </div>
  );
}
