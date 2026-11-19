// Home: redraws isometric illustrations, speech bubbles and floor plan as SVG, and sets the loader (chunks fly in 3s → title stroke) and construction-progress bubble positions.
// Blob stage, pinned illustration and photo stack are handled by the parts (blob-stage-switch · pin-corner-zoom · pin-recede-stack).
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rng = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent?.append(n);
    return n;
  };

  // Isometric projection: x toward lower right, y toward lower left, z up
  const iso = (ox, oy, k) => (x, y, z = 0) => [ox + (x - y) * 0.866 * k, oy + (x + y) * 0.5 * k - z * k];
  const pts = (P, list) => list.map((p) => P(...p).map((v) => v.toFixed(1)).join(",")).join(" ");
  const box = (g, P, x, y, z, w, d, h, cls = "fw", side = cls) => {
    el("polygon", { class: side, points: pts(P, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]) }, g);
    el("polygon", { class: side, points: pts(P, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]) }, g);
    el("polygon", { class: cls, points: pts(P, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]) }, g);
  };
  const person = (g, P, x, y, r, k) => {
    const [px, py] = P(x, y, 0), u = k / 46;
    const p = el("g", { class: r() < 0.6 ? "bob" : "" }, g);
    el("path", { class: "ln", d: `M${px - 4 * u} ${py}l${-1 * u} ${-14 * u}M${px + 4 * u} ${py}l${1 * u} ${-14 * u}` }, p);
    el("rect", { class: r() < 0.5 ? "fp" : "ft", x: px - 8 * u, y: py - 36 * u, width: 16 * u, height: 24 * u, rx: 7 * u }, p);
    el("circle", { class: "fw", cx: px, cy: py - 44 * u, r: 7.5 * u }, p);
    el("path", { class: "fi", d: `M${px - 7.5 * u} ${py - 45 * u}a7.5 7.5 0 0 1 15 0z` }, p);
  };
  const plant = (g, P, x, y, k) => {
    box(g, P, x, y, 0, 0.5, 0.5, 0.5, "fw");
    const [px, py] = P(x + 0.25, y + 0.25, 0.5), u = k / 46;
    [[-10, -14, 11], [9, -18, 12], [0, -28, 13], [-4, -40, 10], [7, -34, 9]].forEach(([dx, dy, rr]) => el("circle", { class: "fg", cx: px + dx * u, cy: py + dy * u, r: rr * u }, g));
  };

  // Each scene seeds its floor size, furniture and people count — off is quiet, on is crowded, all is a whole floor
  const SCENES = {
    off: { seed: 5, w: 13, d: 11, people: 16, tables: 7, plants: 9, k: 62, ox: 696, oy: 250 },
    on: { seed: 9, w: 13, d: 11, people: 36, tables: 9, plants: 8, k: 62, ox: 696, oy: 250 },
    all: { seed: 13, w: 22, d: 16, people: 70, tables: 18, plants: 16, k: 37, ox: 680, oy: 210 },
  };
  const drawScene = (svg, name) => {
    const S = SCENES[name];
    if (!S) return;
    const r = rng(S.seed), P = iso(S.ox, S.oy, S.k), g = el("g", {}, svg);
    el("polygon", { class: "ft", points: pts(P, [[0, 0, 0], [S.w, 0, 0], [S.w, S.d, 0], [0, S.d, 0]]) }, g);
    for (let i = 1; i < S.w; i += 2) el("polyline", { class: "ln", points: pts(P, [[i, 0, 0], [i, S.d, 0]]), opacity: 0.25 }, g);
    for (let j = 1; j < S.d; j += 2) el("polyline", { class: "ln", points: pts(P, [[0, j, 0], [S.w, j, 0]]), opacity: 0.25 }, g);
    // Two back walls + a large whiteboard
    el("polygon", { class: "fw", points: pts(P, [[0, 0, 0], [0, S.d, 0], [0, S.d, 3.2], [0, 0, 3.2]]) }, g);
    el("polygon", { class: "fw", points: pts(P, [[0, 0, 0], [S.w, 0, 0], [S.w, 0, 3.2], [0, 0, 3.2]]) }, g);
    el("polygon", { class: "ft", points: pts(P, [[1.5, 0, 0.9], [5.5, 0, 0.9], [5.5, 0, 2.6], [1.5, 0, 2.6]]) }, g);
    for (let i = 0; i < 4; i++) el("polyline", { class: "ln", points: pts(P, [[2, 0, 2.2 - i * 0.3], [2 + r() * 3, 0, 2.2 - i * 0.3]]) }, g);
    const things = [];
    for (let i = 0; i < S.tables; i++) {
      const x = 1.5 + r() * (S.w - 4), y = 1.5 + r() * (S.d - 4), long = r() < 0.5;
      things.push({ d: x + y, f: () => { box(g, P, x, y, 0, long ? 2.6 : 1.2, long ? 1 : 1.2, 0.75, r() < 0.35 ? "fp" : "fw", "fw"); } });
    }
    for (let i = 0; i < S.plants; i++) {
      const x = 0.4 + r() * (S.w - 1), y = 0.4 + r() * (S.d - 1);
      things.push({ d: x + y, f: () => plant(g, P, x, y, S.k) });
    }
    for (let i = 0; i < S.people; i++) {
      const x = 0.8 + r() * (S.w - 1.6), y = 0.8 + r() * (S.d - 1.6);
      things.push({ d: x + y + 0.5, f: () => person(g, P, x, y, r, S.k) });
    }
    if (name === "on") things.push({ d: S.w + 2, f: () => { for (let s = 0; s < 3; s++) box(g, P, S.w - 4, S.d - 3 + s * 0.8, 0, 3.5, 0.8, 0.9 - s * 0.3, "ft", "fw"); } });
    things.sort((a, b) => a.d - b.d).forEach((t) => t.f());
  };
  // Speech bubble layer — bubbles with lines of dialogue above a few people’s heads
  const drawTalk = (svg, name) => {
    const r = rng(SCENES[name].seed + 100);
    for (let i = 0; i < (name === "on" ? 7 : 4); i++) {
      const x = 180 + r() * 1080, y = 120 + r() * 560, w = 120 + r() * 70, h = 64;
      const g = el("g", {}, svg);
      el("path", { class: "bubble", d: `M${x + 12} ${y}h${w - 24}a12 12 0 0 1 12 12v${h - 24}a12 12 0 0 1-12 12h${-(w / 2 - 22)}l-10 16-6-16h${-(w / 2 - 28)}a12 12 0 0 1-12-12v${-(h - 24)}a12 12 0 0 1 12-12z` }, g);
      el("path", { class: "dash", d: `M${x + 22} ${y + 24}h${w - 60}M${x + 22} ${y + 42}h${w - 84}` }, g);
    }
  };
  document.querySelectorAll("svg[data-iso]").forEach((svg) => drawScene(svg, svg.dataset.iso));
  document.querySelectorAll("svg[data-iso-talk]").forEach((svg) => drawTalk(svg, svg.dataset.isoTalk));

  // Layout plan — road·building outlines are drawn 1s each at .12s intervals, and a new building is painted where the old one vanished
  const map = document.querySelector(".kg-map");
  if (map) {
    const P = iso(820, 60, 34), draws = [];
    // the browser ignores pathLength on polyline, so draw it with path
    const dOf = (list, close) => "M" + pts(P, list).replace(/ /g, "L") + (close ? "Z" : "");
    const line = (list, cls = "ln draw", close = false) => { const n = el("path", { class: cls, d: dOf(list, close), pathLength: 1 }, map); draws.push(n); return n; };
    line([[-4, 2], [26, 2], [26, 20]]);
    line([[2, -4], [2, 22]]);
    line([[-4, 10], [28, 10]]);
    line([[13, -4], [13, 22]]);
    const r = rng(31);
    for (let i = 0; i < 20; i++) {
      const x = 3 + (i % 5) * 4.6 + r() * 0.6, y = 3 + Math.floor(i / 5) * 4.4 + r() * 0.6, w = 1.8 + r() * 2, d = 1.4 + r() * 1.8, h = 0.6 + r() * 2.2;
      if (x > 9 && x < 16 && y > 3 && y < 9.5) continue;
      line([[x, y + d, 0], [x + w, y + d, 0], [x + w, y, 0], [x + w, y, h], [x, y, h], [x, y + d, h], [x, y + d, 0]]);
      line([[x + w, y + d, 0], [x + w, y + d, h], [x, y + d, h]]);
      line([[x + w, y + d, h], [x + w, y, h]]);
    }
    el("polygon", { class: "old", points: pts(P, [[11, 5, 0], [15, 5, 0], [15, 8.4, 0], [11, 8.4, 0]]) }, map);
    line([[11, 5, 0], [15, 5, 0], [15, 8.4, 0], [11, 8.4, 0]], "new draw", true);
    draws.forEach((n, i) => {
      n.style.transition = `stroke-dashoffset 1s cubic-bezier(0.47, 0, 0.745, 0.715) ${0.5 + Math.min(i, 4) * 0.12}s, fill 0.7s cubic-bezier(0.47, 0, 0.745, 0.715) ${1.3 + Math.min(i, 4) * 0.1}s`;
    });
  }

  // Construction progress bubble — today’s position between start and completion dates (ends when passed)
  const pic = document.querySelector(".kg-indicator__pic");
  if (pic) {
    const s = new Date(pic.dataset.start), e = new Date(pic.dataset.end), now = new Date();
    const p = now < s ? 0 : now > e ? 1 : (now - s) / (e - s);
    pic.style.left = `${p * 100}%`;
    document.querySelector(".kg-indicator")?.style.setProperty("--kg-progress", p);
  }

  // Loader — once the fonts (instead of images) are all loaded, chunks fly in (3s power1.inOut, 0 · .5 · 1 · 1.5s), and 1s later the loading text clears over 3s.
  // Once everything has settled (4.5s), remove the loader and draw the title line
  const stage = document.querySelector(".kg-bg");
  const title = document.querySelector(".kg-mv-title");
  const finish = () => {
    title?.classList.add("is-visible");
    title?.dispatchEvent(new CustomEvent("fx:show"));
    document.body.classList.remove("is-loading");
    document.querySelector(".kg-loading")?.remove();
    ScrollTrigger.refresh();
  };
  const start = () => {
    gsap.set(".kg-bg__main", { opacity: 1 });
    if (reduce || !stage) { finish(); return; }
    stage.addEventListener("fx:entered", finish, { once: true });
    stage.dispatchEvent(new CustomEvent("fx:enter"));
    gsap.to(".kg-loading__wrap", { opacity: 0, duration: 3, ease: "power1.inOut", delay: 1 });
  };
  addEventListener("DOMContentLoaded", () => Promise.race([document.fonts.ready, new Promise((ok) => setTimeout(ok, 3000))]).then(() => requestAnimationFrame(start)));
})();
