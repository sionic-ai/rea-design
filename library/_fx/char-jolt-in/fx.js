// Each letter hides offset randomly in one of six directions (−60~28px), and when a letter reaches the line at screen center+200px
// Snaps into place in steps(6) over .7s and jitters ±10° in cuts for 1s — like cut-and-paste letters
(() => {
  const SPOTS = [[-60, -32], [-30, 32], [28, 12], [-30, 12], [12, -20], [10, -28]];
  kfFx.register("char-jolt-in", (el, { options, reduce, scroller }) => {
    if (!window.SplitText || !el.textContent.trim()) return;
    const split = SplitText.create(el, { type: "words,chars", wordsClass: "fx-cj-w", charsClass: "fx-cj-c" });
    if (reduce || !window.ScrollTrigger) return () => split.revert();
    gsap.registerPlugin(ScrollTrigger);
    const scale = +(options.spread ?? 1), dur = +(options.dur ?? 0.7), steps = +options.steps || 6;
    const start = options.start || "center center+=200";
    const tweens = split.chars.map((c) => {
      const [x, y] = SPOTS[Math.floor(Math.random() * SPOTS.length)];
      return gsap.fromTo(c, { autoAlpha: 0, x: x * scale, y: y * scale }, {
        autoAlpha: 1, x: 0, y: 0, duration: dur, ease: `steps(${steps})`,
        onStart: () => c.classList.add("is-jolt"),
        scrollTrigger: { trigger: c, scroller, start, once: true },
      });
    });
    return () => { tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); }); split.revert(); };
  });
})();
