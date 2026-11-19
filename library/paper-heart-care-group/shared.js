// Common to all pages: draws in the icon set (heart, mascot, heart-chan), header, mega menu, phone drawer, bottom-right mascot button, corporate link strip, recruit strip and footer,
// Hooks up the text-split entrance, the ‹tap-tap› shake entrance, and the page header heart.
// Original values: mega menu spring .6s (delay .08s) · header shrink .64s out-quart · drawer .6s out-quart · shake steps(2) ±5° ·
// Header title letters yPercent 80→0 .8s stagger .05 back.inOut(2)∘sine.out · section title letters 50ms stagger.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("gleasing", "0.4,0,0,1");
  const sineOut = gsap.parseEase("sine.out");
  const backIO3 = gsap.parseEase("back.inOut(3)");
  const backIO2 = gsap.parseEase("back.inOut(2)");
  const NH = (window.NH = {
    reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
    pc: () => matchMedia("(min-width: 768px)").matches,
    ease: {
      doubleSineOut: (t) => sineOut(sineOut(t)),
      sineOutBackInOut: (t) => backIO3(sineOut(t)),
      sineOutBackInOut2: (t) => backIO2(sineOut(t)),
    },
  });
  const page = document.body.dataset.page || "home";

  // Artwork painted on canvas resolves skin variables to real colors. Painting the computed color on a 1px canvas and reading it back turns oklch(from …) and color-mix into rgb too
  const probe = document.createElement("i");
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  NH.rgb = (name) => {
    probe.style.color = `var(${name})`;
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = c;
    px.fillRect(0, 0, 1, 1);
    return [...px.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  };
  NH.css = (name) => `rgb(${NH.rgb(name).join(" ")})`;

  // ---------- Lottie: runs on the same lottie-web 5.12.2 as the original, but the artwork is rebuilt as shape layers of our own symbols (leaf mascot · heart mascot) ----------
  // The original JSON isn’t used — only board size, 24 frames per second, frame count and playback mode (loop, speed, range, scroll link) match the original.
  const LT = (() => {
    const K = (k) => ({ a: 0, k });
    const EASE = { io: [0.333, 0, 0.667, 1], lin: [0, 0, 1, 1], out: [0.22, 1, 0.36, 1], back: [0.34, 1.56, 0.64, 1] };
    // [[section, value, curve?], …] → animated value. A curve runs from that section to the next
    const A = (keys) => ({ a: 1, k: keys.map(([t, v, e = "io"], i) => {
      const s = [].concat(v);
      if (i === keys.length - 1) return { t, s };
      const [ox, oy, ix, iy] = EASE[e];
      return { t, s, o: { x: ox, y: oy }, i: { x: ix, y: iy } };
    }) });
    const val = (v) => (Array.isArray(v) && Array.isArray(v[0]) ? A(v) : K(v));
    // SVG path (M·L·H·V·C·Z, upper and lower case) → several Lottie shapes
    const path = (d) => {
      const out = []; let cur = null, x = 0, y = 0, sx = 0, sy = 0;
      const toks = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g); let i = 0, cmd = "";
      const num = () => Number(toks[i++]);
      const start = (nx, ny) => { cur = { c: false, v: [[nx, ny]], i: [[0, 0]], o: [[0, 0]] }; out.push(cur); x = sx = nx; y = sy = ny; };
      const lineTo = (nx, ny) => { cur.v.push([nx, ny]); cur.i.push([0, 0]); cur.o.push([0, 0]); x = nx; y = ny; };
      while (i < toks.length) {
        if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
        const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
        if (C === "M") { const nx = num() + (rel && cur ? x : 0), ny = num() + (rel && cur ? y : 0); start(nx, ny); cmd = rel ? "l" : "L"; }
        else if (C === "L") { const nx = num() + (rel ? x : 0), ny = num() + (rel ? y : 0); lineTo(nx, ny); }
        else if (C === "H") lineTo(num() + (rel ? x : 0), y);
        else if (C === "V") lineTo(x, num() + (rel ? y : 0));
        else if (C === "C") {
          const b = rel ? [x, y] : [0, 0];
          const c1 = [num() + b[0], num() + b[1]], c2 = [num() + b[0], num() + b[1]], e = [num() + b[0], num() + b[1]];
          cur.o[cur.o.length - 1] = [c1[0] - x, c1[1] - y];
          cur.v.push(e); cur.i.push([c2[0] - e[0], c2[1] - e[1]]); cur.o.push([0, 0]); x = e[0]; y = e[1];
        } else if (C === "Z") {
          const n = cur.v.length - 1;
          if (n > 0 && Math.abs(cur.v[n][0] - sx) < 0.01 && Math.abs(cur.v[n][1] - sy) < 0.01) { cur.i[0] = cur.i[n]; cur.v.pop(); cur.i.pop(); cur.o.pop(); }
          cur.c = true; x = sx; y = sy;
        } else i++;
      }
      return out.map((ks) => ({ ty: "sh", ks: K(ks) }));
    };
    const col = (name) => [...NH.rgb(name).map((v) => v / 255), 1];
    const fill = (name) => ({ ty: "fl", c: K(col(name)), o: K(100), r: 1 });
    const stroke = (name, w) => ({ ty: "st", c: K(col(name)), o: K(100), w: K(w), lc: 2, lj: 2 });
    const tr = ({ p = [0, 0], a = [0, 0], s = [100, 100], r = 0, o = 100 } = {}) => ({ ty: "tr", p: val(p), a: val(a), s: val(s), r: val(r), o: val(o), sk: K(0), sa: K(0) });
    const el = (cx, cy, rx, ry) => ({ ty: "el", d: 1, p: K([cx, cy]), s: K([rx * 2, ry * 2]) });
    const g = (items, t) => ({ ty: "gr", it: [...items, tr(t)] });
    let ind = 0;
    // One layer — set the anchor (a) as the rotation axis and the position (p) to the same value so it lands at the picture’s coordinates as-is
    const layer = (nm, shapes, { a = [0, 0], p, r = 0, s = [100, 100], o = 100, parent, op = 9999 } = {}) => {
      const L = { ddd: 0, ind: ++ind, ty: 4, nm, sr: 1, ao: 0, ip: 0, op, st: 0, bm: 0, shapes,
        ks: { o: val(o), r: val(r), p: val(p ?? a), a: K(a), s: val(s) } };
      if (parent) L.parent = parent;
      return L;
    };
    const comp = (w, h, op, layers) => ({ v: "5.12.2", fr: 24, ip: 0, op, w, h, nm: "nh", ddd: 0, assets: [], layers: layers.reverse().map((l) => ({ ...l, op })) });

    // Leaf mascot head (leaf body · face) — 120×112 drawing coordinates
    const nkunHead = (eyes = K([100, 100])) => [
      g([...path("M66 22c2-9 9-16 19-20"), stroke("--kf-ink", 3)]),
      g([...path("M80 6c6-5 13-5 17-2-4 5-11 7-17 2z"), fill("--kf-ink")]),
      g([...path("M58 18c14-4 33 0 42 12 9 11 9 28 2 40-8 14-25 20-42 20-18 0-34-6-42-19-7-12-6-29 3-40 9-10 22-10 37-13z"), fill("--site-green")]),
      g([...path("M30 34c4-3 9-2 12 1M86 30c4 1 7 5 7 9"), stroke("--site-green-deep", 2.4)]),
      g([el(60, 56, 23, 19), fill("--site-paper")]),
      { ty: "gr", it: [el(51, 52, 3.4, 4.2), fill("--kf-ink"), { ...tr({ p: [51, 52], a: [51, 52] }), s: eyes }] },
      { ty: "gr", it: [el(69, 52, 3.4, 4.2), fill("--kf-ink"), { ...tr({ p: [69, 52], a: [69, 52] }), s: eyes }] },
      g([...path("M55 61c2 3 8 3 10 0"), stroke("--kf-ink", 2.2)]),
      g([el(44, 62, 4, 2.4), fill("--site-pink-cheek")]),
      g([el(76, 62, 4, 2.4), fill("--site-pink-cheek")]),
    ];
    const limb = (d, w = 3) => [...path(d), stroke("--kf-ink", w)];
    const heart = "M32 48C22 41 6 33 4 20 3 10 10 3 18 3c7 0 11 4 14 9 3-5 8-9 15-9 9 0 15 8 13 18-3 13-18 20-28 27z";
    // Heart mascot — 64×58 artwork coordinates
    const chan = () => [
      g([...path(heart), fill("--site-yellow")]),
      g([el(25, 22, 2.2, 2.2), fill("--kf-ink")]), g([el(39, 22, 2.2, 2.2), fill("--kf-ink")]),
      g([...path("M28 28c2 2 6 2 8 0"), stroke("--kf-ink", 1.8)]),
      g([...path("M27 46l-2 9M37 46l2 9"), stroke("--kf-ink", 2.2)]),
    ];
    const swing = (n, amp, step, e = "io") => Array.from({ length: n + 1 }, (_, k) => [k * step, k % 2 ? -amp : amp, e]);

    const make = {
      // Fixed button body 140×120 · 48 frames repeating — two steps (legs and arms swing alternately, the body lifts 1.5 each step)
      body: () => { ind = 0; return comp(140, 120, 48, [
        layer("torso", [g([...path("M50 88h20l-2 12H52z"), fill("--kf-ink")])], { a: [60, 94], p: [[0, [70, 98]], [6, [70, 96.5]], [12, [70, 98]], [18, [70, 96.5]], [24, [70, 98]], [30, [70, 96.5]], [36, [70, 98]], [42, [70, 96.5]], [48, [70, 98]]] }),
        layer("legL", [g(limb("M53 100l-3 8")), g([el(49, 109, 5, 2.6), fill("--kf-ink")])], { a: [53, 100], p: [63, 104], r: swing(4, 18, 12) }),
        layer("legR", [g(limb("M67 100l3 8")), g([el(71, 109, 5, 2.6), fill("--kf-ink")])], { a: [67, 100], p: [77, 104], r: swing(4, -18, 12) }),
        layer("armL", [g(limb("M50 91l-9 6"))], { a: [50, 91], p: [60, 95], r: swing(4, -14, 12) }),
        layer("armR", [g(limb("M70 91l9 6"))], { a: [70, 91], p: [80, 95], r: swing(4, 14, 12) }),
      ]); },
      // Pinned button head 140×120 · 48 frames — frames 0~16 nod the head down while closing the eyes and smiling (as in the original, 0→16 on hover, 16→0 on leave)
      head: () => { ind = 0; return comp(140, 120, 48, [
        layer("head", nkunHead(A([[0, [100, 100]], [8, [100, 100]], [16, [110, 18]], [40, [110, 18]], [48, [100, 100]]])), { a: [60, 88], p: [70, 92], r: [[0, 0, "out"], [16, -12], [40, -12, "io"], [48, 0]] }),
      ]); },
      // Hug 90×106 · 24 frames — in frames 0 to 12 the leaf mascot and heart buddy lean toward each other and embrace, in frames 12 to 24 they hold tight and then release
      hug: () => { ind = 0; return comp(90, 106, 24, [
        layer("kun", [...nkunHead(), g([...path("M50 88h20l-2 12H52z"), fill("--kf-ink")]), g(limb("M53 100l-3 8M67 100l3 8"))], { a: [60, 106], p: [[0, [30, 104]], [12, [38, 104]], [24, [38, 104]]], s: [[0, [52, 52]], [12, [52, 52]], [18, [55, 49]], [24, [52, 52]]], r: [[0, 0], [12, 12], [24, 12]] }),
        layer("chan", chan(), { a: [32, 56], p: [[0, [70, 104]], [12, [60, 104]], [24, [60, 104]]], s: [[0, [62, 62]], [12, [62, 62]], [18, [66, 58]], [24, [62, 62]]], r: [[0, 0], [12, -14], [24, -14]] }),
        layer("arm", [g(limb("M0 0c6-6 14-6 18 0", 2.6))], { a: [9, 0], p: [[0, [44, 82]], [12, [52, 78]], [24, [52, 78]]], o: [[0, 0], [8, 0], [12, 100], [24, 100]] }),
      ]); },
      // Newsletter header heart mascot 100×120 · 48 frames — pops up and stands (0~12), scribbles with a pencil (14~40), then stops
      pencil: () => { ind = 0; return comp(100, 120, 48, [
        layer("chan", chan(), { a: [32, 56], p: [[0, [50, 140], "back"], [12, [50, 112]], [48, [50, 112]]], s: [[0, [130, 130]], [12, [150, 146], "back"], [16, [140, 140]], [48, [140, 140]]], r: [[0, 0], [14, -4], [20, 4], [26, -4], [32, 4], [38, -4], [44, 0]] }),
        layer("pencil", [g([...path("M0 0l18-18 4 4-18 18z"), fill("--site-orange")]), g([...path("M0 0l4 4-6 2z"), fill("--kf-ink")])], { a: [0, 0], p: [[0, [70, 130]], [12, [70, 86], "back"], [14, [72, 84]], [18, [64, 88]], [22, [74, 86]], [26, [62, 90]], [30, [72, 86]], [34, [64, 90]], [38, [70, 86]], [48, [70, 86]]], r: [[0, 0], [12, 0], [20, -10], [28, 8], [36, -10], [44, 0]] }),
      ]); },
      // Careers strip leaf mascot 150×120 · repeated 240 frames — slowly tilts left and right, blinks at frames 60·64 and 180·184, and waves arms over frames 120 to 168.
      recruit: () => { ind = 0; const blink = A([[0, [100, 100]], [58, [100, 100]], [60, [100, 10]], [62, [100, 100]], [64, [100, 10]], [66, [100, 100]], [178, [100, 100]], [180, [100, 10]], [182, [100, 100]], [184, [100, 10]], [186, [100, 100]], [240, [100, 100]]]);
        return comp(150, 120, 240, [
          layer("body", [...nkunHead(blink), g([...path("M50 88h20l-2 12H52z"), fill("--kf-ink")]), g(limb("M53 100l-3 8M67 100l3 8")), g([el(48, 109, 5, 2.6), fill("--kf-ink")]), g([el(72, 109, 5, 2.6), fill("--kf-ink")]), g(limb("M50 91l-9 6"))], { a: [60, 112], p: [75, 116], r: [[0, 0], [60, 3], [120, 0], [180, -3], [240, 0]] }),
          layer("wave", [g(limb("M0 0l10 6"))], { a: [0, 0], p: [85, 95], parent: 1, r: [[0, 0], [120, 0], [126, -60], [132, -40], [138, -60], [144, -40], [150, -60], [156, -40], [168, 0], [240, 0]] }),
        ]); },
      // Footer heart mascot 160×120 · 48 frames — bounces up from below (0–14), squashes and stretches on landing (14–22), then waves (24–48)
      footer: () => { ind = 0; return comp(160, 120, 48, [
        layer("chan", chan(), { a: [32, 56], p: [[0, [80, 170], "out"], [10, [80, 92], "io"], [14, [80, 116]], [48, [80, 116]]], s: [[0, [150, 150]], [14, [150, 150]], [17, [170, 128], "out"], [22, [150, 150]], [48, [150, 150]]], r: [[0, 0], [22, 0], [28, 8], [34, -8], [40, 8], [46, 0], [48, 0]] }),
      ]); },
    };
    return (name, container, opts) => (window.lottie && container ? lottie.loadAnimation({ container, renderer: "canvas", animationData: make[name](), ...opts }) : null);
  })();
  NH.lottie = LT;


  // Symbols newly drawn with the same spot and feel instead of the original image files
  const sprite = `
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <defs>
      <symbol id="nh-heart" viewBox="0 0 200 176"><path d="M100 172c-14-13-30-24-46-36C35 121 15 104 7 81 0 60 2 36 17 21 31 6 55 1 74 9c12 5 21 15 26 27 4-11 11-21 21-28 17-11 41-11 57 1 17 12 23 34 19 54-4 23-19 41-36 56-17 16-38 30-55 47z"/></symbol>
      <symbol id="nh-heart-rough" viewBox="0 0 200 176"><path d="M101 173c-9-9-21-17-32-25-11-7-23-15-34-25C20 110 8 95 4 77 0 60 2 41 12 27 22 13 39 4 57 4c17 0 33 9 41 24l3 6 4-7c9-15 26-24 43-24 19 0 37 10 45 26 9 16 8 36 1 53-7 18-21 32-36 44-10 8-21 15-31 23-8 6-15 13-20 20z"/></symbol>
      <symbol id="nh-arrow" viewBox="0 0 24 14"><path d="M1 7h20M15 1.5 21.5 7 15 12.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
      <symbol id="nh-nkun" viewBox="0 0 120 112">
        <path d="M66 22c2-9 9-16 19-20" fill="none" style="stroke:var(--kf-ink)" stroke-width="3" stroke-linecap="round"/>
        <path d="M80 6c6-5 13-5 17-2-4 5-11 7-17 2z" style="fill:var(--kf-ink)"/>
        <path d="M58 18c14-4 33 0 42 12 9 11 9 28 2 40-8 14-25 20-42 20-18 0-34-6-42-19-7-12-6-29 3-40 9-10 22-10 37-13z" style="fill:var(--site-green)"/>
        <path d="M30 34c4-3 9-2 12 1M86 30c4 1 7 5 7 9" fill="none" style="stroke:var(--site-green-deep)" stroke-width="2.4" stroke-linecap="round"/>
        <ellipse cx="60" cy="56" rx="23" ry="19" style="fill:var(--site-paper)"/>
        <ellipse cx="51" cy="52" rx="3.4" ry="4.2" style="fill:var(--kf-ink)"/><ellipse cx="69" cy="52" rx="3.4" ry="4.2" style="fill:var(--kf-ink)"/>
        <path d="M55 61c2 3 8 3 10 0" fill="none" style="stroke:var(--kf-ink)" stroke-width="2.2" stroke-linecap="round"/>
        <ellipse cx="44" cy="62" rx="4" ry="2.4" style="fill:var(--site-pink-cheek)"/><ellipse cx="76" cy="62" rx="4" ry="2.4" style="fill:var(--site-pink-cheek)"/>
        <path d="M50 88h20l-2 12H52z" style="fill:var(--kf-ink)"/>
        <path d="M53 100l-3 8M67 100l3 8" style="stroke:var(--kf-ink)" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="48" cy="109" rx="5" ry="2.6" style="fill:var(--kf-ink)"/><ellipse cx="72" cy="109" rx="5" ry="2.6" style="fill:var(--kf-ink)"/>
        <path d="M50 91l-9 6M70 91l9 6" style="stroke:var(--kf-ink)" stroke-width="3" stroke-linecap="round"/>
      </symbol>
      <symbol id="nh-chan" viewBox="0 0 64 58">
        <path d="M32 48C22 41 6 33 4 20 3 10 10 3 18 3c7 0 11 4 14 9 3-5 8-9 15-9 9 0 15 8 13 18-3 13-18 20-28 27z" style="fill:var(--site-yellow)"/>
        <circle cx="25" cy="22" r="2.2" style="fill:var(--kf-ink)"/><circle cx="39" cy="22" r="2.2" style="fill:var(--kf-ink)"/>
        <path d="M28 28c2 2 6 2 8 0" fill="none" style="stroke:var(--kf-ink)" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M27 46l-2 9M37 46l2 9" style="stroke:var(--kf-ink)" stroke-width="2.2" stroke-linecap="round"/>
      </symbol>
      <symbol id="nh-mark" viewBox="0 0 48 48">
        <path d="M24 3a21 21 0 1 1-17.6 9.5" fill="none" style="stroke:var(--site-green)" stroke-width="5" stroke-linecap="round"/>
        <path d="M6.4 12.5A21 21 0 0 1 24 3" fill="none" style="stroke:var(--site-orange)" stroke-width="5" stroke-linecap="round"/>
        <path d="M15 33V16l18 17V16" fill="none" style="stroke:var(--site-orange)" stroke-width="4.6" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="M27 14c5-5 11-4 13-1-4 4-9 5-13 1z" style="fill:var(--site-green)"/>
      </symbol>
      <symbol id="nh-phone" viewBox="0 0 24 28"><path d="M6 1c2-1 4 0 5 2l2 5c1 2 0 3-2 4l-2 1c1 4 3 7 6 9l2-1c2-1 3-1 4 1l2 4c1 2 0 3-2 4-3 2-7 1-10-2C6 23 2 16 1 10 0 6 2 3 6 1z" style="fill:var(--kf-ink)"/></symbol>
      <clipPath id="nh-clip-heart" clipPathUnits="objectBoundingBox"><path d="M.5.983C.43.909.35.846.27.777.175.69.075.59.035.46 0 .34.01.205.085.12.155.034.275.006.37.051c.06.028.105.085.13.153.02-.063.055-.12.105-.159.085-.063.205-.063.285.006.085.068.115.193.095.307-.02.13-.095.233-.18.318C.73.79.625.87.5.983z"/></clipPath>
      <clipPath id="nh-clip-blob" clipPathUnits="objectBoundingBox"><path d="M.06.12C.2.02.45.0.7.02.86.03.98.1.99.3c.02.25-.03.5-.12.62C.8.99.5 1 .25.97.1.95.02.85.01.65 0 .45-.04.2.06.12z"/></clipPath>
      <clipPath id="nh-clip-drop" clipPathUnits="objectBoundingBox"><path d="M.03.18C.08.04.3 0 .55.01.8.02.97.08.99.3c.02.2-.08.45-.3.6C.5 1.02.2 1.01.08.86-.02.72-.02.35.03.18z"/></clipPath>
      <filter id="nh-paper"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -.9 .55"/><feComposite in2="SourceGraphic" operator="in"/><feBlend in="SourceGraphic" mode="multiply"/></filter>
    </defs>
  </svg>`;
  document.body.insertAdjacentHTML("afterbegin", sprite);

  const use = (id, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
  const heartArrow = (tone = "") => `<span class="nh-harrow ${tone}">${use("nh-heart-rough", "nh-harrow__heart")}<span class="nh-harrow__arrow"><span class="nh-harrow__track">${use("nh-arrow")}${use("nh-arrow")}</span></span></span>`;
  NH.use = use;
  NH.heartArrow = heartArrow;
  document.querySelectorAll("[data-arrow]").forEach((el) => { el.innerHTML = heartArrow((el.dataset.tone || "") + ("blank" in el.dataset ? " is-blank" : "")); el.classList.add("nh-arrowbox"); });

  const logo = (cls = "") => `<a class="nh-logo ${cls}" href="index.html" aria-label="Home">${use("nh-mark", "nh-logo__mark")}<span class="nh-logo__txt"><b>Your group name here</b><small>GROUP NAME HERE</small></span></a>`;
  const cur = (p) => (p === page ? " is-current" : "");

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("nh-head");
    head.dataset.fv = "true";
    const mega = (n, items) => `<div class="nh-mega m${n}"><div class="nh-mega__in"><ul>${items.map(([t, h]) => `<li><a href="${h}"><i></i><span>${t}</span></a></li>`).join("")}</ul></div></div>`;
    head.innerHTML = `
      <div class="nh-head__in">
        ${logo()}
        <nav class="nh-nav" aria-label="Main menu"><ul>
          <li class="has-mega"><button class="nh-nav__a${cur("about")}" type="button"><span>Group About</span></button>${mega(1, [["Get to know the Group", "about.html"], ["Corporate overview", "about.html#data"]])}</li>
          <li><a class="nh-nav__a" href="index.html"><span>Flagship hospital</span></a></li>
          <li><a class="nh-nav__a${cur("service")}" href="service.html"><span>Business introduction</span></a></li>
          <li><a class="nh-nav__a${cur("news")}${cur("article")}" href="news.html"><span>Newsletter</span></a></li>
          <li><a class="nh-nav__a" href="index.html#faq"><span>Frequently asked questions</span></a></li>
          <li><a class="nh-nav__a${cur("recruit")}" href="recruit.html"><span>About the division</span></a></li>
          <li class="has-mega"><button class="nh-nav__a" type="button"><span>Directions · Contact</span></button>${mega(2, [["Transport guide", "index.html#access"], ["Phone numbers by facility", "index.html#tel"]])}</li>
          <li class="has-mega"><button class="nh-nav__a" type="button"><span>Hiring Info</span></button>${mega(3, [["Culture · Benefits", "recruit.html"], ["Application guidelines", "recruit.html#list"], ["Staff Interview", "recruit.html#voice"], ["Frequently asked questions", "recruit.html#faq"]])}</li>
        </ul></nav>
      </div>
      <button class="nh-burger" type="button" aria-label="Open Menu"><span class="nh-burger__lines"><i></i></span><span class="nh-burger__txt">Menu</span></button>`;

    const drawer = document.createElement("div");
    drawer.className = "nh-drawer";
    drawer.dataset.slot = "menu-drawer";
    const li = (t, h, tone = "") => `<li><a href="${h}">${use("nh-heart", "nh-drawer__dot " + tone)}<span>${t}</span></a></li>`;
    drawer.innerHTML = `
      <div class="nh-drawer__ov"></div>
      <nav class="nh-drawer__nav" aria-label="Phone menu">
        <div class="nh-drawer__in">
          ${logo()}
          <ul class="nh-drawer__list">${[["Group About", "about.html"], ["Flagship hospital", "index.html"], ["Business introduction", "service.html"], ["Newsletter", "news.html"], ["Frequently asked questions", "index.html#faq"], ["About the division", "recruit.html"], ["Notice", "news.html"], ["Corporate overview", "about.html#data"]].map(([t, h]) => li(t, h)).join("")}</ul>
          <div class="nh-drawer__rec"><p class="nh-drawer__rech">Hiring Info</p>
            <ul class="nh-drawer__list">${[["Culture · Benefits", "recruit.html"], ["Application guidelines", "recruit.html#list"], ["Staff Interview", "recruit.html#voice"], ["Frequently asked questions", "recruit.html#faq"]].map(([t, h]) => li(t, h, "is-blue")).join("")}</ul></div>
          <a class="nh-drawer__cta" href="#"><span class="nh-drawer__cta-t"><u>Contact us／</u><u>Apply here</u></span>${use("nh-arrow", "nh-drawer__cta-a")}<span class="nh-drawer__cta-chan">${use("nh-chan")}${use("nh-chan")}</span></a>
          <div class="nh-drawer__tel"><p class="nh-drawer__telh">General Consultation Desk</p><p class="nh-tel"><em>Tel.</em><b>0000-00-0000</b></p></div>
        </div>
      </nav>`;
    document.body.appendChild(drawer);

    const btn = head.querySelector(".nh-burger");
    const setMenu = (open) => {
      document.documentElement.classList.toggle("is-menu-open", open);
      btn.classList.toggle("is-open", open);
      btn.querySelector(".nh-burger__txt").textContent = open ? "Close" : "Menu";
    };
    btn.addEventListener("click", () => setMenu(!btn.classList.contains("is-open")));
    drawer.querySelector(".nh-drawer__ov").addEventListener("click", () => setMenu(false));

    // Original: opens right on entry, and on leave waits 200ms to check whether the pointer moved onto the speech bubble
    head.querySelectorAll(".has-mega").forEach((item) => {
      const trg = item.querySelector(".nh-nav__a");
      const box = item.querySelector(".nh-mega");
      const show = () => box.setAttribute("show", "true");
      const hideLater = () => setTimeout(() => box.getAttribute("hover") !== "true" && box.setAttribute("show", "false"), 200);
      trg.addEventListener("mouseenter", show);
      trg.addEventListener("focus", show);
      trg.addEventListener("click", show);
      trg.addEventListener("mouseleave", hideLater);
      box.addEventListener("mouseenter", () => box.setAttribute("hover", "true"));
      box.addEventListener("mouseleave", () => { box.setAttribute("hover", "false"); setTimeout(() => box.setAttribute("show", "false"), 100); });
    });
  }

  // Bottom-right mascot + vertical speech bubble — original FixedLink: the body Lottie (48 frames, repeating) and the head’s up-down bob (.5s each) run only while scrolling and stop after 100ms idle.
  // Header Lottie plays 0→16 frames when lifted, 16→0 frames on leaving (speed 1.5). On reaching the footer it folds the speech bubble and turns off the hand reaction
  const fixed = document.createElement("a");
  fixed.className = "nh-fixed js-fixed";
  fixed.href = "#";
  fixed.dataset.slot = "fixed-entry";
  fixed.innerHTML = `<span class="nh-fixed__speech"><span>Service Contact／<br>Apply here</span></span><span class="nh-fixed__kun"><span class="nh-fixed__body"></span><span class="nh-fixed__head"></span></span>`;
  // As in the original, placed right after the head (document order) — it’s fixed on screen so position doesn’t matter
  (head || document.body.firstElementChild).after(fixed);
  const kunBody = NH.lottie("body", fixed.querySelector(".nh-fixed__body"), { loop: true, autoplay: false });
  const kunHead = NH.lottie("head", fixed.querySelector(".nh-fixed__head"), { loop: false, autoplay: false });
  kunHead && kunHead.setSpeed(1.5);
  const bob = gsap.timeline({ paused: true, repeat: -1 });
  bob.to(".nh-fixed__head", { yPercent: 2, duration: 0.5 }).to(".nh-fixed__head", { yPercent: 0, duration: 0.5 });
  fixed.addEventListener("mouseenter", () => !fixed.classList.contains("is-foot") && kunHead && kunHead.playSegments([0, 16], true));
  fixed.addEventListener("mouseleave", () => !fixed.classList.contains("is-foot") && kunHead && kunHead.playSegments([16, 0], true));
  let walkT, lastY = 0;
  if (!NH.reduced) addEventListener("scroll", () => {
    kunBody && kunBody.play();
    bob.play();
    clearTimeout(walkT);
    walkT = setTimeout(() => { if (lastY === document.documentElement.scrollTop) { kunBody && kunBody.pause(); bob.pause(); } }, 100);
    lastY = document.documentElement.scrollTop;
  }, { passive: true });

  // Lottie slots placed on each page — hug (home: on hover frames 0→12 at speed .7, reverses on leave, About: plays on its own at speed .5 · after finishing rests 3s then repeats), pencil heart character (once at speed 1.3 after 1.2s)
  document.querySelectorAll("[data-lottie]").forEach((box) => {
    const kind = box.dataset.lottie, mode = box.dataset.lottieMode;
    if (kind === "pencil") {
      const a = NH.lottie("pencil", box, { loop: false, autoplay: false });
      if (!a) return;
      a.setSpeed(1.3);
      if (NH.reduced) a.addEventListener("DOMLoaded", () => a.goToAndStop(47, true));
      else setTimeout(() => a.play(), 1200);
    } else if (kind === "hug" && mode === "hover") {
      const a = NH.lottie("hug", box, { loop: false, autoplay: false, initialSegment: [0, 12] });
      const host = box.closest("a") || box;
      if (!a) return;
      a.setSpeed(0.7);
      host.addEventListener("mouseenter", () => { a.setDirection(1); a.play(); });
      host.addEventListener("mouseleave", () => { a.setDirection(-1); a.play(); });
    } else if (kind === "hug") {
      const a = NH.lottie("hug", box, { loop: false, autoplay: !NH.reduced });
      if (!a) return;
      a.setSpeed(0.5);
      a.addEventListener("complete", () => setTimeout(() => a.goToAndPlay(0, true), 3000));
    }
  });

  const links = document.querySelector('[data-slot="footer-links"]');
  if (links) {
    links.classList.add("nh-flinks");
    links.innerHTML = `<div class="nh-flinks__in">
      <a class="nh-flinks__a" href="about.html#data"><span>Corporate overview</span>${heartArrow()}</a>
      <a class="nh-flinks__a" href="index.html#faq"><span>Frequently asked questions</span>${heartArrow()}</a></div>`;
  }

  const rec = document.querySelector('[data-slot="footer-recruit"]');
  if (rec) {
    rec.classList.add("nh-frec");
    rec.innerHTML = `
      <div class="nh-frec__photo"><div class="wf-img" data-label="Staff member smiling at eye level with an elderly person in a wheelchair · indoor window natural light · over the staff member’s shoulder from behind · portrait 1:1"></div>
        <span class="nh-frec__kun"><span class="nh-frec__lottie"></span><i class="nh-frec__cloud"></i></span></div>
      <div class="nh-frec__panel">
        <svg class="nh-frec__edge" viewBox="0 0 120 700" preserveAspectRatio="none" aria-hidden="true"><path d="M120 0H70C40 40 8 90 4 170c-5 90 30 150 26 240-3 80-30 140-22 210 4 40 14 66 24 80h88z"/></svg>
        <h2 class="nh-frec__title js-target"><span><span>Your group name here</span></span><span><span>Careers info here</span></span></h2>
        <p class="nh-frec__en">Recruit Information</p>
        <div class="nh-frec__links">
          <a href="recruit.html#list"><span>Admissions guide here</span>${heartArrow()}</a>
          <a href="#"><span>Application form here</span>${heartArrow()}</a>
        </div>
      </div>`;
  }

  if (rec) {
    const a = NH.lottie("recruit", rec.querySelector(".nh-frec__lottie"), { loop: true, autoplay: !NH.reduced });
    a && a.setSpeed(0.8);
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("nh-foot");
    const a = (t, h = "#") => `<li><a href="${h}">${t}</a></li>`;
    foot.innerHTML = `
      <div class="nh-foot__in">
        ${logo("is-foot")}
        <div class="nh-foot__nav">
          <ul class="nh-foot__col">${a("Group About", "about.html")}${a("Flagship hospital", "index.html")}${a("Business introduction", "service.html")}${a("Frequently asked questions")}${a("About the division", "recruit.html")}${a("Notice", "news.html")}${a("Corporate overview", "about.html#data")}</ul>
          <div class="nh-foot__col is-rec"><p>Hiring Info</p><ul>${a("Culture · Benefits", "recruit.html")}${a("Admissions guidelines list", "recruit.html#list")}${a("Staff Interview", "recruit.html#voice")}</ul><a class="nh-foot__more" href="news.html">Newsletter</a></div>
          <ul class="nh-foot__col is-line">${a("Contact／<br>Job Application")}${a("Facility phone number list")}${a("Transport guide")}${a("Privacy policy")}${a("Social media<br>Operating policy")}</ul>
          <div class="nh-foot__tel">
            <div><p class="nh-foot__telh">General consultation desk ${use("nh-phone")}</p><p class="nh-tel"><em>Tel.</em><b>0000-00-0000</b></p><p class="nh-tel"><em>Fax.</em><b>0000-00-0000</b></p></div>
            <div><p class="nh-foot__telh">Main Hospital Regional Partnership Dept.</p><p class="nh-tel"><em>Tel.</em><b>0000-00-0000</b><small>(Weekdays 9:00–17:00)</small></p><p class="nh-tel"><em>Tel.</em><b>0000-00-0000</b></p><p class="nh-tel"><em>Fax.</em><b>0000-00-0000</b></p></div>
          </div>
        </div>
        <ul class="nh-foot__banners">
          ${["Careers site banner, logo and pink text on white, landscape 8:3", "Instagram banner · orange band and hashtag text · landscape 8:3", "Video channel banner · white background with red play logo · landscape 8:3", "Loop bus banner · pink band and bus name logo · landscape 8:3"].map((l) => `<li><a href="#"><span class="wf-img" data-label="${l}"></span></a></li>`).join("")}
        </ul>
        <small class="nh-foot__copy">© Your group name here</small>
        <div class="nh-foot__chan"><a class="nh-foot__say" href="#">Hello!</a><span class="nh-foot__lottie"></span></div>
      </div>`;
    // Original: the heart character Lottie plays once (speed .9) when it touches the line 110% down the screen, and when it ends the speech bubble opens with a spring. Scrolling back up returns to the first section
    const chanBox = foot.querySelector(".nh-foot__chan"), say = foot.querySelector(".nh-foot__say");
    const chanAnim = NH.lottie("footer", foot.querySelector(".nh-foot__lottie"), { loop: false, autoplay: false });
    if (chanAnim) {
      chanAnim.setSpeed(0.9);
      chanAnim.addEventListener("complete", () => say.classList.add("is-active"));
      if (NH.reduced) { chanAnim.addEventListener("DOMLoaded", () => chanAnim.goToAndStop(47, true)); say.classList.add("is-active"); }
      else ScrollTrigger.create({ trigger: chanBox, start: "top 110%", onEnter: () => chanAnim.play(), onLeaveBack: () => { chanAnim.goToAndStop(0, true); say.classList.remove("is-active"); } });
    }
    ScrollTrigger.create({ trigger: foot, start: "top bottom", onEnter: () => { head && head.classList.add("is-hide"); fixed.classList.add("is-foot"); }, onLeaveBack: () => { head && head.classList.remove("is-hide"); fixed.classList.remove("is-foot"); } });
  }

  // Scrolling below the header shrinks the header and lays down the background (original fv=false)
  if (head) {
    ScrollTrigger.create({ start: 1, end: "max", onToggle: (s) => (head.dataset.fv = s.isActive ? "false" : "true") });
  }

  // Stand-in for original SplitText: splits letters into spans and adds a 50ms-interval transition-delay
  NH.split = (el, cls, stepMs) => {
    const parts = el.querySelectorAll("[data-split-line]");
    const targets = parts.length ? parts : [el];
    let i = 0;
    targets.forEach((t) => {
      const text = t.textContent;
      t.setAttribute("aria-label", text);
      t.innerHTML = [...text].map((ch) => `<span class="${cls}" aria-hidden="true" style="transition-delay:${(stepMs * i++) / 1000}s">${ch === " " ? "&nbsp;" : ch}</span>`).join("");
    });
  };
  document.querySelectorAll(".js-split").forEach((el) => NH.split(el, "nh-ch", 50));

  // Original vendor-Animation: snaps into place in jerky steps(n) like a paper puppet — even-numbered items at -10×baseDeg, odd-numbered at +10×baseDeg
  NH.wobble = (box, inner, { x = 0, y = 0, steps = 2, duration = 1, baseDeg = 1, delay = 0, scrollTrigger = null } = {}) => {
    if (NH.reduced) return;
    const rot = [];
    for (let a = 0; a < steps; a++) rot.push((a % 2 === 0 ? -10 : 10) * baseDeg);
    rot.push(0);
    gsap.fromTo(box, { xPercent: x, yPercent: y }, { xPercent: 0, yPercent: 0, duration, ease: `steps(${steps})`, delay, scrollTrigger });
    gsap.fromTo(inner, { rotate: rot[0] }, { keyframes: { rotate: rot }, duration, ease: `steps(${steps})`, delay, scrollTrigger });
  };

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.reduce) {
      document.documentElement.classList.add("is-reduced");
      return;
    }
    // Original js-scroll-target: attaches is-active once when it touches the 80% line of the screen
    document.querySelectorAll(".js-target, .js-split").forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => el.classList.add("is-active") });
    });
    document.querySelectorAll("[data-wobble]").forEach((el) => {
      const [x, y, steps, dur, deg, delay] = el.dataset.wobble.split(",").map(Number);
      NH.wobble(el, el.firstElementChild || el, { x, y, steps, duration: dur, baseDeg: deg, delay: delay || 0, scrollTrigger: { trigger: el, start: "top 80%", once: true } });
    });
    // Sub page header: title letters yPercent 80→0, heart bounces up from yPercent 12
    const fvTitle = document.querySelector(".js-fv-title");
    if (fvTitle) {
      NH.split(fvTitle, "nh-fvch", 0);
      gsap.fromTo(".nh-fvch", { yPercent: 80 }, { yPercent: 0, duration: 0.8, stagger: 0.05, ease: NH.ease.sineOutBackInOut2 });
    }
    const hh = document.querySelector(".js-head-heart");
    if (hh) NH.wobble(hh, hh.firstElementChild, { x: 0, y: 12, steps: 2, duration: 1, baseDeg: -0.5 });
  });
  addEventListener("load", () => document.documentElement.classList.add("is-loaded"));
})();
