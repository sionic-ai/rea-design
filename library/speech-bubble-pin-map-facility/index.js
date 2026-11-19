// Home page: redraws the hand-drawn guide map as SVG (only following the position·size·feel of the original map image), and attaches pin icons · event slider · phone product slider.
// Original values: event swiper fade (crossFade) 700ms · 5s autoplay · loop / phone product swiper centered · gap 20 · 1000ms · 4s autoplay.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";

  const art = document.querySelector(".ks-map__art");
  if (art) {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const put = (tag, attrs, parent = art) => {
      const n = document.createElementNS(NS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      parent.append(n);
      return n;
    };

    // Watercolor edges — make the borders of grass and water blobs ripple slightly
    const defs = put("defs", {});
    const f = put("filter", { id: "ks-wash", x: "-5%", y: "-5%", width: "110%", height: "110%" }, defs);
    put("feTurbulence", { type: "fractalNoise", baseFrequency: "0.012", numOctaves: "2", seed: "4" }, f);
    put("feDisplacementMap", { in: "SourceGraphic", scale: "18" }, f);

    put("rect", { class: "m-paper", width: 2500, height: 2916 });
    const land = put("g", { filter: "url(#ks-wash)" });
    put("path", { class: "m-grass", d: "M0 0H2500V2240H0Z" }, land);
    put("path", { class: "m-water", d: "M0 0H560C470 120 300 190 200 290C120 370 70 430 0 470Z" }, land);
    put("path", { class: "m-grass", d: "M0 2600C200 2560 600 2570 820 2600V2916H0Z M1060 2610C1300 2570 1560 2580 1740 2620V2916H1060Z M1880 2620C2100 2590 2350 2580 2500 2600V2916H1880Z" }, land);

    const roads = put("g", { filter: "url(#ks-wash)" });
    const ROADS = [
      ["M1180 520C1110 760 860 800 820 1060S920 1440 1030 1510S1360 1700 1310 2000L1260 2320", 170],
      ["M820 1060C620 1220 520 1500 600 1800S880 2150 1010 2260", 150],
      ["M1030 1510C1320 1400 1520 1260 1900 1110", 130],
      ["M0 2420H2500", 330],
    ];
    const paths = ROADS.map(([d, w]) => put("path", { class: "m-road", d, "stroke-width": w }, roads));
    put("ellipse", { class: "m-lot", cx: 1960, cy: 1060, rx: 270, ry: 170 }, roads);
    put("rect", { class: "m-lot", x: 2020, y: 1830, width: 520, height: 600, rx: 60 }, roads);
    put("ellipse", { class: "m-lot", cx: 1180, cy: 1690, rx: 420, ry: 240 }, roads);

    // When planting trees, avoid roads and buildings — roads are judged by distance measured from points on the path
    const keep = [];
    paths.forEach((p, i) => {
      const len = p.getTotalLength(), half = ROADS[i][1] / 2 + 40;
      for (let s = 0; s <= len; s += 40) { const pt = p.getPointAtLength(s); keep.push([pt.x, pt.y, half]); }
    });
    const BLOCK = [[780, 300, 1600, 560], [1940, 1820, 2500, 2440], [760, 1420, 1840, 2110], [1680, 880, 2240, 1240], [0, 0, 600, 480]];
    const trees = [];
    const free = (x, y, r) =>
      keep.every(([a, b, h]) => Math.hypot(x - a, y - b) > h + r * 0.6) &&
      BLOCK.every(([x0, y0, x1, y1]) => x < x0 - r || x > x1 + r || y < y0 - r || y > y1 + r) &&
      trees.every(([a, b, rr]) => Math.hypot(x - a, y - b) > (r + rr) * 0.9);
    const plant = (zone, n, kind = "tree", rMin = 40, rMax = 62) => {
      for (let t = 0, got = 0; t < n * 30 && got < n; t++) {
        const x = zone[0] + rnd() * (zone[2] - zone[0]), y = zone[1] + rnd() * (zone[3] - zone[1]), r = rMin + rnd() * (rMax - rMin);
        if (!free(x, y, r)) continue;
        trees.push([x, y, r, kind]);
        got++;
      }
    };
    plant([80, 480, 720, 980], 7, "blossom", 52, 70);
    plant([60, 1000, 760, 2200], 16);
    plant([860, 640, 1500, 1400], 11);
    plant([1500, 560, 2460, 1800], 20);
    plant([0, 2620, 2500, 2900], 24, "tree", 44, 58);
    plant([1300, 2050, 1960, 2260], 5, "tree", 30, 40);

    // Tea field stripes (top right)
    const tea = put("g", {});
    for (let i = 0; i < 9; i++) {
      const x = 1440 + i * 90 + rnd() * 30, y = 60 + rnd() * 380;
      put("path", { class: "m-road", d: `M${x} ${y}c30 -40 70 -60 110 -60`, "stroke-width": 26, style: "stroke: var(--site-tree-deep)" }, tea);
    }
    // Hydrangea path flower dots
    const hyd = put("g", {});
    for (let i = 0; i < 26; i++) {
      const p = paths[1].getPointAtLength(paths[1].getTotalLength() * (0.08 + i * 0.033));
      const side = i % 2 ? 1 : -1;
      put("circle", { class: "m-glass", cx: p.x + side * (95 + rnd() * 20), cy: p.y + rnd() * 30, r: 14 + rnd() * 8, opacity: 0.8 }, hyd);
    }

    const grove = put("g", {});
    trees.sort((a, b) => a[1] - b[1]).forEach(([x, y, r, kind]) => {
      put("line", { class: "m-trunk", x1: x, y1: y + r * 0.6, x2: x, y2: y + r * 1.35 }, grove);
      if (kind === "blossom") {
        for (let k = 0; k < 4; k++) put("circle", { class: "m-blossom", cx: x + (k - 1.5) * r * 0.45, cy: y + (k % 2 ? -r * 0.25 : r * 0.15), r: r * 0.62, opacity: 0.9 }, grove);
      } else {
        put("ellipse", { class: "m-tree", cx: x, cy: y, rx: r * 0.78, ry: r }, grove);
        put("ellipse", { class: "m-tree-d", cx: x + r * 0.22, cy: y + r * 0.2, rx: r * 0.42, ry: r * 0.62, opacity: 0.45 }, grove);
      }
    });

    // Buildings — position and size from the original illustration (long main building, white warehouse, wooden building, brown house, big right warehouse)
    const bld = put("g", {});
    const house = (x, y, w, h, wall, roof, roofH = h * 0.55) => {
      put("rect", { class: wall, x, y, width: w, height: h }, bld);
      put("path", { class: roof, d: `M${x - 20} ${y + 10}L${x + w / 2} ${y - roofH}L${x + w + 20} ${y + 10}Z` }, bld);
    };
    put("rect", { class: "m-wall", x: 820, y: 380, width: 760, height: 150 }, bld);
    put("rect", { class: "m-roof", x: 800, y: 350, width: 800, height: 50 }, bld);
    for (let i = 0; i < 8; i++) put("rect", { class: "m-glass", x: 860 + i * 88, y: 430, width: 58, height: 60 }, bld);
    put("rect", { class: "m-wood", x: 1150, y: 410, width: 90, height: 120 }, bld);
    house(1030, 1560, 200, 200, "m-wall", "m-roof");
    for (let i = 0; i < 3; i++) put("rect", { class: "m-roof", x: 1060 + i * 55, y: 1610, width: 30, height: 30 }, bld);
    house(1470, 1480, 330, 280, "m-wood", "m-roof", 130);
    put("rect", { class: "m-wall", x: 1500, y: 1560, width: 120, height: 70 }, bld);
    house(800, 1880, 400, 190, "m-wall", "m-wood", 120);
    put("rect", { class: "m-wood", x: 860, y: 1940, width: 100, height: 130 }, bld);
    put("rect", { class: "m-roof", x: 2090, y: 1930, width: 420, height: 360 }, bld);
    for (let i = 0; i < 9; i++) put("rect", { class: "m-wall", x: 2110 + i * 44, y: 1950, width: 10, height: 320, opacity: 0.35 }, bld);
    for (let i = 0; i < 6; i++) put("ellipse", { class: "m-rock", cx: 1860 + (i % 3) * 90, cy: 1020 + Math.floor(i / 3) * 70, rx: 50, ry: 26 }, bld);

    // Cover — parking lot lettering, cars, signboard, small person
    put("text", { class: "m-label", x: 700, y: 2380 }, art).textContent = "PARKING";
    put("rect", { class: "m-sign", x: 1060, y: 960, width: 170, height: 100, rx: 20 }, art);
    put("text", { class: "m-sign-ink", x: 1145, y: 1004, "text-anchor": "middle" }, art).textContent = "Site visit";
    put("text", { class: "m-sign-ink", x: 1145, y: 1044, "text-anchor": "middle" }, art).textContent = "Reservation";
    const hand = put("text", { class: "m-hand", transform: "translate(560 1480) rotate(-62)" }, art);
    hand.textContent = "Flower Road";
    const car = (x, y, cls, s = 1) => {
      const g = put("g", { transform: `translate(${x} ${y}) scale(${s})` }, art);
      put("path", { class: cls, d: "M0 40h200v-30l-40-4-30-40H50L20 10 0 12Z" }, g);
      put("circle", { class: "m-ink", cx: 45, cy: 44, r: 18 }, g);
      put("circle", { class: "m-ink", cx: 160, cy: 44, r: 18 }, g);
      put("rect", { class: "m-glass", x: 60, y: -26, width: 60, height: 30 }, g);
    };
    car(1380, 2270, "m-car");
    car(660, 2770, "m-car2", 0.9);
    put("rect", { class: "m-wall", x: 820, y: 2440, width: 40, height: 200 }, art);
    put("text", { class: "m-sign-ink", x: 826, y: 2620, style: "fill: var(--kf-accent)" }, art).textContent = "P";
    for (const [x, y] of [[880, 1060], [1360, 2050], [1250, 1730]]) {
      put("circle", { class: "m-wall", cx: x, cy: y - 34, r: 14 }, art);
      put("rect", { class: "m-sign", x: x - 14, y: y - 18, width: 28, height: 40, rx: 10 }, art);
    }
  }

  const glass = '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="9.5" cy="9.5" r="6.5"/><path d="m14.5 14.5 5.5 5.5"/></svg>';
  document.querySelectorAll('.ks-pin [data-fx-part="icon"]').forEach((n) => (n.innerHTML = glass));

  if (window.Swiper) {
    const ev = document.querySelector(".ks-event__swiper");
    if (ev) new Swiper(ev, {
      effect: "fade",
      fadeEffect: { crossFade: true },
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      speed: reduce ? 0 : 700,
      navigation: { prevEl: ".ks-ev__nav.is-prev", nextEl: ".ks-ev__nav.is-next" },
      autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false },
    });
    const sk = document.querySelector(".ks-sake__swiper");
    if (sk) new Swiper(sk, {
      slidesPerView: "auto",
      centeredSlides: true,
      spaceBetween: 20,
      loop: true,
      speed: reduce ? 0 : 1000,
      autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false },
      pagination: { el: ".ks-dots", clickable: true },
    });
  }
})();
