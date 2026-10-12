import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalFooter } from "@/components/layout/LegalFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MAX_SAVED_INSPECTIONS } from "@/features/inspection/inspection.constants";

const SECTIONS: { title: string; intro?: string; points: string[] }[] = [
  {
    title: "What you enter",
    intro: "The app only holds what you put into it:",
    points: [
      "Rental details: the property address, room, inspection date and, if you choose to add them, your name and your landlord's or agent's name and contact.",
      "Your inspection: the condition of each area, your notes and the defects you describe.",
      "Photos you take or upload, and any meter readings and meter numbers.",
    ],
  },
  {
    title: "Where it is stored",
    points: [
      "Everything is saved in this browser's own storage on your device.",
      "There is no account, no sign-in and no MoveIn Report database. Your inspections and photos are not uploaded to us.",
      "Because the data lives in the browser, it does not appear on your other devices or in other browsers.",
    ],
  },
  {
    title: "Photos and your camera",
    points: [
      "The camera opens only when you tap “Take photo”, through your phone's own camera screen. The app cannot use the camera in the background.",
      "Each photo is resized and converted to JPEG on your device to save space, then stored with your inspection.",
      "Removing a photo from an inspection deletes it from the app's storage. Photos you took may still be in your phone's gallery, which the app does not control.",
    ],
  },
  {
    title: "Your report",
    points: [
      "The PDF is created on your device. It is not sent anywhere when it is generated.",
      "It leaves your device only when you download it or share it yourself.",
      "Once you send it, the copy is in the hands of the person and the email or messaging service you chose.",
    ],
  },
  {
    title: "No tracking",
    points: [
      "The app contains no advertising and no analytics trackers, and it does not build a profile of you.",
      "Like any website, the service that hosts the app receives basic technical information, such as your IP address and browser type, when pages load. That does not include your inspections or photos.",
    ],
  },
  {
    title: "How long it is kept and how to delete it",
    points: [
      "An inspection stays on your device until you delete it from the home page. Deleting it also removes its photos.",
      `Up to ${MAX_SAVED_INSPECTIONS} inspections are kept. Starting another removes the oldest, after asking you to confirm.`,
      "Clearing this site's data or your browsing data in your browser settings removes everything at once.",
    ],
  },
  {
    title: "This is not a backup",
    points: [
      "Browsers can clear stored data on their own, for example when the device runs low on space or in private browsing. The app asks the browser to keep your data, but that is not guaranteed.",
      "If you lose or reset your device, the inspections on it are gone. We cannot recover them, because we never had them.",
      "Download or share your report as soon as it is generated so you have your own copy.",
    ],
  },
  {
    title: "Other people's details",
    points: [
      "If you add your landlord's or agent's name and contact, they are stored on your device like everything else and printed on the report you choose to share.",
      "Shared spaces can have other people in them. Avoid photographing people, and share the report only with those who need it.",
    ],
  },
];

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — MoveIn Report" },
      {
        name: "description",
        content: "Your inspection data and photos stay in your browser on this device.",
      },
      { property: "og:title", content: "Privacy — MoveIn Report" },
      {
        property: "og:description",
        content: "Your inspection data and photos stay in your browser on this device.",
      },
    ],
  }),
  component: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container-narrow py-12 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated October 2026</p>
        <p className="mt-5 rounded-[var(--radius)] border border-border bg-surface p-4 text-base">
          <span className="font-medium">The short version:</span> your inspections and photos stay
          in this browser on your device. Nothing is uploaded unless you share the report yourself.
        </p>

        {SECTIONS.map((s) => (
          <section key={s.title} className="mt-11">
            <h2 className="text-xl font-semibold tracking-tight">{s.title}</h2>
            {s.intro && <p className="mt-2 text-base text-soft-foreground">{s.intro}</p>}
            <ul className="mt-2 list-disc space-y-2.5 pl-5 text-base text-soft-foreground">
              {s.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        ))}

        <p className="mt-11 text-base text-soft-foreground">
          If the way the app handles data changes, this page will be updated first. The rules for
          using the app are in the{" "}
          <Link to="/terms" className="font-medium text-foreground underline underline-offset-4">
            Terms of use
          </Link>
          .
        </p>
        <LegalFooter />
      </main>
    </div>
  ),
});
