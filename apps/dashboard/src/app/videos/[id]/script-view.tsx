"use client";

import { Empty } from "@/components/ui";
import { titleCase } from "@/lib/format";

/**
 * The Script tab: a storyboard script read as a person would, not as JSON (owner, 2026-11-25: every
 * beat was one long unwrapped JSON line, cut off on a phone). Setup and sourced facts first, then each
 * beat: its spoken line, the place, the camera and what happens on which word. Unknown fields fall
 * back to short readable text, so a script shape this page doesn't know still shows.
 */

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => Boolean(v) && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" || typeof v === "boolean" ? String(v) : "");

/** Any value as plain text: objects as "key: value · key: value", lists joined, nesting flattened. */
export function plain(v: unknown): string {
  if (v === null || v === undefined || v === "") return "";
  if (Array.isArray(v)) return v.map(plain).filter(Boolean).join(" · ");
  if (isObj(v)) return Object.entries(v).map(([k, x]) => { const p = plain(x); return p ? `${k}: ${p}` : ""; }).filter(Boolean).join(" · ");
  return String(v);
}

const SETUP: [string, string][] = [
  ["story", "Format"], ["shape", "Shape"], ["hook_style", "Hook style"], ["narrator", "Narrator"], ["language", "Language"],
  ["currency", "Currency"], ["cta", "Ending call to action"], ["feed_id", "Topic feed id"], ["seed", "Seed"],
];
const SKIP = new Set(["template", "format", "id", "title", "beats", "text", "facts", "maths", "thumbnail", "thumbnails", ...SETUP.map(([k]) => k)]);

function Field({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] gap-3 border-b border-line py-2 text-[13px] last:border-0">
      <dt className="text-[11.5px] font-medium text-muted">{k}</dt>
      <dd className="min-w-0 break-words font-semibold">{children}</dd>
    </div>
  );
}

function Heading({ tint, children }: { tint: string; children: React.ReactNode }) {
  return <h3 className={`eyebrow inline-block ${tint} px-2 py-0.5 text-ink rounded-md`}>{children}</h3>;
}

