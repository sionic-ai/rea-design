// All pages use the same header (intro sentence, avatar, socials, tabs) so it is drawn once here. To change the copy, edit only INTRO and all five pages change together.
(() => {
  const SVGNS = "http://www.w3.org/2000/svg";
  const html = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const INTRO = {
    name: "Your name here.",
    lead: "Your sentence introducing what you do in one easy line goes here, and",
    cats: [
      { shape: "map", label: "Field One", href: "works.html" },
      { shape: "book", label: "Field Two", href: "works.html" },
      { shape: "tools", label: "Field Three", href: "works.html" },
    ],
    tail: "Continue your closing sentence here.",
    tabs: [
      { page: "about", label: "About", href: "about.html" },
      { page: "works", label: "Work", href: "works.html" },
      { page: "page", label: "Text", href: "page.html" },
      { page: "contact", label: "Contact", href: "contact.html" },
    ],
  };

  const el = (tag, attrs = {}, ns) => {
    const n = ns ? document.createElementNS(SVGNS, tag) : document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };
  const words = (s) => s.split(" ").map((w) => `<span class="g-w">${w}</span>`).join(" ");

  /* ── Avatar drawing (134 grid basis). Lines follow the pen’s stroke order ── */
  const AV = {
    lines: [
      "M41 57C38 33 50 19 67 19C85 19 97 32 93 56",
      "M41 57C45 48 52 45 58 48C62 43 71 43 75 47C81 43 89 46 93 56",
      "M42 58C42 74 50 87 67 88C84 87 92 74 92 57",
      "M42 62C36 60 35 70 43 72",
      "M92 61C98 59 99 69 91 71",
      "M66 66Q64 71 68 72",
      "M61 79Q66 81 71 78",
      "M58 86L57 96",
      "M76 86L77 96",
      "M57 96L51 105L61 110L67 100L73 110L83 105L77 96",
      "M51 105C35 108 24 117 20 134",
      "M83 105C99 108 110 117 114 134",
      "M67 100L67 134",
    ],
    thin: new Set([5, 6, 12]),
    hair: "M41 57C38 33 50 19 67 19C85 19 97 32 93 56C89 46 81 43 75 47C71 43 62 43 58 48C52 45 45 48 41 57Z",
    skin: [
      "M41 57C45 48 52 45 58 48C62 43 71 43 75 47C81 43 89 46 93 56L92 57C92 74 84 87 67 88C50 87 42 74 42 58Z",
      "M42 62C36 60 35 70 43 72Z",
      "M92 61C98 59 99 69 91 71Z",
      "M58 86L57 96L67 100L77 96L76 86C70 89 64 89 58 86Z",
    ],
    // Brush stroke — one for the head, face, ears, neck. Cut out in the face shape
    strokes: [
      ["hair", "M45 52L49 30L57 47L61 24L69 45L75 22L82 43L89 29L91 52"],
      ["skin", "M45 57L49 80L55 51L61 86L67 50L73 87L79 51L85 80L90 58"],
      ["skin", "M38 63L42 71"],
      ["skin", "M96 62L93 70"],
      ["skin", "M59 88L65 99L71 89L76 98"],
    ],
    eyes: [[51, 61], [81, 60]],
    lenses: [[50.2, 59.3], [81.8, 57.4]],
    r: 10.4,
  };
  let avatarSeq = 0;

  function avatarSVG({ mini = false } = {}) {
    const id = `av${++avatarSeq}`;
    const s = el("svg", { viewBox: "0 0 134 134", "aria-hidden": "true" }, true);
    s.innerHTML = `
      <defs>
        <clipPath id="${id}-shape"><path d="${AV.hair}"/>${AV.skin.map((d) => `<path d="${d}"/>`).join("")}</clipPath>
        <filter id="${id}-bristle"><feTurbulence type="fractalNoise" baseFrequency=".3" numOctaves="2" seed="2"/><feDisplacementMap in="SourceGraphic" scale="2" xChannelSelector="R" yChannelSelector="G"/></filter>
      </defs>
      <g class="av-strokes" clip-path="url(#${id}-shape)" filter="url(#${id}-bristle)">${AV.strokes.map(([kind, d]) => `<path class="${kind}" d="${d}" pathLength="1"/>`).join("")}</g>
      <g class="av-colour">
        <path d="${AV.hair}" fill="var(--site-hair)"/>
        ${AV.skin.map((d) => `<path d="${d}" fill="var(--site-skin)"/>`).join("")}
      </g>
      <g class="av-lines">${AV.lines.map((d, i) => `<path d="${d}" pathLength="1"${AV.thin.has(i) ? ' class="thin"' : ""}/>`).join("")}</g>
      <g class="av-eyes">${AV.eyes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7" fill="var(--site-pen)"/>`).join("")}</g>
      <g class="av-glasses">
        ${AV.lenses.map(([x, y], i) => `<circle class="lens" cx="${x}" cy="${y}" r="${AV.r}" pathLength="1" style="--i:${i}"/>`).join("")}
        <path class="bridge" d="M60.6 58.6Q66 55.5 71.4 57.8"/><path d="M39.8 59.6L37.4 58.6M92.2 57.2L94.4 56.2"/>
      </g>
      <g class="av-startle">
        <g style="--i:0"><path d="M101 31L107 25"/></g>
        <g style="--i:1"><path d="M104 40L112 38"/></g>
        <g style="--i:2"><path d="M103 50L110 53"/></g>
      </g>
      <g class="av-wonder">
        <g style="--i:0"><path d="M53 14L49 8"/><path class="point" d="M48.4 6.4h0"/></g>
        <g style="--i:1"><path d="M67 11V4"/><path class="point" d="M67 1.6h0"/></g>
        <g style="--i:2"><path d="M81 14L85 8"/><path class="point" d="M85.6 6.4h0"/></g>
      </g>
      <g class="av-pen"><g transform="rotate(35)"><path d="M0 0L-2.4-6.6H2.4Z"/><rect x="-2.4" y="-24" width="4.8" height="17.4" rx="1"/><circle cy="-6.6" r=".9"/></g></g>
      <g class="av-brush"><g transform="rotate(40) scale(1.3)"><path class="tuft" d="M0 0C-1.4-1.8-3.6-5-3.6-8.2H3.6C3.6-5 1.4-1.8 0 0Z"/><rect x="-3.8" y="-12" width="7.6" height="3.8" rx=".6"/><path d="M-3-12L-2-28Q0-29.4 2-28L3-12Z"/></g></g>`;
    if (mini) s.querySelectorAll(".av-pen, .av-brush, .av-startle, .av-wonder, .av-strokes").forEach((n) => n.remove());
    return s;
  }

  /* ── Line-art poster (280 grid, center 140,140 is the frame center) — isometric SVG shown before three stands up or when WebGL is absent ── */
  const P = (x, y, z) => [140 + (x - y) * 0.866, 140 + (x + y) * 0.5 - z];
  const pts = (a) => a.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" ");
  const quad = (a, b, c, d) => `<polygon points="${pts([a, b, c, d])}"/>`;
  function box(x, y, z, dx, dy, dz) {
    return [
      quad(P(x, y + dy, z), P(x + dx, y + dy, z), P(x + dx, y + dy, z + dz), P(x, y + dy, z + dz)),
      quad(P(x + dx, y, z), P(x + dx, y + dy, z), P(x + dx, y + dy, z + dz), P(x + dx, y, z + dz)),
      quad(P(x, y, z + dz), P(x + dx, y, z + dz), P(x + dx, y + dy, z + dz), P(x, y + dy, z + dz)),
    ].join("");
  }
  const at = (p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`;
  // At rest the drawing projects the three rest box with the same base (π/4·π/4) and the same scale — so the drawing doesn’t jump when three stands up and hides the poster
  const turnX = (a) => ([x, y, z]) => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
  const turnY = (a) => ([x, y, z]) => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
  function restBox(size, centre, yaw, scale, marks = []) {
    const view = (p) => turnX(Math.PI / 4)(turnY(Math.PI / 4)(turnY(yaw)(p)));
    const flat = (p) => { const [x, y] = view(p.map((v, k) => v + centre[k])); return [140 + scale * x, 140 - scale * y]; };
    const faces = [];
    for (let k = 0; k < 3; k++) for (const sign of [-1, 1]) {
      const n = [0, 0, 0]; n[k] = sign;
      if (view(n)[2] <= 1e-6) continue;
      const [i, j] = [0, 1, 2].filter((a) => a !== k);
      const corner = (a, b) => { const p = [0, 0, 0]; p[k] = (sign * size[k]) / 2; p[i] = (a * size[i]) / 2; p[j] = (b * size[j]) / 2; return flat(p); };
      faces.push(`<polygon points="${pts([corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)])}"/>`);
    }
    const seen = (n) => view(n)[2] > 1e-6;
    const lines = marks.filter(([n]) => seen(n)).map(([, a, b]) => `<polyline class="no-fill" points="${pts([flat(a), flat(b)])}"/>`);
    return faces.join("") + lines.join("");
  }
  const part = (i, inner, { from = "scale(.4)", origin = "140px 150px" } = {}) =>
    `<g class="ic-part" style="--i:${i};--from:${from};--o:${origin}">${inner}</g>`;

  const ICONS = {
    // Folded map: at rest, a standing booklet. When raised, it unfolds like a folding screen with roads and pins popping out
    map() {
      const rest = `<g class="ic-rest">${restBox([0.15, 1, 0.62], [0.05, 0, 0], (22 * Math.PI) / 180, 48)}</g>`;
      const zig = [[0, -32], [9, -16], [0, 0], [9, 16], [0, 32]];
      const panels = zig.slice(0, -1).map(([x0, y0], i) => {
        const [x1, y1] = zig[i + 1];
        const c = P((x0 + x1) / 2, (y0 + y1) / 2, 0);
        const from = `translate(${(140 - c[0]).toFixed(1)}px, ${(140 - c[1]).toFixed(1)}px) scale(.5)`;
        return part(i, quad(P(x0, y0, -18), P(x1, y1, -18), P(x1, y1, 18), P(x0, y0, 18)), { from, origin: at(c) });
      });
      const route = [[2, -28, 4], [7, -18, -6], [2, -6, 8], [6, 10, -2], [3, 24, 6]].map(([x, y, z]) => P(x, y, z));
      const pin = P(4, 2, 30);
      return rest + panels.join("") +
        part(4, `<polyline class="no-fill" stroke-dasharray="3 3" points="${pts(route)}"/>`, { origin: at(route[0]) }) +
        part(5, `<path d="M${pin[0]} ${pin[1] + 14}L${pin[0] - 5} ${pin[1] + 3}A6 6 0 1 1 ${pin[0] + 5} ${pin[1] + 3}Z"/><circle class="fill-ink" cx="${pin[0]}" cy="${pin[1] - 1}" r="2"/>`, { from: "translateY(-10px) scale(.3)", origin: `${pin[0]}px ${pin[1] + 14}px` });
    },
    // Book — at rest a thick lying book, when lifted the cubes rise one after another
    book() {
      const shut = `<g class="ic-move" style="--lit-t:translateY(10px)">${restBox([0.82, 0.16, 0.66], [0, 0, 0], 0, 48)}</g>`;
      const cubes = [[-10, -6, 8, 9], [2, -6, 14, 7], [-4, 4, 6, 6], [6, 4, 18, 5], [-12, 6, 20, 4]];
      return shut + cubes.map(([x, y, z, k], i) => part(i + 1, `<g transform="translate(0 10)">${box(x, y, z, k, k, k)}</g>`, { from: "translateY(14px) scale(.3)", origin: at(P(x, y, 4)) })).join("");
    },
    // Window — at rest two slanted panels, on raise the panels retreat and the screen piece pops forward
    tools() {
      const title = [[[-1, 0, 0], [-0.04, 0.19, -0.45], [-0.04, 0.19, 0.45]], [[0, 0, 1], [-0.04, 0.19, 0.45], [0.04, 0.19, 0.45]], [[0, 0, -1], [-0.04, 0.19, -0.45], [0.04, 0.19, -0.45]]];
      const rest = `<g class="ic-move" style="--lit-t:translate(-8px,-4px)">${restBox([0.08, 0.72, 0.9], [0, 0, 0], Math.PI / 2, 64, title)}</g>`;
      const cards = [[7, -13, 2, 26, 6], [10, -13, -9, 12, 9], [10, 1, -9, 12, 9], [13, -6, -18, 18, 5]];
      return rest + cards.map(([x, y, z, dy, dz], i) => {
        const c = P(x, y + dy / 2, z + dz / 2);
        return part(i + 1, box(x, y, z, 2, dy, dz), { from: `translate(-12px, -6px) scale(.4)`, origin: at(c) });
      }).join("") +
        part(5, `<path class="fill-ink" d="M${P(16, 8, 4).join(" ")}l0 11l3-3l2.4 5l2-1l-2.4-5l4.2 0z"/>`, { origin: at(P(16, 8, 4)) });
    },
  };

  /* ── Header Drawing ── */
  function renderIntro(host) {
    const page = document.body.dataset.page;
    const cat = (c) => `<a class="g-cat" href="${c.href}" data-shape="${c.shape}"><span class="g-cat__frame" aria-hidden="true"><span class="g-cat__box"><span class="g-cat__corners"><i></i><i></i><i></i><i></i></span></span><svg class="g-cat__art ic" viewBox="0 0 280 280">${ICONS[c.shape]()}</svg><canvas class="g-cat__gl"></canvas></span><span class="g-cat__label">${c.label}<span class="g-cat__bar" data-label="${c.label}" aria-hidden="true"></span></span></a>`;
    const [a, b, c] = INTRO.cats;
    host.innerHTML = `
      <h1 class="g-lede" data-reveal data-slot="hero-lede">${words(INTRO.name)} <span class="g-avatar" aria-hidden="true" data-slot="avatar"></span> ${words(INTRO.lead)} ${cat(a)}<span class="g-w">,</span> ${cat(b)}<span class="g-w">,</span> <span class="g-w">And</span> ${cat(c)} ${words(INTRO.tail)}</h1>
      <ul class="g-socials g-follow" data-slot="socials">
        <li><a href="#" aria-label="Social 1"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.2 5.9l1.7-1.7 6.1 6.1 6.1-6.1 1.7 1.7-6.1 6.1 6.1 6.1-1.7 1.7-6.1-6.1-6.1 6.1-1.7-1.7 6.1-6.1z"/></svg></a></li>
        <li><a href="#" aria-label="Social 2"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="10" width="2.4" height="7" class="cut"/><circle cx="8.2" cy="7.2" r="1.4" class="cut"/><path d="M11.5 10h2.2v1.2c.5-.9 1.4-1.4 2.6-1.4 1.8 0 2.7 1.1 2.7 3.2V17h-2.4v-3.6c0-1-.4-1.5-1.2-1.5s-1.5.6-1.5 1.6V17h-2.4z" class="cut"/></svg></a></li>
        <li><a href="#" aria-label="Social 3"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a9.5 9.5 0 0 0-3 18.5v-3.2c-2.6.6-3.2-1.2-3.2-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.8.8.1-.6.4-1.1.6-1.3-2.1-.2-4.3-1-4.3-4.7 0-1 .4-1.9 1-2.6-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.6 1a9 9 0 0 1 4.8 0c1.8-1.3 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.5.6.7 1 1.6 1 2.6 0 3.7-2.2 4.5-4.3 4.7.3.3.7.9.7 1.8V21A9.5 9.5 0 0 0 12 2.5z"/></svg></a></li>
      </ul>
      <hr class="g-rule g-follow">
      <nav class="g-nav t-copy-14 g-follow" aria-label="Site" data-reveal data-slot="tabs">${INTRO.tabs.map((t) => `<a href="${t.href}"${t.page === page || (page === "home" && t.page === "about") ? ' aria-current="page"' : ""}>${t.label}</a>`).join("")}<span class="g-nav__line" aria-hidden="true"></span></nav>`;
  }

  /* ── Text unscramble: letters are shuffled among same-width groups and regain their own letter in x position order (450px per second) ── */
  const GROUPS = ["ijlI", "ftr", "sz", "acekvxy", "hnou", "bdgpq", "mw", "FJLTZ", "EXY", "KPS", "ABRV", "CDGHU", "NOQ", "0123456789"];
  const HANGUL = "가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호구누두루무부수우주추쿠투푸후기니디리미비시이지치키티피히";
  const pick = (s) => s[Math.floor(Math.random() * s.length)];
  const scramble = (s) => s.replace(/[a-z0-9]/gi, (c) => pick(GROUPS.find((g) => g.includes(c)) ?? c)).replace(/[가-힣]/g, () => pick(HANGUL));
  function paint(span, text, n, settle) {
    const kids = [];
    if (n) kids.push(settle ? Object.assign(document.createElement("span"), { className: settle, textContent: text.slice(0, n) }) : text.slice(0, n));
    if (n < text.length) kids.push(Object.assign(document.createElement("span"), { className: settle ? `scrambled ${settle}-like` : "scrambled", textContent: scramble(text.slice(n)) }));
    span.replaceChildren(...kids);
  }
  const running = new WeakMap();
  function decodeSpan(span, text, { width, delay = 0, reveal, flicker = 0.03, settle = "" }) {
    running.get(span)?.kill();
    span.style.width = `${width}px`;
    paint(span, text, 0, settle);
    let shown = 0, last = 0;
    const tw = gsap.to({}, {
      duration: delay + reveal,
      onUpdate() {
        const t = this.time();
        const n = Math.round(gsap.utils.clamp(0, 1, (t - delay) / reveal) * text.length);
        if (n === shown && t - last < flicker) return;
        shown = n; last = t;
        paint(span, text, n, settle);
      },
      onComplete() { paint(span, text, text.length, settle); span.style.width = ""; },
    });
    running.set(span, tw);
    return tw;
  }
  function decode(roots) {
    const range = document.createRange();
    const boxOf = (node, a, b) => { range.setStart(node, a); range.setEnd(node, b); return range.getBoundingClientRect(); };
    const jobs = [];
    for (const root of roots) {
      const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node; (node = walk.nextNode());) {
        if (!/\S/.test(node.data) || node.parentElement.closest(".sr-only, svg, script, style")) continue;
        range.selectNodeContents(node);
        const r = range.getBoundingClientRect();
        if (!r.width || r.bottom < 0 || r.top > innerHeight) continue;
        const parts = [];
        for (const m of node.data.matchAll(/\s+|\S+/g)) parts.push(/\s/.test(m[0]) ? m[0] : { text: m[0], box: boxOf(node, m.index, m.index + m[0].length) });
        jobs.push({ node, parts });
      }
    }
    const lefts = jobs.flatMap((j) => j.parts.filter((p) => typeof p !== "string").map((p) => p.box.left));
    const x0 = Math.min(...lefts);
    const tl = gsap.timeline();
    const swaps = [];
    for (const { node, parts } of jobs) {
      const wrap = el("span", { "aria-hidden": "true" });
      for (const p of parts) {
        if (typeof p === "string") { wrap.append(p); continue; }
        const s = document.createElement("span");
        s.style.cssText = "display:inline-block;white-space:nowrap";
        wrap.append(s);
        tl.add(decodeSpan(s, p.text, { width: p.box.width, delay: (p.box.left - x0) / 450, reveal: Math.max(p.box.width / 450, 0.01) }), 0);
      }
      const sr = Object.assign(document.createElement("span"), { className: "sr-only" });
      node.replaceWith(wrap, sr);
      sr.append(node);
      swaps.push([node, wrap, sr]);
    }
    return tl.call(() => { for (const [node, wrap, sr] of swaps) if (sr.isConnected) { sr.replaceWith(node); wrap.remove(); } });
  }

  /* ── Spring: integrates 1ms at a time. Word links use tension 170·friction 26, 3D line art passes the original values per scene ── */
  class Spring {
    constructor(v, { tension = 170, friction = 26 } = {}) { this.value = this.target = v; this.v = 0; this.config = { tension, friction }; }
    to(t) { this.target = t; }
    set(t) { this.value = this.target = t; this.v = 0; }
    advance(ms) {
      const { tension, friction } = this.config;
      for (let i = 0; i < Math.ceil(ms); i++) {
        if (Math.abs(this.v) < 1e-4 && Math.abs(this.target - this.value) < 1e-3) { this.set(this.target); return false; }
        this.v += -tension * 1e-6 * (this.value - this.target) - friction * 1e-3 * this.v;
        this.value += this.v;
      }
      return true;
    }
  }
  window.gSpring = Spring;

  // The 3D line art loads three after the font is ready so the Hero isn’t blocked — before that, and when there is no WebGL, an SVG line art stands in
  const loadScript = (src) => new Promise((ok, fail) => document.head.append(Object.assign(document.createElement("script"), { src, onload: ok, onerror: fail })));
  let threeLoading = null;
  const loadThree = () => (threeLoading ??= window.THREE ? Promise.resolve() : (async () => {
    window.exports = {};
    await loadScript("../_vendor/three@0.185.0/build/three.cjs");
    window.THREE = window.exports;
    delete window.exports;
  })());
  async function loadIcons() {
    await loadThree();
    if (!window.gIcons) await loadScript("icons.js");
    return window.gIcons;
  }
  // Page curl (curl.js) and screen capture (snapdom) load only when a word link is pressed or a transition is received — the original loads them then too
  async function loadCurl(shoot) {
    await loadThree();
    if (shoot && !window.snapdom) await loadScript("../_vendor/zumer-snapdom@3.7.0/snapdom.js");
    if (!window.gCurl) await loadScript("curl.js");
    return window.gCurl;
  }
  // Before leaving, snap the current screen and hand it over — if it can’t be captured within 1s, move on without a handoff (same limit as the original).
  // Opened via file://, snapdom is blocked while fetching stylesheets and logs a console error, so capture only when opened over http
  const canShoot = /^https?:$/.test(location.protocol);
  let leaving = false;
  async function leave(href) {
    if (leaving) return;
    leaving = true;
    try {
      const src = await Promise.race([loadCurl(true).then((c) => c.capture()), new Promise((r) => setTimeout(r, 1000, null))]);
      if (src) sessionStorage.setItem("g-curl", JSON.stringify({ src, side: 1 }));
    } catch {}
    location.assign(href);
  }

  /* ── Word link: the frame grows to (70 + 2·pop)·zoom cells, pushing the following words, and lowers the panel below by the overflow ── */
  function initCats(lede) {
    const links = [...lede.querySelectorAll(".g-cat")];
    const follow = [...document.querySelectorAll(".g-follow, .g-panel")];
    const fs = () => parseFloat(getComputedStyle(lede).fontSize);
    let raf = 0, last = 0;
    const state = links.map((a) => ({ a, frame: a.querySelector(".g-cat__frame"), pop: new Spring(0), zoom: new Spring(1), t: new Spring(1), from: 100, to: 100, lit: false, hold: null }));
    const wipe = (s) => s.from + (s.to - s.from) * s.t.value;
    const apply = (s) => {
      s.a.style.setProperty("--zoom", s.zoom.value.toFixed(4));
      s.a.style.setProperty("--pop", s.pop.value.toFixed(4));
      s.a.style.setProperty("--wipe", wipe(s).toFixed(2));
      s.a.style.zIndex = s.zoom.value > 1.001 ? "2" : "";
    };
    // Measure the position at rest, and re-flow the word groups behind the enlarged frame. At rest, don’t raise to a line before the line-break position (same as the original),
    // When the frame comes down to the lower row, that row’s words step aside to the frame’s right, and when rows increase the lower panel moves down by that much.
    let rest = null;
    const groups = [];
    for (const k of lede.children) {
      const prev = k.previousSibling;
      const spaced = prev?.nodeType === Node.TEXT_NODE && /\s$/.test(prev.textContent);
      if (!spaced && groups.length) groups.at(-1).els.push(k); else groups.push({ els: [k] });
      if (k.classList.contains("g-cat")) groups.at(-1).cat = state.find((s) => s.a === k);
    }
    const measure = () => {
      for (const g of groups) for (const e of g.els) { e.style.transform = ""; (e.querySelector(".g-cat__label") ?? e).style.opacity = ""; }
      for (const f of follow) f.style.transform = "";
      const box = lede.getBoundingClientRect();
      let line = 0, lastLeft = -Infinity;
      const bands = [];
      for (const g of groups) {
        const rs = g.els.map((e) => e.getBoundingClientRect());
        g.left = Math.min(...rs.map((r) => r.left)) - box.left;
        g.right = Math.max(...rs.map((r) => r.right)) - box.left;
        if (g.left < lastLeft) line++;
        lastLeft = g.left;
        g.line = line;
        g.els.forEach((e, i) => {
          if (!e.classList.contains("g-w")) return;
          const b = (bands[line] ??= { top: Infinity, bottom: -Infinity });
          b.top = Math.min(b.top, rs[i].top - box.top);
          b.bottom = Math.max(b.bottom, rs[i].bottom - box.top);
        });
        if (g.cat) g.frameTop = g.cat.frame.getBoundingClientRect().top - box.top;
      }
      const lh = parseFloat(getComputedStyle(lede).lineHeight) || fs() * 2;
      for (let i = 0; i < bands.length; i++) bands[i] ??= { top: bands[i - 1].top + lh, bottom: bands[i - 1].bottom + lh };
      const gaps = groups.slice(1).filter((g, i) => g.line === groups[i].line).map((g, i, a) => g.left - groups[groups.indexOf(g) - 1].right).sort((a, b) => a - b);
      rest = {
        bands, lh, space: gaps[Math.floor(gaps.length / 2)] ?? fs() * 0.3,
        width: lede.clientWidth + Math.max(0, document.documentElement.clientWidth - fs() - box.right),
        followTop: follow[0] ? follow[0].getBoundingClientRect().top - box.top : Infinity,
      };
    };
    const band = (L) => rest.bands[L] ?? { top: rest.bands.at(-1).top + (L - rest.bands.length + 1) * rest.lh, bottom: rest.bands.at(-1).bottom + (L - rest.bands.length + 1) * rest.lh };
    const unit = () => (2.625 * fs()) / 70;
    // Given the frame size (side, px), the line and position where each word group sits
    const layout = (sides) => {
      const u = unit(), em = fs();
      const pos = groups.map((g) => ({ L: g.line, X: g.left, dx: 0, dy: 0, ex: 0 }));
      const first = groups.findIndex((g) => g.cat && sides.has(g.cat));
      if (first < 0) return { pos, push: 0 };
      const obstacles = [];
      let line = groups[first].line, x = groups[first].left, bottom = -Infinity;
      for (let i = first; i < groups.length; i++) {
        const g = groups[i];
        const ex = g.cat && sides.has(g.cat) ? sides.get(g.cat) - 70 * u : 0;
        const w = g.right - g.left + ex;
        let L = i === first ? g.line : Math.max(line, g.line);
        let X = i === first ? g.left : L > line ? 0 : x + rest.space;
        for (let guard = 0; guard < 8; guard++) {
          if (X > 0 && X + w > rest.width + 0.5) { L++; X = 0; continue; }
          const hit = obstacles.find((o) => L > o.line && band(L).top < o.bottom && band(L).bottom > o.top && X < o.right && X + w > o.left);
          if (!hit) break;
          X = hit.right;
        }
        const dy = band(L).top - band(g.line).top;
        pos[i] = { L, X, dx: X - g.left, dy, ex };
        if (ex > 0.01) {
          const side = 70 * u + ex, top = g.frameTop + dy;
          obstacles.push({ line: L, left: X - rest.space, right: X + side + 0.5 * em, top, bottom: top + side });
          bottom = Math.max(bottom, top + side + 0.5 * em);
        }
        line = L; x = X + w;
      }
      const grown = band(line).bottom - rest.bands.at(-1).bottom;
      return { pos, push: Math.max(0, bottom - rest.followTop, grown) };
    };
    // A word that changes line or jumps more than 2em blurs and returns over .75em (as much as the frame grows) before and after its spot — like the original, it looks ahead in 12 steps
    const fades = (sides, now) => {
      const u = unit(), em = fs(), reach = 0.75 * em, full = 98.4 * u, small = 70 * u;
      const op = groups.map(() => 1);
      let left = 0, gone = 0;
      for (const [s, side] of sides) {
        left = Math.max(left, s.lit ? full - side : side - small);
        gone = Math.max(gone, s.lit ? side - small : full - side);
      }
      for (const dir of [1, -1]) {
        const before = dir > 0 ? gone : left;
        const done = new Set();
        let prev = now;
        for (let k = 1; k <= 12 && done.size < groups.length; k++) {
          const step = new Map([...sides].map(([s, side]) => [s, Math.min(Math.max(side + (s.lit ? 1 : -1) * dir * (k * reach) / 12, small), Math.max(side, full))]));
          const next = layout(step);
          next.pos.forEach((p, i) => {
            const q = prev.pos[i];
            if (done.has(i) || (p.L === q.L && Math.abs(p.X - q.X) <= 2 * em)) return;
            done.add(i);
            const ahead = ((k - 0.5) * reach) / 12;
            op[i] = Math.min(op[i], ahead / Math.min(reach, ahead + before));
          });
          prev = next;
        }
      }
      return op;
    };
    let flowing = false;
    const flow = () => {
      if (!rest) return;
      const sides = new Map();
      for (const s of state) if (s.zoom.value > 1.0005 || s.pop.value > 5e-4) sides.set(s, (70 + 2 * s.pop.value) * s.zoom.value * unit());
      if (!sides.size) { if (flowing) { flowing = false; measure(); } return; }
      flowing = true;
      const now = layout(sides), op = fades(sides, now);
      groups.forEach((g, i) => {
        const { dx, dy, ex } = now.pos[i];
        const o = op[i] < 0.995 ? String(Math.round(op[i] * 100) / 100) : "";
        let after = false;
        for (const e of g.els) {
          const ddx = dx + (after ? ex : 0);
          e.style.transform = Math.abs(ddx) > 0.01 || Math.abs(dy) > 0.01 ? `translate(${ddx.toFixed(2)}px, ${dy.toFixed(2)}px)` : "";
          (e === g.cat?.a ? e.querySelector(".g-cat__label") : e).style.opacity = o;
          if (e === g.cat?.a) after = true;
        }
      });
      const t = now.push > 0.01 ? `translateY(${now.push.toFixed(2)}px)` : "";
      for (const f of follow) f.style.transform = t;
    };
    addEventListener("resize", () => { if (!state.some((s) => s.lit)) rest = null; });
    const tick = (now) => {
      const dt = gsap.utils.clamp(0, 64, now - (last || now));
      last = now;
      let busy = false;
      for (const s of state) {
        busy = s.pop.advance(dt) | busy;
        busy = s.zoom.advance(dt) | busy;
        busy = s.t.advance(dt) | busy;
        apply(s);
        if (s.icon) busy = s.icon.frame(dt, { lit: s.lit, zoom: s.zoom.value, reduced }) | busy;
      }
      flow();
      raf = busy ? requestAnimationFrame(tick) : 0;
      if (!busy) last = 0;
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    document.fonts.ready.then(loadIcons).then((icons) => {
      for (const s of state) {
        const canvas = s.a.querySelector(".g-cat__gl");
        try { s.icon = icons.create(canvas, s.a.dataset.shape); } catch { continue; }
        new ResizeObserver(() => { s.icon.resize(); s.icon.frame(0, { lit: s.lit, zoom: s.zoom.value, reduced }); }).observe(canvas);
        canvas.classList.add("ready");
        s.a.classList.add("gl");
      }
      wake();
    }).catch(() => {});
    const setLit = (s, on) => {
      if (on === s.lit) return;
      if (on && !state.some((o) => o.lit || o.zoom.value > 1.0005)) measure();
      s.lit = on;
      s.a.classList.toggle("lit", on);
      s.pop.to(on ? 6 : 0);
      s.zoom.to(on ? 1.2 : 1);
      s.from = wipe(s); s.to = on ? 0 : 100;
      s.t.set(0); s.t.to(1);
      if (reduced) { for (const k of [s.pop, s.zoom, s.t]) k.set(k.target); apply(s); s.icon?.frame(0, { lit: on, zoom: s.zoom.value, reduced }); flow(); return; }
      wake();
    };
    const inside = (r, x, y) => r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    for (const s of state) {
      let touch = false;
      s.a.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse") return;
        s.hold = s.a.getBoundingClientRect();
        setLit(s, true);
      });
      // When the enlarged frame pushes a word onto the next line, the pointer ends up outside the link — keep it on until it leaves the spot where it entered.
      s.a.addEventListener("pointerleave", (e) => {
        if (e.pointerType !== "mouse") return;
        if (!inside(s.hold, e.clientX, e.clientY)) return setLit(s, false);
        const watch = (ev) => {
          if (inside(s.hold, ev.clientX, ev.clientY) || inside(s.a.getBoundingClientRect(), ev.clientX, ev.clientY)) return;
          removeEventListener("pointermove", watch);
          setLit(s, false);
        };
        addEventListener("pointermove", watch);
      });
      s.a.addEventListener("pointerdown", (e) => (touch = e.pointerType !== "mouse"));
      s.a.addEventListener("click", (e) => {
        if (touch && !s.lit) { e.preventDefault(); setLit(s, true); return; }
        if (reduced || !canShoot || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
        e.preventDefault();
        leave(s.a.href);
      });
      s.a.addEventListener("focus", () => s.a.matches(":focus-visible") && setLit(s, true));
      s.a.addEventListener("blur", () => setLit(s, false));
    }
    addEventListener("pointerdown", (e) => { for (const s of state) if (s.lit && !s.a.contains(e.target) && e.pointerType !== "mouse") setLit(s, false); });
  }

  /* ── Tab underline: slides in over .36s from the tab pressed on the previous page. The original swaps only the panel, so scroll position is left as is ── */
  function initNav(nav) {
    const line = nav.querySelector(".g-nav__line");
    const cur = nav.querySelector("[aria-current=page]");
    const place = (a) => { line.style.translate = `${a.offsetLeft}px`; line.style.width = `${a.offsetWidth}px`; };
    let from = null;
    try { from = JSON.parse(sessionStorage.getItem("g-nav-from") || "null"); sessionStorage.removeItem("g-nav-from"); } catch {}
    if (from) {
      line.style.translate = `${from.left}px`; line.style.width = `${from.width}px`;
      scrollTo(0, from.y);
    } else if (cur) place(cur);
    nav.classList.add("placed");
    if (from && cur) requestAnimationFrame(() => requestAnimationFrame(() => place(cur)));
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a || a === cur) return;
      try { sessionStorage.setItem("g-nav-from", JSON.stringify({ left: cur?.offsetLeft ?? 0, width: cur?.offsetWidth ?? 0, y: scrollY })); } catch {}
    });
    addEventListener("resize", () => cur && place(cur));
  }

  /* ── Avatar: eyes follow the mouse, it startles when the glasses are pulled off, and springs back into place when released ── */
  const glassesSVG = (cls) => {
    const s = el("svg", { class: cls, viewBox: "0 0 55 40", "aria-hidden": "true" }, true);
    s.innerHTML = `<g class="halo"><circle cx="16" cy="21" r="11"/><circle cx="39.5" cy="19.6" r="11"/></g>
      <circle class="rim" cx="16" cy="21" r="11" pathLength="1" style="--i:0"/><circle class="rim" cx="39.5" cy="19.6" r="11" pathLength="1" style="--i:1"/>
      <path class="bridge" d="M24 20Q27.8 17.6 31.6 19.4"/><path class="bridge" d="M5 21.2L2.6 20.4M50.5 19.4L52.8 18.6"/>`;
    return s;
  };
  const avatar = { lensesOnScreen: [], held: false, onMove: null, onRelease: null, el: null };

  function initAvatar(host) {
    const svg = avatarSVG();
    host.append(svg);
    avatar.el = host;
    const eyes = svg.querySelectorAll(".av-eyes circle");
    const glasses = svg.querySelector(".av-glasses");
    addEventListener("pointermove", (e) => {
      if (reduced || html.dataset.intro) return;
      const r = host.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.45);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 300) * 1.6;
      eyes.forEach((c) => c.setAttribute("transform", `translate(${((dx / d) * k).toFixed(2)} ${((dy / d) * k).toFixed(2)})`));
    }, { passive: true });

    let held = null;
    host.addEventListener("pointerdown", (e) => {
      if (html.dataset.intro) return;
      e.preventDefault();
      host.setPointerCapture(e.pointerId);
      const r = glasses.getBoundingClientRect();
      const g = glassesSVG("g-held-glasses");
      document.body.append(g);
      const sx = r.left + r.width / 2, sy = r.top + r.height / 2;
      held = { g, ox: sx - e.clientX, oy: sy - e.clientY, x: sx, y: sy };
      gsap.set(g, { x: sx - 27.5, y: sy - 20, scale: r.width / 55, transformOrigin: "50% 50%" });
      gsap.to(g, { scale: 1, duration: 0.3, ease: "back.out(1.6)" });
      glasses.style.opacity = "0";
      host.classList.add("alarmed");
      avatar.held = true;
      move(e);
    });
    const move = (e) => {
      if (!held) return;
      held.x = e.clientX + held.ox; held.y = e.clientY + held.oy;
      gsap.set(held.g, { x: held.x - 27.5, y: held.y - 20 });
      avatar.lensesOnScreen = [[held.x - 11.5, held.y + 1, 10.5], [held.x + 12, held.y - 0.4, 10.5]];
      avatar.onMove?.();
    };
    host.addEventListener("pointermove", move);
    const release = () => {
      if (!held) return;
      const { g, y } = held;
      held = null;
      avatar.held = false;
      avatar.lensesOnScreen = [];
      avatar.onRelease?.();
      host.classList.remove("alarmed");
      const back = () => { g.remove(); glasses.style.opacity = ""; };
      if (y < 0) {
        g.classList.add("av-glasses", "flown");
        g.style.translate = "0 -120vh";
        setTimeout(() => { back(); gsap.fromTo(glasses, { opacity: 0 }, { opacity: 1, duration: 0.3 }); }, 600);
        return;
      }
      const r = glasses.getBoundingClientRect();
      gsap.to(g, { x: r.left + r.width / 2 - 27.5, y: r.top + r.height / 2 - 20, scale: r.width / 55, duration: reduced ? 0 : 0.4, ease: "back.out(1.4)", onComplete: back });
    };
    host.addEventListener("pointerup", release);
    host.addEventListener("pointercancel", release);
    return svg;
  }

  /* Intro: the pen draws lines one by one (travel between lines is 0.024s + distance/1875), traces the glasses frame, and a brush fills in color, then the text unfolds */
  function playIntro(svg, done) {
    const q = (sel) => svg.querySelector(sel), all = (sel) => [...svg.querySelectorAll(sel)];
    const lines = all(".av-lines path"), strokes = all(".av-strokes path"), eyes = all(".av-eyes circle");
    const pen = q(".av-pen"), brush = q(".av-brush"), tuft = q(".av-brush .tuft");
    gsap.set([...lines, ...strokes], { strokeDasharray: "1 2", strokeDashoffset: 1 });
    gsap.set(eyes, { attr: { r: 0 } });
    gsap.set([q(".av-colour"), q(".av-glasses")], { opacity: 0 });
    // Path the hand (pen, brush) travels — per segment [start, end, 0~1 → position]
    const ease = gsap.parseEase("sine.inOut"), hand = [];
    const tl = gsap.timeline({ paused: true, onComplete: done });
    let t = 0.15, at = null;
    const travelTo = (pt) => {
      if (at) {
        const from = at, d = 0.024 + Math.hypot(pt.x - from.x, pt.y - from.y) / 1875;
        hand.push({ from: t, to: (t += d), point: (k) => ({ x: from.x + (pt.x - from.x) * ease(k), y: from.y + (pt.y - from.y) * ease(k) }) });
      }
    };
    const draw = (p, dur) => {
      const len = p.getTotalLength();
      travelTo(p.getPointAtLength(0));
      tl.fromTo(p, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur(len), ease: "sine.inOut" }, t);
      hand.push({ from: t, to: (t += dur(len)), point: (k) => p.getPointAtLength(len * ease(k)) });
      at = p.getPointAtLength(len);
    };
    tl.to(pen, { opacity: 1, duration: 0.15 }, 0);
    for (const p of lines) draw(p, (len) => 0.13 + len / 375);
    // Eyes are dots stamped by the pen
    for (const c of eyes) {
      const pt = { x: +c.getAttribute("cx"), y: +c.getAttribute("cy") };
      travelTo(pt);
      tl.to(c, { attr: { r: 1.7 }, duration: 0.12, ease: "power2.out" }, t);
      hand.push({ from: t, to: (t += 0.12), point: () => pt });
      at = pt;
    }
    const rest = at;
    hand.push({ from: t, to: t + 0.1, point: () => rest });
    tl.to(pen, { opacity: 0, duration: 0.1 }, t);
    tl.to(brush, { opacity: 1, duration: 0.1 }, t + 0.1);
    t += 0.2;
    at = null;
    strokes.forEach((p) => {
      tl.set(tuft, { fill: `var(--site-${p.classList.contains("hair") ? "hair" : "skin"})` }, t);
      draw(p, (len) => len / 1100);
    });
    // When the brush lifts, clean color and glasses cover the strokes in .2s, then blink once
    tl.to(brush, { opacity: 0, duration: 0.15 }, t);
    tl.to([q(".av-colour"), q(".av-glasses")], { opacity: 1, duration: 0.2 }, t);
    tl.to(q(".av-strokes"), { opacity: 0, duration: 0.2 }, t);
    tl.set(lines, { strokeDasharray: "none" }, t + 0.2);
    t += 0.2 + 0.15;
    eyes.forEach((c) => {
      tl.set(c, { scaleY: 0.12, svgOrigin: `${c.getAttribute("cx")} ${c.getAttribute("cy")}` }, t);
      tl.set(c, { scaleY: 1 }, t + 0.1);
    });
    tl.set({}, {}, t + 0.1 + 0.15);
    tl.eventCallback("onUpdate", () => {
      const now = tl.time(), seg = hand.find((h) => now < h.to) ?? hand.at(-1);
      if (!seg) return;
      const { x, y } = seg.point(gsap.utils.clamp(0, 1, (now - seg.from) / (seg.to - seg.from)));
      gsap.set([pen, brush], { x, y });
    });
    // On any input, finish the remaining animation within .3s
    const skip = () => tl.timeScale(Math.max(1, (tl.duration() - tl.time()) / 0.3));
    for (const ev of ["pointerdown", "keydown", "wheel", "touchmove"]) addEventListener(ev, skip, { passive: true, once: true });
    document.fonts.ready.then(() => tl.play());
  }

  /* ── about panel: diagonal lines, a cipher sentence readable only with glasses ── */
  function initRevision(p) {
    const del = p.querySelector("del"), ins = p.querySelector("ins");
    const svg = el("svg", { class: "g-scratch", "aria-hidden": "true" }, true);
    p.append(svg);
    const draw = () => {
      const base = p.getBoundingClientRect();
      const rects = [...del.getClientRects()], lastR = rects.at(-1), insR = ins.getClientRects()[0];
      const gap = lastR && insR && Math.abs(insR.top - lastR.top) < lastR.height / 2 ? insR.left - lastR.right - 2 : Infinity;
      const tail = Math.max(0, Math.min((lastR?.height ?? 0) * 0.35, gap));
      const total = rects.reduce((s, r) => s + r.width, 0) + tail;
      let run = 0;
      svg.innerHTML = rects.map((r, i) => {
        const w = r.width + (i === rects.length - 1 ? tail : 0), x = r.left - base.left;
        const y = (d) => r.top - base.top + r.height * (0.46 + 0.16 * (run + d) / total);
        const d = `M${x.toFixed(1)} ${y(0).toFixed(1)}L${(x + w).toFixed(1)} ${y(w).toFixed(1)}`;
        run += w;
        return `<path d="${d}"/>`;
      }).join("");
      p.classList.add("drawn");
    };
    document.fonts.ready.then(draw);
    new ResizeObserver(draw).observe(p);
  }

  function initAfterword(p) {
    const real = p.dataset.secret.split(" ");
    const cipher = real.map((w, i) => w.replace(/[가-힣]/g, (c, j) => HANGUL[(c.charCodeAt(0) * 7 + i * 3 + j) % HANGUL.length]));
    p.innerHTML = `<span class="sr-only">${p.dataset.secret}</span><span class="g-after__words" aria-hidden="true">${cipher.map((w) => `<span class="g-w"><span class="cipher">${w}</span></span>`).join(" ")}</span><span class="g-after__through" aria-hidden="true">${real.map((w) => `<span class="g-w">${w}</span>`).join(" ")}</span>`;
    const wordsEl = [...p.querySelectorAll(".g-after__words > .g-w")];
    const through = p.querySelector(".g-after__through");
    const throughWords = [...through.children];
    through.style.visibility = "hidden";
    let read = false, seen = new Set(), pointer = null, timer = 0;
    const run = (els, texts, opt = {}) => {
      const tl = gsap.timeline();
      let chars = 0;
      els.forEach((e, i) => {
        const w = e.getBoundingClientRect().width, txt = texts[i];
        const o = opt.calm ? { reveal: 0.9, flicker: 0.14 } : { delay: chars / 40, reveal: txt.length / 40 };
        chars += txt.length + 1;
        tl.add(decodeSpan(e, txt, { width: w, settle: opt.settle || "", ...o }), 0);
      });
      if (reduced) tl.progress(1);
      return tl;
    };
    const showPointer = (on, e) => {
      if (on && !pointer) { pointer = glassesSVG("g-glasses-pointer"); pointer.insertAdjacentHTML("beforeend", '<g class="query"><path d="M27 6.5Q27 2 30.4 2.2Q33.4 2.6 32.6 5.4Q32 7 30 8.2V10"/><path class="point" d="M30 13h0"/></g>'); document.body.append(pointer); p.classList.add("pointing"); }
      if (!on && pointer) { pointer.remove(); pointer = null; p.classList.remove("pointing"); }
      if (pointer && e) pointer.style.translate = `${e.clientX - 20}px ${e.clientY - 20}px`;
    };
    p.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "touch" || read) return;
      p.classList.add("hovered");
      avatar.el?.classList.add("wondering");
      showPointer(!avatar.held, e);
      run(wordsEl, cipher, { settle: "cipher" });
    });
    p.addEventListener("pointermove", (e) => e.pointerType === "mouse" && pointer && showPointer(true, e));
    p.addEventListener("pointerleave", () => { p.classList.remove("hovered"); avatar.el?.classList.remove("wondering"); showPointer(false); });
    const unread = () => { clearTimeout(timer); read = false; run(wordsEl, cipher, { settle: "cipher" }); };
    // Only where the glasses lens has passed does the real text show
    avatar.onMove = () => {
      if (read) return;
      const lenses = avatar.lensesOnScreen, base = p.getBoundingClientRect();
      if (!lenses.length) { through.style.visibility = "hidden"; return; }
      through.style.visibility = "";
      const mask = lenses.map(([x, y, r]) => `radial-gradient(circle ${r}px at ${(x - base.left).toFixed(1)}px ${(y - base.top).toFixed(1)}px, currentColor ${r - 0.5}px, transparent ${r}px)`).join(", ");
      through.style.maskImage = through.style.webkitMaskImage = mask;
      throughWords.forEach((w, i) => {
        if (seen.has(i)) return;
        const r = w.getBoundingClientRect();
        if (lenses.some(([x, y, rad]) => x + rad > r.left && x - rad < r.right && y + rad > r.top && y - rad < r.bottom)) {
          seen.add(i);
          run([w], [real[i]], { calm: true });
        }
      });
    };
    avatar.onRelease = () => {
      through.style.visibility = "hidden";
      if (read || !seen.size) return;
      read = true;
      seen = new Set();
      run(wordsEl, real);
      timer = setTimeout(unread, 180 * 1000);
    };
  }

  /* ── Start ── */
  document.addEventListener("DOMContentLoaded", () => {
    const host = document.querySelector("[data-shared=intro]");
    if (!host) return;
    renderIntro(host);
    const lede = host.querySelector(".g-lede");
    const svg = initAvatar(lede.querySelector(".g-avatar"));
    initCats(lede);
    initNav(host.querySelector(".g-nav"));
    document.querySelectorAll(".g-rev").forEach(initRevision);
    document.querySelectorAll(".g-after[data-secret]").forEach(initAfterword);
    document.querySelectorAll("[data-avatar-mini]").forEach((n) => n.append(avatarSVG({ mini: true })));

    // If arriving via a transition, lay the WebGL paper over the still cover (same picture) that the head script put down, and roll it away
    if (html.dataset.curl !== undefined) {
      const cover = () => delete html.dataset.curl;
      setTimeout(cover, 4000);
      loadCurl(false).then((c) => c.play(window.gCurlShot, cover)).catch(cover);
    }
    // Like the original, capture once after 2s idle — snapdom preloads fonts and images so the capture after a press is fast
    if (!reduced && canShoot) setTimeout(function warm() {
      if (html.dataset.intro) return setTimeout(warm, 1000);
      loadCurl(true).then((c) => c.capture()).catch(() => {});
    }, 2000);

    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      if (ctx.conditions.still || html.dataset.intro !== "hold") { delete html.dataset.intro; return; }
      html.dataset.intro = "drawing";
      playIntro(svg, () => {
        html.dataset.intro = "reveal";
        decode([...document.querySelectorAll("[data-reveal]")]).eventCallback("onComplete", () => {
          if (html.dataset.intro === "reveal") delete html.dataset.intro;
        });
      });
    });
  });
})();
