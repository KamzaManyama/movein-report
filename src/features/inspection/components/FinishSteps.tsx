import { useState } from "react";
import { Download, FileText, Loader2, Plus, Share2, Trash2 } from "lucide-react";
import type { InspectionController } from "@/hooks/use-inspection";
import { deletePhotos, getPhoto } from "@/db/inspection.repository";
import {
  btnIconDanger,
  btnPrimary,
  btnSecondary,
  btnSmall,
} from "@/components/layout/button-styles";
import { buildReportModel, generateReportPdf, reportFileName } from "@/services/pdf.service";
import { canShareFiles, downloadBlob, shareFile } from "@/services/share.service";
import { newId } from "@/utils/id";
import type { MeterKind, MeterReading } from "../inspection.types";
import { METER_LABELS } from "../inspection.constants";
import { getInspectionIssues } from "../inspection.validation";
import { Field, StepHeading } from "./Field";
import { PhotoPicker } from "./PhotoPicker";

const METER_TEXT_FIELDS: {
  key: "label" | "value" | "meterNumber";
  label: string;
  optional?: boolean;
}[] = [
  { key: "label", label: "Meter name" },
  { key: "value", label: "Reading" },
  { key: "meterNumber", label: "Meter number", optional: true },
];

export function MetersStep({ c }: { c: InspectionController }) {
  const { inspection } = c;
  const patch = (id: string, fn: (m: MeterReading) => MeterReading) =>
    c.update((i) => ({ ...i, meters: i.meters.map((m) => (m.id === id ? fn(m) : m)) }));

  function add(kind: MeterKind) {
    const meter: MeterReading = {
      id: newId(),
      kind,
      label: "",
      value: "",
      meterNumber: "",
      notes: "",
      photoIds: [],
    };
    c.update((i) => ({ ...i, meters: [...i.meters, meter] }));
  }

  function remove(m: MeterReading) {
    c.update((i) => ({ ...i, meters: i.meters.filter((x) => x.id !== m.id) }));
    void deletePhotos(m.photoIds).catch(() => undefined);
  }

  return (
    <>
      <StepHeading
        title="Meter readings"
        description="Optional. Record prepaid or municipal meter readings so there's no dispute about usage."
      />
      <div className="space-y-5">
        {inspection.meters.map((m) => (
          <div key={m.id} className="space-y-5 rounded-[var(--radius)] border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="font-medium">{METER_LABELS[m.kind]}</p>
              <button
                type="button"
                onClick={() => remove(m)}
                aria-label={`Remove ${METER_LABELS[m.kind]} meter`}
                className={`${btnIconDanger} -my-2 -mr-2`}
              >
                <Trash2 className="size-5" aria-hidden />
              </button>
            </div>
            {METER_TEXT_FIELDS.filter((f) => f.key !== "label" || m.kind === "other").map((f) => (
              <Field
                key={f.key}
                id={`meter-${m.id}-${f.key}`}
                label={f.label}
                optional={f.optional}
              >
                <input
                  id={`meter-${m.id}-${f.key}`}
                  className="field-input"
                  maxLength={60}
                  value={m[f.key]}
                  onChange={(e) => {
                    const value = e.target.value;
                    patch(m.id, (x) => ({ ...x, [f.key]: value }));
                  }}
                />
              </Field>
            ))}
            <Field id={`meter-${m.id}-notes`} label="Notes" optional>
              <textarea
                id={`meter-${m.id}-notes`}
                rows={2}
                maxLength={1000}
                className="field-input"
                value={m.notes}
                onChange={(e) => {
                  const notes = e.target.value;
                  patch(m.id, (x) => ({ ...x, notes }));
                }}
              />
            </Field>
            <PhotoPicker
              inspectionId={inspection.id}
              photoIds={m.photoIds}
              label="Meter photos"
              onAdd={(id) => patch(m.id, (x) => ({ ...x, photoIds: [...x.photoIds, id] }))}
              onRemove={(id) =>
                patch(m.id, (x) => ({ ...x, photoIds: x.photoIds.filter((p) => p !== id) }))
              }
            />
          </div>
        ))}
        <div className="flex flex-col gap-3 sm:flex-row">
          {(Object.keys(METER_LABELS) as MeterKind[]).map((kind) => (
            <button key={kind} type="button" onClick={() => add(kind)} className={btnSmall}>
              <Plus className="size-4" aria-hidden /> {METER_LABELS[kind]}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function ReviewStep({ c }: { c: InspectionController }) {
  const { inspection } = c;
  const model = buildReportModel(inspection);
  const issues = getInspectionIssues(inspection);
  const [state, setState] = useState<"idle" | "working" | "ready" | "error">("idle");
  const [file, setFile] = useState<File | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const summary: [string, number][] = [
    ["Areas inspected", model.included.length],
    ["Inaccessible areas", model.inaccessible.length],
    ["Defects recorded", model.defectCount],
    ["Photos attached", model.photoCount],
    ["Meter readings", model.meters.length],
  ];

  async function generate() {
    setState("working");
    try {
      await c.flush();
      const blob = await generateReportPdf(inspection, getPhoto);
      setFile(new File([blob], reportFileName(inspection), { type: "application/pdf" }));
      c.update((i) => ({ ...i, status: "completed", reportGeneratedAt: new Date().toISOString() }));
      setState("ready");
    } catch {
      setState("error");
    }
  }

  async function share() {
    if (!file) return;
    setShareError(null);
    try {
      await shareFile(file, model.title, `${model.title} — ${inspection.reference}`);
    } catch {
      setShareError("Sharing failed. Download the report and send it manually.");
    }
  }

  return (
    <>
      <StepHeading
        title="Review and generate your report"
        description={`Reference ${inspection.reference}`}
      />
      <div className="space-y-8">
        <dl className="divide-y divide-border rounded-[var(--radius)] border border-border">
          {model.details.map((d) => (
            <div key={d.label} className="flex justify-between gap-4 px-4 py-3.5 text-[15px]">
              <dt className="shrink-0 text-muted-foreground">{d.label}</dt>
              <dd className="text-right">{d.value}</dd>
            </div>
          ))}
        </dl>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {summary.map(([label, value]) => (
            <div
              key={label}
              className="rounded-[var(--radius)] border border-border bg-surface p-4"
            >
              <dd className="text-2xl font-semibold">{value}</dd>
              <dt className="mt-1 text-sm text-soft-foreground">{label}</dt>
            </div>
          ))}
        </dl>

        {issues.length > 0 && (
          <div className="rounded-[var(--radius)] border border-border p-5">
            <p className="text-[15px] font-medium">
              {issues.length} {issues.length === 1 ? "item is" : "items are"} incomplete
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              You can still generate the report. Anything unrecorded is shown as "Not recorded".
            </p>
            <ul className="mt-4 space-y-2">
              {issues.map((issue) => (
                <li
                  key={`${issue.kind}-${issue.areaId ?? ""}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-soft-foreground">{issue.message}</span>
                  <button
                    type="button"
                    className={`${btnSmall} h-11 shrink-0`}
                    onClick={() =>
                      c.update((i) => ({
                        ...i,
                        step: issue.areaId ? 4 : 2,
                        currentAreaId: issue.areaId ?? i.currentAreaId,
                      }))
                    }
                  >
                    Fix
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          {state === "ready" && file ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => downloadBlob(file, file.name)}
                className={btnPrimary}
              >
                <Download className="size-4" aria-hidden /> Download PDF
              </button>
              {canShareFiles(file) && (
                <button type="button" onClick={() => void share()} className={btnSecondary}>
                  <Share2 className="size-4" aria-hidden /> Share
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void generate()}
              disabled={state === "working"}
              className={`${btnPrimary} w-full sm:w-auto`}
            >
              {state === "working" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <FileText className="size-4" aria-hidden />
              )}
              {state === "working" ? "Generating…" : "Generate PDF report"}
            </button>
          )}
          {state === "ready" && (
            <p className="text-sm text-soft-foreground">Your report is ready: {file?.name}</p>
          )}
          {state === "error" && (
            <p className="text-sm text-destructive" role="alert">
              The report could not be generated. Please try again.
            </p>
          )}
          {shareError && (
            <p className="text-sm text-destructive" role="alert">
              {shareError}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
