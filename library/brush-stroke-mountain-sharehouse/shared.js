// All pages: lifting the loading curtain, swapping the two-piece header (20px), phone menu, drawing the brush-stroke group
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Loading layer — the original uses jQuery ready to add #loading.loaded (transparent, height 0, .7s)
  const loader = document.querySelector(".su-loader");
  const done = () => loader && loader.classList.add("is-done");
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", done, { once: true });
  else done();

  // Two-part header — after scrolling past 20px the big logo plate lifts away and the fixed header band turns on in .5s ease-in-out. Subpages without a big logo plate keep only the header band always on
  const top = document.querySelector(".su-top"), bar = document.querySelector(".su-bar");
  const swap = () => {
    const past = scrollY > 20 || !top;
    top && top.classList.toggle("is-off", past);
    bar && bar.classList.toggle("is-on", past);
  };
  addEventListener("scroll", swap, { passive: true });
  swap();

  // Phone menu — a round button opens the drawer
  const burger = document.querySelector(".su-burger"), drawer = document.querySelector(".su-drawer");
  if (burger && drawer) {
    const set = (open) => {
      burger.setAttribute("aria-expanded", String(open));
      drawer.classList.toggle("is-open", open);
      drawer.toggleAttribute("inert", !open);
      root.style.overflow = open ? "hidden" : "";
    };
    set(false);
    burger.addEventListener("click", () => set(burger.getAttribute("aria-expanded") !== "true"));
    drawer.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  // Brush stroke clusters — the original is one brush drawing (svg) per cluster. Paint drops and dry brush marks are drawn in the same place and size, decided by a seed.
  // data-strokes="Seed" data-mix="ochre green rose sky"(Color used) data-n="Mark count" — The drawing panel uses the element’s css size (redrawn according to width)
  const NS = "http://www.w3.org/2000/svg";
  const defs = document.createElementNS(NS, "svg");
  defs.setAttribute("aria-hidden", "true");
  defs.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  defs.innerHTML = '<filter id="su-rough" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.045 0.09" numOctaves="2" seed="3" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>';
  document.body.prepend(defs);
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const blob = (r, cx, cy, rad) => {
    const n = 9, pts = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, k = rad * (0.82 + r() * 0.3); pts.push([cx + Math.cos(a) * k, cy + Math.sin(a) * k * (0.86 + r() * 0.2)]); }
    let d = "";
    pts.forEach((p, i) => { const q = pts[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; d += (i ? "" : `M${((pts[n - 1][0] + p[0]) / 2).toFixed(1)} ${((pts[n - 1][1] + p[1]) / 2).toFixed(1)}`) + `Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`; });
    return d + "Z";
  };
  // Dry brush — the body thickness wavers slightly and the end splits like teeth
  const stroke = (r, x, y, len, w, ang) => {
    const c = Math.cos(ang), s = Math.sin(ang), seg = 10, L = [], R = [];
    for (let i = 0; i <= seg; i++) {
      const t = i / seg, taper = i === 0 || i === seg ? 0.55 : 1, hw = (w / 2) * taper * (0.85 + r() * 0.3), px = x + c * len * t, py = y + s * len * t;
      L.push([px - s * hw, py + c * hw]); R.push([px + s * hw, py - c * hw]);
    }
    const tip = (from, to, dir) => { const out = []; for (let k = 1; k < 4; k++) { const t = k / 4, bx = from[0] + (to[0] - from[0]) * t, by = from[1] + (to[1] - from[1]) * t, j = (k % 2 ? 1 : 0.35) * w * 0.5 * (0.6 + r() * 0.6); out.push([bx + c * j * dir, by + s * j * dir]); } return out; };
    const poly = [...L, ...tip(L[seg], R[seg], 1), ...R.reverse(), ...tip(R[R.length - 1], L[0], -1)];
    return "M" + poly.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z";
  };
  const draw = (el) => {
    const W = Math.round(el.clientWidth), H = Math.round(el.clientHeight);
    if (!W || !H || el.dataset.drawn === W + "x" + H) return;
    el.dataset.drawn = W + "x" + H;
    el.querySelector("svg")?.remove();
    const r = rng(+el.dataset.strokes || 1), mix = (el.dataset.mix || "ochre green rose sky").split(/\s+/), n = +(el.dataset.n || 10);
    const k = Math.min(1, Math.max(0.55, W / 600));
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("aria-hidden", "true");
    const g = document.createElementNS(NS, "g");
    g.setAttribute("filter", "url(#su-rough)");
    for (let i = 0; i < n; i++) {
      const p = document.createElementNS(NS, "path"), color = mix[i % mix.length], x = 40 + r() * (W - 80), y = 40 + r() * (H - 80);
      if (r() < 0.45) p.setAttribute("d", blob(r, x, y, (26 + r() * 22) * k));
      else {
        const len = (120 + r() * 220) * k, ang = (r() - 0.5) * Math.PI * 1.4;
        p.setAttribute("d", stroke(r, x - Math.cos(ang) * len / 2, y - Math.sin(ang) * len / 2, len, (28 + r() * 22) * k, ang));
      }
      p.setAttribute("class", color);
      g.append(p);
    }
    svg.append(g);
    el.append(svg);
  };
  const paint = () => {
    const all = document.querySelectorAll("[data-strokes]");
    all.forEach(draw);
    const ro = new ResizeObserver((es) => es.forEach((e) => draw(e.target)));
    all.forEach((el) => ro.observe(el));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint, { once: true });
  else paint();
  if (reduce) root.classList.add("su-reduce");
})();
