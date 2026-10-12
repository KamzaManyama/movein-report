import { useCallback, useEffect, useRef, useState } from "react";
import type { Inspection, InspectionArea } from "@/features/inspection/inspection.types";
import { getInspection, saveInspection } from "@/db/inspection.repository";
import { StorageError } from "@/db/indexed-db";

export type SaveState = "idle" | "saving" | "saved" | "error";

/** Loads an inspection and autosaves every change (debounced) to IndexedDB. */
export function useInspection(id: string) {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const dirty = useRef(false);
  const latest = useRef<Inspection | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    getInspection(id)
      .then((ins) => {
        if (!alive) return;
        if (!ins) return setLoadState("missing");
        latest.current = ins;
        setInspection(ins);
        setLoadState("ready");
        setSaveState("saved");
      })
      .catch(() => alive && setLoadState("error"));
    return () => {
      alive = false;
    };
  }, [id]);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const ins = latest.current;
    if (!ins || !dirty.current) return;
    dirty.current = false;
    setSaveState("saving");
    try {
      await saveInspection(ins);
      setSaveState(dirty.current ? "saving" : "saved");
      setSaveError(null);
    } catch (e) {
      dirty.current = true;
      setSaveState("error");
      setSaveError(
        e instanceof StorageError ? e.message : "Could not save your changes on this device.",
      );
    }
  }, []);

  useEffect(() => {
    if (!inspection || !dirty.current) return;
    latest.current = inspection;
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), 400);
  }, [inspection, flush]);

  useEffect(() => {
    const onHide = () => void flush();
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
      void flush();
    };
  }, [flush]);

  const update = useCallback((fn: (i: Inspection) => Inspection) => {
    setInspection((prev) => {
      if (!prev) return prev;
      dirty.current = true;
      return { ...fn(prev), updatedAt: new Date().toISOString() };
    });
  }, []);

  const updateArea = useCallback(
    (areaId: string, fn: (a: InspectionArea) => InspectionArea) =>
      update((i) => ({ ...i, areas: i.areas.map((a) => (a.id === areaId ? fn(a) : a)) })),
    [update],
  );

  return { inspection, loadState, saveState, saveError, update, updateArea, flush };
}

export type InspectionController = ReturnType<typeof useInspection> & { inspection: Inspection };
