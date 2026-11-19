// Shared by all pages — scroll (lenis), header hiding, logo bounce, menu, ticket (time left, flip, pinning), subpage first scene
(() => {
  gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);
  // Original curve names — two stacked sine ease-outs (DoubleSineOut) and two sine ease-ins (DoubleSineIn)
  const so = (t) => Math.sin((Math.PI / 2) * t), si = (t) => 1 - Math.cos((Math.PI / 2) * t);
  gsap.registerEase("doubleSineOut", (t) => so(so(t)));
  gsap.registerEase("doubleSineIn", (t) => si(si(t)));

  const mm = gsap.matchMedia();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isLarge = () => matchMedia("(min-width: 960px)").matches;
  const pointer = matchMedia("(any-hover: hover)").matches;

  // Exactly the original lenis settings — lerp 1 means the wheel follows almost immediately, used only for pinning, locking and skipping
  const lenis = new Lenis({ lerp: 1, duration: 0.4, anchors: { offset: -40 } });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  const site = (window.dSite = { lenis, isLarge, reduce, pointer, mm });
  // If font, slider, or fold sections change height late, the entrance positions drift — re-measure every time the document height changes
  let rt;
  const refresh = () => { clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 200); };
  new ResizeObserver(refresh).observe(document.body);
  document.fonts?.ready.then(refresh);

  // Header — attached to the top of the document and scrolls with it, and once past the hero height, the fixed menu button steps aside
  const header = document.querySelector(".d-header");
  const htrig = document.querySelector(".d-header-trigger");
  const mbtn = document.querySelector(".d-menu-btn");
  if (header && htrig) new IntersectionObserver((es) => es.forEach((e) => { header.classList.toggle("is-active", !e.isIntersecting); mbtn?.classList.toggle("is-away", !e.isIntersecting); })).observe(htrig);

  // Logo: on hover the letters press down then jump up in turn, repeating with a 2s pause, on release they stand up with a spring
  const logo = document.querySelector(".d-logo");
  if (logo && !reduce) {
    const chars = logo.querySelectorAll(".d-logo__char"), other = logo.querySelector(".d-logo__other");
    const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2 });
    tl.to(chars, { scaleX: 1.1, scaleY: 0.5, duration: 0.6, ease: "none", overwrite: "auto" });
    tl.to(other, { scaleX: 1.05, scaleY: 0.5, duration: 0.6, ease: "none", overwrite: "auto" }, "<");
    tl.to(chars, { keyframes: { 0: { yPercent: 0, scaleX: 1.1, scaleY: 0.5, rotate: 0 }, 60: { yPercent: -80, scaleX: 1, scaleY: 1, rotate: 8 }, 80: { yPercent: 0, rotate: 0 }, 90: { yPercent: -12, rotate: -2 }, 100: { yPercent: 0, rotate: 0 } }, duration: 0.8, ease: "doubleSineOut", stagger: 0.12 });
    tl.to(other, { scaleX: 1, scaleY: 1, rotate: 0, duration: 0.6, ease: "elastic.out(1, 0.6)" }, "-=0.6");
    logo.addEventListener("mouseenter", () => tl.play(0));
    logo.addEventListener("mouseleave", () => {
      tl.pause();
      gsap.to(chars, { yPercent: 0, rotate: 0, scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(1, 0.6)" });
      gsap.to(other, { scaleX: 1, scaleY: 1, rotate: 0, duration: 0.6, ease: "elastic.out(1, 0.6)" });
    });
  }

  // Language picker — expands details with a .2s decelerate like the original
  document.querySelectorAll(".d-lang details").forEach((d) => {
    const sum = d.querySelector("summary"), body = d.querySelector(".d-lang__body");
    sum.addEventListener("click", (e) => {
      if (reduce) return;
      e.preventDefault();
      if (d.open) {
        body.animate([{ height: body.offsetHeight + "px" }, { height: "0px" }], { duration: 200, easing: "cubic-bezier(0.19, 1, 0.22, 1)" }).onfinish = () => (d.open = false);
      } else {
        d.open = true;
        body.animate([{ height: "0px" }, { height: body.offsetHeight + "px" }], { duration: 200, easing: "cubic-bezier(0.19, 1, 0.22, 1)" });
      }
    });
  });

  // Menu — the button’s three lines gather at the center and rotate ±45° into an X, while the decorative letters behind pop out elastically in .08s steps
  const menu = document.querySelector(".d-menu"), btn = document.querySelector(".d-menu-btn");
  if (menu && btn) {
    const l1 = btn.querySelector('[data-id="1"]'), l2 = btn.querySelector('[data-id="2"]'), l3 = btn.querySelector('[data-id="3"]');
    const bg = menu.querySelectorAll(".d-menu__bgchar");
    const year = menu.querySelector(".d-menu__logo-year"), mlogo = menu.querySelector(".d-menu__logo");
    const gap = () => (isLarge() ? "-0.67vw" : "-2.25vw"), gap2 = () => (isLarge() ? "0.67vw" : "2.25vw");
    let tl, open = false;
    gsap.set(l1, { y: gap() }); gsap.set(l3, { y: gap2() });
    gsap.set(bg, { scale: 0 });
    const close = () => {
      open = false;
      menu.classList.remove("is-open"); menu.setAttribute("aria-hidden", "true"); menu.inert = true;
      btn.classList.remove("is-menu-open"); btn.setAttribute("aria-expanded", "false");
      lenis.start();
      tl?.kill(); tl = gsap.timeline();
      tl.set(bg, { scale: 0 });
      tl.to(l1, { rotate: 0, duration: 0.4, ease: "elastic.out(1, 0.6)" });
      tl.to(l3, { rotate: 0, duration: 0.4, ease: "elastic.out(1, 0.6)" }, "<");
      tl.set(l2, { opacity: 1 });
      tl.to(l1, { y: gap(), duration: 0.4, ease: "elastic.out(1, 0.6)" }, "+=0.1");
      tl.to(l3, { y: gap2(), duration: 0.4, ease: "elastic.out(1, 0.6)" }, "<");
    };
    const openMenu = () => {
      open = true;
      menu.classList.add("is-open"); menu.setAttribute("aria-hidden", "false"); menu.inert = false;
      btn.classList.add("is-menu-open"); btn.setAttribute("aria-expanded", "true");
      lenis.stop();
      tl?.kill(); tl = gsap.timeline();
      tl.to(l1, { y: 0, duration: 0.2, ease: "doubleSineOut" }, "<");
      tl.to(l3, { y: 0, duration: 0.2, ease: "doubleSineOut" }, "<");
      tl.set(l2, { opacity: 0 });
      tl.to(l1, { rotate: 45, duration: 0.4, ease: "elastic.out(1, 0.6)" }, "+=0.2");
      tl.to(l3, { rotate: -45, duration: 0.4, ease: "elastic.out(1, 0.6)" }, "<");
      tl.to(bg, { scale: 1, ease: "elastic.out(1, 0.4)", duration: 0.6, stagger: 0.08 }, "<-=0.2");
    };
    btn.addEventListener("click", () => (open ? close() : openMenu()));
    menu.querySelector(".d-menu__overlay")?.addEventListener("click", close);
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) close(); });
    // Menu logo — the sun mark presses and unfolds while the numbers bounce, repeating with a 1 second pause
    if (mlogo && year && !reduce) {
      const yl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1 });
      yl.to(year, { scaleX: 1.1, scaleY: 0.6, duration: 0.8, ease: "none" });
      yl.to(year, { scaleX: 1, scaleY: 1, duration: 0.4, ease: "elastic.out(1, 0.6)" }, "-=0.1");
      mlogo.addEventListener("mouseenter", () => yl.play(0));
      mlogo.addEventListener("mouseleave", () => { yl.pause(); gsap.to(year, { scaleX: 1, scaleY: 1, duration: 0.4, ease: "elastic.out(1, 0.6)" }); });
    }
  }

  // Ticket time left — counts every frame until the start date (only changed cells are updated)
  const start = new Date(document.body.dataset.startDate || Date.now()).getTime();
  const boxes = [...document.querySelectorAll("[data-countdown]")].map((t) => ({ d: t.querySelector('[data-cd="date"]'), h: t.querySelector('[data-cd="hour"]'), m: t.querySelector('[data-cd="minute"]'), s: t.querySelector('[data-cd="second"]'), last: "" }));
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const left = Math.max(0, start - Date.now());
    const v = [Math.floor(left / 864e5), pad(Math.floor(left / 36e5) % 24), pad(Math.floor(left / 6e4) % 60), pad(Math.floor(left / 1e3) % 60)];
    const key = v.join(":");
    boxes.forEach((b) => { if (b.last === key || !b.d) return; b.last = key; b.d.textContent = v[0]; b.h.textContent = v[1]; b.m.textContent = v[2]; b.s.textContent = v[3]; });
    requestAnimationFrame(tick);
  };
  if (boxes.length) tick();

  // Sticky ticket — after leaving the Hero, on wide screens it enters from the right with elastic.out(1, .8) .8s, on phones from below with elastic.out(1, .4) .6s
  // Subpages are attached from the start without hiding, as in the original (the first scene brings in from xPercent 10 → 0)
  const fixed = document.querySelector(".d-ticket-fixed"), ttrig = document.querySelector(".d-ticket-trigger"), home = document.querySelector(".d-ticket-home");
  if (fixed && ttrig && home) {
    const away = () => (isLarge() ? { xPercent: 120 } : { yPercent: 180 });
    gsap.set(fixed, away());
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) {
        gsap.to(fixed, { duration: 0.4, ease: "doubleSineOut", ...away() });
        fixed.classList.remove("is-active"); home.classList.remove("is-active");
      } else {
        if (isLarge()) gsap.to(fixed, { duration: 0.8, xPercent: 0, ease: "elastic.out(1, 0.8)" });
        else gsap.to(fixed, { duration: 0.6, yPercent: 0, ease: "elastic.out(1, 0.4)" });
        fixed.classList.add("is-active"); home.classList.add("is-active");
      }
    })).observe(ttrig);
  }

  // Subpage opening scene — the center logo pops in with .3s back.in, and the bottom edge of the sky-blue plate covering it rises, wobbling like a wave with elastic.out(1, .4) over 1.2s
  const fv = document.querySelector(".d-subfv");
  site.subReady = new Promise((done) => {
    if (!fv) return done();
    if (reduce) { fv.remove(); return done(); }
    lenis.stop();
    const path = fv.querySelector("path");
    const tl = gsap.timeline({ onComplete: () => { lenis.start(); gsap.set(".d-header", { clearProps: "y" }); fv.remove(); } });
    tl.to(".d-subfv__logo", { scale: 0, duration: 0.3, ease: "back.in(1.6)", delay: 0.4 });
    tl.to(path, { duration: 1.2, ease: "elastic.out(1, 0.4)", morphSVG: { shape: path.dataset.d, shapeIndex: [0] } }, "-=0.1");
    tl.to(".d-sub-page", { opacity: 1, duration: 0.2, ease: "doubleSineOut", onComplete: done }, 0.8);
    tl.fromTo(".d-sub-page", { y: 10 }, { y: 0, duration: 0.6, ease: "elastic.out(1, 0.6)" }, "<");
    tl.to(".d-ticket-fixed", { opacity: 1, duration: 0.2, ease: "doubleSineOut" }, "<");
    tl.fromTo(".d-ticket-fixed", { xPercent: 10 }, { xPercent: 0, duration: 0.6, ease: "elastic.out(1, 0.6)" }, "<");
    tl.to(".d-sub-char", { opacity: 1, duration: 0.2, ease: "doubleSineOut" }, "<");
    tl.to(".d-header", { opacity: 1, duration: 0.2, ease: "doubleSineOut" }, "<");
    tl.fromTo(".d-header", { y: -10 }, { y: 0, duration: 0.6, ease: "elastic.out(1, 0.6)" }, "<");
  });
})();
