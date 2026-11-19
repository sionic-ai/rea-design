// First page: three hero images cross-fade (handwriting 200px/s → hold 2.2s → 1.8s power2.out cross, repeat), letter collage tilts 6·8·10 degrees,
// Circle stage scaleX 1→1.15 · yPercent 0→-10, front photo yPercent -6, and the two salon photos run the same Splide 4.1.4 fade as the original (2.5s change · 6s interval · rewind) interlocked with each other.
(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const slides = gsap.utils.toArray(".t-hero__slide");
    const paths = (s) => [...s.querySelectorAll(".draw-path")].map((p) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      return [p, len];
    });
    let heroTl;
    const startHero = () => {
      gsap.set(slides, { autoAlpha: 0 });
      gsap.set(slides[0], { autoAlpha: 1 });
      heroTl = gsap.timeline({ repeat: -1 });
      slides.forEach((s, i) => {
        const next = slides[(i + 1) % slides.length];
        heroTl.add(() => { gsap.set(s, { autoAlpha: 1 }); paths(s); paths(next); });
        paths(s).forEach(([p, len]) => heroTl.to(p, { strokeDashoffset: 0, duration: len / 200, ease: "none" }));
        heroTl.to({}, { duration: 2.2 });
        heroTl.to(s, { autoAlpha: 0, duration: 1.8, ease: "power2.out" });
        heroTl.to(next, { autoAlpha: 1, duration: 1.8, ease: "power2.out" }, "<");
      });
    };
    document.body.classList.contains("loaded") ? startHero() : document.addEventListener("su:loaded", startHero, { once: true });

    const tilt = gsap.timeline({ scrollTrigger: { trigger: ".t-concept", start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
    tilt.to(".t-letter__paper", { rotate: 6, ease: "none" }, 0)
      .to(".t-letter__img", { rotate: 8, ease: "none" }, 0)
      .to(".t-letter__brand", { rotate: 10, ease: "none" }, 0);

    gsap.utils.toArray(".t-round").forEach((sec) => {
      const bg = sec.querySelector(".t-round__bg");
      gsap.set(bg, { transformOrigin: "50% 0%" });
      gsap.to(bg, { scaleX: 1.15, yPercent: -10, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
    });

    gsap.to(".t-interlude__img", { yPercent: -6, ease: "none", scrollTrigger: { trigger: ".t-interlude", start: "top bottom", end: "bottom top", scrub: true } });

    return () => heroTl?.kill();
  });

  // Salon photo: spins like the original regardless of reduced motion (Splide turns off its own transitions under prefers-reduced-motion)
  const sm = document.querySelector(".t-salon__sm.splide"), lg = document.querySelector(".t-salon__lg.splide");
  if (sm && lg && window.Splide) {
    const opt = { autoplay: true, type: "fade", rewind: true, pagination: false, arrows: false, speed: 2500, interval: 6000 };
    const a = new Splide(sm, opt), b = new Splide(lg, opt);
    a.on("move", (i) => b.go(i));
    b.on("move", (i) => a.go(i));
    a.mount();
    b.mount();
  }
})();
