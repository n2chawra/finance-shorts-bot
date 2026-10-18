// Audio + picture probe for the yt-style skill. Runs inside the YouTube watch page in the built-in
// browser: it listens to the <video> element's sound with the Web Audio API while it plays and
// keeps only numbers (nothing is recorded or downloaded). Paste the whole file into
// javascript_tool once per page, then:
//   await __ap.start()   attach to the player and play; leave it playing 30-60 s, don't seek
//   __ap.status()        seconds measured so far
//   __ap.report()        stop and return the measurements
(() => {
  if (window.__ap) return "probe already loaded";
  const S = { ctx: null, timer: null, rows: [], env: [], envRate: 0, prevPix: null, off: false };
  const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  // Krumhansl-Kessler key profiles
  const MAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const MIN = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  const db = (x) => 10 * Math.log10(Math.max(x, 1e-12));
  const sorted = (a) => [...a].sort((x, y) => x - y);
  const pct = (a, p) => { const s = sorted(a); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : null; };
  const median = (a) => pct(a, 0.5);
  const mad = (a) => { const m = median(a); return median(a.map((x) => Math.abs(x - m))); };
  const r1 = (x) => (x == null || !isFinite(x) ? null : Math.round(x * 10) / 10);
  const r2 = (x) => (x == null || !isFinite(x) ? null : Math.round(x * 100) / 100);
  const corr = (a, b) => {
    const ma = a.reduce((s, x) => s + x, 0) / a.length, mb = b.reduce((s, x) => s + x, 0) / b.length;
    let n = 0, da = 0, dd = 0;
    for (let i = 0; i < a.length; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; dd += (b[i] - mb) ** 2; }
    return n / Math.sqrt(da * dd || 1);
  };
  const adShowing = () => !!document.querySelector(".ad-showing");

  async function start() {
    const v = document.querySelector("video");
    if (!v) throw new Error("no <video> on the page");
    if (!S.ctx) {
      S.ctx = new AudioContext();
      const src = S.ctx.createMediaElementSource(v);
      src.connect(S.ctx.destination);
      S.an = S.ctx.createAnalyser();
      S.an.fftSize = 4096;
      S.an.smoothingTimeConstant = 0;
      src.connect(S.an);
      // the beat: energy below 150 Hz every 256 samples (~5 ms), for the tempo
      const lp = S.ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 150;
      const sp = S.ctx.createScriptProcessor(1024, 1, 1);
      const mute = S.ctx.createGain();
      mute.gain.value = 0;
      src.connect(lp); lp.connect(sp); sp.connect(mute); mute.connect(S.ctx.destination);
      const hop = 256;
      S.envRate = S.ctx.sampleRate / hop;
      sp.onaudioprocess = (e) => {
        if (v.paused || S.off || adShowing()) return;
        const d = e.inputBuffer.getChannelData(0);
        for (let i = 0; i < d.length; i += hop) { let s = 0; for (let j = i; j < i + hop; j++) s += d[j] * d[j]; S.env.push(s / hop); }
      };
      S.cv = document.createElement("canvas");
      S.cv.width = 32; S.cv.height = 18;
      S.cx = S.cv.getContext("2d", { willReadFrequently: true });
      S.v = v;
    }
    await S.ctx.resume();
    // a fresh measurement each start (YouTube reuses the same <video> for the next video)
    S.rows = []; S.env = []; S.prevPix = null; S.off = false;
    const freq = new Float32Array(S.an.frequencyBinCount), time = new Float32Array(S.an.fftSize);
    const binHz = S.ctx.sampleRate / S.an.fftSize;
    let prevMag = null;
    clearInterval(S.timer);
    S.timer = setInterval(() => {
      if (v.paused || adShowing()) { prevMag = null; return; }
      S.an.getFloatFrequencyData(freq);
      S.an.getFloatTimeDomainData(time);
      let ms = 0;
      for (const x of time) ms += x * x;
      ms /= time.length;
      const mag = Array.from(freq, (d) => 10 ** (d / 20));
      let tot = 0, sub = 0, low = 0, voice = 0, high = 0, cen = 0, flux = 0, hiFlux = 0;
      const chroma = new Array(12).fill(0);
      for (let k = 1; k < mag.length; k++) {
        const f = k * binHz, p = mag[k] * mag[k];
        tot += p; cen += f * p;
        if (f < 80) sub += p;
        if (f < 150) low += p; else if (f >= 300 && f < 3400) voice += p; else if (f >= 4000) high += p;
        if (f >= 250 && f <= 2000) { const m = Math.round(12 * Math.log2(f / 440)) + 9; chroma[((m % 12) + 12) % 12] += mag[k]; }
        if (prevMag) { const dl = mag[k] - prevMag[k]; if (dl > 0) { flux += dl; if (f >= 4000) hiFlux += dl; } }
      }
      prevMag = mag;
      let pix = null;
      try {
        S.cx.drawImage(v, 0, 0, 32, 18);
        const px = S.cx.getImageData(0, 0, 32, 18).data;
        if (S.prevPix) {
          let dsum = 0;
          for (let i = 0; i < px.length; i += 4) dsum += Math.abs(px[i] - S.prevPix[i]) + Math.abs(px[i + 1] - S.prevPix[i + 1]) + Math.abs(px[i + 2] - S.prevPix[i + 2]);
          pix = dsum / (32 * 18 * 3);
        }
        S.prevPix = px.slice();
      } catch { pix = null; }
      const t = tot || 1e-12;
      S.rows.push({ t: v.currentTime, db: db(ms), sub: sub / t, low: low / t, voice: voice / t, high: high / t, cen: cen / t, chroma, flux, hiFlux, pix });
    }, 50);
    if (v.paused) await v.play().catch(() => {});
    return { playing: !v.paused, at: r1(v.currentTime), context: S.ctx.state, sampleRate: S.ctx.sampleRate };
  }

  function status() {
    return { seconds: r1(S.rows.length * 0.05), playing: S.v ? !S.v.paused : false, at: S.v ? r1(S.v.currentTime) : null, ad: adShowing(), context: S.ctx && S.ctx.state };
  }

  function tempo() {
    if (S.env.length < S.envRate * 8) return { bpm: null, note: "under 8 s of audio" };
    const e = S.env.map((x) => Math.log10(x + 1e-9));
    const on = e.map((x, i) => (i ? Math.max(0, x - e[i - 1]) : 0));
    const mean = on.reduce((s, x) => s + x, 0) / on.length;
    const o = on.map((x) => x - mean);
    const scores = [];
    for (let bpm = 60; bpm <= 180; bpm += 0.5) {
      const lag = (60 * S.envRate) / bpm, L = Math.floor(lag), fr = lag - L;
      let s = 0;
      for (let i = 0; i + L + 1 < o.length; i++) s += o[i] * (o[i + L] * (1 - fr) + o[i + L + 1] * fr);
      scores.push([bpm, s / (o.length - L)]);
    }
    // prefer the usual pop range a little, so a half or double tempo doesn't win on a tie
    const weighted = scores.map(([b, s]) => [b, s * Math.exp(-0.5 * Math.log2(b / 115) ** 2)]);
    const best = weighted.reduce((a, b) => (b[1] > a[1] ? b : a));
    const raw = scores.map((x) => x[1]);
    const strength = (scores.find((x) => x[0] === best[0])[1] - median(raw)) / (mad(raw) || 1e-9);
    const near = (b) => scores.reduce((a, x) => (Math.abs(x[0] - b) < Math.abs(a[0] - b) ? x : a));
    return {
      bpm: best[0],
      confidence: strength > 8 ? "high" : strength > 4 ? "medium" : "low",
      strength: r1(strength),
      alternatives: [best[0] / 2, best[0] * 2].filter((b) => b >= 60 && b <= 180).map((b) => ({ bpm: b, relative: r2(near(b)[1] / (near(best[0])[1] || 1e-9)) })),
    };
  }

  function key(rows) {
    const c = new Array(12).fill(0);
    for (const r of rows) { const s = r.chroma.reduce((a, x) => a + x, 0) || 1; r.chroma.forEach((x, i) => (c[i] += x / s)); }
    const out = [];
    for (let k = 0; k < 12; k++) {
      const rot = c.slice(k).concat(c.slice(0, k));
      out.push({ key: KEYS[k] + " major", r: corr(rot, MAJ) }, { key: KEYS[k] + " minor", r: corr(rot, MIN) });
    }
    out.sort((a, b) => b.r - a.r);
    const rel = (k) => { const [n, q] = k.split(" "), i = KEYS.indexOf(n); return q === "major" ? KEYS[(i + 9) % 12] + " minor" : KEYS[(i + 3) % 12] + " major"; };
    if (out[0].r < 0.5) return { best: null, note: `no clear key (best guess ${out[0].key} at ${r2(out[0].r)}): music too quiet or too busy under the voice` };
    return { best: out[0].key, sameNotesAs: rel(out[0].key), score: r2(out[0].r), runnerUp: out[1].key, runnerUpScore: r2(out[1].r),
      note: "a major key and its relative minor share notes; treat the pair as one answer" };
  }

  function peaks(vals, times, thresh, gap) {
    const out = [];
    for (let i = 1; i < vals.length - 1; i++) {
      if (vals[i] == null || vals[i] < thresh || vals[i] < vals[i - 1] || vals[i] < vals[i + 1]) continue;
      if (out.length && times[i] - out[out.length - 1].t < gap) { if (vals[i] > out[out.length - 1].v) out[out.length - 1] = { t: times[i], v: vals[i], i }; continue; }
      out.push({ t: times[i], v: vals[i], i });
    }
    return out;
  }

  function report() {
    S.off = true;
    clearInterval(S.timer);
    if (S.v) S.v.pause();
    const R = S.rows;
    if (R.length < 100) return { error: "under 5 s measured; start() and let it play first", ...status() };
    const span = R[R.length - 1].t - R[0].t;
    const sounding = R.filter((r) => r.db > -50);

    // speech: the voice band (300-3400 Hz) swinging syllable by syllable over a 1 s window
    const vb = R.map((r) => r.db + db(r.voice));
    const speech = R.map((r, i) => {
      const w = vb.slice(Math.max(0, i - 10), i + 10);
      const m = w.reduce((s, x) => s + x, 0) / w.length;
      const sd = Math.sqrt(w.reduce((s, x) => s + (x - m) ** 2, 0) / w.length);
      return r.db > -50 && r.voice > 0.35 && sd > 4.5;
    });
    const speechRows = R.filter((_, i) => speech[i]);
    // music-only: no speech within half a second either side, so word gaps don't count
    const quiet = (pad) => R.filter((r, i) => r.db > -50 && !speech.slice(Math.max(0, i - pad), i + pad + 1).some(Boolean));
    // music alone: stretches of 1 s+ with no voice; short word gaps still carry the voice's tail and the duck
    const musicRows = quiet(10);
    const gapRows = quiet(4);
    // the music bed under the voice: the sub band, below 80 Hz, where voices carry almost nothing
    const bed = R.map((r) => r.db + db(r.sub));
    const bass = (rows) => median(rows.map((r) => r.db + db(r.sub)));

    // silences, and drops: the music bed falling 10 dB under its last 3 s for 0.4 s or more
    const silences = [], drops = [];
    let run = null;
    R.forEach((r) => {
      if (r.db < -50) { run = run || { start: r.t, n: 0 }; run.n++; }
      else { if (run && run.n >= 3) silences.push({ at: r1(run.start), sec: r2(run.n * 0.05) }); run = null; }
    });
    for (let i = 60; i + 8 < R.length; i++) {
      const ref = median(bed.slice(i - 60, i));
      if (bed.slice(i, i + 8).every((x) => x < ref - 10)) {
        let j = i; while (j < R.length && bed[j] < ref - 10) j++;
        drops.push({ at: r1(R[i].t), sec: r1(R[j - 1].t - R[i].t + 0.05), belowDb: r1(ref - median(bed.slice(i, j))) });
        i = j + 20;
      }
    }

    // sound effects: sharp jumps in the spectrum; cuts: big jumps in the picture
    const times = R.map((r) => r.t);
    const flux = R.map((r) => r.flux);
    const hits = peaks(flux, times, median(flux) + 6 * mad(flux), 0.25).map((p) => ({
      at: r2(p.t), kind: R[p.i].hiFlux / (R[p.i].flux || 1) > 0.25 ? "bright (whoosh/click/pop)" : "low (boom/thud/hit)",
    }));
    const pixVals = R.map((r) => r.pix);
    const pixKnown = pixVals.filter((x) => x != null);
    const cuts = pixKnown.length > R.length / 2 ? peaks(pixVals, times, Math.max(25, median(pixKnown) * 4), 0.3).map((p) => r2(p.t)) : null;
    const cutsWithHit = cuts ? cuts.filter((c) => hits.some((h) => Math.abs(h.at - c) <= 0.25)).length : null;

    const loud = sounding.map((r) => r.db);
    return {
      measured: { seconds: r1(span), from: r1(R[0].t), to: r1(R[R.length - 1].t) },
      tempo: tempo(),
      key: { ...key(musicRows.length >= 100 ? musicRows : sounding),
        heardFrom: musicRows.length >= 100 ? "music alone" : "music under the voice (less reliable)" },
      loudness: {
        note: "dBFS after YouTube's own volume normalisation; trust the differences more than the absolute values",
        medianDb: r1(median(loud)), p95Db: r1(pct(loud, 0.95)), p10Db: r1(pct(loud, 0.1)), rangeDb: r1(pct(loud, 0.95) - pct(loud, 0.1)),
      },
      voiceAndMusic: {
        speechShare: r2(speechRows.length / R.length), musicOnlyShare: r2(musicRows.length / R.length),
        levelDuringSpeechDb: r1(median(speechRows.map((r) => r.db))), levelMusicOnlyDb: r1(median(musicRows.map((r) => r.db))),
        bassBedDuringSpeechDb: r1(bass(speechRows)), bassBedMusicOnlyDb: r1(bass(musicRows)),
        duckingDb: speechRows.length > 20 && musicRows.length > 20 ? r1(bass(musicRows) - bass(speechRows)) : null,
        musicAloneSeconds: r1(musicRows.length * 0.05),
        bassBedInWordGapsDb: r1(bass(gapRows)),
        // how far the music's bass sits under the voice: ours is about 13 dB, Two Cents about 36 dB
        voiceOverBedDb: r1(median(speechRows.map((r) => r.db)) - bass(speechRows)),
      },
      timbre: {
        brightnessHz: Math.round(median(sounding.map((r) => r.cen))),
        bassShare: r2(median(sounding.map((r) => r.low))), highShare: r2(median(sounding.map((r) => r.high))),
      },
      sfx: { perMinute: r1((hits.length / span) * 60), hits: hits.slice(0, 40) },
      picture: cuts ? { cutsPerMinute: r1((cuts.length / span) * 60), cuts: cuts.slice(0, 40), cutsWithSoundHit: cutsWithHit, cutsTotal: cuts.length } : { note: "the picture could not be read" },
      silences: silences.slice(0, 20),
      drops: drops.slice(0, 20),
    };
  }

  window.__ap = { start, status, report };
  return "probe loaded";
})();
