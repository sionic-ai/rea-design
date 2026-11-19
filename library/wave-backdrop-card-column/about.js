// About page only: talent-profile band illustration. The original is an autoplay looping Lottie (29.97fps · 180 frames, 326×245) —
// Twelve 160×32 windows sit in a grid staggered by three columns, and in each window a loop of blue band + red→blue-violet gradient band + gap (288px per cycle) goes by
// Flows right at a steady 289px per 179.2 frames. Window spot, band width and speed were read from the Lottie layer.
(() => {
  const { gsap, reduce } = window.SDB;
  const svg = document.querySelector(".oc__deco svg");
  if (!svg) return;
  svg.setAttribute("viewBox", "0 0 326 245");
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    parent?.append(e);
    return e;
  };
  const defs = el("defs", {}, svg);
  const grad = el("linearGradient", { id: "oc-grad", x1: "0", x2: "1" }, defs);
  [[0.4, "--kf-accent"], [0.8, "--site-accent-2"], [1, "--site-accent-3"]].forEach(([o, v]) => el("stop", { offset: o, style: `stop-color: var(${v})` }, grad));
  const PERIOD = 288;
  const windows = [];
  [[328, [8, 72, 136, 200]], [51, [8, 72, 136, 200]], [202, [40, 104, 168, 232]]].forEach(([cx, ys]) => ys.forEach((cy) => windows.push([cx - 80, cy - 16])));
  const belts = windows.map(([x, y], i) => {
    const clip = el("clipPath", { id: `oc-w${i}` }, defs);
    el("rect", { x, y, width: 160, height: 32 }, clip);
    const g = el("g", { "clip-path": `url(#oc-w${i})` }, svg);
    const belt = el("g", {}, g);
    for (let k = -1; k <= 1; k++) {
      const o = x + k * PERIOD;
      el("rect", { x: o + 79.3, y: y - 1.5, width: 52.8, height: 35, style: "fill: var(--site-accent-3)" }, belt);
      el("rect", { x: o + 132.1, y: y - 1.5, width: 158.1, height: 35, fill: "url(#oc-grad)" }, belt);
    }
    return belt;
  });
  const F = (f) => f / 29.97;
  gsap.set(belts, { x: -133 });
  if (reduce) return;
  gsap.to(belts, { x: 156, duration: F(179.2), ease: "none", repeat: -1, repeatDelay: F(0.8) });
})();
