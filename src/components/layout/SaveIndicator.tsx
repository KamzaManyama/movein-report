import { AlertCircle, Check, Loader2 } from "lucide-react";
import type { SaveState } from "@/hooks/use-inspection";

export function SaveIndicator({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  if (state === "error")
    return (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive"
        aria-live="polite"
      >
        <AlertCircle className="size-3.5" aria-hidden /> Not saved — retry
      </button>
    );
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
      aria-live="polite"
    >
      {state === "saving" ? (
        <>
          <Loader2 className="size-3.5 animate-spin" aria-hidden /> Saving…
        </>
      ) : (
        <>
          <Check className="size-3.5" aria-hidden /> Saved on this device
        </>
      )}
    </span>
  );
}
