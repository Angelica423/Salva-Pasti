import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  reservationId: string;
  pickupCode: string;
  size?: number;
};

export function pickupUrl(reservationId: string, pickupCode: string) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://salvapasti.lovable.app";
  return `${origin}/ritiro?id=${encodeURIComponent(reservationId)}&code=${encodeURIComponent(pickupCode)}`;
}

export function ReservationQr({ reservationId, pickupCode, size = 160 }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(pickupUrl(reservationId, pickupCode), {
      width: size * 2,
      margin: 1,
      color: { dark: "#1f2937", light: "#ffffff" },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl(null);
      });
    return () => {
      active = false;
    };
  }, [reservationId, pickupCode, size]);

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4">
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`Codice QR della prenotazione ${pickupCode}`}
          width={size}
          height={size}
          className="rounded-lg"
        />
      ) : (
        <div
          className="animate-pulse rounded-lg bg-muted"
          style={{ width: size, height: size }}
          aria-hidden
        />
      )}
      <p className="font-mono text-sm font-semibold tracking-widest text-foreground">
        {pickupCode}
      </p>
      <p className="max-w-[200px] text-center text-xs text-muted-foreground">
        Mostra questo codice QR al locale: lo scansiona per confermare la consegna.
      </p>
    </div>
  );
}
