import type { Inspection } from "./inspection.types";
import { rentalDetailsSchema } from "./inspection.schema";

export interface StepCheck {
  ok: boolean;
  message?: string;
}

/** Whether the user may continue past a given wizard step. */
export function canLeaveStep(ins: Inspection, step: number): StepCheck {
  switch (step) {
    case 0:
      return ins.inspectionType
        ? { ok: true }
        : { ok: false, message: "Choose an inspection type to continue." };
    case 1:
      return ins.rentalType
        ? { ok: true }
        : { ok: false, message: "Choose your accommodation type to continue." };
    case 2: {
      const r = rentalDetailsSchema.safeParse(ins.details);
      return r.success ? { ok: true } : { ok: false, message: "Complete the required details." };
    }
    case 3:
      return ins.areas.some((a) => a.availability !== "not-applicable")
        ? { ok: true }
        : { ok: false, message: "Keep at least one area in the inspection." };
    default:
      return { ok: true };
  }
}

export interface InspectionIssue {
  kind: "details" | "area-incomplete" | "area-no-condition";
  areaId?: string;
  message: string;
}

/** Lists incomplete items for review. Never blocks inaccessible areas. */
export function getInspectionIssues(ins: Inspection): InspectionIssue[] {
  const issues: InspectionIssue[] = [];
  if (!rentalDetailsSchema.safeParse(ins.details).success) {
    issues.push({ kind: "details", message: "Rental details are incomplete." });
  }
  for (const a of ins.areas) {
    if (a.availability !== "included") continue;
    if (a.condition === null) {
      issues.push({
        kind: "area-no-condition",
        areaId: a.id,
        message: `${a.name}: no condition recorded.`,
      });
    } else if (!a.completed) {
      issues.push({
        kind: "area-incomplete",
        areaId: a.id,
        message: `${a.name}: not marked complete.`,
      });
    }
  }
  return issues;
}

export function inspectableAreas(ins: Inspection) {
  return ins.areas.filter((a) => a.availability === "included");
}
