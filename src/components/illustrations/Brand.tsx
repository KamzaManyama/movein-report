/*
 * MoveIn Report brand artwork. Original drawings made for this project: a report
 * page shaped like a house, with a text line and a tick. Keep public/favicon.svg in sync.
 */

/** Line drawing that draws itself in; used by the page loader. Inherits its colour from the text. */
export function BrandLoaderArt({ className }: { className?: string | undefined }) {
  const delay = (s: number) => ({ animationDelay: `${s.toFixed(2)}s` });
  return (
    <svg
      viewBox="0 40 640 330"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {/* one stroke: ground, up the wall, over the roof, down, and on along the ground */}
      <path pathLength={1} className="draw-line" d="M24 330 H222 V176 L320 84 L418 176 V330 H616" />
      <path pathLength={1} className="draw-line" style={delay(0.55)} d="M222 330 H418" />
      <path pathLength={1} className="draw-line" style={delay(0.75)} d="M266 204 H374" />
      <path pathLength={1} className="draw-line" style={delay(0.9)} d="M266 242 H340" />
      <path
        pathLength={1}
        className="draw-line"
        style={delay(1.05)}
        d="M270 290 L298 312 L368 262"
      />
    </svg>
  );
}

/** Static mark for the logo. */
export function BrandMark({ className }: { className?: string | undefined }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M5 21 V10.2 L12 3.5 L19 10.2 V21 Z" />
      <path d="M9 11.5 H15" />
      <path d="M9 16 L11.2 17.9 L15 14.3" />
    </svg>
  );
}
