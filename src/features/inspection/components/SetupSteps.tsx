import { useState } from "react";
import { Bath, BedSingle, Home, LogIn, LogOut, Plus, Users, X } from "lucide-react";
import type { ReactNode } from "react";
import type { InspectionController } from "@/hooks/use-inspection";
import { deletePhotos } from "@/db/inspection.repository";
import { btnIconDanger, btnSmall } from "@/components/layout/button-styles";
import type {
  AreaAvailability,
  InspectionArea,
  InspectionType,
  RentalDetails,
  RentalType,
} from "../inspection.types";
import { INSPECTION_TYPE_LABELS, RENTAL_TYPE_LABELS } from "../inspection.constants";
import { areaHasRecordedData, buildDefaultAreas, createArea } from "../inspection.checklists";
import { customAreaSchema, rentalDetailsSchema } from "../inspection.schema";
import { Field, OptionCard, StepHeading } from "./Field";

const TYPE_OPTIONS: Record<InspectionType, { icon: ReactNode; description: string }> = {
  "move-in": { icon: <LogIn />, description: "Record the room's condition before you settle in." },
  "move-out": { icon: <LogOut />, description: "Record the room's condition as you hand it back." },
};

export function TypeStep({ c }: { c: InspectionController }) {
  return (
    <>
      <StepHeading
        title="What kind of inspection is this?"
        description="This appears as the title of your report."
      />
      <div role="radiogroup" aria-label="Inspection type" className="space-y-3">
        {(Object.keys(INSPECTION_TYPE_LABELS) as InspectionType[]).map((t) => (
          <OptionCard
            key={t}
            selected={c.inspection.inspectionType === t}
            onSelect={() => c.update((i) => ({ ...i, inspectionType: t }))}
            icon={TYPE_OPTIONS[t].icon}
            title={INSPECTION_TYPE_LABELS[t]}
            description={TYPE_OPTIONS[t].description}
          />
        ))}
      </div>
    </>
  );
}

const RENTAL_OPTIONS: Record<RentalType, { icon: ReactNode; description: string }> = {
  "single-room": {
    icon: <BedSingle />,
    description: "A private room with no bathroom of its own.",
  },
  ensuite: { icon: <Bath />, description: "A private room with its own bathroom." },
  shared: {
    icon: <Users />,
    description: "A private bedroom with a shared kitchen, bathroom or lounge.",
  },
  bachelor: { icon: <Home />, description: "One open-plan room, often with a kitchenette." },
};

export function RentalStep({ c }: { c: InspectionController }) {
  const { inspection } = c;

  function select(type: RentalType) {
    if (inspection.areasFor === type) return c.update((i) => ({ ...i, rentalType: type }));
    if (
      inspection.areas.some(areaHasRecordedData) &&
      !window.confirm(
        "Changing the accommodation type replaces your checklist and clears what you recorded. Continue?",
      )
    )
      return;
    const areas = buildDefaultAreas(type);
    c.update((i) => ({ ...i, rentalType: type, areasFor: type, areas, currentAreaId: null }));
  }

  return (
    <>
      <StepHeading
        title="What are you renting?"
        description="We use this to build the right checklist for you."
      />
      <div role="radiogroup" aria-label="Accommodation type" className="space-y-3">
        {(Object.keys(RENTAL_TYPE_LABELS) as RentalType[]).map((t) => (
          <OptionCard
            key={t}
            selected={inspection.rentalType === t}
            onSelect={() => select(t)}
            icon={RENTAL_OPTIONS[t].icon}
            title={RENTAL_TYPE_LABELS[t]}
            description={RENTAL_OPTIONS[t].description}
          />
        ))}
      </div>
    </>
  );
}

const DETAIL_FIELDS: {
  key: keyof RentalDetails;
  label: string;
  hint?: string;
  optional?: boolean;
  type?: string;
}[] = [
  {
    key: "address",
    label: "Property address",
    hint: "Street address or a short description of the location.",
  },
  { key: "roomIdentifier", label: "Room", hint: "Room number, name or another identifier." },
  { key: "inspectionDate", label: "Inspection date", type: "date" },
  { key: "tenantName", label: "Your name", optional: true },
  { key: "landlordName", label: "Landlord or agent name", optional: true },
  {
    key: "landlordContact",
    label: "Landlord or agent contact",
    hint: "Phone number or email.",
    optional: true,
  },
];

