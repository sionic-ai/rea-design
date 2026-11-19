// Shared by all pages — loader · header · floating button · picture band before the footer · footer · page transition · scroll effects · watercolor art
const MG = (() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSP = () => document.body.clientWidth < 768;
  const PC = !isSP();
  // Original rpx — px based on a 1440 (phone 375) screen, converted to the current width
  const rpx = (v) => (v * document.body.clientWidth) / (PC ? 1440 : 375);
  const page = document.body.dataset.page || "home";
  const ST = ScrollTrigger;
  ST.config({ ignoreMobileResize: true });

  // Logo symbol — a five-petal cluster outline + one wave stroke inside (redrawn in the same one-stroke outline + inner stroke form as the original symbol)
  const MARK = "M28 60c4-12 12-16 17-8 4 7 9 7 12-1 3-7 9-8 12 0M48 9c9-1 14 6 21 8 10 3 19 9 19 20 0 7-5 11-4 18 1 8 6 14 1 22-5 9-15 9-22 12-7 3-11 7-19 6s-13-6-19-9c-9-4-18-8-19-19-1-8 4-12 4-19 0-8-5-14-1-22 4-9 14-9 21-12 6-3 11-5 18-5z";
  const mark = (cls = "") => `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true"><path d="${MARK}"/></svg>`;
  const logo = (lines) => `<span class="mg-logo">${mark()}<span class="mg-logo__type" data-label="Brand English name · Three lines">${lines}</span></span>`;
  const NAV = [
    ["index.html", "TOP", "Hero", "home"], ["#", "INFO", "Admission fee · Hours"], ["#", "GARDEN", "View garden"],
    ["news.html", "EVENT", "Event info", "news"], ["#", "GUIDE", "Garden guide"], ["about.html", "ABOUT", "About the garden", "about"],
    ["faq.html", "FAQ", "Frequently asked questions", "faq"], ["#", "ACCESS", "Directions"],
  ];
  const ROLL = 'data-fx="char-roll" data-fx-char-roll="mode: once; dur: .75; ease: 0.19,1,0.22,1; gap: 2; frames: 3"';
  const ICONS = {
    ig: '<svg viewBox="0 0 22 22"><rect x="2" y="2" width="18" height="18" rx="5.5"/><circle cx="11" cy="11" r="4.4"/><circle cx="16.3" cy="5.7" r=".6"/></svg>',
    x: '<svg viewBox="0 0 22 22"><path d="M4 3l14 16M18 3L4 19"/></svg>',
    yt: '<svg viewBox="0 0 22 22"><rect x="1.5" y="4.5" width="19" height="13" rx="4"/><path d="M9.5 8.5l4.5 2.5-4.5 2.5z"/></svg>',
  };

  // ---------- Embedding ----------
  // For every page where the loader is blocked <body> Place as the first child — if inserted by script, the body shows through on the first frame and then gets covered
  const intro = document.querySelector(".mg-intro");

  const header = document.querySelector(".mg-header");
  header.innerHTML = `<div class="mg-header__bg"></div>
    <h1 class="mg-header__logo"><a href="index.html" aria-label="First Page">${logo("Brand<br>Garden<br>Name")}</a></h1>
    <div class="mg-header__menu"><button class="mg-header__toggle" type="button" aria-label="Menu" aria-expanded="false"><i></i></button>
      <div class="mg-header__container"><nav class="mg-nav"><ul class="mg-nav__list">${NAV.map(([h, en, ja, key]) =>
        `<li class="mg-nav__item"><a class="mg-nav__link" href="${h}" ${ROLL}${key === page ? ' aria-current="page"' : ""}><span class="mg-nav__label" data-fx-part="text">${en}</span><span class="mg-nav__ja"><span>${ja}</span></span></a></li>`).join("")}</ul></nav></div></div>
    <nav class="mg-header__sns"><ul class="mg-sns"><li><a href="#" aria-label="Social Media">${ICONS.ig}</a></li><li><a href="#" class="is-word">blog</a></li><li><a href="#" aria-label="X">${ICONS.x}</a></li><li><a href="#" aria-label="Video channel">${ICONS.yt}</a></li></ul></nav>`;

  const floater = document.querySelector(".mg-floater");
  const petals = `<div class="mg-floater__buttons"><a class="mg-petal is-ticket mg-arrow-host" href="#"><span class="mg-petal__title">TICKET</span><span class="mg-petal__label">Online tickets</span><span class="mg-tri"></span></a><a class="mg-petal mg-arrow-host" href="#"><span class="mg-petal__title">Members</span><span class="mg-petal__label">Membership</span><span class="mg-tri"></span></a></div>`;
  floater.insertAdjacentHTML("beforeend", petals);

  const footer = document.querySelector(".mg-footer");
  footer.innerHTML = `<div class="mg-footer__container">
      <div class="mg-footer__logo">${logo("Brand<br>Garden<br>Name")}</div>
      <p class="mg-footer__info"><em>Brand Garden Name</em><br>Your garden name in Korean script here<br class="mg-sp">(Your former name here, one line)<br>Postal code 000-0000 Your address here in one line, No. 00<br>TEL 000-000-0000 / FAX 000-000-0000</p>
      <p class="mg-footer__partner"><a class="mg-uline" href="#">Operating company name</a> (Operations management: <a class="mg-uline" href="#">Management company name</a>)</p>
      <div class="mg-footer__links"><em>PARTNER LINK</em><a class="mg-uline" href="#">Partner One</a><a class="mg-uline" href="#">Tourism guide site name</a><a class="mg-uline" href="#">Cruise Ship Name</a><a class="mg-uline" href="#">Garden Alliance Name</a></div>
      <nav class="mg-footer__nav"><a href="faq.html">Frequently asked questions</a><a href="#">Contact Us</a><a href="#">Sitemap</a><a href="#">Site Policy</a><a href="#">Privacy policy</a></nav>
      <a href="#top" class="mg-backtop" data-jump>PAGE TOP</a>
      <small class="mg-footer__small">©Brand Garden Name All rights reserved.</small>
    </div>`;

  // ---------- Watercolor garden painting (the original hand-drawn spot) ----------
  const tone = (() => {
    const probe = document.createElement("i");
    probe.style.display = "none";
    document.body.append(probe);
    const cache = {};
    return (name) => {
      if (cache[name]) return cache[name];
      probe.style.color = `var(${name})`;
      return (cache[name] = getComputedStyle(probe).color);
    };
  })();
  const rnd = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const paintGarden = (box) => {
    const w = Math.round(box.clientWidth), h = Math.round(box.clientHeight);
    if (!w || !h) return;
    let c = box.querySelector("canvas");
    if (!c) { c = document.createElement("canvas"); box.prepend(c); }
    if (c.width === w && c.height === h) return;
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    const R = rnd(+(box.dataset.seed || 7));
    const kind = box.dataset.paint || "panorama";
    const leaf = tone("--site-leaf"), deep = tone("--site-leaf-deep"), lawn = tone("--site-lawn"), water = tone("--site-water"), path = tone("--site-path"), bloom = tone("--site-badge"), ink = tone("--kf-ink"), bg = tone("--kf-bg");
    const blot = (x, y, r, col, a) => { g.globalAlpha = a; g.fillStyle = col; g.beginPath(); for (let i = 0; i <= 10; i++) { const t = (i / 10) * Math.PI * 2, rr = r * (.82 + R() * .3); g.lineTo(x + Math.cos(t) * rr, y + Math.sin(t) * rr * .9); } g.fill(); };
    const tree = (x, y, s) => { for (let i = 0; i < 6; i++) blot(x + (R() - .5) * s * 1.2, y - R() * s * 1.1, s * (.45 + R() * .35), i % 3 ? leaf : deep, i % 3 ? .42 : .3); blot(x, y + s * .2, s * .5, deep, .18); };
    const ring = (cx, cy, rx, ry, col, a, lw) => { g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke(); };
    const fill = (cx, cy, rx, ry, col, a) => { g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
    const wind = (pts, col, a, lw) => { g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.quadraticCurveTo(pts[i - 1][0], pts[i - 1][1], (x + pts[i - 1][0]) / 2, (y + pts[i - 1][1]) / 2) : g.moveTo(x, y))); g.stroke(); };
    const flowers = (x0, y0, x1, y1, n) => { for (let i = 0; i < n; i++) blot(x0 + R() * (x1 - x0), y0 + R() * (y1 - y0), w * .004 * (1 + R()), i % 4 ? bloom : ink, .55); };
    g.clearRect(0, 0, w, h);
    g.globalAlpha = 1; g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const S = Math.max(w, h * 1.2);
    if (kind === "terrace") {
      fill(w * .5, h * .55, w * .62, h * .5, lawn, .55);
      for (let i = 7; i > 0; i--) { ring(w * .5, h * .58, w * .1 + i * w * .065, h * .07 + i * h * .06, i % 2 ? leaf : lawn, .6, w * .022); }
      fill(w * .5, h * .5, w * .2, h * .13, water, .75);
      fill(w * .5, h * .56, w * .12, h * .065, path, .9);
      for (let i = 0; i < 70; i++) tree(R() * w, h * (.04 + R() * .18), S * (.008 + R() * .014));
      flowers(0, h * .1, w, h * .25, 80);
    } else if (kind === "aerial") {
      g.globalAlpha = .6; g.fillStyle = water; g.beginPath(); g.moveTo(0, 0); g.lineTo(w * .75, 0); g.lineTo(0, h * .75); g.fill();
      wind([[0, h * .78], [w * .4, h * .42], [w * .8, h * .02]], path, .8, w * .02);
      fill(w * .55, h * .5, w * .28, h * .2, lawn, .5);
      for (let i = 6; i > 0; i--) ring(w * .62, h * .36, w * .02 + i * w * .018, h * .015 + i * h * .014, leaf, .55, w * .008);
      g.globalAlpha = .55; g.strokeStyle = ink; g.lineWidth = 1.2; g.strokeRect(w * .36, h * .22, w * .1, h * .12);
      for (let i = 0; i < 70; i++) { const t = R(); tree(w * (.25 + t * .75) + (R() - .5) * w * .25, h * (.95 - t * .7) + (R() - .5) * h * .3, S * (.012 + R() * .02)); }
      flowers(w * .35, h * .45, w * .9, h * .9, 120);
    } else {
      fill(w * .5, h * .95, w * .7, h * .5, lawn, .5);
      for (let i = 0; i < 230; i++) { const y = .1 + R() * .45; tree(R() * w, h * y, S * (.006 + R() * .012) * (.6 + y)); }
      wind([[w * .02, h * .9], [w * .25, h * .62], [w * .5, h * .7], [w * .72, h * .55], [w * .98, h * .6]], path, .75, w * .012);
      flowers(w * .08, h * .5, w * .95, h * .8, 160);
      fill(w * .52, h * .92, w * .2, h * .08, water, .75);
      for (let i = 1; i < 5; i++) ring(w * .52, h * 1.02, w * .2 + i * w * .07, h * .12 + i * h * .06, leaf, .45, w * .012);
    }
    // As in the original image, the top and bottom edges bleed toward the paper and fade out
    const fade = box.dataset.fade || "top";
    g.globalAlpha = 1;
    g.globalCompositeOperation = "destination-out";
    if (fade.includes("top")) { const gr = g.createLinearGradient(0, 0, 0, h * .22); gr.addColorStop(0, bg); gr.addColorStop(1, "transparent"); g.fillStyle = gr; g.fillRect(0, 0, w, h * .22); }
    if (fade.includes("bottom")) { const gr = g.createLinearGradient(0, h, 0, h * .8); gr.addColorStop(0, bg); gr.addColorStop(1, "transparent"); g.fillStyle = gr; g.fillRect(0, h * .8, w, h * .2); }
    g.globalCompositeOperation = "source-over";
  };
  const paintAll = () => document.querySelectorAll("[data-paint]").forEach(paintGarden);
  new ResizeObserver(() => paintAll()).observe(document.body);

  // ---------- Smooth scroll (desktop only, original smooth 1.5 · effects · normalizeScroll) ----------
  const onScroll = [];
  let smoother = null;
  if (PC && !reduce) smoother = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1.5, speed: 1, effects: true, normalizeScroll: true, onUpdate: (s) => onScroll.forEach((f) => f(s.scrollTop())) });
  else addEventListener("scroll", () => onScroll.forEach((f) => f(Math.max(0, scrollY))), { passive: true });
  const toTop = () => (smoother ? smoother.scrollTo(0, true) : gsap.to(window, { duration: reduce ? 0 : 1, scrollTo: { y: 0, autoKill: false }, ease: "expo.out" }));
  document.querySelectorAll("a[data-jump]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); toTop(); }));

  // ---------- Header: on PC it moves up out of the way by the amount scrolled down (max 170) and returns on scroll up · on phones it flows away on scroll down and sticks on scroll up ----------
  const toggle = header.querySelector(".mg-header__toggle");
  let open = false;
  const setOpen = (v) => { open = v; header.classList.toggle("open", v); toggle.setAttribute("aria-expanded", v); };
  toggle.addEventListener("click", () => setOpen(!open));
  const cur = header.querySelector('.mg-nav__link[aria-current="page"]');
  if (cur) cur.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); toTop(); }, true);
  if (page === "home") header.querySelector(".mg-header__logo a").addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); toTop(); }, true);
  if (PC) {
    let stuck = false, last = 0, off = 0;
    onScroll.push((t) => {
      off = Math.min(rpx(170), Math.max(0, off + (t - last)));
      header.style.transform = `translateY(${-off}px)`;
      last = t;
      if (stuck) { if (t <= rpx(170) / 5) { header.classList.remove("stick"); stuck = false; } }
      else if (t > rpx(170)) { header.classList.add("stick"); stuck = true; }
    });
  } else {
    let prev = 0, stick = false, fix = false, s = 0;
    addEventListener("scroll", () => {
      const a = rpx(100), t = Math.max(0, scrollY);
      if (t + innerHeight >= document.documentElement.scrollHeight) return;
      if (t <= 0) { header.classList.remove("stick", "fix"); header.style.top = "0px"; stick = fix = false; s = 0; prev = t; return; }
      if (prev >= t) {
        if (!stick && t > s && t > a) { header.classList.add("stick"); header.style.top = `${t}px`; stick = true; s = t; }
        if (!fix && t < s - a) { header.classList.add("fix"); fix = true; }
      } else {
        stick = false;
        if (fix) { header.classList.remove("fix"); header.style.top = `${t + a}px`; s = t + a; fix = false; }
        if (open && t >= Math.max(a, s)) setOpen(false);
      }
      prev = t;
    }, { passive: true });
  }

  // ---------- Floating button: steps aside downward by the scrolled amount (PC 170 · phone 85), and goes further down at 170 from the end of the last picture strip ----------
  {
    const D = PC ? 170 : 85;
    let end = 0, last = 0, off = 0;
    const move = (t) => { off = Math.min(rpx(D), Math.max(0, off + (t - last))); floater.style.transform = `translateY(${off + end}px)`; last = t; };
    const tail = document.querySelector("[data-floater-end]");
    if (tail) ST.create({ trigger: tail, start: () => `bottom-=${rpx(D)} bottom`, end: "bottom bottom", onUpdate: (st) => { end = st.progress * rpx(D); }, invalidateOnRefresh: true });
    onScroll.push(move);
  }

  // ---------- Image strip parallax: -11% → 9% while crossing the screen ----------
  document.querySelectorAll("[data-parallax]").forEach((box) => {
    const img = box.firstElementChild;
    if (reduce || !img) return;
    ST.create({ trigger: box, start: "top bottom", end: "bottom top", onUpdate: (st) => { img.style.transform = `translateY(${9 - 20 * (1 - st.progress)}%)`; }, invalidateOnRefresh: true });
  });

  // ---------- Bold curves: the hero (fv) draws in 1.5s once the curtain lifts, the very end (ft) once 33% has entered ----------
  const lenSet = (orn) => orn.querySelectorAll("path").forEach((p) => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = reduce ? 0 : l; });
  document.querySelectorAll(".mg-orn--in").forEach(lenSet);
  const drawIn = (orn, on) => orn.querySelectorAll("path").forEach((p) => { p.style.strokeDashoffset = on ? 0 : p.getTotalLength(); });
  document.querySelectorAll(".mg-orn--ft").forEach((orn) => ST.create({ trigger: orn, start: "33.3333% bottom", end: "bottom bottom", onEnter: () => drawIn(orn, true), onLeaveBack: () => drawIn(orn, false), invalidateOnRefresh: true }));

  // ---------- Footer: stays fixed at the screen bottom while content rises from -50% to -100% at half speed (PC) ----------
  if (PC && !reduce) {
    const box = footer.querySelector(".mg-footer__container");
    ST.create({ trigger: footer, start: "top bottom", end: "bottom bottom", pin: true, pinSpacing: false, onUpdate: (st) => { box.style.transform = `translateY(${-50 - 50 * st.progress}%)`; }, invalidateOnRefresh: true });
  }

  // ---------- Loader stages: body.active when the curtain starts lifting, body.contentsready when it has fully lifted ----------
  intro.addEventListener("fx:open", () => document.body.classList.add("active"));
  intro.addEventListener("fx:done", () => {
    document.body.classList.add("contentsready");
    document.querySelectorAll(".mg-orn--fv").forEach((o) => drawIn(o, true));
    dispatchEvent(new Event("mg:ready"));
  });

  // ---------- Page transition: white curtain .3s → navigate after .5s ----------
  const root = document.documentElement;
  addEventListener("pageshow", () => root.classList.remove("transit-ready", "transit"));
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || a.target === "_blank" || a.hasAttribute("data-jump")) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    if (e.metaKey || e.ctrlKey) { window.open(href); return; }
    root.classList.add("transit-ready");
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("transit")));
    setTimeout(() => { location.href = href; }, reduce ? 0 : 500);
  });

  addEventListener("load", () => { paintAll(); ST.refresh(); });
  paintAll();
  return { smoother, reduce, PC, rpx, onScroll };
})();
