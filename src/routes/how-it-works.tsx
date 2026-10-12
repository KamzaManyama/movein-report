import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Camera, ClipboardCheck, FileText } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { btnPrimary } from "@/components/layout/button-styles";
import { MAX_SAVED_INSPECTIONS } from "@/features/inspection/inspection.constants";

const HOW = [
  {
    icon: ClipboardCheck,
    title: "Inspect your room",
    text: "Follow a checklist built for your type of accommodation.",
  },
  {
    icon: Camera,
    title: "Record defects",
    text: "Note the condition of each area and attach photos as proof.",
  },
  {
    icon: FileText,
    title: "Share your report",
    text: "Generate a PDF and send it to your landlord or agent.",
  },
];

const STEP_DETAILS: { title: string; points: string[] }[] = [
  {
    title: "Choose the inspection type",
    points: [
      "Pick a move-in inspection when you arrive, or a move-out inspection when you hand the room back.",
      "Your choice becomes the title of the report.",
    ],
  },
  {
    title: "Tell us what you are renting",
    points: [
      "Choose a single room, a room with ensuite, shared accommodation or a bachelor room.",
      "The app builds a checklist to match — for example, an ensuite adds the toilet, basin, shower and plumbing.",
      "If you change this later, the checklist is rebuilt and anything already recorded for the old areas is cleared. You are asked to confirm first.",
    ],
  },
  {
    title: "Add the rental details",
    points: [
      "The address, room and inspection date are required so the report clearly identifies the room.",
      "Your name and your landlord's or agent's name and contact are optional.",
    ],
  },
  {
    title: "Choose the areas to inspect",
    points: [
      "Every area starts as “Inspect”. Mark an area “Can't access” if it is locked or blocked, or “Not applicable” if your room doesn't have it.",
      "Add your own areas, such as a balcony or storage room.",
      "Areas you can't access are still listed in the report, so nobody can later say you inspected them.",
    ],
  },
  {
    title: "Inspect each area",
    points: [
      "Give each area an overall condition: Good, Fair, Damaged or Unable to inspect.",
      "Add notes in your own words and take photos with your camera, or upload JPG, PNG or WebP photos of up to 20 MB each.",
      "Record each defect separately with a short description, a classification, notes and its own photos.",
      "Mark the area complete to move on to the next one. You can jump between areas and reopen any of them.",
    ],
  },
  {
    title: "Record meter readings",
    points: [
      "This step is optional. Add electricity, water or other meters with the reading, the meter number and a photo.",
      "A recorded reading can help avoid disputes about what you used.",
    ],
  },
  {
    title: "Review and generate the report",
    points: [
      "You see a summary and a list of anything left incomplete, each with a link to fix it.",
      "You can still generate the report with items incomplete — they are shown as “Not recorded”, never as “Good”.",
      "Download the PDF, or share it straight from your phone to email or a messaging app where your device supports it.",
    ],
  },
];

const EXTRA: { title: string; points: string[] }[] = [
  {
    title: "What is in the report",
    points: [
      "A unique reference number, the rental details and the inspection date.",
      "A summary: areas inspected, areas you couldn't access, defects recorded and photos attached.",
      "An area-by-area record with the condition, your notes, each defect and the photos.",
      "Meter readings, page numbers, and a note that the report is your personal record and not a legal certification. Dates come from your device's clock.",
    ],
  },
  {
    title: "Saving and picking up later",
    points: [
      "Every change is saved automatically on your device. The header shows “Saved on this device” when it is done.",
      "Close the app whenever you like and continue from the home page later, in the same browser on the same device.",
      `Up to ${MAX_SAVED_INSPECTIONS} inspections are kept. Starting another removes the oldest one, after asking you to confirm.`,
      "Download your report once it is generated — the PDF is the copy you keep.",
    ],
  },
  {
    title: "Tips for a strong report",
    points: [
      "Inspect in daylight, before you move your belongings in.",
      "Take one wide photo of each area, then close-ups of every mark, crack or stain.",
      "Send the report to your landlord or agent on the day, so there is a dated record that they received it.",
    ],
  },
];

function PointList({ points }: { points: string[] }) {
  return (
    <ul className="mt-2 list-disc space-y-2.5 pl-5 text-base text-soft-foreground">
      {points.map((p) => (
        <li key={p}>{p}</li>
      ))}
    </ul>
  );
}

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — MoveIn Report" },
      {
        name: "description",
        content:
          "Inspect your room, record defects with photos, then generate and share a PDF report.",
      },
      { property: "og:title", content: "How it works — MoveIn Report" },
      {
        property: "og:description",
        content: "Inspect your room, record defects with photos, then share a PDF report.",
      },
    ],
  }),
  component: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-wide py-12 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight">How it works</h1>
        <p className="mt-3 max-w-2xl text-lg text-soft-foreground">
          MoveIn Report walks you through your room, area by area, and turns what you record into a
          PDF report you can send to your landlord. It takes about 15 minutes and there is no
          account to create.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {HOW.map(({ icon: Icon, title, text }, i) => (
            <div key={title}>
              <span className="grid size-10 place-items-center rounded-xl border border-border bg-surface">
                <Icon className="size-5" aria-hidden />
              </span>
              <h2 className="mt-4 font-medium">
                {i + 1}. {title}
              </h2>
              <p className="mt-1 text-sm text-soft-foreground">{text}</p>
            </div>
          ))}
        </div>

        <section className="mt-14 max-w-2xl border-t border-border pt-10">
          <h2 className="text-2xl font-semibold tracking-tight">Step by step</h2>
          <ol className="mt-8 space-y-9">
            {STEP_DETAILS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {i + 1}
                </span>
                <div>
                  <h3 className="pt-1 font-medium">{s.title}</h3>
                  <PointList points={s.points} />
                </div>
              </li>
            ))}
          </ol>
        </section>

        {EXTRA.map((s) => (
          <section key={s.title} className="mt-10 max-w-2xl border-t border-border pt-10">
            <h2 className="text-2xl font-semibold tracking-tight">{s.title}</h2>
            <PointList points={s.points} />
          </section>
        ))}

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link to="/" className={btnPrimary}>
            Start an inspection <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link to="/privacy" className="text-sm font-medium underline underline-offset-4">
            Read how your data is handled
          </Link>
          <Link to="/terms" className="text-sm font-medium underline underline-offset-4">
            Terms of use
          </Link>
        </div>
      </main>
    </div>
  ),
});
