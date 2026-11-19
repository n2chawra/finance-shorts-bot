import type { Metadata } from "next";
import Link from "next/link";

import { Prose, PublicPage } from "@/components/public-page";
import { CONTACT_EMAIL } from "@/lib/public-pages";

export const metadata: Metadata = { title: "Terms of Service · Channel Studio", description: "Terms of use for Channel Studio, a private owner-only tool." };

export default function Terms() {
  return (
    <PublicPage>
      <Prose>
        <h1>Terms of Service</h1>
        <p><strong>Effective date: 19 November 2026</strong></p>
        <h2>Who may use it</h2>
        <p>
          Channel Studio is a private, internal tool. Only its owner may use it, and only with YouTube channels the owner owns.
          It offers no accounts or services to anyone else.
        </p>
        <h2>YouTube</h2>
        <p>
          The app uses YouTube API Services. Its use is subject to the{" "}
          <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">YouTube Terms of Service</a> and the{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>. How the app
          handles data is described in the <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <h2>No warranty</h2>
        <p>
          The app is provided &quot;as is&quot;, without warranty of any kind. Videos it makes are illustrative only and are not
          financial advice. To the extent the law allows, the owner is not liable for any loss arising from its use.
        </p>
        <h2>Changes</h2>
        <p>These terms may be updated on this page with a new effective date.</p>
        <h2>Contact</h2>
        <p><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      </Prose>
    </PublicPage>
  );
}
