export type InspectionType = "move-in" | "move-out";
export type RentalType = "single-room" | "ensuite" | "shared" | "bachelor";
export type Condition = "good" | "fair" | "damaged" | "unable";
/** Whether an area is part of the inspection. Missing answers are never treated as "good". */
export type AreaAvailability = "included" | "inaccessible" | "not-applicable";
export type InspectionStatus = "draft" | "completed";
export type MeterKind = "electricity" | "water" | "other";

export interface Defect {
  id: string;
  description: string;
  notes: string;
  condition: Condition;
  photoIds: string[];
}

export interface InspectionArea {
  id: string;
  name: string;
  group: string;
  shared: boolean;
  optional: boolean;
  custom: boolean;
  availability: AreaAvailability;
  condition: Condition | null;
  notes: string;
  photoIds: string[];
  defects: Defect[];
  completed: boolean;
}

export interface MeterReading {
  id: string;
  kind: MeterKind;
  label: string;
  value: string;
  meterNumber: string;
  notes: string;
  photoIds: string[];
}

export interface RentalDetails {
  address: string;
  roomIdentifier: string;
  inspectionDate: string; // yyyy-mm-dd
  tenantName: string;
  landlordName: string;
  landlordContact: string;
}

export interface Inspection {
  id: string;
  reference: string;
  status: InspectionStatus;
  inspectionType: InspectionType | null;
  rentalType: RentalType | null;
  /** Rental type the current checklist was generated for. */
  areasFor: RentalType | null;
  details: RentalDetails;
  areas: InspectionArea[];
  meters: MeterReading[];
  step: number;
  maxStep: number;
  currentAreaId: string | null;
  createdAt: string;
  updatedAt: string;
  reportGeneratedAt: string | null;
}

/** Photo blobs live in their own store and are referenced by ID. */
export interface Photo {
  id: string;
  inspectionId: string;
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
}
