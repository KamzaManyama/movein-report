/*
 * Whether the first-visit intro is showing is a class on <html>, not React state, so an
 * inline script can set it before the first paint and a new visitor never sees the home
 * page flash behind it. See the script in routes/__root.tsx.
 */
export const INTRO_SEEN_KEY = "movein-report:intro-seen";
export const INTRO_CLASS = "show-intro";
export const INTRO_OPEN_EVENT = "movein-report:intro-open";

/** Runs in <head> before paint. Kept dependency-free because it is inlined as a string. */
export const INTRO_BOOT_SCRIPT = `try{if(!localStorage.getItem("${INTRO_SEEN_KEY}"))document.documentElement.classList.add("${INTRO_CLASS}")}catch(e){}`;

export function isIntroOpen(): boolean {
  return document.documentElement.classList.contains(INTRO_CLASS);
}

export function openIntro(): void {
  document.documentElement.classList.add(INTRO_CLASS);
  window.dispatchEvent(new Event(INTRO_OPEN_EVENT));
}

export function closeIntro(): void {
  try {
    localStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    /* private browsing: the intro simply shows again next visit */
  }
  document.documentElement.classList.remove(INTRO_CLASS);
}
