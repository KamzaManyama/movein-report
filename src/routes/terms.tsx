import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalFooter } from "@/components/layout/LegalFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MAX_SAVED_INSPECTIONS } from "@/features/inspection/inspection.constants";
import { SITE } from "@/lib/site";

const SECTIONS: { title: string; points: string[] }[] = [
  {
    title: "Using the app",
    points: [
      `These terms apply whenever you use ${SITE.name}. By starting an inspection you agree to them. If you do not agree, please do not use the app.`,
      "The app is a free tool for recording the condition of a rented room and turning that record into a PDF report. There is no account.",
    ],
  },
  {
    title: "The report is your own record, not legal advice",
    points: [
      "The report contains what you entered and the photos you added. We do not check, verify or certify any of it.",
      "Dates and times in the report come from your device's clock. Photos are not independently verified.",
      "The app does not give legal advice, and using it does not create a professional relationship with us.",
      "We do not guarantee that a landlord, agent, tribunal or court will accept the report, or that it will lead to any outcome in a dispute, including about a deposit.",
      "The report does not replace any inspection with your landlord that your lease or the law provides for. If you are in a dispute, get advice from a qualified person.",
    ],
  },
  {
    title: "What you are responsible for",
    points: [
      "Recording the condition of the room honestly and accurately.",
      "Having the right to use every photo you add, and respecting other people's privacy when you photograph shared spaces.",
      "Any personal information about other people that you enter, such as your landlord's name and contact details, and who you send the report to.",
      "Using the app lawfully, and not to harass, defame or mislead anyone.",
    ],
  },
  {
    title: "Keeping your own copies",
    points: [
      "Your inspections and photos are stored only in the browser on your device. We do not have a copy and cannot recover anything for you.",
      "Stored data can be lost: for example if you clear your browser data, your browser removes it to free up space, or your device is lost, reset or replaced.",
      `The app keeps up to ${MAX_SAVED_INSPECTIONS} inspections. Starting another deletes the oldest one, after asking you to confirm.`,
      "You are responsible for downloading your report and keeping it somewhere safe as soon as it is generated.",
    ],
  },
  {
    title: "No guarantees about the service",
    points: [
      "The app is provided as it is. We try to keep it working and accurate, but we do not promise that it will always be available, free of errors, or suitable for your particular purpose.",
      "We may change, suspend or stop the app at any time.",
    ],
  },
  {
    title: "Limits on our liability",
    points: [
      "To the fullest extent the law allows, we are not liable for any loss or damage that results from using the app or relying on a report. This includes lost data or photos, a report being incomplete or rejected, and the outcome of any dispute with a landlord or agent.",
      "Nothing in these terms takes away rights you have under consumer protection law or any other law that cannot be excluded by agreement.",
    ],
  },
  {
    title: "Who owns what",
    points: [
      "What you enter, your photos and your reports belong to you.",
      `The app itself, including its name, logo, design, text and code, belongs to ${SITE.operator} and is protected by copyright. You may not copy, resell or republish it, or use the name or logo, without written permission.`,
    ],
  },
  {
    title: "Changes and governing law",
    points: [
      "We may update these terms. The date at the top shows the latest version, and continuing to use the app means you accept it.",
      "These terms are governed by the laws of the Republic of South Africa.",
    ],
  },
];

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Terms of use — ${SITE.name}` },
      {
        name: "description",
        content: "The terms that apply when you use MoveIn Report to record a room inspection.",
      },
      { property: "og:title", content: `Terms of use — ${SITE.name}` },
      { property: "og:description", content: "The terms that apply when you use MoveIn Report." },
    ],
  }),
  component: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-narrow py-12 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of use</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated October 2026</p>
        <p className="mt-5 rounded-[var(--radius)] border border-border bg-surface p-4 text-base">
          <span className="font-medium">The short version:</span> the report is your own record and
          not legal advice, your data lives only on your device, so keep your own copy, and we
          cannot promise how a landlord or tribunal will treat it.
        </p>

        {SECTIONS.map((s, i) => (
          <section key={s.title} className="mt-11">
            <h2 className="text-xl font-semibold tracking-tight">
              {i + 1}. {s.title}
            </h2>
            <ul className="mt-2 list-disc space-y-2.5 pl-5 text-base text-soft-foreground">
              {s.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        ))}

        <p className="mt-11 text-base text-soft-foreground">
          How your information is handled is explained on the{" "}
          <Link to="/privacy" className="font-medium text-foreground underline underline-offset-4">
            Privacy page
          </Link>
          .
        </p>
        <LegalFooter />
      </main>
    </div>
  ),
});
