import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  btnIconDanger,
  btnPrimary,
  btnSecondary,
  btnSmall,
} from "@/components/layout/button-styles";
import { deleteInspection, listInspections } from "@/db/inspection.repository";
import { StorageError } from "@/db/indexed-db";
import {
  INSPECTION_TYPE_LABELS,
  MAX_SAVED_INSPECTIONS,
} from "@/features/inspection/inspection.constants";
import type { Inspection } from "@/features/inspection/inspection.types";
import { startInspection } from "@/features/inspection/start-inspection";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<Inspection[] | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listInspections()
      .then(setInspections)
      .catch(() => setInspections([]));
  }, []);

  async function start() {
    setError(null);
    try {
      setStarting(true);
      const id = await startInspection();
      if (id) await navigate({ to: "/inspection/$id", params: { id } });
      else setStarting(false);
    } catch (e) {
      setError(
        e instanceof StorageError ? e.message : "Could not start an inspection on this device.",
      );
      setStarting(false);
    }
  }

  async function remove(ins: Inspection) {
    if (!window.confirm(`Delete inspection ${ins.reference} and its photos from this device?`))
      return;
    try {
      await deleteInspection(ins.id);
      setInspections((list) => list?.filter((i) => i.id !== ins.id) ?? null);
    } catch (e) {
      setError(e instanceof StorageError ? e.message : "Could not delete this inspection.");
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="container-wide py-14 sm:py-28">
          <p className="eyebrow">Rental room inspections</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Record the condition of your room before it costs you your deposit.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-soft-foreground">
            Walk through your room, capture defects with photos, and get a PDF report you can share
            with your landlord. Everything stays on this device.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => void start()}
              disabled={starting}
              className={btnPrimary}
            >
              {starting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Start an inspection
              <ArrowRight className="size-4" aria-hidden />
            </button>
            <Link to="/how-it-works" className={btnSecondary}>
              How it works
            </Link>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            By starting, you agree to the{" "}
            <Link
              to="/terms"
              className="-my-3 inline-block py-3 font-medium text-foreground underline underline-offset-4"
            >
              Terms of use
            </Link>
            . The report is your own record, not legal advice.
          </p>
          {error && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </section>

        {inspections && inspections.length > 0 && (
          <section className="container-wide pb-20">
            <h2 className="text-xl font-semibold tracking-tight">Your inspections</h2>
            <ul className="mt-5 space-y-4">
              {inspections.map((ins) => (
                <li
                  key={ins.id}
                  className="flex flex-col gap-5 rounded-[var(--radius)] border border-border p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium">
                      {ins.inspectionType
                        ? INSPECTION_TYPE_LABELS[ins.inspectionType]
                        : "New inspection"}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {ins.status === "completed" ? "Report generated" : "Draft"}
                      </span>
                    </p>
                    <p className="truncate text-sm text-soft-foreground">
                      {[ins.details.address, ins.details.roomIdentifier]
                        .filter(Boolean)
                        .join(" · ") || "No details yet"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ins.reference} · updated{" "}
                      {new Date(ins.updatedAt).toLocaleDateString("en-ZA")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <Link
                      to="/inspection/$id"
                      params={{ id: ins.id }}
                      className={`${btnSmall} flex-1 sm:flex-none sm:px-6`}
                    >
                      {ins.status === "completed" ? "Open" : "Continue"}
                    </Link>
                    <button
                      type="button"
                      onClick={() => void remove(ins)}
                      aria-label={`Delete inspection ${ins.reference}`}
                      className={`${btnIconDanger}`}
                    >
                      <Trash2 className="size-5" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Up to {MAX_SAVED_INSPECTIONS} inspections are kept on this device. Starting another
              removes the oldest.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
