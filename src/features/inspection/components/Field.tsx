import type { ReactNode } from "react";

export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  optional?: boolean | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-baseline justify-between text-[15px] font-medium">
        {label}
        {optional && <span className="text-sm font-normal text-muted-foreground">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function StepHeading({
  title,
  description,
}: {
  title: string;
  description?: string | undefined;
}) {
  return (
    <div className="mb-8 space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">{title}</h1>
      {description && <p className="text-base text-soft-foreground">{description}</p>}
    </div>
  );
}

export function OptionCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  role = "radio",
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  description: string;
  role?: "radio";
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onSelect}
      className="select-card flex w-full items-start gap-4 p-5 text-left"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-surface [&_svg]:size-5">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        <span className="mt-1 block text-sm text-soft-foreground">{description}</span>
      </span>
      <span
        aria-hidden
        className={`mt-1 grid size-5 shrink-0 place-items-center rounded-full border ${selected ? "border-foreground bg-primary" : "border-border"}`}
      >
        {selected && <span className="size-2 rounded-full bg-primary-foreground" />}
      </span>
    </button>
  );
}
