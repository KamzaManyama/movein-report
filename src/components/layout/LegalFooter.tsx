import { COPYRIGHT_LINE, SITE } from "@/lib/site";

/** Operator, contact and copyright details shown at the end of the legal pages. */
export function LegalFooter() {
  return (
    <section className="mt-11 space-y-2 border-t border-border pt-8 text-base text-soft-foreground">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Who runs this and how to reach us
      </h2>
      <p>
        {SITE.name} is operated by {SITE.operator}.
      </p>
      <p>
        {SITE.contactEmail ? (
          <>
            Questions or complaints:{" "}
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="font-medium text-foreground underline underline-offset-4"
            >
              {SITE.contactEmail}
            </a>
          </>
        ) : (
          "Contact details are coming soon."
        )}
      </p>
      <p className="pt-2 text-sm text-muted-foreground">{COPYRIGHT_LINE}</p>
    </section>
  );
}
