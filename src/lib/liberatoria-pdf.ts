import { jsPDF } from "jspdf";

export type LiberatoriaData = {
  reserverName: string;
  reserverEmail: string;
  reserverRole: string;
  restaurantName: string;
  address: string;
  portions: number;
  pickupCode: string;
  pickupFrom: string;
  pickupTo: string;
  foodTags?: string[];
};

export function generateLiberatoriaPdf(d: LiberatoriaData): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 56;
  const now = new Date();
  const stamp = now.toLocaleString("it-IT");

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Liberatoria di ritiro", M, 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text("Salvapasti — recupero alimentare solidale", M, 96);
  doc.setTextColor(0);

  // Divider
  doc.setDrawColor(220);
  doc.line(M, 112, W - M, 112);

  // Body intro
  doc.setFontSize(11);
  const intro =
    "Il sottoscritto, identificato in calce, dichiara di ritirare a titolo " +
    "gratuito le eccedenze alimentari descritte di seguito ai sensi della " +
    "Legge 19 agosto 2016, n. 166 (cd. Legge Gadda), sollevando il donatore " +
    "da ogni responsabilità relativa alla conservazione e al consumo " +
    "successivi al momento del ritiro.";
  const lines = doc.splitTextToSize(intro, W - M * 2);
  doc.text(lines, M, 140);

  // Section: dettagli ritiro
  let y = 140 + lines.length * 14 + 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Dettagli del ritiro", M, y);
  y += 8;
  doc.setDrawColor(230);
  doc.line(M, y, W - M, y);
  y += 18;

  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(label, M, y);
    doc.setFont("helvetica", "normal");
    const v = doc.splitTextToSize(value || "—", W - M * 2 - 140);
    doc.text(v, M + 140, y);
    y += Math.max(16, v.length * 14);
  };

  row("Codice ritiro", d.pickupCode);
  row("Donatore", d.restaurantName);
  row("Indirizzo", d.address);
  row("Porzioni", String(d.portions));
  row(
    "Finestra ritiro",
    `${new Date(d.pickupFrom).toLocaleString("it-IT")} → ${new Date(
      d.pickupTo,
    ).toLocaleString("it-IT")}`,
  );
  if (d.foodTags && d.foodTags.length) row("Caratteristiche", d.foodTags.join(", "));

  // Section: ricevente
  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Ricevente", M, y);
  y += 8;
  doc.line(M, y, W - M, y);
  y += 18;
  row("Nome / Ente", d.reserverName);
  row("Email", d.reserverEmail);
  row("Ruolo", d.reserverRole);

  // Dichiarazioni
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Dichiarazioni", M, y);
  y += 8;
  doc.line(M, y, W - M, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const decls = [
    "1. Di aver ricevuto gratuitamente i prodotti alimentari sopra descritti.",
    "2. Di averne verificato l'integrità apparente e l'idoneità al consumo al momento del ritiro.",
    "3. Di assumersi ogni responsabilità per la corretta conservazione, trasporto e distribuzione successivi.",
    "4. Di sollevare il donatore e la piattaforma Salvapasti da qualunque responsabilità civile e penale derivante dall'uso successivo al ritiro.",
    "5. Di trattare gli eventuali dati personali nel rispetto del Reg. UE 2016/679 (GDPR).",
  ];
  decls.forEach((t) => {
    const l = doc.splitTextToSize(t, W - M * 2);
    doc.text(l, M, y);
    y += l.length * 14 + 4;
  });

  // Firma digitale
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Conferma digitale al ritiro:", M, y);
  doc.setFont("helvetica", "normal");
  y += 14;
  doc.text(`Accettata il ${stamp}`, M, y);
  y += 14;
  doc.text(`Da: ${d.reserverName} <${d.reserverEmail}>`, M, y);
  y += 14;
  doc.text(`Riferimento univoco: ${d.pickupCode}-${now.getTime()}`, M, y);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text(
    "Documento generato automaticamente da Salvapasti — non richiede firma autografa.",
    M,
    doc.internal.pageSize.getHeight() - 32,
  );

  return doc;
}

export function downloadLiberatoria(d: LiberatoriaData) {
  const doc = generateLiberatoriaPdf(d);
  doc.save(`liberatoria-${d.pickupCode}.pdf`);
}
