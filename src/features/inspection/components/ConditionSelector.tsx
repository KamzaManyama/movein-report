import { Ban, CircleAlert, CircleCheck, CircleDot } from "lucide-react";
import type { Condition } from "../inspection.types";
import { CONDITION_HINTS, CONDITION_LABELS } from "../inspection.constants";

const ICONS: Record<Condition, typeof CircleCheck> = {
  good: CircleCheck,
  fair: CircleDot,
  damaged: CircleAlert,
  unable: Ban,
};

export function ConditionSelector({
  value,
  onChange,
  name,
  compact,
}: {
  value: Condition | null;
  onChange: (c: Condition) => void;
  name: string;
  compact?: boolean;
}) {
  const options = (Object.keys(CONDITION_LABELS) as Condition[]).filter(
    (c) => !(compact && c === "unable"),
  );
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={`grid gap-3 ${compact ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}
    >
      {options.map((c) => {
        const Icon = ICONS[c];
        const selected = value === c;
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(c)}
            className={`select-card flex min-h-14 gap-3 text-left ${compact ? "items-center px-3 py-2" : "items-start p-4"} ${selected ? "bg-surface" : ""}`}
          >
            <Icon
              className={`size-5 shrink-0 ${compact ? "max-[400px]:hidden" : "mt-0.5"} ${selected ? "text-foreground" : "text-muted-foreground"}`}
              aria-hidden
            />
            <span>
              <span className="block text-[15px] font-medium">{CONDITION_LABELS[c]}</span>
              {!compact && (
                <span className="block text-sm text-muted-foreground">{CONDITION_HINTS[c]}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
