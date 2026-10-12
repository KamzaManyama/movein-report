/*
 * Line drawings for the first-visit intro. Original artwork for this project, in the same
 * style as the brand mark: one ground line, 3px strokes, drawn in stroke by stroke.
 */
import type { CSSProperties, ReactNode } from "react";

const at = (s: number): CSSProperties => ({ animationDelay: `${s.toFixed(2)}s` });
const line = { pathLength: 1, className: "draw-line" } as const;

function Frame({ className, children }: { className?: string | undefined; children: ReactNode }) {
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
      <path {...line} d="M24 330 H616" />
      {children}
    </svg>
  );
}

/** Checklist, camera, report: the three things you do. */
export function StepsArt({ className }: { className?: string | undefined }) {
  return (
    <Frame className={className}>
      <rect {...line} style={at(0.2)} x={92} y={180} width={100} height={150} rx={10} />
      <path {...line} style={at(0.4)} d="M122 180 V166 H162 V180" />
      <path {...line} style={at(0.5)} d="M114 222 H170 M114 256 H170 M114 290 H150" />

      <rect {...line} style={at(0.6)} x={262} y={220} width={116} height={110} rx={12} />
      <path {...line} style={at(0.8)} d="M296 220 L306 200 H334 L344 220" />
      <circle {...line} style={at(0.9)} cx={320} cy={275} r={26} />

      <path {...line} style={at(1.0)} d="M448 330 V180 H520 L548 208 V330" />
      <path {...line} style={at(1.2)} d="M520 180 V208 H548" />
      <path {...line} style={at(1.3)} d="M468 244 H528 M468 274 H510" />
      <path {...line} style={at(1.45)} d="M470 300 L484 312 L512 290" />
    </Frame>
  );
}

/** A phone with a padlock: everything stays on the device. */
export function PrivateArt({ className }: { className?: string | undefined }) {
  return (
    <Frame className={className}>
      <rect {...line} style={at(0.2)} x={250} y={70} width={140} height={260} rx={22} />
      <path {...line} style={at(0.6)} d="M300 94 H340" />
      <rect {...line} style={at(0.8)} x={284} y={198} width={72} height={60} rx={10} />
      <path {...line} style={at(1.0)} d="M300 198 V180 a20 20 0 0 1 40 0 V198" />
      <path {...line} style={at(1.2)} d="M320 220 V236" />
    </Frame>
  );
}

/** A report with a download arrow: keep your own copy. */
export function KeepArt({ className }: { className?: string | undefined }) {
  return (
    <Frame className={className}>
      <path {...line} style={at(0.2)} d="M240 330 V90 H366 L400 124 V330" />
      <path {...line} style={at(0.6)} d="M366 90 V124 H400" />
      <path {...line} style={at(0.8)} d="M320 164 V262" />
      <path {...line} style={at(1.0)} d="M286 230 L320 264 L354 230" />
      <path {...line} style={at(1.2)} d="M284 296 H356" />
    </Frame>
  );
}
