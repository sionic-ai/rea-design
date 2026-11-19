// Home page: loading (12 pieces around a Lottie) → background video at 3.5s, pinned Hero and shape-mosaic Lottie, section header opening, five photos overlapping with number roll, parallax.
// Values from the original components (loading·opening·firstView·serialsHead·serials·mask·scrollSticky·parallax·bgShapes) are carried over as they are.
(() => {
  const { lenis, reduce } = window.arSite;
  const LT = window.arLottie;
  const body = document.body;
  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, t) => (1 - t) * a + t * b;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Seed random — so mosaic cell shapes don’t change every time it opens
  let seed = 7;
  const rand = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  // ───────── Loading ring — 840 cells, 12 ring pieces start at -72° and rise clockwise, each 5 frames later, over 26 frames ─────────
  function openingData() {
    const beige = LT.rgb("--kf-ink-soft");
    const C = 420, R0 = 262, R1 = 420, GAP = 1.2;
    const bounds = [];
    for (let q = 0; q < 4; q++) bounds.push(q * 90, q * 90 + 31.5, q * 90 + 58.5);
    bounds.push(360);
    const segs = bounds.slice(0, 12).map((a, i) => [a + GAP / 2, bounds[i + 1] - GAP / 2]);
    const order = [...segs.slice(9), ...segs.slice(0, 9)].map(([a, b]) => [a - 90, b - 90]);
    const pt = (r, deg) => [C + r * Math.cos(deg * Math.PI / 180), C + r * Math.sin(deg * Math.PI / 180)];
    const tan = (r, deg, s) => [-Math.sin(deg * Math.PI / 180) * r * s, Math.cos(deg * Math.PI / 180) * r * s];
    const layers = order.map(([a, b], n) => {
      const k = (4 / 3) * Math.tan(((b - a) * Math.PI / 180) / 4);
      const v = [pt(R1, a), pt(R1, b), pt(R0, b), pt(R0, a)];
      const o = [tan(R1, a, k), [0, 0], tan(R0, b, -k), [0, 0]];
      const i = [[0, 0], tan(R1, b, -k), [0, 0], tan(R0, a, k)];
      return LT.layer(n + 1, [LT.group([LT.path(v, i, o), LT.fill(beige, LT.kf(n * 5, 0, n * 5 + 26, 100, [0.52, 0], [0.74, 0]))])], { ip: n * 5 });
    });
    return LT.anim(840, 840, 91, layers);
  }

  // ───────── Shape mosaic — 1440 cells into 180 cells at 8×8. Each cell’s border is drawn from the center to both sides (26 frames starting at frames 0 · 5 · 10 · 15) and
  // After 10 frames the brown shape fills in over 16 frames, and less covered cells fill completely with 6 linear frames at 29 · 34 (frame 42) ─────────
  const CELL = 180, N = 8;
  const grid = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const r = rand();
    const kind = r < 0.5 ? "square" : r < 0.8 ? "quarter" : "half";
    const w = rand();
    const lag = w < 0.38 ? 0 : w < 0.54 ? 5 : w < 0.9 ? 10 : 15;
    grid.push({ x: x * CELL + CELL / 2, y: y * CELL + CELL / 2, kind, rot: Math.floor(rand() * 4), lag, late: rand() < 0.3 ? 34 : 29 });
  }
  function shapesData() {
    const fill = LT.rgb("--kf-bg"), line = LT.rgb("--site-shape-line");
    const IO = [0.9, 0], II = [0.1, 1];
    const layers = [];
    let ind = 1;
    grid.forEach((c) => layers.push(LT.layer(ind++, [LT.group([
      LT.cell(c.kind, CELL, c.rot), LT.stroke(line, 1), LT.trim(LT.kf(0, 50, 26, 0, IO, II), LT.kf(0, 50, 26, 100, IO, II)),
    ])], { p: [c.x, c.y], ip: c.lag })));
    grid.forEach((c) => layers.push(LT.layer(ind++, [LT.group([LT.cell(c.kind, CELL, c.rot), LT.fill(fill)])],
      { p: [c.x, c.y], o: LT.kf(c.lag + 10, 0, c.lag + 26, 100, IO, II) })));
    grid.filter((c) => c.kind !== "square").forEach((c) => layers.push(LT.layer(ind++, [LT.group([LT.cell("square", CELL), LT.fill(fill)])],
      { p: [c.x, c.y], o: LT.kf(c.late, 0, c.late + 6, 100, [0.167, 0.167], [0.833, 0.833]) })));
    return LT.anim(1440, 1440, 42, layers);
  }

  // Original bg_shapes spot — the border pattern left after the mosaic is fully covered, as a fixed image
  const bg = document.querySelector("[data-bg-shapes]");
  if (bg) {
    const d = grid.map((c) => {
      const h = CELL / 2;
      const rot = ([x, y]) => { for (let n = 0; n < c.rot; n++) [x, y] = [-y, x]; return [x + c.x, y + c.y]; };
      if (c.kind === "square") return `M${c.x - h} ${c.y - h}h${CELL}v${CELL}h${-CELL}Z`;
      if (c.kind === "quarter") { const [a, b, e] = [[-h, -h], [h, -h], [-h, h]].map(rot); return `M${a}L${b}A${CELL} ${CELL} 0 0 1 ${e}Z`; }
      const [a, b] = [[-h, -h], [h, -h]].map(rot);
      return `M${a}L${b}A${h} ${h} 0 0 1 ${a}Z`;
    }).join("");
    bg.innerHTML = `<svg viewBox="0 0 1440 1440" preserveAspectRatio="xMidYMin slice"><rect width="1440" height="1440" fill="var(--kf-bg)"/><path d="${d}" fill="none" stroke="var(--site-shape-line)" stroke-width="1"/></svg>`;
  }

  const shapesEl = document.querySelector("[data-shapes]");
  const shapes = shapesEl && window.lottie ? lottie.loadAnimation({
    container: shapesEl, renderer: "svg", loop: false, autoplay: false,
    animationData: shapesData(), rendererSettings: { preserveAspectRatio: "xMidYMin slice" },
  }) : null;
  const openEl = document.querySelector("[data-opening]");
  const opening = openEl && window.lottie ? lottie.loadAnimation({
    container: openEl, renderer: "svg", loop: false, autoplay: false,
    animationData: openingData(), rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
  }) : null;

  // ───────── Loading sequence — original loading component ─────────
  const loader = document.querySelector(".ar-loading");
  const video = document.querySelector('[data-video="fv"]');
  async function open() {
    if (!loader) return;
    if (reduce) { loader.remove(); video?.classList.add("is-playing"); return; }
    lenis?.stop();
    loader.classList.add("is-done");
    scrollTo(0, 0);
    body.classList.add("is-opening-animating");
    opening?.play();
    await wait(3500);
    video?.classList.add("is-playing");
    await wait(100);
    body.classList.add("is-opening-finished");
    lenis?.start();
    await wait(2000);
    loader.remove();
    body.classList.remove("is-opening-animating");
  }
  open();

  // ───────── Hero — after 10% scrolled is-action turns on, mosaic frames from 50 to 100% ─────────
  const fv = document.querySelector(".ar-fv");
  const fvParts = ["mask", "logo", "text"].map((k) => document.querySelector(`[data-fv="${k}"]`));
  const frame = (p) => {
    if (!shapes) return;
    const t = (clamp(p, 0.5, 1) - 0.5) / 0.5;
    shapes.goToAndStop(lerp(shapes.firstFrame, shapes.totalFrames, t), true);
  };
  if (fv) {
    frame(0);
    ScrollTrigger.create({
      trigger: fv, start: "top top", end: "bottom bottom+=10%", invalidateOnRefresh: true,
      onUpdate: (st) => {
        fvParts.forEach((el) => el?.classList.toggle("is-action", st.progress > 0.1));
        frame(st.progress);
      },
    });
  }
  const first = document.querySelector(".ar-serial");
  if (bg && first) {
    ScrollTrigger.create({ trigger: first, start: "top+=100 top", onEnter: () => bg.classList.add("is-on"), onLeaveBack: () => bg.classList.remove("is-on") });
  }

  // ───────── Section heading · body ─────────
  document.querySelectorAll(".ar-serial").forEach((sec) => {
    const head = sec.querySelector("[data-serial-head]");
    const clip = sec.querySelector(".ar-serial__clip");
    const text = sec.querySelector("[data-head-text]");
    const veil = sec.querySelector("[data-head-veil]");
    const content = sec.querySelector("[data-serial-body]");
    const headProgress = (p) => {
      const s = clamp(p, 0, 0.7) / 0.7;
      clip.style.setProperty("--progress", String(s));
      return s;
    };
    headProgress(0);
    ScrollTrigger.create({
      trigger: head, start: "top top", end: "bottom bottom", invalidateOnRefresh: true,
      onUpdate: (st) => text.classList.toggle("is-action", headProgress(st.progress) > 0.3),
    });
    gsap.set(veil, { opacity: 0 });
    ScrollTrigger.create({
      trigger: content, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true,
      onUpdate: (st) => {
        sec.style.setProperty("--cv", String(st.progress));
        veil.style.opacity = String(clamp(st.progress));
      },
    });
  });

  // ───────── Five-photo overlap — progress × (count − .5), after 3/4 the number moves to the next ─────────
  document.querySelectorAll("[data-stack]").forEach((box) => {
    const total = +box.dataset.stack;
    const items = box.querySelectorAll("[data-stack-item]");
    const rolls = box.querySelectorAll("[data-roll]");
    let progress = 0;
    const paint = () => {
      const current = clamp(Math.floor(progress), 0, total - 0.5);
      const next = clamp(current + (progress - current > 3 / 4 ? 1 : 0), 0, total - 1);
      rolls.forEach((r) => { r.style.translate = `0 -${next}em`; });
      items.forEach((it, i) => {
        it.style.setProperty("--next-item-progress", String(clamp(progress - i)));
        it.style.setProperty("--progress", String(clamp(progress - (i - 1))));
      });
    };
    paint();
    ScrollTrigger.create({
      trigger: box, start: "top top", end: "bottom bottom", invalidateOnRefresh: true,
      onUpdate: (st) => { progress = st.progress * (total - 0.5); paint(); },
    });
  });

  // ───────── Parallax — cell position ratio × 100 × strength (half on portrait screens) ─────────
  const boxes = [...document.querySelectorAll("[data-parallax-box]")].map((box) => ({ box, inView: false, parts: box.querySelectorAll("[data-parallax]") }));
  const coef = innerHeight > innerWidth ? 0.5 : 1;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const b = boxes.find((x) => x.box === e.target);
    if (b) b.inView = e.isIntersecting;
  }), { rootMargin: "20%" });
  boxes.forEach((b) => io.observe(b.box));
  const parallax = () => boxes.forEach((b) => {
    if (!b.inView || reduce) return;
    const r = b.box.getBoundingClientRect();
    const i = Math.min((r.top / r.height) * -1, 1.2);
    b.parts.forEach((p) => p.style.setProperty("--parallax-y", `${i * 100 * +p.dataset.parallax * coef}%`));
  });
  if (lenis) lenis.on("scroll", parallax); else addEventListener("scroll", parallax, { passive: true });
  parallax();
})();
