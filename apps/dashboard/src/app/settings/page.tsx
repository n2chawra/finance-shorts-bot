"use client";

import { Bell, Bot, Film, Save, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, Card, ErrorNote, Loading, PageHeader, Toggle } from "@/components/ui";
import { useToast } from "@/components/toast";
import { usePatchSettings, useSettings } from "@/lib/queries";
import type { Settings } from "@/lib/schemas";

const field = "min-h-10 w-full rounded-lg border border-ring bg-surface px-3 text-sm shadow-card disabled:opacity-40";

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 border-b border-line py-3 last:border-0 md:flex-row md:items-center md:justify-between md:gap-6">
      <span className="text-sm"><span className="font-medium">{label}</span>{hint && <span className="block text-xs text-muted">{hint}</span>}</span>
      <span className="md:flex md:w-64 md:shrink-0 md:justify-end">{children}</span>
    </label>
  );
}

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
  const dirty = JSON.stringify(form) !== JSON.stringify(data);
  const int = (v: string) => (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : 0);
  const save = () => patch.mutate(form, { onSuccess: () => toast("Settings saved"), onError: (e) => toast(e.message, "error") });

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }} className="mx-auto max-w-3xl">
      <PageHeader title="Settings" sub="Workers and routines read these on every run">
        <Button type="submit" tone="primary" icon={Save} disabled={!dirty || patch.isPending}>{patch.isPending ? "Saving…" : dirty ? "Save changes" : "Saved"}</Button>
      </PageHeader>
      {patch.error && <div className="mb-4"><ErrorNote error={patch.error} /></div>}

      <Card title="Generation" icon={Bot}>
        <Row label="Pause generation" hint="Routines still start on schedule but do nothing: no videos, no template work.">
          <Toggle label="Pause generation" checked={form.generationPaused} onChange={(generationPaused) => set({ generationPaused })} />
        </Row>
        <Row label="Backlog cap" hint="Runs stop making videos at this many ready, and switch to template work.">
          <input type="number" min={1} max={100} required className={field} value={form.backlogCap} onChange={(e) => set({ backlogCap: int(e.target.value) })} />
        </Row>
        <Row label="Template runs per day" hint="How many runs a day may build or improve a template. Set to zero to stop template work.">
          <input type="number" min={0} max={4} required className={field} value={form.templateWork.maxPerDay} onChange={(e) => setWork({ maxPerDay: int(e.target.value) })} />
        </Row>
        <Row label="Maximum templates" hint="No new templates are built past this number; existing ones are improved instead.">
          <input type="number" min={1} max={50} required className={field} value={form.templateWork.maxTemplates} onChange={(e) => setWork({ maxTemplates: int(e.target.value) })} />
        </Row>
      </Card>

      <Card title="Uploads" icon={Upload} className="mt-4">
        <Row label="Pause all uploads" hint="Nothing is published while this is on. Generation carries on.">
          <Toggle label="Pause all uploads" checked={form.uploadsPaused} onChange={(uploadsPaused) => set({ uploadsPaused })} />
        </Row>
        <Row label="Upload time" hint="IST, once a day.">
          <input type="time" required className={field} value={form.uploadTime} onChange={(e) => set({ uploadTime: e.target.value })} />
        </Row>
      </Card>

      <Card title="Videos" icon={Film} className="mt-4">
        <Row label="Length range" hint="Seconds. QA rejects videos outside it.">
          <span className="flex w-full items-center gap-2">
            <input type="number" min={15} max={180} required aria-label="Minimum length in seconds" className={field} value={form.lengthMinSec} onChange={(e) => set({ lengthMinSec: int(e.target.value) })} />
            <span className="text-sm text-muted">to</span>
            <input type="number" min={15} max={180} required aria-label="Maximum length in seconds" className={field} value={form.lengthMaxSec} onChange={(e) => set({ lengthMaxSec: int(e.target.value) })} />
          </span>
        </Row>
        <Row label="Disclaimer" hint="Shown at the end of every video.">
          <input type="text" minLength={5} maxLength={120} required className={field} value={form.disclaimer} onChange={(e) => set({ disclaimer: e.target.value })} />
        </Row>
      </Card>

      <Card title="Telegram alerts" icon={Bell} className="mt-4">
        <Row label="Failed run"><Toggle label="Alert on failed run" checked={form.alerts.failedRun} onChange={(failedRun) => setAlert({ failedRun })} /></Row>
        <Row label="Failed upload"><Toggle label="Alert on failed upload" checked={form.alerts.failedUpload} onChange={(failedUpload) => setAlert({ failedUpload })} /></Row>
        <Row label="Token errors" hint="YouTube refresh token rejected."><Toggle label="Alert on token errors" checked={form.alerts.tokenErrors} onChange={(tokenErrors) => setAlert({ tokenErrors })} /></Row>
        <Row label="Low backlog"><Toggle label="Alert on low backlog" checked={form.alerts.lowBacklog} onChange={(lowBacklog) => setAlert({ lowBacklog })} /></Row>
        <Row label="Low backlog threshold" hint="Alert when fewer than this many videos are ready.">
          <input type="number" min={0} max={30} required disabled={!form.alerts.lowBacklog} className={field} value={form.alerts.lowBacklogThreshold} onChange={(e) => setAlert({ lowBacklogThreshold: int(e.target.value) })} />
        </Row>
      </Card>
      <p className="mt-3 text-xs text-muted">Sample data: saved values reset when the dev server restarts. Sign-in is not set up yet.</p>
    </form>
  );
}
