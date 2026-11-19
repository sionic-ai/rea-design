// Split the letters so that when the pointer arrives they fade one after another from the front, and return when it leaves — spaces stay between word chunks
(() => {
  kfFx.register("char-dim-hover", (el, { options, reduce, hover }) => {
    if (!el.textContent.trim() || !window.SplitText) return;
    const split = SplitText.create(el, { type: "words,chars", charsClass: "fx-cdh-char" });
    if (reduce) return () => split.revert();
    const dim = +(options.dim ?? 0.4), dur = +(options.dur ?? 1.2), spread = +(options.spread ?? 0.25);
    const ease = kfFx.ease(options.ease || "expo.out", "expo.out");
    // from: if random, it fades in a new random order on every hover (journey) · center · end
    const from = options.from || "start";
    const go = (o) => gsap.to(split.chars, { opacity: o, duration: dur, ease, stagger: { from, amount: spread }, overwrite: true });
    const on = () => go(dim), off = () => go(1);
    if (hover) { el.addEventListener("mouseenter", on); el.addEventListener("mouseleave", off); }
    el.addEventListener("focusin", on);
    el.addEventListener("focusout", off);
    return () => {
      el.removeEventListener("mouseenter", on); el.removeEventListener("mouseleave", off);
      el.removeEventListener("focusin", on); el.removeEventListener("focusout", off);
      gsap.killTweensOf(split.chars);
      split.revert();
    };
  });
})();
