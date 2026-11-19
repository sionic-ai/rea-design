// shared by the whole Brand site set — Lenis 1.3.8 smooth scroll, first-visit loader (corner numbers + Lottie star), pill nav (collapse · theme · border glow),
// Menu open and close, magnetic box button, clock, front footer photo fold, footer (wordmark rises · hovering the star makes letters dance), barba 2.10.3 slanted curtain transition.
// Original curve: inOut = (.85,0,.15,1), curtain = M0,0 C.496,.004 0,1 1,1, line rise power4.out 1.2s · blur 2rem.
(() => {
  const ES = (window.ES = window.ES || {});
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const rem = (v) => v * parseFloat(getComputedStyle(document.documentElement).fontSize);
  ES.q = q; ES.qa = qa; ES.rem = rem;
  // GSAP can’t mix var() values — resolve the skin variables into computed colors before passing them in
  ES.color = (name) => {
    const i = document.createElement("i");
    i.style.cssText = `display:none;color:var(${name})`;
    document.body.append(i);
    const c = getComputedStyle(i).color;
    i.remove();
    return c;
  };
  ES.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  ES.mobile = matchMedia("(max-width: 1099px)").matches;
  ES.pages = ES.pages || {};

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("inOut", "0.85,0,0.15,1");
  CustomEase.create("esPage", "M0,0 C0.496,0.004 0,1 1,1");

  // Four original gsap.registerEffect — lines and words rising out of blur, rising from a bottom mask, revealing from above, and blur only clearing.
  const fx = (name, defaults, from, to) => gsap.registerEffect({
    name, defaults, extendTimeline: true,
    effect: (t, c) => gsap.fromTo(t, from(c), { ...to(c), duration: c.duration, ease: c.ease, stagger: c.stagger }),
  });
  fx("moveBlur", { duration: 1.2, ease: "power4.out", stagger: 0.07, yPercent: 100, filter: "blur(2rem)" },
    (c) => ({ yPercent: c.yPercent, autoAlpha: 0, filter: c.filter }), () => ({ yPercent: 0, autoAlpha: 1, filter: "blur(0rem)" }));
  fx("textIn", { duration: 1.2, ease: "power4.out", stagger: 0.05 }, () => ({ yPercent: 105 }), () => ({ yPercent: 0 }));
  fx("clip", { duration: 1.2, ease: "expo.out", stagger: 0 }, () => ({ clipPath: "inset(0 0 100% 0)" }), () => ({ clipPath: "inset(0 0 0% 0)" }));
  fx("blur", { duration: 1.2, ease: "power4.out", stagger: 0 }, () => ({ autoAlpha: 0, filter: "blur(2rem)" }), () => ({ autoAlpha: 1, filter: "blur(0rem)" }));

  // ── Text splitting
  ES.splitLines = (el, mask = true) => {
    if (!el) return [];
    const s = new SplitText(el, { type: "lines", linesClass: "es-line-in", mask: mask ? "lines" : undefined, aria: "hidden" });
    return s.lines;
  };
  ES.splitWords = (el) => (el ? new SplitText(el, { type: "lines, words", linesClass: "es-split-line", wordsClass: "es-word", aria: "hidden" }) : null);
  ES.roll = (el) => {
    if (!el || el.querySelector(".es-roll")) return;
    const t = el.textContent.trim();
    el.innerHTML = `<span class="es-roll"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;
  };
  // Titles sharpen from blur line by line when they enter by scroll (original Title: top+=20% bottom)
  ES.title = (el, args = {}, scroll = true) => {
    if (!el) return null;
    const lines = new SplitText(el, { type: "lines", linesClass: "es-split-line" }).lines;
    const tl = gsap.timeline(scroll ? { scrollTrigger: { trigger: el, start: "top+=20% bottom" } } : { paused: true });
    if (ES.reduce) return tl;
    return tl.moveBlur(lines, args);
  };
  ES.text = (el, args = {}, scroll = true) => {
    if (!el) return null;
    const lines = ES.splitLines(el);
    const tl = gsap.timeline(scroll ? { scrollTrigger: { trigger: el, start: "top+=20% bottom" } } : { paused: true });
    if (ES.reduce) return tl;
    return tl.textIn(lines, args);
  };

  // ── Lenis — the original scrolled an inner panel per page, but here it is window scroll (the inspector scrolls by document height). Curve is the Lenis default (lerp .1)
  if (!ES.reduce && window.Lenis) {
    ES.lenis = new Lenis({ lerp: 0.1 });
    ES.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => ES.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const setVh = () => document.documentElement.style.setProperty("--vh", `${innerHeight * 0.01}px`);
  setVh();
  addEventListener("resize", setVh);

  // ── Lottie star — instead of the original icon.json, our own star (a four-point star rotating through six poses of 60° each while the inner radius breathes). Playback is kept paused as in the original and the frames are pushed by hand
  const kf = (t, s, last) => (last ? { t, s } : { t, s, i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } });
  const ICON = {
    v: "5.7.4", fr: 30, ip: 0, op: 180, w: 200, h: 200, nm: "es-star", ddd: 0, assets: [],
    layers: [{
      ddd: 0, ind: 1, ty: 4, nm: "star", sr: 1, ao: 0, ip: 0, op: 180, st: 0, bm: 0,
      ks: { o: { a: 0, k: 100 }, r: { a: 1, k: [0, 30, 60, 90, 120, 150, 180].map((t, i) => kf(t, [i * 60], i === 6)) }, p: { a: 0, k: [100, 100, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 1, k: [0, 30, 60, 90, 120, 150, 180].map((t, i) => kf(t, i % 2 ? [92, 108, 100] : [100, 100, 100], i === 6)) } },
      shapes: [{
        ty: "gr", nm: "g", it: [
          { ty: "sr", nm: "s", sy: 1, d: 1, pt: { a: 0, k: 4 }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 }, ir: { a: 1, k: [0, 30, 60, 90, 120, 150, 180].map((t, i) => kf(t, [i % 2 ? 34 : 20], i === 6)) }, is: { a: 0, k: 0 }, or: { a: 0, k: 88 }, os: { a: 0, k: 0 } },
          { ty: "fl", nm: "f", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 }, r: 1 },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
        ],
      }],
    }],
  };
  ES.icon = (el) => {
    const anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, animationData: JSON.parse(JSON.stringify(ICON)) });
    const icon = { lottie: anim, total: ICON.op, frame: ICON.op / 6 };
    icon.go = (f) => anim.goToAndStop(f, true);
    return icon;
  };

  // ── Nav — hidden above at -125% at first, drops in with 1.4s expo.out, and after scrolling down past 100px the link group folds to width 0 in .5s
  const nav = q(".es-nav");
  const navLinks = q(".es-nav-links", nav);
  const navInner = qa(".es-nav-link", nav);
  ES.nav = {
    hidden: true, scrolled: false,
    show() { this.hidden = false; gsap.to(nav, { yPercent: 0, y: 0, duration: ES.reduce ? 0 : 1.4, ease: "expo.out", overwrite: "auto" }); },
    hide() { this.hidden = true; gsap.to(nav, { yPercent: ES.mobile ? -200 : -125, duration: ES.reduce ? 0 : 1.4, ease: "expo.out", overwrite: "auto" }); },
    theme(t = "dark") { nav.dataset.theme = t; },
  };
  if (nav) {
    gsap.set(nav, { yPercent: ES.mobile ? -200 : -125, y: 0, transform: "" });
    navInner.forEach(ES.roll);
    const navW = () => rem(32.4);
    const onScroll = () => {
      const y = ES.lenis ? ES.lenis.scroll : scrollY;
      if (y > 100 && !ES.nav.scrolled) {
        ES.nav.scrolled = true;
        document.documentElement.classList.add("is-scrolled");
        gsap.timeline()
          .to(navLinks, { width: 0, autoAlpha: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" }, 0)
          .to(navInner, { autoAlpha: 0, duration: 0.1, overwrite: "auto" }, 0);
      } else if (y <= 100 && ES.nav.scrolled) {
        ES.nav.scrolled = false;
        document.documentElement.classList.remove("is-scrolled");
        gsap.timeline()
          .fromTo(navLinks, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, ease: "none" }, 0)
          .to(navLinks, { width: navW(), duration: 0.5, ease: "power3.out" }, 0)
          .fromTo(navInner, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, ease: "none" }, 0)
          .fromTo(navInner, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.02 }, 0);
      }
    };
    ES.lenis ? ES.lenis.on("scroll", onScroll) : addEventListener("scroll", onScroll, { passive: true });
    ES.navScroll = onScroll;
  }

  // ── Magnetic box button — over the box the button follows the cursor with .6s power3.out and returns to center on leave
  ES.block = (el, center = true) => {
    if (!el || ES.mobile || el.__esBlock) return;
    el.__esBlock = true;
    const btn = q(".es-btn", el);
    if (!btn) return;
    const xTo = gsap.quickTo(btn, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.6, ease: "power3.out" });
    el.addEventListener("mousemove", (e) => {
      const b = el.getBoundingClientRect();
      el.classList.add("is-active");
      xTo(e.clientX - b.left - b.width * 0.5);
      yTo(e.clientY - b.top - b.height * 0.5);
    });
    el.addEventListener("mouseleave", () => { el.classList.remove("is-active"); if (center) { xTo(0); yTo(0); } });
  };

  // ── Clock (original: that city’s time GMT+2, every second)
  ES.clock = (el) => {
    const t = q(".es-clock-time", el);
    if (!t) return;
    const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Etc/GMT-2", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const tick = () => { t.textContent = f.format(new Date()); };
    tick();
    return setInterval(tick, 1000);
  };

  // ── Menu — original Menu timeline as is (open: 1.2s expo.out curtain, box 1.5s from the center, links 1.8s blur, close: 1s expo.inOut)
  const menu = q(".es-menu");
  if (menu) {
    const cols = qa(".es-menu-item-col", menu);
    const links = qa(".es-menu-link", menu);
    const contact = qa(".es-contact-text .es-line-in", menu);
    const bullets = qa(".es-contact-bullet", menu);
    const social = qa(".es-menu-social .es-links-title, .es-menu-social .es-link", menu).map((el) => { el.innerHTML = `<span class="es-line-in" style="display:block">${el.innerHTML}</span>`; return el.firstElementChild; });
    const clock = qa(".es-menu-clock .es-line-in", menu);
    if (ES.mobile) q(".es-menu-close", menu)?.classList.add("is-mobile");
    gsap.set([links, contact, social, clock], { yPercent: 105 });
    gsap.set(links, { autoAlpha: 0 });
    gsap.set(cols, { yPercent: -120 });
    gsap.set(bullets, { scale: 0, yPercent: 105 });
    const inTl = gsap.timeline({ paused: true, defaults: { overwrite: "auto" } })
      .add(() => ES.nav.hide())
      .set(menu, { visibility: "visible", pointerEvents: "auto" }, 0)
      .fromTo(menu, { backgroundColor: ES.color("--site-stage-2") }, { backgroundColor: ES.color("--kf-contrast-bg"), duration: 1.6 }, 0)
      .fromTo(menu, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% -50%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1.2, ease: "expo.out" }, 0)
      .fromTo(cols, { yPercent: -120 }, { yPercent: 0, duration: 1.5, ease: "expo.out", stagger: { each: 0.08, from: "center" } }, 0.2)
      .fromTo(links, { autoAlpha: 0, yPercent: 80, filter: "blur(2rem)" }, { autoAlpha: 1, yPercent: 0, filter: "blur(0rem)", duration: 1.8, ease: "expo.out", stagger: 0.07 }, 0.2)
      .to(bullets, { scale: 1, yPercent: 0, duration: 1, ease: "power3.out", stagger: 0.03 }, 0.5)
      .to(contact, { yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.03 }, 0.6)
      .to(social, { yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.03 }, 0.7)
      .fromTo(clock, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "power3.out" }, 0.8);
    const outTl = gsap.timeline({ paused: true, defaults: { overwrite: "auto" } })
      .set(menu, { pointerEvents: "none" }, 0)
      .to(cols, { yPercent: -120, duration: 1, ease: "expo.inOut", stagger: { each: 0.02, from: "center" } }, 0)
      .to(links, { autoAlpha: 0, filter: "blur(2rem)", yPercent: 80, duration: 1, ease: "power3.inOut", stagger: 0.03 }, 0)
      .to(bullets, { scale: 0, duration: 0.3, ease: "power1.out", stagger: 0.03 }, 0)
      .to([contact, social, clock], { yPercent: 105, duration: 0.6, ease: "power3.inOut", stagger: 0.03 }, 0)
      .fromTo(menu, { backgroundColor: ES.color("--kf-contrast-bg") }, { backgroundColor: ES.color("--site-stage-2"), duration: 1.6 }, 0)
      .fromTo(menu, { clipPath: "polygon(0% 0%, 100% 0%, 100% 150%, 0% 100%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", duration: 1, ease: "expo.inOut" }, 0)
      .add(() => ES.nav.show(), 0.6)
      .set(menu, { visibility: "hidden" });
    ES.menu = {
      open: false,
      enter() { this.open = true; document.documentElement.classList.add("is-menu"); ES.lenis?.stop(); outTl.pause(); inTl.invalidate().restart(); if (ES.reduce) inTl.progress(1); },
      leave() { if (!this.open) return; this.open = false; document.documentElement.classList.remove("is-menu"); ES.lenis?.start(); inTl.pause(); outTl.invalidate().restart(); if (ES.reduce) outTl.progress(1); },
    };
    q(".es-nav-toggle")?.addEventListener("click", () => ES.menu.enter());
    q(".es-menu-close", menu)?.addEventListener("click", () => ES.menu.leave());
    addEventListener("keydown", (e) => { if (e.key === "Escape") ES.menu.leave(); });
    qa(".es-block", menu).forEach((b) => ES.block(b));
    qa(".es-clock", menu).forEach(ES.clock);
    // A link to the current page only closes the menu, with no navigation
    links.forEach((a) => a.addEventListener("click", (e) => {
      const here = location.pathname.split("/").pop() || "index.html";
      if ((a.getAttribute("href") || "") === here) { e.preventDefault(); ES.menu.leave(); }
    }));
  }

  // ── Showreel curtain — opens when the showreel box (menu · experience section) is pressed, and closes with Close or Esc. Its look is the transition in shared.css (1s .16,1,.3,1)
  ES.showreel = {
    open() { document.documentElement.classList.add("is-showreel"); ES.lenis?.stop(); },
    close() { document.documentElement.classList.remove("is-showreel"); if (!ES.menu?.open) ES.lenis?.start(); },
  };
  document.addEventListener("click", (e) => {
    const nl = e.target.closest(".es-contact-row.is-news > .es-contact-link");
    if (nl) { e.preventDefault(); nl.parentElement.classList.toggle("is-open"); return; }
    if (!e.target.closest(".es-news")) document.querySelectorAll(".es-contact-row.is-news.is-open").forEach((r) => r.classList.remove("is-open"));
    if (e.target.closest(".es-block.is-showreel .es-block-link")) { e.preventDefault(); ES.showreel.open(); }
    else if (e.target.closest(".es-showreel-close")) ES.showreel.close();
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") ES.showreel.close(); });

  // ── Theme switch — changes the pill color and light color using the data-theme of the section spanning the nav height
  ES.themes = (root) => {
    const sel = ES.mobile ? "[data-theme], [data-theme-mobile]" : "[data-theme]";
    qa(sel, root).forEach((el) => {
      if (el.closest(".es-nav, .es-menu")) return;
      if (ES.mobile && el.hasAttribute("data-theme-mobile")) el.dataset.theme = el.getAttribute("data-theme-mobile");
      ScrollTrigger.create({
        trigger: el,
        start: () => `top top+=${nav?.offsetHeight || 60}`,
        end: () => `bottom top+=${nav?.offsetHeight || 60}`,
        onEnter: () => ES.busy || ES.nav.theme(el.dataset.theme),
        onEnterBack: () => ES.busy || ES.nav.theme(el.dataset.theme),
      });
    });
  };

  // ── Front footer photo — photo 1.2→1 (scrub 1), while the panel height touches the top of the screen it folds down to 0
  ES.prefooter = (el) => {
    if (!el || ES.reduce) return;
    const wrap = q(".es-media", el), img = q(".es-media-inner", el);
    gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true } }).fromTo(img, { scale: 1.2 }, { scale: 1, ease: "none" });
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: () => (ES.mobile ? `top-=${rem(2)} top` : `top-=${rem(0.5)} top`), end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    tl.to(wrap, { height: 0, duration: 1, ease: "none" });
    if (!ES.mobile) tl.fromTo(wrap, { y: rem(1.5) }, { y: rem(-0.5), duration: 0.1, ease: "none" }, 0.9);
  };

  // ── Footer — wordmark letters rise from 10rem below in turn (.03), and on hovering the star an orange curtain + seven letters rotate through four positions every 1.7s
  const LETTERS = {
    a: [[15, 56, 2.6], [34, 30, 0.8], [77, 27, 1.6], [39, 14, 0.7]],
    b: [[39, 74, 1], [72, 44, 2.7], [66, 65, 1.6], [66, 54, 2.6]],
    c: [[81, 61, 1.9], [53, 17, 1.3], [26, 62, 2.5], [52, 70, 0.6]],
    d: [[73, 30, 2.5], [18, 30, 1.7], [74, 45, 0.6], [52, 20, 1.8]],
    e: [[60, 12, 0.7], [30, 66, 2.2], [54, 26, 1.4], [33, 70, 2]],
    f: [[40, 20, 1.4], [64, 71, 1.6], [36, 40, 0.6], [20, 30, 2.5]],
    g: [[55, 30, 1.5], [49, 60, 0.6], [19, 20, 2.5], [80, 20, 1]],
  };
  ES.footer = (el) => {
    if (!el) return;
    qa(".es-block", el).forEach((b) => ES.block(b));
    const timer = ES.clock(q(".es-clock", el) || el);
    if (ES.mobile || ES.reduce) return () => clearInterval(timer);
    const glyphs = qa(".es-wordmark tspan, .es-wordmark .es-wm-glyph", el);
    gsap.timeline({ scrollTrigger: { trigger: el, start: "bottom-=30% bottom", end: "bottom bottom", scrub: true } }).fromTo(glyphs, { y: rem(10) }, { y: 0, ease: "power1.out", stagger: 0.03 });
    const wrap = q(".es-footer-icon-wrap", el);
    const icon = ES.icon(q(".es-footer-icon", el));
    const letterTl = gsap.timeline({ paused: true, repeat: -1, defaults: { overwrite: "auto", duration: 1.6, ease: "inOut" } });
    const iconTl = gsap.timeline({ paused: true, repeat: -1 });
    qa(".es-footer-letter", el).forEach((L) => {
      const p = LETTERS[L.dataset.letter];
      if (!p) return;
      gsap.set(L, { scale: p[3][2], x: `${p[3][0]}vw`, y: `${p[3][1]}vh` });
      p.forEach(([x, y, s], k) => letterTl.to(L, { scale: s, x: `${x}vw`, y: `${y}vh`, duration: 1.7 }, k * 1.7));
    });
    for (let k = 0; k <= 5; k++) {
      const o = { f: k * icon.frame };
      iconTl.to(o, { f: (k + 1) * icon.frame, duration: 1.7, ease: "inOut", onUpdate: () => icon.go(o.f) }, k * 1.7);
    }
    let back = null;
    wrap?.addEventListener("mouseenter", () => { el.classList.add("is-active"); back?.kill(); iconTl.restart(); letterTl.restart(); });
    wrap?.addEventListener("mouseleave", () => {
      el.classList.remove("is-active");
      iconTl.pause(); letterTl.pause();
      const cur = icon.lottie.currentFrame, to = cur < icon.total * 0.5 ? 0 : icon.total - 1, o = { f: cur };
      back = gsap.to(o, { f: to, duration: 0.6, ease: "expo.out", onUpdate: () => icon.go(o.f) });
    });
    return () => { clearInterval(timer); letterTl.kill(); iconTl.kill(); icon.lottie.destroy(); };
  };

  // ── Testimonial carousel — embla (loop·duration 35, drag only on phones). Over the half panel an arrow follows the cursor in .5s and goes back or forward on click
  ES.carousel = (el) => {
    if (!el || !window.EmblaCarousel) return null;
    const plugins = window.EmblaCarouselClassNames ? [EmblaCarouselClassNames()] : [];
    const api = EmblaCarousel(el, { loop: true, watchDrag: ES.mobile, duration: 35, container: q(".es-carousel-track", el) }, plugins);
    const slides = api.slideNodes();
    const mark = () => {
      const n = api.scrollSnapList().length, s = api.selectedScrollSnap();
      slides.forEach((sl, k) => {
        sl.classList.toggle("is-current", k === s);
        sl.classList.toggle("is-prev", k === (s - 1 + n) % n);
        sl.classList.toggle("is-next", k === (s + 1) % n);
      });
    };
    api.on("init", mark).on("select", mark).on("reInit", mark);
    mark();
    const arrow = q(".es-carousel-arrow", el), prev = q(".es-carousel-prev", el), next = q(".es-carousel-next", el);
    if (!ES.mobile && arrow) {
      const xTo = gsap.quickTo(arrow, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(arrow, "y", { duration: 0.5, ease: "power3.out" });
      el.addEventListener("mousemove", (e) => {
        const b = el.getBoundingClientRect();
        el.classList.add("is-active");
        xTo(e.clientX - b.width * 0.5 - b.left);
        yTo(e.clientY - b.height * 0.5 - b.top);
      });
      el.addEventListener("mouseleave", () => el.classList.remove("is-active"));
      prev?.addEventListener("mouseenter", () => el.classList.add("is-prev"));
      next?.addEventListener("mouseenter", () => el.classList.remove("is-prev"));
      prev?.addEventListener("click", () => api.scrollPrev());
      next?.addEventListener("click", () => api.scrollNext());
    }
    return api;
  };
  ES.testimonials = (sec) => {
    if (!sec) return;
    ES.text(q(".es-testimonials-overline", sec));
    ES.title(q(".es-testimonials-title", sec));
    const img = q(":scope > .es-media .es-media-inner", sec);
    if (img && !ES.reduce) gsap.timeline({ scrollTrigger: { trigger: q(":scope > .es-media", sec), start: "top bottom", end: "bottom top", scrub: true } }).fromTo(img, { height: "110%", yPercent: -10 }, { yPercent: 0, ease: "none" });
    const api = ES.carousel(q(".es-carousel", sec));
    return () => api?.destroy();
  };

  // ── FAQ — row height goes from 7.5rem to auto in .8s power3.out, answer lines rise in turn (.05) from 110% below in 1.4s
  ES.faqs = (sec) => {
    if (!sec) return;
    qa(".es-faq", sec).forEach((f) => {
      const inner = ES.mobile ? q(".es-faq-answer-wrap", f) : q(".es-faq-inner", f);
      const text = q(".es-faq-answer", f);
      const lines = ES.splitLines(text);
      const shut = ES.mobile ? 0 : rem(7.5);
      gsap.set(inner, { height: shut });
      gsap.set(lines, { yPercent: 110 });
      gsap.set(text, { yPercent: 10 });
      let open = false;
      const d = ES.reduce ? 0 : 1;
      q(".es-faq-toggle", f)?.addEventListener("click", () => {
        open = !open;
        f.classList.toggle("is-active", open);
        const tl = gsap.timeline({ defaults: { overwrite: "auto" }, onComplete: () => ES.refresh() });
        if (open) {
          tl.to(inner, { height: "auto", duration: 0.8 * d, ease: "power3.out" }, 0)
            .to(text, { yPercent: 0, duration: 1.4 * d, ease: "power3.out" }, 0.1 * d)
            .to(lines, { yPercent: 0, duration: 1.4 * d, ease: "power3.out", stagger: 0.05 * d }, 0.1 * d);
        } else {
          tl.to(inner, { height: shut, duration: 0.8 * d, ease: "power3.out" }, 0)
            .to(text, { yPercent: 10, duration: 1 * d, ease: "power3.out" })
            .to(lines, { yPercent: 110, duration: 1 * d, ease: "power3.out" }, 0);
        }
      });
    });
    ES.title(q(".es-faqs-title", sec));
  };

  // ── First-visit loader — the star comes into focus in 1s from 2.4→1.8x scale and 1rem blur, and over five 1s beats (beat 0 is a rest) the number cell moves around the corners while the star changes pose
  ES.loader = () => new Promise((done) => {
    const el = q(".es-loader");
    if (!el || ES.reduce) { el?.remove(); done(); return; }
    const W = innerWidth, H = innerHeight;
    const xW = (W * 0.5 - rem(3)) / 2, yH = (H * 0.5 - rem(3.1)) / 2, nH = rem(3.8);
    const iconEl = q(".es-loader-icon", el);
    const icon = ES.icon(iconEl);
    const top = q(".is-top", el), bottom = q(".is-bottom", el), nums = qa(".es-loader-numbers", el);
    const head = { f: 0 };
    gsap.fromTo(iconEl, { autoAlpha: 0, scale: 2.4, filter: "blur(1rem)" }, { scale: 1.8, autoAlpha: 1, filter: "blur(0rem)", duration: 1, ease: "inOut" });
    const tl = gsap.timeline({ defaults: { ease: "inOut", duration: 1 }, onComplete: done });
    const pose = (f, at) => tl.to(head, { f, onUpdate: () => icon.go(head.f) }, at);
    pose(icon.frame, 1); pose(icon.frame * 2, 2); pose(icon.frame, 3); pose(0, 4);
    for (let k = 1; k <= 4; k++) {
      if (k > 2) { tl.to(top, { y: yH * (k - 2) }, k); tl.to(bottom, { y: -(yH * (k - 2)) }, k); }
      else { tl.to(top, { x: -(xW * k) }, k); tl.to(bottom, { x: xW * k }, k); }
      tl.to(nums, { y: -((nH + rem(0.8)) * k) }, k);
    }
    ES.loaderIcon = icon;
  });

  // ── Page attach · detach
  let current = null;
  const mount = (root) => {
    const ns = root.dataset.barbaNamespace;
    const ctx = gsap.context(() => {});
    const api = { root, ns, ctx, intro: gsap.timeline({ paused: true }), destroyers: [] };
    ctx.add(() => {
      qa(".es-roll-me", root).forEach(ES.roll);
      ES.themes(root);
      const page = ES.pages[ns];
      if (page) Object.assign(api, page(root, api) || {});
      ES.prefooter(q(".es-prefooter", root));
      const off = ES.footer(q(".es-footer", root));
      if (off) api.destroyers.push(off);
      qa(".es-block", root).forEach((b) => ES.block(b));
    });
    return api;
  };
  const unmount = (api) => {
    if (!api) return;
    api.destroyers.forEach((f) => { try { f(); } catch (e) {} });
    try { api.destroy?.(); } catch (e) {}
    api.ctx.revert();
  };
  ES.refresh = () => requestAnimationFrame(() => requestAnimationFrame(() => { ES.lenis?.resize(); ScrollTrigger.refresh(); }));

  const toTop = () => { ES.lenis ? ES.lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0); };

  const start = async () => {
    const html = document.documentElement;
    const first = q('[data-barba="container"]');
    html.classList.add("is-first");
    ES.busy = true;
    ES.lenis?.stop();
    current = mount(first);
    await ES.loader();
    const theme = first.dataset.pageTheme || "dark";
    const tl = gsap.timeline({ onComplete: () => { ES.lenis?.start(); } });
    tl.add(() => { html.classList.remove("is-first"); gsap.set(first, { visibility: "visible" }); }, 0);
    if (!ES.reduce) {
      tl.fromTo(first, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% -50%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1.4, ease: "esPage" }, 0);
      if (theme === "dark") tl.fromTo(first, { backgroundColor: ES.color("--site-stage-2") }, { backgroundColor: ES.color("--kf-contrast-bg"), duration: 1.4, ease: "none" }, 0);
    }
    tl.add(() => { ES.nav.theme(theme); ES.nav.show(); }, 0);
    tl.add(() => current.intro.play(), ES.reduce ? 0 : 0.3);
    tl.add(() => {
      ES.busy = false;
      html.classList.add("is-loaded");
      gsap.set(first, { clearProps: "clipPath,backgroundColor" });
      current.loaded?.();
      ES.refresh();
    }, ES.reduce ? 0 : 1.4);
    ES.navScroll?.();

    if (!window.barba || !/^https?:$/.test(location.protocol)) return;
    // The moment it’s pressed, a black veil (.7, 1s linear) starts covering the previous page — so the screen reacts first even while the new page loads (the original starts at 41ms)
    let veil = null;
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || ES.busy || a.target === "_blank" || a.hasAttribute("data-barba-prevent") || e.metaKey || e.ctrlKey) return;
      const raw = a.getAttribute("href") || "";
      if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname === location.pathname) return;
      const ov = q('[data-barba="container"] .es-page-overlay');
      if (ov) veil = gsap.fromTo(ov, { visibility: "visible", opacity: 0 }, { opacity: 0.7, duration: ES.reduce ? 0 : 1, ease: "none" });
    }, true);
    barba.init({
      timeout: 8000,
      preventRunning: true,
      prevent: ({ el, href }) => {
        if (!el || el.target === "_blank" || el.hasAttribute("data-barba-prevent")) return true;
        const raw = el.getAttribute("href") || "";
        if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return true;
        try {
          const u = new URL(href, location.href);
          if (u.origin !== location.origin) return true;
          if (u.pathname === location.pathname) { ES.menu?.leave(); return true; }
        } catch (e) { return true; }
        return false;
      },
      transitions: [{
        name: "slant",
        sync: true,
        leave() { return new Promise((r) => setTimeout(r, ES.reduce ? 0 : ES.projectNext ? 300 : 1000)); },
        beforeEnter({ next }) {
          ES.busy = true;
          next.container.classList.add("is-entering");
          // When the next work board fills and arrives (original isProjectTransition), the new page rises immediately with no curtain and the photo folds to 50%
          gsap.set(next.container, { visibility: "visible", clipPath: ES.projectNext ? "none" : "polygon(0% 0%, 100% 0%, 100% 0%, 0% -50%)" });
        },
        enter({ current: cur, next }) {
          const prev = current, pn = ES.projectNext;
          current = mount(next.container);
          const theme = next.container.dataset.pageTheme || "dark";
          const overlay = q(".es-page-overlay", cur.container);
          const tl = gsap.timeline();
          if (pn) {
            tl.add(() => { ES.nav.theme(theme); current.intro.play(); }, 0);
            return tl.to({}, { duration: ES.reduce ? 0 : 0.3 }).then(() => { unmount(prev); ES.menu?.leave(); });
          }
          if (overlay && !(veil && veil.isActive())) tl.fromTo(overlay, { visibility: "visible", opacity: 0 }, { opacity: 0.7, duration: ES.reduce ? 0 : 1, ease: "none" }, 0);
          veil = null;
          if (theme === "dark") tl.fromTo(next.container, { backgroundColor: ES.color("--site-stage-2") }, { backgroundColor: ES.color("--kf-contrast-bg"), duration: ES.reduce ? 0 : 1, ease: "power1.in" }, 0);
          tl.to(next.container, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: ES.reduce ? 0 : 1, ease: "esPage" }, 0);
          tl.add(() => { if (ES.nav.hidden) ES.nav.show(); }, 0);
          tl.add(() => { ES.nav.theme(theme); current.intro.play(); }, ES.reduce ? 0 : 0.3);
          return tl.then(() => {
            unmount(prev);
            ES.menu?.leave();
          });
        },
        after({ next }) {
          next.container.classList.remove("is-entering");
          gsap.set(next.container, { clearProps: "clipPath,backgroundColor,visibility" });
          toTop();
          ES.busy = false;
          current.loaded?.();
          ES.navScroll?.();
          ES.refresh();
        },
      }],
    });
  };

  ES.start = () => (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start, { once: true }) : start());
})();
