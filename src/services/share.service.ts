type ShareNavigator = Pick<Navigator, "share" | "canShare">;

/** True only when this browser can share a file through the native share sheet. */
export function canShareFiles(
  file: File,
  nav: Partial<ShareNavigator> | undefined = globalThis.navigator,
): boolean {
  if (!nav || typeof nav.share !== "function" || typeof nav.canShare !== "function") return false;
  try {
    return nav.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export type ShareOutcome = "shared" | "cancelled";

/** Must be called directly from a user gesture. */
export async function shareFile(
  file: File,
  title: string,
  text: string,
  nav: Partial<ShareNavigator> = globalThis.navigator,
): Promise<ShareOutcome> {
  try {
    await nav.share!({ files: [file], title, text });
    return "shared";
  } catch (e) {
    if ((e as { name?: string })?.name === "AbortError") return "cancelled";
    throw e;
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
