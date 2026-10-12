import {
  createEmptyInspection,
  deleteInspection,
  listInspections,
  requestPersistentStorage,
  saveInspection,
} from "@/db/inspection.repository";
import { MAX_SAVED_INSPECTIONS } from "./inspection.constants";

/**
 * Creates a new inspection and returns its ID. Keeps at most MAX_SAVED_INSPECTIONS on the
 * device by deleting the oldest first; returns null if the user declines that deletion.
 */
export async function startInspection(): Promise<string | null> {
  const oldestFirst = (await listInspections()).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const excess = oldestFirst.slice(
    0,
    Math.max(0, oldestFirst.length - (MAX_SAVED_INSPECTIONS - 1)),
  );
  if (
    excess.length > 0 &&
    !window.confirm(
      `Only ${MAX_SAVED_INSPECTIONS} inspections are kept on this device. Starting a new one deletes the oldest (${excess.map((i) => i.reference).join(", ")}) and its photos. Continue?`,
    )
  )
    return null;
  for (const old of excess) await deleteInspection(old.id);
  const ins = createEmptyInspection();
  await saveInspection(ins);
  void requestPersistentStorage();
  return ins.id;
}
