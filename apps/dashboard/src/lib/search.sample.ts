import { matches, type SearchResult } from "./search";

/** Sample search data (no database): four channels with a few videos each. */
const channels = [
  { id: "paisa-panchayat", name: "Paisa Panchayat", status: "active" },
  { id: "geography-maps-geopolitical-mysteries", name: "The Why Atlas", status: "active" },
  { id: "how-tech-and-ai-actually-work-chips-ai-p", name: "A Billion Switches", status: "active" },
  { id: "business-documentaries-rise-and-fall-of", name: "Craze & Crash", status: "active" },
];
const name = (id: string) => channels.find((c) => c.id === id)!.name;
const v = (id: string, title: string, status: string, channelId: string, views: number | null, format = "short") =>
  ({ id, title, status, format, channelId, channelName: name(channelId), views });

const videos = [
  v("v-20261118-01", "Why a $5 Costco hot dog never went up in price", "published", "paisa-panchayat", 1190),
  v("v-20261118-02", "What Netflix makes on your monthly plan", "published", "paisa-panchayat", 842),
  v("v-20261119-01", "How much a Taylor Swift ticket really pays her", "queued", "paisa-panchayat", null),
  v("L-20261118-01", "The full story of the Costco hot dog", "scheduled", "paisa-panchayat", null, "long"),
  v("v-20261117-01", "Why the Suez Canal can't be widened", "published", "geography-maps-geopolitical-mysteries", 5320),
  v("v-20261118-03", "Why Russia has eleven time zones", "published", "geography-maps-geopolitical-mysteries", 2210),
  v("v-20261119-02", "Why Bolivia has a navy but no sea", "queued", "geography-maps-geopolitical-mysteries", null),
  v("v-20261117-02", "How a phone chip fits 15 billion switches", "published", "how-tech-and-ai-actually-work-chips-ai-p", 3480),
  v("v-20261119-03", "What actually happens when you ask an AI a question", "queued", "how-tech-and-ai-actually-work-chips-ai-p", null),
  v("L-20261119-01", "How Nokia lost the phone it invented", "rendered", "business-documentaries-rise-and-fall-of", null, "long"),
  v("v-20261119-04", "The Crocs comeback nobody saw coming", "queued", "business-documentaries-rise-and-fall-of", null),
];

export function sampleSearch(q: string): SearchResult {
  return {
    channels: channels.filter((c) => matches(q, c.name, c.id)),
    videos: videos.filter((x) => matches(q, x.title, x.id)).slice(0, 20),
  };
}
