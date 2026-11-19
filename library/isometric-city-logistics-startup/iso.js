// Redraws the isometric logistics city of the hero and contact in SVG — instead of the original image file, the same composition (a band running lower left → upper right), the same two color families (purple·blue) and black outlines.
// Movements use original values as is: drone up and down 3.6s ease-in-out (amplitude 10 × screen width/1440), robot walk 6s linear (sine 8.7·5 + 6× sine 1.5),
// Floating pieces of the glass sphere and robot hand props follow the original embed’s keyframes exactly (length, delay, height per piece, ease-in-out back and forth).
// Colors are painted with var() of --site-iso-* in shared.css so changing the skin changes them too.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const INK = "var(--kf-ink)";
  const WHITE = "var(--kf-surface)";
  const GLASS = "color-mix(in srgb, var(--kf-surface) 70%, transparent)";
  const V = (n) => `var(--site-iso-v${n})`;
  const B = (n) => `var(--site-iso-b${n})`;
  const W = (n) => `var(--site-lavender-${n})`;
  const PAL = {
    violet: [V(1), V(2), V(3)],
    deep: [V(2), V(3), V(4)],
    blue: [B(1), B(2), B(3)],
    sky: [B(2), B(3), B(4)],
    white: [WHITE, W(1), W(5)],
  };
  const seeded = (s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;

  function build(host, o) {
    const rnd = seeded(o.seed);
    const pick = (a) => a[Math.floor(rnd() * a.length)];
    const hw = o.tile / 2;
    const hh = o.tile / 4;
    const P = (i, j, z) => [o.ox + (i - j) * hw, o.oy + (i + j) * hh - z];
    const pts = (a) => a.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
    const items = [];
    let out = "";
    const poly = (a, fill, sw = 2) => `<polygon points="${pts(a)}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;

    // One box: top face, left front face (+j side), right front face (+i side)
    const box = (i, j, w, d, h, z, pal, deco = "") => {
      const t = z + h;
      let s = poly([P(i, j + d, z), P(i + w, j + d, z), P(i + w, j + d, t), P(i, j + d, t)], pal[1]);
      s += poly([P(i + w, j, z), P(i + w, j + d, z), P(i + w, j + d, t), P(i + w, j, t)], pal[2]);
      if (deco === "grid" || deco === "stripe") s += faces(i, j, w, d, h, z, deco);
      s += poly([P(i, j, t), P(i + w, j, t), P(i + w, j + d, t), P(i, j + d, t)], pal[0]);
      return s;
    };
    // Wall pattern: a window grid or the original’s black vertical stripes
    const faces = (i, j, w, d, h, z, deco) => {
      let s = "";
      const rows = Math.max(1, Math.floor((h - 12) / 22));
      if (deco === "stripe") {
        for (let k = 0.12; k < d - 0.08; k += 0.2) s += poly([P(i + w, j + k, z + 6), P(i + w, j + k + 0.09, z + 6), P(i + w, j + k + 0.09, z + h - 6), P(i + w, j + k, z + h - 6)], INK, 0);
        for (let r = 0; r < rows; r++) s += poly([P(i + 0.12, j + d, z + 10 + r * 22), P(i + w - 0.12, j + d, z + 10 + r * 22), P(i + w - 0.12, j + d, z + 18 + r * 22), P(i + 0.12, j + d, z + 18 + r * 22)], WHITE, 1.2);
        return s;
      }
      for (let r = 0; r < rows; r++) {
        const zz = z + 10 + r * 22;
        for (let k = 0.14; k < w - 0.1; k += 0.26) s += poly([P(i + k, j + d, zz), P(i + k + 0.14, j + d, zz), P(i + k + 0.14, j + d, zz + 12), P(i + k, j + d, zz + 12)], WHITE, 1.2);
        for (let k = 0.14; k < d - 0.1; k += 0.26) s += poly([P(i + w, j + k, zz), P(i + w, j + k + 0.14, zz), P(i + w, j + k + 0.14, zz + 12), P(i + w, j + k, zz + 12)], PAL.white[2], 1.2);
      }
      return s;
    };
    const pin = (x, y, c) => `<g transform="translate(${x.toFixed(1)} ${(y - 30).toFixed(1)})"><path d="M0 26C-9 14-11 9-11 4a11 11 0 0 1 22 0c0 5-2 10-11 22Z" fill="${c}" stroke="${INK}" stroke-width="2"/><circle cy="3" r="4" fill="${WHITE}" stroke="${INK}" stroke-width="1.5"/></g>`;
    const dome = (x, y) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><ellipse rx="16" ry="8" fill="${PAL.white[1]}" stroke="${INK}" stroke-width="2"/><path d="M-14 0a14 14 0 0 1 28 0" fill="${PAL.blue[0]}" fill-opacity=".8" stroke="${INK}" stroke-width="2"/><path d="M-6 -9a10 10 0 0 1 8-3" fill="none" stroke="${WHITE}" stroke-width="2"/></g>`;
    const gear = (x, y, r) => {
      let d = "";
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        d += `<rect x="-3" y="${-r - 4}" width="6" height="8" transform="rotate(${(a * 180) / Math.PI})" />`;
      }
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(1 .58) rotate(30)" fill="${PAL.deep[1]}" stroke="${INK}" stroke-width="1.5">${d}<circle r="${r}"/><circle r="${r * 0.42}" fill="${WHITE}"/></g>`;
    };

    // One cell: building, stairs, road or empty ground on a white base plate
    for (let i = -30; i < 60; i++) {
      for (let j = -30; j < 60; j++) {
        const [x, y] = P(i + 0.5, j + 0.5, 0);
        if (x < o.tile * 0.5 || x > o.w - o.tile * 0.5 || y < o.tile * 0.3 || y > o.h - o.tile * 0.2) continue;
        const [ax, ay, bx, by] = o.band;
        const len = Math.hypot(bx - ax, by - ay);
        const dist = Math.abs((bx - ax) * (ay - y) - (ax - x) * (by - ay)) / len;
        const along = ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / (len * len);
        const half = o.width * (0.75 + 0.25 * Math.sin(along * 9 + o.seed));
        if (dist > half || along < -0.02 || along > 1.02) continue;
        if ((o.holes || []).some(([x0, y0, x1, y1]) => x > x0 && x < x1 && y > y0 && y < y1)) continue;
        items.push({ i, j, k: i + j, core: 1 - dist / half, x, y });
      }
    }
    items.sort((a, b) => a.k - b.k || a.i - b.i);
    const center = o.center;
    items.forEach((c) => {
      const { i, j } = c;
      const r = rnd();
      let s = box(i, j, 1, 1, 10, 0, r < 0.08 ? PAL.sky : PAL.white);
      const inCore = center && i >= center[0] && i <= center[0] + 1 && j >= center[1] && j <= center[1] + 1;
      // The big center building must be raised after all of the 2×2 floor tiles are laid (on the front cell’s turn), so the front cell floor doesn’t cover the wall
      if (inCore && !(i === center[0] + 1 && j === center[1] + 1)) { out += `<g>${s}</g>`; return; }
      if (inCore) {
        const [ci, cj] = center;
        s += box(ci + 0.05, cj + 0.05, 1.9, 1.9, o.tall, 10, PAL.deep, "grid");
        const t = 10 + o.tall;
        s += poly([P(ci + 0.6, cj + 1.95, t - 40), P(ci + 0.95, cj + 1.95, t - 40), P(ci + 0.5, cj + 1.95, 40), P(ci + 0.15, cj + 1.95, 40)], PAL.violet[0], 2);
        const m = P(ci + 0.5, cj + 1.95, t - 70);
        s += `<text x="${m[0]}" y="${m[1]}" style="font-family: var(--site-font-latin)" font-size="${o.tile * 0.42}" font-weight="300" fill="${PAL.violet[0]}" transform="skewY(26.6)" transform-origin="${m.join(" ")}">000</text>`;
        if (!o.globe) s += dome(...P(ci + 1, cj + 1, t));
        out += `<g>${s}</g>`;
        return;
      }
      if (r < 0.2) { out += `<g>${s}</g>`; return; }
      if (r < 0.32) {
        // Stairs: white treads + black risers alternate into stripes
        const n = 6;
        for (let k = 0; k < n; k++) s += box(i + k / n, j + 0.12, 1 / n, 0.76, 10 + (n - k) * 13, 10, [WHITE, INK, WHITE]);
        out += `<g>${s}</g>`;
        return;
      }
      const pal = pick([PAL.violet, PAL.violet, PAL.deep, PAL.blue, PAL.blue, PAL.sky, PAL.white]);
      const h = 26 + Math.round(rnd() * (60 + c.core * o.lift));
      const deco = pick(["grid", "grid", "stripe", ""]);
      const inset = pick([0.08, 0.14, 0.2]);
      s += box(i + inset, j + inset, 1 - inset * 2, 1 - inset * 2, h, 10, pal, deco);
      const t = 10 + h;
      const [tx, ty] = P(i + 0.5, j + 0.5, t);
      const extra = rnd();
      if (extra < 0.18) s += pin(tx, ty, pick([PAL.blue[1], PAL.sky[1]]));
      else if (extra < 0.3) s += dome(tx, ty);
      else if (extra < 0.45) s += box(i + 0.3, j + 0.3, 0.4, 0.4, 14, t, pick([PAL.white, PAL.blue, PAL.violet]), "");
      else if (extra < 0.52) s += gear(...P(i + 1 - inset, j + 0.5, 10 + h / 2), o.tile * 0.12);
      out += `<g>${s}</g>`;
    });

    host.insertAdjacentHTML("beforeend", `<svg class="iso__svg" viewBox="0 0 ${o.w} ${o.h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${out}</svg>`);
  }

  // Original initKvAnims: re-bake the drone float and robot walk keyframes by screen-width ratio
  function bake() {
    const kvS = innerWidth / 1440;
    const amp = 10 * kvS;
    let css = `@keyframes t7DroneFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(${-amp}px)}}`;
    const PI2 = Math.PI * 2;
    [[1, 1], [-1, 0.6]].forEach(([dir, scale], ci) => {
      let frames = "";
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const s = Math.sin(t * PI2);
        const b = Math.sin(t * PI2 * 6);
        frames += `${((i / 60) * 100).toFixed(2)}%{transform:translate(${(s * 8.7 * dir * scale * kvS).toFixed(2)}px,${((s * 5 * scale + b * 1.5) * kvS).toFixed(2)}px)}`;
      }
      css += `@keyframes t7RoboWalk${ci}{${frames}}`;
    });
    let st = document.getElementById("t7-kv-anim");
    if (!st) { st = document.createElement("style"); st.id = "t7-kv-anim"; document.head.append(st); }
    st.textContent = css;
  }

  const drone = `<svg viewBox="0 0 80 60"><g stroke="${INK}" stroke-width="2"><path d="M14 18h20M46 18h20" /><ellipse cx="14" cy="14" rx="12" ry="3" fill="${WHITE}"/><ellipse cx="66" cy="14" rx="12" ry="3" fill="${WHITE}"/><path d="M14 18v8M66 18v8" /><path d="M24 24h32l-6 12H30Z" fill="${PAL.violet[1]}"/><path d="M30 36h20v6H30Z" fill="${PAL.white[1]}"/><path d="M36 42v8M44 42v8" /><path d="M32 50h16l-2 10H34Z" fill="${PAL.blue[1]}"/></g></svg>`;
  const robo = `<svg viewBox="0 0 64 72"><g stroke="${INK}" stroke-width="2" stroke-linejoin="round"><path d="M18 46l-6 22h10l6-18M46 46l6 22H42l-6-18" fill="${PAL.white[1]}"/><path d="M14 22h36v28H14Z" fill="${PAL.blue[1]}"/><path d="M50 22l8-6v28l-8 6Z" fill="${PAL.sky[2]}"/><path d="M14 22l8-6h36l-8 6Z" fill="${PAL.blue[0]}"/><path d="M22 4h20v14H22Z" fill="${WHITE}"/><circle cx="28" cy="11" r="2.5" fill="${INK}"/><circle cx="36" cy="11" r="2.5" fill="${INK}"/></g></svg>`;

  // Isometric box (top rhombus + two front faces). Floating pieces bob upward by a percentage of the picture width, like the original embed — units are relative to the viewBox width
  const cube = (x, y, a, top, left, right) => {
    const h = a * 0.87;
    return `<path d="M${x} ${y - a}l${h} ${a / 2}-${h} ${a / 2}-${h} ${-a / 2}Z" fill="${top}"/><path d="M${x - h} ${y - a / 2}l${h} ${a / 2}v${a}l${-h} ${-a / 2}Z" fill="${left}"/><path d="M${x} ${y}l${h} ${-a / 2}v${a}l${-h} ${a / 2}Z" fill="${right}"/>`;
  };
  const float = (vw, width, dur, delay, body) =>
    `<g class="iso__f" style="--fd:${dur}s;--fdl:${delay}s;--fy:${(-vw * width / 100).toFixed(3)}px">${body}</g>`;
  const slab = (x, y, rx, ry, d, top, side) =>
    `<path d="M${x - rx} ${y}v${d}a${rx} ${ry} 0 0 0 ${rx * 2} 0v${-d}" fill="${side}"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${top}"/>`;
  // Glass-sphere stand + box machine + four floating cubes (original embed 161×146 · pieces 2.0/1.6/2.3/1.9s · delays -.4/-1/-.2/-.8s · heights 3/4/2.5/4.5vw)
  const globe = `<svg viewBox="0 0 161 146"><g stroke="${INK}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
    ${slab(42, 124, 38, 17, 8, INK, INK)}${slab(42, 112, 36, 16, 12, B(3), B(3))}<path d="M30 126v-12M36 127v-12M58 126v-12" fill="none" stroke="${WHITE}"/>${slab(42, 104, 33, 14, 8, V(2), V(2))}${slab(42, 97, 30, 12, 6, WHITE, WHITE)}
    <circle cx="42" cy="58" r="40" fill="${GLASS}"/><ellipse cx="42" cy="58" rx="40" ry="14" fill="none"/><ellipse cx="42" cy="58" rx="16" ry="40" fill="none"/><path d="M42 18v80" fill="none"/>
    <circle cx="26" cy="28" r="3.3" fill="${V(1)}"/><circle cx="58" cy="28" r="3.3" fill="${B(2)}"/><circle cx="22" cy="80" r="3.3" fill="${B(2)}"/><circle cx="62" cy="80" r="3.3" fill="${V(1)}"/>
    ${float(3, 161, 2.0, -0.4, cube(42, 58, 14, B(1), V(1), WHITE))}
    <path d="M120 112l30-16v10l-30 16-30-16v-10Z" fill="${INK}"/><path d="M90 96l30 16v12l-30-16Z" fill="${B(2)}"/><path d="M120 112l30-16v12l-30 16Z" fill="${V(2)}"/><path d="M120 80l30 16-30 16-30-16Z" fill="${WHITE}"/><path d="M120 88l16 8-16 8-16-8Z" fill="${B(2)}"/>
    <path d="M95 104v6M99 106v6M103 108v6" fill="none"/><circle cx="138" cy="111" r="1.6" fill="${INK}"/><circle cx="142" cy="109" r="1.6" fill="${INK}"/>
    <path d="M104 92 96 56M136 92l4-58" fill="none"/>
    ${float(4, 161, 1.6, -1.0, cube(120, 90, 9, B(1), V(2), WHITE))}
    ${float(2.5, 161, 2.3, -0.2, cube(112, 34, 10, B(1), V(2), WHITE))}
    ${float(4.5, 161, 1.9, -0.8, cube(136, 14, 10, B(2), V(2), WHITE))}
  </g></svg>`;
  // Glass box machine + robot hand coming down from above (original embed 105×152 · pieces 2.1/1.7s · delay -.5/-1.1s · height 3.2/4vw)
  const panel = `<svg viewBox="0 0 105 152"><g stroke="${INK}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
    <path d="M52 140l46-26v8l-46 26-46-26v-8Z" fill="${INK}"/><path d="M6 108l46 26v12L6 120Z" fill="${B(3)}"/><path d="M52 134l46-26v12l-46 26Z" fill="${B(1)}"/><path d="M52 84l46 24-46 26-46-26Z" fill="${INK}"/>
    <path d="M14 114v6M18 116v6M22 118v6" fill="none" stroke="${WHITE}"/><circle cx="76" cy="129" r="2" fill="${B(2)}"/><circle cx="82" cy="126" r="2" fill="${B(2)}"/><circle cx="88" cy="123" r="2" fill="${B(2)}"/>
    <path d="M52 92l30 16-30 16-30-16Z" fill="${B(1)}"/>
    <path d="M22 108V58l30 16v50ZM52 74l30-16v50l-30 16Z" fill="${GLASS}"/><path d="M22 58l30-16 30 16-30 16Z" fill="none"/>
    ${float(4, 104.832, 1.7, -1.1, cube(52, 102, 12, WHITE, V(1), B(1)))}
    ${float(3.2, 104.832, 2.1, -0.5, `<path d="M58 6c10-6 22-4 26 6s-4 22-14 26L50 46c-6 3-12 0-12-6l2-6Z" fill="${V(1)}"/><path d="M66 10c8-4 15 0 15 8s-6 14-12 16" fill="none" stroke-width="3" stroke="${V(3)}"/><path d="M40 34l-18 8c-4 2-4 7 0 8l10-3M44 40l-16 10c-3 2-2 6 1 7l12-5M48 44l-12 12c-2 3 0 6 3 6l12-8M30 30l-14 2c-4 1-4 6 0 7l14-1" fill="${V(1)}"/>`)}
  </g></svg>`;

  window.T7 = window.T7 || {};
  window.T7.iso = (host, kind) => {
    const hero = kind === "hero";
    const o = hero
      ? { seed: 207, w: 1382, h: 1296, tile: 112, ox: 691, oy: -360, band: [60, 1300, 1330, 60], width: 360, lift: 150, tall: 330, globe: true, center: [14, 15], holes: [[0, 0, 560, 380], [720, 0, 1382, 150]] }
      : { seed: 31, w: 600, h: 420, tile: 96, ox: 300, oy: -120, band: [60, 400, 560, 40], width: 150, lift: 90, tall: 220, globe: true, center: [8, 7] };
    build(host, o);
    // Spot for moving props: art coordinates as %
    const at = (x, y, w, html, cls) => host.insertAdjacentHTML("beforeend",
      `<div class="iso__actor ${cls}" style="left:${(x / o.w * 100).toFixed(2)}%;top:${(y / o.h * 100).toFixed(2)}%;width:${(w / o.w * 100).toFixed(2)}%">${html}</div>`);
    // The Contact image also has a glass-sphere prop (same embed) standing on top of the central building, like the original
    if (!hero) { at(263, -53, 140, globe, "is-globe"); return; }
    bake();
    let t;
    addEventListener("resize", () => { clearTimeout(t); t = setTimeout(bake, 200); });
    at(553, 40, 164, globe, "is-globe");
    at(276, 457, 104, panel, "is-panel");
    at(604, 622, 80, drone, "is-drone");
    at(341, 1126, 80, drone, "is-drone is-late");
    at(725, 363, 64, robo, "is-robo is-r0");
    at(480, 470, 64, robo, "is-robo is-r1");
  };
})();
