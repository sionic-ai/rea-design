// Motion shared by all pages — original values as is:
// Lenis 1.3.17 (duration .6 · 1-(1-t)^4), head scrollY>10 is a blurred back panel, full-screen menu (panel .8 power3.out · four dots spread apart · links from the end .05),
// Button hover indicator (btn--interacted), color echo layers (1000px and up — each layer follows later), data-reveal (from 120px below .8 power2.out), work card service tag hover,
// Review Swiper (fade, speed 0, arrows), and page header title words rising up (SplitText).
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const mm = gsap.matchMedia();
  const motion = "(prefers-reduced-motion: no-preference)";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Echo layer colors — the first layer is one of purple·orange·navy, the second one of sky·yellow·lavender (the original is also random each time it opens)
  const ECHO = [["var(--kf-accent)", "var(--site-orange)", "var(--site-deep-blue)"], ["var(--site-light-blue)", "var(--site-yellow)", "var(--site-malva)"]];
  const paintEcho = (root) => $$(".an-echo__layer", root).forEach((l, i) => {
    const set = ECHO[i % ECHO.length];
    l.style.setProperty("--echo-color", set[Math.floor(Math.random() * set.length)]);
  });
  window.anMotion = { paintEcho, ECHO };

  // Like the original, once any page is opened, that window never shows the first-page wordmark loader again
  if (!document.querySelector(".an-preloader")) sessionStorage.setItem("an-preloader", "true");

  // ───── Smooth scroll
  const lenis = (window.lenisInstance = reduce ? null : new Lenis({
    duration: 0.6, easing: (t) => 1 - Math.pow(1 - t, 4), touchMultiplier: 1, wheelMultiplier: 1, prevent: (n) => n.closest("dialog"),
  }));
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const t = id && id !== "#" ? document.getElementById(id.slice(1)) : null;
    if (!t) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(t) : t.scrollIntoView();
  }));

  // ───── Header: blurred backing once scrolled past 10px
  const header = $(".an-header");
  if (header) {
    header.classList.toggle("is-scrolled", scrollY > 10);
    ScrollTrigger.create({ start: 10, end: 99999, onToggle: (s) => header.classList.toggle("is-scrolled", s.isActive) });
  }

  // ───── Fullscreen menu
  const toggle = $(".an-toggle"), nav = $(".an-fullnav");
  if (header && toggle && nav) {
    const dots = $$(".an-toggle__dot", toggle);
    const links = $$(".an-fullnav__menu a", nav);
    const feats = $$(".an-feat", nav);
    const echo = $(".an-echo", nav);
    const layers = echo ? $$(".an-echo__layer", echo) : [];
    const echoOn = echo && getComputedStyle(echo).display !== "none";
    const fade = [$(".an-menu", header), $(".an-header__cta", header)].filter(Boolean);
    const backdrop = $(".an-header__backdrop", header);
    const DIR = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
    if (echo) paintEcho(echo);
    const reset = () => {
      gsap.set(links, { opacity: 0, y: -30 });
      gsap.set(dots, { x: 0, y: 0 });
      gsap.set(nav, { visibility: "hidden", yPercent: -100 });
      if (feats.length) gsap.set(feats, { yPercent: -50 });
      if (layers.length) gsap.set(layers, { yPercent: 0 });
    };
    reset();
    const open = gsap.timeline({ paused: true, defaults: { ease: "power3.out" }, onStart: () => gsap.set(nav, { visibility: "visible" }) });
    open.to(nav, { yPercent: 0, duration: 0.8 });
    dots.forEach((d, i) => open.to(d, { x: DIR[i][0], y: DIR[i][1], duration: 0.25, ease: "power2.out" }, 0));
    if (fade.length) open.to(fade, { autoAlpha: 0, duration: 0.33 }, "<");
    if (backdrop) open.set(backdrop, { visibility: "hidden" }, "<");
    open.to(links, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: { each: 0.05, from: "end" } }, "-=0.6");
    if (feats.length) open.to(feats, { yPercent: 0, duration: 0.8, stagger: 0.2 }, 0);
    if (echoOn) layers.forEach((l, i) => open.to(l, { keyframes: { yPercent: [8 * (i + 1), 0] }, duration: 1, ease: "power2.inOut" }, 0.06 * i));
    const close = gsap.timeline({ paused: true, defaults: { ease: "power3.out" }, onComplete: () => { reset(); fade.forEach((f) => gsap.set(f, { clearProps: "opacity,visibility" })); } });
    close.to(nav, { yPercent: -100, duration: 0.8 });
    dots.forEach((d) => close.to(d, { x: 0, y: 0, duration: 0.25, ease: "power2.out" }, 0));
    close.addLabel("hide");
    if (fade.length) close.to(fade, { autoAlpha: 1, duration: 0.45 }, "hide-=0.2");
    if (backdrop) close.to(backdrop, { visibility: "visible", duration: 0.45, onComplete: () => gsap.set(backdrop, { clearProps: "opacity,visibility" }) }, "<");
    if (echoOn) layers.forEach((l, i) => close.to(l, { keyframes: { yPercent: [8 * (i + 1), 0] }, duration: 0.6, ease: "power2.inOut" }, 0.06 * i));
    toggle.addEventListener("click", () => {
      const on = document.body.classList.toggle("has-full-nav-open");
      header.classList.toggle("has-full-nav-open", on);
      toggle.setAttribute("aria-expanded", String(on));
      if (on) { close.pause(); open.restart(); lenis?.stop(); } else { open.pause(); close.restart(); lenis?.start(); }
    });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("has-full-nav-open")) toggle.click(); });
  }

  // ───── Cursor tag: over a data-cursor-text panel it follows the cursor and opens from the left in .25s (original custom-cursor)
  const cur = $(".an-cursor");
  if (cur) {
    const text = $(".an-cursor__text", cur);
    addEventListener("pointermove", (e) => { cur.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`; });
    $$("[data-cursor-text]").forEach((el) => {
      el.addEventListener("pointerenter", () => {
        text.textContent = el.dataset.cursorText;
        cur.classList.add("is-visible");
        cur.classList.toggle("is-light", el.dataset.cursorTheme === "light");
        cur.classList.toggle("has-icon", !!el.dataset.cursorIcon);
      });
      el.addEventListener("pointerleave", () => cur.classList.remove("is-visible"));
    });
  }

  // Button: only after hovering once, on leave the ▶ crosses backward
  $$(".an-btn").forEach((b) => b.addEventListener("mouseenter", () => b.classList.add("is-touched"), { once: true }));

  // ───── Color echo layers (1000px and up): each layer follows the scroll late (lerp .14·.08·.02) and is dragged at most echoMax
  mm.add(`${motion} and (min-width: 1000px)`, () => {
    const echoes = $$("[data-echo]");
    if (!echoes.length) return;
    let y = scrollY;
    const runs = echoes.map((e) => {
      const ls = $$(".an-echo__layer", e);
      paintEcho(e);
      const dir = e.dataset.echo === "leading" ? 1 : -1, max = parseFloat(e.dataset.echoMax) || 100;
      const run = { on: false, layers: ls.map((el, i) => ({ el, cur: scrollY, lerp: Math.max(0.02, 0.14 - 0.06 * i), lag: max * ((i + 1) / ls.length) })) };
      run.tick = () => {
        let still = true;
        run.layers.forEach((l) => {
          l.cur += (y - l.cur) * l.lerp;
          l.cur = Math.max(y - l.lag, Math.min(y + l.lag, l.cur));
          const d = Math.round(10 * (l.cur - y)) / 10;
          if (Math.abs(d) > 0.5) still = false;
          l.el.style.transform = `translate3d(0, ${d * dir}px, 0)`;
        });
        if (still) { gsap.ticker.remove(run.tick); run.on = false; }
      };
      return run;
    });
    const onScroll = () => { y = scrollY; runs.forEach((r) => { if (!r.on) { r.on = true; gsap.ticker.add(r.tick); } }); };
    addEventListener("scroll", onScroll, { passive: true });
    return () => { removeEventListener("scroll", onScroll); runs.forEach((r) => { gsap.ticker.remove(r.tick); r.layers.forEach((l) => (l.el.style.transform = "")); }); };
  });

  // ───── Work card: service tags rise from 20px below in .25s with .05s offsets (touch devices only)
  mm.add("(hover: hover) and (pointer: fine)", () => {
    const offs = $$(".an-work").map((card) => {
      const tags = $$(".an-work__service", card);
      if (!tags.length) return null;
      const tl = gsap.timeline({ paused: true, defaults: { duration: 0.25, ease: "power2.out" } });
      tl.from(tags, { y: 20, autoAlpha: 0, stagger: 0.05 });
      const on = () => tl.play(), off = () => tl.reverse();
      card.addEventListener("mouseenter", on);
      card.addEventListener("mouseleave", off);
      return () => { card.removeEventListener("mouseenter", on); card.removeEventListener("mouseleave", off); tl.revert(); };
    });
    return () => offs.forEach((f) => f?.());
  });

  // ───── data-reveal: at the 85% screen line, slide-up (120px) · slide-down (-120px) · fade-in, opacity .3s linear + position .8s power2.out
  const FROM = { "slide-up": { autoAlpha: 0, y: 120 }, "slide-down": { autoAlpha: 0, y: -120 }, "fade-in": { autoAlpha: 0 } };
  mm.add(motion, () => {
    const singles = $$("[data-reveal]:not([data-reveal-batch])");
    singles.forEach((el) => gsap.set(el, FROM[el.dataset.reveal] || { autoAlpha: 0 }));
    singles.forEach((el) => {
      const delay = parseFloat(el.dataset.revealDelay) || 0;
      ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => {
        if (el.dataset.reveal === "fade-in") { gsap.to(el, { autoAlpha: 1, duration: 0.8, ease: "power2.out", delay }); return; }
        gsap.to(el, { autoAlpha: 1, duration: 0.3, ease: "none", delay, overwrite: "auto" });
        gsap.to(el, { y: 0, duration: 0.8, ease: "power2.out", delay, overwrite: "auto" });
      } });
    });
    const batch = $$("[data-reveal][data-reveal-batch]");
    batch.forEach((el) => gsap.set(el, FROM[el.dataset.reveal] || { autoAlpha: 0 }));
    if (batch.length) ScrollTrigger.batch(batch, { start: "top 85%", once: true, onEnter: (els) => {
      gsap.to(els, { autoAlpha: 1, duration: 0.3, ease: "none", stagger: 0.15, overwrite: "auto" });
      gsap.to(els, { y: 0, duration: 0.8, ease: "power2.out", stagger: 0.15, overwrite: "auto" });
    } });
  });

  // ───── Review slider: overlapping crossfade (fade, speed 0), and the related-work slider next to it moves together too
  $$(".an-testi").forEach((w) => {
    const main = $(".an-testi__main", w), rel = $(".an-testi__related", w);
    if (!main || typeof Swiper === "undefined") return;
    const r = rel ? new Swiper(rel, { slidesPerView: 1, effect: "fade", fadeEffect: { crossFade: true }, speed: 0 }) : null;
    new Swiper(main, {
      slidesPerView: 1, effect: "fade", fadeEffect: { crossFade: true }, speed: 0, autoHeight: true,
      navigation: { nextEl: $(".an-testi__next", w), prevEl: $(".an-testi__prev", w) },
      controller: r ? { control: r } : undefined, breakpoints: { 768: { autoHeight: false } },
    });
  });

  // ───── Subpage first entrance (data-intro): title words inside line masks rise from 100% below over .5s with a .08s stagger
  //   page — body appears straight in .5s (service · About) · work — header · body are set down at the bottom edge of the screen, then raised over 1.2s power3.inOut with a .1 offset (work list)
  // archive — each line .15s later, words .05 apart, .4s power2.out, body .4s (News) · single — head and body .5s, .1 apart (work detail)
  const splitWords = (title, tl, label, perLine) => SplitText.create(title, { type: "lines,words", mask: "lines", linesClass: "an-line", wordsClass: "an-word", autoSplit: true, onSplit(s) {
    gsap.set(title, { autoAlpha: 1 });
    [0, 1, 2, 3, 4, 5, 6, 7].forEach((k) => { const old = tl.getById(`w-${k}`); if (old) tl.remove(old); });
    if (perLine) s.lines.forEach((l, i) => tl.add(gsap.from($$(".an-word", l), { yPercent: 100, stagger: 0.05, duration: 0.4, ease: "power2.out", id: `w-${i}` }), `${label}+=${0.15 * i}`));
    else { gsap.set(s.words, { yPercent: 100 }); tl.add(gsap.fromTo(s.words, { yPercent: 100 }, { yPercent: 0, stagger: 0.08, duration: 0.5, id: "w-0" }), label); }
    if (tl.progress() === 1) tl.progress(1);
  } });
  window.anMotion.splitWords = splitWords;
  const intro = $("[data-intro]");
  if (intro && intro.dataset.intro !== "custom") {
    const kind = intro.dataset.intro, title = $("[data-intro-title]", intro), body = $("[data-intro-body]");
    if (reduce) gsap.set([intro, title, body, $("[data-intro-filters]")].filter(Boolean), { autoAlpha: 1 });
    else document.fonts.ready.then(() => {
      const tl = gsap.timeline({ onComplete: () => document.body.classList.add("intro-done") });
      tl.addLabel("revealTitle", 0);
      if (kind === "single") { tl.to([intro, body].filter(Boolean), { autoAlpha: 1, duration: 0.5, stagger: 0.1 }); return; }
      gsap.set(intro, { autoAlpha: 1 });
      if (title) splitWords(title, tl, "revealTitle", kind === "archive");
      if (kind === "work" && body) {
        const pad = parseFloat(getComputedStyle($(".an-content")).paddingTop) || 0;
        const room = (window.visualViewport?.height ?? innerHeight) - pad;
        if (intro.getBoundingClientRect().height < room) gsap.set([intro, body], { y: room - intro.offsetHeight });
        tl.to([intro, body], { y: 0, autoAlpha: 1, duration: 1.2, ease: "power3.inOut", stagger: 0.1 }, 0);
      } else if (kind === "archive") {
        tl.to([body, $("[data-intro-filters]")].filter(Boolean), { autoAlpha: 1, duration: 0.4, ease: "none", stagger: 0.1 }, "-=0.5");
      } else if (body) tl.to(body, { autoAlpha: 1, duration: 0.5, ease: "none" }, "-=.5");
    });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();
