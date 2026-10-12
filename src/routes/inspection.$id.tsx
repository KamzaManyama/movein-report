import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { SaveIndicator } from "@/components/layout/SaveIndicator";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { btnPrimary, btnSecondary } from "@/components/layout/button-styles";
import { MetersStep, ReviewStep } from "@/features/inspection/components/FinishSteps";
import { InspectStep } from "@/features/inspection/components/InspectStep";
import {
  AreasStep,
  DetailsStep,
  RentalStep,
  TypeStep,
} from "@/features/inspection/components/SetupSteps";
import { WizardProgress } from "@/features/inspection/components/WizardProgress";
import { STEPS } from "@/features/inspection/inspection.constants";
import { canLeaveStep, inspectableAreas } from "@/features/inspection/inspection.validation";
import { useInspection, type InspectionController } from "@/hooks/use-inspection";

export const Route = createFileRoute("/inspection/$id")({
  head: () => ({
    meta: [{ title: "Inspection — MoveIn Report" }, { name: "robots", content: "noindex" }],
  }),
  component: InspectionPage,
});

function InspectionPage() {
  const { id } = Route.useParams();
  const c = useInspection(id);

  if (c.loadState !== "ready" || !c.inspection) {
    return (
      <div className="min-h-screen">
        <SiteHeader wide={false} />
        <main className="container-narrow py-16">
          {c.loadState === "loading" ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Loading your inspection…
            </p>
          ) : (
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold tracking-tight">
                {c.loadState === "missing"
                  ? "Inspection not found"
                  : "This inspection could not be loaded"}
              </h1>
              <p className="text-soft-foreground">
                Inspections are stored only in the browser they were created in. It may have been
                deleted, or created on another device.
              </p>
              <Link to="/" className={btnPrimary}>
                Back to home
              </Link>
            </div>
          )}
        </main>
      </div>
    );
  }

  return <Wizard c={c as InspectionController} />;
}

function Wizard({ c }: { c: InspectionController }) {
  const { inspection } = c;
  const [message, setMessage] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const step = Math.min(inspection.step, STEPS.length - 1);
  const last = step === STEPS.length - 1;
  // While areas are still open, completing the area is the main action, so Continue steps back.
  const areasPending = step === 4 && inspectableAreas(inspection).some((a) => !a.completed);

  function goTo(s: number) {
    setMessage(null);
    setShowErrors(false);
    c.update((i) => ({ ...i, step: s, maxStep: Math.max(i.maxStep, s) }));
    window.scrollTo({ top: 0 });
  }

  function next() {
    const check = canLeaveStep(inspection, step);
    if (!check.ok) {
      setMessage(check.message ?? null);
      setShowErrors(true);
      return;
    }
    goTo(step + 1);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader
        wide={false}
        right={<SaveIndicator state={c.saveState} onRetry={() => void c.flush()} />}
      />
      <main className="container-narrow pb-36 pt-6">
        <WizardProgress step={step} maxStep={inspection.maxStep} onGo={goTo} />
        {c.saveError && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {c.saveError}
          </p>
        )}
        <div className="mt-8">
          {step === 0 && <TypeStep c={c} />}
          {step === 1 && <RentalStep c={c} />}
          {step === 2 && <DetailsStep c={c} showErrors={showErrors} />}
          {step === 3 && <AreasStep c={c} />}
          {step === 4 && <InspectStep c={c} />}
          {step === 5 && <MetersStep c={c} />}
          {step === 6 && <ReviewStep c={c} />}
        </div>
      </main>

      {/* Fixed to the bottom so Back and Continue are always within thumb reach. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-foreground/20 bg-background">
        <div className="container-narrow pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          {message && (
            <p className="mb-2.5 text-sm text-destructive" role="alert">
              {message}
            </p>
          )}
          <div className="flex items-center gap-3">
            {step > 0 ? (
              <button type="button" onClick={() => goTo(step - 1)} className={btnSecondary}>
                <ArrowLeft className="size-4" aria-hidden /> Back
              </button>
            ) : (
              <Link to="/" className={btnSecondary}>
                <ArrowLeft className="size-4" aria-hidden /> Home
              </Link>
            )}
            {last ? (
              <Link to="/" className={`${btnSecondary} flex-1`}>
                Done
              </Link>
            ) : (
              <button
                type="button"
                onClick={next}
                className={`${areasPending ? btnSecondary : btnPrimary} flex-1`}
              >
                {step === 4 ? "Continue to meters" : "Continue"}{" "}
                <ArrowRight className="size-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
