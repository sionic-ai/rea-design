(() => {
  // Original wf effect-12 — split the letters and cover them with a mask, then they fly in from off left, tilted and stretched, and fold upright.
  // Like the original, no splitting below 800px. Words are inline-block chunks so even Korean titles never break mid-word.
  kfFx.register("stretch-fly-chars", (el, { options, reduce, scroller }) => {
    if (reduce || !el.textContent.trim() || !window.SplitText) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 800px)", () => {
      const masked = options.mask !== "none";
      const split = SplitText.create(el, {
        type: "chars,words",
        wordsClass: "fx-sfc-word",
        charsClass: "fx-sfc-char",
        ...(masked ? { mask: "chars" } : {}),
      });
      if (!split.chars.length) { split.revert(); return; }
      if (masked) split.masks?.forEach((m) => m.classList.add("fx-sfc-char-mask"));
      const from = {
        xPercent: +(options.x ?? -250),
        rotationZ: +(options.rotate ?? 45),
        scaleX: +(options.stretch ?? 6),
        transformOrigin: "100% 50%",
      };
      gsap.set(split.chars, from);
      const tw = gsap.to(split.chars, {
        xPercent: 0, rotationZ: 0, scaleX: 1,
        duration: +(options.dur ?? 0.3),
        ease: kfFx.ease(options.ease || "power2.out", "power2.out"),
        stagger: +(options.each ?? 0.015),
        paused: true,
      });
      const st = ScrollTrigger.create({
        trigger: el, ...(scroller && { scroller }),
        start: options.start || "top bottom-=10%",
        once: true,
        onEnter: () => tw.play(),
      });
      return () => { st.kill(); tw.kill(); split.revert(); };
    });
    return () => mm.revert();
  });
})();
