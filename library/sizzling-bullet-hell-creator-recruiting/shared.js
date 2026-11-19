// Shared by all pages: draws the header, menu drawer, ENTRY button and JOIN US footer in one place, and attaches smooth scroll, hand-drawn underline, marquee, spiral thumbnails, slit glass ·
// Hooks up the sub-page KV, vertical bars and page transitions. Values were carried over from the original bundle (curve, bar width unit 116.67/1440, durations) and the code was written fresh.
(function () {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mmSP = matchMedia("(max-width: 767px)");
  const isSP = () => mmSP.matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Measured at 1440 (phone 390) px width, so converted to the current width.
  const px = (v) => v * innerWidth / (isSP() ? 390 : 1440);
  const vw = (v) => (v / 100) * innerWidth;
  const r = (a, b) => a + Math.random() * (b - a);
  const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const page = document.body.dataset.page || "home";
  // Whether we arrived via in-site navigation — the original uses swup so the barrage keeps running unbroken
  const viaTrans = sessionStorage.getItem("z-trans") !== null;

  // Original Lenis 1.0.42 settings — mouse wheel 1.2s multiplier .5, and if it looks like a trackpad (small pixel-unit steps) 1s multiplier 1.3
  const LENIS = { mouse: { duration: 1.2, wheelMultiplier: 0.5 }, trackpad: { duration: 1, wheelMultiplier: 1.3 } };
  const lenis = new Lenis(LENIS.mouse);
  addEventListener("wheel", (e) => {
    if (e.deltaMode !== 0 || Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 50) return;
    Object.assign(lenis.options, LENIS.trackpad);
    if (lenis.virtualScroll) lenis.virtualScroll.wheelMultiplier = LENIS.trackpad.wheelMultiplier;
  }, { once: true, passive: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ---------- Drawing in the shared frame ---------- */
  const LINKS = [["about", "about.html", "OUR IDENTITY"], ["list", "list.html", "CREATORS"], ["culture", "culture.html", "CULTURES"], ["entry", "recruit.html", "ENTRY"], ["home", "index.html", "HOME"]];
  const cur = (k) => (k === page || (k === "list" && page === "detail") ? " is-current" : "");
  const bolt = '<svg viewBox="0 0 45 61" aria-hidden="true"><path d="M27 1 L4 34 L20 34 L13 60 L41 22 L24 22 L33 1 Z" fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="3" stroke-linejoin="round"/></svg>';

  function renderFrame() {
    document.body.insertAdjacentHTML("afterbegin", `
      <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="z-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 19 -9" result="goo"/><feComposite in="SourceGraphic" in2="goo" operator="atop"/></filter></defs></svg>
      <canvas class="z-back" aria-hidden="true"></canvas>
      <div class="z-runners" aria-hidden="true">${[1, 2, 3, 4].map((s) => `<div class="z-runner" data-art="runner" data-seed="${s}"></div>`).join("")}</div>
      <canvas class="z-fx" aria-hidden="true"></canvas>`);

    const head = $('[data-slot="header"]');
    head.classList.add("z-head");
    head.innerHTML = `
      <a class="z-head__logo" href="index.html">
        <span class="z-head__catch">Your one-line slogan here.</span>
        <span class="z-head__name">RECRUITMENT<br>STUDY CO.LTD.</span>
        <span class="z-mark" data-art="mark"></span>
      </a>
      <nav class="z-head__nav">${LINKS.map(([k, h, t]) => `<a href="${h}" class="${cur(k).trim()}" data-scribble>${t}</a>`).join("")}</nav>
      <button class="z-head__menu" type="button" aria-label="Open Menu"><i></i><i></i><i></i></button>`;

    head.insertAdjacentHTML("afterend", `
      <div class="z-nav" data-slot="menu-drawer" aria-hidden="true">
        <div class="z-nav__in">
          <button class="z-nav__close" type="button" aria-label="Close Menu"><i></i><i></i></button>
          <nav class="z-nav__list">${LINKS.map(([k, h, t], i) => `<a href="${h}" class="${cur(k).trim()}" style="--d:${(0.27 + i * 0.1).toFixed(2)}s"><span><em>${t}</em></span><i></i><i></i><i></i></a>`).join("")}</nav>
          <div class="z-nav__chara"><div class="bg"><i></i><i></i><i></i></div><div class="art" data-art="tall" data-seed="51"></div></div>
          <div class="z-nav__sns"><i></i><i></i><i></i></div>
          <div class="z-nav__copy"><small>© 2026 STUDY CO.LTD.</small></div>
        </div>
      </div>
      <a class="z-entry" href="recruit.html" aria-label="Apply" data-slot="entry-button">
        <span class="z-entry__base"><svg viewBox="0 0 158 158" class="z-entry__ring"><defs><path id="ringPath" d="M79,79 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0"/></defs><text><textPath href="#ringPath">ENTRY · Apply · ENTRY · Apply · ENTRY · Apply ·</textPath></text></svg></span>
        <span class="z-entry__face"><span class="z-entry__icon" data-art="face" data-seed="1"></span></span>
      </a>
      <div class="z-trans" aria-hidden="true"><svg preserveAspectRatio="none"><g></g></svg></div>`);

    const foot = $('[data-slot="footer"]');
    if (foot) {
      foot.classList.add("z-ftypo");
      // Where the page builds its own JOIN US spot, like ENTRY (original footer[data-type=entry]) leaves that spot as is and only adds the bottom menu
      const own = foot.innerHTML.trim();
      foot.innerHTML = `
        ${own || `<div class="z-ftypo__grad"></div>
        <div class="z-joinus"><a href="recruit.html"><span class="t1" data-text="JOIN US.">JOIN US.${bolt}</span><span class="t2" data-scribble>SAY HELLO!<span></span></span></a></div>`}
        <div class="z-fnav">
          <span class="z-mark" data-art="mark"></span>
          <nav>${[...LINKS].reverse().map(([, h, t]) => `<a href="${h}" data-scribble>${t}</a>`).join("")}<i class="ico"></i><i class="ico"></i><i class="ico"></i></nav>
          <small>© 2026 STUDY CO.LTD. ALL RIGHTS RESERVED.</small>
          <a class="z-fnav__top" href="#top" aria-label="Back to top"><i></i></a>
        </div>`;
    }
  }

  /* ---------- Phone menu drawer ---------- */
  function menu() {
    const nav = $(".z-nav");
    const open = () => { nav.classList.remove("is-hide"); nav.classList.add("is-show"); nav.setAttribute("aria-hidden", "false"); lenis.stop(); };
    const close = () => { nav.classList.remove("is-show"); nav.classList.add("is-hide"); nav.setAttribute("aria-hidden", "true"); lenis.start(); gsap.delayedCall(0.5, () => nav.classList.remove("is-hide")); };
    $(".z-head__menu").addEventListener("click", open);
    $(".z-nav__close").addEventListener("click", close);
    $$(".z-nav__list a").forEach((a) => a.addEventListener("click", close));
  }

  /* ---------- Text width fitting: the substitute typeface is narrower than the original, so it is stretched to the measured width (data-fit, phone data-fit-sp) ---------- */
  function fitText() {
    $$("[data-fit]").forEach((el) => {
      el.style.transform = "none";
      const target = Number(isSP() ? el.dataset.fitSp || 0 : el.dataset.fit);
      const w = el.getBoundingClientRect().width;
      if (w && target) el.style.transform = `scaleX(${px(target) / w})`;
    });
    $$("[data-fit-v]").forEach((el) => {
      el.style.transform = "none";
      const target = Number(isSP() ? el.dataset.fitVSp : el.dataset.fitV);
      const h = el.getBoundingClientRect().height;
      if (h && target) el.style.transform = `scaleY(${px(target) / h})`;
    });
  }

  /* ---------- Filling the photo slots ---------- */
  function paintPhotos() {
    $$(".z-photo[data-photo]").forEach((el) => {
      const w = 960, h = Math.round(960 * el.offsetHeight / Math.max(1, el.offsetWidth));
      el.style.backgroundImage = `url(${ZArt.photoURL(el.dataset.photo, w, h)})`;
    });
  }

  /* ---------- Marquee ---------- */
  function buildMarquees() {
    $$(".z-marquee").forEach((m) => {
      const word = m.dataset.word;
      const single = (cls) => `<div class="z-marquee__single"><p class="${cls}" data-scribble>${word}</p><span class="z-arrowc"></span></div>`;
      const set = `<div class="z-marquee__set">${single("b")}${single("n")}</div>`;
      m.innerHTML = `<div class="z-marquee__track">${set.repeat(4)}</div>`;
    });
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-inview", e.isIntersecting)));
    $$(".z-marquee").forEach((el) => io.observe(el));
  }


  /* ---------- Hand-drawn line (gradient pen): hover underline · sentence box border ---------- */
  function gradFor(g, w) {
    const gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, ZArt.color("--site-g1")); gr.addColorStop(0.48, ZArt.color("--site-g2")); gr.addColorStop(0.9, ZArt.color("--site-g3"));
    return gr;
  }
  function roughLine(g, pts, width, bow) {
    for (let pass = 0; pass < 2; pass++) {
      g.beginPath();
      const j = () => r(-1, 1) * bow * 0.25;
      g.moveTo(pts[0][0] + j(), pts[0][1] + j());
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
        g.quadraticCurveTo((x0 + x1) / 2 + j() * 2, (y0 + y1) / 2 + j() * 2, x1 + j(), y1 + j());
      }
      g.lineWidth = width * (pass ? 0.7 : 1);
      g.stroke();
    }
  }
  function attachScribble(el) {
    if (el._scribble) return;
    const cv = document.createElement("canvas");
    cv.className = "z-scribble";
    el.appendChild(cv);
    el._scribble = cv;
    let tw;
    const draw = () => {
      const w = Math.floor(el.offsetWidth), h = Math.max(4, Math.floor(el.offsetHeight * 0.5));
      if (cv.width !== w) { cv.width = w; cv.height = h; }
      const g = cv.getContext("2d");
      g.clearRect(0, 0, w, h);
      g.strokeStyle = gradFor(g, w);
      const a = w / 8, n = h * 0.5, o = h * 0.1, k = Math.max(1, innerWidth / 1440);
      const xs = [0.2, 1, 2, 3, 4, 5, 6, 7, 7.8];
      roughLine(g, xs.map((x) => [a * x + r(-1, 1) * 5, n + r(-1, 1) * o]), (isSP() ? r(1.5, 2) : r(2.5, 3)) * k, r(4, 10));
      if (Math.random() < 0.15) roughLine(g, xs.map((x, i) => [a * x + r(-1, 1) * 5, n + r(-1, 1) * h * 0.4 * (i === 0 || i === 8 ? 0.5 : 1)]), r(1.5, 2.2) * k, r(4, 10));
    };
    let count = 0;
    el._start = () => { cv.classList.add("is-show"); tw && tw.kill(); tw = gsap.to({}, { duration: 1, repeat: -1, onUpdate: () => { if (count++ % 2 === 0) draw(); } }); };
    el._stop = () => { tw && tw.kill(); cv.classList.remove("is-show"); cv.getContext("2d").clearRect(0, 0, cv.width, cv.height); };
    if (matchMedia("(any-hover: hover)").matches) {
      el.addEventListener("mouseenter", el._start);
      el.addEventListener("mouseleave", el._stop);
    }
  }

  /* ---------- Spiral thumbnails: the same image layered, smaller and rotated each time ---------- */
  function buildGyres() {
    $$(".z-gyre").forEach((el) => {
      const W = 960, H = Math.round(960 * el.offsetHeight / Math.max(1, el.offsetWidth));
      const url = `url(${ZArt.photoURL(el.dataset.photo, W, H)})`;
      el.innerHTML = "";
      const layers = [0, 1, 2, 3].map(() => { const d = document.createElement("div"); d.className = "z-gyre__img"; d.style.backgroundImage = url; el.appendChild(d); return d; });
      const arrow = document.createElement("span"); arrow.className = "z-arrow"; el.appendChild(arrow);
      const S = 0.5146, R = 19.495;
      gsap.set(layers[1], { rotate: R * 0.333, scale: 1 - (1 - S) * 0.333 });
      gsap.set(layers[2], { rotate: R * 0.666, scale: 1 - (1 - S) * 0.666 });
      const hover = gsap.timeline({ paused: true }).to(layers[3], { duration: 1, ease: "power1.inOut", rotate: R }).to(layers[3], { duration: 1, ease: "power1.inOut", scale: S }, "<");
      const host = el.closest("a, .z-card") || el;
      let t;
      const enter = () => { gsap.to(hover, { time: hover.duration(), duration: 0.8, ease: "power1.out" }); t && t.kill(); t = gsap.delayedCall(0.36, () => el.classList.add("is-hover")); };
      const leave = () => { gsap.to(hover, { time: 0, duration: 0.6, ease: "power1.out", overwrite: true }); t && t.kill(); el.classList.remove("is-hover"); };
      host.addEventListener("mouseenter", () => !isSP() && enter());
      host.addEventListener("mouseleave", () => !isSP() && leave());
      // On mobile, it unfolds when it enters the middle of the screen (40~70%).
      let inside = false;
      ScrollTrigger.create({
        trigger: el, start: "top bottom", end: "bottom top",
        onUpdate: (st) => {
          if (!isSP()) return;
          const p = st.progress;
          if (p > 0.4 && p < 0.7) { if (!inside) { inside = true; gsap.to(hover, { time: hover.duration(), duration: 0.8, ease: "power1.out" }); } }
          else if (inside) { inside = false; gsap.to(hover, { time: 0, duration: 0.8, ease: "power1.out", overwrite: true }); }
        },
      });
    });
  }

  /* ---------- Slit glass: same pixi DisplacementFilter as the original (scale x 100·y .5) — only the displacement map is redrawn as 8 vertical grooves ---------- */
  // Map line = Horizontal ramp (distance to push out) where red fills from 0→255. The map image is a number, not a color, so use it directly as pixel values.
  let slitMap;
  function slitMapCanvas() {
    if (slitMap) return slitMap;
    const W = 512, H = 4, cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d"), img = g.createImageData(W, H);
    for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
      const i = (y * W + x) * 4;
      img.data[i] = Math.round(((x % 64) / 63) * 255); img.data[i + 1] = 128; img.data[i + 2] = 128; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return (slitMap = cv);
  }
  // Photo slot (.z-slit[data-photo]): cursor distance ×60 is the intensity (follows in .25s power1.out), 0 if the cursor is inside the image, −0.5 if it leaves only vertically.
  // Video slot (.z-slit[data-video]): constant intensity, the groove widens toward the top and bottom ends (outside 25%·75%) of the screen. On phones both go to the scroll position.
  const mouse = { x: 0, y: 0 };
  async function slitGlass(cv) {
    // On file:// the browser cannot upload video frames to WebGL (blocked as cross-origin) — only then a still image in the same place is used, while small videos play as is
    const host = cv.parentElement, isVideo = !!cv.dataset.video && location.protocol !== "file:";
    const app = new PIXI.Application();
    let rect = host.getBoundingClientRect();
    await app.init({ canvas: cv, width: rect.width, height: rect.height, autoStart: false, resolution: 1, antialias: false, backgroundAlpha: 0 });
    app.stage.eventMode = "none";
    const container = new PIXI.Container();
    app.stage.addChild(container);
    let large, small;
    small = cv.dataset.video ? $("video", host.parentElement) : null;
    if (isVideo) {
      large = document.createElement("video");
      Object.assign(large, { src: cv.dataset.video, muted: true, loop: true, playsInline: true, autoplay: true, preload: "auto" });
      await new Promise((ok) => (large.readyState >= 2 ? ok() : large.addEventListener("loadeddata", ok, { once: true })));
      large.play().catch(() => {});
    }
    const still = () => ZArt.photo(cv.dataset.photo || "street", 720, Math.round(720 * rect.height / Math.max(1, rect.width)));
    const sprite = new PIXI.Sprite(PIXI.Texture.from(isVideo ? large : still()));
    if (!isVideo) { sprite.anchor.set(0.5); sprite.x = sprite.width / 2; sprite.y = sprite.height / 2; }
    container.addChild(sprite);
    const map = new PIXI.Sprite(PIXI.Texture.from(slitMapCanvas()));
    map.texture.source.addressMode = "repeat";
    map.height = rect.height;
    const filter = new PIXI.DisplacementFilter({ sprite: map, scale: { x: 100, y: 0.5 } });
    app.stage.addChild(map);
    sprite.filters = [filter];
    const fit = () => {
      rect = host.getBoundingClientRect();
      app.renderer.resize(rect.width, rect.height);
      map.height = rect.height;
      if (cv.dataset.video) { sprite.width = rect.width; sprite.height = rect.height; if (!isVideo) { sprite.x = rect.width / 2; sprite.y = rect.height / 2; } }
      else { sprite.scale.set(1); container.width = rect.width + 1; container.height = rect.height + 1; }
    };
    fit();
    const m = { render: 0 };
    const follow = gsap.quickTo(m, "render", { duration: 0.25, ease: "power1.out" });
    const scrollPer = () => Math.min(1, Math.max(0, (rect.height + rect.top) / (innerHeight + rect.height)));
    app.ticker.add((tk) => {
      rect = host.getBoundingClientRect();
      const W = rect.width, per = scrollPer();
      if (cv.dataset.video) {
        if (isVideo && small) large.currentTime = small.currentTime + 0.08;
        const [n, lo, hi, k] = isSP() ? [W * 0.4, 0.3, 0.7, 1.7] : [W * 0.25, 0.25, 0.75, 1];
        map.width = per > hi ? n + (per - hi) * n * k : per < lo ? n + (lo - per) * n * k : n;
        map.x = W * 0.5;
      } else if (isSP()) {
        map.width = W * 0.5 + Math.abs(Math.min(1, (per - 0.5) * 10)) * 10;
        map.x = W * 0.5;
        filter.scale.x = 130 * (per - 0.5);
      } else {
        const inX = mouse.x >= rect.left && mouse.x <= rect.right, inY = mouse.y >= rect.top && mouse.y <= rect.bottom;
        follow(inX && inY ? 0 : inX ? -0.5 : (mouse.x - (rect.left + W / 2)) / W);
        filter.scale.x = m.render * 60;
        sprite.scale.x = Math.abs(m.render * 0.05) + 1;
        map.x += m.render * 0.1;
        map.width = W * 0.4 + Math.sin(tk.lastTime * 3e-4) * W * 0.01;
      }
    });
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { app.ticker.start(); small && small.play().catch(() => {}); } else app.ticker.stop();
    }), { rootMargin: "20% 0% 20% 0%", threshold: 0 }).observe(host);
    host.addEventListener("mouseenter", () => host.classList.add("is-hover"));
    host.addEventListener("mouseleave", () => host.classList.remove("is-hover"));
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(fit, 100); });
    app.render();
  }
  function buildSlits() {
    const cvs = $$(".z-slit");
    if (!cvs.length || !window.PIXI) return;
    addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    // Even on machines without WebGL the rest of boot (transition·bullet patterns·page motion) continues — if one fails, only the waiting ends
    return Promise.allSettled(cvs.map(slitGlass));
  }

  /* ---------- Sub-page KV: title fixed behind the screen (the original has no entrance motion either, the bar just covers it) ---------- */
  function kv() {
    const el = $(".z-kv");
    if (!el) return;
    // Hidden while the body panel covers it, but turned off then so it does not show through behind the JOIN US footer (transparent background).
    const foot = $(".z-ftypo");
    if (foot) new MutationObserver(() => el.classList.toggle("is-hide", foot.classList.contains("is-show"))).observe(foot, { attributes: true, attributeFilter: ["class"] });
  }

  // Bar width units: phone 32/390, PC 116.67/1440 · the end bars are wider by phone 3/390, PC 20/1440.
  function lineWidths(rects, mul) {
    const u = isSP() ? 32 / 390 * 100 : 116.66666667 / 1440 * 100, edge = isSP() ? 3 / 390 * 100 : 20 / 1440 * 100;
    let x = 0;
    rects.forEach((rc, i) => {
      let w = mul[i] * u;
      if (i === 0 || i === rects.length - 1) w += edge;
      rc.setAttribute("width", `${w + 0.05}%`); rc.setAttribute("x", `${x}%`); x += w;
    });
  }
  const rectsSVG = (n, h) => `<svg preserveAspectRatio="none"><g>${`<rect x="0" y="100%" width="0" height="${h}"/>`.repeat(n)}</g></svg>`;

  /* Bars covering the KV: seen from above the screen, each bar’s top edge rises from start% (90~100) → 0%. Each bar has a length of .5~1, ease power1.out|sine.out */
  function linesTop() {
    const el = $(".z-lines-top");
    if (!el) return;
    el.innerHTML = rectsSVG(8, "103%");
    const svg = $("svg", el), rects = $$("rect", el);
    let tws = [];
    const setup = () => {
      const sp = isSP();
      const mul = sp ? [1, ...shuffle([1, 2, 3, 2, 1, 1]), 1] : shuffle([1, 1, 1, 1, 1, 2, 2, 3]);
      lineWidths(rects, mul);
      const from = shuffle([100, 98, 96, 94, 93, 92, 91, 90]);
      const durs = shuffle(sp ? [0.65, 0.7, 0.78, 0.83, 0.87, 0.92, 0.95, 1] : [0.5, 0.55, 0.6, 0.65, 0.7, 0.8, 0.9, 1]);
      tws.forEach((t) => t.kill());
      tws = rects.map((rc, i) => { rc._v = { per: from[i] }; return gsap.timeline({ paused: true }).fromTo(rc._v, { per: from[i] }, { duration: durs[i], ease: Math.random() > 0.5 ? "power1.out" : "sine.out", per: 0 }); });
    };
    const size = () => { const b = el.getBoundingClientRect(); svg.setAttribute("width", b.width); svg.setAttribute("height", b.height); svg.setAttribute("viewBox", `0 0 ${b.width} ${b.height}`); svg.style.height = b.height + "px"; };
    const scroll = () => {
      const base = isSP() ? el.offsetHeight : innerHeight;
      const e = reduced ? 1 : Math.min(1, scrollY / base);
      rects.forEach((rc, i) => { const t = tws[i]; t.progress(Math.min(1, (e / t.duration()) * 0.9)); rc.setAttribute("y", `${rc._v.per + e * 100}%`); });
    };
    setup(); size(); scroll();
    lenis.on("scroll", scroll);
    addEventListener("resize", () => { setup(); size(); scroll(); });
  }

  /* Bottom bars: during the last screen the bars rise from -3% to -95~-101% and peel away, revealing the fixed JOIN US. Each bar .75~1, power1|sine.inOut */
  function linesBottom() {
    const el = $(".z-lines-bottom"), foot = $(".z-ftypo");
    if (!el || !foot) return;
    el.innerHTML = rectsSVG(8, "100%");
    const svg = $("svg", el), rects = $$("rect", el);
    let tl;
    const setup = () => {
      lineWidths(rects, isSP() ? [1, ...shuffle([1, 2, 3, 2, 1, 1]), 1] : shuffle([1, 1, 1, 1, 1, 2, 2, 3]));
      const to = shuffle([-101, -100, -100, -99, -98, -97, -96, -95]);
      tl && tl.kill();
      tl = gsap.timeline({ paused: true });
      rects.forEach((rc, i) => tl.fromTo(rc, { attr: { y: "-3%" } }, { duration: r(0.75, 1), ease: Math.random() > 0.5 ? "power1.inOut" : "sine.inOut", attr: { y: `${to[i]}%` } }, 0));
    };
    const size = () => { const b = el.getBoundingClientRect(); svg.setAttribute("viewBox", `0 0 ${b.width} ${b.height}`); svg.style.height = b.height + "px"; };
    const grad = $(".z-ftypo__grad");
    const scroll = () => {
      const dh = document.documentElement.scrollHeight, wh = innerHeight;
      const p = Math.min(1, Math.max(0, scrollY - (dh - wh * 2)) / wh);
      tl.progress(reduced ? (p > 0 ? 1 : 0) : p);
      foot.classList.toggle("is-show", el.getBoundingClientRect().top < wh);
      const t = el.getBoundingClientRect().top;
      if (grad) grad.style.transform = `translateY(${Math.max(0, Math.min(wh, t * (isSP() ? 1.4 : 1)))}px)`;
    };
    setup(); size(); scroll();
    lenis.on("scroll", scroll);
    addEventListener("resize", () => { setup(); size(); scroll(); });
  }

  /* ---------- Page transition: a bar fills in one of four colors then navigates, and exits upward on the new page ---------- */
  const TRANS_COLORS = ["--site-mint", "--site-yellow", "--site-purple", "--kf-accent"];
  function transBars() {
    const wrap = $(".z-trans"), svg = $("svg", wrap), g = $("g", svg);
    const mul = shuffle(isSP() ? [1, 1, 1, 1, 1, 2, 2, 3, 1, 1, 1, 1, 1, 2, 2, 3] : [1, 1, 1, 1, 1, 2, 2, 3, 1, 1, 1, 1, 1, 2, 2, 3, 1, 1, 1, 1, 1, 2, 2, 3]);
    const unit = 100 / mul.reduce((a, b) => a + b, 0);
    let x = 0;
    g.innerHTML = mul.map((m) => { const w = m * unit; const s = `<rect x="${x}%" y="103%" width="${w + 0.03}%" height="100%"/>`; x += w; return s; }).join("");
    svg.setAttribute("viewBox", `0 0 ${innerWidth} ${innerHeight}`);
    return { wrap, rects: $$("rect", g), g };
  }
  function transition() {
    const pick = sessionStorage.getItem("z-trans");
    if (pick) {
      sessionStorage.removeItem("z-trans");
      const { wrap, rects, g } = transBars();
      g.style.fill = `var(${pick})`;
      rects.forEach((rc) => rc.setAttribute("y", "0%"));
      wrap.classList.add("is-on");
      document.documentElement.classList.remove("z-cover");
      const durs = shuffle([0.3, 0.4, 0.5, 0.3, 0.4, 0.5, 0.3, 0.4].flatMap((v) => [v, v, v]));
      rects.forEach((rc, i) => gsap.to(rc, { duration: durs[i], delay: 1 / 30, ease: ["power3.out", "power4.out", "expo.out"][Math.floor(r(0, 3))], attr: { y: "-103%" } }));
      gsap.delayedCall(0.6, () => wrap.classList.remove("is-on"));
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.metaKey || e.ctrlKey || a.target) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html$/.test(url.pathname)) return;
      if (url.pathname === location.pathname) { if (url.hash) { e.preventDefault(); const t = $(url.hash); t && lenis.scrollTo(t); } return; }
      e.preventDefault();
      const { wrap, rects, g } = transBars();
      const color = TRANS_COLORS[Math.floor(r(0, 4))];
      g.style.fill = `var(${color})`;
      wrap.classList.add("is-on");
      const durs = shuffle([0.3, 0.4, 0.5, 0.3, 0.4, 0.5, 0.3, 0.4].flatMap((v) => [v, v, v]));
      let end = 0;
      rects.forEach((rc, i) => {
        const d = r(0, 0.15);
        end = Math.max(end, d + durs[i]);
        gsap.fromTo(rc, { attr: { y: "103%" } }, { duration: durs[i], delay: d, ease: ["power2.in", "power3.in", "power4.in"][Math.floor(r(0, 3))], attr: { y: "0%" } });
      });
      sessionStorage.setItem("z-trans", color);
      gsap.delayedCall(reduced ? 0 : end + 0.05, () => (location.href = url.href));
    });
    $$('a[href="#top"]').forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); lenis.scrollTo(0); }));
    // Original YT: hovering the back-to-top button makes the arrow slip upward (.12s) and then rise thinly again from below (.35s power4.out)
    $$(".z-fnav__top").forEach((a) => {
      const i = $("i", a);
      a.addEventListener("mouseenter", () => {
        if (reduced || !i) return;
        gsap.killTweensOf(i);
        gsap.timeline().to(i, { duration: 0.12, ease: "power2.out", yPercent: -165, scaleX: 0.5 }).set(i, { yPercent: 200, scaleX: 0.1 }).to(i, { duration: 0.35, ease: "power4.out", yPercent: 0, scaleX: 1 });
      });
    });
  }

  /* ---------- On entering the screen .is-inview (original IntersectionObserver: turns on when entering, turns off only after leaving downward) ---------- */
  function inview(sel, opt = {}) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add(opt.cls || "is-inview");
      else if (e.boundingClientRect.top > 0) e.target.classList.remove(opt.cls || "is-inview");
    }), { rootMargin: opt.margin || "0% 0%" });
    $$(sel).forEach((el) => io.observe(el));
  }

  /* ---------- ENTRY button: after appearing, every 5 seconds the face closes into a circle (.2s) and opens as a different face — original startIconLoop (31 shuffled, in order) ---------- */
  let faces = [], faceCalls = [];
  function iconLoop(t = 0) {
    const face = $(".z-entry__face"), icon = $(".z-entry__icon");
    if (!faces.length) faces = shuffle(Array.from({ length: 31 }, (_, i) => i + 1));
    const next = faces.shift();
    faceCalls.forEach((c) => c.kill());
    t += 1 / 30;
    faceCalls = [
      gsap.delayedCall(t, () => icon.classList.add("is-hide")),
      gsap.delayedCall(t + 0.21, () => { icon.dataset.seed = next; ZArt.paintArt(face); }),
      gsap.delayedCall(t + 0.21 + 1 / 30, () => icon.classList.remove("is-hide")),
      gsap.delayedCall(t + 0.21 + 1 / 30 + 5, () => iconLoop()),
    ];
  }
  function showEntry() {
    const el = $(".z-entry");
    // Original t3: on the ENTRY page (content-id 4), hide the floating ENTRY button
    if (page === "entry" || el.classList.contains("is-show")) return;
    el.classList.add("is-show");
    if (!reduced) iconLoop(5);
  }

  window.ZK = { $, $$, isSP, px, vw, r, shuffle, lenis, reduced, page, fitText, paintPhotos, attachScribble, gradFor, roughLine, inview, showEntry };

  renderFrame();
  menu();

  // Register page scripts with ZK.ready(fn). Home raises the ZBack burst and the head by itself after the loader ends.
  const queue = [];
  ZK.ready = (fn) => queue.push(fn);
  async function boot() {
    // Original swup lifts the bar as soon as the body is swapped — first of all, without waiting for fonts, images or WebGL to be ready
    transition();
    await document.fonts.ready;
    ZArt.paintArt();
    paintPhotos();
    buildMarquees();
    $$("[data-scribble]").forEach(attachScribble);
    fitText();
    buildGyres();
    kv();
    linesTop();
    linesBottom();
    await buildSlits();
    await ZBackInit();
    for (const fn of queue) await fn();
    if (page !== "home") {
      // Stops the flash while the body board covers the barrage (the original also shows it only in the KV·JOIN US range).
      const lines = $(".z-lines-top"), foot = $(".z-ftypo");
      const cover = () => document.body.classList.toggle("is-covered", (!lines || lines.getBoundingClientRect().bottom < innerHeight * 0.5) && !(foot && foot.classList.contains("is-show")));
      cover();
      lenis.on("scroll", cover);
      document.body.classList.add("is-head");
      // Entering a sub-page directly has no loader, so like the original (time.start) it idles calmly for 10s, then gradually ramps up the frenzy (text band after 6s · white text over 12s).
      // When arriving from within the site, it starts having taken over the rush that was running on the previous page, like the original (swup).
      if (viaTrans) {
        // If arriving from the previous page, ENTRY is also shown immediately as if it had been floating already — after drawing one frame, release the motion-off
        ZBack.continueBurst();
        showEntry();
        requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove("z-via")));
      } else {
        gsap.delayedCall(10, () => ZBack.startBurst(false));
        gsap.delayedCall(0.6, showEntry);
      }
    }
    ScrollTrigger.refresh();
    let rt, lastW = innerWidth;
    addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (innerWidth === lastW) return;
        lastW = innerWidth;
        ZArt.paintArt(); paintPhotos(); fitText(); ScrollTrigger.refresh();
      }, 200);
    });
  }
  addEventListener("DOMContentLoaded", boot);
})();
