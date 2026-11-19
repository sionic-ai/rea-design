/* Story — each section changes the panel shape and camera (on entry 1.4s power3.inOut), and while passing through a section, bend, light, γ, frequency sweep and push position are tied to scroll (scrub .8).
   Original values: section range top 60% → bottom 40% · text box is transparent 0 and 36px up while the section bottom travels from screen bottom → 60% */
(() => {
  const { reduce, lenis, splitHeading, plate } = window.clShared;
  const D = (m, n, sign) => ({ kind: "rect", m, n, sign });
  const DISC = (n, s) => ({ kind: "disc", n, s });
  const lerp = (a, b, t) => a + (b - a) * t;
  const logLerp = (a, b, t) => Math.exp(lerp(Math.log(a), Math.log(b), t));
  const smooth = (t) => t * t * (3 - 2 * t);
  const HOME = D(4, 6, -1);
  const hzOf = (m) => (m.kind === "disc" ? Math.round(118 * (m.n + 2 * m.s) ** 2 + 90) : Math.round(64 * (m.m * m.m + m.n * m.n)));
  const word = (s) => (s > 0 ? "Add" : "Subtract");
  const fmt = (n) => n.toLocaleString("en-US");
  const CHAPTERS = {
    bow: { mode: D(1, 4, -1), camera: "hero", scrub: { drift: [0, 1] } },
    waves: { mode: D(1, 3, 1), camera: "low", scrub: { displace: { peak: 1, end: 0.3 }, glow: [0, 0.85], drift: [1, -1] } },
    sand: { mode: D(2, 4, -1), camera: "overhead", scrub: { gamma: [0.45, 1.7], drift: [-1, 1] } },
    modes: { camera: "overhead", steps: [D(1, 2, -1), D(2, 3, -1), D(2, 3, 1), D(3, 5, -1)], scrub: { drift: [1, -1] } },
    frequency: { camera: "tilt", hz: 250, scrub: { sweep: true, drift: [-1, 1] } },
    circle: { shape: "disc", camera: "overhead", steps: [DISC(2, 0), DISC(0, 1), DISC(3, 1)], scrub: { drift: [1, -1] } },
    symmetry: { camera: "detail", hz: 1117, scrub: { point: true, drift: [-1, 1] } },
    outro: { mode: HOME, camera: "hero" },
  };
  const ids = Object.keys(CHAPTERS).filter((k) => k !== "outro");

  // Panel position — wide screens to the right of the text column (reading), narrow screens top center
  const region = (kind) => {
    const w = innerWidth;
    if (w < 1024) return kind === "hero" ? [0.5, 0.4, 1] : [0.5, 0.32, 0.9];
    if (kind === "hero") return [0.64, 0.52, 0.84];
    const gutter = Math.min(64, Math.max(20, w * 0.04)), measure = Math.min(512, Math.max(416, w * 0.36));
    const left = gutter + measure + 40, right = w - gutter - 68;
    return [(left + right) / 2 / w, 0.52, 1];
  };
  const setRegion = (kind) => plate && plate.setRegion(...region(kind));

  const caption = (id, t, el) => {
    const c = CHAPTERS[id], s = c.scrub || {};
    let text = "";
    const mode = c.steps ? c.steps[Math.min(c.steps.length - 1, Math.floor(t * c.steps.length))] : c.mode;
    const label = mode ? (mode.kind === "disc" ? `n ${mode.n} · s ${mode.s} · (n + 2s)² = ${(mode.n + 2 * mode.s) ** 2} · ${fmt(hzOf(mode))} Hz` : `m ${mode.m} · n ${mode.n} · ${word(mode.sign)} · ${fmt(hzOf(mode))} Hz`) : "";
    if (s.sweep) text = `Center align · ${fmt(Math.round(logLerp(250, 2600, t)))} Hz`;
    else if (s.point) text = `Push spot (${lerp(0, 0.38, t).toFixed(2)}, ${lerp(0, 0.22, t).toFixed(2)}) · ${fmt(c.hz)} Hz`;
    else if (s.gamma) text = `γ = ${(4.5 * lerp(s.gamma[0], s.gamma[1], t)).toFixed(1)}`;
    else if (s.displace) text = `Bend × ${Math.round(40 * peak(s.displace, t))} · ${label}`;
    else text = label;
    if (el && el.textContent !== text) el.textContent = text;
  };
  const peak = (d, t) => (t < 0.5 ? d.peak * smooth(Math.min(1, t / 0.5)) : lerp(d.peak, d.end, (t - 0.5) / 0.5));

  /* Frequency section graphic — a 250~2600Hz response curve (a peak for each resonance), follows the frequency the needle sweeps */
  const spec = document.querySelector(".cl-spectrum");
  const xOf = (hz) => (320 * Math.log(hz / 250)) / Math.log(2600 / 250);
  if (spec) {
    const peaks = window.brandField.HZ;
    const pts = [];
    for (let i = 0; i <= 220; i++) {
      const hz = logLerp(250, 2600, i / 220);
      let r = 0;
      peaks.forEach((p, k) => { const d = (Math.log(hz) - Math.log(p)) / 0.035; r = Math.max(r, (0.55 + 0.45 * ((k * 7) % 5) / 4) / (1 + d * d)); });
      pts.push(`${xOf(hz).toFixed(1)},${(72 - r * 64).toFixed(1)}`);
    }
    spec.querySelector("[data-spec-curve]").setAttribute("d", `M${pts.join(" L")}`);
    spec.querySelector("[data-spec-peaks]").innerHTML = peaks.map((p) => `<line class="cl-spec-peak" x1="${xOf(p).toFixed(1)}" x2="${xOf(p).toFixed(1)}" y1="66" y2="72"/>`).join("");
  }
  const needle = (hz) => {
    if (!spec) return;
    const x = xOf(hz);
    const n = spec.querySelector("[data-spec-needle]"), l = spec.querySelector("[data-spec-label]");
    n.setAttribute("x1", x.toFixed(1)); n.setAttribute("x2", x.toFixed(1));
    l.setAttribute("x", Math.min(280, Math.max(0, x - 18)).toFixed(1));
    l.textContent = `${Math.round(hz)} Hz`;
  };

  const nav = document.querySelector(".cl-chapter-nav"), count = document.querySelector("[data-chapter-count]");
  const dots = [...document.querySelectorAll(".cl-dot")];
  let active = "hero";
  const markActive = (id) => {
    active = id;
    const i = ids.indexOf(id);
    dots.forEach((d, j) => d.classList.toggle("is-active", j === i));
    if (count) { count.textContent = `${String(i >= 0 ? i + 1 : id === "outro" ? ids.length : 0).padStart(2, "0")} / ${String(ids.length).padStart(2, "0")}`; count.classList.toggle("is-idle", i < 0 && id !== "outro"); }
    if (nav) gsap.to(nav, { autoAlpha: id === "hero" ? 0 : 1, duration: reduce ? 0 : 0.7, ease: "expo.out", overwrite: "auto" });
  };
  dots.forEach((d) => d.addEventListener("click", () => {
    const el = document.getElementById(d.dataset.goto);
    if (!el) return;
    lenis ? lenis.scrollTo(el, { offset: innerHeight * 0.05 }) : el.scrollIntoView({ behavior: "smooth" });
  }));

  const enterScene = (id) => {
    const c = CHAPTERS[id];
    if (!plate) return;
    plate.setShape(c.shape || "rect");
    if (c.steps) plate.setMode(c.steps[0]);
    else if (c.hz) plate.setFrequency(c.hz);
    else if (c.mode) plate.setMode(c.mode);
    plate.setCamera(c.camera);
    setRegion(id === "outro" ? "hero" : "reading");
    if (window.clSound) window.clSound.tune(c.hz || hzOf(c.mode || c.steps[0]));
  };
  const leaveScene = (id) => {
    if (!plate) return;
    const s = (CHAPTERS[id] || {}).scrub || {};
    if (s.displace) gsap.to(plate, { displaceScale: 0, duration: 0.18 });
    if (s.glow) gsap.to(plate, { glow: 0, duration: 0.18 });
    if (s.gamma) gsap.to(plate, { gammaScale: 1, duration: 0.18 });
    if (s.drift) gsap.to(plate, { drift: 0, duration: 0.18 });
    if (s.sweep || s.point) plate.sharp = 1;
  };
  const scrubScene = (id, t) => {
    const c = CHAPTERS[id], s = c.scrub || {};
    // So the late-following scrub doesn’t rewrite values after leaving the section — only the current section moves the panel
    if (!plate || active !== id) return;
    if (c.steps) { const m = c.steps[Math.min(c.steps.length - 1, Math.floor(t * c.steps.length))]; plate.setMode(m); }
    const follow = 0.18;
    if (s.displace) gsap.to(plate, { displaceScale: peak(s.displace, t), duration: follow, overwrite: "auto" });
    if (s.glow) gsap.to(plate, { glow: lerp(s.glow[0], s.glow[1], t), duration: follow, overwrite: "auto" });
    if (s.gamma) gsap.to(plate, { gammaScale: lerp(s.gamma[0], s.gamma[1], t), duration: follow, overwrite: "auto" });
    if (s.drift && !reduce) gsap.to(plate, { drift: lerp(s.drift[0], s.drift[1], t), duration: follow, overwrite: "auto" });
    if (s.sweep) { const hz = logLerp(250, 2600, t); plate.setFrequency(hz); needle(hz); window.clSound && window.clSound.tune(hz); }
    if (s.point) plate.setFrequency(lerp(1117, 1160, t));
  };

  const start = () => {
    // Hero — when the panel enters, the camera moves intro → hero over 1.4s, title lines rise from 110% below over .7s (.09s between lines), and the single line and intro rise from 24px below
    if (plate) { plate.setMode(HOME, 0); plate.setCamera("hero"); setRegion("hero"); }
    // Header title and text stand still on first arrival as in the original (revealed as the gate lifts), and rise line by line only when arriving from another page
    const came = !!window.clCame;
    const title = document.querySelector(".cl-hero-title");
    if (title && came) splitHeading(title, { now: true, delay: 0.1 });
    if (came) document.querySelectorAll("[data-hero-part]").forEach((el, i) => !reduce && gsap.fromTo(el, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "expo.out", delay: 0.25 + i * 0.12, clearProps: "transform" }));
    const cue = document.querySelector(".cl-cue-body");
    if (cue) ScrollTrigger.create({ start: 40, onEnter: () => cue.classList.add("is-spent"), onLeaveBack: () => cue.classList.remove("is-spent") });

    document.querySelectorAll("[data-chapter]").forEach((sec) => {
      const id = sec.dataset.chapter;
      const capEl = sec.querySelector("[data-caption]");
      const onEnter = () => { enterScene(id); markActive(id); caption(id, 0, capEl); };
      const onLeave = () => { leaveScene(id); };
      if (id === "outro") { ScrollTrigger.create({ trigger: sec, start: "top 60%", onEnter, onEnterBack: onEnter, onLeaveBack: () => markActive("symmetry") }); return; }
      const st = { trigger: sec, start: "top 60%", end: "bottom 40%", onEnter, onEnterBack: onEnter, onLeave, onLeaveBack: () => { onLeave(); if (id === ids[0]) { markActive("hero"); if (plate) { plate.setMode(HOME); plate.setCamera("hero"); setRegion("hero"); } } } };
      const prog = { p: 0 };
      if (reduce) ScrollTrigger.create({ ...st, onUpdate: (e) => { scrubScene(id, e.progress); caption(id, e.progress, capEl); } });
      else gsap.timeline({ scrollTrigger: { ...st, scrub: 0.8 } }).to(prog, { p: 1, ease: "none", duration: 1, onUpdate: () => { scrubScene(id, prog.p); caption(id, prog.p, capEl); } });
      // Text box — while the section bottom moves from the screen bottom to 60%, it fades in and rises 36px
      if (!reduce && innerWidth >= 768) {
        const text = sec.querySelector(".cl-chapter-text"), sticky = sec.querySelector(".cl-chapter-sticky");
        gsap.timeline({ defaults: { ease: "none", duration: 1 }, scrollTrigger: { trigger: sec, start: "bottom bottom", end: "bottom 60%", scrub: true, invalidateOnRefresh: true } })
          .fromTo(text, { opacity: 1 }, { opacity: 0, ease: "power2.out" }, 0)
          .fromTo(sticky, { y: 0 }, { y: -36 }, 0);
      }
    });
    markActive("hero");
    addEventListener("resize", () => setRegion(active === "hero" || active === "outro" ? "hero" : "reading"));
  };
  if (window.clEntered) start(); else document.addEventListener("cl:entered", start, { once: true });
})();
