// First page — instead of the original’s per-floor PNGs, redraws an isometric building as SVG.
// Ported: when a floor boundary crosses the 55% screen line the detail window changes (original js-floorthreshold → floor:select), plus the up/down button 450ms movement.
(() => {
  const { lenis, reduce, decorate, $, $$ } = window.MAUW;
  CustomEase.create("mauSwitch", "0.039,0.365,0.609,1");
  CustomEase.create("mauEnter", "0.528,0.014,0.664,0.938");
  const switchEase = CustomEase.get("mauSwitch"), enterEase = CustomEase.get("mauEnter");
  const root = document.documentElement;

  const FLOORS = [
    { id: "R", unit: "F", name: "Rooftop", room: "", grey: false, roof: true },
    { id: "8", unit: "F", name: "Your alumni association office here", room: "Alumni association office", text: "A floor with an office and a small meeting room where alumni and current students come and go. It serves as a base for alumni events and social gatherings.", photo: "Small meeting room with long table and chairs · daytime window light · landscape 16:9" },
    { id: "7", unit: "F", name: "Maker Space", room: "Maker Space", text: "An open workspace shared by companies, local governments and students. Workshops, lectures and joint project meetings are held here.", photo: "People gathered at a long table under a high ceiling · pendant lights · landscape 16:9" },
    { id: "6", unit: "F", name: "Joint Research Hub", room: "Joint Research Hub", text: "A research floor shared by several labs. It is divided into spaces for building models and prototypes and for meetings.", photo: "Lab desk with models · fluorescent light · 16:9 landscape" },
    { id: "5", unit: "F", name: "Campus office · Lecture room", room: "Campus office · Lecture room", text: "There are a campus office and mid-size lecture rooms. Classes for working-adult programs are mainly held on this floor.", photo: "Lecture hall with rows of desks · daytime window light · landscape 16:9" },
    { id: "4", unit: "F", name: "Labs · Practice rooms", room: "Labs · Practice rooms", text: "This floor has department labs and practice rooms. Students gather to work between classes.", photo: "Tools and materials on a workbench · top-down · landscape 16:9" },
    { id: "3", unit: "F", name: "Practice room", room: "Practice room", text: "A practice room with a large workbench. Group work and presentations are both possible.", photo: "Students seen from behind facing a presentation screen · dark interior · landscape 16:9" },
    { id: "2", unit: "F", name: "Community outreach hub · Gallery", room: "Community outreach hub / Gallery", text: "There is a community outreach hub connected to the outside and a small gallery. Exhibits are open to everyone.", photo: "Artwork and visitors on a white gallery wall · spotlight · landscape 16:9" },
    { id: "1", unit: "F", name: "Your cafe name here", room: "Studio space · Cafe", text: "Opened in 0000, this is a shared workshop space. The café, which serves as the student cafeteria, is open to the general public too. With small shops and event spaces, it hosts many experiments befitting an educational and research institution.", photo: "Bright café interior with guests seated around a round counter · wooden furniture and fluorescent lights · 16:9" },
    { id: "B1", unit: "F", name: "Studio", room: "Studio", text: "A studio for filming and recording. Used for video classes and live event broadcasts.", photo: "Photo studio with black backdrop and standing lights · dark interior · 16:9 landscape", grey: true },
    { id: "B2", unit: "F", name: "Multipurpose project space", room: "Multipurpose project space", text: "A multipurpose space with a high ceiling. Used for large exhibitions, installations, and events.", photo: "Installation piece in a high-ceilinged empty concrete space · spotlight · landscape 16:9", grey: true },
  ];

  // ── Isometric drawing ─────────────────────────
  const C = Math.cos(Math.PI / 6), S = 0.5;
  // Floor illustration colors come from the skin — gray mixed with a few % of ink (the original art’s black buildings · white partitions), legend colors are --site-iso-* in shared.css
  const ink = (p) => `color-mix(in srgb, var(--kf-ink) ${p}%, var(--kf-surface))`;
  const PAPER = "var(--kf-surface)";
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  function draw(svg, sp) {
    seed = 7;
    const W = sp ? 520 : 700, D = sp ? 300 : 380, P = sp ? 300 : 330, WALL = sp ? 70 : 90, T = 24;
    const cx = sp ? 290 : 820, y0 = sp ? 560 : 380;
    const pt = (x, y, z, base) => [cx + (x - y) * C, base + (x + y) * S - z];
    const poly = (pts, fill, extra = "") => `<polygon points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" style="fill:${fill}${extra}"/>`;
    const quad = (a, b, c, d, fill, extra) => poly([a, b, c, d], fill, extra);
    // Axis-aligned boxes (desk, wall): x0,y0,x1,y1, height h
    const box = (x0, yy0, x1, y1, h, base, top, l, r) =>
      quad(pt(x0, y1, 0, base), pt(x1, y1, 0, base), pt(x1, y1, h, base), pt(x0, y1, h, base), l) +
      quad(pt(x1, yy0, 0, base), pt(x1, y1, 0, base), pt(x1, y1, h, base), pt(x1, yy0, h, base), r) +
      quad(pt(x0, yy0, h, base), pt(x1, yy0, h, base), pt(x1, y1, h, base), pt(x0, y1, h, base), top);
    const person = (x, y, base) => {
      const [px, py] = pt(x, y, 0, base);
      return `<g style="fill:var(--site-iso-person)"><rect x="${(px - 5).toFixed(1)}" y="${(py - 26).toFixed(1)}" width="10" height="22" rx="5"/><circle cx="${px.toFixed(1)}" cy="${(py - 31).toFixed(1)}" r="5"/></g><ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="7" ry="3" style="fill:color-mix(in srgb, var(--kf-ink) 25%, transparent)"/>`;
    };
    // Lay text flat on a face: a matrix tilted by the face’s direction vector
    const faceText = (txt, x, y, z, base, size, fill, dir = "x", anchor = "start") => {
      const [tx, ty] = pt(x, y, z, base);
      const m = dir === "x" ? `matrix(${C},${S},0,1,${tx.toFixed(1)},${ty.toFixed(1)})` : `matrix(${C},${-S},0,1,${tx.toFixed(1)},${ty.toFixed(1)})`;
      return `<text transform="${m}" font-size="${size}" style="fill:${fill}" text-anchor="${anchor}" letter-spacing=".08em">${txt}</text>`;
    };

    const n = FLOORS.length;
    // PC: 8F~2F are one row of windows (FP) each on the outer wall under the rooftop, and from 1F a board with a visible interior. Phone: a cross-section stacking all floors spread apart
    const FP = sp ? P : 118;
    const facadeN = sp ? 0 : 7;
    const HF = sp ? 210 : facadeN * FP + 210;
    // 1F is shifted down below the outer wall by .35 of the panel height so the cross-section shows
    const baseOf = (i) => (sp ? y0 + i * P : i <= facadeN ? y0 + i * FP : y0 + HF + (W + D) * S * 0.35 + (i - facadeN - 1) * P);
    const total = baseOf(n - 1) + (W + D) * S + 260;
    svg.setAttribute("viewBox", `0 0 ${sp ? 760 : 1440} ${total}`);
    const levels = [];
    let out = "";
    // Draw from the lower layer so the upper panel covers the back
    for (let i = n - 1; i >= 0; i--) {
      const f = FLOORS[i];
      const base = baseOf(i);
      if (!sp && i >= 1 && i <= facadeN) { levels[i] = y0 + (W + D) * S * 0.5 + 40 + i * FP; continue; }
      const g = f.grey;
      const dark = ink(g ? 57.3 : 89), mid = ink(g ? 50.2 : 85.1), win = ink(g ? 42.7 : 76.9);
      let s = "";
      if (f.roof) {
        // Rooftop: dark slab + railing + stairwell, the front two faces are outer walls with rows of windows
        const H = HF;
        s += quad(pt(0, D, 0, base), pt(W, D, 0, base), pt(W, D, -H, base), pt(0, D, -H, base), ink(91.8));
        s += quad(pt(W, 0, 0, base), pt(W, D, 0, base), pt(W, D, -H, base), pt(W, 0, -H, base), ink(87.5));
        const rows = sp ? 3 : facadeN + 1;
        for (let r = 0; r < rows; r++) for (let k = 0; k < 11; k++) {
          const x = 30 + k * (W - 60) / 11, z = -40 - r * (sp ? 60 : FP);
          s += quad(pt(x, D, z, base), pt(x + 34, D, z, base), pt(x + 34, D, z - 38, base), pt(x, D, z - 38, base), ink(76.9), '; stroke:' + ink(94.9) + '; stroke-width:2');
        }
        for (let r = 0; r < rows; r++) for (let k = 0; k < 6; k++) {
          const y = 26 + k * (D - 52) / 6, z = -40 - r * (sp ? 60 : FP);
          s += quad(pt(W, y, z, base), pt(W, y + 30, z, base), pt(W, y + 30, z - 38, base), pt(W, y, z - 38, base), ink(72.9), '; stroke:' + ink(94.9) + '; stroke-width:2');
        }
        s += quad(pt(0, 0, 0, base), pt(W, 0, 0, base), pt(W, D, 0, base), pt(0, D, 0, base), ink(82.7));
        s += quad(pt(14, 14, 0, base), pt(W - 14, 14, 0, base), pt(W - 14, D - 14, 0, base), pt(14, D - 14, 0, base), ink(86.3));
        s += box(W * 0.62, 30, W * 0.62 + 90, 120, 70, base, ink(81.6), ink(90.6), ink(87.5));
        s += box(W * 0.2, D * 0.45, W * 0.2 + 60, D * 0.45 + 40, 26, base, ink(80.0), ink(89.4), ink(85.9));
        // School letter slot (original university abbreviation logo → bold letter slot of the same size)
        s += faceText("LOGO", 46, D, -88, base, sp ? 54 : 72, PAPER, "x");
        s += faceText("Name of the University", W, D - 30, -40, base, sp ? 18 : 24, PAPER, "y", "start");
        if (!sp) for (let k = 1; k <= facadeN; k++) {
          const z = -40 - k * FP + 4;
          s += faceText(FLOORS[k].room, W * 0.36, D, z + 46, base, 15, PAPER, "x");
          const [bx, by] = pt(W, D, z + 30, base);
          s += `<text x="${(bx + 26).toFixed(1)}" y="${by.toFixed(1)}" font-size="30" font-weight="300" style="fill:${PAPER};font-family:var(--kf-font-display)">${FLOORS[k].id}F</text>`;
        }
      } else {
        // Floor: back two walls → floor (navy/gray) → partitions, desks, people → two front panels → floor text
        s += quad(pt(0, 0, 0, base), pt(W, 0, 0, base), pt(W, 0, WALL, base), pt(0, 0, WALL, base), mid);
        s += quad(pt(0, 0, 0, base), pt(0, D, 0, base), pt(0, D, WALL, base), pt(0, 0, WALL, base), dark);
        for (let k = 0; k < 9; k++) {
          const x = 24 + k * (W - 48) / 9;
          s += quad(pt(x, 0, 22, base), pt(x + 40, 0, 22, base), pt(x + 40, 0, WALL - 14, base), pt(x, 0, WALL - 14, base), win);
        }
        for (let k = 0; k < 5; k++) {
          const y = 24 + k * (D - 48) / 5;
          s += quad(pt(0, y, 22, base), pt(0, y + 36, 22, base), pt(0, y + 36, WALL - 14, base), pt(0, y, WALL - 14, base), win);
        }
        s += quad(pt(0, 0, 0, base), pt(W, 0, 0, base), pt(W, D, 0, base), pt(0, D, 0, base), g ? ink(39.2) : (i % 2 ? "var(--site-iso-floor)" : "var(--site-iso-floor-2)"));
        const wx = W * (0.35 + rnd() * 0.25);
        s += box(wx, 0, wx + 8, D * (0.45 + rnd() * 0.3), 48, base, ink(4.3), ink(14.9), ink(23.1));
        const wy = D * (0.4 + rnd() * 0.2);
        s += box(wx + 8, wy, W * 0.92, wy + 8, 48, base, ink(4.3), ink(14.9), ink(23.1));
        const items = [];
        for (let k = 0; k < 7; k++) items.push({ t: "desk", x: 40 + rnd() * (W - 160), y: 30 + rnd() * (D - 110) });
        for (let k = 0; k < 7; k++) items.push({ t: "p", x: 40 + rnd() * (W - 80), y: 40 + rnd() * (D - 70) });
        items.sort((a, b) => a.x + a.y - (b.x + b.y));
        for (const it of items) {
          if (it.t === "desk") { const w = 60 + rnd() * 50, d = 26 + rnd() * 20; s += box(it.x, it.y, it.x + w, it.y + d, 16, base, ink(g ? 8.6 : 5.1), ink(16.1), ink(25.9)); }
          else if (!g || rnd() > 0.6) s += person(it.x, it.y, base);
        }
        s += quad(pt(0, D, 0, base), pt(W, D, 0, base), pt(W, D, -T, base), pt(0, D, -T, base), dark);
        s += quad(pt(W, 0, 0, base), pt(W, D, 0, base), pt(W, D, -T, base), pt(W, 0, -T, base), mid);
        s += faceText(f.room, W * 0.32, D, -T + 6, base, sp ? 13 : 15, PAPER, "x");
        const [bx, by] = pt(W, D, 0, base);
        s += `<text x="${(bx + 26).toFixed(1)}" y="${(by + 6).toFixed(1)}" font-size="${sp ? 22 : 30}" font-weight="300" style="fill:${g ? ink(80) : PAPER};font-family:var(--kf-font-display)">${f.id}F</text>`;
      }
      out = s + out;
      const [, my] = pt(W * 0.5, D * 0.5, 0, base);
      levels[i] = my;
    }
    svg.innerHTML = out;
    return { levels, total };
  }

  // ── Hero assembly ─────────────────────────────
  const svg = $(".iso");
  const marks = $(".mv__marks");
  const mv = $(".mv");
  let geo;
  const isSP = () => matchMedia("(max-width: 959px)").matches;
  const build = () => {
    geo = draw(svg, isSP());
    // Floor indicator dots: the SVG shrinks to fit the width, so use ratios
    marks.innerHTML = geo.levels.map((y, i) => `<i data-floor="${i}" style="top:${(y / geo.total * 100).toFixed(3)}%"></i>`).join("");
  };
  build();

  // Ink-bleed text splitting: the second line starts 1.4s later
  $$("[data-ink]").forEach((el, k) => {
    // Group by word so line breaks never land mid-word
    let i = 0;
    el.innerHTML = el.textContent.split(" ").map((w) => `<span class="w">${[...w].map((ch) => `<span class="ch" style="--i:${i++}">${ch}</span>`).join("")}</span>`).join('<span class="ch" style="--i:0"> </span>');
    setTimeout(() => el.classList.add("is-on"), reduce ? 0 : 1400 * k);
  });
  // Hero: --mv-opacity 0→1, 1.5s expo.out, after .4s
  gsap.fromTo(document.documentElement, { "--mv-opacity": 0 }, { "--mv-opacity": 1, duration: reduce ? 0 : 1.5, ease: "expo.out", delay: reduce ? 0 : 0.4 });
  // original playOpeningAnimation: after 2.8s, --frame-fv-init 0→1 over 1.2s cubic(.043,.188,.439,1) — the header row drops down, the building grows and the tagline steps aside. Scrolling is paused meanwhile
  if (!reduce) {
    lenis?.stop();
    gsap.fromTo(document.body, { "--frame-fv-init": 0 }, { "--frame-fv-init": 1, duration: 1.2, delay: 2.8, ease: CustomEase.create("mauInit", "0.043,0.188,0.439,1"), onComplete: () => lenis?.start() });
  }

  // ── Floor detail window ─────────────────────────────
  const fd = $(".fd");
  // Photos use Swiper fade like the original (crossFade · loop) — every 3 seconds at 600ms, and when the layer changes the four photos swap to that layer’s.
  const shots = (f) => [f.photo, `${f.room} Wide scene seen from inside · same light · landscape 16:9`, `${f.room} Close-up of furniture and fixtures · landscape 16:9`, `${f.room}People using it, seen from behind · landscape 16:9`];
  const gallery = window.Swiper && !reduce ? new Swiper($(".fd__gallery .swiper"), {
    effect: "fade", fadeEffect: { crossFade: true }, loop: true, speed: 600,
    allowTouchMove: false, simulateTouch: false,
    autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: false, stopOnLastSlide: false, waitForTransition: true },
    observeParents: true, observer: true,
  }) : null;
  const seen = new Map();
  let cur = -1, shown = -1;
  const select = (i) => {
    i = Math.max(1, Math.min(FLOORS.length - 1, i));
    if (i === cur) return;
    cur = i;
    const f = FLOORS[i];
    const apply = () => {
      if (cur !== i) return;
      $(".fd__id .num", fd).textContent = f.id;
      $(".fd__title", fd).textContent = f.name;
      const labels = shots(f);
      $$(".fd__gallery .swiper-slide", fd).forEach((s) => { const k = +(s.dataset.swiperSlideIndex ?? [...s.parentNode.children].indexOf(s)); $(".wf-img", s).dataset.label = labels[k % 4]; });
      if (gallery) { seen.set(shown, gallery.realIndex); gallery.slideToLoop(seen.get(i) || 0, 0); }
      shown = i;
      $(".fd__text", fd).textContent = f.text;
      $('[data-dir="up"]', fd).setAttribute("aria-disabled", String(i <= 1));
      $('[data-dir="down"]', fd).setAttribute("aria-disabled", String(i >= FLOORS.length - 1));
      fd.classList.remove("is-switching");
    };
    if (reduce) return apply();
    fd.classList.add("is-switching");
    setTimeout(apply, 200);
  };
  select(8);

  const stageY = (i) => { const m = $(`[data-floor="${i}"]`, marks); return m ? m.getBoundingClientRect().top + scrollY - innerHeight * 0.55 + 2 : 0; };
  const go = (i) => {
    if (!$(`[data-floor="${i}"]`, marks)) return;
    const y = stageY(i);
    lenis ? lenis.scrollTo(y, { duration: 0.45, easing: switchEase, lock: true }) : scrollTo(0, y);
  };
  $$(".fd__pager button").forEach((b) => b.addEventListener("click", () => {
    if (b.getAttribute("aria-disabled") === "true") return;
    go(cur + (b.dataset.dir === "up" ? -1 : 1));
  }));
  $(".mv__down").addEventListener("click", () => go(Math.min(FLOORS.length - 1, cur + 1)));

  let triggers = [];
  const wire = () => {
    triggers.forEach((t) => t.kill());
    triggers = $$("[data-floor]", marks).map((m) => {
      const i = +m.dataset.floor;
      return ScrollTrigger.create({ trigger: m, start: "top 55%", onEnter: () => select(i), onLeaveBack: () => select(i - 1) });
    });
    // Original #fv-from: before reaching the first layer, --frame-fv-from goes 0→1 over min(27.78vw,400px). The detail window and skip button grow and darken by a power of this value
    const fvH = () => Math.min(innerWidth * 0.2777778, 400);
    const firstY = () => stageY(1);
    const setFrom = (s) => root.style.setProperty("--frame-fv-from", s.progress.toFixed(4));
    triggers.push(ScrollTrigger.create({ start: () => Math.max(0, firstY() - fvH()), end: () => firstY(), onUpdate: setFrom, onRefresh: setFrom }));
    triggers.push(ScrollTrigger.create({
      trigger: mv, start: () => firstY() - 2, end: "bottom 60%",
      toggleClass: { targets: document.body, className: "is-floors" },
    }));
    // Original is-interim-leave: when the floor section ends, the detail window releases its fixing and rises with the page
    triggers.push(ScrollTrigger.create({
      trigger: mv, start: "bottom 60%", end: "max",
      onToggle: (s) => document.body.classList.toggle("is-interim-leave", s.isActive),
      onUpdate: (s) => fd.style.setProperty("--fd-shift", Math.max(0, s.scroll() - s.start).toFixed(1)),
      onLeaveBack: () => fd.style.setProperty("--fd-shift", 0),
    }));
  };
  wire();

  // First scroll: scrolling down from the top goes to the first floor in 1.6 seconds (original enter once · cubic(.528,.014,.664,.938))
  if (lenis) {
    let done = false;
    lenis.on("scroll", ({ scroll, direction }) => {
      if (done || direction !== 1 || scroll < 4 || scroll > innerHeight * 0.4) return;
      done = true;
      lenis.scrollTo(stageY(1), { duration: 1.6, easing: enterEase, lock: true });
    });
  }

  let lastSP = isSP();
  addEventListener("resize", () => {
    if (isSP() === lastSP) return;
    lastSP = isSP();
    build(); wire(); ScrollTrigger.refresh();
  });

  // Parallax: giant text behind the event · program photo
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    $$("[data-par]").forEach((el) => {
      const k = parseFloat(el.dataset.par);
      gsap.fromTo(el, { y: () => -k * innerHeight }, { y: () => k * innerHeight, ease: "none", scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
  decorate();
})();
