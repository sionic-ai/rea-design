// First page motion: hero opening between names (6.6s on load), director background name flow, photo-piece 3D tunnel (pinned + scrub).
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // ── Hero ──
  // 0s the two text halves rise from 110% below over 1.8s (.025s stagger) → 1.5s the center box opens to 1em and the photo fills in, the two halves spread ±.05em
  // → at 2.6s the box grows to the screen (minus margin) over 3s while both text halves vanish in .4s → at 4.8s the white big title words tilt -12° and rise from 125% below in 1.8s (.095s stagger)
  const hero = document.querySelector(".hero-cinema");
  if (hero) {
    const intro = hero.querySelector(".hero-cinema__intro");
    const box = hero.querySelector(".hero-cinema__box");
    const grow = hero.querySelector(".hero-cinema__growing-image");
    const title = hero.querySelector(".hero-cinema__title");
    const start = hero.querySelector(".hero-cinema__intro-start");
    const end = hero.querySelector(".hero-cinema__intro-end");
    const gutter = () => parseFloat(getComputedStyle(hero).getPropertyValue("--hero-gutter")) || 0;
    const fullW = () => hero.clientWidth - 2 * gutter();
    const fullH = () => hero.clientHeight - 2 * gutter();
    let opened = false;
    const settle = () => {
      opened = true;
      gsap.set(intro, { autoAlpha: 1 });
      gsap.set(box, { width: fullW(), height: fullH() });
      gsap.set(grow, { width: "100%" });
      gsap.set([start, end], { autoAlpha: 0 });
      gsap.set(title, { autoAlpha: 1 });
    };
    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      if (ctx.conditions.reduce) { settle(); return; }
      let raf = 0;
      let split = null;
      const run = () => ctx.add(() => {
        const letters = gsap.utils.toArray(".hero-cinema__letter", intro);
        split = SplitText.create(title, { type: "lines,words", linesClass: "hero-cinema__line", wordsClass: "hero-cinema__word", mask: "lines" });
        gsap.set(letters, { yPercent: 110 });
        gsap.set(split.words, { yPercent: 125, rotationX: -12, transformPerspective: 800, transformOrigin: "50% 100%" });
        gsap.set(intro, { autoAlpha: 1 });
        gsap.set(title, { autoAlpha: 1 });
        const tl = gsap.timeline({ defaults: { ease: "expo.inOut" } });
        tl.addLabel("intro", 0)
          .to(letters, { yPercent: 0, duration: 1.8, stagger: 0.025 }, "intro")
          .addLabel("open", 1.5)
          .to(box, { width: "1em", duration: 1.45, ease: "expo.inOut" }, "open")
          .to(grow, { width: "100%", duration: 1.45, ease: "expo.inOut" }, "open")
          .to(start, { x: "-0.05em", duration: 1.6 }, "open")
          .to(end, { x: "0.05em", duration: 1.6 }, "open")
          .addLabel("expand", 2.6)
          .to(box, { width: fullW, height: fullH, duration: 3, onComplete: () => { opened = true; } }, "expand")
          .to([start, end], { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, "expand+=0.05")
          .addLabel("finalTitle", 4.8)
          .to(split.words, { yPercent: 0, rotationX: 0, duration: 1.8, stagger: 0.095, ease: "expo.out" }, "finalTitle");
      });
      // Original starts on the frame after the first photo has fully loaded — the copy starts on the frame after the fonts have fully loaded instead of the photo
      document.fonts.ready.then(() => { raf = requestAnimationFrame(run); });
      return () => { cancelAnimationFrame(raf); split?.revert(); };
    });
    // If the window resizes after the end, refit the box to the screen size
    addEventListener("resize", () => { if (opened) gsap.set(box, { width: fullW(), height: fullH() }); });
  }

  // ── Director About: a huge pale name moves 320px left while the section passes through the screen (wide screens only) ──
  const doctor = document.querySelector(".doctor-manifesto");
  const bgName = doctor?.querySelector(".doctor-background-name");
  if (bgName) {
    gsap.matchMedia().add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.to(bgName, { x: -320, ease: "none", scrollTrigger: { trigger: doctor, start: "top bottom", end: "bottom top", scrub: 1 } });
    });
  }

  // ── Phone offer panel: while the photo passes the panel 1.24→1.08x, -6%→6% (scrub 1.4) ──
  const cta = document.querySelector(".mobile-cta");
  const ctaImg = cta?.querySelector(".mobile-cta__image");
  if (ctaImg) {
    gsap.matchMedia().add("(max-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(ctaImg, { scale: 1.24, yPercent: -6, transformOrigin: "center center" }, { scale: 1.08, yPercent: 6, ease: "none", force3D: true, scrollTrigger: { trigger: cta, start: "top bottom", end: "bottom top", scrub: 1.4, invalidateOnRefresh: true } });
    });
  }

  // ── Treatment process: 3D tunnel of photo fragments ──
  // When the section (380vh) hits the top of the screen it pins the panel (100svh) (no pinSpacing), and each photo flies in from depth -perspective×depth to +perspective×(per-layer .64·.79·.92).
  // Length = /  5.4 / speed (.75~1.35), over the first .24x opacity per layer (.24·.48·.78)→1, vanishes at .8 of the length. Inside the photo 1.075→1.
  // Sentences run on their own scrub 1 timeline — rest, then fade out over 1.25s, and the next sentence enters at 1.026x over 1.75s (.38s overlap).
  const story = document.querySelector(".diagnosis-story");
  const pin = story?.querySelector(".story-pin");
  if (story && pin) {
    const DEPTH = { 1: 0.38, 2: 0.21, 3: 0.06 };
    const NEAR = { 1: 0.64, 2: 0.79, 3: 0.92 };
    const ALPHA = { 1: 0.24, 2: 0.48, 3: 0.78 };
    const persp = () => Math.max(1.08 * innerHeight, 900);
    const layerOf = (el) => { const n = Number(el.dataset.layer); return n === 2 || n === 3 ? n : 1; };
    const depthOf = (el, layer) => (el.dataset.depth !== undefined ? Number(el.dataset.depth) : DEPTH[layer]);
    const media = gsap.utils.toArray(".story-media", story);
    const slides = gsap.utils.toArray(".story-slide", story);

    gsap.matchMedia().add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      if (ctx.conditions.reduce) {
        gsap.set(media, { xPercent: -50, yPercent: -50, autoAlpha: (i, el) => ALPHA[layerOf(el)] });
        return;
      }
      gsap.set(pin, { perspective: persp(), perspectiveOrigin: "50% 50%" });
      if (slides.length) {
        gsap.set(slides, { autoAlpha: 0, scale: 0.96, filter: "blur(10px)", transformOrigin: "50% 50%" });
        gsap.set(slides[0], { autoAlpha: 1, scale: 1, filter: "blur(0px)" });
      }
      media.forEach((el) => {
        const layer = layerOf(el);
        gsap.set(el, { xPercent: -50, yPercent: -50, x: 0, y: 0, z: -persp() * depthOf(el, layer), rotation: 0, rotationX: 0, rotationY: 0, autoAlpha: ALPHA[layer], transformOrigin: "50% 50%" });
      });
      const inner = media.map((el) => el.querySelector(".wf-img")).filter(Boolean);
      gsap.set(inner, { scale: 1.075, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: story, start: "top top", end: "bottom bottom", pin, pinSpacing: false, scrub: 1.05, invalidateOnRefresh: true,
          onRefreshInit: () => gsap.set(pin, { perspective: persp() }),
        },
      });
      media.forEach((el) => {
        const layer = layerOf(el);
        const depth = depthOf(el, layer);
        const dur = 5.4 / gsap.utils.clamp(0.75, 1.35, Number(el.dataset.speed) || 1);
        const img = el.querySelector(".wf-img");
        tl.fromTo(el, { z: () => -persp() * depth }, { z: () => persp() * NEAR[layer], duration: dur, immediateRender: true }, 0);
        tl.fromTo(el, { autoAlpha: ALPHA[layer] }, { autoAlpha: 1, duration: Math.min(1.1, 0.24 * dur), immediateRender: false }, 0);
        if (img) tl.fromTo(img, { scale: 1.075 }, { scale: 1, duration: dur, immediateRender: false }, 0);
        tl.to(el, { autoAlpha: 0, duration: Math.max(0.32, 0.18 * dur) }, 0.8 * dur);
      });
      tl.to({}, { duration: 0.8 });

      if (slides.length > 1) {
        const st = gsap.timeline({ scrollTrigger: { trigger: story, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true } });
        for (let i = 0; i < slides.length - 1; i++) {
          st.to({}, { duration: i === 0 ? 0.55 : 0.82 });
          st.to(slides[i], { autoAlpha: 0, scale: 1, filter: "blur(0px)", duration: 1.25, ease: "power2.inOut" });
          st.fromTo(slides[i + 1], { autoAlpha: 0, scale: 1.026, filter: "blur(0px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 1.75, ease: "power2.out", immediateRender: false }, "-=0.38");
        }
        st.to({}, { duration: 0 });
      }
    });
  }
})();
