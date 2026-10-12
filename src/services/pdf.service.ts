import type { Inspection, InspectionArea, Photo } from "@/features/inspection/inspection.types";
import {
  CONDITION_LABELS,
  INSPECTION_TYPE_LABELS,
  METER_LABELS,
  RENTAL_TYPE_LABELS,
} from "@/features/inspection/inspection.constants";

export interface ReportModel {
  reference: string;
  title: string;
  typeLabel: string;
  rentalLabel: string;
  details: { label: string; value: string }[];
  included: InspectionArea[];
  inaccessible: InspectionArea[];
  notApplicable: InspectionArea[];
  notRecorded: InspectionArea[];
  defectCount: number;
  photoCount: number;
  meters: Inspection["meters"];
}

/** Pure description of what the PDF contains — easy to test, used by the renderer. */
export function buildReportModel(ins: Inspection): ReportModel {
  const d = ins.details;
  const details = [
    { label: "Reference", value: ins.reference },
    {
      label: "Inspection type",
      value: ins.inspectionType ? INSPECTION_TYPE_LABELS[ins.inspectionType] : "Not set",
    },
    {
      label: "Accommodation",
      value: ins.rentalType ? RENTAL_TYPE_LABELS[ins.rentalType] : "Not set",
    },
    { label: "Inspection date", value: d.inspectionDate },
    { label: "Property", value: d.address || "Not provided" },
    { label: "Room", value: d.roomIdentifier || "Not provided" },
    ...(d.tenantName ? [{ label: "Tenant", value: d.tenantName }] : []),
    ...(d.landlordName ? [{ label: "Landlord / agent", value: d.landlordName }] : []),
    ...(d.landlordContact ? [{ label: "Landlord / agent contact", value: d.landlordContact }] : []),
  ];
  const included = ins.areas.filter((a) => a.availability === "included");
  const photoCount =
    ins.areas.reduce(
      (n, a) => n + a.photoIds.length + a.defects.reduce((m, x) => m + x.photoIds.length, 0),
      0,
    ) + ins.meters.reduce((n, m) => n + m.photoIds.length, 0);
  return {
    reference: ins.reference,
    title: ins.inspectionType ? INSPECTION_TYPE_LABELS[ins.inspectionType] : "Inspection report",
    typeLabel: ins.inspectionType ? INSPECTION_TYPE_LABELS[ins.inspectionType] : "",
    rentalLabel: ins.rentalType ? RENTAL_TYPE_LABELS[ins.rentalType] : "",
    details,
    included,
    inaccessible: ins.areas.filter((a) => a.availability === "inaccessible"),
    notApplicable: ins.areas.filter((a) => a.availability === "not-applicable"),
    notRecorded: included.filter((a) => a.condition === null),
    defectCount: ins.areas.reduce((n, a) => n + a.defects.length, 0),
    photoCount,
    meters: ins.meters,
  };
}

export function reportFileName(ins: Inspection): string {
  return `MoveIn-Report-${ins.reference}.pdf`;
}

type PhotoLoader = (id: string) => Promise<Photo | undefined>;

const PAGE_W = 210;
const PAGE_H = 297;
const M = 16;
const CONTENT_W = PAGE_W - M * 2;
const INK = 17;
const SOFT = 85;
const MUTED = 119;
const RULE = 229;

