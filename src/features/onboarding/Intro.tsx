import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { BrandLoaderArt } from "@/components/illustrations/Brand";
import { KeepArt, PrivateArt, StepsArt } from "@/components/illustrations/IntroArt";
import { btnPrimary, btnSecondary } from "@/components/layout/button-styles";
import { MAX_SAVED_INSPECTIONS } from "@/features/inspection/inspection.constants";
import { startInspection } from "@/features/inspection/start-inspection";
import { INTRO_OPEN_EVENT, closeIntro, isIntroOpen } from "./intro-state";

const SLIDES: {
  art: ComponentType<{ className?: string | undefined }>;
  title: string;
  text: string;
}[] = [
  {
    art: BrandLoaderArt,
    title: "Record your room before it costs you",
    text: "MoveIn Report helps you capture the condition of a rented room when you move in or out.",
  },
  {
    art: StepsArt,
    title: "Inspect, photograph, report",
    text: "Go through each area, add photos of any damage, and get a PDF report to send to your landlord.",
  },
  {
    art: PrivateArt,
    title: "Your data stays with you",
    text: `There is no account and nothing is uploaded. Up to ${MAX_SAVED_INSPECTIONS} inspections are kept on this phone.`,
  },
  {
    art: KeepArt,
    title: "Keep your own copy",
    text: "Your phone's storage is not a backup. Download or share your report as soon as it is ready.",
  },
];

const SWIPE_PX = 50;

/**
 * First-visit intro. Always rendered (including on the server) and shown by a class on
 * <html>, so a new visitor sees it on the first paint. See intro-state.ts.
 */
export function Intro() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const touchX = useRef<number | null>(null);
  const last = step === SLIDES.length - 1;

  const go = useCallback((s: number) => setStep(Math.max(0, Math.min(SLIDES.length - 1, s))), []);

  useEffect(() => {
    const onOpen = () => {
      setStep(0);
      setError(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!isIntroOpen()) return;
      if (e.key === "ArrowRight") setStep((s) => Math.min(SLIDES.length - 1, s + 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(0, s - 1));
      if (e.key === "Escape") closeIntro();
    };
    window.addEventListener(INTRO_OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(INTRO_OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  async function start() {
    setStarting(true);
    setError(null);
    try {
      const id = await startInspection();
      if (id) await navigate({ to: "/inspection/$id", params: { id } });
      closeIntro();
    } catch {
      setError("Could not start an inspection on this device. Skip the intro and try again.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="Welcome to MoveIn Report"
      className="intro-overlay fixed inset-0 z-40 h-dvh flex-col bg-background"
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const dx = (e.changedTouches[0]?.clientX ?? 0) - (touchX.current ?? 0);
        if (touchX.current !== null && Math.abs(dx) > SWIPE_PX) go(step + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div className="container-narrow flex h-16 shrink-0 items-center justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {step + 1} of {SLIDES.length}
        </p>
        <button
          type="button"
          onClick={closeIntro}
          className="-mr-3 inline-flex h-12 items-center rounded-[var(--radius-btn)] px-3 text-[15px] font-medium text-soft-foreground hover:bg-surface active:bg-subtle"
        >
          Skip
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${step * 100}%)` }}
        >
          {SLIDES.map(({ art: Art, title, text }, i) => (
            <section
              key={title}
              aria-hidden={i !== step}
              className="flex w-full shrink-0 flex-col items-center justify-center px-6 text-center"
            >
              {/* Remounting on activation replays the line drawing and the text entrance. */}
              <div
                key={i === step ? "on" : "off"}
                className="flex w-full max-w-md flex-col items-center"
              >
                <Art className="w-full max-w-xs" />
                <h2 className="mt-8 text-[28px] leading-tight font-semibold tracking-tight animate-in fade-in slide-in-from-bottom-3 duration-500">
                  {title}
                </h2>
                <p className="mt-4 text-lg text-soft-foreground animate-in fade-in slide-in-from-bottom-3 duration-700">
                  {text}
                </p>
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="container-narrow shrink-0 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <div className="mb-5 flex justify-center gap-2" aria-hidden>
          {SLIDES.map((s, i) => (
            <span
              key={s.title}
              className={`h-2 rounded-full transition-all duration-300 ${i === step ? "w-7 bg-primary" : "w-2 bg-border"}`}
            />
          ))}
        </div>
        {error && (
          <p className="mb-3 text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => go(step - 1)}
              aria-label="Back"
              className={`${btnSecondary} px-4`}
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
          )}
          {last ? (
            <button
              type="button"
              onClick={() => void start()}
              disabled={starting}
              className={`${btnPrimary} flex-1`}
            >
              {starting && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Start my first inspection
            </button>
          ) : (
            <button type="button" onClick={() => go(step + 1)} className={`${btnPrimary} flex-1`}>
              Next <ArrowRight className="size-4" aria-hidden />
            </button>
          )}
        </div>
        <p className={`mt-4 text-center text-sm text-muted-foreground ${last ? "" : "invisible"}`}>
          By starting, you agree to the{" "}
          <Link
            to="/terms"
            onClick={closeIntro}
            tabIndex={last ? 0 : -1}
            className="-my-3 inline-block py-3 font-medium text-foreground underline underline-offset-4"
          >
            Terms of use
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
