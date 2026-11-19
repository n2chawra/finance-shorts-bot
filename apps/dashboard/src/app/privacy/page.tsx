import type { Metadata } from "next";

import { Prose, PublicPage } from "@/components/public-page";
import { CONTACT_EMAIL } from "@/lib/public-pages";

export const metadata: Metadata = { title: "Privacy Policy · Channel Studio", description: "How Channel Studio uses, stores and deletes data from YouTube API Services." };

export default function Privacy() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  return (
    <PublicPage>
      <Prose>
        <h1>Privacy Policy</h1>
        <p><strong>Effective date: 19 November 2026</strong></p>
        <p>
          Channel Studio (&quot;the app&quot;) is a private tool used only by its owner to make, upload, schedule and measure videos on
          the owner&apos;s own YouTube channels. This policy explains what data the app accesses, how it is used, stored and shared,
          and how to revoke access or ask for deletion.
        </p>

        <h2>YouTube API Services</h2>
        <p>
          The app uses <strong>YouTube API Services</strong> (the YouTube Data API and the YouTube Analytics and Reporting APIs). By
          using the app you agree to be bound by the{" "}
          <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">YouTube Terms of Service</a>. Google&apos;s
          handling of data is described in the{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.
        </p>

        <h2>Data the app accesses</h2>
        <ul>
          <li>OAuth tokens that the owner grants for the owner&apos;s own YouTube channels (no other accounts are ever connected).</li>
          <li>Channel and video metadata for those channels: titles, descriptions, tags, upload and privacy status, schedule times.</li>
          <li>YouTube Analytics and Reporting data for those channels: views, watch time, audience retention, traffic sources, impressions and similar aggregate reports.</li>
          <li>Public comments posted on the owner&apos;s own videos.</li>
          <li>Public statistics of other public videos in the channels&apos; topic areas (for example view counts), used only for short-term trend research.</li>
        </ul>
        <p>The app does not access viewers&apos; personal data beyond what YouTube reports in aggregate and the public comments above.</p>

        <h2>How the data is used</h2>
        <ul>
          <li>To upload the owner&apos;s videos to the owner&apos;s channels and schedule when they are published.</li>
          <li>To measure how those videos perform, shown to the owner on a password-protected dashboard, so future videos can be improved.</li>
        </ul>
        <p>The data is not used for advertising, profiling, or any purpose other than running the owner&apos;s own channels.</p>

        <h2>Storage and security</h2>
        <p>
          Refresh tokens are stored encrypted (AES-256-GCM) in the app&apos;s Postgres database or as encrypted deployment secrets.
          Video metadata and statistics are stored in the same database. Access to the database and the dashboard is limited to
          the owner.
        </p>

        <h2>Sharing</h2>
        <p>
          The app does not share, sell or transfer any data from YouTube API Services to third parties. It shows no ads and
          contains no third-party analytics or tracking.
        </p>

        <h2>Retention and deletion</h2>
        <p>
          Data obtained from YouTube API Services is refreshed or deleted within 30 days, unless it is still needed for the
          owner&apos;s own reporting on the owner&apos;s own channels. Trend data about other channels&apos; public videos is replaced at each
          refresh and never kept past 30 days. When a channel is disconnected, its tokens are deleted.
        </p>

        <h2>Revoking access</h2>
        <p>
          Access granted to the app can be revoked at any time on the Google security settings page:{" "}
          <a href="https://security.google.com/settings/security/permissions" target="_blank" rel="noopener noreferrer">https://security.google.com/settings/security/permissions</a>.
        </p>

        <h2>Deletion requests and contact</h2>
        <p>To ask for any stored data to be deleted, or with any question about this policy, email {mail}. Requests are handled within 30 days.</p>

        <h2>Cookies</h2>
        <p>
          The app sets one cookie: a session cookie that keeps the owner signed in to the dashboard. It sets no advertising,
          analytics or tracking cookies, and these public pages set none at all.
        </p>

        <h2>Changes</h2>
        <p>If this policy changes, the new version will be posted on this page with a new effective date.</p>
      </Prose>
    </PublicPage>
  );
}
