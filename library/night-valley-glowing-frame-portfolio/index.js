// Hero section — scene state (scroll, loading, logo spin), Hero words, section entrance, work cell depth parallax, rainbow floor, video loop. Things that open on press are in case.js
(() => {
  const OR = window.OR;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const state = { scroll: 0, intro: 0, spin: 0, sceneOn: true, ground: 0, groundShift: 0, groundOn: false, floorOn: false };
  OR.scene = state;

  // Motion of one Work cell — per depth (-.5 ~ .67) it flows ±depth × 14vh while crossing the screen so layers form, the description rises, and the video ring fills one turn every 6s.
  // Cells added by Load more work get the same treatment
  let ringN = 0;
  OR.frameMotion = (fig) => {
    if (reduce) return;
    const box = fig.querySelector(".or-frame__box"), d = +box?.dataset.depth || 0;
    if (box) gsap.fromTo(box, { y: () => d * innerHeight * 0.14 }, { y: () => -d * innerHeight * 0.14, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    const cap = fig.querySelector(".or-caption");
    if (cap) gsap.fromTo(cap, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: fig, start: "top 75%", once: true } });
    fig.querySelectorAll(".or-ring").forEach((r) => gsap.fromTo(r, { "--run": 1 }, { "--run": 0, duration: 6, ease: "none", repeat: -1, delay: (ringN++) * 0.7 }));
  };

  const boot = () => {
    window.ORScene?.start(document.querySelector("[data-scene]"), document.querySelector("[data-ground]"), state, document.querySelector("[data-floor]"));
    OR.bootHead(); OR.bootCursor(); OR.bootSound(); OR.bootPanels(); OR.bootCopy(); OR.bootWave();
    OR.bootCase?.(); OR.bootCredits?.(); OR.bootMore?.();

    // Hero word — split into letters, entering in turn from 60px below and transparent
    const words = [...document.querySelectorAll("[data-hero-words] [data-chars]")];
    const chars = words.flatMap((w) => { const t = w.textContent; w.textContent = ""; return [...t].map((c) => { const s = document.createElement("span"); s.className = "char"; s.textContent = c; w.append(s); return s; }); });
    const late = [document.querySelector(".or-play"), document.querySelector("[data-ind-label]"), document.querySelector("[data-head-bar]"), document.querySelector('[data-slot="sound-pill"]')];
    if (!reduce) { gsap.set(chars, { autoAlpha: 0, y: 60 }); gsap.set(late, { autoAlpha: 0, y: 60 }); }

    OR.preload().then(() => {
      if (reduce) { state.intro = 1; return; }
      gsap.to(state, { intro: 1, duration: 1.1, ease: "power3.out" });
      gsap.to(late, { autoAlpha: 1, y: 0, duration: 1.1, ease: OR.out, stagger: 0.06, delay: 0.15 });
      gsap.to(chars, { autoAlpha: 1, y: 0, duration: 1.1, ease: OR.out, stagger: 0.02, delay: 0.25 });
    });


    // Showreel — on press the curtain lays down at .55 and the panel stands up from .92x at 1.1s jorisOut. Close by pressing the curtain or Esc.
    const reel = document.querySelector("[data-reel]");
    const openReel = () => {
      reel.hidden = false; reel.setAttribute("aria-hidden", "false"); OR.lenis?.stop();
      gsap.fromTo(reel.querySelector(".or-reel__scrim"), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
      gsap.fromTo(reel.querySelector(".or-reel__panel"), { scale: 0.92, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.1, ease: OR.out });
    };
    const closeReel = () => {
      gsap.to(reel.querySelector(".or-reel__panel"), { scale: 0.96, autoAlpha: 0, duration: 0.35, ease: "power2.in" });
      gsap.to(reel.querySelector(".or-reel__scrim"), { opacity: 0, duration: 0.35, ease: "power2.in", onComplete: () => { reel.hidden = true; reel.setAttribute("aria-hidden", "true"); OR.lenis?.start(); } });
    };
    document.querySelector(".or-hero__cta")?.addEventListener("click", openReel);
    reel?.querySelectorAll("[data-reel-close]").forEach((b) => b.addEventListener("click", closeReel));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && reel && !reel.hidden) closeReel(); });

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Scene — during the first two screens the camera lifts to the sky and the logo slides up and out, and when the intro text arrives the scene darkens
      ScrollTrigger.create({ start: 0, end: () => innerHeight * 2.2, onUpdate: (s) => (state.scroll = s.progress * 1.55) });
      gsap.to("[data-veil]", { opacity: 0.62, ease: "none", scrollTrigger: { trigger: ".or-about", start: "top 90%", end: "top 20%", scrub: true } });
      gsap.fromTo(".or-indicator", { opacity: 1 }, { opacity: 0, ease: "none", immediateRender: false, scrollTrigger: { start: 0, end: () => innerHeight * 0.4, scrub: true } });
      gsap.fromTo(".or-hero", { opacity: 1 }, { opacity: 0, ease: "none", immediateRender: false, scrollTrigger: { start: 0, end: () => innerHeight * 0.6, scrub: true } });

      // Section entrance — from 48px below and transparent, 1.1s jorisOut
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.fromTo(el, { autoAlpha: 0, y: 48 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: OR.out, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });

      gsap.utils.toArray(".or-cases .or-frame").forEach(OR.frameMotion);

      // Rainbow floor — when the Work header arrives it turns on as a faint band at the bottom of the screen, and turns off when the grid reaches the upper screen
      ScrollTrigger.create({
        trigger: ".or-case__head", start: "top 85%", endTrigger: ".or-grid", end: "top 35%",
        onToggle: (s) => { state.groundOn = true; gsap.to(".or-ground", { opacity: s.isActive ? 1 : 0, duration: 0.8, ease: "power2.out", onComplete: () => (state.groundOn = s.isActive) }); },
        onUpdate: (s) => { state.ground = 1; state.groundShift = s.progress; },
      });

      // Work section floor lamp — only while the section is on screen does the floor under the cursor light up
      ScrollTrigger.create({ trigger: ".or-cases", start: "top bottom", end: "bottom top", onToggle: (s) => (state.floorOn = s.isActive) });

      // Video loop inside the case panel also uses the same 6s
      gsap.utils.toArray(".or-case-ov .or-ring").forEach((r) => gsap.fromTo(r, { "--run": 1 }, { "--run": 0, duration: 6, ease: "none", repeat: -1, delay: (ringN++) * 0.7 }));
    });
    mm.add("(prefers-reduced-motion: reduce)", () => { state.intro = 1; state.ground = 1; state.groundOn = true; gsap.set(".or-ground", { opacity: 1 }); });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
