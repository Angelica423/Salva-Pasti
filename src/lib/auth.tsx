import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profilo = {
  id: string;
  phone: string;
  nome: string | null;
  ruolo: "ristoratore" | "associazione" | "volontario" | "cittadino";
};

/** Sessione dell'utente verificato via SMS (null = non verificato). */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, loading, verificato: !!session };
}

/** Profilo dell'utente corrente (nome + ruolo), letto dal database. */
export function useProfilo(session: Session | null) {
  const [profilo, setProfilo] = useState<Profilo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) {
      setProfilo(null);
      return;
    }
    let annullato = false;
    setLoading(true);
    supabase
      .from("profiles")
      .select("id, phone, nome, ruolo")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (annullato) return;
        setProfilo((data as Profilo | null) ?? null);
        setLoading(false);
      });
    return () => {
      annullato = true;
    };
  }, [session]);

  return { profilo, loading, setProfilo };
}

/** Normalizza un numero italiano/internazionale in formato E.164. */
export function normalizzaTelefono(input: string): string | null {
  const pulito = input.replace(/[\s\-().]/g, "");
  if (/^\+[1-9]\d{7,14}$/.test(pulito)) return pulito;
  if (/^3\d{8,9}$/.test(pulito)) return `+39${pulito}`;
  if (/^0039\d{8,12}$/.test(pulito)) return `+${pulito.slice(2)}`;
  return null;
}
