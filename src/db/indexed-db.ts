const DB_NAME = "movein-report";
const DB_VERSION = 1;
export const INSPECTIONS = "inspections";
export const PHOTOS = "photos";

export class StorageError extends Error {
  constructor(
    message: string,
    public override readonly cause?: unknown,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new StorageError("This browser does not support local storage for inspections."));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(INSPECTIONS))
        db.createObjectStore(INSPECTIONS, { keyPath: "id" });
      if (!db.objectStoreNames.contains(PHOTOS)) {
        const s = db.createObjectStore(PHOTOS, { keyPath: "id" });
        s.createIndex("inspectionId", "inspectionId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(toStorageError(req.error));
    req.onblocked = () => reject(new StorageError("Close other MoveIn Report tabs and try again."));
  }).catch((e) => {
    dbPromise = null;
    throw e;
  });
  return dbPromise;
}

export function toStorageError(e: unknown): StorageError {
  if (e instanceof StorageError) return e;
  const name = (e as { name?: string } | null)?.name;
  if (name === "QuotaExceededError") {
    return new StorageError(
      "Your device is out of browser storage. Remove some photos or old inspections, then try again.",
      e,
    );
  }
  return new StorageError("Could not save to this device's browser storage.", e);
}

/** Run a single-store transaction and resolve when it commits. */
export async function withStore<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    let result: T;
    let tx: IDBTransaction;
    try {
      tx = db.transaction(store, mode);
    } catch (e) {
      reject(toStorageError(e));
      return;
    }
    const req = fn(tx.objectStore(store));
    if (req) req.onsuccess = () => (result = req.result);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(toStorageError(tx.error));
    tx.onabort = () => reject(toStorageError(tx.error));
  });
}
