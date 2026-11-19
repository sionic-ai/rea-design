(() => {
  // Original linkHoverAnimation — when the pointer enters, letters tint in turn within .15s to a color over .5s power2.out, then .3s before that ends, within .3s they return in turn to their own color over 1.2s power1.out.
  // Once it starts spinning, don’t trigger it again until it ends. Not triggered on touch screens (no hover).
  kfFx.register("char-tint-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover || !el.textContent.trim() || !window.SplitText) return;
    gsap.registerPlugin(SplitText);
    const split = new SplitText(el, { type: "words,chars", wordsClass: "fx-cth-word" });
    if (!split.chars.length) {
      split.revert();
      return;
    }
    const css = getComputedStyle(el);
    const tint = () => getComputedStyle(el).getPropertyValue("--fx-tint").trim() || getComputedStyle(document.documentElement).getPropertyValue("--kf-accent").trim();
    const base = css.color;
    let playing = false;
    let tl = null;
    const on = () => {
      if (playing) return;
      playing = true;
      tl = gsap.timeline({ onComplete: () => (playing = false) })
        .to(split.chars, { color: tint(), duration: +(options.in ?? 0.5), stagger: { amount: +(options.spread ?? 0.15) }, ease: "power2.out", overwrite: "auto" })
        .to(split.chars, { color: base, duration: +(options.out ?? 1.2), stagger: { amount: +(options["out-spread"] ?? 0.3) }, ease: "power1.out", overwrite: "auto" }, `-=${+(options.overlap ?? 0.3)}`);
    };
    el.addEventListener("mouseenter", on);
    return () => {
      el.removeEventListener("mouseenter", on);
      tl?.kill();
      split.revert();
    };
  });
})();
