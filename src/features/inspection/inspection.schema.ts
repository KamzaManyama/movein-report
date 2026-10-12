import { z } from "zod";

export const rentalDetailsSchema = z.object({
  address: z
    .string()
    .trim()
    .min(3, "Enter the address or a short location description")
    .max(200, "Keep this under 200 characters"),
  roomIdentifier: z
    .string()
    .trim()
    .min(1, "Enter a room number, name or identifier")
    .max(60, "Keep this under 60 characters"),
  inspectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose the inspection date"),
  tenantName: z.string().trim().max(100, "Keep this under 100 characters"),
  landlordName: z.string().trim().max(100, "Keep this under 100 characters"),
  landlordContact: z.string().trim().max(120, "Keep this under 120 characters"),
});

export const defectSchema = z.object({
  description: z
    .string()
    .trim()
    .min(2, "Describe the defect briefly")
    .max(120, "Keep the description under 120 characters"),
  notes: z.string().max(1000, "Keep notes under 1000 characters"),
});

export const customAreaSchema = z
  .string()
  .trim()
  .min(2, "Enter an area name")
  .max(60, "Keep area names under 60 characters");
