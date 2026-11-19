// Device shared by all pages — opening curtain, Locomotive smooth scroll (lerp .2 · multiplier .4), menu drawer, re-attaching per page after each transition.
// The transition (barba) itself is the page-swap-fade part, the hero intro is the blob-window-intro part, and rise-up · fish · ring rotation are each handled by their own motion part.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = matchMedia("(max-width: 767px)").matches;
  let loco = null, hero = null;

  // On phone, a droplet window stretches sideways 2.7x and covers the screen (original #p-index-hero__clip-sp). Options are changed before the parts attach (this script runs before DOMContentLoaded)
  // Header line, menu and booking button rise together only on the first open (the e in the original intro(t, e)) — if set in markup, a new body attached by a transition would also hide the header line
  const tuneHero = () => {
    const h = $('[data-fx~="blob-window-intro"]');
    if (!h) return;
    const first = "line-at: .75; line-gap: .25; after-at: .9; after-gap: .2; with: .ar-header, .ar-gnav, .ar-burger, .ar-floating";
    h.setAttribute("data-fx-blob-window-intro", phone ? `${first}; x: -65vw; y: -8vh; sx: 2.7; sy: .9; ease: 0.87,0,0.13,1` : first);
  };
  // The first screen entered via a transition keeps the intro at its end position — the original transition does not change the screen until 583ms after the new body arrives (motion-probe nav).
  // The part attaches the moment Barba attaches the new body and is already running, so send that timeline to the end.
  const settleHero = (c) => {
    c.querySelectorAll(".fx-blob-window-intro-hide").forEach((n) => n.classList.remove("fx-blob-window-intro-hide"));
    const win = $('[data-fx~="blob-window-intro"] [data-fx-part="window"]', c);
    if (win) gsap.getTweensOf(win).forEach((t) => (t.parent && t.parent !== gsap.globalTimeline ? t.parent : t).progress(1));
  };

  const startScroll = (c) => {
    loco?.destroy();
    loco = null;
    if (!window.LocomotiveScroll || reduce) return;
    loco = new LocomotiveScroll({ el: c, smooth: true, lerp: 0.2, multiplier: 0.4 });
  };

  const startHero = (c) => {
    hero?.destroy?.(true, true);
    hero = null;
    const el = $(".ar-hero__slider", c);
    if (!el || !window.Swiper) return;
    // Original #p-index-hero__slider — overlapping fade of 3s, automatic every 4s, cannot be swiped by hand
    hero = new Swiper(el, { loop: true, effect: "fade", speed: reduce ? 0 : 3000, allowTouchMove: false, simulateTouch: false, autoplay: reduce ? false : { delay: 4000 } });
  };

  const markPage = (c) => {
    const ns = c.dataset.barbaNamespace || "home";
    document.body.dataset.page = ns;
  };

  const enter = (c) => {
    markPage(c);
    startScroll(c);
    startHero(c);
    requestAnimationFrame(() => loco?.update());
  };

  // Menu drawer — the circle rises in .4s linear to become a square and the text turns on in 1.4s. On close the circle exits upward in 1.4s
  const drawer = $("#ar-drawer"), burger = $(".ar-burger");
  let closeTimer = 0, art = null;
  // Original drawer timeline — (panel opacity can’t be caught even when measured in the original, so it turns on at once) lumps and car from (−80%, 100%) over 2s expo.out (.5·.5·.7·.9s), fish with a .2s offset, turtle from 30px
  const drawArt = () => {
    const box = $(".ar-drawer__illust");
    if (!box || reduce) { if (box) box.style.opacity = 1; return; }
    art?.kill();
    const expo = "expo.out";
    gsap.set(box, { opacity: 1 });
    art = gsap.timeline()
      .fromTo(".ar-di-place1", { xPercent: -80, yPercent: 100 }, { xPercent: 0, yPercent: 0, duration: 2, ease: expo }, 0.5)
      .fromTo(".ar-di-car", { xPercent: -80, yPercent: 100 }, { xPercent: 0, yPercent: 0, duration: 2, ease: expo }, 0.5)
      .fromTo(".ar-di-place2", { xPercent: -80, yPercent: 100 }, { xPercent: 0, yPercent: 0, duration: 2, ease: expo }, 0.7)
      .fromTo(".ar-di-place3", { xPercent: -80, yPercent: 100 }, { xPercent: 0, yPercent: 0, duration: 2, ease: expo }, 0.9)
      .fromTo(".ar-di-fish", { x: -30, y: 30 }, { x: 0, y: 0, duration: 1, ease: expo, stagger: 0.2 }, 1.1)
      .fromTo(".ar-di-turtle", { x: -30, y: 30 }, { x: 0, y: 0, duration: 2, ease: expo }, 1.3);
  };
  const open = () => {
    clearTimeout(closeTimer);
    drawer.classList.remove("is-closing");
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    loco?.stop();
    drawArt();
  };
  const close = () => {
    if (!drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    drawer.classList.add("is-closing");
    drawer.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    loco?.start();
    closeTimer = setTimeout(() => drawer.classList.remove("is-closing"), reduce ? 0 : 1400);
  };
  burger?.addEventListener("click", () => (drawer.classList.contains("is-open") ? close() : open()));
  drawer?.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  // Transition — on leaving, a curtain blocks clicks, and on entering, scroll and slide are re-attached to the new body
  const mask = $(".ar-loading__mask");
  document.addEventListener("fx:page-leave", () => { if (mask) mask.style.display = "block"; close(); });
  // Smooth scroll is set up fresh after the transition fully ends (after hook — the 1.5s while the curtain lifts), like the original. If set up earlier, Locomotive
  // Pins opacity of visible zones to 1 (checkSections), so the new body is fully visible before the entrance fade even starts
  document.addEventListener("fx:page-enter", (e) => {
    const c = e.detail.container;
    settleHero(c);
    markPage(c);
    startHero(c);
    setTimeout(() => {
      if (mask) mask.style.display = "none";
      if (!c.isConnected) return;
      startScroll(c);
      requestAnimationFrame(() => loco?.update());
    }, reduce ? 0 : 1500);
  });

  // First open — the Hero (index) curtain from the original once (1s expo.inOut) lifts before the first paint when measured headless so it isn’t seen, and the intro finishes within 1.3s after the first paint (motion-probe load).
  // So index has no curtain. In the original, load flies the window in 150ms after the first paint and rests until 733ms before the lines rise, so the intro lines rise from .75s (earlier than the code’s line start of 1.5s)
  // Once all fonts arrive (1.5s at the latest) everything shows at once — a single line in the header attaches ar-fonts to html
  // Like the original once, a subpage is covered by a white curtain and then lifted with 1s expo.inOut (the first 300ms of motion-probe load is its tail) — attach it when the page starts to be visible
  const first = $(".ar-loading__first");
  // The fish school appears after the curtain has fully cleared as in the original (scroll trigger hung on afterOnce) — attaching the part is deferred so it doesn’t finish under the curtain
  const held = first ? [...document.querySelectorAll('[data-fx~="school-pop-in"]')] : [];
  held.forEach((n) => { n.dataset.fxHold = n.dataset.fx; n.removeAttribute("data-fx"); });
  const release = () => held.forEach((n) => { n.setAttribute("data-fx", n.dataset.fxHold); n.removeAttribute("data-fx-hold"); });
  const c0 = $('[data-barba="container"]');
  // Smooth scroll is also enabled only after the curtain has fully lifted, like the original afterOnce — the Locomotive scrollbar (c-scrollbar) shows once, then disappears in .3s
  const afterOnce = () => {
    first.remove();
    release();
    if (!c0?.isConnected) return;
    startScroll(c0);
    requestAnimationFrame(() => loco?.update());
  };
  const show = () => {
    if (!document.documentElement.classList.contains("ar-fonts")) return;
    document.documentElement.classList.remove("ar-fonts");
    if (first) gsap.to(first, { yPercent: -100, duration: reduce ? 0 : 1, ease: "expo.inOut", onComplete: afterOnce });
  };
  setTimeout(show, 3000);
  (document.fonts?.ready || Promise.resolve()).then(show, show);
  tuneHero();
  // When first entering a page that has no hero intro, don’t make the headline wait
  if (!$('[data-fx~="blob-window-intro"]')) document.querySelectorAll(".fx-blob-window-intro-hide").forEach((n) => n.classList.remove("fx-blob-window-intro-hide"));
  if (c0 && first) { markPage(c0); startHero(c0); } else if (c0) enter(c0);
})();
