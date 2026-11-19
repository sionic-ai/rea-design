// Shared across pages — carries over the motion of the original React components as is.
// Loading cover (lifts in 1s once the images have all arrived · scroll locked meanwhile) · parallax props (speed multiplier e: yPercent 50e → −50e, scrub 1) · is-inview when visible (-30% margin).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ limitCallbacks: true });
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const lock = () => { document.body.style.overflow = "hidden"; document.body.style.touchAction = "none"; };
  const unlock = () => { document.body.style.overflow = ""; document.body.style.touchAction = ""; };

  // The original preloads the first image then lifts the curtain — the copy’s images are placeholders, so it lifts as soon as the document arrives
  const whenLoaded = (fn) => {
    const go = () => requestAnimationFrame(fn);
    document.readyState === "complete" ? go() : addEventListener("load", go, { once: true });
  };
  const loaded = (cb) => {
    lock();
    whenLoaded(() => {
      document.querySelector(".mr-loading")?.classList.add("is-loaded");
      unlock();
      cb?.();
      ScrollTrigger.refresh();
    });
  };

  const parallax = () => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      $$(".mr-px[data-speed]").forEach((el) => {
        const e = Number(el.dataset.speed);
        if (!e || getComputedStyle(el).display === "none") return;
        gsap.fromTo(el, { yPercent: 50 * e }, { yPercent: -50 * e, ease: "none", scrollTrigger: { trigger: el, start: `${-50 * e}% bottom`, end: `${100 - 50 * e}% top`, scrub: 1, invalidateOnRefresh: true } });
      });
    });
  };

  const inview = () => {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-inview"); io.unobserve(en.target); } }), { rootMargin: "-30% 0px", threshold: 0 });
    $$("[data-inview]").forEach((el) => (reduce ? el.classList.add("is-inview") : io.observe(el)));
  };

  window.MR = { reduce, loaded, parallax, inview, lock, unlock };
})();
