/** Pages anyone can open without signing in: the API client's homepage, privacy policy and terms (Google's API audit needs them public). */
export const PUBLIC_PAGES = ["/about", "/privacy", "/terms"] as const;

export function isPublicPage(pathname: string): boolean {
  return (PUBLIC_PAGES as readonly string[]).includes(pathname.replace(/\/$/, "") || "/");
}

export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "n2chawra@gmail.com";
