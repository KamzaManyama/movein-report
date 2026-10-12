/** Who runs the service. Shown on the Terms and Privacy pages. */
export const SITE = {
  name: "MoveIn Report",
  /** Legal name of the person or company that operates the app. */
  operator: "MoveIn Report",
  /** Public contact address. While null, the pages say contact details are coming soon. */
  contactEmail: null as string | null,
  copyrightYear: 2026,
};

export const COPYRIGHT_LINE = `© ${SITE.copyrightYear} ${SITE.operator}. All rights reserved.`;
