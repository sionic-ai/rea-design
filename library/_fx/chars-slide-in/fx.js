(() => {
  // Original registerEffect fadeInLeft — split the text into letters, from x 50rem to the right and transparent, 1.2s power2.out, .06s between letters.
  // The original 1rem is 1/1440 of the window width, so the default distance is set to 3.4722vw, the same ratio — with plain rem it would fly in 800px on a 16px-base page.
  // Wraps words into inline-block chunks so multi-line Korean headings don’t break in the middle of a word.
  kfFx.register("chars-slide-in", (el, { options, reduce, scroller }) => {
    if (reduce || !el.textContent.trim() || !window.SplitText) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const split = new SplitText(el, { type: "words,chars", wordsClass: "fx-csi-word" });
    if (!split.chars.length) {
      split.revert();
      return;
    }
    const x = String(options.x ?? "3.4722vw");
    const xVal = /[a-z%]$/i.test(x.trim()) ? x.trim() : parseFloat(x);
    const tl = gsap.timeline({ paused: true });
    // scale is the Type where text starts small and pops in to full size (brand-no-oto .9 → 1, back.out(1.7)) — if not given, size is left untouched
    const sc = options.scale != null ? { scale: +options.scale } : {};
    tl.fromTo(split.chars, { opacity: 0, x: xVal, ...sc }, {
      opacity: 1, x: 0, ...(options.scale != null ? { scale: 1 } : {}),
      duration: +(options.duration ?? 1.2),
      ease: kfFx.ease(options.ease || "power2.out", "power2.out"),
      stagger: +(options.stagger ?? 0.06),
      delay: +(options.delay ?? 0),
    });
    gsap.set(split.chars, { opacity: 0 });
    const st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top center+=25%", once: true, onEnter: () => tl.play() });
    return () => {
      st.kill();
      tl.kill();
      split.revert();
    };
  });
})();
