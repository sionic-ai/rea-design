// A cut face opens on the photo from the bottom edge upward (clip-path polygon), and the dark curtain covering it slips up and out slightly later — exactly the original initClipRevealAnimation
(() => {
  kfFx.register("clip-rise-reveal", (el, { options, scroller }) => {
    const veil = el.querySelector(':scope > [data-fx-part="veil"]');
    const hidden = "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)", shown = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
    const dur = +(options.dur ?? 1), ease = kfFx.ease(options.ease || "power4.inOut", "power4.inOut");
    const delay = +(options.delay ?? 0.35), veilDur = +(options["veil-dur"] ?? dur);
    const mm = gsap.matchMedia();
    gsap.registerPlugin(ScrollTrigger);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(el, { clipPath: hidden });
      const tl = gsap.timeline({ scrollTrigger: { scroller, trigger: el, start: options.start || "top bottom", toggleActions: "play none none reverse", once: true } });
      tl.fromTo(el, { clipPath: hidden }, { clipPath: shown, duration: dur, ease, onComplete: () => el.style.removeProperty("clip-path") });
      if (veil) tl.fromTo(veil, { bottom: "0%" }, { bottom: "100%", duration: veilDur, ease, onComplete: () => veil.classList.add("is-gone") }, "<+=" + delay);
      return () => veil?.classList.remove("is-gone");
    });
    mm.add("(prefers-reduced-motion: reduce)", () => { veil?.classList.add("is-gone"); return () => veil?.classList.remove("is-gone"); });
    return () => mm.revert();
  });
})();
