// Spans several sections — hand drawing, header, menu drawer, footer, page turn, Lenis, scroll reveal. Each section’s index.js and about.js attach to window.yt.
(() => {
  const html = document.documentElement;
  const mobile = () => innerWidth < 1080;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);

  /* ── Icons · marks · masks ── */
  const ICON = {
    arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h8M8.6 4.6 12 8l-3.4 3.4"/></svg>',
    ext: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4.5h5.5V10M11.2 4.8 4.5 11.5"/></svg>',
    menu: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M5 2.2c3.2-1.6 6.8-1.6 10 0 1.6.8 1.4 2.9-.3 3.3-3.1-.8-6.3-.8-9.4 0C3.6 5.1 3.4 3 5 2.2Z"/><path d="M4.6 8.3c3.6-1 7.2-1 10.8 0 1.5.5 1.5 2.9 0 3.4-3.6 1-7.2 1-10.8 0-1.5-.5-1.5-2.9 0-3.4Z"/><path d="M5.3 14.5c3.1.8 6.3.8 9.4 0 1.7.4 1.9 2.5.3 3.3-3.2 1.6-6.8 1.6-10 0-1.6-.8-1.4-2.9.3-3.3Z"/></svg>',
    close: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 5l10 10M15 5 5 15"/></svg>',
    bean: '<svg viewBox="0 0 42 16"><path d="M3 4c5 3 11 4.5 18 4.5S34 7 39 4c3-1.5 4 2.5 1.5 6C36 15 28 16 21 16S6 15 1.5 10C-1 6.5 0 2.5 3 4Z"/></svg>',
  };
  // Our mark — two beans, an upper one (lower side concave) and a lower one (upper side concave). Not the original logo but a new shape with a similar feel
  const MARK_TOP = "M9 25C3 19 6 7 17 4 29 1 41 5 50 5S71 1 83 4C94 7 97 19 91 25 85 31 74 29 64 27 56 26 44 26 36 27 26 29 15 31 9 25Z";
  const MARK_BOT = "M4 10C9 3 20 3 32 7 41 10 59 10 68 7 80 3 91 3 96 10 101 19 92 32 72 35 58 37 42 37 28 35 8 32-1 19 4 10Z";
  const DOT = "M50 18a.6.6 0 1 1 0 .01Z";
  const CIRCLE = "M50 4a14 14 0 1 1 0 28a14 14 0 1 1 0-28Z";
  const mark = (cls = "") => `<span class="yt-mark ${cls}"><svg viewBox="0 0 100 78"><path class="yt-mark__top" d="${MARK_TOP}"/><path class="yt-mark__bot" transform="translate(0 40)" d="${MARK_BOT}"/></svg></span>`;
  const logo = (tag = "a", cls = "") => `<${tag} class="yt-logo ${cls}" ${tag === "a" ? 'href="index.html" aria-label="First Page"' : ""}>${mark()}<span class="yt-logo__text"><small>Your company type here</small><b>Logo Name</b><i>LOGO NAME</i></span></${tag}>`;
  const CLIPS = {
    1: "M.1.12C.22.03.42.07.6.03.8 0 .97.07.98.3 1 .5.95.7.97.86.99 1 .8 1 .62.97.42.94.22 1 .08.95-.02.9.02.7.02.5.02.32-.02.2.1.12Z",
    2: "M.15.04C.35-.01.65.02.85.05.98.08 1 .25.99.45.98.65 1 .85.9.95.75 1.01.45.97.22.98.05.99.01.85.02.6.03.4-.01.1.15.04Z",
    3: "M.12.1C.25-.02.4.1.5.08.62.05.78-.03.9.1 1 .22.97.4.96.5.95.62 1.01.82.9.92.78 1.02.62.92.5.93.38.94.2 1.02.1.9-.01.78.05.6.04.5.03.38 0 .22.12.1Z",
    4: "M.5.01C.82 0 .99.12 1 .46 1 .82.86 1 .52.99.18 1 0 .86.01.5 0 .17.16.02.5.01Z",
    5: "M.28.05C.38.05.45.1.5.14.55.1.62.05.72.05.9.05 1 .25 1 .5 1 .75.9.95.72.95.62.95.55.9.5.86.45.9.38.95.28.95.1.95 0 .75 0 .5 0 .25.1.05.28.05Z",
    frame: "M.06.02C.2.07.35.03.5.06.65.03.8.07.94.02 1 .2.96.35.98.5.96.65 1 .8.94.98.8.93.65.97.5.94.35.97.2.93.06.98 0 .8.04.65.02.5.04.35 0 .2.06.02Z",
    cloud: "M.2.08C.32.02.42.1.5.1.6.1.72 0 .84.08.98.18.98.36.92.5.98.64.98.84.84.93.72 1 .6.9.5.9.4.9.3 1 .17.93.02.84.02.64.08.5.02.36.04.16.2.08Z",
  };
  const SYMS = `<symbol id="yt-sym-menu" viewBox="0 0 20 20"><path fill="currentColor" d="M5 2.2c3.2-1.6 6.8-1.6 10 0 1.6.8 1.4 2.9-.3 3.3-3.1-.8-6.3-.8-9.4 0C3.6 5.1 3.4 3 5 2.2Z"/><path fill="currentColor" d="M4.6 8.3c3.6-1 7.2-1 10.8 0 1.5.5 1.5 2.9 0 3.4-3.6 1-7.2 1-10.8 0-1.5-.5-1.5-2.9 0-3.4Z"/><path fill="currentColor" d="M5.3 14.5c3.1.8 6.3.8 9.4 0 1.7.4 1.9 2.5.3 3.3-3.2 1.6-6.8 1.6-10 0-1.6-.8-1.4-2.9.3-3.3Z"/></symbol><symbol id="yt-sym-close" viewBox="0 0 20 20"><path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" d="M5 5l10 10M15 5 5 15"/></symbol>`;
  const defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${SYMS}${Object.entries(CLIPS).map(([k, d]) => `<clipPath id="yt-clip-${k}" clipPathUnits="objectBoundingBox"><path d="${d}"/></clipPath>`).join("")}</defs></svg>`;

  /* ── Hand drawing — one body (hip at the origin) is posed by limb angles. Angle 0 is down, 90 is right, 180 is up ── */
  const dir = (a) => [Math.sin((a * Math.PI) / 180), Math.cos((a * Math.PI) / 180)];
  const limb = (x, y, [a1, a2], len, w, cls, end) => {
    const [dx1, dy1] = dir(a1), [dx2, dy2] = dir(a2 ?? a1);
    const mx = x + dx1 * len, my = y + dy1 * len, ex = mx + dx2 * len, ey = my + dy2 * len;
    const d = `M${x} ${y}L${mx.toFixed(1)} ${my.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`;
    const line = cls === "k" ? `<path class="o" stroke-width="${w + 2.4}" d="${d}"/>` : `<path class="o" stroke-width="${w + 2.4}" d="${d}"/><path class="l${cls}" stroke-width="${w}" d="${d}"/>`;
    return line + (end === "hand" ? `<circle class="w" cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="2.5"/>` : end === "shoe" ? `<ellipse class="kk" cx="${(ex + (dx2 >= 0 ? 1.4 : -1.4)).toFixed(1)}" cy="${ey.toFixed(1)}" rx="3.8" ry="2.4"/>` : "");
  };
  const HAIR = {
    short: '<path class="kk" d="M-9.8-36C-10.5-46-4-48.6 0-48.4 6-48.2 10.6-44 9.8-36 7-40.5 2.5-41.8-1.5-41.2-5.5-40.6-8.2-38.6-9.8-36Z"/>',
    long: '<path class="kk" d="M-9.8-35C-11-46-4-48.6 0-48.4 6-48.2 11-46 9.8-35L10.4-26C8-26 7.4-29 7.6-33 5-38.5-3-39.5-7.6-34-7.6-29-8-26.5-10.4-26Z"/>',
    bun: '<path class="kk" d="M-9.8-36C-10.5-46-4-48.6 0-48.4 6-48.2 10.6-44 9.8-36 7-40.5 2.5-41.8-1.5-41.2-5.5-40.6-8.2-38.6-9.8-36Z"/><circle class="kk" cx="1" cy="-50" r="3.6"/>',
    curly: '<path class="w" d="M-10.4-33.5C-13.5-37.5-11-44-7.4-44.2-6.2-48.6-1.4-49.6 1-47.4 4-50.4 9.4-47.6 8.8-43.4 12.4-41.6 12.4-36.4 10.4-33.5 8-38.6-8-38.6-10.4-33.5Z"/>',
    bald: '<path class="o" stroke-width="1.6" d="M-9.4-33C-10.4-31-10.4-29-9-28M9.4-33C10.4-31 10.4-29 9-28"/>',
  };
  const figure = (o) => {
    const { x = 0, y = 0, s = 1, rot = 0, hair = "short", shirt = "w", pants = "k", glasses = false, aL = [-12, -6], aR = [12, 6], lL = [-3, 0], lR = [3, 0], face = 0 } = o;
    const head = `<circle class="w" cx="0" cy="-36" r="9.6"/>${HAIR[hair]}`;
    const eyes = glasses ? '<circle class="o" stroke-width="1.3" cx="-3.6" cy="-35" r="2.6"/><circle class="o" stroke-width="1.3" cx="3.6" cy="-35" r="2.6"/><path class="o" stroke-width="1.2" d="M-1 -35h2"/>' : "";
    const mouth = face ? '<path class="kk" d="M-2-31.4Q0-28.4 2-31.4Z"/>' : '<path class="o" stroke-width="1.3" d="M-1.6-31.2Q0-29.8 1.6-31.2"/>';
    return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${limb(-4.4, -1, lL, 10, 5, pants, "shoe")}${limb(4.4, -1, lR, 10, 5, pants, "shoe")}<path class="${shirt}" d="M-8-26C-9.4-26-10.4-24.4-10.4-21.6L-9.4 0H9.4L10.4-21.6C10.4-24.4 9.4-26 8-26Z"/><path class="o" stroke-width="1.5" d="M-3-25.6 0-22.6 3-25.6"/>${limb(-8.4, -23.6, aL, 9, 3.2, shirt === "kk" ? "k" : shirt === "a" ? "g" : shirt, "hand")}${limb(8.4, -23.6, aR, 9, 3.2, shirt === "kk" ? "k" : shirt === "a" ? "g" : shirt, "hand")}${head}<circle class="k" cx="-3.4" cy="-35.4" r="1.05"/><circle class="k" cx="3.4" cy="-35.4" r="1.05"/>${eyes}${mouth}</g>`;
  };
  const blob = (x, y, s = 1, sq = 0) => `<g transform="translate(${x} ${y}) scale(${s * (1 + sq * 0.05)} ${s * (1 - sq * 0.06)})"><path class="g" d="M-11 0C-12-10-10-24 0-24S12-10 11 0C8 2 5-1 2 1-1-1-4 2-7 0-9 1-10 1-11 0Z"/><circle class="k" cx="-3.2" cy="-15" r="1"/><circle class="k" cx="3.2" cy="-15" r="1"/><path class="o" stroke-width="1.2" d="M-1.4-11.6Q0-10.4 1.4-11.6"/></g>`;
  const tree = (x, y, s = 1, sway = 0) => `<g transform="translate(${x} ${y}) scale(${s})"><path class="o" stroke-width="2.4" d="M0 0V-18M0-12 5-17"/><g transform="rotate(${sway} 0 -14)"><path class="g" d="M0-14C-10-14-12-22-11-28-10-36-5-40 0-40S10-36 11-28C12-22 10-14 0-14Z"/><path class="o" stroke-width="1.6" d="M0-16V-30M0-22-4-26"/></g></g>`;
  const flower = (x, y, s = 1, sway = 0) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(${sway})"><path class="o" stroke-width="2" d="M0 0C1-6-1-10 0-16"/>${[0, 72, 144, 216, 288].map((a) => `<circle class="y" cx="${(Math.sin((a * Math.PI) / 180) * 4.4).toFixed(1)}" cy="${(-20 - Math.cos((a * Math.PI) / 180) * 4.4).toFixed(1)}" r="3.2"/>`).join("")}<circle class="k" cx="0" cy="-20" r="1.6"/></g>`;
  const tulip = (x, y, s = 1, sway = 0) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(${sway})"><path class="o" stroke-width="2" d="M0 0V-14M0-4C-5-6-6-10-5-12M0-6C4-8 6-11 5-13"/><path class="w" d="M-5-24C-6-18-4-14 0-14S6-18 5-24L2.5-21 0-25-2.5-21Z"/></g>`;
  const bus = (x, y, s = 1, b = 0) => `<g transform="translate(${x} ${y - b}) scale(${s})"><path class="g" d="M-24-24H18C23-24 26-20 26-14V-5H-26V-21C-26-23-25-24-24-24Z"/><rect class="w" x="-21" y="-20" width="9" height="7" rx="1.4"/><rect class="w" x="-9" y="-20" width="9" height="7" rx="1.4"/><rect class="w" x="3" y="-20" width="9" height="7" rx="1.4"/><path class="w" d="M16-20H20C22-20 23-18 23-16V-12H16Z"/><circle class="kk" cx="-15" cy="-4" r="4.4"/><circle class="kk" cx="15" cy="-4" r="4.4"/><circle class="w" cx="-15" cy="-4" r="1.4"/><circle class="w" cx="15" cy="-4" r="1.4"/></g>`;
  const heart = (x, y, s = 1) => `<path class="g" transform="translate(${x} ${y}) scale(${s})" d="M0 8C-10 1-12-4-10-8-8-12-3-12 0-7 3-12 8-12 10-8 12-4 10 1 0 8Z"/>`;
  const lens = (x, y, s = 1, a = 0) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path class="o" stroke-width="3" d="M0 6V14"/><circle class="w" cx="0" cy="0" r="6"/><circle class="o" stroke-width="1.2" cx="0" cy="0" r="3.6"/></g>`;
  // Two per drawing type — swap just one arm, leg or body to flip like a flipbook
  const ILL = {
    stretch: (f) => figure({ x: -14, y: -6, s: 1.05, hair: "short", shirt: "y", lL: [80, -80], lR: [70, -100], aL: [-150, -170 + f * 25], aR: [40, 20] }) + figure({ x: 16, y: -6, s: 1.05, hair: "curly", shirt: "w", glasses: true, lL: [100, 80], lR: [100, 80], aL: [100 + f * 8, 80], aR: [110 - f * 8, 90] }),
    wave: (f) => figure({ y: -20, s: 1.25, hair: "curly", glasses: true, shirt: "w", pants: "g", aL: [-20, 10], aR: [150 - f * 30, 170 - f * 30], face: 1 }) + blob(20, -26, 0.55, f),
    lie: (f) => figure({ x: 4, y: -6, rot: -82, s: 1.05, hair: "bald", shirt: "g", lL: [-20 - f * 30, -150 + f * 40], lR: [-10, -120 - f * 30], aL: [150, 120], aR: [170, 140] }),
    walk: (f) => figure({ y: -20, s: 1.2, hair: "bun", shirt: "w", aL: [-30 + f * 50, -10 + f * 40], aR: [30 - f * 50, 60 - f * 30], lL: [-20 + f * 40, -10 + f * 30], lR: [20 - f * 40, 30 - f * 50] }) + blob(26, -2, 0.5, 1 - f),
    cheer: (f) => figure({ y: -20, s: 1.25, hair: "short", shirt: "w", pants: "g", aL: [-130 - f * 30, -150 - f * 20], aR: [130 + f * 30, 150 + f * 20], lL: [-14, -4], lR: [14, 4], face: 1 }),
    nurse: (f) => figure({ y: -20, s: 1.25, hair: "long", shirt: "w", pants: "w", aL: [-10, 40 + f * 10], aR: [20, -60 - f * 20], face: f }) + `<rect class="y" x="${7 + f}" y="-46" width="10" height="13" rx="1.6" transform="rotate(${-12 + f * 6} 12 -40)"/>`,
    pair: (f) => figure({ x: -16, y: -6, s: 0.95, hair: "short", shirt: "y", lL: [80, -80], lR: [80, -80], aL: [-40, -10], aR: [140 + f * 20, 160 + f * 20], face: 1 }) + figure({ x: 15, y: -6, s: 0.95, hair: "long", shirt: "g", lL: [95, 70], lR: [100, 80], aL: [-70 + f * 20, -110 + f * 20], aR: [60, 100] }),
    pc: (f) => figure({ x: -6, y: -6, s: 1.05, hair: "long", shirt: "y", lL: [80, -80], lR: [70, -100], aL: [-30, 60 + f * 14], aR: [30, 80 - f * 14] }) + `<g transform="translate(-14 -60) rotate(-14)"><rect class="w" x="-12" y="-10" width="18" height="14" rx="2"/>${blob(-3, 2, 0.32)}</g><rect class="w" x="0" y="-26" width="20" height="5" rx="1.2" transform="rotate(${-8 + f * 4} 10 -24)"/>`,
    hug: (f) => figure({ x: -8, y: -6, s: 1.1, hair: "long", shirt: "w", pants: "y", lL: [130, 20], lR: [120, 10], aL: [40, 110], aR: [60, 130] }) + heart(-4, -32 + f, 0.8) + blob(24, -2, 0.6, f),
    look: (f) => figure({ y: -20, s: 1.2, hair: "short", shirt: "w", pants: "y", aL: [-30, 40], aR: [150 - f * 10, -150 + f * 10] }) + lens(9 - f * 2, -78 + f * 2, 0.9) + blob(-22, -2, 0.62, f) + lens(-30, -24, 0.5, -20),
    chef: (f) => figure({ y: -20, s: 1.2, hair: "short", shirt: "w", aL: [-150 + f * 20, -170 + f * 30], aR: [150 - f * 15, 120 - f * 15] }) + `<path class="w" d="M-7-82C-9-88-3-92 0-88 3-92 9-88 7-82Z"/>` + blob(22, -76 + f * 3, 0.42),
    group: (f) => figure({ x: -24, y: -6, s: 0.95, hair: "curly", glasses: true, shirt: "w", lL: [100, 10], lR: [90, -10], aL: [-160, -170], aR: [120, 150] }) + blob(-24, -58 - f * 2, 0.55, f) + figure({ x: 4, y: -18, s: 1.05, hair: "short", shirt: "w", pants: "y", aL: [-120 - f * 20, -150 - f * 10], aR: [40, 70] }) + figure({ x: 26, y: -16, s: 0.85, hair: "bun", shirt: "w", aL: [-60, -100], aR: [30, 10] }) + `<path class="a" d="M-12-12C-14-22 4-26 8-18 2-14-6-8-12-12Z"/><path class="a" d="M-12-2C-6-8 6-10 10-2 2 4-8 4-12-2Z"/>`,
    sitread: (f) => figure({ x: -4, y: -6, s: 1, hair: "bald", glasses: true, shirt: "w", lL: [80, -10], lR: [90, 10], aL: [40, 110 - f * 10], aR: [60, 120 + f * 10] }) + `<rect class="w" x="6" y="-42" width="12" height="10" rx="1.4" transform="rotate(${-10 + f * 6} 12 -37)"/>` + blob(22, -2, 0.5, f),
    blob: (f) => blob(0, -4, 2.6, f),
    tree: (f) => tree(0, -2, 2.1, f ? 6 : -4),
    flower: (f) => flower(0, -2, 2.4, f ? 8 : -6),
    tulip: (f) => tulip(0, -2, 2.6, f ? 6 : -6),
    bus: (f) => bus(0, -4, 1.6, f * 2),
  };
  const EVERY = { stretch: 800, wave: 800, lie: 800, walk: 800, cheer: 800, nurse: 800, pair: 800, pc: 800, hug: 1500, look: 1500, chef: 800, group: 1500, sitread: 800, blob: 800, tree: 1500, flower: 1500, tulip: 1500, bus: 700 };
  const drawIll = (el) => {
    const kind = el.dataset.ill, make = ILL[kind];
    if (!make || el.childElementCount) return;
    el.innerHTML = [0, 1].map((f) => `<svg data-fx-part="frame" viewBox="-50 -100 100 100" aria-hidden="true">${make(f)}</svg>`).join("");
    el.setAttribute("data-fx", `frame-flip-loop ${el.dataset.fx || ""}`.trim());
    if (!el.hasAttribute("data-fx-frame-flip-loop")) el.setAttribute("data-fx-frame-flip-loop", `every: ${el.dataset.every || EVERY[kind] || 800}${el.dataset.pop ? "; pop: on" : ""}; hide: opacity`);
  };
  const ill = (kind, cls = "", extra = "") => `<i class="yt-ill ${cls}" data-ill="${kind}" ${extra}></i>`;

  /* ── Button type ── */
  const btn = (label, href = "#", cls = "") => `<a class="yt-btn ${cls}" href="${href}" data-fx="elastic-shrink-hover"><span data-fx-part="inner"><span data-fx-part="fill"></span><span>${label}</span><span class="yt-arrow" data-fx-part="icon">${ICON.arrow}</span></span></a>`;

  /* ── Header, menu, footer and transition curtain ── */
  const page = document.body.dataset.page || "home";
  const PAGES = [["about.html", "About"], ["service.html", "Find a Facility"], ["service.html", "Find services"], ["#", "Frequently asked questions"], ["news.html", "News"], ["recruit.html", "Hiring"]];
  const FAC = Array.from({ length: 18 }, (_, i) => `Facility Name ${String(i + 1).padStart(2, "0")}`);
  const SRV = Array.from({ length: 18 }, (_, i) => `Service Name ${String(i + 1).padStart(2, "0")}`);
  const list = (arr, at) => arr.map((t, i) => `<li><a class="yt-map__child" href="service.html"><span class="yt-clip"><span class="yt-nav-label" style="--i:${at + i}">${t}</span></span></a></li>`).join("");
  const navLabel = (t, href, i, cls = "yt-map__h") => `<a class="${cls}" href="${href}"><span class="yt-clip"><span class="yt-nav-label" style="--i:${i}">${t}</span></span></a>`;
  const siteMap = () => `<div class="yt-map">
      <div class="yt-map__col">${navLabel("Find a Facility", "service.html", 1)}<ul class="yt-map__list">${list(FAC, 3)}</ul></div>
      <div class="yt-map__col">${navLabel("Find services", "service.html", 2)}<ul class="yt-map__list">${list(SRV, 3)}</ul></div>
      <div class="yt-map__col">${navLabel("About", "about.html", 3, "yt-map__h is-side")}${navLabel("News", "news.html", 4, "yt-map__h is-side")}
        <div class="yt-map__sub">${navLabel("Your policy guide, one line, here", "about.html", 5, "")}${navLabel("One line here on training application info", "recruit.html", 6, "")}<a href="about.html">Privacy policy</a></div>
        <a class="yt-rec-card is-d" href="recruit.html" data-fx="elastic-shrink-hover"><span data-fx-part="inner"><b>Hiring Info</b><i>Hospitality is</i><span class="wf-img yt-mask-cloud" data-label="Smiling staff member · indoors · landscape"></span></span></a>
      </div>
    </div>`;
  const tel = () => `<div class="yt-tel"><span class="yt-tel__k">Main Phone</span><a class="yt-tel__n" href="tel:0000000000">0000-00-0000</a><span class="yt-tel__h"><span class="yt-tel__hk">Receiving time</span>9:00~17:30</span><p class="yt-tel__note">※ Phone numbers vary by facility <a class="yt-ulink" href="service.html"><span data-under>Facility Page</span></a>Please check at</p></div>
    <div class="yt-tel__btns">${btn("Resource Requests & Inquiries", "index.html#contact", "is-ask")}${btn("Frequently asked questions", "#", "is-faq")}</div>`;
  const header = () => `<div class="yt-head" data-head>
      ${logo()}
      ${page === "home" ? `<nav class="yt-nav">${PAGES.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</nav>` : `<p class="yt-crumb"><a class="yt-crumb__home" href="index.html"><span>Home</span></a><i aria-hidden="true"></i><span class="yt-crumb__now">${(PAGE_NAME[page] || ["", "Page"])[1]}</span></p>`}
      <div class="yt-head__cta">${btn("Request materials ·<br>Contact Us", "index.html#contact")}</div>
    </div>
    <button class="yt-menu-btn" type="button" aria-label="Open Menu" data-menu-btn data-fx="elastic-shrink-hover" data-fx-elastic-shrink-hover="press: on"><span data-fx-part="inner"><span data-fx-part="fill"></span><span data-fx-part="icon" data-scale="1.2"><svg class="yt-ico is-open" aria-hidden="true"><use href="#yt-sym-menu"/></svg><svg class="yt-ico is-close" aria-hidden="true"><use href="#yt-sym-close"/></svg></span><span class="yt-menu-btn__label"><span class="is-open">Menu</span><span class="is-close">Close</span></span></span></button>`;
  const menu = () => `<button class="yt-menu__close" type="button" aria-label="Close Menu" data-menu-close></button><div class="yt-menu" data-menu data-lenis-prevent data-slot="menu-drawer"><div class="yt-menu__bg"></div><div class="yt-menu__in">
      <div class="yt-menu__side">${logo()}${tel()}</div>${siteMap()}
      ${ill("cheer", "yt-menu__ill", 'data-fx-frame-flip-loop="every: 800"')}</div></div>`;
  const FOOT_ARCH = { from: "M-500 300C-100 110 300 84 720 84S1540 110 1940 300V1000H-500Z", to: "M-500 300C-100 40 300 0 720 0S1540 40 1940 300V1000H-500Z" };
  const FOOT_HILL = { from: "M-700 520C-200 150 300 129 720 129S1640 150 2140 520V900H-700Z", to: "M-700 520C-200 40 300 0 720 0S1640 40 2140 520V900H-700Z" };
  const FOOT_ILL = [["stretch", "bottom:2.1%;left:13.6%;width:9.2%"], ["chef", "bottom:-.7%;left:30.4%;width:11%"], ["lie", "bottom:-1.4%;left:42.7%;width:11.2%"], ["sitread", "bottom:1.8%;right:19.3%;width:11.1%"], ["wave", "bottom:6.5%;right:13.3%;width:8.1%"], ["tree", "bottom:5%;left:3.3%;width:5.6%"], ["blob", "bottom:.7%;left:13.5%;width:10%;display:none"], ["tree", "bottom:4.9%;right:31.6%;width:8%"], ["bus", "bottom:3.8%;right:2.3%;width:7%"]];
  const footer = () => `<div class="yt-foot__top" data-foot-top>
      <svg class="yt-foot__arch" viewBox="0 0 1440 81" preserveAspectRatio="none"><path data-foot-arch d="${FOOT_ARCH.from}"/></svg>
      <div class="yt-foot__body" data-foot-body>
        <div class="yt-foot__logo" data-foot-logo>${mark()}<span class="yt-logo__text"><small>Your company type here</small><b>Logo Name</b><i>LOGO NAME</i></span></div>
        <div class="yt-foot__grid" data-foot-nav>${siteMap()}<div>${tel()}<p class="yt-foot__copy">© Your corporate name here</p></div></div>
      </div>
      <div class="yt-foot__hill" data-foot-hill>
        <svg class="is-ground" viewBox="0 0 1440 129" preserveAspectRatio="none"><path data-foot-ground d="${FOOT_HILL.from}"/></svg>
        ${FOOT_ILL.map(([k, st]) => ill(k, "", `style="${st}"`)).join("")}
        <span class="yt-foot__copyline" style="right:19%;bottom:15%">Your short line here.</span>
      </div>
    </div>`;
  const PAGE_NAME = { about: ["About", "About"], service: ["Service", "Find services"], news: ["News", "News"], recruit: ["Recruit", "Hiring Info"] };
  const trans = (page) => {
    const [en, ko] = PAGE_NAME[page] || ["Page", "Page"];
    return `<div class="yt-tr" data-tr aria-hidden="true"><div class="yt-tr__body" data-tr-body><div class="yt-tr__bg" data-tr-bg></div><div class="yt-tr__in">${ill("walk", "yt-tr__ill", 'data-every="700"')}<div class="yt-tr__labels"><span class="yt-tr__label">${en}</span><span class="yt-tr__label">${ko}</span></div></div></div>
      <div class="yt-tr__cover" data-tr-cover><svg class="is-top" data-tr-top viewBox="0 0 1820 701"><path data-tr-top-path d="M148 486C378 638 632 675 910 675S1442 638 1672 486C1819 388 1854 211 1788 98 1718-21 1442 60 910 60S102-21 32 98C-34 211 1 388 148 486Z"/></svg><div class="is-fill"></div><svg class="is-bottom" data-tr-bottom viewBox="0 0 1820 701"><path d="M148 215C378 63 632 26 910 26S1442 63 1672 215C1819 313 1854 490 1788 603 1718 722 1442 641 910 641S102 722 32 603C-34 490 1 313 148 215Z"/></svg></div></div>`;
  };

  document.body.insertAdjacentHTML("afterbegin", defs);
  const headSlot = document.querySelector('[data-slot="header"]');
  if (headSlot) headSlot.innerHTML = header();
  const footSlot = document.querySelector('[data-slot="footer"]');
  if (footSlot) { footSlot.classList.add("yt-foot"); footSlot.innerHTML = footer(); }
  document.body.insertAdjacentHTML("beforeend", menu() + '<div class="yt-out" data-out></div>' + (page === "home" ? "" : trans(page)));
  document.querySelectorAll("[data-bean]").forEach((b) => { b.innerHTML = ICON.bean; });
  document.querySelectorAll("[data-icon]").forEach((b) => { b.innerHTML = ICON[b.dataset.icon] || ""; });
  document.querySelectorAll(".yt-ill[data-ill]").forEach(drawIll);

  /* ── Smooth scroll — original Lenis 1.3.9 defaults (lerp .1). Like the original, Lenis runs on its own rAF and is not tied to the GSAP ticker —
     if bound, an always-awake ticker draws the hover tween first in the very frame the event fires, one frame ahead of the original ── */
  const lenis = reduce ? null : new Lenis({ autoRaf: true });
  lenis?.on("scroll", ScrollTrigger.update);
  history.scrollRestoration = "manual";
  const scrollY = () => (lenis ? lenis.scroll : window.scrollY);
  const onScroll = (fn) => (lenis ? lenis.on("scroll", () => fn(lenis.scroll)) : addEventListener("scroll", () => fn(scrollY()), { passive: true }));

  /* ── Header: hides the nav after scrolling down over 50px, and slides out with the header when the footer reaches header height ── */
  const head = document.querySelector("[data-head]");
  const menuBtn = document.querySelector("[data-menu-btn]");
  if (head) {
    onScroll((y) => head.classList.toggle("is-scrolled", y > 50));
    const foot = document.querySelector(".yt-foot");
    if (foot) new IntersectionObserver(([e]) => head.classList.toggle("is-hide", e.isIntersecting && document.body.classList.contains("is-ready")), { rootMargin: `0px 0px -${innerHeight - head.offsetHeight}px 0px` }).observe(foot);
  }

  /* ── Menu drawer — like Alpine x-transition, it swaps enter/enter-start/enter-end one frame at a time ── */
  const drawer = document.querySelector("[data-menu]");
  // On opening the menu, the original shifts the whole body and footer 3.5vw to the lower left and fades them (data-menu-fade is on the body wrapper and the footer)
  document.querySelector("main")?.setAttribute("data-menu-fade", "");
  footSlot?.setAttribute("data-menu-fade", "");
  const fades = [...document.querySelectorAll("[data-menu-fade]")];
  // Like Alpine x-show·x-transition: add the enter class first (still hidden), then show on the next frame, -start → -end
  const swap = (el, kind, ms, show) => new Promise((done) => {
    el.classList.add(kind, `${kind}-start`);
    requestAnimationFrame(() => { show?.(); requestAnimationFrame(() => { el.classList.remove(`${kind}-start`); el.classList.add(`${kind}-end`); }); });
    setTimeout(() => { el.classList.remove(kind, `${kind}-end`); done(); }, ms);
  });
  let open = false;
  const toggleMenu = async (on) => {
    if (on === open) return;
    open = on;
    if (on) {
      lenis?.stop();
      fades.forEach((f) => { gsap.to(f, { y: "3.5vw", x: "-3.5vw", duration: 1.2, ease: "power4.out" }); gsap.to(f, { opacity: 0, duration: 0.25, ease: "power4.out" }); });
      // Button panel and text change on the very frame of the press (original x-bind)
      menuBtn?.classList.add("is-opened");
      setTimeout(() => document.body.classList.add("is-menu"));
      swap(drawer, "enter", 800, () => drawer.classList.add("is-shown"));
    } else {
      fades.forEach((f) => { gsap.to(f, { x: 0, y: 0, duration: 0.8, ease: "power4.out" }); gsap.to(f, { opacity: 1, duration: 0.5, delay: 0.1, ease: "power1.inOut" }); });
      menuBtn?.classList.remove("is-opened");
      setTimeout(() => document.body.classList.remove("is-menu"));
      // Original handleToggleMenu: starts closing, then re-enables scrolling 500ms later
      setTimeout(() => { if (!open) lenis?.start(); }, 500);
      await swap(drawer, "leave", 1200);
      if (!open) drawer.classList.remove("is-shown");
    }
    menuBtn?.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
  };
  menuBtn?.addEventListener("click", () => toggleMenu(!open));
  // Original: an open menu has a slightly larger transparent close button under the menu button, so pressing around the button also closes it
  document.querySelector("[data-menu-close]")?.addEventListener("click", () => toggleMenu(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape") toggleMenu(false); });

  /* ── On leaving: a background-color curtain spreads in .3s and .3s later moves to the next section (original handlePageLeaveClick) ── */
  const out = document.querySelector("[data-out]");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(https?:|mailto:|tel:)/.test(href)) return;
    const url = new URL(href, location.href);
    if (url.pathname === location.pathname) { if (url.hash) { e.preventDefault(); toggleMenu(false); const t = document.querySelector(url.hash); t && setTimeout(() => (lenis ? lenis.scrollTo(t, { offset: -head.offsetHeight }) : t.scrollIntoView()), 550); } return; }
    e.preventDefault();
    out.classList.add("is-on");
    setTimeout(() => { lenis?.scrollTo(0, { immediate: true, force: true }); location.href = a.href; }, 300);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) out.classList.remove("is-on"); });

  /* Entrance: on inner pages the base panel rises, then the green cover sweeps past (original basicTransition). The first page waits for the logo intro in index.js */
  const readyFns = [];
  let isReady = false;
  const fadeIn = () => {
    const heads = [head, menuBtn].filter(Boolean);
    const fadeEls = [...document.querySelectorAll("[data-transition-fade]")], upEls = [...document.querySelectorAll("[data-transition-up]")];
    fadeEls.forEach((el) => gsap.to(el, { opacity: 1, duration: 0.6, ease: "power2.in", onComplete: () => el.removeAttribute("data-transition-fade") }));
    upEls.forEach((el) => gsap.to(el, { y: 0, duration: 1.4, delay: 0.2, ease: "power3.out", onComplete: () => { el.removeAttribute("data-transition-up"); gsap.set(el, { clearProps: "transform" }); } }));
    setTimeout(() => { isReady = true; document.body.classList.add("is-ready"); readyFns.splice(0).forEach((f) => f()); startScrollAnims(); }, 280);
    gsap.set(heads, { opacity: 0, y: "-4vw" });
    gsap.to(heads, { opacity: 1, duration: 0.5, delay: 0.5, ease: "power1.inOut" });
    return gsap.to(heads, { y: 0, duration: 1, delay: 0.5, ease: "power3.out", onComplete: () => setTimeout(() => gsap.set(heads, { clearProps: "transform,opacity" }), 100) });
  };
  // Original skipTransition — for the Careers section, the transition panel is simply cleared in .3s and the scene that opens the header card (recruit.js) is left to handle the rest
  const skipIn = () => new Promise((done) => {
    const tr = document.querySelector("[data-tr]");
    if (!tr || reduce) { tr?.remove(); return done(); }
    gsap.to(tr.querySelector("[data-tr-body]"), { opacity: 0, duration: 0.3, ease: "power3.inOut", onComplete: () => { tr.remove(); done(); } });
  });
  const basicIn = () => new Promise(async (done) => {
    const tr = document.querySelector("[data-tr]");
    if (!tr) return done();
    const body = tr.querySelector("[data-tr-body]"), bg = tr.querySelector("[data-tr-bg]"), cover = tr.querySelector("[data-tr-cover]");
    const top = tr.querySelector("[data-tr-top]"), topPath = tr.querySelector("[data-tr-top-path]"), bottom = tr.querySelector("[data-tr-bottom]");
    if (reduce) { tr.remove(); return done(); }
    gsap.set(cover, { y: innerHeight });
    tr.classList.add("is-start");
    cover.style.opacity = "1";
    await wait(600);
    gsap.to(body, { y: -bg.clientHeight, duration: 1.2, ease: "power3.in" });
    gsap.to(top, { scale: mobile() ? 3 : 1.59, duration: 1, ease: "power1.inOut" });
    wait(600).then(() => gsap.to(topPath, { morphSVG: "M148 486C378 638 632 675 910 675S1442 638 1672 486C1819 388 1854 211 1788 98 1718-21 1672 2 1421 2 1131 2 1045 2 891 2 737 2 644 2 399 2 148 2 102-21 32 98-34 211 1 388 148 486Z", ease: "elastic.out(2, 0.5)", duration: 1.8 }));
    gsap.to(cover, { y: 0, duration: 0.8, ease: "power1.in" });
    await wait(1100);
    done();
    gsap.to(cover, { y: -(cover.clientHeight + bottom.clientHeight * 0.5), duration: 0.5, ease: "circ.out", onComplete: () => tr.remove() });
    gsap.to(bottom, { scale: 10, duration: 0.5, ease: "power4.in" });
  });

  /* ── Show once when visible — fade-in-up and fade-up-rotate are css, title is a green bean that stretches horizontally with elasticity ── */
  const scrollAnim = {
    title: (el) => {
      const icons = [...el.querySelectorAll("[data-scroll-icon]")];
      if (!icons.length) return;
      gsap.fromTo(icons, { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: "elastic.out(1.2, 0.5)", stagger: 0.2 });
      gsap.timeline().set(icons, { scaleY: 0 }).to(icons, { scaleY: 1.2, duration: 0.5, ease: "power2.in" }).to(icons, { scaleY: 1, duration: 1, ease: "elastic.out(1.2, 0.5)", stagger: 0.2 });
      gsap.fromTo(icons, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: "power4.out", stagger: 0.06 });
    },
    elastic: (el) => gsap.timeline().to(el, { delay: +(el.dataset.scrollDelay || 0), scale: +(el.dataset.scrollPower || 1.1), duration: 0.2, ease: "power0.out", overwrite: true }).to(el, { scale: 1, duration: +(el.dataset.scrollDuration || 1.8), ease: "elastic.out(1.2, 0.5)" }),
  };
  const startScrollAnims = () => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const el = e.target;
      if (e.isIntersecting) { el.classList.add("is-in"); scrollAnim[el.dataset.jsScroll]?.(el); if (!el.hasAttribute("data-scroll-repeat")) io.unobserve(el); }
      else if (el.hasAttribute("data-scroll-repeat")) el.classList.remove("is-in");
    }));
    document.querySelectorAll("[data-js-scroll]").forEach((el) => io.observe(el));
  };

  /* ── Footer: when visible the arch is revealed in .5s and swells with a 1.5s elastic, and the logo blooms again. The hill rises with the same elastic ── */
  const footTop = document.querySelector("[data-foot-top]");
  if (footTop) {
    const body = footTop.querySelector("[data-foot-body]"), arch = footTop.querySelector("[data-foot-arch]"), ground = footTop.querySelector("[data-foot-ground]"), hill = footTop.querySelector("[data-foot-hill]");
    const nav = footTop.querySelector("[data-foot-nav]"), logoEl = footTop.querySelector("[data-foot-logo]");
    const p = { v: 0 };
    let bloomed = false;
    const io = new IntersectionObserver(([e]) => {
      const on = e.isIntersecting;
      if (on && !bloomed) { bloomed = true; bloomMark(logoEl); io.disconnect(); }
      gsap.to(p, { v: on ? 1 : 0, duration: on ? 0.5 : 0, ease: "power1.inOut", overwrite: true, onUpdate: () => body.style.setProperty("--foot-clip", `inset(${100 - p.v * 100}% 0 0 0)`), onComplete: () => on && gsap.to(arch, { morphSVG: FOOT_ARCH.to, duration: 1.5, ease: "elastic.out(1.1,0.7)", overwrite: true }) });
    });
    if (!reduce) { body.style.setProperty("--foot-clip", "inset(100% 0 0 0)"); io.observe(footTop); }
    const io2 = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io2.disconnect(); gsap.to(ground, { morphSVG: FOOT_HILL.to, duration: 1.5, ease: "elastic.out(1.1,0.7)" }); } });
    reduce ? ground.setAttribute("d", FOOT_HILL.to) : io2.observe(hill);
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { document.body.classList.add("footer-in"); o.disconnect(); } }).observe(nav);
  }

  /* ── Logo bloom (original BrandLogo.symbolAnim·textAnim): morphs dot→circle→bean, and the letters rise with elastic.out(.3,1) ── */
  function bloomMark(root, { text = true } = {}) {
    const topP = root.querySelector(".yt-mark__top"), botP = root.querySelector(".yt-mark__bot"), letters = text ? [...root.querySelectorAll(".yt-logo__text > *")] : [];
    if (reduce || (!topP && !botP)) return Promise.resolve();
    gsap.set([topP, botP].filter(Boolean), { opacity: 0, attr: { d: DOT } });
    if (letters.length) gsap.set(letters, { y: 30, opacity: 0 });
    if (topP) {
      gsap.to(topP, { opacity: 1, duration: 0.3, ease: "power1.inOut" });
      gsap.to(topP, { morphSVG: CIRCLE, duration: 0.3, ease: "power1.in" });
      gsap.to(topP, { morphSVG: MARK_TOP, delay: 0.25, duration: 0.5, ease: "power4.out" });
    }
    if (botP) {
      gsap.to(botP, { opacity: 1, duration: 0.3, delay: 0.45, ease: "power1.inOut" });
      gsap.to(botP, { morphSVG: CIRCLE, duration: 0.3, delay: 0.45, ease: "power1.in" });
      gsap.to(botP, { morphSVG: MARK_BOT, duration: 1.1, delay: 0.6, ease: "elastic.out(0.8,1)" });
    }
    return wait(800).then(() => {
      letters.forEach((l, i) => gsap.to(l, { y: 0, opacity: 1, duration: 1.2 - i * 0.025, delay: i * 0.05, ease: "elastic.out(0.3,1)" }));
    });
  }

  /* ── Large English text flowing behind the subpage header (original pageHeaderLoop: 0.01px/ms leftward, only when visible) ── */
  document.querySelectorAll("[data-loop]").forEach((row) => {
    const t = row.firstElementChild;
    if (!t || reduce) return;
    row.appendChild(t.cloneNode(true));
    let x = 0, on = false, last = 0;
    new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(row);
    gsap.ticker.add(() => {
      const now = performance.now(), dt = last ? Math.max(1, now - last) : 16.7;
      last = now;
      if (!on) return;
      const w = t.offsetWidth;
      x -= dt * 0.01;
      if (-x >= w) x = 0;
      [...row.children].forEach((c) => { c.style.transform = `translate3d(${x}px,0,0)`; });
    });
  });
  /* ── Large background blob (original baseBgDeco): moves up 5% as you scroll, up to 1.05x ── */
  // Position is measured only at first (while still pushed down 3.5vw by the intro) and when the window resizes (original ScrollPosition) — even if sections above expand and push it, it doesn’t follow until scrolling
  const decos = [...document.querySelectorAll("[data-deco]")];
  const decoTop = new Map();
  const measureDecos = () => decos.forEach((d) => decoTop.set(d, scrollY() + d.getBoundingClientRect().top));
  if (decos.length && !reduce) {
    measureDecos();
    addEventListener("resize", measureDecos);
    onScroll((y) => decos.forEach((d) => {
      const top = (y + innerHeight - decoTop.get(d)) / innerHeight;
      d.firstElementChild.style.transform = `translate3d(0,${top * -5}%,0) scale(${Math.max(1 + top * 0.05, 1)})`;
    }));
  }
  /* ── Expand (value card ‹See more›) ── */
  document.querySelectorAll("[data-expand]").forEach((card) => {
    const b = card.querySelector("[data-expand-btn]"), body = card.querySelector("[data-expand-body]");
    b?.addEventListener("click", () => {
      const on = card.toggleAttribute("data-open");
      b.setAttribute("aria-expanded", String(on));
      // Like the original (swapping icons with x-show), the swapped icon stands at its own size
      gsap.set(b.querySelectorAll('[data-fx-part="icon"]'), { scale: 1, overwrite: true });
      if (body) {
        body.style.height = `${on ? 0 : body.scrollHeight}px`;
        requestAnimationFrame(() => { body.style.height = `${on ? body.scrollHeight : 0}px`; });
        const done = () => { if (on) body.style.height = "auto"; body.removeEventListener("transitionend", done); lenis?.resize(); ScrollTrigger.refresh(); };
        body.addEventListener("transitionend", done);
      }
    });
  });

  window.yt = { lenis, scrollY, onScroll, wait, mobile, reduce, mark, logo, ill, drawIll, btn, ICON, bloomMark, MARK_BOT, MARK_TOP, fadeIn, basicIn, onReady: (f) => (isReady ? f() : readyFns.push(f)) };
  if (page !== "home") (page === "recruit" ? skipIn() : basicIn()).then(fadeIn);
})();
