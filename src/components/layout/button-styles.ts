// Every control is at least 48px tall so it is easy to hit with a thumb.
const base =
  "inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-btn)] px-6 text-[15px] font-medium transition-[background-color,transform] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export const btnPrimary = `${base} bg-primary text-primary-foreground hover:bg-primary-hover`;
export const btnSecondary = `${base} border border-border bg-background hover:bg-surface active:bg-subtle`;
/** Quieter secondary action that sits next to fields or inside cards. */
export const btnSmall =
  "inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-btn)] border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-surface active:bg-subtle disabled:cursor-not-allowed disabled:opacity-50";
/** Icon-only action, such as delete or remove. */
export const btnIcon =
  "grid size-12 shrink-0 place-items-center rounded-[var(--radius-btn)] text-soft-foreground transition-colors hover:bg-surface hover:text-foreground active:bg-subtle";
/** Icon-only action that deletes something. Red so it is never mistaken for a safe action. */
export const btnIconDanger =
  "grid size-12 shrink-0 place-items-center rounded-[var(--radius-btn)] bg-destructive text-destructive-foreground transition-[background-color,transform] hover:bg-destructive/90 active:scale-[0.96]";
