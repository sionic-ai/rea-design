// Home page — original values: hero pinned for 1.3 screens (scrub 1), point-cloud section snaps [0 .23 .46 .69 .86 1], sentence section (scrub .4, label snap),
// Brain section (13.5 screens, scrub .4, snap to seven labels then .6~1.1s power1.inOut after .55s), statement section pinned .75 screen (snap 0 .73 1).
(() => {
  const { reduce } = A;
  const root = document.documentElement;
  const G = (v) => Math.max(0, Math.min(1, v));
  const smooth = (a, b, x) => { const k = G((x - a) / (b - a)); return k * k * (3 - 2 * k); };
  const snapOf = (to) => (reduce ? undefined : { snapTo: to, inertia: false, delay: 0.55, duration: { min: 0.6, max: 1.1 }, ease: "power1.inOut" });
  const nearest = (list, v) => list.reduce((b, x) => (Math.abs(x - v) < Math.abs(b - v) ? x : b));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Section copy rises word by word from 115% below, tilted 2° (CSS .64s cubic-bezier(.16,1,.3,1), 38ms stagger per word).
  const chapters = $$(".a-chapter"), reveal = $(".a-reveal");
  [...chapters, reveal].forEach((el) => {
    let i = 0;
    [...el.childNodes].forEach((n) => {
      if (n.nodeType !== 3) return;
      const f = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((w) => {
        if (!w.trim()) return f.append(w);
        const o = document.createElement("span"), s = document.createElement("span");
        o.className = "word"; o.style.setProperty("--word-index", i++); s.textContent = w; o.append(s); f.append(o);
      });
      n.replaceWith(f);
    });
  });
  const chaptersAt = (p) => {
    const ph = innerWidth <= 700, end = ph ? 0.93 : 0.84, rv = ph ? 0.93 : 0.855, fin = ph ? 0.985 : 0.91, n = Math.min(3, Math.floor(p * 4.35));
    chapters.forEach((c, i) => c.classList.toggle("is-visible", i === n && p < end));
    reveal.classList.toggle("is-visible", p > rv);
    root.style.setProperty("--progress", p.toFixed(4));
    root.style.setProperty("--final", smooth(0.79, fin, p).toFixed(4));
  };
  $(".a-stack").addEventListener("fx:progress", (e) => chaptersAt(e.detail.progress));

  // Hero — text pulls up 100px and the dot-cloud section title forms word by word
  const h1 = A.split($(".a-hero-copy h1"), "chars");
  const intro = () => h1 && !reduce && gsap.to(h1.parts, A.rise({ stagger: 0.03, duration: 1.1, delay: 0.2 }));
  const stackTitle = A.split($(".a-stack-stage h2"), "words");
  const hero = gsap.timeline({ defaults: { ease: "power2.inOut" }, scrollTrigger: { trigger: ".a-hero", start: "top top", end: () => "+=" + innerHeight * 1.3, pin: true, pinSpacing: false, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true } });
  hero.to(".a-hero-copy", { y: -100, opacity: 0, duration: 1, ease: "power2.in" }, 0)
    .to(".a-hero .a-scroll-hint", { opacity: 0, duration: 0.35, ease: "power2.in" }, 0)
    .to(".a-hero-eras", { y: -100, opacity: 0, duration: 1, ease: "power2.in" }, 0)
    .to(root, { "--entrance": 1, duration: 0.6, ease: "power2.out" }, ">");
  if (stackTitle) hero.to(stackTitle.parts, A.rise({ stagger: 0.022, duration: 0.14 }), "<");
  hero.to(".a-brand", { opacity: 0, duration: 0.7, ease: "power2.in" }, 0)
    .to(".a-hero-photo", { opacity: 0, duration: 0.7, ease: "power2.in" }, 0.3)
    .to({}, { duration: 0.001 }, 1.6);
  if (!reduce) ScrollTrigger.create({ trigger: ".a-stack", start: "top top", end: "bottom bottom", snap: snapOf(innerWidth <= 700 ? [0, 0.23, 0.46, 0.69, 0.93, 1] : [0, 0.23, 0.46, 0.69, 0.86, 1]), invalidateOnRefresh: true });

  // Statement · facts section
  const rows = gsap.utils.toArray(".a-truths > div");
  const one = $(".a-copilot-line.is-primary"), two = $(".a-copilot-line.is-secondary"), introBox = $(".a-copilot-intro");
  const p1 = A.split(one, "chars"), p2 = A.split(two, "chars");
  gsap.set(one, { autoAlpha: 1, y: 0, scale: 1 });
  gsap.set(two, { autoAlpha: 0, y: 60, scale: 1 });
  gsap.set(rows, { autoAlpha: 0, y: 34, filter: "blur(10px)", "--rule-progress": 0 });
  gsap.set(".a-copilot-summary", { autoAlpha: 0, y: 46, filter: "blur(12px)" });
  gsap.set(introBox, { "--blackout": 0 });
  if (p1 && !reduce) gsap.to(p1.parts, A.rise({ stagger: 0.03, duration: 0.13, scrollTrigger: { trigger: ".a-copilot", start: "top 85%", end: "top top", scrub: 0.3, invalidateOnRefresh: true } }));
  const cop = gsap.timeline({ defaults: { ease: "power2.inOut" }, scrollTrigger: { trigger: ".a-copilot", start: "top top", end: "bottom bottom", pin: introBox, pinSpacing: false, anticipatePin: 1, scrub: 0.4, invalidateOnRefresh: true,
    snap: snapOf((v) => nearest([0, cop.labels.turn / cop.duration(), cop.labels.table / cop.duration(), 1], v)) } });
  cop.addLabel("start", 0)
    .to(one, { autoAlpha: 0, y: -70, duration: 0.16 }, 0.08)
    .to(two, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.18)
    .to(p2 ? p2.parts : [], A.rise({ stagger: 0.009, duration: 0.07 }), "<")
    .addLabel("turn", 0.38)
    .to(two, { scale: 60 / 90, duration: 0.2 }, 0.48)
    .to(introBox, { "--blackout": 1, duration: 0.46 }, 0.5)
    .to(".a-copilot-flow", { y: () => { const lift = innerHeight * 0.36 + 90, body = $(".a-copilot-body"), sum = $(".a-copilot-summary"); return -Math.max(lift, body.offsetTop + sum.offsetTop + sum.offsetHeight + 40 - innerHeight); }, duration: 0.6, ease: "none" }, 0.52)
    .to(rows, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.14, stagger: 0.055, ease: "power3.out" }, 0.62)
    .to(rows, { "--rule-progress": 1, duration: 0.14, stagger: 0.055, ease: "power2.out" }, 0.64)
    .to(".a-copilot-summary", { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.2, ease: "power3.out" }, 0.9)
    .to(introBox, { "--blackout": 0, duration: 0.12 }, 1)
    .addLabel("table", 1.12);

  // Brain section — ring, pinwheel and five nodes drawn from one state (d)
  const brain = $(".a-brain"), stage = $(".a-brain-stage"), orbit = $(".a-brain-orbit"), wheel = $(".a-brain-wheel"), dots = $(".a-dots", orbit);
  const lines = $(".a-brain-lines"), paths = $$("path:not(.is-check)", lines), checkPaths = $$("path.is-check", lines);
  const nodes = $$(".a-brain-nodes span"), check = $(".a-brain-check"), caption = $(".a-brain-caption"), stateP = $(".a-brain-state.is-c p");
  const WIDTH = [86, 112, 95, 103, 86], RING = [198, 270, 342, 414, 486].map((v) => (v * Math.PI) / 180), ARC = [200, 235, 270, 305, 340].map((v) => (v * Math.PI) / 180);
  const PH = 0.68, PH_FONT = 11;
  const d = { x: 0, y: 0, diameter: 0, spinnerScale: 0.125, nodeVisibility: 0, nodeMorph: 0, nodeArc: 0, nodeLayout: 0, nodeDetached: 0, particleOpacity: 0, connectorProgress: 0, orbitOpacity: 0 };
  const accent = A.rgb(A.css("--kf-accent")), bg = A.rgb(A.css("--kf-bg")), ink = A.rgb(A.css("--kf-ink")), dotRgb = A.rgb(A.css("--kf-accent-soft"));
  const phoneStack = (e) => {
    const w = e.width, h = e.height, pr = stateP ? stateP.getBoundingClientRect() : null;
    const top = (pr ? pr.bottom - e.top : h * 0.3) + 18, foot = Math.max(64, h * 0.08), room = Math.max(140, h - foot - top), n = 6, pill = 47 * PH, cap = 32;
    const need = (g, a, r, b) => (pill + g) * (n - 1) + pill + a + r + b + cap;
    const lo = need(6, 8, 36, 40), hi = need(13, 16, Math.min(w * 0.15, 60), 58), k = hi > lo ? G((room - lo) / (hi - lo)) : 1, mix = (a, b) => a + (b - a) * k;
    const gap = mix(6, 13), after = mix(8, 16), ring = mix(36, Math.min(w * 0.15, 60)), below = mix(40, 58);
    const ys = Array.from({ length: n }, (_, i) => top + pill * 0.5 + (pill + gap) * i), ringY = ys[n - 1] + pill * 0.5 + after + ring * 0.5;
    return { x: w * 0.5, ys, ring, ringY, capY: ringY + ring * 0.5 + below };
  };
  const W = (name) => {
    const r = stage.getBoundingClientRect(), t = r.width || innerWidth, a = r.height || innerHeight, tab = t <= 1023, ph = t <= 700;
    const table = {
      future: ph ? { x: t * 0.5, y: a * 0.5, diameter: Math.min(t * 0.82, a * 0.45) } : { x: t * 0.5, y: a * 0.4526, diameter: Math.min(t * 0.5521, a * 0.7764) },
      brain: ph ? { x: t * 0.5, y: a * 0.4331, diameter: Math.min(t * 0.8, a * 0.5264) } : { x: t * 0.5, y: a * 0.4331, diameter: Math.min(t * 0.3743, a * 0.5264) },
      rik: ph ? (() => { const s = phoneStack(r); return { x: s.x, y: s.ringY, diameter: s.ring }; })() : { x: t * 0.5, y: a * 0.6216, diameter: Math.min(t * 0.1271, a * 0.1787) },
      center: { x: t * 0.5, y: a * 0.5, diameter: Math.min(t * 0.1271, a * 0.1787) },
      operations: ph ? { x: t * 0.5, y: a * 0.34, diameter: Math.min(t * 0.4, a * 0.18) } : tab ? { x: t * 0.5, y: a * 0.4, diameter: Math.min(t * 0.5, a * 0.22) } : { x: t * 0.6872, y: a * 0.5063, diameter: Math.min(t * 0.2854, a * 0.4014) },
    };
    return table[name];
  };
  const set = (el, k, v) => { if (el.style[k] !== v) el.style[k] = v; };
  const split = (p, q, v) => ({ x: p.x + (q.x - p.x) * v, y: p.y + (q.y - p.y) * v });
  const partCurve = (a, b, c, e, v) => { const ab = split(a, b, v), bc = split(b, c, v), ce = split(c, e, v), m1 = split(ab, bc, v), m2 = split(bc, ce, v), end = split(m1, m2, v); return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} C ${ab.x.toFixed(2)} ${ab.y.toFixed(2)}, ${m1.x.toFixed(2)} ${m1.y.toFixed(2)}, ${end.x.toFixed(2)} ${end.y.toFixed(2)}`; };
  function render() {
    const e = stage.getBoundingClientRect(), dia = Math.max(1, d.diameter), rad = dia * 0.5, ringTop = d.y - rad;
    set(orbit, "left", `${d.x.toFixed(2)}px`); set(orbit, "top", `${d.y.toFixed(2)}px`); set(orbit, "width", `${dia.toFixed(2)}px`); set(orbit, "height", `${dia.toFixed(2)}px`);
    set(orbit, "opacity", G(d.orbitOpacity).toFixed(4));
    orbit.style.setProperty("--ring", `${(Math.PI * dia * 0.485 * 2).toFixed(2)}px`);
    set(wheel, "transform", `translate(-50%, -50%) scale(${d.spinnerScale.toFixed(5)})`);
    const po = G(d.particleOpacity);
    set(dots, "opacity", po.toFixed(4)); set(dots, "visibility", po > 0.001 ? "visible" : "hidden");
    const ph = e.width <= 700, n = ph ? PH : e.width <= 1023 ? 0.72 : 1, g = ph ? PH_FONT / 14 : n;
    const widths = WIDTH.map((v) => v * g), gap = 32 * n, checkW = 92 * n, checkH = 36 * n, checkFont = 11 * n, wide = 52 * n;
    const row = [...widths]; row.splice(3, 0, checkW);
    const gapAt = (i) => (i === 3 || i === 4 ? wide : gap);
    const total = row.reduce((s, v, i) => s + v + (i ? gapAt(i) : 0), 0);
    const cx = []; { let x = (e.width - total) * 0.5; row.forEach((v, i) => { if (i) x += gapAt(i); cx.push(x + v * 0.5); x += v; }); }
    const slot = [0, 1, 2, 4, 5], rowY = e.height * 0.3696;
    const R = G(d.nodeMorph), arcK = G(d.nodeArc), lay = G(d.nodeLayout), det = G(d.nodeDetached), vis = G(d.nodeVisibility);
    const b = W("brain"), bR = b.diameter * 0.5, st = ph ? phoneStack(e) : null;
    const boxes = [];
    nodes.forEach((el, i) => {
      const onX = d.x + Math.cos(RING[i]) * rad, onY = d.y + Math.sin(RING[i]) * rad;
      const brX = b.x + Math.cos(RING[i]) * bR, brY = b.y + Math.sin(RING[i]) * bR;
      const x0 = onX + (brX - onX) * det, y0 = onY + (brY - onY) * det;
      const ang = RING[i] + (ARC[i] - RING[i]) * arcK, rr = bR * (1 - 0.06 * arcK);
      const x1 = x0 + (b.x + Math.cos(ang) * rr - x0) * arcK, y1 = y0 + (b.y + Math.sin(ang) * rr - y0) * arcK;
      const tx = ph ? st.x : cx[slot[i]], ty = ph ? st.ys[slot[i]] : rowY;
      const x = x1 + (tx - x1) * lay, y = y1 + (ty - y1) * lay;
      const w = 4 + (widths[i] - 4) * R, h = 4 + (47 * n - 4) * R, dark = R * 0.88;
      const fill = accent.map((c, k) => Math.round(c + (bg[k] - c) * dark));
      set(el, "left", `${x.toFixed(2)}px`); set(el, "top", `${y.toFixed(2)}px`); set(el, "width", `${w.toFixed(2)}px`); set(el, "height", `${h.toFixed(2)}px`);
      set(el, "fontSize", `${((ph ? PH_FONT : Math.max(9, 14 * n)) * R).toFixed(2)}px`);
      set(el, "color", `rgba(${ink},${R.toFixed(3)})`); set(el, "borderWidth", `${R.toFixed(3)}px`); set(el, "backgroundColor", `rgb(${fill})`);
      set(el, "opacity", vis.toFixed(4)); set(el, "visibility", vis > 0.001 ? "visible" : "hidden");
      boxes.push({ x, y, w, h });
    });
    const grow = G(d.connectorProgress), on = (grow > 0.001 ? 1 : 0) * R * vis, chk = G((lay - 0.85) / 0.15) * on;
    let cxk = 0, cyk = 0, cw = 0;
    if (ph) { cxk = st.x; cyk = st.ys[3]; cw = 4 + (WIDTH[1] * g - 4) * R; set(check, "width", `${cw.toFixed(2)}px`); set(check, "height", `${(4 + (47 * n - 4) * R).toFixed(2)}px`); set(check, "fontSize", `${(PH_FONT * R).toFixed(2)}px`); }
    else { cxk = cx[3]; cyk = rowY; cw = 4 + (checkW - 4) * R; set(check, "width", `${cw.toFixed(2)}px`); set(check, "height", `${(4 + (checkH - 4) * R).toFixed(2)}px`); set(check, "fontSize", `${(Math.max(8, checkFont) * R).toFixed(2)}px`); }
    set(check, "left", `${cxk.toFixed(2)}px`); set(check, "top", `${cyk.toFixed(2)}px`); set(check, "opacity", chk.toFixed(4)); set(check, "visibility", chk > 0.001 ? "visible" : "hidden");
    set(caption, "left", `${(ph ? st.x : d.x).toFixed(2)}px`); set(caption, "top", `${(ph ? st.capY : d.y + rad + 32).toFixed(2)}px`); set(caption, "opacity", chk.toFixed(4)); set(caption, "visibility", chk > 0.001 ? "visible" : "hidden");
    set(lines, "visibility", on > 0.001 || chk > 0.001 ? "visible" : "hidden");
    lines.setAttribute("viewBox", `0 0 ${e.width} ${e.height}`);
    if (ph) {
      const half = (4 + (47 * n - 4) * R) * 0.5;
      paths.forEach((p, i) => { set(p, "opacity", (i === 2 || i === 3 ? chk : on).toFixed(4)); p.setAttribute("d", `M ${st.x.toFixed(2)} ${(st.ys[i] + half).toFixed(2)} L ${st.x.toFixed(2)} ${(st.ys[i + 1] - half).toFixed(2)}`); });
      checkPaths.forEach((p) => { set(p, "opacity", "0"); p.setAttribute("d", ""); });
    } else {
      boxes.forEach((bx, i) => {
        const bottom = bx.y + bx.h * 0.5, span = Math.max(24, ringTop - bottom);
        set(paths[i], "opacity", on.toFixed(4));
        paths[i].setAttribute("d", partCurve({ x: d.x, y: ringTop }, { x: d.x, y: ringTop - span * 0.3 }, { x: bx.x, y: bottom + span * 0.42 }, { x: bx.x, y: bottom }, grow));
      });
      const l = boxes[2], r = boxes[3], hw = cw * 0.5;
      [[checkPaths[0], l.x + l.w * 0.5, cxk - hw], [checkPaths[1], cxk + hw, r.x - r.w * 0.5]].forEach(([p, a, z]) => { set(p, "opacity", chk.toFixed(4)); p.setAttribute("d", `M ${a.toFixed(2)} ${rowY.toFixed(2)} L ${z.toFixed(2)} ${rowY.toFixed(2)}`); });
    }
  }
  // 360 floating dots inside the ring
  const field = (() => {
    let s = 49271;
    const r = () => ((s = (Math.imul(s, 1664525) + 1013904223) | 0) >>> 0) / 4294967296;
    return Array.from({ length: 360 }, () => { const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 0.94; return { x: Math.cos(a) * rr, y: Math.sin(a) * rr, size: 0.45 + r() * 1.25, phase: r() * Math.PI * 2, speed: 0.18 + r() * 0.42, alpha: 0.2 + r() * 0.62 }; });
  })();
  const ctx = dots.getContext("2d");
  const drawDots = (now) => {
    if (d.particleOpacity <= 0.001) return;
    const b = dots.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 2), w = Math.max(1, Math.round(b.width * dpr)), h = Math.max(1, Math.round(b.height * dpr));
    if (dots.width !== w || dots.height !== h) { dots.width = w; dots.height = h; }
    ctx.clearRect(0, 0, w, h);
    const R = Math.min(w, h) * 0.48, cx = w * 0.5, cy = h * 0.5;
    for (const p of field) {
      const sway = reduce ? 0 : Math.sin(now * 0.001 * p.speed + p.phase) * R * 0.012;
      ctx.beginPath();
      ctx.arc(cx + p.x * R - p.y * sway, cy + p.y * R + p.x * sway, p.size * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${dotRgb},${p.alpha})`;
      ctx.fill();
    }
  };

  const states = $$(".a-brain-state");
  gsap.set(states, { autoAlpha: 0, y: 28 });
  const tA = A.split($(".a-brain-state.is-a h2"), "words"), tC = A.split($(".a-brain-state.is-c h2"), "chars");
  Object.assign(d, W("future"));
  render();
  const ops = $(".a-ops"), opsTitle = A.split($(".a-ops > h2"), "words"), arts = $$(".a-ops-copy article");
  let opsOn = false;
  const opsCheck = () => {
    if (!opsTitle) return;
    const at = 2.7 / brainTl.duration(), p = brainTl.progress();
    if (p >= at && !opsOn) { opsOn = true; gsap.to(opsTitle.parts, A.rise({ stagger: 0.08 })); }
    else if (p < at && opsOn) { opsOn = false; gsap.to(opsTitle.parts, A.sink); }
  };
  const STOPS = ["future", "brainPerimeter", "rikConnected", "operations01", "operations02", "operations03", "operations04"];
  const brainTl = gsap.timeline({ defaults: { ease: "power2.inOut" }, onUpdate() { render(); opsCheck(); }, scrollTrigger: { trigger: brain, start: "top top", end: "bottom bottom", pin: stage, pinSpacing: false, anticipatePin: 1, scrub: 0.4, invalidateOnRefresh: true, onRefresh: render,
    snap: snapOf((v) => nearest([0, ...STOPS.map((l) => brainTl.labels[l] / brainTl.duration()), 1], v)) } });
  brainTl.to(d, { orbitOpacity: 1, duration: 0.22, ease: "power2.out" }, 0.04)
    .fromTo(states[0], { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.1)
    .to(tA ? tA.parts : [], A.rise({ stagger: 0.026, duration: 0.07 }), "<")
    .addLabel("future", 0.39)
    .to(states[0], { autoAlpha: 0, y: -30, duration: 0.22 }, 0.42)
    .to(states[1], { autoAlpha: 1, y: 0, duration: 0.26 }, 0.6)
    .to(d, { x: () => W("brain").x, y: () => W("brain").y, diameter: () => W("brain").diameter, spinnerScale: 0.995, nodeVisibility: 1, particleOpacity: 1, duration: 0.38, ease: "none" }, 0.52)
    .to(d, { nodeMorph: 1, duration: 0.12, ease: "back.out(1.2)" }, 0.76)
    .addLabel("brainPerimeter", 0.92)
    .to(d, { nodeDetached: 1, duration: 0.01, ease: "none" }, 0.94)
    .to(d, { nodeArc: 1, duration: 0.16, ease: "power3.inOut" }, 0.96)
    .to(states[1], { autoAlpha: 0, y: -20, duration: 0.16 }, 1.14)
    .to(d, { particleOpacity: 0, duration: 0.14 }, 1.14)
    .to(d, { nodeLayout: 1, duration: 0.34, ease: "none" }, 1.16)
    .to(d, { x: () => W("rik").x, y: () => W("rik").y, diameter: () => W("rik").diameter, spinnerScale: 0.44875, duration: 0.34, ease: "none" }, 1.16)
    .to(states[2], { autoAlpha: 1, y: 0, duration: 0.2 }, 1.46)
    .to(tC ? tC.parts : [], A.rise({ stagger: 0.02, duration: 0.12 }), "<")
    .to(d, { connectorProgress: 1, duration: 0.18, ease: "power2.out" }, 1.6)
    .addLabel("rikConnected", 1.98);
  gsap.set(arts, { autoAlpha: 0, y: 22, yPercent: -50 });
  gsap.set(arts[0], { autoAlpha: 1, y: 0, yPercent: -50 });
  const fill = { value: 25 };
  brain.style.setProperty("--fill", "25");
  brainTl.to(states[2], { autoAlpha: 0, y: -20, duration: 0.14 }, 2.14)
    .to(d, { nodeVisibility: 0, connectorProgress: 0, duration: 0.12 }, 2.14)
    .to(d, { x: () => W("center").x, y: () => W("center").y, duration: 0.24, ease: "none" }, 2.16)
    .to(d, { x: () => W("operations").x, y: () => W("operations").y, diameter: () => W("operations").diameter, spinnerScale: innerWidth <= 700 ? 0.4875 : 0.86625, duration: 0.34, ease: "none" }, 2.43)
    .to(ops, { autoAlpha: 1, duration: 0.2 }, 2.7)
    .to([$(".fill", orbit), $(".a-step", orbit)], { opacity: 1, duration: 0.16 }, 2.72)
    .addLabel("operations01", 3.28);
  for (let i = 1; i < 4; i++) {
    const at = 3.04 + (i - 1) * 0.3;
    brainTl.to(arts[i - 1], { autoAlpha: 0, y: -20, duration: 0.12 }, at)
      .to(arts[i], { autoAlpha: 1, y: 0, duration: 0.16 }, at + 0.08)
      .to(fill, { value: (i + 1) * 25, duration: 0.22, onUpdate() { brain.style.setProperty("--fill", fill.value.toFixed(2)); } }, at)
      .addLabel(`operations0${i + 1}`, at + 0.24);
  }
  const tick = (now) => { drawDots(now); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  addEventListener("resize", render);

  // Declaration section — the robot fades out and the footer header rises within the same fixed layer
  const man = A.split($(".a-manifest-copy h2"), "words");
  if (man && !reduce) gsap.to(man.parts, A.rise({ stagger: 0.028, duration: 0.1, scrollTrigger: { trigger: ".a-manifest", start: "top 95%", end: "top 55%", scrub: 0.3, invalidateOnRefresh: true } }));
  const footTitle = A.split($(".a-foot-main h2"), "chars");
  gsap.set(".a-foot-main", { autoAlpha: 0, y: 44 });
  let footOn = false;
  const footCheck = () => {
    if (!footTitle) return;
    const at = 0.58 / manTl.duration(), p = manTl.progress();
    if (p >= at && !footOn) { footOn = true; gsap.to(footTitle.parts, A.rise({ stagger: 0.025 })); }
    else if (p < at && footOn) { footOn = false; gsap.to(footTitle.parts, A.sink); }
  };
  const manTl = gsap.timeline({ defaults: { ease: "power2.in" }, onUpdate: footCheck, scrollTrigger: { trigger: ".a-manifest", start: "top top", end: () => "+=" + innerHeight * (innerWidth <= 700 ? 1.15 : 0.75), pin: true, pinSpacing: false, scrub: 0.4, anticipatePin: 1, invalidateOnRefresh: true, snap: snapOf([0, 0.73, 1]) } })
    .to(".a-manifest-robot", { opacity: 0, filter: "blur(24px)", y: -24, duration: 0.5 }, 0)
    .to(".a-manifest-copy", { autoAlpha: 0, y: -24, duration: 0.45 }, 0.05)
    .to(".a-foot-main", { autoAlpha: 1, y: 0, duration: 0.15, ease: "power2.out" }, 0.58)
    .to({}, { duration: 0.001 }, 1);
  A.footer({ main: false });
  A.robot($(".a-manifest-robot"), { below: 0.08, top: 0.02 });
  ScrollTrigger.refresh();
  A.preload({ key: "a-intro-seen", seconds: 11.9, onDone: intro });
})();
