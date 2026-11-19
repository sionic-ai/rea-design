// Music section — original values: piano keys 21~108 (36~83 below width 700) · black keys .6 width .62 height · glow ×.93 per frame · a random key .28 every 70 frames,
// Composer section 420vh, 4 photos (.25 range crossfade · 1.04→1.12), sentences .7s ±24px, album section 230vh (easeOutCubic, CD two spins · cover −24% · text lines .08 stagger 28px).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const span = (a, s, e) => clamp01((a - s) / (e - s));
  const outCubic = (t) => 1 - Math.pow(1 - t, 3);

  // Sound — the original has a 1-minute song preview and key tones. With no sound file, only short synthesized key tones remain, and the play button just toggles state
  let ctx;
  const tone = (freq) => {
    try {
      ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      o.type = "triangle"; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 1.7);
    } catch (e) { /* Light only in environments that can’t play sound */ }
  };
  let playing = false;
  const setPlaying = (on, src) => {
    playing = on;
    $$(".m-play").forEach((b) => b.setAttribute("aria-pressed", String(on && (b === src || !src || b.closest(".m-hero")))));
    $$(".m-tracks li.is-preview").forEach((li, i) => li.classList.toggle("is-playing", on && i === 0));
    $$(".m-album").forEach((s) => s.classList.toggle("is-playing", on && s.contains(src)));
  };
  // In the original the button turns on only once sound is received and actually starts playing (about 450ms after the press) — turning off is immediate
  let wait;
  $$(".m-play, .m-tracks__play").forEach((b) => b.addEventListener("click", () => {
    const on = !(b.getAttribute("aria-pressed") === "true" || b.closest(".is-playing"));
    clearTimeout(wait);
    if (on) wait = setTimeout(() => setPlaying(true, b), reduce ? 0 : 250);
    else setPlaying(false, b);
  }));

  // ── Piano keys
  const piano = $(".m-piano");
  if (piano) {
    const g = piano.getContext("2d");
    const css = getComputedStyle(document.documentElement);
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgb = (name) => { probe.clearRect(0, 0, 1, 1); probe.fillStyle = css.getPropertyValue(name).trim(); probe.fillRect(0, 0, 1, 1); return [...probe.getImageData(0, 0, 1, 1).data].slice(0, 3).join(" "); };
    const INK = rgb("--kf-ink"), ACC = rgb("--kf-accent"), ACC2 = rgb("--kf-accent-text"), DARK = rgb("--kf-raised");
    const BLACK = new Set([1, 3, 6, 8, 10]);
    let keys = [], glow = new Float32Array(0), freqs = [], W = 0, H = 0, pr = 1, hover = -1, down = false, last = -1, frame = 0, raf = 0, visible = true;
    const layout = () => {
      pr = Math.min(devicePixelRatio || 1, 2); W = piano.clientWidth; H = piano.clientHeight;
      piano.width = W * pr; piano.height = H * pr;
      const [lo, hi] = W < 700 ? [36, 83] : [21, 108];
      const whites = [];
      for (let m = lo; m <= hi; m++) if (!BLACK.has(m % 12)) whites.push(m);
      const kw = W / whites.length;
      keys = [];
      for (let m = lo; m <= hi; m++) {
        if (BLACK.has(m % 12)) keys.push({ m, black: true, x: (whites.indexOf(m - 1) + 1) * kw - 0.3 * kw, w: 0.6 * kw, h: 0.62 * H });
        else keys.push({ m, black: false, x: whites.indexOf(m) * kw, w: kw, h: H });
      }
      freqs = keys.map((k) => 440 * Math.pow(2, (k.m - 69) / 12));
      glow = new Float32Array(keys.length);
    };
    layout();
    new ResizeObserver(layout).observe(piano);
    const at = (e) => {
      const r = piano.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      for (let i = 0; i < keys.length; i++) { const k = keys[i]; if (k.black && x >= k.x && x <= k.x + k.w && y <= k.h) return i; }
      for (let i = 0; i < keys.length; i++) { const k = keys[i]; if (!k.black && x >= k.x && x < k.x + k.w) return i; }
      return -1;
    };
    const strike = (i) => { if (i < 0 || i === last || playing) return; last = i; glow[i] = 1; tone(freqs[i]); };
    piano.addEventListener("pointerdown", (e) => { down = true; last = -1; strike(at(e)); });
    piano.addEventListener("pointermove", (e) => { hover = at(e); if (down) strike(hover); });
    addEventListener("pointerup", () => { down = false; last = -1; });
    piano.addEventListener("pointerleave", () => { hover = -1; down = false; });
    const drawKey = (k, i) => {
      const n = glow[i] + (i === hover && !playing ? 0.14 : 0), lift = n > 0.3 ? 2 : 0;
      if (k.black) {
        g.fillStyle = `rgb(${DARK})`; g.fillRect(k.x, 0, k.w, k.h + lift);
        g.strokeStyle = `rgb(${INK} / .16)`; g.strokeRect(k.x + 0.5, -1, k.w - 1, k.h + lift);
      } else {
        g.fillStyle = `rgb(${INK} / .035)`; g.fillRect(k.x, 0, k.w, k.h);
        g.strokeStyle = `rgb(${INK} / .15)`; g.strokeRect(k.x + 0.5, -1, k.w - 1, k.h + 4);
      }
      if (n > 0.01) {
        const gr = g.createLinearGradient(0, 0, 0, k.h);
        gr.addColorStop(0, `rgb(${ACC2} / ${0.95 * Math.min(1, n)})`);
        gr.addColorStop(1, `rgb(${ACC} / ${0.15 * Math.min(1, n)})`);
        g.fillStyle = gr; g.shadowColor = `rgb(${ACC2} / ${0.8 * Math.min(1, n)})`; g.shadowBlur = 18 * n;
        g.fillRect(k.x + 1, lift, k.w - 2, k.h - 1); g.shadowBlur = 0;
      }
    };
    const tick = () => {
      frame += 1;
      // As the song plays, the keys light up to the notes — there is no song data, so a swaying melody in the middle register
      if (playing) {
        const c = Math.floor(keys.length * (0.45 + 0.2 * Math.sin(frame / 23)));
        if (frame % 9 === 0) glow[c] = Math.max(glow[c], 0.7 + Math.random() * 0.3);
        if (frame % 13 === 0) { const j = c - 7 - Math.floor(Math.random() * 5); if (glow[j] !== undefined) glow[j] = Math.max(glow[j], 0.5); }
      } else if (!reduce && frame % 70 === 0) {
        const i = Math.floor(keys.length * (0.3 + 0.4 * Math.random()));
        glow[i] = Math.max(glow[i], 0.28);
      }
      g.setTransform(pr, 0, 0, pr, 0, 0); g.clearRect(0, 0, W, H);
      keys.forEach((k, i) => !k.black && drawKey(k, i));
      keys.forEach((k, i) => k.black && drawKey(k, i));
      for (let i = 0; i < glow.length; i++) glow[i] *= 0.93;
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); }).observe(piano);
    tick();
  }

  // ── Album tab
  $$(".m-tab").forEach((t) => t.addEventListener("click", () => {
    $$(".m-tab").forEach((x) => x.setAttribute("aria-selected", String(x === t)));
    $$("[data-tracks]").forEach((ol) => (ol.hidden = ol.dataset.tracks !== t.dataset.tab));
  }));

  // ── Scroll section — like the original, how far the section top has passed above the screen ÷ (section height − screen height)
  const progressOf = (el) => { const r = el.getBoundingClientRect(); return clamp01(-r.top / Math.max(1, r.height - innerHeight)); };
  const composer = $(".m-composer");
  const phs = composer ? $$(".m-composer__ph", composer) : [];
  const lines = composer ? $$(".m-composer__line", composer) : [];
  const bars = composer ? $$(".m-composer__bar i", composer) : [];
  const albums = $$(".m-album").map((s) => ({ s, cd: $(".m-album__cd", s), cover: $(".m-album__cover", s), lines: $$(".m-album__l", s) }));
  const dock = $(".m-dock"), hero = $(".m-hero");
  let queued = 0;
  const update = () => {
    queued = 0;
    if (composer) {
      const n = phs.length, m = progressOf(composer) * n, u = Math.min(n - 1, Math.floor(m));
      phs.forEach((p, e) => {
        p.style.opacity = e === 0 ? 1 : clamp01((m - e + 0.25) / 0.25);
        p.style.zIndex = e;
        p.firstElementChild.style.transform = `scale(${1.04 + 0.08 * clamp01(m - e + 0.25)})`;
      });
      lines.forEach((l, e) => { l.classList.toggle("is-on", e === u); l.classList.toggle("is-past", e < u); l.setAttribute("aria-hidden", String(e !== u)); });
      bars.forEach((b, e) => b.style.setProperty("--fill", `${clamp01(m - e) * 100}%`));
    }
    albums.forEach(({ s, cd, cover, lines: ls }) => {
      const m = progressOf(s), x = outCubic(span(m, 0.05, 0.55));
      cd.style.transform = `translate(${50 * x}%, ${-4 * x}%) rotate(${(1 - x) * 720}deg)`;
      cover.style.transform = `translateX(${-24 * x}%) rotate(${-3 * x}deg)`;
      ls.forEach((l, a) => { const e = outCubic(span(m, 0.1 + 0.08 * a, 0.35 + 0.08 * a)); l.style.opacity = e; l.style.transform = `translateY(${(1 - e) * 28}px)`; });
    });
    if (dock && hero) { const on = hero.getBoundingClientRect().bottom < 0; dock.classList.toggle("is-on", on); dock.setAttribute("aria-hidden", String(!on)); }
  };
  const ask = () => { if (!queued) queued = requestAnimationFrame(update); };
  if (reduce) {
    albums.forEach(({ cd, cover, lines: ls }) => { cd.style.transform = "translate(50%, -4%)"; cover.style.transform = "translateX(-24%) rotate(-3deg)"; ls.forEach((l) => (l.style.opacity = 1)); });
  }
  update();
  addEventListener("scroll", reduce ? () => {} : ask, { passive: true });
  addEventListener("resize", ask);
  if (reduce && composer) addEventListener("scroll", ask, { passive: true });

  // ── Bundle — when it enters the screen, the two covers spread slightly more (1.4s)
  const pack = $(".m-pack");
  if (pack) new IntersectionObserver(([e]) => pack.classList.toggle("is-in", e.isIntersecting), { threshold: 0.35 }).observe(pack);

  // ── Letter — on send the letter folds into the envelope (1.25s), the flap closes (1.35s), the wax seal is stamped (1.9s), then it flies away (2.45s)
  const form = $("[data-letter]");
  if (form) form.addEventListener("submit", (e) => {
    e.preventDefault();
    const desk = form.parentElement;
    desk.classList.add("is-sending");
    setTimeout(() => { form.hidden = true; $(".m-env", desk).style.display = "none"; $(".m-letter__done", desk).hidden = false; }, reduce ? 50 : 3400);
  });
})();
