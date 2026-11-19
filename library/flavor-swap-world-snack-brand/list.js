// News collection scene: color block row (our shape Lottie ×5), mouse peanut drop (original effect values), card grid.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { use, mascotStyle, FLAVORS } = HS;

  // ---------- Five Lottie blocks in a row: same canvas as the original (600×600 · 60fps)·length·key frames·curves, shapes are our own ----------
  // ① Eight-petal star half turn (0→180° in 1s, 1s pause · 2s) ② 24-tooth star one full turn (4s steady) ③ smiling face — one eye crosses over and back in 0.25s (3s)
  // ④ four diamonds swap places diagonally, rest 1.25 sec, then move sideways (3 sec) ⑤ two fast-forward triangles swell alternately to 119% (2 sec)
  const still = (k) => ({ a: 0, k });
  const kf = (list) => ({ a: 1, k: list.map(([t, v, o, i], n) => (n < list.length - 1 ? { t, s: [].concat(v), o: { x: o[0], y: o[1] }, i: { x: i[0], y: i[1] } } : { t, s: [].concat(v) })) });
  const tr = () => ({ ty: "tr", p: still([0, 0]), a: still([0, 0]), s: still([100, 100]), r: still(0), o: still(100), sk: still(0), sa: still(0) });
  const rgb = (v) => [...HS.color(v).match(/\d+/g).map((n) => n / 255), 1];
  const fill = (v) => ({ ty: "fl", c: still(rgb(v)), o: still(100), r: 1 });
  const star = (sy, pt, or, ir, os, is) => ({ ty: "sr", sy, d: 1, pt: still(pt), p: still([0, 0]), r: still(0), or: still(or), os: still(os), ...(sy === 1 ? { ir: still(ir), is: still(is) } : {}) });
  const layer = (ind, shapes, ks = {}, op = 600) => ({
    ddd: 0, ind, ty: 4, sr: 1, ip: 0, op, st: 0, bm: 0, ao: 0, shapes,
    ks: { o: still(100), r: still(0), p: still([300, 300, 0]), a: still([0, 0, 0]), s: still([100, 100, 100]), ...ks },
  });
  const comp = (op, layers) => ({ v: "5.7.4", fr: 60, ip: 0, op, w: 600, h: 600, ddd: 0, assets: [], layers });
  const LIN = [[0.167], [0.167]], LIN_I = [[0.833], [0.833]];
  const ANIM = {
    a1: (c) => comp(120, [layer(1, [{ ty: "gr", it: [star(1, 8, 270, 150, 90, 220), fill(c), tr()] }], { r: kf([[0, 0, [[0.717], [0]], [[0.302], [1]]], [60, 180]]) })]),
    a2: (c) => comp(240, [layer(1, [{ ty: "gr", it: [star(1, 24, 250, 196, 0, 0), fill(c), tr()] }], { r: kf([[0, 0, LIN, LIN_I], [240, 360]]) })]),
    a3: (c) => {
      const E = [[0.333, 0.333], [0, 0]], EI = [[0.667, 0.667], [1, 1]];
      const eye = (ind, x, ks) => layer(ind, [{ ty: "gr", it: [{ ty: "el", d: 1, s: still([140, 150]), p: still([0, 0]) }, fill(c), tr()] }], { p: still([x, 200, 0]), ...ks });
      return comp(180, [
        eye(1, 400, { p: kf([[0, [400, 200, 0], E, EI], [15, [210, 200, 0], E, EI], [30, [400, 200, 0]]]), s: kf([[0, [100, 100, 100], E, EI], [15, [100, 30, 100], E, EI], [30, [100, 100, 100]]]) }),
        eye(2, 200),
        layer(3, [{ ty: "gr", it: [{ ty: "el", d: 1, s: still([500, 500]), p: still([0, 0]) }, { ty: "st", c: still(rgb(c)), o: still(100), w: still(56), lc: 2, lj: 2 }, tr()] },
          { ty: "tm", s: still(0), e: still(50), o: still(0), m: 1 }], { r: still(90), s: still([90, 90, 100]) }),
      ]);
    },
    a4: (c) => {
      const E = [[0.167, 0.167], [0.167, 0.167]], EI = [[0.667, 0.667], [1, 1]], EH = [[0.667, 0.667], [0.667, 0.667]];
      const A = [400, 400, 0], B = [200, 400, 0], C = [400, 200, 0], D = [200, 200, 0];
      const diamond = { ty: "sh", ks: still({ c: true, v: [[0, -120], [-120, 0], [0, 120], [120, 0]], i: [[0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0]] }) };
      const sq = (ind, p0, p1, p2) => layer(ind, [{ ty: "gr", it: [diamond, fill(c), tr()] }], { o: still(90), p: kf([[0, p0, E, EI], [15, p1, E, EH], [90, p1, E, EI], [105, p2]]) });
      return comp(180, [sq(1, A, D, C), sq(2, B, C, D), sq(3, C, B, A), sq(4, D, A, B)]);
    },
    a5: (c) => {
      const up = [[[0.645, 0.645, 0.167], [0, 0, 0]], [[0.258, 0.258, 0.667], [1, 1, 1]]], mid = [[[0.167, 0.167, 0.167], [0, 0, 0]], [[0.667, 0.667, 0.667], [1, 1, 1]]];
      const tri = (ind, x, a, b) => layer(ind, [{ ty: "gr", it: [star(2, 3, 130, 0, 32, 0), fill(c), tr()] }], {
        p: still([x, 300, 0]), r: still(90), s: kf([[15, [a, a, 100], ...up], [30, [b, b, 100], ...mid], [60, [b, b, 100], ...up], [75, [a, a, 100]]]),
      });
      return comp(120, [tri(1, 420, 100, 119), tri(2, 180, 119, 100)]);
    },
  };
  const text = (bg, fg, w = "News Pages") => `<div class="hs-sp__text c-${bg}"><h2 class="hs-d t-${fg}" data-label="Your News roundup English name here">${w}</h2></div>`;
  const icon = (bg, anim, col) => `<div class="hs-sp__icon c-${bg}">${anim ? `<div class="hs-lottie is-${anim}" data-anim="${anim}" data-col="${col}" data-label="Lottie icon · looping"></div>` : ""}</div>`;
  // Same row layout as the original: down to the empty (brown) cell, same order and same colors
  $(".hs-sp__row.is-1").innerHTML = icon("lemon", "a2", "--site-red") + text("red", "lemon") + icon("orange", "a1", "--site-brown") + text("lemon", "grey") + icon("brown");
  $(".hs-sp__row.is-2").innerHTML = icon("brown") + text("orange", "red") + icon("lemon", "a2", "--site-red") + text("brown", "body") + icon("body", "a5", "--site-lemon") + text("lemon", "grey");
  $(".hs-sp__row.is-3").innerHTML = icon("brown") + text("body", "red") + icon("red", "a3", "--site-lemon") + text("orange", "brown") + icon("brown");
  $(".hs-sp__row.is-4").innerHTML = text("brown", "orange") + icon("red", "a5", "--site-lemon") + text("lemon", "orange") + icon("brown", "a4", "--kf-bg") + text("red", "brown") + icon("brown");
  // Original is svg renderer, loop, autoplay. With reduced motion it stops on the first frame
  $$(".hs-lottie").forEach((el) => {
    const a = lottie.loadAnimation({ container: el, renderer: "svg", loop: true, autoplay: !HS.reduced, animationData: ANIM[el.dataset.anim](el.dataset.col) });
    if (HS.reduced) a.goToAndStop(0, true);
  });

  // Card grid: as in the original, flavor-color cards swap the photo/title order row by row
  const CARDS = [
    ["brown", "", ["img: B&W street photo · people crossing a crosswalk · front view", "h:Short News Title"]],
    ["lemon", "", ["h:A Longer News Title Set Across Three Lines", "img: Product bag photo · bag in hand · from above"]],
    ["red", "", ["h:A News Title on Two Lines", "img: product photo · spilled peanuts · orange lighting", "h:One Tail Line"]],
    ["orange", "", ["img: Black-and-white styled photo · Scattering peanuts · Black background", "h:News Title on Two Lines"]],
    ["orange", "is-b", ["h:News Kicker:", "img: B&W hand photo · cart · close-up"]],
    ["red", "", ["h:Short Title", "img: B&W staged photo · fist holding peanuts · close-up", "h:Tail Line"]],
    ["empty"],
    ["lemon", "is-b", ["img: B&W event photo · people on stage · wide", "h:A Long News Title That Keeps Going Across Four Lines"]],
    ["lemon", "", ["h:Another News Title, Two Lines", "img: black-and-white styled photo · peanut pile · from above"]],
    ["brown", "", ["img: B&W styled photo · horse-riding character · side view", "h:News Title Here"]],
    ["red", "", ["h:Press Release Title", "img: Product photo · two bags · front view", "h:Tail on Two Lines"]],
    ["orange", "is-b", ["h:Press Note:", "img: B&W hand photo · snack on a palm · from above"]],
  ];
  $(".hs-blog").innerHTML = CARDS.map(([c, mod, parts]) => c === "empty"
    ? `<div class="hs-bi is-empty"><h3 class="hs-d" data-label="Your whispered English phrase here">A Little<br>Whisper<br>Here?</h3>${use("hs-mascot", "", mascotStyle(FLAVORS[1]))}</div>`
    : `<a class="hs-bi c-${c} ${mod}" href="#">${parts.map((p) => {
      const [k, v] = p.split(/:(.*)/s);
      return k === "img" ? `<div class="wf-img" data-label="${v}"></div>` : `<h3 class="hs-d" data-label="Your News English title here">${v}</h3>`;
    }).join("")}</a>`).join("");

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Lines enter from staggered positions (back.inOut(1.7) .5s) — a page without a loader, so it starts immediately
    gsap.from(".hs-sp__row.is-1", { xPercent: 15, duration: 0.5, ease: "back.inOut(1.7)" });
    gsap.from(".hs-sp__row.is-2", { xPercent: -20, duration: 0.5, ease: "back.inOut(1.7)" });
    gsap.from(".hs-sp__row.is-3", { xPercent: 20, duration: 0.5, ease: "back.inOut(1.7)" });
    gsap.from(".hs-sp__row.is-4", { xPercent: -15, duration: 0.5, ease: "back.inOut(1.7)" });
    gsap.timeline({ scrollTrigger: { trigger: ".hs-sp", start: "clamp(top bottom)", end: "bottom top", scrub: 0.8 } })
      .to(".hs-sp__group.is-right", { xPercent: -5, ease: "back.inOut(1.7)" }, 0)
      .to(".hs-sp__group.is-left", { xPercent: 5, ease: "back.inOut(1.7)" }, 0);
    // Character in the empty card: rolls in from the right upon reaching 60% from the top
    $$(".hs-bi.is-empty .hs-svg").forEach((m) => gsap.from(m, { xPercent: 100, rotation: 40, duration: 0.7, ease: "back.out(1.7)",
      scrollTrigger: { trigger: m.parentElement, start: "top 60%", toggleActions: "play none none reverse" } }));
  });

  // Mouse peanut drop: one for every screen width/8 (touch /6) the mouse travels — it pops out (elastic.out(2,.6) .4s) and falls to the floor
  // Bounces once, spins randomly 45~90 degrees and exits the screen (back.in). The original rotates four flavor character photos
  const root = $(".hs-drop");
  const kinds = FLAVORS.slice(0, 4).map((f) => () => use("hs-mascot", "", mascotStyle(f)));
  let incr = 0, ox = 0, oy = 0, first = true, k = 0;
  const coarse = matchMedia("(hover: none)").matches;
  const move = (cx, cy) => {
    if (HS.reduced) return;
    const W = innerWidth, H = innerHeight, x = gsap.utils.clamp(0, W, cx), y = gsap.utils.clamp(0, H, cy);
    if (first) { first = false; ox = x; oy = y; return; }
    incr += Math.abs(x - ox) + Math.abs(y - oy);
    if (incr > W / (coarse ? 6 : 8)) { incr = 0; drop(x, y - root.getBoundingClientRect().top, x - ox, H); }
    ox = x; oy = y;
  };
  function drop(x, y, dx, H) {
    if (y > H - 200) return;
    root.insertAdjacentHTML("beforeend", kinds[k]());
    k = (k + 1) % kinds.length;
    const el = root.lastElementChild;
    const spin = (Math.random() - 0.5) * 2 * gsap.utils.random(45, 90);
    gsap.timeline({ onComplete: () => el.remove() })
      .fromTo(el, { xPercent: -50 + (Math.random() - 0.5) * 80, yPercent: -50 + (Math.random() - 0.5) * 10, scale: 1.3, rotation: (Math.random() - 0.5) * 20 },
        { scale: 1, ease: "elastic.out(2, 0.6)", duration: 0.4 })
      .fromTo(el, { x }, { x: "+=" + dx * 2, rotation: 0, ease: "power1.in", duration: 0.4 }, "<")
      .fromTo(el, { y }, { y: "+=" + (H - y), scale: 0.9, yPercent: -95, ease: "back.in(1.1)", duration: 0.4 }, "<")
      .to(el, { x: "+=" + dx * 1.6, rotation: spin, ease: "power1.in", duration: 0.3 })
      .to(el, { yPercent: 150, ease: `back.in(${1.5 + (1 - y / H)})`, duration: 0.3 }, "<");
  }
  root.addEventListener("mousemove", (e) => move(e.clientX, e.clientY));
  root.addEventListener("touchmove", (e) => e.touches[0] && move(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
})();
