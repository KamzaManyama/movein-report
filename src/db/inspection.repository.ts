import type { Inspection, Photo } from "@/features/inspection/inspection.types";
import { INSPECTIONS, PHOTOS, openDb, toStorageError, withStore } from "./indexed-db";
import { newId, newReference, todayLocalISO } from "@/utils/id";

export function createEmptyInspection(): Inspection {
  const now = new Date();
  return {
    id: newId(),
    reference: newReference(now),
    status: "draft",
    inspectionType: null,
    rentalType: null,
    areasFor: null,
    details: {
      address: "",
      roomIdentifier: "",
      inspectionDate: todayLocalISO(now),
      tenantName: "",
      landlordName: "",
      landlordContact: "",
    },
    areas: [],
    meters: [],
    step: 0,
    maxStep: 0,
    currentAreaId: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    reportGeneratedAt: null,
  };
}

export async function listInspections(): Promise<Inspection[]> {
  const all = await withStore<Inspection[]>(INSPECTIONS, "readonly", (s) => s.getAll());
  return (all ?? []).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getInspection(id: string): Promise<Inspection | undefined> {
  return withStore<Inspection | undefined>(INSPECTIONS, "readonly", (s) => s.get(id));
}

/** Upsert by stable ID — repeated saves never create duplicates. */
export async function saveInspection(ins: Inspection): Promise<void> {
  await withStore(INSPECTIONS, "readwrite", (s) => s.put(ins));
}

export async function deleteInspection(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([INSPECTIONS, PHOTOS], "readwrite");
    tx.objectStore(INSPECTIONS).delete(id);
    const idx = tx.objectStore(PHOTOS).index("inspectionId");
    const cur = idx.openKeyCursor(IDBKeyRange.only(id));
    cur.onsuccess = () => {
      const c = cur.result;
      if (c) {
        tx.objectStore(PHOTOS).delete(c.primaryKey);
        c.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(toStorageError(tx.error));
  });
}

export async function savePhoto(photo: Photo): Promise<void> {
  await withStore(PHOTOS, "readwrite", (s) => s.put(photo));
}

export function getPhoto(id: string): Promise<Photo | undefined> {
  return withStore<Photo | undefined>(PHOTOS, "readonly", (s) => s.get(id));
}

export async function deletePhotos(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await withStore(PHOTOS, "readwrite", (s) => {
    ids.forEach((id) => s.delete(id));
  });
}

/** Ask the browser to keep our data. Not guaranteed — callers must not imply otherwise. */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch {
    /* ignore */
  }
  return false;
}
