// Draws the header, menu drawer, SNS tab, booking badge, page-end banner and footer in one place so every page uses the same look.
(() => {
  const page = document.body.dataset.page;

  const sprite = `
<svg class="jd-sprite" aria-hidden="true">
  <symbol id="i-seiro" viewBox="0 0 30 22"><g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
    <path d="M4 15c0-6 5-10 11-10s11 4 11 10"/><path d="M2 15h26M4 15v3.5h22V15"/><path d="M13 5c0-2 4-2 4 0"/><path d="M9 11c2-2 4-3 6-3M21 11c-2-2-4-3-6-3"/></g></symbol>
  <symbol id="i-search" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6.5" cy="6.5" r="4.8"/><path d="M10 10l4.5 4.5" stroke-linecap="round"/></g></symbol>
  <symbol id="i-pin" viewBox="0 0 16 16"><path d="M8 1.5a4.8 4.8 0 0 0-4.8 4.8C3.2 10 8 14.5 8 14.5s4.8-4.5 4.8-8.2A4.8 4.8 0 0 0 8 1.5Zm0 6.6a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6Z" fill="none" stroke="currentColor" stroke-width="1.3"/></symbol>
  <symbol id="i-corner" viewBox="0 0 26 26"><g fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 1h24v24"/><path d="M5 5h16v16"/><path d="M9 9h8v8h-4v-4"/></g></symbol>
  <symbol id="i-tel" viewBox="0 0 16 16"><path d="M4 1.5l2.2 3-1.4 1.6a8 8 0 0 0 5 5l1.6-1.4 3 2.2-1.2 2.4C8 14 2 8 1.6 2.7Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></symbol>
  <symbol id="i-web" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1.5" y="2.5" width="13" height="9" rx="1"/><path d="M5 14h6M8 11.5V14"/></g></symbol>
  <symbol id="i-arrow-fill" viewBox="0 0 14 14"><path d="M1 6.3h9.7L6.9 2.6l1-1L13.4 7l-5.5 5.4-1-1 3.8-3.7H1Z"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 16 16"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="illo-pair" viewBox="0 0 160 120"><g style="stroke: var(--kf-ink)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M28 90c0-22 9-33 21-33s20 11 20 33" style="fill: var(--site-gold)"/><circle cx="49" cy="40" r="11" style="fill: var(--kf-surface)"/><path d="M37.5 40c-1-14 23-14 22.5 0-4-6-16-6-22.5 0Z" style="fill: var(--kf-ink)"/>
    <path d="M63 67l16-9 4-9" fill="none"/><path d="M80 41h7l-1 9h-5Z" style="fill: var(--kf-surface)"/>
    <path d="M94 90c0-22 9-33 21-33s20 11 20 33" style="fill: var(--kf-accent)"/><circle cx="115" cy="40" r="11" style="fill: var(--kf-surface)"/><path d="M103.5 42c-3-17 26-17 23 0-3-7-18-7-23 0Z" style="fill: var(--kf-ink)"/>
    <path d="M100 67l-9-9v-8" fill="none"/><path d="M87 41h7l-1 9h-5Z" style="fill: var(--kf-surface)"/>
    <path d="M12 90h136M28 90v24M132 90v24" fill="none"/>
    <path d="M66 89v-6a14 5 0 0 1 28 0v6Z" style="fill: var(--kf-raised)"/><path d="M68 80c4-3 20-3 24 0" fill="none"/></g></symbol>
  <symbol id="illo-trio" viewBox="0 0 220 130"><use href="#illo-pair" x="0" y="10" width="160" height="120"/><g style="stroke: var(--kf-ink)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M160 100c0-22 9-33 21-33s20 11 20 33" style="fill: var(--kf-accent)"/><circle cx="181" cy="50" r="11" style="fill: var(--kf-surface)"/><path d="M169.5 52c0-16 23-16 23 0l-3-8c-6 4-12 4-17 0Z" style="fill: var(--kf-ink)"/>
    <path d="M166 77l-12 6-6 4" fill="none"/><path d="M148 100h66" fill="none"/>
    <path d="M190 16v14M178 30h24l-4 8h-16Z" style="fill: var(--kf-accent)"/></g></symbol>
</svg>`;

  // The original badge is cloud-shaped (ruyi) — points on an ellipse are joined by outward-bulging arcs to build a new petal rim with the same feel
  const scallop = (cx, cy, rx, ry, n, k) => {
    const pts = Array.from({ length: n }, (_, i) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
    });
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % n];
      const r = Math.hypot(q[0] - p[0], q[1] - p[1]) * k;
      d += ` A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
    });
    return d + "Z";
  };

  const sub = (items) => `<div class="hd-gnav__sub">${items.map(([t, h]) => `<a href="${h}">${t}</a>`).join("")}</div>`;
  const header = `
<a class="hd-logo" href="index.html" aria-label="Home"><span class="hd-logo__mark"><b>Business name</b><i>LOGO</i></span></a>
<nav class="hd-gnav" aria-label="Main menu">
  <div class="hd-gnav__item"><button class="hd-gnav__link" type="button"><span class="hd-gnav__label">Home</span><span class="hd-gnav__sym is-plus" aria-hidden="true"></span></button>${sub([["Message", "index.html#message"], ["Signature Menu", "index.html#menu"], ["Stubbornness", "index.html#feature"], ["Brand", "index.html#brand"]])}</div>
  <div class="hd-gnav__item"><button class="hd-gnav__link" type="button"><span class="hd-gnav__label">Find a store / Menu</span><span class="hd-gnav__sym is-plus" aria-hidden="true"></span></button>${sub([["Search by region", "list.html#area"], ["Find by brand", "list.html#brand"]])}</div>
  <div class="hd-gnav__item"><a class="hd-gnav__link" href="news.html"><span class="hd-gnav__label">News</span><span class="hd-gnav__sym">▸</span></a></div>
  <div class="hd-gnav__item"><button class="hd-gnav__link" type="button"><span class="hd-gnav__label">Company Info</span><span class="hd-gnav__sym is-plus" aria-hidden="true"></span></button>${sub([["Message from the CEO", "about.html#greeting"], ["History", "about.html#history"], ["Company overview", "about.html#outline"]])}</div>
  <div class="hd-gnav__item"><a class="hd-gnav__link" href="#"><span class="hd-gnav__label">Hiring Info</span><span class="hd-gnav__sym">⧉</span></a></div>
</nav>
<div class="hd-lang"><button class="hd-lang__toggle" type="button"><span>Language</span><svg class="hd-lang__arrow" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg></button><div class="hd-lang__list"><a href="#">Language 1</a><a href="#">Language 2</a><a href="#">Language 3</a><a href="#">Language 4</a><a href="#">Language 5</a></div></div>
<button class="hd-burger" type="button" aria-label="Menu"><i></i><i></i><i></i></button>
<div class="menu" data-slot="menu-drawer">
  <div class="menu__in">
    <div class="menu__card"><h3>Featured · Events</h3><div class="menu__carousel embla"><div class="embla__viewport"><div class="embla__container"><div class="embla__slide"><a href="news.html"><div class="wf-img" data-label="Event poster · red background with large type · square"></div><span class="jd-chip">Notice</span><p>Your event title goes here in one line.</p></a></div><div class="embla__slide"><a href="news.html"><div class="wf-img" data-label="Course meal table setting · top-down · square"></div><span class="jd-chip">Notice</span><p>[Reservations] Your course name</p></a></div><div class="embla__slide"><a href="news.html"><div class="wf-img" data-label="New menu plate · steam · square"></div><span class="jd-chip">Notice</span><p>Your one-line new menu news here</p></a></div></div></div><div class="menu__btns"><button class="embla__button embla__button--prev" type="button" aria-label="Previous"><svg class="jd-ic"><use href="#i-arrow"/></svg></button><button class="embla__button embla__button--next" type="button" aria-label="Next"><svg class="jd-ic"><use href="#i-arrow"/></svg></button></div><div class="menu__dots embla__dots"></div></div></div>
    <ul class="menu__nav">
      <li><a href="index.html"><span class="title">Home</span></a><div class="menu__sub"><a href="index.html#message">Message</a><a href="index.html#feature">Stubbornness</a><a href="index.html#menu">Signature Menu</a><a href="index.html#brand">Brand</a></div></li>
      <li><a href="list.html"><span class="title">Find a store / Menu</span></a><div class="menu__sub"><a href="list.html#area">Search by region</a><a href="list.html#brand">Find by brand</a></div></li>
      <li><a href="about.html"><span class="title">Company Info</span></a><div class="menu__sub"><a href="about.html#greeting">Message from the CEO</a><a href="about.html#history">History</a><a href="about.html#outline">Company overview</a></div></li>
      <li><a href="news.html"><span class="title">News</span></a></li>
      <li><a href="#"><span class="title">Our approach to food allergies</span></a></li>
      <li><a href="#"><span class="title">Basic customer service policy</span></a></li>
      <li><a href="#"><span class="title">Contact / FAQ</span></a></li>
      <li style="border:0"><a class="menu__tel" href="#"><small>Hiring inquiry phone</small><b>000-0000-0000</b></a></li>
    </ul>
    <div class="menu__foot">
      <div class="menu__box"><div><h4>Official SNS</h4><div class="menu__sns"><a href="#"></a><a href="#"></a><a href="#"></a><a href="#"></a><a href="#"></a><a href="#"></a></div></div></div>
      <div class="menu__box"><h4 style="font-size:14px;flex:none">Your hiring phrase here<br>Add two lines</h4><div class="menu__recruit"><a href="#"><div class="wf-img" data-label="Hall staff serving a guest · warm indoor lights · landscape"></div></a><a href="#"><div class="wf-img" data-label="Store exterior · evening lighting · landscape"></div></a></div></div>
    </div>
  </div>
</div>
<div class="snsf" data-slot="sns-follow"><button class="snsf__toggle" type="button"><span>SNS Follow</span>＋</button><ul class="snsf__list"><li style="--num: 1"><a href="#" aria-label="SNS 1"></a></li><li style="--num: 2"><a href="#" aria-label="SNS 2"></a></li><li style="--num: 3"><a href="#" aria-label="SNS 3"></a></li><li style="--num: 4"><a href="#" aria-label="SNS 4"></a></li><li style="--num: 5"><a href="#" aria-label="SNS 5"></a></li><li style="--num: 6"><a href="#" aria-label="SNS 6"></a></li></ul></div>
<a class="rsv" href="list.html" data-slot="reservation-badge"><svg viewBox="0 0 170 142"><path d="${scallop(85, 71, 72, 58, 10, 0.62)}" fill="var(--kf-accent)"/><path d="${scallop(85, 71, 64, 51, 10, 0.62)}" fill="none" style="stroke: color-mix(in oklab, var(--kf-on-accent) 70%, transparent)" stroke-width="1"/></svg><span class="rsv__txt"><svg class="jd-ic"><use href="#i-search"/></svg><span>Store details<br>Book here</span></span></a>`;

  const banner = `
<div class="pfb__in">
  <div class="pfb__sns"><h3>Official SNS</h3><p>Your one-line SNS notice goes here</p><div class="pfb__icons"><a href="#"></a><a href="#"></a><a href="#"></a><a href="#"></a><a href="#"></a><a href="#"></a></div>
    <a class="pfb__movie" href="#"><div class="wf-img" data-label="Commemorative video thumbnail · steamer · 16:9"></div><span>Your anniversary video here<br>Guide two lines</span></a></div>
  <div class="pfb__shop"><div class="wf-img" data-label="Store hall full view · dim interior lighting · horizontal wide"></div><h3><svg class="jd-ic"><use href="#i-search"/></svg>Store details · Book here</h3><div class="pfb__btns"><a class="jd-btn" href="list.html#area">Search by region</a><a class="jd-btn" href="list.html#brand">Find by brand</a></div></div>
</div>`;

  const footer = `
<div class="ft__bg"><div class="wf-img" data-label="Background video · same video as the first page background · 53s loop · darkened overlay filling the screen"><video data-autoplay muted loop playsinline aria-hidden="true"><source src="media/bg-sp.mp4" media="(max-width: 1023px)" type="video/mp4"><source src="media/bg-pc.mp4" media="(min-width: 1024px)" type="video/mp4"></video></div></div>
<div class="ft__in">
  <div class="ft__logo"><b>Business name</b><i>LOGO</i></div>
  <ul class="ft__nav">
    <li><a href="index.html">Home</a><div class="sub"><a class="ft__sub" href="index.html#message">Message</a><a class="ft__sub" href="index.html#menu">Signature Menu</a><a class="ft__sub" href="index.html#feature">Stubbornness</a><a class="ft__sub" href="index.html#brand">Brand</a></div></li>
    <li><a href="about.html">Company Info</a><div class="sub"><a class="ft__sub" href="about.html#greeting">Message from the CEO</a><a class="ft__sub" href="about.html#history">History</a><a class="ft__sub" href="about.html#outline">Company overview</a></div></li>
    <li><a href="list.html">Find a store / Menu</a><div class="sub"><a class="ft__sub" href="list.html#area">Search by region</a><a class="ft__sub" href="list.html#brand">Find by brand</a></div></li>
    <li><a href="#">Our approach to food allergies</a></li>
    <li><a href="news.html">News</a></li>
    <li><a href="#">Basic customer service policy</a></li>
    <li><a class="ft__tel" href="#"><small>Hiring inquiry phone</small><b>000-0000-0000</b></a></li>
    <li><a href="#">Contact / FAQ</a></li>
  </ul>
  <div class="ft__recruit"><h4>Your hiring copy here<br>Add two lines</h4><ul><li><div class="wf-img" data-label="Hall staff serving guests · warm lighting · 4:3"></div></li><li><div class="wf-img" data-label="Store exterior · evening · 4:3"></div></li></ul></div>
  <button class="ft__top" type="button"><svg class="ft__top-arrow" viewBox="0 0 10 14" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M5 13V1M1 5l4-4 4 4"/></svg><svg class="ft__top-ic" viewBox="0 0 26 18" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M3 12c0-5 4-8 10-8s10 3 10 8M1 12h24M3 12v3h20v-3"/></svg><span>PAGE TOP</span></button>
</div>
<p class="ft__copy">Copyright © 0000 Company Name. All Rights Reserved.</p>`;

  document.body.insertAdjacentHTML("afterbegin", sprite);
  const hd = document.querySelector("[data-slot='header']");
  if (hd) hd.innerHTML = header;
  const ft = document.querySelector("[data-slot='footer']");
  if (ft) ft.innerHTML = footer;

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDt = () => matchMedia("(min-width: 769px)").matches;

  // ── embla 8.6.0 shared — the prev/next buttons, dots and ‹01 / 04› that the original main.js attaches to each carousel, done the same way ──
  const Embla = window.EmblaCarousel;
  const plug = { autoplay: window.EmblaCarouselAutoplay, autoScroll: window.EmblaCarouselAutoScroll, classNames: window.EmblaCarouselClassNames };
  // Pressing a button stops autoplay (if stopOnInteraction is false it restarts counting from the beginning) — as in the original
  // A disabled embla (active: false) has an empty plugins()
  const nudge = (api) => {
    const ap = api.plugins()?.autoplay;
    if (ap) (ap.options.stopOnInteraction === false ? ap.reset : ap.stop)();
  };
  const kit = {
    btns(api, prev, next, onBtn = nudge) {
      const p = () => { onBtn(api); api.scrollPrev(); };
      const n = () => { onBtn(api); api.scrollNext(); };
      const set = () => { if (prev) prev.disabled = !api.canScrollPrev(); if (next) next.disabled = !api.canScrollNext(); };
      prev?.addEventListener("click", p);
      next?.addEventListener("click", n);
      api.on("select", set).on("reInit", set);
      set();
      return () => { prev?.removeEventListener("click", p); next?.removeEventListener("click", n); };
    },
    dots(api, wrap, onBtn = nudge) {
      let dots = [];
      const sel = () => { const k = api.selectedScrollSnap(); dots.forEach((d, i) => d.classList.toggle("is-on", i === k)); };
      const build = () => {
        wrap.innerHTML = api.scrollSnapList().map(() => '<button class="embla__dot" type="button" aria-label="Flipping over"></button>').join("");
        dots = [...wrap.children];
        dots.forEach((d, i) => d.addEventListener("click", () => { onBtn(api); api.scrollTo(i); }));
        sel();
      };
      api.on("reInit", build).on("select", sel);
      build();
      return () => { wrap.innerHTML = ""; };
    },
    count(api, el) {
      const pad = (n) => String(n).padStart(2, "0");
      const set = () => { el.innerHTML = `<b>${pad(api.selectedScrollSnap() + 1)}</b> / ${pad(api.scrollSnapList().length)}`; };
      api.on("select", set).on("reInit", set);
      set();
    },
    // The original runs auto-advance only while visible on screen, via IntersectionObserver
    // When it turns on after a width change (reInit), re-read every time so the autoplay created then is used
    playInView(api, el, threshold) {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        const ap = api.plugins()?.autoplay;
        if (ap) e.isIntersecting ? ap.play() : ap.stop();
      }), { threshold });
      io.observe(el);
      return () => io.disconnect();
    },
  };

  // Menu drawer — original showMenu: on open opacity 0→1 .32s, on close display:none after .32s
  const menu = document.querySelector(".menu");
  const burger = document.querySelector(".hd-burger");
  // Keep the open state in a variable — measuring with getComputedStyle on every turn makes style calculation on a big page delay the first frame
  let menuOpen = false;
  const showMenu = (on) => {
    if (on === menuOpen) return;
    menuOpen = on;
    burger.classList.toggle("open", on);
    if (on) gsap.fromTo(menu, { opacity: 0, display: "none" }, { opacity: 1, display: "block", ease: "power1.out", duration: reduce ? 0 : 0.32 });
    else gsap.to(menu, { opacity: 0, ease: "power1.inOut", duration: reduce ? 0 : 0.32, onComplete: () => gsap.set(menu, { display: "none" }) });
  };
  burger.addEventListener("click", () => showMenu(!menuOpen));
  // Recommendations in the drawer — original embla { loop } + Autoplay default (4s), prev·next buttons and dots
  const mc = menu.querySelector(".menu__carousel");
  if (Embla && mc) {
    const api = Embla(mc.querySelector(".embla__viewport"), { loop: true }, reduce ? [] : [plug.autoplay()]);
    kit.btns(api, mc.querySelector(".embla__button--prev"), mc.querySelector(".embla__button--next"));
    kit.dots(api, mc.querySelector(".embla__dots"));
  }
  // Like the original, the phone menu opens and closes rows with sub-lists using a + toggle
  menu.querySelectorAll(".menu__nav > li:has(.menu__sub) > a").forEach((a) => a.addEventListener("click", (e) => {
    if (isDt()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    a.parentElement.classList.toggle("is-open");
  }, true));

  document.querySelectorAll(".hd-gnav__item").forEach((it) => {
    const b = it.querySelector("button");
    if (!b) return;
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !it.classList.contains("is-open");
      document.querySelectorAll(".hd-gnav__item.is-open").forEach((o) => o.classList.remove("is-open"));
      it.classList.toggle("is-open", open);
    });
  });
  const lang = document.querySelector(".hd-lang");
  lang.querySelector("button").addEventListener("click", (e) => { e.stopPropagation(); lang.classList.toggle("is-open"); });
  const sns = document.querySelector(".snsf");
  sns.querySelector("button").addEventListener("click", (e) => { if (!isDt()) { e.stopPropagation(); sns.classList.toggle("is-open"); } });
  const closePops = () => {
    document.querySelectorAll(".hd-gnav__item.is-open").forEach((o) => o.classList.remove("is-open"));
    lang.classList.remove("is-open");
    sns.classList.remove("is-open");
  };
  document.addEventListener("click", closePops);

  document.querySelector(".ft__top")?.addEventListener("click", () => gsap.to(window, { scrollTo: { y: 0 }, duration: reduce ? 0 : 1.85, ease: "power2.inOut" }));

  // Original video slot: loops silently. A placeholder video (media/) of the same ratio and length gives the same playback behavior.
  const playVideos = (root) => root.querySelectorAll("video[data-autoplay]").forEach((v) => {
    v.muted = true;
    v.addEventListener("playing", () => v.parentElement.classList.add("is-playing"), { once: true });
    if (reduce) return v.parentElement.classList.add("is-playing");
    const p = v.play();
    if (p) p.catch(() => {});
  });
  playVideos(document.querySelector(".ft"));

  // The booking badge is pushed 120% to the right when it touches the Footer (original power2.in .5)
  const rsv = document.querySelector(".rsv");
  if (ft && !reduce) ScrollTrigger.create({
    trigger: ft, start: "top bottom",
    onEnter: () => gsap.to(rsv, { x: "120%", duration: 0.5, ease: "power2.in" }),
    onLeaveBack: () => gsap.to(rsv, { x: "0%", duration: 0.5, ease: "power2.out" }),
  });

  // Re-attached per section — end-of-page banner, three reveals (blur clears, top center+=100 · photo zoom released top center+=200 · fade from 20px below .45s), stagger, sub-heading photo
  const common = (root) => {
    const pfb = root.querySelector("[data-slot='pagefoot-banner']");
    if (pfb && !pfb.firstElementChild) pfb.innerHTML = banner;
    root.querySelectorAll(".jd-late").forEach((el) => (el.style.visibility = "visible"));
    playVideos(root);
    const offs = [];
    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
      const { motion } = ctx.conditions;
      root.querySelectorAll(".js-blur").forEach((el) => motion
        ? ScrollTrigger.create({ trigger: el, start: "top center+=100", once: true, onEnter: () => el.classList.add("js-play") })
        : el.classList.add("js-play"));
      root.querySelectorAll(".js-fadeScale").forEach((el) => motion
        ? ScrollTrigger.create({ trigger: el, start: "top center+=200", once: true, onEnter: () => el.classList.add("js-play") })
        : el.classList.add("js-play"));
      root.querySelectorAll(".fade-in").forEach((el) => {
        if (!motion) return gsap.set(el, { opacity: 1 });
        ScrollTrigger.create({ trigger: el, start: "top 78%", once: true, onEnter: () => gsap.fromTo(el, { opacity: 0, y: isDt() ? 20 : 10 }, { opacity: 1, y: 0, ease: "power1.out", duration: 0.45 }) });
      });
      if (motion) root.querySelectorAll(".parallax-container").forEach((c) => {
        gsap.fromTo(c.querySelector(".parallax"), { y: 0 }, { y: -100, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: 1.2 } });
      });
    });
    // Sub-page header photo — original embla { align: start, loop } + AutoScroll({ playOnInit: true }), flows left without a break
    root.querySelectorAll(".pfv__slider.embla").forEach((el) => {
      if (!Embla) return;
      const api = Embla(el.querySelector(".embla__viewport"), { align: "start", loop: true }, reduce ? [] : [plug.autoScroll({ playOnInit: true })]);
      offs.push(() => api.destroy());
    });
    return () => { offs.forEach((f) => f()); mm.revert(); };
  };

  // ── Page transition: same barba 2.10.3 + prefetch 2.2.0 default-transition as the original (sync false) ──
  // On leaving opacity goes in .3s (.02s when going back), and the new section is lifted up and appears in .3s. Going back returns to the scroll position at departure.
  const views = {};
  let offs = [];
  const unmount = () => { offs.forEach((f) => f && f()); offs = []; };
  // barba silently swallows errors inside hooks — throw errors out so they are left in the console and a section doesn’t go on half-attached
  const guard = (fn) => { try { fn(); } catch (e) { setTimeout(() => { throw e; }); } };
  // The section script must render the cards first so the reveal effect also applies to those cards. The original applies reveal effects (blur release etc.) on slide change after the appear finishes (after hook).
  const mountView = (container) => {
    unmount();
    const ns = container.dataset.barbaNamespace;
    document.body.dataset.page = ns;
    guard(() => views[ns] && offs.push(views[ns](container)));
    window.JD.first = false;
  };
  const mountCommon = (container) => {
    guard(() => offs.push(common(container)));
    ScrollTrigger.refresh();
  };
  const mount = (container) => { mountView(container); mountCommon(container); };

  const abs = (h) => new URL(h, location.href).href;
  const load = (tag, attrs) => new Promise((res) => {
    const el = Object.assign(document.createElement(tag), attrs);
    el.onload = el.onerror = res;
    (tag === "link" ? document.head : document.body).append(el);
  });
  // Attach any css and scripts from the next page that are missing, and remove css that the page doesn’t have once it has arrived
  const bring = async (doc) => {
    const sheets = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => abs(l.getAttribute("href")));
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href);
    await Promise.all(sheets.filter((h) => !have.includes(h)).map((href) => load("link", { rel: "stylesheet", href })));
    const haveJs = [...document.querySelectorAll("script[src]")].map((sc) => sc.src);
    for (const sc of doc.querySelectorAll("script[src]")) {
      const src = abs(sc.getAttribute("src"));
      if (!haveJs.includes(src)) await load("script", { src });
    }
    return sheets;
  };
  const prune = (keep) => document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => keep.includes(l.href) || l.remove());
  // Like the original beforeEnter, swap description and share meta to the new page’s
  const META = "meta[name='description'], meta[property^='og'], meta[name^='twitter'], link[rel='canonical']";
  const swapHead = (doc) => {
    document.title = doc.title;
    document.head.querySelectorAll(META).forEach((m) => m.remove());
    doc.head.querySelectorAll(META).forEach((m) => document.head.append(m));
  };
  const scrollStore = new Map();
  const toHash = (hash) => {
    const t = hash && document.querySelector(hash);
    if (t) gsap.to(window, { scrollTo: { y: t, offsetY: 0 }, duration: reduce ? 0 : 1.2, ease: "power2.inOut" });
  };
  const dir = (p) => p.slice(0, p.lastIndexOf("/") + 1);
  const sameSite = (a) => {
    const u = new URL(a.href, location.href);
    return u.origin === location.origin && dir(u.pathname) === dir(location.pathname);
  };
  // A same-page ”#place” link glides to that spot instead of jumping
  const samePageHash = (a) => {
    const u = new URL(a.href, location.href);
    return u.pathname === location.pathname && !!u.hash;
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (a.getAttribute("href") === "#") return e.preventDefault();
    if (!samePageHash(a)) return;
    e.preventDefault();
    showMenu(false);
    toHash(new URL(a.href, location.href).hash);
  });

  // On file:// barba can’t fetch the next page — same opacity transition, then normal navigation
  const plain = (first) => {
    mount(first);
    // A first visit shows immediately like the original once, and only pages entered via this transition fade in over .3s like barba enter
    if (sessionStorage.getItem("jd-nav")) {
      sessionStorage.removeItem("jd-nav");
      gsap.fromTo(first, { opacity: 0 }, { opacity: 1, ease: "power1.out", duration: reduce ? 0 : 0.3 });
    }
    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest("a[href]");
      if (!a || a.target) return;
      const u = new URL(a.href, location.href);
      if (u.protocol !== location.protocol || !/\.html$/.test(u.pathname)) return;
      e.preventDefault();
      showMenu(false);
      sessionStorage.setItem("jd-nav", "1");
      gsap.to(first, { opacity: 0, ease: "power1.out", duration: reduce ? 0 : 0.3, onComplete: () => (location.href = a.href) });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(first, { opacity: 1 }); });
  };

  const start = () => {
    const first = document.querySelector('[data-barba="container"]');
    if (!first) return;
    if (!window.barba || !/^https?:$/.test(location.protocol)) return plain(first);
    history.scrollRestoration = "manual";
    let keep = null;
    const back = (t) => t === "back" || t === "popstate";
    if (window.barbaPrefetch) barba.use(barbaPrefetch);
    barba.init({
      debug: false,
      preventRunning: true,
      // Pages outside this site folder (library lists etc.) have no barba container, so treat them as normal navigation
      prevent: ({ el }) => !!el && (el.getAttribute("href") === "#" || samePageHash(el) || !sameSite(el)),
      transitions: [{
        name: "default-transition",
        sync: false,
        once: ({ next }) => mount(next.container),
        leave({ current, trigger }) {
          scrollStore.set(current.url.path, scrollY);
          showMenu(false);
          closePops();
          return gsap.to(current.container, { opacity: 0, ease: "power1.out", duration: reduce ? 0 : back(trigger) ? 0.02 : 0.3 });
        },
        afterLeave: unmount,
        async beforeEnter({ next }) {
          const doc = new DOMParser().parseFromString(next.html, "text/html");
          keep = await bring(doc);
          swapHead(doc);
          document.body.dataset.ns = next.namespace;
        },
        enter({ current, next, trigger }) {
          if (!back(trigger)) {
            if (current?.container) current.container.style.display = "none";
            (document.scrollingElement || document.documentElement).scrollTop = 0;
          }
          mountView(next.container);
          return gsap.fromTo(next.container, { opacity: 0 }, { opacity: 1, ease: "power1.out", duration: reduce ? 0 : 0.3 });
        },
        after({ next, trigger }) {
          if (keep) prune(keep);
          mountCommon(next.container);
          if (back(trigger)) {
            const y = scrollStore.get(next.url.path);
            if (typeof y === "number") requestAnimationFrame(() => setTimeout(() => scrollTo(0, y)));
          } else if (next.url.hash) toHash("#" + next.url.hash);
        },
      }],
    });
  };

  window.JD = { showMenu, isDt, reduce, kit, plug, Embla, first: true, view: (ns, fn) => (views[ns] = fn) };
  // Starts after the page script (loaded later) registers its sections
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : setTimeout(start);
})();
