// First page: Hero entrance, photo swap, parallax, redraws the island map, district map and botanical illustrations as SVG, and hooks up the sights, experience and creature sliders.
// Original numbers: is-ready removed at 600ms · parallax scrollY×0.3 · the four sliders use the same Swiper 11.2.10 as the original with the original settings as they are (photos 2s/6s · sights .8s/6s top 80% · experience .8s · creatures .6s/8s 8px gap).
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const car = '<svg viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M1.5 7.5V5l1.6-3h7.8l1.6 3v2.5zM1.5 5h11"/><circle cx="4" cy="8" r="1.2"/><circle cx="10" cy="8" r="1.2"/></svg>';

  $$("[data-icon]").forEach((el) => (el.innerHTML = el.dataset.icon === "car" ? car : BN.icon[el.dataset.icon] || ""));

  /* ── Hero ── */
  const kv = $(".kv");
  $(".kv__side-logo").innerHTML = '<span class="bn-mark"><b>Your name here<small>PLACE · NAME PARK</small></b>' + BN.mark + "</span>";
  drawSideFern($(".kv__fern"));
  BN.afterHero(kv);
  // Photos: same Swiper fade as the original (loop, speed 2000, autoplay 6000, no manual swipe)
  new Swiper($("[data-kv]"), { allowTouchMove: false, slidesPerView: 1, speed: reduced ? 0 : 2000, loop: true, effect: "fade", autoplay: reduced ? false : { delay: 6000, disableOnInteraction: false } });
  if (reduced) {
    kv.classList.remove("is-ready");
  } else {
    setTimeout(() => kv.classList.remove("is-ready"), 600);
    const inner = $(".kv__in");
    let ticking = false;
    addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        inner.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0)`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── Highlights: same Swiper vertical fade as the original (loop · speed 800 · autoplay 6000) — autoplay only inside the 80% screen line ── */
  const hl = $("[data-hl]");
  const hlFirst = $(".hl__prev", hl), hlLast = $(".hl__next", hl);
  const hlSw = new Swiper(hl, {
    allowTouchMove: false, touchStartPreventDefault: false, passiveListeners: false, touchReleaseOnEdges: true,
    slidesPerView: 1, speed: reduced ? 0 : 800, autoplay: { delay: 6000, disableOnInteraction: false },
    direction: "vertical", loop: true, effect: "fade", navigation: { nextEl: hlLast, prevEl: hlFirst },
  });
  hlSw.autoplay.stop();
  if (!reduced) {
    const start = () => hlSw.autoplay.start(), stop = () => hlSw.autoplay.stop();
    ScrollTrigger.create({ trigger: hl, start: "top 80%", onEnter: start, onLeave: stop, onEnterBack: start, onLeaveBack: stop });
  }
  hlLast.textContent = String(hlSw.slides.length).padStart(2, "0");
  const hlNum = () => (hlFirst.textContent = String(hlSw.realIndex + 1).padStart(2, "0"));
  hlNum();
  hlSw.on("slideChange", hlNum);

  /* ── Experience program: same Swiper fade as the original (loop, speed 800) — as in the original, every slide except the current one is pinned at opacity 0 ── */
  const act = $("[data-act]");
  const actHide = (sw) => sw.slides.forEach((sl, i) => (sl.style.opacity = i === sw.activeIndex ? "1" : "0"));
  new Swiper(act, {
    allowTouchMove: true, slidesPerView: 1, speed: reduced ? 0 : 800, loop: true, effect: "fade",
    navigation: { nextEl: $(".act__next", act), prevEl: $(".act__prev", act) },
    on: { init: actHide, slideChange: actHide },
  });

  /* ── Nature here: photo row + botanical illustration swap ── */
  const NATURE = [
    { name: "Your creature name 1", latin: "Genus species", kind: "tree" },
    { name: "Your creature name 2", latin: "Genus species", kind: "fiddle" },
    { name: "Your creature name 3", latin: "Genus species", kind: "fern" },
    { name: "Your creature name 4", latin: "Genus species", kind: "bark" },
    { name: "Your creature name 5", latin: "Genus species", kind: "palm" },
  ];
  const details = $(".nature__details");
  details.innerHTML = NATURE.map(
    (n, i) => `<div class="nd${i === 0 ? " is-active" : ""}" data-n="${i}"><svg viewBox="0 0 560 700" fill="none" stroke="currentColor"></svg>
      <div class="nd__text"><p class="nd__name">${n.name} / <i>${n.latin}</i></p>
      <p>Category · Family and genus names here<br>Distribution · One line on where it lives</p>
      <p>Your field-guide-style description here, about six lines. Write how tall it grows, how the leaves and stems look, and where it is commonly seen. Continue with how it got its name and how it changes with the seasons, then point out where it is best seen here.</p>
      <p>【Features】<br>Your four or so lines here on distinguishing features. Note things like the pattern on the leaf stalk, the curled shape of new shoots, and marks on the stem surface.</p>
      <p>[Leaf Shape]<br>Your leaf shape description here in about three lines. Say how many times the pinnate leaf divides.</p></div></div>`,
  ).join("");
  $$(".nd svg", details).forEach((svg, i) => drawPlant(svg, NATURE[i].kind, i + 3));
  let ndCur = 0;
  const showNd = (i) => {
    if (i === ndCur) return;
    $$(".nd", details).forEach((el) => el.classList.toggle("is-active", +el.dataset.n === i));
    ndCur = i;
  };

  // Photo row: same Swiper as the original (auto width · 8px gap · loop · speed 600 · autoplay 8000 · drag hand) — advancing brings the first slide, lifting up shows that slide’s detail drawing
  const natureSw = new Swiper($("[data-nature]"), {
    centeredSlides: false, loop: true, preventClicks: false, slidesPerView: "auto", speed: reduced ? 0 : 600, spaceBetween: 8,
    autoplay: reduced ? false : { delay: 8000, disableOnInteraction: false }, grabCursor: true,
  });
  natureSw.on("slideChange", () => showNd(natureSw.realIndex));
  addEventListener("resize", () => natureSw.update());
  natureSw.slides.forEach((sl) => sl.addEventListener("mouseenter", () => showNd(+sl.dataset.swiperSlideIndex)));

  /* ── Hand-drawn area map ── */
  const zmap = $("[data-zmap]");
  const ZONES = { e: [190, 330], d: [430, 470], c: [1010, 520], b: [640, 660], a: [360, 820] };
  drawZoneMap($(".zmap__svg", zmap), ZONES);
  const zones = $$(".zmap__zone", zmap);
  const zoomLayer = $(".z-zoomlayer", zmap);
  const wide = matchMedia("(min-width: 1081px)");
  zones.forEach((z) => {
    const id = z.dataset.zone;
    const area = $(`.z-area[data-z="${id}"]`, zmap);
    z.addEventListener("mouseenter", () => wide.matches && !z.open && area.classList.add("is-on"));
    z.addEventListener("mouseleave", () => area.classList.remove("is-on"));
    z.addEventListener("toggle", () => {
      if (z.open) {
        zones.filter((o) => o !== z).forEach((o) => { o.open = false; o.classList.add("is-hide"); });
        area.classList.remove("is-on");
        zoomTo(id);
      } else if (!zones.some((o) => o.open)) {
        zones.forEach((o) => o.classList.remove("is-hide"));
        zoomTo(null);
      }
    });
  });
  function zoomTo(id) {
    if (!id) {
      zoomLayer.style.opacity = 0;
      zoomLayer.style.transform = "scale(0.95)";
      return;
    }
    const [cx, cy] = ZONES[id];
    const s = 1.7;
    // As the open cell moves left, that area is pulled to the right center
    const tx = (wide.matches ? 930 : 720) - cx * s;
    const ty = 520 - cy * s;
    $("use", zoomLayer).setAttribute("transform", `translate(${tx} ${ty}) scale(${s})`);
    zoomLayer.style.opacity = 1;
    zoomLayer.style.transform = "scale(1)";
  }

  /* ── Island map (Directions) ── */
  drawIsland($(".access__island"));

  /* ================= Picture ================= */
  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent && parent.append(n);
    return n;
  }

  // One fern leaf: small leaflets attached alternately on both sides of a curved stem
  function frond(g, x, y, len, ang, bend, r, w = 1) {
    let px = x, py = y, a = ang;
    const step = len / 26;
    let d = `M${x} ${y}`;
    const leaves = [];
    for (let i = 0; i < 26; i++) {
      a += bend;
      px += Math.cos(a) * step;
      py += Math.sin(a) * step;
      d += ` L${px.toFixed(1)} ${py.toFixed(1)}`;
      const size = (1 - i / 26) * len * 0.16 + 3;
      for (const side of [-1, 1]) {
        const la = a + side * (1.05 + r() * 0.2);
        const ex = px + Math.cos(la) * size, ey = py + Math.sin(la) * size;
        const cx1 = px + Math.cos(la - side * 0.35) * size * 0.6, cy1 = py + Math.sin(la - side * 0.35) * size * 0.6;
        leaves.push(`M${px.toFixed(1)} ${py.toFixed(1)} Q${cx1.toFixed(1)} ${cy1.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
      }
    }
    el("path", { d, "stroke-width": w * 1.4 }, g);
    el("path", { d: leaves.join(" "), "stroke-width": w * 0.8 }, g);
  }

  function spiral(g, cx, cy, r0, turns, stem) {
    let d = "";
    for (let t = 0; t <= turns * Math.PI * 2; t += 0.12) {
      const r = r0 * Math.exp(-0.18 * t);
      const x = cx + Math.cos(t) * r, y = cy + Math.sin(t) * r;
      d += (d ? " L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    el("path", { d, "stroke-width": 7, "stroke-linecap": "round", opacity: 0.5 }, g);
    el("path", { d, "stroke-width": 1.2 }, g);
    el("path", { d: `M${cx + r0} ${cy} C${cx + r0 + 20} ${cy + stem * 0.4} ${cx + r0 - 30} ${cy + stem * 0.8} ${cx + r0 - 10} ${cy + stem}`, "stroke-width": 9, opacity: 0.45, "stroke-linecap": "round" }, g);
  }

  function trunk(g, x, y1, y2, wdt, r) {
    el("path", { d: `M${x - wdt / 2} ${y1} C${x - wdt / 2 - 6} ${(y1 + y2) / 2} ${x - wdt / 2 + 4} ${y2 - 40} ${x - wdt / 2 - 8} ${y2} M${x + wdt / 2} ${y1} C${x + wdt / 2 + 6} ${(y1 + y2) / 2} ${x + wdt / 2 - 4} ${y2 - 40} ${x + wdt / 2 + 8} ${y2}`, "stroke-width": 1.4 }, g);
    for (let y = y1 + 10; y < y2 - 10; y += 16 + r() * 8) {
      el("ellipse", { cx: x + (r() - 0.5) * wdt * 0.4, cy: y, rx: wdt * 0.16, ry: 4 + r() * 2, "stroke-width": 0.9 }, g);
    }
  }

  function drawPlant(svg, kind, seed) {
    const r = rng(seed * 97);
    const g = el("g", { "stroke-linecap": "round" }, svg);
    if (kind === "tree" || kind === "palm") {
      trunk(g, 260, 210, 700, 34, r);
      const n = kind === "palm" ? 9 : 12;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i - (n - 1) / 2) * (kind === "palm" ? 0.34 : 0.28);
        frond(g, 260, 210, kind === "palm" ? 230 : 200, a, (a + Math.PI / 2) * 0.045, r, 0.9);
      }
    }
    if (kind === "fiddle") {
      spiral(g, 170, 260, 70, 3.2, 360);
      frond(g, 330, 680, 420, -1.62, 0.008, r, 1.1);
      trunk(g, 470, 140, 560, 26, r);
    }
    if (kind === "fern") {
      frond(g, 150, 690, 560, -1.35, -0.012, r, 1.2);
      frond(g, 330, 690, 470, -1.75, 0.014, r, 1);
      spiral(g, 430, 300, 40, 3, 200);
    }
    if (kind === "bark") {
      trunk(g, 200, 40, 700, 70, r);
      frond(g, 360, 680, 430, -1.4, -0.01, r, 1);
      spiral(g, 110, 180, 46, 3, 160);
    }
  }

  function drawSideFern(svg) {
    const r = rng(11);
    const g = el("g", { fill: "none", stroke: "currentColor", "stroke-linecap": "round" }, svg);
    frond(g, 320, 960, 640, -1.95, -0.01, r, 1.3);
    frond(g, 40, 940, 520, -1.25, 0.012, r, 1.1);
    frond(g, 380, 420, 300, -2.6, -0.02, r, 0.9);
    spiral(g, 90, 160, 44, 3, 140);
  }

  // Jagged closed blob: points placed around a circle, only the radius wobbles
  function blob(cx, cy, rx, ry, r, wob = 0.18, n = 22) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const k = 1 + (r() - 0.5) * wob * 2;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    return smooth(pts, true);
  }
  function smooth(pts, closed) {
    const P = (i) => pts[(i + pts.length) % pts.length];
    let d = `M${P(0)[0].toFixed(1)} ${P(0)[1].toFixed(1)}`;
    const last = closed ? pts.length : pts.length - 1;
    for (let i = 0; i < last; i++) {
      const p0 = closed ? P(i - 1) : pts[Math.max(i - 1, 0)], p1 = P(i), p2 = closed ? P(i + 1) : pts[Math.min(i + 1, pts.length - 1)], p3 = closed ? P(i + 2) : pts[Math.min(i + 2, pts.length - 1)];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d + (closed ? "Z" : "");
  }

  function drawIsland(svg) {
    const r = rng(7);
    const g = el("g", {}, svg);
    const leaf = "var(--kf-accent-soft)";
    const line = "var(--kf-line)";
    // Outer coastline — faintly continues to the right edge of the wide photo
    el("path", { d: "M1560 0 C1600 60 1640 70 1660 120 C1690 190 1760 200 1800 260 C1830 300 1880 320 1920 330", fill: "none", stroke: line, "stroke-width": 1, opacity: 0.5 }, g);
    el("path", { d: "M330 380 C300 420 240 430 200 470 M120 560 C150 590 210 600 260 640", fill: "none", stroke: line, "stroke-width": 1, opacity: 0.4 }, g);
    // Main island: a round body + a thin peninsula stretching to the upper right
    el("path", { d: "M450 245 C440 205 470 175 510 168 C545 160 570 176 600 160 C625 146 640 110 655 80 C668 52 690 20 716 6 C736 -2 748 18 738 40 C726 66 702 84 690 112 C676 146 676 178 660 214 C646 246 640 282 612 304 C586 326 552 340 520 334 C490 328 470 300 462 278 Z", fill: leaf, opacity: 0.75, stroke: line, "stroke-width": 1 }, g);
    el("path", { d: blob(392, 452, 26, 14, r, 0.3), fill: leaf, opacity: 0.6 }, g);
    el("path", { d: blob(318, 520, 18, 10, r, 0.3), fill: leaf, opacity: 0.55 }, g);
    el("path", { d: blob(470, 540, 12, 8, r, 0.3), fill: leaf, opacity: 0.5 }, g);
    // Travel routes: air route · sea route dotted lines
    el("path", { d: "M0 330 C180 300 360 320 520 252", fill: "none", stroke: line, "stroke-width": 1, "stroke-dasharray": "3 5" }, g);
    el("path", { d: "M620 90 C700 140 760 160 820 140", fill: "none", stroke: line, "stroke-width": 1, "stroke-dasharray": "3 5" }, g);
    el("path", { d: "M180 760 C240 640 380 560 500 330", fill: "none", stroke: line, "stroke-width": 1, "stroke-dasharray": "3 5" }, g);
    const t1 = el("text", { x: 250, y: 300, fill: line, "font-size": 11, transform: "rotate(-6 250 300)" }, g);
    t1.textContent = "— plane";
    const t2 = el("text", { x: 300, y: 610, fill: line, "font-size": 11, transform: "rotate(-48 300 610)" }, g);
    t2.textContent = "— boat";
    // Location dot and name label
    el("circle", { cx: 555, cy: 240, r: 9, fill: "none", stroke: line, "stroke-width": 1 }, g);
    el("circle", { cx: 555, cy: 240, r: 3, fill: "var(--kf-ink-soft)" }, g);
    el("path", { d: "M563 236 L640 200 H790", fill: "none", stroke: line, "stroke-width": 1 }, g);
    const lab = el("text", { x: 650, y: 190, fill: "var(--kf-ink-soft)", "font-size": 15, style: "font-family: var(--kf-font-latin)" }, g);
    lab.textContent = "Place Name";
    const s1 = el("text", { x: 650, y: 218, fill: line, "font-size": 9, style: "font-family: var(--kf-font-latin)" }, g);
    s1.textContent = "planned area - 000.0ha";
    const s2 = el("text", { x: 650, y: 230, fill: line, "font-size": 9, style: "font-family: var(--kf-font-latin)" }, g);
    s2.textContent = "total area - 000.0 ha";
  }

  function drawZoneMap(svg, Z) {
    const r = rng(23);
    const ink = "var(--kf-ink-soft)";
    const leaf = "var(--kf-accent-soft)";
    const defs = el("defs", {}, svg);
    const art = el("g", { id: "zmap-art" }, defs);
    // Ground: outer mass + three contours darkening inward
    const land = "M60 260 C40 170 120 90 230 70 C330 52 420 120 520 100 C640 76 700 20 820 40 C930 58 980 120 1080 110 C1190 100 1300 140 1360 230 C1410 310 1380 400 1330 470 C1290 530 1300 620 1260 700 C1220 790 1120 850 1040 900 C950 955 860 1000 740 990 C620 980 540 1010 420 1000 C300 990 200 960 150 880 C100 800 120 720 80 640 C40 560 60 470 40 390 C30 340 70 310 60 260 Z";
    el("path", { d: land, fill: `color-mix(in oklab, ${leaf} 38%, var(--kf-surface))`, stroke: ink, "stroke-width": 0.8, opacity: 0.95 }, art);
    [[700, 480, 560, 380, 0.22], [640, 520, 420, 280, 0.3], [760, 430, 260, 170, 0.36], [380, 640, 180, 140, 0.3], [1060, 380, 170, 120, 0.3]].forEach(([cx, cy, rx, ry, o]) =>
      el("path", { d: blob(cx, cy, rx, ry, r, 0.16), fill: leaf, opacity: o }, art),
    );
    // Water: a pond and a stream
    el("path", { d: blob(700, 860, 70, 40, r, 0.25), fill: "var(--site-water)", stroke: ink, "stroke-width": 0.6 }, art);
    el("path", { d: blob(1180, 200, 40, 22, r, 0.25), fill: "var(--site-water)", stroke: ink, "stroke-width": 0.6 }, art);
    el("path", { d: "M700 820 C680 760 720 700 690 640 C660 590 700 540 680 480", fill: "none", stroke: "var(--site-water)", "stroke-width": 3 }, art);
    // Roads: two thick main roads + several thin walking paths, rest-stop dots along the paths
    const roads = ["M1075 150 C1000 260 900 300 820 380 C740 460 640 520 560 600 C480 680 380 760 270 930", "M190 760 C300 700 420 660 560 600 C700 540 880 600 1011 900"];
    roads.forEach((d) => { el("path", { d, fill: "none", stroke: ink, "stroke-width": 2.2 }, art); el("path", { d, fill: "none", stroke: "var(--kf-surface)", "stroke-width": 0.8 }, art); });
    for (let i = 0; i < 16; i++) {
      const pts = [];
      let x = 120 + r() * 1180, y = 140 + r() * 760;
      for (let k = 0; k < 5; k++) { pts.push([x, y]); x += (r() - 0.5) * 180; y += (r() - 0.5) * 160; }
      const d = smooth(pts, false);
      el("path", { d, fill: "none", stroke: ink, "stroke-width": 0.9, opacity: 0.7 }, art);
      pts.slice(1, 4).forEach(([px, py]) => el("circle", { cx: px, cy: py, r: 2.6, fill: ink }, art));
    }
    // Hand-drawn facilities: scatter houses, lookout tower, trees, palms
    const items = el("g", { fill: "var(--kf-surface)", stroke: ink, "stroke-width": 1, "stroke-linejoin": "round" }, art);
    const house = (x, y, s) => el("path", { d: `M${x} ${y} h${30 * s} v${-16 * s} l${-15 * s} ${-12 * s} l${-15 * s} ${12 * s}z M${x + 11 * s} ${y} v${-8 * s} h${8 * s} v${8 * s}`, }, items);
    const long = (x, y, s) => el("path", { d: `M${x} ${y} h${70 * s} v${-14 * s} h${-70 * s}z M${x - 6 * s} ${y - 14 * s} h${82 * s} l${-8 * s} ${-8 * s} h${-66 * s}z M${x + 8 * s} ${y} v${-10 * s} M${x + 22 * s} ${y} v${-10 * s} M${x + 36 * s} ${y} v${-10 * s} M${x + 50 * s} ${y} v${-10 * s}` }, items);
    const tower = (x, y, s) => el("path", { d: `M${x} ${y} l${8 * s} ${-46 * s} h${10 * s} l${8 * s} ${46 * s} M${x + 3 * s} ${y - 20 * s} h${20 * s} M${x - 6 * s} ${y - 46 * s} h${38 * s} v${-6 * s} h${-38 * s}z` }, items);
    const tree = (x, y, s) => { el("path", { d: `M${x} ${y} v${-14 * s}` }, items); el("circle", { cx: x, cy: y - 22 * s, r: 10 * s }, items); };
    const palm = (x, y, s) => el("path", { d: `M${x} ${y} q${3 * s} ${-18 * s} 0 ${-34 * s} m0 0 q${-14 * s} ${-2 * s} ${-20 * s} ${8 * s} m${20 * s} ${-8 * s} q${14 * s} ${-2 * s} ${20 * s} ${8 * s} m${-20 * s} ${-8 * s} q${-8 * s} ${-10 * s} ${-18 * s} ${-8 * s} m${18 * s} ${8 * s} q${8 * s} ${-10 * s} ${18 * s} ${-8 * s}`, fill: "none" }, items);
    const kinds = [house, long, tower, tree, tree, palm, palm, house];
    for (let i = 0; i < 46; i++) {
      const x = 110 + r() * 1200, y = 130 + r() * 800;
      if (x > 1300 && y > 600) continue;
      kinds[Math.floor(r() * kinds.length)](x, y, 0.8 + r() * 0.7);
    }
    // Entrance name tag and compass
    const gate = (x, y, t) => {
      el("rect", { x: x - 32, y: y - 16, width: 64, height: 32, rx: 16, fill: "var(--kf-surface)", stroke: ink, "stroke-width": 1 }, art);
      const tx = el("text", { x, y: y + 6, "text-anchor": "middle", fill: ink, "font-size": 17, "letter-spacing": 4 }, art);
      tx.textContent = t;
    };
    gate(1075, 150, "North gate"); gate(190, 760, "Preface"); gate(270, 930, "South gate"); gate(1011, 900, "Alumni");
    const comp = el("g", { transform: "translate(790 200)", fill: ink, stroke: "none" }, art);
    el("path", { d: "M0 -46 L6 -6 L46 0 L6 6 L0 46 L-6 6 L-46 0 L-6 -6Z", opacity: 0.55 }, comp);
    el("path", { d: "M0 -30 L4 0 L0 30 L-4 0Z M-30 0 L0 -4 L30 0 L0 4Z" }, comp);
    [["N", 0, -56], ["S", 0, 66], ["W", -64, 5], ["E", 64, 5]].forEach(([t, x, y]) => { const n = el("text", { x, y, "text-anchor": "middle", "font-size": 11 }, comp); n.textContent = t; });

    el("use", { href: "#zmap-art" }, svg);
    // Zone highlight: hovering a cell lays a white veil over only that zone
    const areas = el("g", {}, svg);
    Object.entries(Z).forEach(([id, [cx, cy]], i) => {
      el("path", { class: "z-area", "data-z": id, d: blob(cx, cy, 150, 120, rng(40 + i), 0.22), fill: "var(--kf-surface)", "fill-opacity": 0.5, stroke: ink, "stroke-width": 1.2, "stroke-dasharray": "4 4" }, areas);
    });
    // Zoom panel: scale the same image up and move that area to center right — .95→1, opacity .3s
    const clip = el("clipPath", { id: "zmap-clip" }, defs);
    el("rect", { x: -400, y: 0, width: 2240, height: 1026 }, clip);
    const zl = el("g", { class: "z-zoomlayer", "clip-path": "url(#zmap-clip)", style: "opacity:0; transform:scale(0.95); transform-origin:720px 513px; transition:opacity .3s ease, transform .3s ease; pointer-events:none" }, svg);
    el("rect", { x: -400, y: 0, width: 2240, height: 1026, fill: "var(--site-gray)" }, zl);
    el("use", { href: "#zmap-art" }, zl);
  }
})();
