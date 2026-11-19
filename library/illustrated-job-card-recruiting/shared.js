// Motion used by both types: Lenis (duration 1.1, lerp .12), the page fading in over .2s, an entrance rising 30px from below (.8s power2.out, at the 70% point),
// Section English title letters rising with elasticity. Page scenes use window.ddSite.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const site = (window.ddSite = { lenis: null, reduced: false });
  const mm = gsap.matchMedia();

  mm.add({ reduce: "(prefers-reduced-motion: reduce)", ok: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    site.reduced = ctx.conditions.reduce;
    if (site.reduced) {
      gsap.set("[data-reveal], .site-fade", { autoAlpha: 1, y: 0 });
      return;
    }
    // Magazine articles use native scroll without Lenis in the original — <html data-scroll="native"> Surface not attached
    const lenis = document.documentElement.dataset.scroll === "native" || !window.Lenis ? null : new Lenis({ duration: 1.1, lerp: 0.12 });
    site.lenis = lenis;
    const raf = (t) => lenis.raf(t * 1000);
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    gsap.to(".site-fade", { autoAlpha: 1, duration: 0.2, ease: "sine.out" });

    gsap.set("[data-reveal]", { autoAlpha: 0, y: 30 });
    ScrollTrigger.batch("[data-reveal]", {
      start: "0% 70%",
      once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }),
    });

    document.querySelectorAll("[data-js=title-anim]").forEach((el) => {
      const letters = el.querySelectorAll("[data-split] > span");
      const jp = el.querySelector("[data-js=title-jp]");
      gsap.timeline({ scrollTrigger: { trigger: el, start: "0% 70%", once: true } })
        .fromTo(letters, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "elastic.out(1,0.9)", stagger: 0.035 })
        .fromTo(jp, { yPercent: 105, skewY: 2 }, { yPercent: 0, skewY: 0, duration: 0.5, ease: "power2.out" }, "<+.4");
    });
    return () => {
      if (!lenis) return;
      gsap.ticker.remove(raf);
      lenis.destroy();
      site.lenis = null;
    };
  });
})();
