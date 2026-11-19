// Home motion — numbers exactly from the original home.js: entrance (.4s power1.out four beats), five-scene frame loop (.6/.4s power2.out),
// Photo push swap for the three promises (.5s sine.in, clip 75%, x 25%), and only on phones the hero blurs with scroll (scrub 1).
// Sliders use exactly what the original does: Splide 4.1.4 (hero) and Swiper 8 (new products, seasonal picks, three-promise photos).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const PC = matchMedia("(min-width: 768px)");
  const pad = (n) => String(n).padStart(2, "0");

  const main = $(".h-mv__main");
  const text = $(".h-feel__text");
  const cover = $(".h-feel__cover");
  const jp = $(".h-feel__jp");
  const announce = $(".h-concept__announce");
  const scrollCue = $(".h-scroll");
  const thumb = $(".h-mv__thumb");
  const header = $(".dw-head");
  const concept = $(".h-concept");

  // ── Hero banner: on desktop the left thumbnail column (2 visible · rtl · 4.5s) rotates, and each time it advances the large banner slides sideways to change.
  //    on phones the big banner itself is the Splide. Autoplay turns on after both finish their entrance ──
  const mv = (() => {
    const thumbEl = $(".h-mv__thumb .splide");
    const mainEl = $(".h-mv__sp");
    const slides = $$(".splide__slide", mainEl);
    const pics = $$(".splide__slide .h-mv__pic", mainEl);
    const n = slides.length;
    $$(".h-count__len").forEach((el) => (el.textContent = pad(n)));
    const IN = { x: "-25%", clipPath: "inset(0% 75% 0% 0%)" };
    const ON = { x: "0%", clipPath: "inset(0% 0% 0% 0%)" };
    const OUT = { x: "25%", clipPath: "inset(0% 0% 0% 75%)" };
    const SWAP = { duration: 0.7, ease: "power3.in" };
    const BASE = {
      type: "loop", direction: "rtl", rewind: true, autoplay: "pause", interval: 4500, speed: 700, easing: "cubic-bezier(0.58, -0.05, 0.78, 0.17)",
      arrows: false, isNavigation: false, pagination: false, drag: false, wheel: false, keyboard: false, paginationKeyboard: false, resetProgress: true,
    };
    const countIn = (el, t) => gsap.timeline()
      .to(el, { opacity: 0.1, y: "-15%", duration: 0.2, delay: 0.1, ease: "power1.out" }, "")
      .to(el, { opacity: 1, y: "0%", duration: 0.2, delay: 0.3, ease: "power1.out", onStart: () => (el.textContent = pad(t + 1)) }, "");
    const hold = (t) => slides.forEach((sl, k) => (sl.style.pointerEvents = k === t ? "auto" : "none"));

    if (PC.matches) {
      let e = 0, t = 0, i = 2;
      const cur = $(".h-count__cur", thumb), bar = $(".h-count__bar i", thumb);
      const sp = new Splide(thumbEl, { ...BASE, start: 1, perPage: 2, focus: 0, gap: "1px", pauseOnHover: true, cloneStatus: true });
      sp.on("click", (sl) => {
        if (sl.isClone) { t = (sl.index + n) % n; i = n + 1; } else { t = sl.index; i = t + 1; }
        sp.go(i);
      });
      sp.on("move", (r) => {
        thumbEl.style.pointerEvents = "none";
        i = (r + n) % n;
        t = i === 0 ? n - 1 : i - 1;
        gsap.timeline({ onComplete: () => { e = t; hold(t); } })
          .fromTo(pics[e], ON, { ...OUT, ...SWAP }, "")
          .fromTo(pics[t], IN, { ...ON, ...SWAP }, "")
          .add(countIn(cur, t), 0);
      });
      sp.on("moved", () => (thumbEl.style.pointerEvents = "auto"));
      sp.on("autoplay:playing", (rate) => (bar.style.transform = `scaleX(${rate})`));
      sp.mount();
      return sp;
    }

    let e = 0, t = 0, fwd = true, busy = false, moved = false, mouse = false, x0 = 0, x1 = 0;
    const box = mainEl.parentElement;
    const cur = $(".h-count__cur", box), bar = $(".h-count__bar i", box);
    const sp = new Splide(mainEl, { ...BASE, start: 0, clones: 0, pauseOnHover: false });
    sp.on("click", () => sp.Components.Autoplay.play());
    sp.on("move", (d) => {
      t = d;
      busy = true;
      gsap.timeline({ defaults: SWAP, onComplete: () => { e = t; fwd = true; busy = false; sp.Components.Autoplay.play(); hold(t); } })
        .fromTo(pics[e], ON, fwd ? OUT : IN, "")
        .fromTo(pics[t], fwd ? IN : OUT, ON, "")
        .add(countIn(cur, t), 0);
    });
    sp.on("autoplay:playing", (rate) => (bar.style.transform = `scaleX(${rate})`));
    sp.mount();
    // Original: dragging is not left to Splide (drag: false) — one slide in the direction the hand was released
    const flick = () => {
      if (x0 < x1) { fwd = true; t = e === n - 1 ? 0 : e + 1; } else { fwd = false; t = e === 0 ? n - 1 : e - 1; }
      sp.go(t);
    };
    mainEl.addEventListener("touchstart", (ev) => { if (busy) return; moved = false; x0 = ev.touches[0].pageX; sp.Components.Autoplay.pause(); }, { passive: true });
    mainEl.addEventListener("mousedown", (ev) => { if (busy) return; moved = false; mouse = true; x0 = ev.pageX; sp.Components.Autoplay.pause(); });
    mainEl.addEventListener("touchmove", (ev) => { if (busy) return; moved = true; x1 = ev.changedTouches[0].pageX; }, { passive: true });
    mainEl.addEventListener("mousemove", (ev) => { if (busy) return; moved = true; if (mouse) x1 = ev.pageX; });
    mainEl.addEventListener("touchend", () => { if (!busy && moved) flick(); });
    mainEl.addEventListener("mouseup", () => { if (moved && mouse) { mouse = false; if (!busy) flick(); } });
    return sp;
  })();

  // ── New products: speed 600, slidesPerView auto, grab hand drag, horizontal wheel, arrows, progress bar ──
  const pickup = $(".h-pickup");
  new Swiper($(".h-pickup__track"), {
    speed: 600, grabCursor: true, initialSlide: 0, touchRatio: 1, slidesPerView: "auto", mousewheel: { forceToAxis: true },
    navigation: { nextEl: $(".h-nav__next", pickup), prevEl: $(".h-nav__prev", pickup) },
    pagination: { el: $(".h-progress", pickup), type: "progressbar" },
  });

  // ── Seasonal fishing: Swiper with the same settings on phones only (no arrows), detached into a two-row grid on desktop ──
  let fishing = null;
  const fishingOn = () => {
    if (!PC.matches && !fishing) {
      fishing = new Swiper($(".h-fishing__cards"), {
        speed: 600, grabCursor: true, initialSlide: 0, touchRatio: 1, slidesPerView: "auto", mousewheel: { forceToAxis: true },
        pagination: { el: $(".h-fishing__body .h-progress"), type: "progressbar" },
      });
    } else if (PC.matches && fishing) {
      fishing.destroy(true, true);
      fishing = null;
    }
  };
  fishingOn();
  PC.addEventListener("change", fishingOn);

  // ── Three promises photos: fade (crossFade · 4s · loop). On desktop only the current row auto-advances ──
  const fades = $$("[data-fade]").map((el) => new Swiper(el, {
    effect: "fade", fadeEffect: { crossFade: true }, autoplay: { delay: 4000, disableOnInteraction: false }, loop: true,
    grabCursor: true, initialSlide: 0, touchRatio: 1, pagination: { el: $(".h-fade__dots", el), type: "bullets" },
  }));
  if (PC.matches) fades.forEach((f) => f.autoplay.stop());

  const mm = gsap.matchMedia();

  mm.add({ pc: "(min-width: 768px)", sp: "(max-width: 767px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    const { pc, sp, motion } = ctx.conditions;
    if (!motion) {
      fades.forEach((f) => f.autoplay.stop());
      return;
    }

    // ── Intro: the banner fills the screen then shrinks into place, a black curtain sweeps across the tagline, then the rest comes in on one beat ──
    gsap.set(text, { opacity: 0 });
    gsap.set(jp, { opacity: 0, x: "-6%" });
    gsap.set(announce, { opacity: 0, yPercent: 10 });
    gsap.set(scrollCue, { opacity: 0 });
    if (pc) {
      gsap.set(main, { width: "100vw", height: "100vh" });
      gsap.set(thumb, { x: "-100%" });
      gsap.set(header, { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" });
    } else {
      gsap.set(main, { height: "calc(100vh - 5.5rem)" });
    }
    const intro = gsap.timeline({ paused: true, defaults: { duration: 0.4, ease: "power1.out" } });
    if (pc) intro.to(main, { width: "140.2rem", height: "100%" }, "first");
    else intro.to(main, { height: "44.7rem" }, "first");
    intro
      .to(cover, { clipPath: "inset(0% 0% 0% 0%)", delay: 0.3 }, "first")
      .set(text, { opacity: 1 }, "second")
      .to(cover, { clipPath: "inset(0% 0% 0% 100%)" }, "third")
      .to(jp, { opacity: 1, x: 0, delay: 0.6 }, "first");
    if (pc) {
      intro
        .to(scrollCue, { opacity: 1 }, "fourth")
        .to(announce, { opacity: 1, yPercent: 0 }, "fourth")
        .to(thumb, { x: 0 }, "fourth")
        .to(header, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", clearProps: "clipPath" }, "fourth");
    } else {
      intro.to(scrollCue, { opacity: 1, delay: 0.6 }, "first").to(announce, { opacity: 1, yPercent: 0 }, "fourth");
    }
    intro.eventCallback("onComplete", () => {
      gsap.set(main, { clearProps: "width,height" });
      mv.Components.Autoplay.play();
    });
    // The original doesn’t wait for the loading screen to clear — it plays as soon as the script runs (already started behind the screen)
    intro.play();

    // ── Phone: while the tagline moves from screen center to top, the Hero photo and notifications fade and the scroll cue returns to place ──
    if (sp) {
      gsap.set(scrollCue, { y: "-5.4rem" });
      gsap.timeline({ scrollTrigger: { trigger: ".h-concept__heading", start: "top center", end: "top top", scrub: 1 } })
        .to([".h-mv__images", ".h-mv__notice"], { autoAlpha: 0 }, "")
        .to(scrollCue, { y: "0rem" }, "");
    }

    // ── Frame with five scenes: starts once when the top of the tagline section touches the top of the screen and keeps looping (frame size and scene name change together) ──
    const st = $$(".h-concept__cards li");
    const imgs = $$(".h-ccard__img");
    const loop = () => gsap.timeline({ defaults: { duration: 0.4, delay: 0.6, ease: "power2.out" }, repeat: -1 })
      .to(imgs, { width: "63%", height: "100%", duration: 0.6, delay: 0.1 }, "second")
      .to(st[0], { opacity: 0, delay: 0.1 }, "second")
      .to(st[1], { opacity: 1, delay: 0.1 }, "second")
      .to(imgs, { width: "91%", height: "80%", duration: 0.6 }, "third")
      .to(st[1], { opacity: 0 }, "third")
      .to(st[2], { opacity: 1 }, "third")
      .to(imgs, { width: "77%", height: "98%", duration: 0.6 }, "fourth")
      .to(st[2], { opacity: 0 }, "fourth")
      .to(st[3], { opacity: 1 }, "fourth")
      .to(imgs, { width: "100%", height: "84%", duration: 0.6 }, "fifth")
      .to(st[3], { opacity: 0 }, "fifth")
      .to(st[4], { opacity: 1 }, "fifth")
      .to(imgs, { width: "100%", height: "70%", duration: 0.6 }, "first")
      .to(st[4], { opacity: 0 }, "first")
      .to(st[0], { opacity: 1 }, "first")
      .to(st[0], { opacity: 1, duration: 0.5, delay: 0 }, "wait");
    let loopTl;
    ScrollTrigger.create({ trigger: concept, start: "top top", once: true, onEnter: () => (loopTl = loop()) });
    // The scroll cue disappears once the tagline section’s bottom reaches the bottom of the screen, and shows again when you scroll back
    ScrollTrigger.create({
      trigger: concept, start: "bottom bottom",
      onEnter: () => gsap.to(scrollCue, { autoAlpha: 0, duration: 0.5, ease: "power1.out" }),
      onLeaveBack: () => gsap.to(scrollCue, { autoAlpha: 1, duration: 0.5, ease: "power1.out" }),
    });

    // ── Three promises (desktop): when the row reaches the screen center, the photo slides sideways to change and the text goes .4↔1 ──
    if (pc) {
      const lis = $$(".h-three__body > ol > li");
      const txt = lis.map((li) => $$(".h-tcard__heading, .h-tcard__text", li));
      // The original pushes every image in that row together, including sections cloned by loop
      const pics = lis.map((li) => $$(".h-fade__slide .wf-img", li));
      const hid = { x: "-25%", clipPath: "inset(0% 75% 0% 0%)" };
      const on = { x: "0%", clipPath: "inset(0% 0% 0% 0%)" };
      const out = { x: "25%", clipPath: "inset(0% 0% 0% 75%)" };
      let busy = false;
      const B = { duration: 0.5, ease: "sine.in", onStart: () => (busy = true), onComplete: () => (busy = false) };
      const activate = (n) => fades.forEach((f, k) => {
        f.el.closest(".h-tcard__images").style.pointerEvents = k === n ? "auto" : "none";
        f.pagination.el.style.visibility = k === n ? "visible" : "hidden";
        if (k === n) f.autoplay.start();
        else f.autoplay.stop();
      });
      gsap.set([txt[1], txt[2]], { opacity: 0.4 });
      gsap.set([pics[1], pics[2]], hid);
      const fade = (from, to) => gsap.timeline()
        .to(txt[from], { opacity: 0.4, duration: 0.4, ease: "power1.out" }, "")
        .to(txt[to], { opacity: 1, duration: 0.4, ease: "power1.out" }, "");
      const swap = (from, to, dir) => {
        // If the previous push-swap is still running, only the incoming side restarts (same as the original)
        if (busy) return gsap.fromTo(pics[to], dir > 0 ? hid : out, { ...on, ...B });
        gsap.timeline({ defaults: B }).fromTo(pics[from], on, dir > 0 ? out : hid, "").fromTo(pics[to], dir > 0 ? hid : out, on, "");
      };
      lis.forEach((li, t) => ScrollTrigger.create({
        trigger: li, start: "top center", end: "bottom center",
        onEnter: () => {
          if (t === 0) return fades[0].autoplay.start();
          activate(t); fade(t - 1, t); swap(t - 1, t, 1);
        },
        onEnterBack: () => {
          if (t === lis.length - 1) return;
          activate(t); fade(t + 1, t); swap(t + 1, t, -1);
        },
      }));
    }
    return () => loopTl?.kill();
  });
})();
