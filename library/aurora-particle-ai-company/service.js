// Service page — original values: header .55 screen pin (scrub .5), workbench (A.bench), flow diagram 7.24 × 1.148 screen pin (scrub 1, snap per section),
// Baseline lines (dim curtain 0→1→0, lines .22s · .11 sequence), ring story (A.story), value graphic (per line top 88% → 58%, scrub .4)
(() => {
  const { reduce } = A;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const hero = $(".s-hero"), h1 = A.split($("h1", hero), "chars"), lede = $(".s-hero-copy p"), hint = $(".a-scroll-hint", hero);
  if (h1 && !reduce) gsap.to(h1.parts, A.rise({ stagger: 0.02, duration: 0.9, delay: 0.15 }));
  if (reduce) gsap.set([lede, hint], { opacity: 1 });
  else {
    gsap.set(lede, { opacity: 0, y: 12 });
    gsap.set(hint, { opacity: 0 });
    gsap.to(lede, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.55 });
    gsap.to(hint, { opacity: 1, duration: 0.6, delay: 0.95 });
    gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: () => "+=" + innerHeight * 0.55, pin: true, pinSpacing: false, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true } })
      .to(".s-hero-copy", { y: -80, opacity: 0, duration: 1, ease: "power2.in" }, 0)
      .to(hint, { opacity: 0, duration: 0.35, ease: "power2.in" }, 0)
      .to($(".a-media", hero), { opacity: 0, duration: 1, ease: "none" }, 0);
  }

  A.bench($(".s-bench"));

  // Flowchart
  const flow = $(".s-flow"), stage = $(".s-flow-stage"), core = $(".s-core"), svg = $(".a-flowlines", flow);
  const weeks = $(".s-flow-copy.is-weeks"), chooses = $(".s-flow-copy.is-chooses"), rule = $(".s-flow-rule"), arts = $$(".s-flow-slides article"), hintF = $(".s-flow-hint"), nodes = $$(".a-node", flow);
  const narrow = () => innerWidth <= 1023, CORE_Y = 0.531;
  let lines = [], lift = 0;
  const draw = { v: 0 };
  const paint = () => lines.forEach(({ p, len }) => { p.style.strokeDasharray = len; p.style.strokeDashoffset = len * (1 - draw.v); });
  const layout = () => {
    svg.querySelectorAll("path").forEach((p) => p.remove());
    lines = [];
    const r = stage.getBoundingClientRect(), w = r.width, h = r.height;
    if (!w || !h) return;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    lift = narrow() ? -h * 0.2 : h * (0.309 - CORE_Y);
    const cx = w * 0.5, top = h * 0.402, row = h * 0.565, side = w * 0.19;
    const xs = narrow() ? [cx, cx, cx] : [cx - side, cx, cx + side], ys = narrow() ? [h * 0.42, h * 0.58, h * 0.74] : [row, row, row];
    nodes.forEach((n, i) => { n.style.left = xs[i] + "px"; n.style.top = ys[i] + "px"; });
    if (narrow()) return;
    const add = (d) => { const p = document.createElementNS("http://www.w3.org/2000/svg", "path"); p.setAttribute("d", d); svg.append(p); lines.push({ p, len: p.getTotalLength() }); };
    const f = (n) => n.toFixed(2);
    add(`M ${f(cx)} ${f(top)} C ${f(cx)} ${f(top + (row - top) * 0.68)}, ${f(xs[0])} ${f(row - 78)}, ${f(xs[0])} ${f(row - 40)}`);
    add(`M ${f(cx)} ${f(top)} L ${f(cx)} ${f(row - 40)}`);
    add(`M ${f(cx)} ${f(top)} C ${f(cx)} ${f(top + (row - top) * 0.68)}, ${f(xs[2])} ${f(row - 78)}, ${f(xs[2])} ${f(row - 40)}`);
    paint();
  };
  layout();
  ScrollTrigger.addEventListener("refresh", () => { layout(); paint(); });
  gsap.set(core, { opacity: 1 });
  gsap.set(chooses, { opacity: 0 });
  gsap.set(rule, { opacity: 0, yPercent: -50 });
  gsap.set(arts, { autoAlpha: 0, y: 20, yPercent: -50 });
  gsap.set(nodes, { opacity: 0 });
  gsap.set(hintF, { opacity: 0 });
  const wk = A.split($("h2", weeks), "words"), ch = A.split($("h2", chooses), "words");
  if (!reduce) {
    const t = gsap.timeline({ scrollTrigger: { trigger: flow, start: "top top", end: () => "+=" + innerHeight * 0.3, scrub: 0.35, invalidateOnRefresh: true } });
    t.fromTo(core, { opacity: 0 }, { opacity: 1, duration: 0.62, ease: "power2.out" }, 0);
    if (wk) t.to(wk.parts, A.rise({ stagger: 0.03, duration: 0.7 }), 0.12);
  }
  const OUT = 0.12, IN = 0.26, HOLD = 0.62, STEP = OUT + IN + HOLD, START = 0.74, FIRST = START + IN + HOLD;
  const stops = [START + IN];
  for (let s = 1; s < arts.length; s++) stops.push(FIRST + (s - 1) * STEP + OUT + IN);
  const END = FIRST + (arts.length - 1) * STEP, CH = END + 0.62, INFO = END + 1, AT = INFO + 0.75, TOTAL = AT + 0.87, SCALE = 1.148;
  const shift = () => (narrow() ? 0 : 236), prog = { v: 0 }, putProg = () => rule.style.setProperty("--progress", prog.v.toFixed(4));
  const ft = gsap.timeline({ scrollTrigger: { trigger: flow, start: "top top", end: () => "+=" + innerHeight * TOTAL * SCALE, pin: stage, scrub: 1, invalidateOnRefresh: true, onUpdate: paint,
    snap: A.snap([0, ...stops.map((s) => s / TOTAL), CH / TOTAL, AT / TOTAL, 1]) } });
  ft.fromTo(core, { x: 0 }, { x: shift, duration: 0.3, ease: "power2.inOut" }, START - 0.3)
    .fromTo(rule, { opacity: 0 }, { opacity: 1, duration: 0.2 }, START)
    .fromTo(arts[0], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: IN }, START);
  for (let s = 1; s < arts.length; s++) {
    const g = FIRST + (s - 1) * STEP;
    ft.fromTo(arts[s - 1], { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -16, duration: OUT }, g)
      .fromTo(arts[s], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: IN }, g + OUT)
      .to(prog, { v: s / (arts.length - 1), duration: 0.3, onUpdate: putProg }, g);
  }
  ft.fromTo(arts[arts.length - 1], { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -16, duration: 0.14 }, END + 0.1)
    .fromTo(rule, { opacity: 1 }, { opacity: 0, duration: 0.14 }, END + 0.1)
    .fromTo(core, { x: shift }, { x: 0, duration: 0.3, ease: "power2.inOut" }, END + 0.16)
    .to(weeks, { opacity: 0, y: -66, duration: 0.18 }, END + 0.3)
    .fromTo(chooses, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 0.2 }, END + 0.4)
    .to(ch ? ch.parts : [], A.rise({ stagger: 0.03, duration: 0.3 }), END + 0.4)
    .fromTo(chooses, { opacity: 1, y: 0 }, { opacity: 0, y: -16, duration: 0.12 }, INFO)
    .to(core, { scale: 0.5, y: () => lift, duration: 0.3, ease: "power2.inOut" }, INFO + 0.05)
    .to(nodes, { opacity: 1, duration: 0.2, stagger: 0.08 }, INFO + 0.3)
    .to(draw, { v: 1, duration: 0.4, ease: "power2.out" }, INFO + 0.25)
    .to(hintF, { opacity: 1, duration: 0.2 }, INFO + 0.55)
    .to({}, { duration: 0.87 }, AT);
  // Pressing a branch pill opens an explanation window (.25s power2.out, 8px up), and it closes via the close button, outside click or Esc (.2s power2.in)
  let open = null;
  const close = () => { if (!open) return; const p = open; open = null; p.classList.remove("is-open"); gsap.to(p, { autoAlpha: 0, y: 8, duration: 0.2, ease: "power2.in" }); };
  nodes.forEach((n) => {
    const pill = $(".a-pill", n), pop = $(".a-popup", n);
    gsap.set(pop, { autoAlpha: 0, y: 8 });
    pill.addEventListener("click", () => { if (open === pop) return close(); close(); pop.classList.add("is-open"); gsap.to(pop, { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" }); open = pop; });
    $(".a-popup-head button", n).addEventListener("click", close);
  });
  document.addEventListener("click", (e) => { if (open && !nodes.some((n) => n.contains(e.target))) close(); });
  document.addEventListener("keydown", (e) => e.key === "Escape" && close());

  // Baseline lines — darken as they enter, while pinned the text rises and the lines form, then brighten again
  const sec = $(".s-security"), intro = $(".s-security-intro"), box = $(".s-security-flow"), rows = $$(".s-security-rows .a-row");
  const secTitle = A.split($("h2", sec), "words");
  if (reduce) gsap.set(rows, { opacity: 1, y: 0, filter: "none" });
  else {
    gsap.to(intro, { "--blackout": 1, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } });
    if (secTitle) gsap.to(secTitle.parts, A.rise({ stagger: 0.01, duration: 0.06, scrollTrigger: { trigger: sec, start: "top 85%", end: "top 35%", scrub: 0.35, invalidateOnRefresh: true } }));
    const each = 0.22, gap = 0.11, end = 0.1 + (rows.length - 1) * gap + each;
    gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", pin: intro, pinSpacing: false, scrub: 0.35, anticipatePin: 1, invalidateOnRefresh: true } })
      .to(box, { y: () => -Math.max(0, box.scrollHeight - innerHeight * 0.7), duration: end + 0.1, ease: "none" }, 0)
      .to(rows, { opacity: 1, y: 0, filter: "blur(0px)", duration: each, stagger: gap, ease: "power2.out" }, 0.1)
      .to(intro, { "--blackout": 0, duration: 0.3, ease: "power2.inOut" }, end);
  }

  A.story($(".s-story"));

  const at = $(".s-atelier");
  A.plain($(".s-atelier-copy"));
  A.robot($(".s-atelier-robot"), { below: 0.02, top: 0.02 });
  if (!reduce) gsap.to(".s-atelier-stage", { opacity: 0, filter: "blur(24px)", y: -24, ease: "power1.in", scrollTrigger: { trigger: at, start: "bottom bottom+=30%", end: "bottom bottom", scrub: 0.4, invalidateOnRefresh: true } });

  // Value graphic
  const pr = $(".s-pricing"), prTitle = A.split($("h2", pr), "chars");
  const step = (el, vars, start = "top 88%", end = "top 58%") => el && gsap.to(el, Object.assign({ scrollTrigger: { trigger: el.length ? el[0] : el, start, end, scrub: 0.4, invalidateOnRefresh: true } }, vars));
  if (!reduce) {
    if (prTitle) gsap.to(prTitle.parts, A.rise({ stagger: 0.03, duration: 0.12, scrollTrigger: { trigger: pr, start: "top 66%", end: "top 30%", scrub: 0.3, invalidateOnRefresh: true } }));
    step($(".s-pricing-lede"), { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
    $$(".s-pricing-label").forEach((l) => step(l, { opacity: 0.5, y: 0, duration: 0.4, ease: "power2.out" }));
    gsap.set(".s-buy-ring", { scale: 0.82, transformOrigin: "50% 50%" });
    step($(".s-buy-ring"), { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" });
    step($$(".s-buy-card"), { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "power2.out" }, "top 86%", "top 52%");
    gsap.set(".s-pricing-claim", { y: 18 });
    step($(".s-pricing-claim"), { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "top 90%", "top 62%");
    step($(".s-pricing-fine"), { opacity: 0.5, y: 0, duration: 0.4, ease: "power2.out" }, "top 95%", "top 75%");
    gsap.to(".s-pricing", { opacity: 0, filter: "blur(9px)", ease: "power1.in", scrollTrigger: { trigger: ".s-gap", start: "top 75%", end: "top 45%", scrub: 0.4, invalidateOnRefresh: true } });
  } else gsap.set([".s-pricing-lede", ".s-pricing-label", ".s-buy-ring", ".s-buy-card", ".s-pricing-claim", ".s-pricing-fine"], { opacity: 1, y: 0 });

  // Comparison row — the big title rises from the center and shrinks, and the rows settle (snap 0 and 1)
  const gapSec = $(".s-gap"), gapTitle = A.split($("h2", gapSec), "chars"), gapRows = $$(".s-gap-rows .a-row"), gapClose = $(".s-gap-close");
  if (gapTitle && !reduce) gsap.to(gapTitle.parts, A.rise({ stagger: 0.03, duration: 0.13, scrollTrigger: { trigger: gapSec, start: "top 85%", end: "top top", scrub: 0.3, invalidateOnRefresh: true } }));
  if (!reduce) {
    gsap.set(gapRows, { autoAlpha: 0, y: 34, filter: "blur(10px)" });
    gsap.set(gapClose, { autoAlpha: 0, y: 24 });
    gsap.timeline({ defaults: { ease: "power2.inOut" }, scrollTrigger: { trigger: gapSec, start: "top top", end: "bottom bottom", scrub: 0.4, invalidateOnRefresh: true, snap: A.snap([0, 1]) } })
      .fromTo($("h2", gapSec), { y: () => innerHeight * 0.3, scale: 1.4 }, { y: 0, scale: 1, duration: 0.3 }, 0)
      .to(gapRows, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.14, stagger: 0.055, ease: "power3.out" }, 0.3)
      .to(gapClose, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power3.out" }, 0.6);
  }

  A.footer();
  ScrollTrigger.refresh();
  addEventListener("load", () => ScrollTrigger.refresh());
})();
