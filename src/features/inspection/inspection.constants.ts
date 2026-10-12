import type { Condition, InspectionType, MeterKind, RentalType } from "./inspection.types";

export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
  "move-in": "Move-in inspection",
  "move-out": "Move-out inspection",
};

export const RENTAL_TYPE_LABELS: Record<RentalType, string> = {
  "single-room": "Single room",
  ensuite: "Room with ensuite",
  shared: "Shared accommodation",
  bachelor: "Bachelor room",
};

export const CONDITION_LABELS: Record<Condition, string> = {
  good: "Good",
  fair: "Fair",
  damaged: "Damaged",
  unable: "Unable to inspect",
};

export const CONDITION_HINTS: Record<Condition, string> = {
  good: "No visible issues",
  fair: "Minor marks or wear",
  damaged: "Visible defects",
  unable: "Could not be inspected",
};

export const METER_LABELS: Record<MeterKind, string> = {
  electricity: "Electricity",
  water: "Water",
  other: "Other",
};

export const STEPS = ["Type", "Rental", "Details", "Areas", "Inspect", "Meters", "Review"] as const;

/** Only this many inspections are kept on the device; starting another removes the oldest. */
export const MAX_SAVED_INSPECTIONS = 2;
