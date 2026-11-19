// What the four pages share — Lenis, the gate (record disc in three + perspective text following the cursor, on press the disc slides into its sleeve and opens),
// Play pill (placeholder synthesized sound — a WebAudio loop at the same 145bpm instead of the original audio), line rise (1.75s expo.out, .1 apart, once within 20% of the screen bottom),
// Slide-up (1.25s expo.out stagger .1), panel rise (1.4s), page turn (.35s darken), phone menu drawer.
(() => {
  const A = (window.PG ||= {});
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const q = (s, r = document) => r.querySelector(s), qa = (s, r = document) => [...r.querySelectorAll(s)];
  A.q = q; A.qa = qa;
  A.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  A.css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  if (window.Lenis && !A.reduce) {
    A.lenis = new Lenis({ lerp: 0.1 });
    A.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => A.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Sound: seven placeholder synth instruments (same slots as the original sequencer row names) — shared by the sequencer and the play pill
  const S = (A.sound = { ctx: null, bpm: 145, step: -1, playing: false, grid: null, listeners: new Set() });
  const ctx = () => (S.ctx ||= new (window.AudioContext || window.webkitAudioContext)());
  const env = (g, t, a, d, peak) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  const voice = {
    kick: (c, t, out) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); env(g, t, 0.002, 0.28, 0.9); o.connect(g).connect(out); o.start(t); o.stop(t + 0.32); },
    clap: (c, t, out) => { const b = c.createBuffer(1, c.sampleRate * 0.2, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); f.type = "bandpass"; f.frequency.value = 1500; s.buffer = b; env(g, t, 0.002, 0.16, 0.5); s.connect(f).connect(g).connect(out); s.start(t); },
    bass: (c, t, out) => { const o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(); o.type = "sawtooth"; o.frequency.value = 55; f.type = "lowpass"; f.frequency.value = 420; env(g, t, 0.004, 0.18, 0.35); o.connect(f).connect(g).connect(out); o.start(t); o.stop(t + 0.24); },
    pluck: (n) => (c, t, out) => { const o = c.createOscillator(), g = c.createGain(); o.type = "triangle"; o.frequency.value = [440, 523.25, 659.25][n]; env(g, t, 0.003, 0.22, 0.22); o.connect(g).connect(out); o.start(t); o.stop(t + 0.3); },
    pad: (c, t, out) => { [220, 277.18, 329.63].forEach((fq) => { const o = c.createOscillator(), g = c.createGain(); o.type = "sine"; o.frequency.value = fq; env(g, t, 0.08, 0.9, 0.08); o.connect(g).connect(out); o.start(t); o.stop(t + 1.1); }); },
  };
  S.voices = [voice.kick, voice.clap, voice.bass, voice.pluck(0), voice.pluck(1), voice.pluck(2), voice.pad];
  S.default = [
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  S.grid = S.default.map((r) => r.slice());
  let timer = 0, nextT = 0;
  const master = () => { if (!S.master) { const c = ctx(); S.master = c.createGain(); S.master.gain.value = 0.5; S.master.connect(c.destination); } return S.master; };
  S.audition = (row) => { const c = ctx(); S.voices[row](c, c.currentTime + 0.01, master()); };
  const schedule = () => {
    const c = ctx(), spb = 60 / S.bpm / 4;
    while (nextT < c.currentTime + 0.12) {
      S.step = (S.step + 1) % 16;
      const st = S.step, at = nextT;
      S.grid.forEach((row, r) => row[st] && S.voices[r](c, at, master()));
      setTimeout(() => S.listeners.forEach((f) => f(st)), Math.max(0, (at - c.currentTime) * 1000));
      nextT += spb;
    }
  };
  S.play = () => { const c = ctx(); c.resume(); if (S.playing) return; S.playing = true; nextT = c.currentTime + 0.05; S.step = -1; timer = setInterval(schedule, 25); S.listeners.forEach((f) => f(-2)); };
  S.stop = () => { S.playing = false; clearInterval(timer); S.step = -1; S.listeners.forEach((f) => f(-1)); };

  // ── Line rise: split a text block into lines, place each 100% below inside a mask, and when it enters the bottom 20% of the screen, rise in 1.75s expo.out, line gap .1
  const LINES = { duration: 1.75, stagger: 0.1, ease: "expo.out", from: 100 };
  const lineSets = [];
  A.lines = (root = document) => {
    const els = qa(".js-animate-lines", root).filter((el) => !el.dataset.lined);
    els.forEach((el) => {
      el.dataset.lined = "1";
      // Indent only the first line — if text-indent is reapplied on every split line box, lines overflow and break
      const indent = parseFloat(getComputedStyle(el).textIndent) || 0;
      if (indent) {
        el.style.textIndent = "0px";
        el.insertAdjacentHTML("afterbegin", `<span class="p-indent" aria-hidden="true" style="display:inline-block;width:${indent}px"></span>`);
      }
      const split = new SplitText(el, { type: "lines", linesClass: "p-line", mask: "lines" });
      lineSets.push({ el, split });
      if (A.reduce) return;
      gsap.set(split.lines, { yPercent: LINES.from });
    });
    if (A.reduce) return;
    const io = new IntersectionObserver((ents) => {
      // Chunks entering together in the same group (.js-animate-group) follow in sequence line by line
      const ready = ents.filter((e) => e.isIntersecting).map((e) => e.target);
      if (!ready.length) return;
      const lines = ready.flatMap((el) => { io.unobserve(el); return lineSets.find((s) => s.el === el)?.split.lines || []; });
      gsap.to(lines, { yPercent: 0, duration: LINES.duration, ease: LINES.ease, stagger: LINES.stagger });
    }, { rootMargin: "0px 0px -20% 0px" });
    els.forEach((el) => io.observe(el));
    A.linesIO = io;
  };
  // Slides up (Hero edge text · header line): 1.4s expo.out stagger .1
  A.slideUp = (root = document, delay = 0) => {
    const els = qa(".js-slide-up", root);
    if (A.reduce || !els.length) return;
    gsap.fromTo(els, { yPercent: 110 }, { yPercent: 0, duration: 1.25, ease: "expo.out", stagger: 0.1, delay });
  };

  // ── Play pill
  const now = q("[data-now]");
  // The original (Nuxt) keeps sound turned on at the door playing across pages — the copy is a new document per page, so only the on state is passed along so the listening panel keeps running
  S.listeners.add((st) => { if (st < 0) { now?.toggleAttribute("data-playing", S.playing); sessionStorage.setItem("p-playing", S.playing ? "1" : ""); } });
  now?.addEventListener("click", () => (S.playing ? S.stop() : S.play()));

  // ── Phone menu
  q("[data-menu-btn]")?.addEventListener("click", () => { document.body.dataset.menu = document.body.dataset.menu === "open" ? "" : "open"; });

  // Page transition: original Nuxt transition (bundle B3cVYYkG Zd — wipes out with .35s power1, the new page lights up with .35s power1 while panels and text rise)
  const main = q("main");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || a.getAttribute("href").startsWith("#")) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || u.href === location.href) return;
    e.preventDefault();
    sessionStorage.setItem("p-entered", "1");
    gsap.to(main, { autoAlpha: 0, duration: A.reduce ? 0 : 0.35, ease: "power1", onComplete: () => (location.href = u.href) });
  });

  // ── Door
  const gate = q("[data-gate]");
  // Panels (.js-panel) wait outside the bottom edge of the screen until revealed, then rise with 1.4s expo.out at .1 stagger — from the original bundle B3cVYYkG (Ec·Cc)
  // y = Window height - panel top edge → stays at 0, opacity is left untouched
  const panels = qa(".js-panel");
  if (!A.reduce && panels.length) gsap.set(panels, { y: (i, el) => Math.max(0, innerHeight - el.getBoundingClientRect().top) });
  let risen = false;
  const risePanels = () => {
    if (risen || A.reduce || !panels.length) return;
    risen = true;
    gsap.to(panels, { y: 0, duration: 1.4, ease: "expo.out", stagger: 0.1 });
  };
  // Original is Nuxt, so arriving via an inner link leaves the header line and play pill in place — an arrived page raises only its body text (root = main)
  const revealPage = (root = document) => {
    if (now) root === document ? gsap.to(now, { autoAlpha: 1, duration: 0.4, ease: "power2.out", delay: 0.2 }) : gsap.set(now, { autoAlpha: 1 });
    risePanels();
    A.slideUp(root, 0.15);
    A.lines();
    A.onEnter?.();
  };
  const entered = sessionStorage.getItem("p-entered") === "1";
  if (!gate || entered) {
    // The arrived page brightens immediately with no door and the panel rises — if the door covers the page until load, the panel waits offscreen meanwhile and the transition drags on.
    // Line splitting runs on load, since lines only match once all fonts have arrived
    if (entered) document.documentElement.classList.add("p-entered");
    if (main) gsap.fromTo(main, { autoAlpha: 0 }, { autoAlpha: 1, duration: A.reduce ? 0 : 0.35, ease: "power1" });
    risePanels();
    const arrive = () => revealPage(entered && main ? main : document);
    addEventListener("load", arrive);
    if (document.readyState === "complete") arrive();
    return;
  }
  const label = q(".p-gate__label", gate);
  // Formula from the original bundle (D6ZI4dhh): each frame it moves toward the cursor by .085 of the remaining distance (at 60fps, corrected by the frame multiple), and,
  // Tilts on the Y and X axes by that frame’s speed (px/frame)×1.6° with perspective(800px) (±32°). When it stops, speed is 0, so the tilt releases too.
  // The original’s measured ”tilt 18.43°, ratio 3.16” comes from decomposing the perspective matrix, so it is the resting pose — it doesn’t stay tilted.
  const LERP = 0.085, TILT = 1.6, clampTilt = gsap.utils.clamp(-32, 32);
  let tx = 0, ty = 0, x = 0, y = 0, shown = false;
  // Like the original, the text stays hidden and appears right where the cursor first moves (it doesn’t follow), then follows from then on
  const onMove = (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!shown) { shown = true; x = tx; y = ty; gsap.to(label, { autoAlpha: 1, duration: 0.3 }); }
  };
  const follow = () => {
    if (!shown) return;
    const r = gsap.ticker.deltaRatio(60);
    const k = A.reduce ? 1 : 1 - (1 - LERP) ** r;
    const nx = x + (tx - x) * k, ny = y + (ty - y) * k;
    const ry = A.reduce || !r ? 0 : clampTilt(((nx - x) / r) * TILT), rx = A.reduce || !r ? 0 : clampTilt((-(ny - y) / r) * TILT);
    x = nx; y = ny;
    label.style.transform = `translate3d(${x}px, ${y}px, 0) perspective(800px) rotateY(${ry}deg) rotateX(${rx}deg)`;
  };
  addEventListener("pointermove", onMove);
  gsap.ticker.add(follow);

  const rec = A.recordGate?.(gate);
  gate.addEventListener("click", () => {
    S.play();
    sessionStorage.setItem("p-entered", "1");
    removeEventListener("pointermove", onMove);
    const tl = gsap.timeline({ onComplete: () => { gsap.ticker.remove(follow); rec?.destroy(); gate.remove(); document.documentElement.classList.add("p-entered"); } });
    // Original bundle (Choz-AjC re·K): text hides immediately and the panel flies off, and at .55s the body panel and text start rising (text .15s later).
    // The door backdrop clears from .7s over .5s power1 per the bundle, but in the original burst capture the title letters behind already show through at about .55s — so to match the capture it starts clearing at .5s
    gsap.set(label, { autoAlpha: 0 });
    if (rec) tl.add(rec.launch(), 0);
    tl.call(revealPage, null, A.reduce ? 0 : 0.55);
    tl.to(gate, { autoAlpha: 0, duration: A.reduce ? 0 : 0.5, ease: "power1" }, A.reduce ? 0 : 0.5);
  }, { once: true });
})();
