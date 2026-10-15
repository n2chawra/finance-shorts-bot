"use client";

import { Bell, Bot, Film, Plus, Sparkles, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { Button, Card, ErrorNote, Loading, PageHeader, Toggle, fieldClass } from "@/components/ui";
import { useToast } from "@/components/toast";
import { usePatchSettings, useSettings } from "@/lib/queries";
import type { Settings } from "@/lib/schemas";

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 border-b border-line py-3.5 first:pt-0 last:border-0 last:pb-0 md:flex-row md:items-center md:justify-between md:gap-8">
      <span className="text-[13px]"><span className="font-medium">{label}</span>{hint && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{hint}</span>}</span>
      <span className="md:flex md:w-60 md:shrink-0 md:justify-end">{children}</span>
    </label>
  );
}

const SECTIONS = [
  { id: "generation", label: "Generation", icon: Bot },
  { id: "uploads", label: "Uploads", icon: Upload },
  { id: "videos", label: "Videos", icon: Film },
  { id: "agents", label: "Agents", icon: Sparkles },
  { id: "alerts", label: "Alerts", icon: Bell },
];

export default function SettingsPage() {
  const { data, error, isLoading } = useSettings();
  const patch = usePatchSettings();
  const toast = useToast();
  const [form, setForm] = useState<Settings | null>(null);
  // adopt server values on first load, and again whenever they change while the form is untouched
  const [base, setBase] = useState<Settings | null>(null);
  useEffect(() => {
    if (!data) return;
    setForm((f) => (f === null || JSON.stringify(f) === JSON.stringify(base) ? data : f));
    setBase(data);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading || (data && !form)) return <Loading />;
  if (error || !data || !form) return <ErrorNote error={error} />;
  const set = (p: Partial<Settings>) => setForm({ ...form, ...p });
  const setAlert = (p: Partial<Settings["alerts"]>) => set({ alerts: { ...form.alerts, ...p } });
  const setWork = (p: Partial<Settings["templateWork"]>) => set({ templateWork: { ...form.templateWork, ...p } });
  const setAgents = (p: Partial<Settings["agents"]>) => set({ agents: { ...form.agents, ...p } });
  const dirty = JSON.stringify(form) !== JSON.stringify(data);
  const int = (v: string) => (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : 0);
  const save = () => patch.mutate(form, { onSuccess: () => toast("Settings saved"), onError: (e) => toast(e.message, "error") });

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }}>
      <PageHeader title="Settings" sub="Workers read these on every run; routines get them within a minute of the next commit (or within 6 hours)" />
      {patch.error && <div className="mb-4"><ErrorNote error={patch.error} /></div>}

      <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,720px)]">
        <nav aria-label="Settings sections" className="hidden lg:block">
          <ul className="sticky top-20 flex flex-col gap-0.5">
            {SECTIONS.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} className="flex h-8 items-center gap-2 rounded-lg px-2 text-[13px] text-ink2 hover:bg-wash-2 hover:text-ink"><s.icon aria-hidden className="size-4 text-muted" />{s.label}</a></li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-col gap-3">
          <section id="generation" className="scroll-mt-20">
            <Card title="Generation" description="What the scheduled routines do">
              <Row label="Pause generation" hint="Routines still start on schedule but do nothing: no videos, no template work.">
                <Toggle label="Pause generation" checked={form.generationPaused} onChange={(generationPaused) => set({ generationPaused })} />
              </Row>
              <Row label="Backlog cap" hint="Runs stop making videos at this many ready, and switch to template work.">
                <input type="number" min={1} max={100} required className={fieldClass} value={form.backlogCap} onChange={(e) => set({ backlogCap: int(e.target.value) })} />
              </Row>
              <Row label="Template runs per day" hint="How many runs a day may build or improve a template. Zero stops template work.">
                <input type="number" min={0} max={4} required className={fieldClass} value={form.templateWork.maxPerDay} onChange={(e) => setWork({ maxPerDay: int(e.target.value) })} />
              </Row>
              <Row label="Maximum templates" hint="No new templates past this number; existing ones get improved instead.">
                <input type="number" min={1} max={50} required className={fieldClass} value={form.templateWork.maxTemplates} onChange={(e) => setWork({ maxTemplates: int(e.target.value) })} />
              </Row>
            </Card>
          </section>

          <section id="uploads" className="scroll-mt-20">
            <Card title="Uploads" description="The daily publish job">
              <Row label="Pause all uploads" hint="Nothing is published while this is on. Generation carries on. Use it while you upload by hand.">
                <Toggle label="Pause all uploads" checked={form.uploadsPaused} onChange={(uploadsPaused) => set({ uploadsPaused })} />
              </Row>
              <Row label="Upload times" hint="IST. One video goes public at each time, so this is also the number of uploads a day.">
                <span className="flex w-full flex-col gap-2">
                  {form.uploadTimes.map((t, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <input type="time" required aria-label={`Upload time ${i + 1}`} className={fieldClass} value={t}
                        onChange={(e) => set({ uploadTimes: form.uploadTimes.map((x, j) => (j === i ? e.target.value : x)) })} />
                      <Button size="sm" tone="ghost" iconOnly icon={X} title="Remove this time" disabled={form.uploadTimes.length === 1}
                        onClick={() => set({ uploadTimes: form.uploadTimes.filter((_, j) => j !== i) })}>Remove</Button>
                    </span>
                  ))}
                  {form.uploadTimes.length < 4 && (
                    <Button size="sm" tone="ghost" icon={Plus} onClick={() => set({ uploadTimes: [...form.uploadTimes, "21:07"] })}>Add a time</Button>
                  )}
                </span>
              </Row>
            </Card>
          </section>

          <section id="videos" className="scroll-mt-20">
            <Card title="Videos" description="Rules every render must meet">
              <Row label="Length range" hint="Seconds. QA rejects videos outside it.">
                <span className="flex w-full items-center gap-2">
                  <input type="number" min={15} max={180} required aria-label="Minimum length in seconds" className={fieldClass} value={form.lengthMinSec} onChange={(e) => set({ lengthMinSec: int(e.target.value) })} />
                  <span className="text-xs text-muted">to</span>
                  <input type="number" min={15} max={180} required aria-label="Maximum length in seconds" className={fieldClass} value={form.lengthMaxSec} onChange={(e) => set({ lengthMaxSec: int(e.target.value) })} />
                </span>
              </Row>
              <Row label="Disclaimer" hint="Shown at the end of every video.">
                <input type="text" minLength={5} maxLength={120} required className={fieldClass} value={form.disclaimer} onChange={(e) => set({ disclaimer: e.target.value })} />
              </Row>
            </Card>
          </section>

          <section id="agents" className="scroll-mt-20">
            <Card title="Self-improving agents" description="Nightly, 23:00–09:00 IST. Every change they make passes a guard and the tests before it goes live.">
              <Row label="Pause all agents" hint="They still start on schedule but do nothing. The video pipeline is not affected.">
                <Toggle label="Pause all agents" checked={form.agents.paused} onChange={(paused) => setAgents({ paused })} />
              </Row>
              <Row label="Auditor (23:00)" hint="Checks the dashboard's numbers against YouTube, fixes bugs anywhere, one careful refactor a night.">
                <Toggle label="Auditor agent on" checked={form.agents.auditor} disabled={form.agents.paused} onChange={(auditor) => setAgents({ auditor })} />
              </Row>
              <Row label="Research (00:07)" hint="Studies top Shorts and Claude updates, writes proposals. Never changes code.">
                <Toggle label="Research agent on" checked={form.agents.research} disabled={form.agents.paused} onChange={(research) => setAgents({ research })} />
              </Row>
              <Row label="Improver (05:17)" hint="Tests changes on half the new videos, keeps or reverts them by the numbers, manages templates.">
                <Toggle label="Improver agent on" checked={form.agents.improver} disabled={form.agents.paused} onChange={(improver) => setAgents({ improver })} />
              </Row>
              <Row label="Dashboard (06:47)" hint="Hunts bugs and makes one small improvement a night.">
                <Toggle label="Dashboard agent on" checked={form.agents.dashboard} disabled={form.agents.paused} onChange={(dashboard) => setAgents({ dashboard })} />
              </Row>
              <Row label="Experiments at once" hint="How many A/B tests may run at the same time. Fewer means clearer results; more means faster learning.">
                <input type="number" min={0} max={6} required className={fieldClass} value={form.agents.maxActiveExperiments} onChange={(e) => setAgents({ maxActiveExperiments: int(e.target.value) })} />
              </Row>
            </Card>
          </section>

          <section id="alerts" className="scroll-mt-20">
            <Card title="Alerts" description="The hourly watchdog shows problems on the Notifications page. Telegram delivery comes later.">
              <Row label="Failed run"><Toggle label="Alert on failed run" checked={form.alerts.failedRun} onChange={(failedRun) => setAlert({ failedRun })} /></Row>
              <Row label="Failed upload"><Toggle label="Alert on failed upload" checked={form.alerts.failedUpload} onChange={(failedUpload) => setAlert({ failedUpload })} /></Row>
              <Row label="Token errors" hint="YouTube refresh token rejected."><Toggle label="Alert on token errors" checked={form.alerts.tokenErrors} onChange={(tokenErrors) => setAlert({ tokenErrors })} /></Row>
              <Row label="Low backlog"><Toggle label="Alert on low backlog" checked={form.alerts.lowBacklog} onChange={(lowBacklog) => setAlert({ lowBacklog })} /></Row>
              <Row label="Low backlog threshold" hint="Alert when fewer than this many videos are ready.">
                <input type="number" min={0} max={30} required disabled={!form.alerts.lowBacklog} className={fieldClass} value={form.alerts.lowBacklogThreshold} onChange={(e) => setAlert({ lowBacklogThreshold: int(e.target.value) })} />
              </Row>
            </Card>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {dirty && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-xl border border-ring bg-surface px-4 py-2.5 shadow-lift md:left-[calc(15rem+2rem)]">
            <span className="text-[13px]"><span className="font-medium">Unsaved changes</span><span className="hidden text-muted sm:inline"> · take effect once saved</span></span>
            <span className="flex gap-2">
              <Button tone="ghost" onClick={() => setForm(data)}>Discard</Button>
              <Button type="submit" tone="primary" disabled={patch.isPending}>{patch.isPending ? "Saving…" : "Save changes"}</Button>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
