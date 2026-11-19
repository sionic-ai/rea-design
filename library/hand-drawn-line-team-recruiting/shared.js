// Site-wide — loader (8s Lottie, waits at most 4s of whatever time remains after load, then lifts in .6s), fixed header · phone drawer, anchor movement (600ms swing),
// Enter when visible (original jquery.inview = Triggers with just a little in view · scInCheck = must fit height ⅔/⅓), staggered delay (data-delayset type)
(() => {
  const $ = window.jQuery;
  const root = document.documentElement;
  let reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => { reduce = ctx.conditions.still; });

  const varRGB = (name) => {
    const c = getComputedStyle(root).getPropertyValue(name).trim();
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = c || "transparent";
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255, 1];
  };

  const tall = () => root.classList.toggle("is-tall", innerWidth < innerHeight);
  tall();
  addEventListener("resize", tall);

  // ── Loader Lottie: the original obj_loading’s ten-piece motion values (1920×1080 · 30fps · 240 frames) as they are, with piece artwork replaced by our own shapes ──
  const st = (v) => ({ a: 0, k: v });
  const anim = (frames, o = [0.333, 0], i = [0.667, 1]) => ({
    a: 1,
    k: frames.map(([t, s, opt = {}], n) => {
      const v = [].concat(s);
      if (n === frames.length - 1) return { t, s: v };
      const oo = opt.o || o, ii = opt.i || i, d = v.length;
      return { t, s: v, o: { x: Array(d).fill(oo[0]), y: Array(d).fill(oo[1]) }, i: { x: Array(d).fill(ii[0]), y: Array(d).fill(ii[1]) }, ...(opt.h ? { h: 1 } : {}) };
    }),
  });
  const tr = { ty: "tr", p: st([0, 0]), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0) };
  const path = (v, c = true, io) => ({ ty: "sh", ks: st({ c, v, i: io ? io.i : v.map(() => [0, 0]), o: io ? io.o : v.map(() => [0, 0]) }) });
  const fill = (c) => ({ ty: "fl", c: st(c), o: st(100), r: 1 });
  const stroke = (c, w) => ({ ty: "st", c: st(c), o: st(100), w: st(w), lc: 2, lj: 2, ml: 4 });
  const ell = (w, h = w) => ({ ty: "el", p: st([0, 0]), s: st([w, h]) });
  const layer = (ind, items, ks) => ({ ddd: 0, ind, ty: 4, nm: `p${ind}`, sr: 1, ao: 0, ip: 0, op: 240, st: 0, bm: 0, shapes: [{ ty: "gr", it: [...items, tr] }], ks: { o: st(100), r: st(0), a: st([0, 0, 0]), s: st([100, 100, 100]), ...ks } });
  const wob = (a, b) => [[30, a], [60, b], [90, a], [120, b], [150, a], [180, b], [210, a], [240, b]];
  const smooth = (pts) => {
    const t = pts.map((p, n) => {
      const a = pts[Math.max(0, n - 1)], b = pts[Math.min(pts.length - 1, n + 1)];
      return [(b[0] - a[0]) / 6, (b[1] - a[1]) / 6];
    });
    return { o: t, i: t.map(([x, y]) => [-x, -y]) };
  };

  function loaderData() {
    const olive = varRGB("--kf-accent"), beige = varRGB("--kf-contrast-bg"), deep = varRGB("--kf-contrast-ink"), light = varRGB("--kf-raised");
    const squig = [[-260, 80], [-120, -40], [60, -110], [200, -80], [150, 0], [-20, 90], [-60, 170], [60, 150], [180, 110], [140, 200], [80, 260]];
    const wave = [[-160, 0], [-110, -18], [-55, 0], [0, 18], [55, 0], [110, -18], [160, 0]];
    const dots = [[34 - 86, 86 - 86], [85.75 - 86, 139 - 86], [138.5 - 86, 86 - 86], [85.75 - 86, 34.25 - 86]];
    const popAt = [15.3, 10.2, 5.1, 0];
    const layers = [
      layer(1, [path([[0, -30], [30, 26], [-30, 26]]), fill(olive)], {
        p: anim([[0, [642.9, 149.2, 0]], [30, [822.9, 429.2, 0]]]),
        r: anim([[0, -18], [30, 362, { i: [0.833, 1] }], [240, 1082]]),
      }),
      layer(2, [ell(95), fill(beige)], { p: anim([[0, [313, 327, 0]], [30, [853, 467, 0]], ...wob([853, 467, 0], [853, 457, 0]).slice(1).map(([t, s]) => [t, s, { o: [0.167, 0] }])]) }),
      layer(3, [path(squig, false, smooth(squig)), stroke(olive, 9), { ty: "tm", m: 1, s: st(0), o: st(0), e: anim([[0, 0, { i: [0.833, 1] }], [25, 100, { h: 1 }], [60, 0], [85, 100, { h: 1 }], [120, 0], [145, 100, { h: 1 }], [180, 0], [205, 100]]) }], {
        p: anim([[0, [1588, 302, 0]], [30, [1188, 522, 0]]]), r: anim([[0, 29], [30, -11]]), s: st([77, 77, 100]),
      }),
      layer(4, [path(wave, false, smooth(wave)), stroke(light, 7), { ty: "tm", m: 1, s: st(0), o: st(0), e: anim([[0, 100], [51.6, 0, { h: 1 }], [80, 100], [131.6, 0, { h: 1 }], [160, 100], [211.6, 0]]) }], {
        p: anim([[0, [379, 738, 0]], [30, [779, 538, 0]]]), r: anim([[0, -81], [30, -26]]), s: st([70, 70, 100]),
      }),
      layer(5, [path([[-44, 30], [-30, -36], [44, -30], [20, 36]]), fill(olive)], {
        p: anim([[0, [800, 909, 0]], [30, [860, 669, 0]]]), r: anim([[0, -100], ...wob(5, -5)]), s: st([132, 132, 100]),
      }),
      ...dots.map(([x, y], n) => {
        const t0 = popAt[n];
        const k = [];
        for (let c = 0; c < 8; c++) {
          const b = t0 + c * 30.64;
          if (b + 10.2 > 240) break;
          k.push([b, c % 2 ? [100, 100, 100] : [0, 0, 100]], [b + 10.2, c % 2 ? [0, 0, 100] : [100, 100, 100]]);
        }
        return { ...layer(6 + n, [ell(37, 38), fill(beige)], { p: st([270 + x, 536 + y, 0]), s: anim(k) }) };
      }),
      layer(10, [ell(324), fill(olive)], {
        p: anim([[0, [1070, 647, 0]], [30, [950, 527, 0]]]),
        s: anim([[0, [17.3, 17.3, 100]], [44.8, [100, 100, 100], { h: 1 }], [52.3, [100, 100, 100], { i: [0.833, 1] }], [89.6, [17.3, 17.3, 100], { h: 1 }], [97.1, [17.3, 17.3, 100]], [141.9, [100, 100, 100], { h: 1 }], [149.4, [100, 100, 100], { i: [0.833, 1] }], [186.7, [17.3, 17.3, 100], { h: 1 }], [194.2, [17.3, 17.3, 100]], [239, [100, 100, 100]]]),
      }),
      layer(11, [path([[-80, 84], [-74, -20], [-40, -76], [40, -76], [74, -20], [80, 84], [46, 84], [44, -6], [24, -40], [-24, -40], [-44, -6], [-46, 84]]), fill(deep)], {
        p: anim([[0, [1572.3, 734.5, 0]], [30, [1092.3, 634.5, 0]]]), r: anim([[0, 49], [30, 0], ...wob(5, -5).slice(1)]), s: st([103, 103, 100]),
      }),
      layer(12, [path([[-18, -79], [18, -79], [18, -18], [79, -18], [79, 18], [18, 18], [18, 79], [-18, 79], [-18, 18], [-79, 18], [-79, -18], [-18, -18]]), fill(light)], {
        p: anim([[0, [1083.5, 249, 0]], [30, [943.5, 349, 0]]]), r: anim([[0, 121], [30, 1, { o: [0.167, 0] }], ...wob(1, 10).slice(1).map(([t, s], n) => [t, n % 2 ? 0 : 10, { o: [0.167, 0] }])]), s: st([54, 54, 100]),
      }),
      layer(13, [path([[0, -26], [26, 22], [-26, 22]]), fill(beige)], {
        p: anim([[0, [1608, 299, 0]], [30, [1108, 359, 0]]]), r: anim([[0, 120], [30, 0], ...wob(10, -10).slice(1)]),
      }),
    ];
    return { v: "5.6.6", fr: 30, ip: 0, op: 240, w: 1920, h: 1080, ddd: 0, assets: [], layers };
  }

  // Letter splitting (original fn-spanCreate — animation-delay .2×(i+1)s per letter)
  document.querySelectorAll("[data-split]").forEach((el) => {
    const t = el.textContent;
    el.setAttribute("aria-label", t);
    el.replaceChildren(...[...t].map((ch, i) => Object.assign(document.createElement("span"), { className: "sm-ch", textContent: ch, style: `animation-delay:${(0.2 * (i + 1)).toFixed(1)}s` })));
  });

  const loader = document.querySelector(".sm-loader");
  const art = document.getElementById("sm-loader-art");
  let loadAnim = null, loadCount = Date.now();
  if (loader && art && window.lottie && !reduce) {
    loadAnim = lottie.loadAnimation({ container: art, renderer: "svg", loop: false, autoplay: false, animationData: loaderData(), rendererSettings: { preserveAspectRatio: "xMidYMid slice" } });
    const go = () => {
      loadCount = Date.now();
      loadAnim.play();
      art.classList.add("is-play");
      setTimeout(() => loader.querySelector(".sm-loader__txt")?.classList.remove("is-hidden"), 400);
    };
    if (loadAnim.isLoaded) go(); else loadAnim.addEventListener("DOMLoaded", go);
  }

  // ── Enter when visible ──
  const show = (el) => el.classList.add("is-in");
  function watch() {
    const view = [...document.querySelectorAll('[data-in="view"]')];
    if (reduce || !("IntersectionObserver" in window)) { view.forEach(show); }
    else {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }));
      view.forEach((el) => io.observe(el));
    }
    const scroll = [...document.querySelectorAll("[data-scroll-in]")];
    const check = () => {
      for (const el of scroll) {
        if (el.classList.contains("is-in")) continue;
        const r = el.getBoundingClientRect();
        if (!r.height && !r.width) continue;
        const part = el.dataset.scrollIn === "third" ? 1 / 3 : 2 / 3;
        if (reduce || innerHeight >= r.top + r.height * part) show(el);
      }
    };
    addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    check();
  }

  // Stagger delay (original data-delayset "t, repeat, start, interval" — front/back at 768 width)
  const stagger = () => document.querySelectorAll("[data-stagger]").forEach((el) => {
    let v = el.dataset.stagger;
    if (v.includes("/")) v = v.split("/")[innerWidth >= 768 ? 0 : 1];
    const [, rep, start, each] = v.split(",");
    const repeat = +rep, s = +start, d = +each;
    let count = 0;
    [...el.children].forEach((c, i) => {
      if (s > 0 || i > 0) c.style.transitionDelay = `${(d * (i - repeat * count) + s).toFixed(3)}s`;
      if (repeat !== 0 && (i + 1) % repeat === 0) count++;
    });
  });
  stagger();
  addEventListener("resize", stagger);

  // ── Fixed header ──
  const fix = document.querySelector(".sm-fixhead");
  const bar = document.querySelector(".sm-fixhead__bar");
  const mark = document.querySelector(".sm-head__mark");
  const pad = () => { if (fix && bar) fix.style.paddingTop = `${bar.offsetHeight - 1}px`; };
  const markShow = () => {
    const t = document.querySelector(".sm-kv__h");
    if (!t || !mark) return;
    const r = t.getBoundingClientRect();
    mark.classList.toggle("is-show", bar.offsetHeight - 1 >= r.bottom);
  };

  // ── Phone drawer (original slideDown 400 · slideUp 200) ──
  const head = document.getElementById("sm-head");
  const burger = document.querySelector(".sm-head__burger");
  const nav = document.getElementById("sm-nav");
  let keep = 0;
  const closeNav = () => {
    if (!head?.classList.contains("is-open")) return;
    head.classList.remove("is-open");
    root.classList.remove("fx-modal-open");
    burger.setAttribute("aria-expanded", "false");
    $(nav).slideUp(reduce ? 0 : 200);
  };
  burger?.addEventListener("click", () => {
    if (innerWidth > 767) return;
    if (head.classList.contains("is-open")) { closeNav(); scrollTo(0, keep); return; }
    keep = scrollY;
    head.classList.add("is-open");
    root.classList.add("fx-modal-open");
    burger.setAttribute("aria-expanded", "true");
    $(nav).slideDown(reduce ? 0 : 400);
  });
  addEventListener("resize", () => { if (innerWidth > 767 && nav?.hasAttribute("style")) { head.classList.remove("is-open"); root.classList.remove("fx-modal-open"); nav.removeAttribute("style"); } });

  // ── Anchor scroll (original 600ms swing, 50px up) ──
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const t = id === "#" || id === "" ? document.documentElement : document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    if (innerWidth <= 767) closeNav();
    const y = id === "#wrap" ? 0 : t.getBoundingClientRect().top + scrollY - 50;
    $("body,html").animate({ scrollTop: y }, reduce ? 0 : 600, "swing");
  }));

  // ── Loading done → loader lifts away ──
  function ready() {
    scrollTo(0, 0);
    pad();
    addEventListener("resize", pad);
    addEventListener("scroll", markShow, { passive: true });
    markShow();
    root.classList.add("is-loaded");
    watch();
    document.dispatchEvent(new CustomEvent("sm:ready"));
    // Decorative Lottie waits for html.is-loaded and wakes up on scroll — draw what is on screen right now immediately too
    requestAnimationFrame(() => dispatchEvent(new Event("scroll")));
  }
  const finish = () => {
    if (reduce || !loader) {
      loader?.remove();
      document.body.classList.add("is-loaded");
      ready();
      return;
    }
    let wait = 8000 - (Date.now() - loadCount);
    wait = wait < 0 ? 1 : Math.min(wait, 4000);
    setTimeout(() => {
      $(loader).fadeOut(600);
      document.body.classList.add("is-loaded");
      setTimeout(() => { loadAnim?.destroy(); ready(); }, 600);
    }, wait);
  };
  if (document.readyState === "complete") finish(); else addEventListener("load", finish);
})();