function Facts({ facts }: { facts: unknown }) {
  const list: Obj[] = Array.isArray(facts) ? facts.filter(isObj) : isObj(facts) ? Object.entries(facts).map(([label, v]): Obj => (isObj(v) ? { label, ...v } : { label, value: v })) : [];
  if (!list.length) return null;
  return (
    <section>
      <Heading tint="bg-tint-green">Sourced facts</Heading>
      <ol className="mt-2">
        {list.map((f, i) => {
          const url = str(f.url);
          return (
            <li key={i} className="border-b border-line py-2 text-[13px] last:border-0">
              <span className="font-mono text-xs text-muted">{`{fact${i + 1}}`}</span>{" "}
              <span className="font-semibold tabular-nums">{str(f.value)}{f.unit ? ` ${str(f.unit)}` : ""}</span>
              <span className="block break-words text-ink2">{str(f.label)}</span>
              <span className="block break-words text-[11.5px] text-muted">
                {url ? <a href={url} target="_blank" rel="noreferrer" className="underline">{str(f.source) || "source"}</a> : str(f.source)}
                {f.as_of ? ` · ${str(f.as_of)}` : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Maths({ maths }: { maths: unknown }) {
  const list = Array.isArray(maths) ? maths.filter(isObj) : [];
  if (!list.length) return null;
  return (
    <section>
      <Heading tint="bg-tint-brand">Calculations</Heading>
      <dl className="mt-2">
        {list.map((m, i) => {
          const { name, kind, ...rest } = m;
          return <Field key={i} k={str(name) || `#${i + 1}`}><span className="text-ink2">{str(kind)}</span> <span className="font-mono text-xs font-medium">{plain(rest)}</span></Field>;
        })}
      </dl>
    </section>
  );
}

/** "on <word>": a moment or camera change keyed to an event; the event names the spoken word. */
function cue(at: unknown, sec: unknown, events: Obj): string {
  const a = str(at);
  if (a) { const e = events[a]; const w = isObj(e) ? str(e.word) : ""; return w ? `on “${w.replace(/[,.?!।]+$/, "")}”` : `on ${a}`; }
  return sec === undefined ? "" : Number(sec) === 0 ? "at start" : `at ${str(sec)} s`;
}

function Beat({ beat, n }: { beat: Obj; n: number }) {
  const events = isObj(beat.events) ? beat.events : {};
  const params = isObj(beat.params) ? beat.params : {};
  const camera = Array.isArray(params.camera) ? params.camera.filter(isObj) : [];
  const moments = Array.isArray(params.moments) ? params.moments.filter(isObj) : [];
  const things = Array.isArray(params.things) ? params.things.map(str).filter(Boolean) : [];
  const sfx = Array.isArray(beat.sfx) ? beat.sfx.filter(isObj) : [];
  const fig = plain(params.fig);
  const say = str(beat.say) || str(beat.line);
  const tags = [str(beat.role), str(beat.scene), str(params.component), str(beat.chapter)].filter((t, i, a) => t && t !== str(beat.id) && a.indexOf(t) === i);
  return (
    <li className="border-b border-line py-3 last:border-0">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-mono text-xs font-semibold text-muted">{n}</span>
        <span className="text-[13px] font-semibold">{str(beat.id) || `Beat ${n}`}</span>
        {tags.map((t) => <span key={t} className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-ink2">{t}</span>)}
      </div>
      {say && <p className="mt-1.5 break-words text-[15px] font-medium leading-relaxed">{say}</p>}
      <dl className="mt-1.5 flex flex-col gap-1 text-[12.5px]">
        {str(params.place) && <div className="break-words"><dt className="inline font-medium text-muted">Place </dt><dd className="inline">{str(params.place)}</dd></div>}
        {camera.length > 0 && (
          <div className="break-words"><dt className="inline font-medium text-muted">Camera </dt>
            <dd className="inline">{camera.map((c) => [str(c.size), cue(c.at, c.sec, events)].filter(Boolean).join(" ")).join(" → ")}</dd></div>
        )}
        {things.length > 0 && <div className="break-words"><dt className="inline font-medium text-muted">Things </dt><dd className="inline">{things.join(", ")}</dd></div>}
        {fig && <div className="break-words"><dt className="inline font-medium text-muted">Figures </dt><dd className="inline font-mono text-xs">{fig}</dd></div>}
        {sfx.length > 0 && <div className="break-words"><dt className="inline font-medium text-muted">Sound </dt><dd className="inline">{sfx.map((s) => [str(s.kind), cue(s.at, s.sec, events)].filter(Boolean).join(" ")).join(", ")}</dd></div>}
      </dl>
      {moments.length > 0 && (
        <ul className="mt-1.5 flex flex-col gap-0.5 text-[12.5px]">
          {moments.map((m, i) => (
            <li key={i} className="break-words"><span className="font-medium text-muted">{cue(m.at, m.sec, events)}</span> {str(m.what) || plain(m)}</li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function ScriptView({ script }: { script: unknown }) {
  if (!isObj(script)) return <Empty>No script stored.</Empty>;
  const beats = Array.isArray(script.beats) ? script.beats.filter(isObj) : [];
  const lines = isObj(script.text) ? Object.entries(script.text).map(([k, v]) => [k, str(v)] as const) : [];
  const setup = SETUP.filter(([k]) => str(script[k])).map(([k, label]) => [label, str(script[k])] as const);
  const other = Object.entries(script).filter(([k, v]) => !SKIP.has(k) && plain(v)).map(([k, v]) => [titleCase(k), plain(v)] as const);
  const thumb = isObj(script.thumbnail) ? script.thumbnail : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <div className="flex min-w-0 flex-col gap-6">
        <section>
          <Heading tint="bg-tint-brand">Setup · the code computes every number from these</Heading>
          <dl className="mt-2">
            {[...setup, ...other].map(([k, v]) => <Field key={k} k={k}>{v}</Field>)}
          </dl>
        </section>
        <Facts facts={script.facts} />
        <Maths maths={script.maths} />
        {thumb && (
          <section>
            <Heading tint="bg-tint-pink">Thumbnail</Heading>
            <dl className="mt-2">
              {(["words", "tag", "figure", "layout", "angle"] as const).filter((k) => str(thumb[k])).map((k) => <Field key={k} k={titleCase(k)}>{str(thumb[k])}</Field>)}
            </dl>
          </section>
        )}
      </div>
      <div className="min-w-0">
        {beats.length > 0 ? (
          <section>
            <Heading tint="bg-tint-pink">Storyboard · {beats.length} beats</Heading>
            <ol className="mt-1">{beats.map((b, i) => <Beat key={i} beat={b} n={i + 1} />)}</ol>
          </section>
        ) : lines.length > 0 ? (
          <section>
            <Heading tint="bg-tint-pink">On-screen text, in order</Heading>
            <ol className="mt-2">
              {lines.map(([k, line]) => (
                <li key={k} className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-line py-2 text-[13.5px] font-medium last:border-0">
                  <span className="break-words">{line}</span><span className="text-xs font-medium text-muted">{k}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : <Empty>No beats stored.</Empty>}
      </div>
    </div>
  );
}
