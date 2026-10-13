import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import type { InspectionController } from "@/hooks/use-inspection";
import { deletePhotos } from "@/db/inspection.repository";
import { btnIconDanger, btnPrimary, btnSmall } from "@/components/layout/button-styles";
import { newId } from "@/utils/id";
import type { Condition, Defect, InspectionArea } from "../inspection.types";
import { defectSchema } from "../inspection.schema";
import { inspectableAreas } from "../inspection.validation";
import { ConditionSelector } from "./ConditionSelector";
import { Field, StepHeading } from "./Field";
import { PhotoPicker } from "./PhotoPicker";

export function InspectStep({ c }: { c: InspectionController }) {
  const { inspection } = c;
  const areas = inspectableAreas(inspection);
  const index = Math.max(
    0,
    areas.findIndex((a) => a.id === inspection.currentAreaId),
  );
  const area = areas[index];

  if (!area) {
    return (
      <StepHeading
        title="Nothing to inspect"
        description="Every area is marked as inaccessible or not applicable. Go back to change this, or continue."
      />
    );
  }

  const select = (id: string) => {
    c.update((i) => ({ ...i, currentAreaId: id }));
    window.scrollTo({ top: 0 });
  };
  const patch = (fn: (a: InspectionArea) => InspectionArea) => c.updateArea(area.id, fn);
  const next = areas[index + 1];
  const prev = areas[index - 1];

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {areas.map((a) => (
          <button
            key={a.id}
            type="button"
            aria-pressed={a.id === area.id}
            onClick={() => select(a.id)}
            className="select-card inline-flex h-12 shrink-0 items-center gap-1.5 rounded-full px-5 text-sm font-medium whitespace-nowrap"
          >
            {a.completed && <Check className="size-4" aria-label="Completed" />}
            {a.name}
          </button>
        ))}
      </div>

      <p className="eyebrow mb-2">
        Area {index + 1} of {areas.length} · {area.group}
      </p>
      <StepHeading
        title={area.name}
        description={area.shared ? "Shared facility — not exclusively used by you." : undefined}
      />

      <div className="space-y-9">
        <div className="space-y-3">
          <p className="text-[15px] font-medium">Overall condition</p>
          <ConditionSelector
            name={`Condition of ${area.name}`}
            value={area.condition}
            onChange={(condition) => patch((a) => ({ ...a, condition }))}
          />
        </div>

        <Field id="area-notes" label="Notes" optional>
          <textarea
            id="area-notes"
            rows={3}
            maxLength={1000}
            className="field-input"
            value={area.notes}
            onChange={(e) => {
              const notes = e.target.value;
              patch((a) => ({ ...a, notes }));
            }}
          />
        </Field>

        <PhotoPicker
          inspectionId={inspection.id}
          photoIds={area.photoIds}
          onAdd={(id) => patch((a) => ({ ...a, photoIds: [...a.photoIds, id] }))}
          onRemove={(id) => patch((a) => ({ ...a, photoIds: a.photoIds.filter((p) => p !== id) }))}
        />

        <Defects key={area.id} inspectionId={inspection.id} area={area} patch={patch} />

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={!prev}
            onClick={() => prev && select(prev.id)}
            className={btnSmall}
          >
            <ChevronLeft className="size-4" aria-hidden /> Previous area
          </button>
          {area.completed ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => patch((a) => ({ ...a, completed: false }))}
                className={btnSmall}
              >
                <Check className="size-4" aria-hidden /> Completed — reopen
              </button>
              {next && (
                <button type="button" onClick={() => select(next.id)} className={btnSmall}>
                  Next area <ChevronRight className="size-4" aria-hidden />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              disabled={area.condition === null}
              onClick={() => {
                patch((a) => ({ ...a, completed: true }));
                if (next) select(next.id);
              }}
              className={btnPrimary}
            >
              <Check className="size-4" aria-hidden />{" "}
              {next ? "Complete and next area" : "Complete area"}
            </button>
          )}
        </div>
        {!area.completed && area.condition === null && (
          <p className="text-sm text-muted-foreground sm:text-right">
            Choose a condition to complete this area.
          </p>
        )}
      </div>
    </>
  );
}

function Defects({
  inspectionId,
  area,
  patch,
}: {
  inspectionId: string;
  area: InspectionArea;
  patch: (fn: (a: InspectionArea) => InspectionArea) => void;
}) {
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const patchDefect = (id: string, fn: (d: Defect) => Defect) =>
    patch((a) => ({ ...a, defects: a.defects.map((d) => (d.id === id ? fn(d) : d)) }));

  function add() {
    const r = defectSchema.safeParse({ description, notes: "" });
    if (!r.success) return setError(r.error.issues[0]?.message ?? "Describe the defect briefly");
    const defect: Defect = {
      id: newId(),
      description: r.data.description,
      notes: "",
      condition: "damaged",
      photoIds: [],
    };
    patch((a) => ({ ...a, defects: [...a.defects, defect] }));
    setDescription("");
    setError(null);
  }

  function remove(d: Defect) {
    patch((a) => ({ ...a, defects: a.defects.filter((x) => x.id !== d.id) }));
    void deletePhotos(d.photoIds).catch(() => undefined);
  }

  return (
    <div className="space-y-4">
      <p className="text-[15px] font-medium">Defects</p>
      {area.defects.map((d, i) => (
        <div
          key={d.id}
          className="space-y-5 rounded-[var(--radius)] border border-border bg-surface p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px] font-medium">
              Defect {i + 1}: {d.description}
            </p>
            <button
              type="button"
              onClick={() => remove(d)}
              aria-label={`Remove defect ${i + 1}`}
              className={`${btnIconDanger} -my-2 -mr-2`}
            >
              <Trash2 className="size-5" aria-hidden />
            </button>
          </div>
          <ConditionSelector
            compact
            name={`Classification of defect ${i + 1}`}
            value={d.condition}
            onChange={(condition: Condition) => patchDefect(d.id, (x) => ({ ...x, condition }))}
          />
          <Field id={`defect-notes-${d.id}`} label="Notes" optional>
            <textarea
              id={`defect-notes-${d.id}`}
              rows={2}
              maxLength={1000}
              className="field-input"
              value={d.notes}
              onChange={(e) => {
                const notes = e.target.value;
                patchDefect(d.id, (x) => ({ ...x, notes }));
              }}
            />
          </Field>
          <PhotoPicker
            inspectionId={inspectionId}
            photoIds={d.photoIds}
            label="Defect photos"
            onAdd={(id) => patchDefect(d.id, (x) => ({ ...x, photoIds: [...x.photoIds, id] }))}
            onRemove={(id) =>
              patchDefect(d.id, (x) => ({ ...x, photoIds: x.photoIds.filter((p) => p !== id) }))
            }
          />
        </div>
      ))}
      <Field
        id="new-defect"
        label="Add a defect"
        error={error ?? undefined}
        hint="For example: crack in window, stain on carpet."
      >
        <div className="flex gap-3">
          <input
            id="new-defect"
            className="field-input"
            maxLength={120}
            value={description}
            aria-invalid={!!error}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <button type="button" onClick={add} className={`${btnSmall} h-[3.25rem] shrink-0`}>
            <Plus className="size-4" aria-hidden /> Add
          </button>
        </div>
      </Field>
    </div>
  );
}