export function DetailsStep({ c, showErrors }: { c: InspectionController; showErrors: boolean }) {
  const details = c.inspection.details;
  const parsed = rentalDetailsSchema.safeParse(details);
  const errors: Partial<Record<keyof RentalDetails, string[]>> =
    showErrors && !parsed.success ? parsed.error.flatten().fieldErrors : {};

  return (
    <>
      <StepHeading title="Rental details" description="These appear at the top of your report." />
      <div className="space-y-6">
        {DETAIL_FIELDS.map((f) => {
          const id = `detail-${f.key}`;
          const error = errors[f.key]?.[0];
          return (
            <Field
              key={f.key}
              id={id}
              label={f.label}
              hint={f.hint}
              optional={f.optional}
              error={error}
            >
              <input
                id={id}
                type={f.type ?? "text"}
                className="field-input"
                value={details[f.key]}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                onChange={(e) => {
                  const value = e.target.value;
                  c.update((i) => ({ ...i, details: { ...i.details, [f.key]: value } }));
                }}
              />
            </Field>
          );
        })}
      </div>
    </>
  );
}

const AVAILABILITY_LABELS: Record<AreaAvailability, string> = {
  included: "Inspect",
  inaccessible: "Can't access",
  "not-applicable": "Not applicable",
};

const CUSTOM_GROUP = "Other areas";

export function AreasStep({ c }: { c: InspectionController }) {
  const { inspection } = c;
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const groups = [...new Set(inspection.areas.map((a) => a.group))];

  function addCustom() {
    const r = customAreaSchema.safeParse(name);
    if (!r.success) return setError(r.error.issues[0]?.message ?? "Enter an area name");
    const area = createArea({ name: r.data, group: CUSTOM_GROUP, custom: true });
    c.update((i) => ({ ...i, areas: [...i.areas, area] }));
    setName("");
    setError(null);
  }

  function removeCustom(area: InspectionArea) {
    if (
      areaHasRecordedData(area) &&
      !window.confirm(`Remove "${area.name}" and everything recorded for it?`)
    )
      return;
    c.update((i) => ({ ...i, areas: i.areas.filter((a) => a.id !== area.id) }));
    void deletePhotos([...area.photoIds, ...area.defects.flatMap((d) => d.photoIds)]).catch(
      () => undefined,
    );
  }

  return (
    <>
      <StepHeading
        title="Choose the areas to inspect"
        description="Mark anything you can't get into or that doesn't apply. Add areas that are missing."
      />
      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group}>
            <h2 className="eyebrow mb-3">{group}</h2>
            <ul className="space-y-3">
              {inspection.areas
                .filter((a) => a.group === group)
                .map((a) => (
                  <li key={a.id} className="rounded-[var(--radius)] border border-border p-4">
                    <div className="mb-3 flex min-h-8 items-center justify-between gap-3">
                      <p className="text-[15px] font-medium">
                        {a.name}
                        {a.shared && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            Shared
                          </span>
                        )}
                      </p>
                      {a.custom && (
                        <button
                          type="button"
                          onClick={() => removeCustom(a)}
                          aria-label={`Remove ${a.name}`}
                          className={`${btnIconDanger} -my-2 -mr-2`}
                        >
                          <X className="size-5" aria-hidden />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(AVAILABILITY_LABELS) as AreaAvailability[]).map((v) => (
                        <button
                          key={v}
                          type="button"
                          aria-pressed={a.availability === v}
                          onClick={() => c.updateArea(a.id, (x) => ({ ...x, availability: v }))}
                          className="select-card min-h-12 px-1 text-[13px] leading-tight font-medium sm:text-sm"
                        >
                          {AVAILABILITY_LABELS[v]}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}

        <Field
          id="custom-area"
          label="Add another area"
          error={error ?? undefined}
          hint="For example: balcony, storage room."
        >
          <div className="flex gap-3">
            <input
              id="custom-area"
              className="field-input"
              value={name}
              aria-invalid={!!error}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustom}
              className={`${btnSmall} h-[3.25rem] shrink-0`}
            >
              <Plus className="size-4" aria-hidden /> Add
            </button>
          </div>
        </Field>
      </div>
    </>
  );
}