export async function generateReportPdf(ins: Inspection, loadPhoto: PhotoLoader): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const model = buildReportModel(ins);
  let y = M;

  const bottom = PAGE_H - M - 6;
  const newPage = () => {
    doc.addPage();
    y = M + 10;
  };
  const ensure = (h: number) => {
    if (y + h > bottom) newPage();
  };
  const text = (
    s: string,
    size: number,
    opts: { bold?: boolean; color?: number; gap?: number; x?: number; w?: number } = {},
  ) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(opts.color ?? INK);
    const lines = doc.splitTextToSize(s, opts.w ?? CONTENT_W) as string[];
    const lh = size * 0.42;
    for (const line of lines) {
      ensure(lh);
      doc.text(line, opts.x ?? M, y + lh * 0.8);
      y += lh;
    }
    y += opts.gap ?? 1.5;
  };
  const rule = () => {
    doc.setDrawColor(RULE);
    doc.setLineWidth(0.25);
    doc.line(M, y, PAGE_W - M, y);
    y += 4;
  };
  const sectionTitle = (s: string) => {
    ensure(16);
    y += 3;
    text(s, 13, { bold: true, gap: 1 });
    rule();
  };

  const photoGrid = async (ids: string[], label: string) => {
    if (!ids.length) return;
    const gap = 5;
    const cellW = (CONTENT_W - gap) / 2;
    const maxH = 68;
    for (let i = 0; i < ids.length; i += 2) {
      const row = await Promise.all(
        ids.slice(i, i + 2).map((id) => loadPhoto(id).catch(() => undefined)),
      );
      const sizes = row.map((p) => {
        if (!p) return { w: cellW, h: 14 };
        const r = p.width / p.height;
        let w = cellW;
        let h = w / r;
        if (h > maxH) {
          h = maxH;
          w = h * r;
        }
        return { w, h };
      });
      const rowH = Math.max(...sizes.map((s) => s.h)) + 6;
      ensure(rowH);
      for (let j = 0; j < row.length; j++) {
        const p = row[j];
        const x = M + j * (cellW + gap);
        const n = i + j + 1;
        if (p) {
          const bytes = new Uint8Array(await p.blob.arrayBuffer());
          doc.addImage(bytes, "JPEG", x, y, sizes[j]!.w, sizes[j]!.h, undefined, "FAST");
        } else {
          doc.setDrawColor(RULE);
          doc.rect(x, y, cellW, 14);
          doc.setFontSize(8);
          doc.setTextColor(MUTED);
          doc.text("Photo unavailable on this device", x + 3, y + 8);
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(MUTED);
        doc.text(`${label} — photo ${n}`, x, y + sizes[j]!.h + 4);
      }
      y += rowH + 2;
    }
  };

  // Cover header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(INK);
  doc.text("MoveIn Report", M, y + 4);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(MUTED);
  doc.text(model.reference, PAGE_W - M, y + 4, { align: "right" });
  y += 9;
  rule();
  y += 4;
  text(model.title, 24, { bold: true, gap: 2 });
  text(`${model.rentalLabel} · ${ins.details.address} · ${ins.details.roomIdentifier}`, 11, {
    color: SOFT,
    gap: 8,
  });

  // Details table
  for (const row of model.details) {
    ensure(8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    doc.text(row.label, M, y + 4);
    const startY = y;
    text(row.value, 10, { x: M + 52, w: CONTENT_W - 52, gap: 0 });
    y = Math.max(y, startY + 6) + 1.5;
  }

  // Summary
  sectionTitle("Summary");
  const summary: [string, string][] = [
    ["Areas inspected", String(model.included.length)],
    ["Inaccessible areas", String(model.inaccessible.length)],
    ["Not applicable", String(model.notApplicable.length)],
    ["Defects recorded", String(model.defectCount)],
    ["Photos attached", String(model.photoCount)],
  ];
  for (const [k, v] of summary) {
    ensure(6);
    doc.setFontSize(10);
    doc.setTextColor(SOFT);
    doc.setFont("helvetica", "normal");
    doc.text(k, M, y + 4);
    doc.setTextColor(INK);
    doc.setFont("helvetica", "bold");
    doc.text(v, M + 60, y + 4);
    y += 6;
  }
  if (model.notRecorded.length) {
    y += 2;
    text(`No condition was recorded for: ${model.notRecorded.map((a) => a.name).join(", ")}.`, 9, {
      color: SOFT,
    });
  }

  // Area records
  sectionTitle("Area-by-area record");
  for (const a of model.included) {
    ensure(22);
    text(a.name, 12, { bold: true, gap: 0.5 });
    text(
      [a.group, a.shared ? "Shared facility — not exclusively used by the tenant" : null]
        .filter(Boolean)
        .join(" · "),
      8.5,
      { color: MUTED, gap: 1.5 },
    );
    text(`Condition: ${a.condition ? CONDITION_LABELS[a.condition] : "Not recorded"}`, 10, {
      gap: 1,
    });
    if (a.notes.trim()) text(a.notes.trim(), 10, { color: SOFT, gap: 2 });
    await photoGrid(a.photoIds, a.name);
    for (let i = 0; i < a.defects.length; i++) {
      const d = a.defects[i]!;
      ensure(14);
      text(`Defect ${i + 1}: ${d.description}`, 10, {
        bold: true,
        gap: 0.5,
        x: M + 4,
        w: CONTENT_W - 4,
      });
      text(`Classification: ${CONDITION_LABELS[d.condition]}`, 9, {
        color: SOFT,
        gap: 0.5,
        x: M + 4,
        w: CONTENT_W - 4,
      });
      if (d.notes.trim())
        text(d.notes.trim(), 9.5, { color: SOFT, gap: 1.5, x: M + 4, w: CONTENT_W - 4 });
      await photoGrid(d.photoIds, `Defect ${i + 1}`);
    }
    y += 2;
    rule();
  }

  if (model.inaccessible.length || model.notApplicable.length) {
    sectionTitle("Areas not inspected");
    if (model.inaccessible.length)
      text(`Inaccessible: ${model.inaccessible.map((a) => a.name).join(", ")}`, 10, { gap: 2 });
    if (model.notApplicable.length)
      text(`Not applicable: ${model.notApplicable.map((a) => a.name).join(", ")}`, 10, {
        color: SOFT,
      });
  }

  if (model.meters.length) {
    sectionTitle("Meter readings");
    for (const m of model.meters) {
      ensure(14);
      text(
        `${m.kind === "other" && m.label ? m.label : METER_LABELS[m.kind]}: ${m.value || "Not recorded"}`,
        11,
        { bold: true, gap: 0.5 },
      );
      if (m.meterNumber) text(`Meter number: ${m.meterNumber}`, 9, { color: SOFT, gap: 0.5 });
      if (m.notes.trim()) text(m.notes.trim(), 9.5, { color: SOFT, gap: 1.5 });
      await photoGrid(m.photoIds, METER_LABELS[m.kind]);
      y += 2;
    }
  }

  sectionTitle("About this report");
  text(
    `This report was generated on ${new Date().toLocaleString("en-ZA")} by the tenant using MoveIn Report. Dates reflect when information was recorded in the app; photos are not independently verified. This report is a personal record and does not constitute legal certification.`,
    9,
    { color: SOFT },
  );

  // Running headers & page numbers
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    if (p > 1) {
      doc.text(`MoveIn Report · ${model.title}`, M, M);
      doc.text(model.reference, PAGE_W - M, M, { align: "right" });
      doc.setDrawColor(RULE);
      doc.line(M, M + 2.5, PAGE_W - M, M + 2.5);
    }
    doc.text(model.reference, M, PAGE_H - 9);
    doc.text(`Page ${p} of ${pages}`, PAGE_W - M, PAGE_H - 9, { align: "right" });
  }

  return doc.output("blob");
}
