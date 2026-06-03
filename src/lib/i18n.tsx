import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const LANGUAGES = [
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ro", label: "Română", flag: "🇷🇴" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "uk", label: "Українська", flag: "🇺🇦" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

type Dict = Record<string, string>;

const it: Dict = {
  "nav.howItWorks": "Come funziona",
  "nav.map": "Mappa",
  "nav.associations": "Associazioni",
  "nav.suspended": "Box sospesa",
  "nav.reservations": "Le mie prenotazioni",
  "nav.download": "Scarica l'app",
  "nav.join": "Unisciti a noi",
  "lang.label": "Lingua",
  "hero.tagline": "Solidarietà alimentare · Italia",
  "hero.findFood": "Trova cibo vicino a me",
  "hero.discover": "Scopri il progetto",
  "common.online": "Aggiornato in tempo reale",
  "common.offline": "Modalità offline · dati in cache",
  "filters.title": "Filtra per tipo di cibo",
  "filters.all": "Tutti",
  "filters.clear": "Pulisci",
};

const en: Dict = {
  "nav.howItWorks": "How it works",
  "nav.map": "Map",
  "nav.associations": "Associations",
  "nav.suspended": "Suspended box",
  "nav.reservations": "My reservations",
  "nav.download": "Get the app",
  "nav.join": "Join us",
  "lang.label": "Language",
  "hero.tagline": "Food solidarity · Italy",
  "hero.findFood": "Find food near me",
  "hero.discover": "Discover the project",
  "common.online": "Live updates",
  "common.offline": "Offline mode · cached data",
  "filters.title": "Filter by food type",
  "filters.all": "All",
  "filters.clear": "Clear",
};

const ro: Dict = {
  "nav.howItWorks": "Cum funcționează",
  "nav.map": "Hartă",
  "nav.associations": "Asociații",
  "nav.suspended": "Cutie suspendată",
  "nav.reservations": "Rezervările mele",
  "nav.download": "Descarcă aplicația",
  "nav.join": "Alătură-te",
  "lang.label": "Limbă",
  "hero.tagline": "Solidaritate alimentară · Italia",
  "hero.findFood": "Găsește mâncare aproape",
  "hero.discover": "Descoperă proiectul",
  "common.online": "Actualizat în timp real",
  "common.offline": "Mod offline · date din memorie",
  "filters.title": "Filtrează după tipul de mâncare",
  "filters.all": "Toate",
  "filters.clear": "Șterge",
};

const ar: Dict = {
  "nav.howItWorks": "كيف يعمل",
  "nav.map": "الخريطة",
  "nav.associations": "الجمعيات",
  "nav.suspended": "صندوق معلّق",
  "nav.reservations": "حجوزاتي",
  "nav.download": "حمّل التطبيق",
  "nav.join": "انضم إلينا",
  "lang.label": "اللغة",
  "hero.tagline": "تضامن غذائي · إيطاليا",
  "hero.findFood": "ابحث عن طعام قريب منك",
  "hero.discover": "اكتشف المشروع",
  "common.online": "تحديث مباشر",
  "common.offline": "وضع غير متصل · بيانات محفوظة",
  "filters.title": "تصفية حسب نوع الطعام",
  "filters.all": "الكل",
  "filters.clear": "مسح",
};

const uk: Dict = {
  "nav.howItWorks": "Як це працює",
  "nav.map": "Мапа",
  "nav.associations": "Організації",
  "nav.suspended": "Підвішена коробка",
  "nav.reservations": "Мої бронювання",
  "nav.download": "Завантажити застосунок",
  "nav.join": "Приєднатися",
  "lang.label": "Мова",
  "hero.tagline": "Харчова солідарність · Італія",
  "hero.findFood": "Знайти їжу поруч",
  "hero.discover": "Дізнатися більше",
  "common.online": "Оновлення в реальному часі",
  "common.offline": "Офлайн · збережені дані",
  "filters.title": "Фільтр за типом їжі",
  "filters.all": "Усі",
  "filters.clear": "Очистити",
};

const DICTS: Record<LangCode, Dict> = { it, en, ro, ar, uk };

const RTL: LangCode[] = ["ar"];
const STORAGE_KEY = "salvapasti:lang";

type Ctx = {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("it");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LangCode | null;
      if (saved && DICTS[saved]) {
        setLangState(saved);
        return;
      }
      const nav = (typeof navigator !== "undefined" ? navigator.language : "it").slice(0, 2).toLowerCase();
      if (DICTS[nav as LangCode]) setLangState(nav as LangCode);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL.includes(lang) ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string) => DICTS[lang][key] ?? DICTS.it[key] ?? key,
    [lang],
  );

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t, dir: RTL.includes(lang) ? "rtl" : "ltr" }),
    [lang, setLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback so components rendered outside provider (e.g. tests) still work
    return {
      lang: "it" as LangCode,
      setLang: () => {},
      t: (key: string) => DICTS.it[key] ?? key,
      dir: "ltr" as const,
    };
  }
  return ctx;
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <label className={`inline-flex items-center gap-1 ${className}`}>
      <span className="sr-only">Lingua</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as LangCode)}
        aria-label="Lingua"
        className="cursor-pointer rounded-full border border-border bg-background px-2 py-1 text-xs font-medium text-foreground transition-colors hover:border-foreground/40"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
