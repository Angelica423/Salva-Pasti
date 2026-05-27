import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "salvapasti:proximity-enabled";
const RADIUS_METERS = 500;

type Box = { id: string; restaurant_name: string; lat: number; lng: number; status: string };

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function ProximityNotifier() {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<string>("");
  const watchId = useRef<number | null>(null);
  const notified = useRef<Set<string>>(new Set());
  const lastPos = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) === "1") setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      return;
    }

    if (!("Notification" in window) || !("geolocation" in navigator)) {
      setStatus("Il tuo browser non supporta notifiche o geolocalizzazione.");
      setEnabled(false);
      return;
    }

    const start = async () => {
      let perm = Notification.permission;
      if (perm === "default") perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus("Notifiche non autorizzate.");
        setEnabled(false);
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      setStatus("Notifiche attive · ti avvisiamo se un box è entro 500 m");

      const checkProximity = async (lat: number, lng: number) => {
        const { data } = await supabase
          .from("food_boxes")
          .select("id, restaurant_name, lat, lng, status")
          .eq("status", "available");
        for (const b of (data ?? []) as Box[]) {
          const d = distanceMeters(lat, lng, b.lat, b.lng);
          if (d <= RADIUS_METERS && !notified.current.has(b.id)) {
            notified.current.add(b.id);
            new Notification("Box vicina a te 🍽️", {
              body: `${b.restaurant_name} · ${Math.round(d)} m da te`,
              tag: `box-${b.id}`,
            });
          }
        }
      };

      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          lastPos.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          checkProximity(pos.coords.latitude, pos.coords.longitude);
        },
        () => setStatus("Posizione non disponibile."),
        { enableHighAccuracy: false, maximumAge: 60_000 },
      );
    };

    void start();

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [enabled]);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    if (next) localStorage.setItem(STORAGE_KEY, "1");
    else {
      localStorage.removeItem(STORAGE_KEY);
      setStatus("");
      notified.current.clear();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-[260px] rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
      <div className="flex items-start gap-2">
        <span className="text-lg leading-none">📍</span>
        <div className="flex-1">
          <p className="text-xs font-semibold text-foreground">Avvisi di prossimità</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            {status || "Ti avvisiamo quando una box è entro 500 m da te."}
          </p>
          <button
            onClick={toggle}
            className={`mt-2 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
              enabled
                ? "bg-sage text-white hover:bg-sage/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {enabled ? "Attive · disattiva" : "Attiva notifiche"}
          </button>
        </div>
      </div>
    </div>
  );
}
