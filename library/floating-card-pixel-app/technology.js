// Method — a 43×24 pixel graph. Progress value q decides each cell’s state (empty · white · gray · accent):
// A 0~1 curve is drawn in white cells from the left, six 1~2 dots light up in the accent color, then the curve cools to gray, and when three drop out (2.1~) the curve is redrawn from the remaining dots (2.5~).
// Header slides in .5s after the loader, 2.2s (power1.inOut) up to 1.59, and the white section runs 0 to 3.5 as the step text passes the screen center.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COLS = 43, ROWS = 24, END = 7;
  const f = (x) => 6 + 5 * x - 0.8 * x * x;
  const col = (x) => Math.round((x / END) * (COLS - 1));
  const row = (y) => ROWS - 1 - Math.round(2 + y * 1.25);
  const LOST = new Set([1, 3, 5]);
  const STATE = ["", "w", "g", "a"];

  const model = () => {
    const cells = Array.from({ length: COLS * ROWS }, (_, i) => ({ along: -1, point: -1, r: Math.abs(Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1 }));
    const at = (x, y) => (x >= 0 && x < COLS && y >= 0 && y < ROWS ? cells[y * COLS + x] : null);
    let prev = row(f(0));
    for (let x = col(0); x < COLS; x++) {
      const v = (x / (COLS - 1)) * END, y = row(f(v));
      for (let yy = Math.min(y, prev); yy <= Math.max(y, prev); yy++) { const c = at(x, yy); if (c && c.along < 0) c.along = v / END; }
      prev = y;
    }
    for (let p = 1; p <= 6; p++) { const cx = col(p), cy = row(f(p)); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const c = at(cx + dx, cy + dy); if (c) c.point = p; } }
    return cells;
  };
  const pointOn = (c, q) => (q < 1.2 + (c.point - 1) * 0.06 + c.r * 0.15 ? false : !(LOST.has(c.point) && q >= 2.1 + ((c.point - 1) / 2) * 0.08 + c.r * 0.12));
  const state = (c, q, hero) => {
    if (hero && q < 1.6) return (c.point < 0 && c.along < 0) || q < 0.5 + c.r ? 0 : c.point >= 0 ? 3 : 1;
    if (c.point >= 0 && pointOn(c, q)) return 3;
    if (c.along < 0) return 0;
    if (q >= 2.5 + (1 - c.along) * 0.45) return 1;
    if (q >= 2.2 + c.r * 0.3) return 0;
    if (q >= 1.6 + c.r * 0.2) return 2;
    return q >= 0.5 + c.along * 0.5 ? 1 : 0;
  };
  const plot = (host, hero) => {
    host.innerHTML = "<i></i>".repeat(COLS * ROWS);
    const tiles = [...host.children], cells = model(), now = new Uint8Array(tiles.length);
    return (q) => { for (let i = 0; i < tiles.length; i++) { const s = state(cells[i], q, hero); if (s !== now[i]) { now[i] = s; if (s) tiles[i].dataset.c = STATE[s]; else delete tiles[i].dataset.c; } } };
  };

  const heroHost = document.querySelector('[data-plot="hero"]');
  if (heroHost) {
    const draw = plot(heroHost, true), END_Q = 1.59;
    if (reduce) draw(END_Q);
    else {
      draw(0);
      const o = { q: 0 };
      addEventListener("kf:hero-reveal", () => gsap.to(o, { q: END_Q, duration: 2.2, delay: 0.5, ease: "power1.inOut", onUpdate: () => draw(o.q) }), { once: true });
    }
  }

  // White section: progress is computed from where the center of each step text passes the screen center. On phones, the section’s fixed length is divided by the number of steps and the text swaps one at a time
  const road = document.querySelector("[data-split]");
  if (road) {
    const stage = road.querySelector("[data-split-stage]"), steps = [...road.querySelectorAll("[data-split-step]")];
    const draw = plot(road.querySelector('[data-plot="split"]'), false);
    const stacked = matchMedia("(max-width: 1024px)");
    const wide = () => {
      const mid = innerHeight / 2, c = steps.map((s) => { const b = s.getBoundingClientRect(); return b.top + b.height / 2; });
      const gap = c.length > 1 ? c[1] - c[0] : innerHeight, marks = [c[0] - gap, ...c];
      if (mid <= marks[0]) return 0;
      for (let i = 0; i < marks.length - 1; i++) if (mid < marks[i + 1]) return i + (mid - marks[i]) / (marks[i + 1] - marks[i]);
      return marks.length - 1;
    };
    const narrow = () => {
      const unit = (road.offsetHeight - stage.offsetHeight) / (0.5 + steps.length - 1 + 0.5), r = -road.getBoundingClientRect().top / unit;
      return Math.min(steps.length + 0.5, Math.max(0, r < 0 ? 1 + r : 1 + Math.max(0, r - 0.5)));
    };
    let dirty = false;
    const copy = (p) => {
      if (!stacked.matches) { if (dirty) { steps.forEach((s) => { s.style.opacity = s.style.visibility = s.style.transform = ""; }); dirty = false; } return; }
      steps.forEach((s, i) => {
        const d = i === steps.length - 1 ? Math.min(0, p - (i + 1)) : p - (i + 1), o = Math.min(1, Math.max(0, 1 - (Math.abs(d) - 0.25) / 0.2));
        s.style.opacity = String(o); s.style.visibility = o ? "" : "hidden"; s.style.transform = o < 1 ? `translateY(${-Math.sign(d) * (1 - o) * 16}px)` : "";
      });
      dirty = true;
    };
    const update = () => { const p = stacked.matches ? narrow() : wide(); draw(reduce ? 3.5 : p); copy(p); };
    ScrollTrigger.create({ trigger: road, start: "top bottom", end: "bottom top", onUpdate: update, onRefresh: update });
    update();
  }
})();
