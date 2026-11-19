// Home page motion — original inline script values (post-loader sequence, video scrub, number roll, auto-advance system, footer light), and,
// The site builder’s IX2 scroll ranges (hero steps, card changes) are positions estimated from screen captures
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = innerWidth > 767;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
  const span = (p, a, b) => clamp((p - a) / (b - a));
  // Original progress — 0 when the section top touches the screen bottom, 1 when the section bottom passes the screen top (passed ÷ (section height + screen height))
  const passed = (el) => { const r = el.getBoundingClientRect(); return clamp((innerHeight - r.top) / (r.height + innerHeight)); };
  const onScroll = (fn) => { (window.zkLenis ? window.zkLenis.on("scroll", fn) : addEventListener("scroll", fn, { passive: true })); fn(); };
  const inview = (el, on) => el && el.classList.toggle("is-inview", on);

  /* ── Hero ───────────────────────────── */
  const hero = $(".zk-hero");
  const seq = $(".zk-hero__seq"), vid = $(".zk-hero__video"), fly = $(".zk-hero__fly");
  const step1 = $(".zk-step1");
  const SEQ = +seq.dataset.frames, MID = Math.floor(SEQ / 2);
  let seqFrame = 0;
  const drawSeq = (f) => { seqFrame = f; window.zkPaint(seq, f / (SEQ - 1)); };
  drawSeq(0);
  // When the loader is 45% out, the first half plays linearly over 2 seconds (original playSequenceFirstHalf)
  window.zkPlayFirstHalf = () => {
    const o = { f: 0 };
    gsap.to(o, { f: MID - 1, duration: reduce ? 0 : 2, ease: "none", onUpdate: () => drawSeq(Math.round(o.f)) });
  };
  // Continuous footage — starts from the beginning at hero progress .175 and loops (original video2.play, loop)
  let vidStart = 0;
  const vidLoop = (now) => {
    if (vidStart && vid.style.opacity !== "0") window.zkPaint(vid, reduce ? 0 : ((now - vidStart) % 8000) / 8000);
    requestAnimationFrame(vidLoop);
  };
  requestAnimationFrame(vidLoop);

  // Five gauges — the original Lottie (640×640, 300 frames·60fps) drawn as SVG at the same position and frame range
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent?.appendChild(n); return n; };
  const gauges = $$(".zk-gauge").map((box) => {
    const svg = el("svg", { viewBox: "0 0 640 640" }, box);
    const ink = "var(--kf-ink)", acc = "var(--kf-accent)";
    el("circle", { cx: 320, cy: 320, r: 290, fill: "color-mix(in oklab, var(--kf-ink) 3%, transparent)" }, svg);
    el("circle", { cx: 320, cy: 320, r: 300, fill: "none", stroke: "color-mix(in oklab, var(--kf-ink) 35%, transparent)", "stroke-width": 1.5, "stroke-dasharray": "1.5 6" }, svg);
    const C = 2 * Math.PI * 300;
    const arc = el("circle", { cx: 320, cy: 320, r: 300, fill: "none", stroke: acc, "stroke-width": 2, "stroke-dasharray": `${C} ${C}`, "stroke-dashoffset": C, transform: "rotate(-90 320 320)" }, svg);
    el("line", { x1: 320, y1: 6, x2: 320, y2: 40, stroke: acc, "stroke-width": 2 }, svg);
    const tag = el("g", {}, svg);
    el("rect", { x: 262, y: 176, width: 54, height: 16, fill: "none", stroke: ink, "stroke-width": 1 }, tag);
    el("rect", { x: 316, y: 176, width: 62, height: 16, fill: ink }, tag);
    el("text", { x: 289, y: 188, "text-anchor": "middle", "font-size": 9, class: "zk-g-tag" }, tag).textContent = "UNIT";
    el("text", { x: 347, y: 188, "text-anchor": "middle", "font-size": 9, class: "zk-g-tag", style: "fill: var(--kf-bg)" }, tag).textContent = `0${box.dataset.step}`;
    const g = { box, arc, C, f0: +box.dataset.f0, f1: +box.dataset.f1, step: +box.dataset.step };
    if (box.classList.contains("zk-gauge--track")) {
      el("rect", { x: 270, y: 270, width: 100, height: 100, fill: "none", stroke: acc, "stroke-width": 2 }, svg);
      el("path", { d: "M320 250v40M320 350v40M250 320h40M350 320h40", stroke: acc, "stroke-width": 2 }, svg);
      g.points = [0, 1, 2].map(() => el("circle", { r: 5, fill: ink }, svg));
    } else {
      g.from = +box.dataset.from; g.to = +box.dataset.to;
      g.num = el("text", { x: 320, y: 368, "text-anchor": "middle", "font-size": 132, "font-weight": 500, "letter-spacing": -5 }, svg);
      el("text", { x: 470, y: 366, "font-size": 10, class: "zk-g-unit" }, svg).textContent = box.dataset.unit;
    }
    g.set = (p) => {
      const f = p * 300, q = clamp((f - g.f0) / (g.f1 - g.f0));
      arc.setAttribute("stroke-dashoffset", C * (1 - q * 0.42));
      if (g.num) g.num.textContent = Math.round(g.from + (g.to - g.from) * q).toLocaleString("en-US").replace(",", " ");
      if (g.points) g.points.forEach((pt, i) => { const a = q * 4 + i * 2.1; pt.setAttribute("cx", 320 + Math.cos(a) * (150 + i * 30)); pt.setAttribute("cy", 320 + Math.sin(a * 1.3) * (110 + i * 25)); });
    };
    g.set(0);
    return g;
  });
  const sets = $$(".zk-step2__set");
  const FLY = +fly.dataset.frames;
  let lastFly = -1;
  // Hero range (progress p = While stuck 0→1): second half of sequence · title · video · darkness · five triggers
  const W0 = 0.62, W1 = 0.98, STEP = (W1 - W0) / 5;
  const heroUpdate = () => {
    const r = hero.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    const pp = passed(hero);
    if (desktop && pp >= 0.09 && pp <= 0.17) {
      const f = MID + Math.round(span(pp, 0.09, 0.17) * (SEQ - 1 - MID));
      if (f !== seqFrame) drawSeq(f);
    }
    if (pp >= 0.175 && !vidStart) vidStart = performance.now();
    seq.style.opacity = String(1 - span(p, 0.16, 0.2));
    vid.style.opacity = String(span(p, 0.15, 0.2) * (1 - span(p, 0.52, 0.6)));
    step1.style.opacity = String(1 - span(p, 0.42, 0.55));
    step1.style.transform = `translateY(${-span(p, 0.42, 0.55) * 2}rem)`;
    fly.style.opacity = String(span(p, W0 - 0.04, W0));
    const fp = span(p, W0, W1), ff = Math.round(fp * (FLY - 1));
    if (ff !== lastFly && fly.style.opacity !== "0") { lastFly = ff; window.zkPaint(fly, ff / (FLY - 1)); }
    const cur = p < W0 ? -1 : Math.min(4, Math.floor((p - W0) / STEP));
    gauges.forEach((g, i) => {
      const local = span(p, W0 + i * STEP, W0 + (i + 1) * STEP);
      g.set(local);
      const d = Math.sign(i - cur);
      const show = cur >= 0 && d === 0;
      const state = show ? 0 : d;
      if (state !== g.state) {
        g.state = state;
        gsap.to(g.box, { x: `${state * 10}rem`, opacity: show ? 1 : 0, duration: reduce ? 0 : 0.5, ease: "power2.out", overwrite: "auto" });
      }
      const s = sets[i];
      if (s) {
        const on = show;
        if (on !== s.zkOn) { s.zkOn = on; gsap.to(s, { opacity: on ? 1 : 0, duration: reduce ? 0 : 0.4, overwrite: "auto" }); $$("[data-fx~='glitch-char-fade']", s).forEach((t) => inview(t, on)); }
      }
    });
  };
  onScroll(heroUpdate);
  addEventListener("resize", heroUpdate);

  /* ── Circle-open backdrop (original bg-v-st: once opaque, the circle grows to 150% in 2.2s power4.inOut) ── */
  const circle = $(".zk-circle"), threat = $(".zk-threat");
  let circleOpen = false;
  ScrollTrigger.create({
    trigger: threat, start: "top bottom",
    onEnter: () => {
      if (circleOpen) return;
      circleOpen = true;
      gsap.to(circle, { opacity: 1, duration: reduce ? 0 : 0.8 });
      gsap.to(circle, { clipPath: "circle(150% at 50% 50%)", duration: reduce ? 0 : 2.2, ease: "power4.inOut" });
    },
    onLeaveBack: () => { circleOpen = false; gsap.killTweensOf(circle); gsap.set(circle, { clipPath: "circle(0% at 50% 50%)", opacity: 0 }); },
  });

  /* ── One-line threat ─────────────────────── */
  const bars = $(".zk-threat__bars");
  for (let i = 0; i < 24; i++) bars.appendChild(document.createElement("i"));
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Twenty-four vertical bars grow from 0 to the screen height in a shuffled order (i×.08 + 0~.2) (scrub 1)
    const items = gsap.utils.shuffle($$("i", bars));
    const tl = gsap.timeline({ scrollTrigger: { trigger: bars, start: "top 85%", end: "bottom 100%", scrub: 1 } });
    items.forEach((it, i) => tl.to(it, { height: "100vh", ease: "none", duration: 1 }, i * 0.08 + Math.random() * 0.2));
    const t2 = gsap.timeline({ scrollTrigger: { trigger: threat, start: "top top", end: "bottom bottom", scrub: true } });
    t2.fromTo(".zk-threat__l1", { x: "-12rem", opacity: 0 }, { x: 0, opacity: 1, ease: "none", duration: 0.3 }, 0)
      .fromTo(".zk-threat__l21", { x: "14rem", opacity: 0 }, { x: 0, opacity: 1, ease: "none", duration: 0.3 }, 0.05)
      .fromTo(".zk-threat__l22", { x: "-8rem", opacity: 0 }, { x: 0, opacity: 1, ease: "none", duration: 0.3 }, 0.08)
      .fromTo(".zk-threat__sight", { rotate: -90, scale: 0.6, opacity: 0 }, { rotate: 0, scale: 1, opacity: 1, ease: "none", duration: 0.3 }, 0.08)
      .fromTo(".zk-threat__note", { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.1 }, 0.3)
      .to(".zk-threat__text", { opacity: 0.25, ease: "none", duration: 0.2 }, 0.8);
  });
  ScrollTrigger.create({
    trigger: threat, start: "top 40%",
    onEnter: () => { $$("[data-fx~='glitch-char-fade']", threat).forEach((t) => inview(t, true)); window.zkDecrypt($(".zk-threat__note .zk-decrypt"), "#*@!&?%I13$"); },
    onLeaveBack: () => $$("[data-fx~='glitch-char-fade']", threat).forEach((t) => inview(t, false)),
  });

  /* ── Number roll (original: while section 55%→65% passes the screen center, scrub 1, each slot passes five random rows, 99 000 → 2 000) ── */
  const digits = $("#zk-digits");
  if (digits) {
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font:inherit;letter-spacing:inherit";
    digits.appendChild(probe);
    const wOf = (t) => { probe.textContent = t; return probe.getBoundingClientRect().width; };
    const pad = desktop ? 6 : 5;
    const w9 = wOf("9") + pad, w0 = wOf("0") + pad, sp = Math.max(wOf("0 0") - 2 * wOf("0"), 0);
    probe.remove();
    const cols = [];
    const slot = (w, cls) => { const s = document.createElement("div"); s.className = `zk-slot ${cls}`; s.style.width = `${w}px`; digits.appendChild(s); return s; };
    const strip = (s, seq) => { const st = document.createElement("div"); st.className = "zk-strip"; seq.forEach((c) => { const d = document.createElement("div"); d.textContent = c; st.appendChild(d); }); s.appendChild(st); cols.push({ s, st, n: seq.length }); };
    const rnd = () => Array.from({ length: 5 }, () => String(Math.floor(Math.random() * 10)));
    const lead = slot(w9, "zk-slot--lead"); strip(lead, ["9", ""]);
    strip(slot(w9, ""), ["9", ...rnd(), "2"]);
    slot(sp, "zk-slot--space");
    for (let i = 0; i < 3; i++) strip(slot(w0, ""), ["0", ...rnd(), "0"]);
    const odo = $(".zk-odo");
    const rowH = () => cols[0].st.firstElementChild.getBoundingClientRect().height;
    const tl = gsap.timeline({ scrollTrigger: { trigger: odo, start: "55% center", end: "65% center", scrub: reduce ? true : 1, invalidateOnRefresh: true } });
    cols.forEach((c, i) => tl.to(c.st, { y: () => -(c.n - 1) * rowH(), ease: "none", duration: 1 }, i * 0.06));
    tl.to(lead, { width: 0, ease: "none", duration: 1 }, 0);
    tl.to(".zk-odo__region", { yPercent: -100, ease: "none", duration: 1 }, 0);
    tl.to(".zk-odo__i", { yPercent: -100, ease: "none", duration: 1 }, 0);
  }

  /* ── Video scrub (original: over section progress .23→.77 it goes 0→8s, stepped in .04s units) · five cards ── */
  const info = $(".zk-info"), ivid = $(".zk-info__video"), icards = $$(".zk-icard");
  let lastT = -1, lastCard = -2;
  const infoUpdate = () => {
    const pp = passed(info);
    if (pp >= 0.23 && pp <= 0.77) {
      const t = Math.round((span(pp, 0.23, 0.77) * 8) / 0.04) * 0.04;
      if (Math.abs(t - lastT) > 0.05 || lastT < 0) { lastT = t; window.zkPaint(ivid, t / 8); }
    } else if (lastT < 0) { lastT = 0; window.zkPaint(ivid, 0); }
    const idx = pp < 0.23 ? 0 : Math.min(icards.length - 1, Math.floor(span(pp, 0.23, 0.77) * icards.length));
    if (idx !== lastCard) {
      lastCard = idx;
      icards.forEach((c, i) => gsap.to(c, { opacity: i === idx ? 1 : 0, y: i === idx ? 0 : i < idx ? "-2rem" : "2rem", duration: reduce ? 0 : 0.5, ease: "power2.out", overwrite: "auto" }));
    }
  };
  onScroll(infoUpdate);

  /* ── Five numbered cards ───────────────────── */
  const cards = $(".zk-cards");
  const nums = $$(".zk-cards__nums span"), texts = $$(".zk-cards__t"), shots = $$(".zk-cards__shot");
  const now = $(".zk-cards__now"), rail = $(".zk-cards__railfill");
  let lastC = -1;
  const shuffle = (p) => {
    if (!p.dataset.original) {
      p.dataset.original = p.textContent;
      p.innerHTML = p.textContent.split(" ").map((w) => `<span class="zk-sw">${w}</span>`).join(" ");
    }
    $$(".zk-sw", p).forEach((w, i) => {
      const final = w.dataset.w ?? (w.dataset.w = w.textContent);
      clearInterval(w.zkT);
      if (reduce) { w.textContent = final; return; }
      const end = performance.now() + 400 + i * 30;
      w.zkT = setInterval(() => {
        if (performance.now() >= end) { clearInterval(w.zkT); w.textContent = final; return; }
        w.textContent = gsap.utils.shuffle([...final]).join("");
      }, 40);
    });
  };
  const cardsUpdate = () => {
    const r = cards.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    const idx = Math.min(4, Math.floor(p * 5));
    rail.style.height = `${(idx + 1) * 20}%`;
    if (idx === lastC) return;
    lastC = idx;
    nums.forEach((n, i) => gsap.to(n, { opacity: i === idx ? 1 : 0, duration: reduce ? 0 : 0.3, overwrite: "auto" }));
    shots.forEach((s, i) => gsap.to(s, { opacity: i === idx ? 1 : 0, duration: reduce ? 0 : 0.4, overwrite: "auto" }));
    texts.forEach((t, i) => {
      gsap.to(t, { opacity: i === idx ? 1 : 0, duration: reduce ? 0 : 0.3, overwrite: "auto" });
      inview($(".zk-cards__h", t), i === idx);
      if (i === idx) shuffle($(".zk-shuffle", t));
    });
    now.textContent = String(idx + 1).padStart(2, "0");
  };
  onScroll(cardsUpdate);

  /* Stats: the target photo follows the pointer by ±20px (.8s power3.out), as the panel passes the left side gets pushed up and the bars fill */
  const stat = $(".zk-stat"), statGrid = $(".zk-stat__grid"), move = $(".zk-move");
  if (statGrid && move && matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce) {
    const qx = gsap.quickTo(move, "x", { duration: 0.8, ease: "power3.out" }), qy = gsap.quickTo(move, "y", { duration: 0.8, ease: "power3.out" });
    statGrid.addEventListener("mousemove", (e) => { const b = statGrid.getBoundingClientRect(); qx(((e.clientX - b.left) / b.width - 0.5) * 2 * 20); qy(((e.clientY - b.top) / b.height - 0.5) * 2 * 20); });
    statGrid.addEventListener("mouseleave", () => { qx(0); qy(0); });
  }
  ScrollTrigger.create({ trigger: stat, start: "top 60%", onEnter: () => stat.classList.add("is-on"), onLeaveBack: () => stat.classList.remove("is-on") });
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({ scrollTrigger: { trigger: stat, start: "top top", end: "bottom bottom", scrub: true } })
      .to(".zk-stat__head", { y: "-12rem", opacity: 0, ease: "none", duration: 1 }, 0)
      .to(".zk-stat__drone", { yPercent: -60, ease: "none", duration: 1 }, 0);
  });

  /* ── Spec statement: vertical-panel photo grows to fill the screen, title leaves upward, then paragraph·numbers come in ── */
  const spec = $(".zk-spec");
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({ scrollTrigger: { trigger: spec, start: "top top", end: "bottom bottom", scrub: true } })
      .to(".zk-spec__photo", { left: 0, right: 0, top: 0, bottom: 0, ease: "none", duration: 0.25 }, 0.3)
      .to([".zk-spec__heading", ".zk-spec__side"], { y: "-40vh", opacity: 0, ease: "none", duration: 0.2 }, 0.3)
      .to(".zk-spec__abs", { opacity: 1, ease: "none", duration: 0.06 }, 0.5)
      .fromTo(".zk-spec__num", { color: "var(--site-grey)" }, { color: "var(--kf-ink)", ease: "none", duration: 0.15 }, 0.7)
      .to({}, { duration: 0.15 }, 0.85);
  });
  let specOn = false;
  ScrollTrigger.create({
    trigger: spec, start: () => `top+=${(spec.offsetHeight - innerHeight) * 0.5} top`,
    onEnter: () => {
      if (specOn) return;
      specOn = true;
      inview($(".zk-spec__lead"), true);
      const k = reduce ? 0 : 1;
      gsap.to(".zk-spec__line", { width: "42rem", duration: 1.2 * k, ease: "power2.out" });
      $$(".zk-spec__item").forEach((it, i) => {
        gsap.to($(".zk-spec__num", it), { opacity: 1, y: 0, duration: 1.1 * k, delay: (0.2 + i * 0.15) * k, ease: "power3.out" });
        gsap.to($(".zk-spec__vline", it), { height: "100%", duration: 0.9 * k, delay: (0.3 + i * 0.15) * k, ease: "power2.out" });
      });
    },
    onLeaveBack: () => {
      specOn = false;
      inview($(".zk-spec__lead"), false);
      gsap.set(".zk-spec__line", { width: 0 });
      gsap.set(".zk-spec__num", { opacity: 0, y: 40 });
      gsap.set(".zk-spec__vline", { height: "0.1rem" });
    },
  });

  /* ── System: once the panel is fully visible it auto-advances every 3 seconds from the first cell, a click restarts from that cell ── */
  const sys = $(".zk-sys"), sysTop = $(".zk-sys__top"), sysItems = $(".zk-sys__items");
  const items = $$(".zk-sys__item"), imgs = $$(".zk-sys__img");
  let active = 0, auto = null, prog = null, sysOn = false;
  const setActive = (i) => {
    const prev = items[active];
    if (prev && prev !== items[i]) gsap.set($(".zk-sys__prog i", prev), { height: "0%" });
    active = i;
    items.forEach((it, k) => gsap.to(it, { opacity: k === i ? 1 : 0.6, duration: 0.4, overwrite: "auto" }));
    imgs.forEach((im, k) => gsap.to(im, { opacity: k === i ? 1 : 0, duration: k === i ? 0.5 : 0.4, overwrite: "auto" }));
    const line = $(".zk-sys__prog i", items[i]);
    gsap.set(line, { height: "0%" });
    prog?.kill();
    prog = gsap.to(line, { height: "100%", duration: reduce ? 0 : 3, ease: "none" });
  };
  const start = () => { clearInterval(auto); auto = setInterval(() => setActive((active + 1) % items.length), 3000); };
  items.forEach((it, i) => it.addEventListener("click", () => { clearInterval(auto); setActive(i); start(); }));
  ScrollTrigger.create({
    trigger: sys, start: "top top", end: "bottom bottom",
    // The original: once a panel is fully seen, auto-advance keeps running even when it moves to the section below (the upper panel stays opaque) — it stops only when going back up
    onEnter: () => {
      gsap.to([sysTop, sysItems], { opacity: 1, duration: reduce ? 0 : 0.5, overwrite: "auto" });
      if (!sysOn) { sysOn = true; setActive(0); start(); inview($("[data-fx~='glitch-char-fade']", sysTop), true); }
    },
    onLeaveBack: () => {
      gsap.to([sysTop, sysItems], { opacity: 0, duration: reduce ? 0 : 0.5, overwrite: "auto" });
      sysOn = false; clearInterval(auto);
    },
  });

  /* ── Video story: the panel brightens as it enters, and the side text columns drift 80% over 80s toward upper left and lower right, following scroll speed (×2.5, max 6x) by .08 to change speed and direction ── */
  const story = $(".zk-story"), storyStage = $(".zk-story__stage");
  const LINES = ["// LOG 00 — 00.00.0000", "GUIDANCE ENGAGED AT 000 M", "TARGET CLASS — TYPE-00", "ALT 000M — HEADING 000°", "LINK STABLE — 00 MS", "TARGET DESTROYED", "UNIT 00 RETURNING", "BATTERY 00% — RANGE 00 KM"];
  const runs = $$(".zk-story__run").map((run, ri) => {
    for (let k = 0; k < 4; k++) LINES.forEach((t) => { const p = document.createElement("p"); p.textContent = t; run.appendChild(p); });
    return run.animate(ri ? [{ transform: "translateY(-80%)" }, { transform: "translateY(0)" }] : [{ transform: "translateY(0)" }, { transform: "translateY(-80%)" }], { duration: 80000, iterations: Infinity, easing: "linear" });
  });
  runs.forEach((a) => { a.currentTime = 80000; a.pause(); });
  let rate = 1, target = 1, dirn = 1, lastY = scrollY, lastE = performance.now(), lastS = 0, storyVisible = false;
  addEventListener("scroll", () => {
    const t = performance.now(), d = scrollY - lastY;
    if (Math.abs(d) > 1) { dirn = d > 0 ? 1 : -1; target = dirn * Math.min(1 + (Math.abs(d) / Math.max(t - lastE, 1)) * 2.5, 6); lastS = t; }
    lastY = scrollY; lastE = t;
  }, { passive: true });
  const speedLoop = () => {
    if (performance.now() - lastS > 120) target = dirn * 1;
    rate += (target - rate) * 0.08;
    if (storyVisible) runs.forEach((a) => (a.updatePlaybackRate ? a.updatePlaybackRate(rate) : (a.playbackRate = rate)));
    requestAnimationFrame(speedLoop);
  };
  if (!reduce) requestAnimationFrame(speedLoop);
  new IntersectionObserver(([e]) => { storyVisible = e.isIntersecting; runs.forEach((a) => (storyVisible && !reduce ? a.play() : a.pause())); }).observe(story);
  const storyUpdate = () => {
    const r = story.getBoundingClientRect();
    storyStage.style.opacity = String(span(clamp((innerHeight - r.top) / innerHeight), 0.55, 1));
  };
  onScroll(storyUpdate);
  const sound = $(".zk-sound");
  sound?.addEventListener("click", () => {
    const on = sound.getAttribute("aria-pressed") !== "true";
    sound.setAttribute("aria-pressed", String(on));
    $(".zk-sound__label", sound).textContent = on ? "sound on" : "sound off";
  });

  /* ── Footer: the glow follows the pointer by .04 per frame ── */
  const foot = $(".zk-footer"), glow = $(".zk-footer__glow");
  if (foot && glow) {
    let tx = 0, ty = 0, gx = 0, gy = 0;
    const set = (e) => { const b = foot.getBoundingClientRect(); tx = e.clientX - b.left; ty = e.clientY - b.top; };
    foot.addEventListener("mouseenter", (e) => { set(e); gx = tx; gy = ty; glow.style.opacity = "1"; });
    foot.addEventListener("mousemove", set);
    foot.addEventListener("mouseleave", () => (glow.style.opacity = "0"));
    const loop = () => { gx += (tx - gx) * 0.04; gy += (ty - gy) * 0.04; glow.style.transform = `translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%)`; requestAnimationFrame(loop); };
    loop();
  }
  window.zkPaint($(".zk-circle canvas"), 0);
  addEventListener("load", () => ScrollTrigger.refresh());
})();
