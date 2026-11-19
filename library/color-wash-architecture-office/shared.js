// Motion shared by all pages — exactly the values of the original Webflow IX2 (original names in parentheses):
// Number loader (Start Pre-Loader), Lenis 1.0.29 (lerp .1 · wheel .7), hiding header bar (Navbar-Animate), menu cover (Menu-OPEN/CLOSE),
// Dark mode, text button and underline link hover (Button IN/OUT, Read more), Work card color frame (Featured-hover), accordion,
// Chunk that rises when seen (content-load-IN), photo shrinking 1.2→1 (img-scale-scroll), multi-step contact input, LET'S TALK original.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const root = document.documentElement;
  root.classList.add("ms-js");
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Webflow curve names → GSAP. outQuad is Penner quadratic, same as power1.out
  const E = {
    outQuad: "power1.out", inQuad: "power1.in", inOutQuad: "power1.inOut", outCubic: "power2.out",
    outQuart: "power3.out", inOutQuint: "power4.inOut", outSine: "sine.out", linear: "none",
    ease: CustomEase.create("ms-ease", "0.25,0.1,0.25,1"),
    easeInOut: CustomEase.create("ms-ease-in-out", "0.42,0,0.58,1"),
    load: CustomEase.create("ms-load", "0.327,0.007,0.327,0.96"),
  };
  window.msMotion = { E };

  const mm = gsap.matchMedia();
  const motion = "(prefers-reduced-motion: no-preference)";
  let lenis = null;

  // ───── Number loader: three cells roll over 2.0·1.3·0.8s counting to 100, rest .6s, then the number row rises and the panel fades ─────
  const loader = $(".ms-loader");
  if (loader && root.classList.contains("ms-show-loader")) {
    sessionStorage.setItem("ms-visited", "true");
    const done = () => { root.classList.remove("ms-show-loader"); gsap.set(loader, { clearProps: "opacity" }); };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) done();
    else {
      // The original IX2 PAGE_START runs at Webflow.ready (once the document is parsed) — this script sits at the end of body, so running it right away is the same moment
      const m = (n) => $(`.ms-loader__move.is-${n}`, loader);
      gsap.set([m(1), m(2), m(3), $(".ms-loader__counter", loader)], { yPercent: 0 });
      const run = () => gsap.timeline({ onComplete: done })
        .to(m(3), { yPercent: -1000, duration: 2, ease: E.load }, 0.4)
        .to(m(2), { yPercent: -1000, duration: 1.3, ease: E.load }, 0.8)
        .to(m(1), { yPercent: -100, duration: 0.8, ease: E.load }, 1.2)
        .to($(".ms-loader__counter", loader), { yPercent: -100, duration: 0.4, ease: E.load }, 3.0)
        .to(loader, { opacity: 0, duration: 0.4, ease: E.outQuart }, 3.4);
      run();
    }
  }
  // As in the original, once any page has opened, the loader is not shown again in this window
  sessionStorage.setItem("ms-visited", "true");

  // ───── Smooth scroll (original settings as is)
  mm.add(motion, () => {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.7, infinite: false, gestureOrientation: "vertical", normalizeWheel: false, smoothTouch: false });
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); lenis = window.lenis = null; };
  });

  // ───── Header bar: goes up in .3s on scroll down (first page -170%, the original banner spot), comes back down on scroll up
  const nav = $(".ms-nav");
  if (nav) {
    const up = Number(nav.dataset.hide || -100);
    let last = scrollY, dir = 0;
    addEventListener("scroll", () => {
      const y = scrollY, d = y > last ? 1 : y < last ? -1 : 0;
      last = y;
      if (!d || d === dir || root.classList.contains("ms-menu-open")) return;
      dir = d;
      gsap.to(nav, { yPercent: d > 0 ? up : 0, duration: 0.3, ease: E.outQuad, overwrite: "auto" });
    }, { passive: true });
  }

  // ───── Menu Cover
  const btn = $(".ms-menu-btn");
  const wrap = $(".ms-menuwrap");
  if (btn && wrap) {
    const bg = $(".ms-menuwrap__bg", wrap), img = $(".ms-menuwrap__img", wrap);
    const grids = $$(".ms-menulinks", wrap), texts = $$(".ms-menu-btn__t", btn);
    let open = false, tl;
    const toggle = () => {
      open = !open;
      tl?.kill();
      btn.setAttribute("aria-expanded", String(open));
      if (open) {
        root.classList.add("ms-menu-open");
        lenis?.stop();
        gsap.set(nav, { yPercent: 0 });
        tl = gsap.timeline()
          .set(wrap, { display: "block" })
          .fromTo(bg, { yPercent: -100 }, { yPercent: 0, duration: 0.3, ease: E.outQuad }, 0)
          .to(texts, { yPercent: -100, duration: 0.2, ease: E.outQuad }, 0.2)
          .fromTo(img, { xPercent: -100 }, { xPercent: 0, duration: 0.3, ease: E.outQuad }, 0.2)
          .fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: E.outQuad }, 0.2)
          .fromTo(grids, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: E.outQuad }, 0.3)
          .fromTo(grids, { yPercent: 100 }, { yPercent: 0, duration: 0.3, ease: E.outQuad }, 0.3);
      } else {
        tl = gsap.timeline({ onComplete: () => { gsap.set(wrap, { display: "none" }); root.classList.remove("ms-menu-open"); lenis?.start(); } })
          .to(texts, { yPercent: 0, duration: 0.2, ease: E.outQuad }, 0)
          .to(img, { opacity: 0, duration: 0.5, ease: E.outQuad }, 0.2)
          .to(img, { xPercent: -100, duration: 0.3, ease: E.outQuad }, 0.2)
          .to(grids, { opacity: 0, duration: 0.5, ease: E.outQuad }, 0.3)
          .to(grids, { yPercent: 100, duration: 0.3, ease: E.outQuad }, 0.3)
          .to(bg, { yPercent: -100, duration: 0.2, ease: E.outQuad }, 0.5);
      }
    };
    btn.addEventListener("click", toggle);
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) toggle(); });
  }

  // ───── Dark mode: fill transition is on for only 600ms while the panel flips
  let switching;
  $$(".ms-toggle").forEach((t) => t.addEventListener("click", (e) => {
    e.preventDefault();
    clearTimeout(switching);
    root.classList.add("ms-switching");
    switching = setTimeout(() => root.classList.remove("ms-switching"), 600);
    const dark = root.dataset.theme !== "dark";
    if (dark) root.dataset.theme = "dark"; else delete root.dataset.theme;
    t.setAttribute("aria-pressed", String(dark));
    dark ? localStorage.setItem("ms-dark-mode", "true") : localStorage.removeItem("ms-dark-mode");
  }));

  // ───── Text button: a line of text rolls up to change, the arrow slides out to the right and a new arrow enters, the border fades to .4
  $$(".ms-btn").forEach((b) => {
    const t = $$(".ms-btn__t", b), a = $$(".ms-btn__arrow svg", b);
    gsap.set(a, { x: 0, xPercent: -50 });
    b.addEventListener("mouseenter", () => {
      gsap.to(t, { yPercent: -100, duration: 0.3, ease: E.outQuad, overwrite: "auto" });
      gsap.to(a, { xPercent: 100, duration: 0.3, ease: E.outQuad, overwrite: "auto" });
      gsap.to(b, { "--ms-bd": 0.4, duration: 0.5, ease: "none", overwrite: "auto" });
    });
    b.addEventListener("mouseleave", () => {
      gsap.to(t, { yPercent: 0, duration: 0.3, ease: E.outQuad, overwrite: "auto" });
      gsap.to(a, { xPercent: -50, duration: 0.3, ease: E.outQuad, overwrite: "auto" });
      gsap.to(b, { "--ms-bd": 1, duration: 0.5, ease: "none", overwrite: "auto" });
    });
  });

  // ───── Underline link: underline disappears and circle arrow shifts .2em ─────
  $$(".ms-readmore").forEach((r) => {
    const a = $(".ms-readmore__a", r), c = $("svg", r);
    if (!a) return;
    a.addEventListener("mouseenter", () => {
      gsap.to(a, { "--ms-bd": 0, duration: 0.2, ease: E.outQuad, overwrite: "auto" });
      if (c) gsap.to(c, { x: "0.2em", duration: 0.3, ease: E.outQuad, overwrite: "auto" });
    });
    a.addEventListener("mouseleave", () => {
      gsap.to(a, { "--ms-bd": 1, duration: 0.2, ease: E.outQuad, overwrite: "auto" });
      if (c) gsap.to(c, { x: 0, duration: 0.2, ease: E.outQuad, overwrite: "auto" });
    });
  });

  // ───── Work card: color frame .3s, label rises .2s later / on exit the label goes first, the frame .1s later over .4s
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  $$(".ms-card").forEach((c) => {
    const f = $(".ms-card__frame", c), info = $(".ms-card__info", c);
    if (!f || !finePointer) return;
    const portrait = c.classList.contains("is-portrait");
    // As in Webflow, enter and exit actions stop each other entirely — so a label tween that is still delayed does not turn on after exiting
    const parts = info ? [f, info] : [f];
    c.addEventListener("mouseenter", () => {
      gsap.killTweensOf(parts);
      gsap.to(f, { opacity: 1, duration: 0.3, ease: E.outQuad });
      if (!info) return;
      gsap.to(info, { opacity: 1, duration: 0.5, delay: 0.2, ease: E.outQuad });
      if (!portrait) gsap.to(info, { yPercent: 0, y: 0, duration: 0.3, delay: 0.2, ease: E.outQuad });
    });
    c.addEventListener("mouseleave", () => {
      gsap.killTweensOf(parts);
      gsap.to(f, { opacity: 0, duration: 0.4, delay: 0.1, ease: E.outQuad });
      if (!info) return;
      gsap.to(info, { opacity: 0, duration: 0.5, ease: E.outQuad });
      if (!portrait) gsap.to(info, { yPercent: 200, duration: 0.3, ease: E.outQuad });
    });
    if (info && !portrait) gsap.set(info, { yPercent: 200 });
  });

  // ───── Accordion: height auto .25s (linear), folds in .2s with the cross’s vertical stroke
  $$(".ms-acc__head").forEach((h) => {
    const content = h.nextElementSibling;
    const v = $(".ms-cross i:last-child", h);
    if (!content || !content.classList.contains("ms-acc__content")) return;
    let open = false;
    h.setAttribute("aria-expanded", "false");
    h.addEventListener("click", () => {
      open = !open;
      h.setAttribute("aria-expanded", String(open));
      if (open) {
        gsap.set(content, { display: "block" });
        gsap.fromTo(content, { height: 0 }, { height: "auto", duration: 0.25, ease: "none", overwrite: "auto", onComplete: () => ScrollTrigger.refresh() });
        if (v) gsap.to(v, { scale: 0, duration: 0.2, ease: E.outQuad, overwrite: "auto" });
      } else {
        gsap.to(content, { height: 0, duration: 0.25, ease: "none", overwrite: "auto", onComplete: () => { gsap.set(content, { display: "none" }); ScrollTrigger.refresh(); } });
        if (v) gsap.to(v, { scale: 1, duration: 0.2, ease: E.outQuad, overwrite: "auto" });
      }
    });
  });

  mm.add(motion, () => {
    // Chunk that rises when visible: once 20% of the chunk (25% for list chunks) enters the screen (Webflow in-view offset) it rises from 10em below in .5s, opacity .8s
    $$(".ms-loadin").forEach((el) => {
      const layout = el.dataset.loadin === "layout";
      gsap.timeline({ scrollTrigger: { trigger: el, start: layout ? "25% bottom" : "20% bottom", once: true } })
        .to(el, { y: 0, duration: 0.5, ease: E.outQuad }, 0)
        .to(el, { opacity: 1, duration: layout ? 0.5 : 0.8, ease: E.outQuad }, layout ? 0.1 : 0);
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { gsap.set(".ms-loadin", { opacity: 1, y: 0 }); });

  // While the photo spans the screen, 1.2 → 1 (original only at 992px and above)
  mm.add(`${motion} and (min-width: 992px)`, () => {
    $$(".ms-scale").forEach((el) => {
      gsap.fromTo(el, { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.3 } });
    });
  });

  // The page header photo rises -10% during the first few % of scroll (data-shift-end)
  mm.add(motion, () => {
    $$("[data-shift-end]").forEach((el) => {
      const end = Number(el.dataset.shiftEnd);
      gsap.fromTo(el, { yPercent: 0 }, { yPercent: -10, ease: "none", scrollTrigger: {
        trigger: document.body, start: 0, end: () => (ScrollTrigger.maxScroll(window) * end) / 100, scrub: 0.3 } });
    });
  });

  // ───── Multi-step contact input: next · back · Enter, progress bar 25% per step
  $$(".ms-form").forEach((form) => {
    const steps = $$(".ms-form__step", form), bar = $(".ms-form__bar", form);
    if (!steps.length) return;
    let i = 0;
    const go = (n) => {
      i = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach((s, k) => s.classList.toggle("is-on", k === i));
      if (bar) bar.style.width = `${((i + 1) / steps.length) * 100}%`;
      const head = $(".ms-form__h", form), wrapEl = $(".ms-form__wrap", steps[i]);
      if (head && wrapEl && i > 0) gsap.fromTo(wrapEl, { yPercent: 10, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: E.outCubic });
    };
    form.addEventListener("click", (e) => {
      const n = e.target.closest(".ms-form__next"), b = e.target.closest(".ms-form__back");
      if (n) { e.preventDefault(); go(i + 1); }
      if (b) { e.preventDefault(); go(i - 1); }
    });
    form.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.matches("input")) { e.preventDefault(); go(i + 1); } });
    form.addEventListener("submit", (e) => e.preventDefault());
    go(0);
  });

  // When the contact panel heading is visible it rises from below in 1.3s (custom-formly-animation)
  mm.add(motion, () => {
    $$(".ms-form__h").forEach((h) => {
      const steps = h.closest(".ms-form")?.querySelector(".ms-form__steps");
      gsap.timeline({ scrollTrigger: { trigger: h, start: "top bottom", once: true } })
        .fromTo(h, { yPercent: 110 }, { yPercent: 0, duration: 1.3, ease: E.outQuart }, 0)
        .fromTo(steps, { yPercent: 10, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: E.outCubic }, 0.2);
    });
  });

  // ───── LET'S TALK disc (first page only): fades in over .3s once the first text is visible, the round letters make one turn every 10 seconds, and the disc rotates -30° → 1000° with page scroll
  const cta = $(".ms-cta");
  if (cta) {
    const reveal = $("[data-cta-reveal]");
    const show = () => gsap.to(cta, { opacity: 1, duration: 0.3, ease: E.outQuad });
    if (reveal) ScrollTrigger.create({ trigger: reveal, start: "top bottom", once: true, onEnter: show });
    else show();
    mm.add(motion, () => {
      const ring = $(".ms-cta__ring", cta), bg = $(".ms-cta__bg", cta);
      gsap.to(ring, { rotation: 359, duration: 10, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
      gsap.fromTo(bg, { rotation: -30 }, { rotation: 1000, ease: "none", scrollTrigger: { trigger: document.body, start: 0, end: "max", scrub: 0.3 } });
    });
  }
  // The bottom band on phone disappears in .3s when the contact panel is visible
  const bar = $(".ms-ctabar"), contact = $(".ms-contact");
  if (bar && contact) {
    ScrollTrigger.create({ trigger: contact, start: "top bottom", once: true,
      onEnter: () => gsap.to(bar, { opacity: 0, duration: 0.3, ease: E.outQuad, onComplete: () => gsap.set(bar, { display: "none" }) }) });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();
