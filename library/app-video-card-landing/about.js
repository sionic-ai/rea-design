// About (fit score): hero loader (logo card flip · score count), floating product cards rising · parallax, paper memo 3D unfolding, footer opacity scroll.
// Loader original values (the original’s appear values, tuned from the film): the white logo card flips 180° around the Y axis over 2s (.44,0,.56,1), standing on its edge at 1s,
// Numbers · ticks go 0 → 95 (quad out) for 1.4s starting at .8s — as a motion part option. Surrounding products float up at about 70px/s over time
// Original values: parallax speed 120 (1.2x scroll — 20px more per 100px scrolled), memo uses onInView rotateX ±10 · rotateY ±20 · scale .8 · x ∓60 · y 10 → in place (wrapping plate y 60 → 0)
(() => {
  const { reduce, spring } = window.LV;
  if (reduce) return;
  const SP = spring(400, 30, 1);
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Logo card flip and score counting are done by the flip-reveal-count part (the front logo is placed in the html so it is visible from the first paint) — here only the head and title group are floated up.
    const front = document.querySelector(".fs-flip__front");
    // Original Framer appear values: header y −20 → 0 in .4s (.44,0,.56,1) after .3s, title group rotateY 18°·scale .9·y 10 → in place in 1s (.12,.23,.28,.98) after 1.5s
    // (The original starts about .05s after attaching, so add that much)
    if (window.CustomEase) gsap.registerPlugin(CustomEase);
    const tween = kfFx.ease("0.44,0,0.56,1", "sine.inOut"), soft = kfFx.ease("0.12,0.23,0.28,0.98", "power3.out");
    const head = document.querySelector("header[data-slot=header]");
    if (head && front) gsap.fromTo(head, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.4, ease: tween, delay: 0.35 });
    const intro = [".fs-hero__prods", ".fs-hero__title", ".fs-more"].map((s) => document.querySelector(s)).filter(Boolean);
    if (intro.length) gsap.fromTo(intro, { opacity: 0, rotateY: 18, scale: 0.9, y: 10, transformPerspective: 1200 }, { opacity: 1, rotateY: 0, scale: 1, y: 0, duration: 1, ease: soft, delay: 1.45 });

    // Surrounding products — one loop is plate height + 300px, floating up over time and fading in the 250px at the top and bottom of the plate (using translate, separate from the parallax y)
    const hero = document.querySelector(".fs-hero");
    if (hero) {
      const H = hero.offsetHeight, L = H + 300;
      hero.querySelectorAll(".fs-float").forEach((el) => {
        const top = el.offsetTop, base = +getComputedStyle(el).opacity, d = { y: 0 };
        const place = () => {
          const pos = ((((top + 200 + d.y) % L) + L) % L) - 200;
          el.style.setProperty("--fs-drift", `${pos - top}px`);
          el.style.opacity = base * Math.max(0, Math.min(1, (pos + 100) / 250, (H - 150 - pos) / 250));
        };
        place();
        gsap.to(d, { y: -L, duration: L / 70, ease: "none", repeat: -1, onUpdate: place });
      });
    }

    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const k = (+el.dataset.parallax - 100) / 100;
      gsap.to(el, { y: () => -k * innerHeight * 2, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: () => `+=${innerHeight * 2}`, scrub: true, invalidateOnRefresh: true } });
    });

    document.querySelectorAll("[data-tilt-in]").forEach((el) => {
      const s = +el.dataset.tiltIn;
      gsap.set(el, { transformPerspective: 1200, rotateX: -10 * s, rotateY: -20 * s, scale: 0.8, x: 60 * s, y: 70 });
      ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(el, { rotateX: 0, rotateY: 0, scale: 1, x: 0, y: 0, duration: SP.duration, ease: SP.ease }) });
    });

    const foot = document.querySelector(".lv-foot");
    if (foot) gsap.fromTo(foot, { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: ".lv-faq", start: "top bottom", end: "top top", scrub: 0.2 } });
  });
})();
