import type { Metadata } from "next";
import Link from "next/link";

import { Prose, PublicPage, YouTubeBadge } from "@/components/public-page";
import { CONTACT_EMAIL } from "@/lib/public-pages";

export const metadata: Metadata = {
  title: "Channel Studio",
  description: "Channel Studio: the owner's private tool for making, scheduling and measuring videos on the owner's own YouTube channels.",
};

const CHANNELS = [
  { name: "Paisa Panchayat", url: "https://www.youtube.com/channel/UCrRPx2PHGrTr0diYoAzvBRQ" },
  { name: "The Why Atlas", url: "https://www.youtube.com/channel/UCj07tN_bibMOuvk5C0-eesg" },
  { name: "A Billion Switches", url: "https://www.youtube.com/@ABillionSwitches" },
];

export default function About() {
  return (
    <PublicPage>
      <Prose>
        <h1>Channel Studio</h1>
        <p>
          Channel Studio is a private, internal tool run by one person, the owner of the YouTube channels listed below. It makes
          animated explainer videos for those channels, uploads and schedules them with the <strong>YouTube Data API</strong>, and
          reads the channels&apos; own statistics with the <strong>YouTube Analytics API</strong> to make future videos better.
        </p>
        <p>
          It is used only by the owner. There are no other users, no sign-ups and no public features: the dashboard behind it is
          password-protected, and it only ever connects to channels the owner owns.
        </p>

        <h2>The owner&apos;s channels</h2>
        <ul>
          {CHANNELS.map((c) => (
            <li key={c.name}><a href={c.url} target="_blank" rel="noopener noreferrer">{c.name}</a></li>
          ))}
        </ul>

        <h2>What it does with YouTube</h2>
        <ul>
          <li>Uploads the owner&apos;s finished videos to the owner&apos;s channels and schedules when they go public.</li>
          <li>Reads views, watch time, retention and similar reports for those videos, to learn what works.</li>
          <li>Reads public comments on the owner&apos;s own videos.</li>
        </ul>
        <p>
          How data from YouTube is used, stored and deleted is described in the <Link href="/privacy">Privacy Policy</Link>. Use of
          the tool is covered by the <Link href="/terms">Terms of Service</Link>. This tool uses YouTube API Services; see the{" "}
          <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">YouTube Terms of Service</a>.
        </p>
        <div className="pt-2"><YouTubeBadge /></div>
        <p>Contact: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      </Prose>
    </PublicPage>
  );
}
