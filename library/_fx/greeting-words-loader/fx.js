// Greeting loader — the word group in the middle of the curtain floats up from 50% below (1s expo.inOut) and swaps the greeting every each seconds, then,
// Slides up 75% while blurring, and the whole curtain disappears (.6s power1.inOut). When fully cleared, fx:done.
// If there is no slot to swap (word), the word stays as is and holds for the same time — like the original Brand, which stood only the name with no slot
(() => {
  kfFx.register("greeting-words-loader", (el, { options, reduce }) => {
    const words = el.querySelector('[data-fx-part="words"]');
    const word = el.querySelector('[data-fx-part="word"]');
    const done = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    if (!words || reduce) {
      gsap.set(el, { autoAlpha: 0 });
      done();
      return () => gsap.set(el, { clearProps: "opacity,visibility" });
    }
    const list = (options.words || "").split(",").map((w) => w.trim());
    const steps = options.words ? list.length : +(options.count ?? 9);
    const each = +(options.each ?? 0.15);
    const first = word ? word.textContent : "";
    const tl = gsap.timeline({ onComplete: done });
    tl.set(words, { yPercent: +(options["y-in"] ?? 50) });
    tl.to(words, { opacity: 1, yPercent: 0, duration: +(options.in ?? 1), ease: kfFx.ease(options["in-ease"] || "expo.inOut", "expo.inOut") });
    for (let i = 0; i < steps; i++) tl.call(() => { if (word && options.words) word.textContent = list[i]; }, null, `+=${each}`);
    tl.to(words, { opacity: 0, yPercent: +(options["y-out"] ?? -75), duration: +(options.out ?? 0.8), ease: kfFx.ease(options["out-ease"] || "expo.in", "expo.in") });
    tl.to(el, { autoAlpha: 0, duration: +(options.fade ?? 0.6), ease: kfFx.ease(options["fade-ease"] || "power1.inOut", "power1.inOut") }, `-=${+(options.overlap ?? 0)}`);
    return () => {
      tl.kill();
      if (word) word.textContent = first;
      gsap.set([el, words], { clearProps: "opacity,visibility,transform" });
    };
  });
})();
