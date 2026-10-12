import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/illustrations/Brand";
import { openIntro } from "@/features/onboarding/intro-state";
import { COPYRIGHT_LINE } from "@/lib/site";
import { useEffect, useState, type ReactNode } from "react";

const NAV_LINKS = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
] as const;

export function Wordmark() {
  return (
    <Link
      to="/"
      className="inline-flex h-12 items-center gap-2.5 rounded-md text-base font-semibold tracking-tight"
    >
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <BrandMark className="size-5" />
      </span>
      MoveIn Report
    </Link>
  );
}

export function SiteHeader({ right, wide = true }: { right?: ReactNode; wide?: boolean }) {
  const [open, setOpen] = useState(false);
  const container = wide ? "container-wide" : "container-narrow";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-foreground/20 bg-background">
      <div className={`${container} flex h-16 items-center justify-between gap-4`}>
        <Wordmark />
        <div className="flex items-center gap-4">
          {right}
          <nav className="hidden gap-8 text-[15px] text-soft-foreground sm:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-foreground">
                {l.label}
              </Link>
            ))}
            <button type="button" onClick={openIntro} className="hover:text-foreground">
              Intro
            </button>
          </nav>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-3 grid size-12 place-items-center rounded-[var(--radius-btn)] hover:bg-surface active:bg-subtle sm:hidden"
          >
            {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>
      {open && (
        <>
          <div
            className="fixed inset-x-0 bottom-0 top-16 bg-foreground/20 sm:hidden"
            onClick={() => setOpen(false)}
          />
          <nav
            id="mobile-menu"
            className="absolute inset-x-0 top-full border-b border-foreground/20 bg-background shadow-lift sm:hidden"
          >
            <div className={`${container} flex flex-col py-3 text-base`}>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="flex h-14 items-center font-medium"
                >
                  {l.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openIntro();
                }}
                className="flex h-14 items-center text-left font-medium"
              >
                Show intro again
              </button>
              <p className="border-t border-border py-4 text-sm text-muted-foreground">
                {COPYRIGHT_LINE}
              </p>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
