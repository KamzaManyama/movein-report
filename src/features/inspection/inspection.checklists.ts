import type { InspectionArea, RentalType } from "./inspection.types";
import { newId } from "@/utils/id";

interface AreaTemplate {
  name: string;
  group: string;
  optional?: boolean;
  shared?: boolean;
}

const ROOM = "Room";
const BEDROOM = "Private bedroom";
const BATHROOM = "Ensuite bathroom";
const SHARED = "Shared facilities";

const roomAreas = (group: string): AreaTemplate[] => [
  { name: "Walls and ceiling", group },
  { name: "Floor", group },
  { name: "Door and lock", group },
  { name: "Windows and window locks", group },
  { name: "Lights and visible electrical fittings", group },
  { name: "Plugs and switches", group },
  { name: "Built-in cupboards or shelves", group, optional: true },
  { name: "General condition", group },
];

export const CHECKLIST_TEMPLATES: Record<RentalType, AreaTemplate[]> = {
  "single-room": roomAreas(ROOM),
  ensuite: [
    ...roomAreas(ROOM),
    { name: "Bathroom walls and floor", group: BATHROOM },
    { name: "Toilet", group: BATHROOM },
    { name: "Basin and taps", group: BATHROOM },
    { name: "Shower or bath", group: BATHROOM },
    { name: "Visible plumbing or leaks", group: BATHROOM },
    { name: "Bathroom door and ventilation", group: BATHROOM },
  ],
  shared: [
    ...roomAreas(BEDROOM),
    { name: "Shared kitchen", group: SHARED, optional: true, shared: true },
    { name: "Shared bathroom", group: SHARED, optional: true, shared: true },
    { name: "Shared lounge", group: SHARED, optional: true, shared: true },
    { name: "Passage or entrance", group: SHARED, optional: true, shared: true },
  ],
  bachelor: [
    { name: "Main sleeping and living area", group: ROOM },
    { name: "Kitchenette", group: ROOM, optional: true },
    { name: "Private bathroom", group: ROOM, optional: true },
    { name: "Doors and windows", group: ROOM },
    { name: "Cupboards and fixtures", group: ROOM },
    { name: "Visible plumbing and electrical fittings", group: ROOM },
  ],
};

export function createArea(t: AreaTemplate & { custom?: boolean }): InspectionArea {
  return {
    id: newId(),
    name: t.name,
    group: t.group,
    shared: !!t.shared,
    optional: !!t.optional || !!t.custom,
    custom: !!t.custom,
    availability: "included",
    condition: null,
    notes: "",
    photoIds: [],
    defects: [],
    completed: false,
  };
}

export function buildDefaultAreas(rentalType: RentalType): InspectionArea[] {
  return CHECKLIST_TEMPLATES[rentalType].map((t) => createArea(t));
}

export function areaHasRecordedData(a: InspectionArea): boolean {
  return (
    a.condition !== null ||
    a.notes.trim() !== "" ||
    a.photoIds.length > 0 ||
    a.defects.length > 0 ||
    a.completed
  );
}
