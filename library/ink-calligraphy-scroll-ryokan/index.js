// Front page motion — original top.js values as they are.
(() => {
  // Horizontal scroll backdrop·paper flip: when the section overlaps the screen, fade-in, when it passes upward, fade-out-top, when still below, fade-out-bottom
  const watch = (el) => {
    if (!el) return;
    const tick = () => {
      const r = el.getBoundingClientRect();
      if (r.bottom >= 0 && r.top <= innerHeight) { el.classList.add("fade-in"); el.classList.remove("fade-out-top", "fade-out-bottom"); }
      else { el.classList.remove("fade-in"); el.classList.add(r.bottom < 0 ? "fade-out-top" : "fade-out-bottom"); el.classList.remove(r.bottom < 0 ? "fade-out-bottom" : "fade-out-top"); }
    };
    addEventListener("scroll", tick, { passive: true });
    tick();
  };
  watch(document.querySelector(".kh-side-bg"));
  watch(document.querySelector(".kh-inv__trigger"));

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  // Flows horizontally only at 820px and above (per original ScrollTrigger.matchMedia). The video cell goes 0.7→1 as it passes from the right edge of the screen to the center
  mm.add("(min-width: 820px) and (prefers-reduced-motion: no-preference)", () => {
    const wrapper = document.querySelector(".kh-side__contents");
    const panel = gsap.to(wrapper, {
      x: () => -(wrapper.scrollWidth - document.documentElement.clientWidth),
      ease: "none",
      scrollTrigger: {
        trigger: ".kh-side",
        start: "top top",
        end: () => wrapper.scrollWidth - innerWidth,
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    gsap.utils.toArray(".kh-side__mainimg").forEach((el) => {
      gsap.from(el, { scale: 0.7, ease: "none", scrollTrigger: { trigger: el, containerAnimation: panel, start: "left 100%", end: "left 50%", scrub: 1 } });
    });
  });

  // Annex: pin the base cell, scale 0.8→1, bottom clip 10%→0
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(".kh-annex__target", { scale: 0.8, "--clip": "10%" }, {
      scale: 1, "--clip": "0%", duration: 1.5,
      scrollTrigger: { trigger: ".kh-annex__area", start: "top top", end: "bottom bottom", scrub: 1, pin: true },
    });
  });
})();
