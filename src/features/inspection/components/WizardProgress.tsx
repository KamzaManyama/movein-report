import { STEPS } from "../inspection.constants";

export function WizardProgress({
  step,
  maxStep,
  onGo,
}: {
  step: number;
  maxStep: number;
  onGo: (s: number) => void;
}) {
  return (
    <nav aria-label="Inspection progress" className="space-y-1">
      <p className="text-sm text-muted-foreground">
        Step {step + 1} of {STEPS.length} ·{" "}
        <span className="font-medium text-foreground">{STEPS[step]}</span>
      </p>
      <ol className="flex gap-2">
        {STEPS.map((label, i) => {
          const reachable = i <= maxStep;
          return (
            <li key={label} className="flex-1">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onGo(i)}
                aria-current={i === step ? "step" : undefined}
                aria-label={`${label}${i < step ? " (completed)" : ""}`}
                className="group flex min-h-12 w-full flex-col justify-center disabled:cursor-not-allowed"
              >
                <span
                  className={`block h-1.5 rounded-full transition-colors duration-200 ${
                    i <= step ? "bg-primary" : reachable ? "bg-muted-foreground/50" : "bg-border"
                  }`}
                />
                <span className="mt-2 hidden text-xs text-muted-foreground group-aria-[current=step]:text-foreground sm:block">
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
