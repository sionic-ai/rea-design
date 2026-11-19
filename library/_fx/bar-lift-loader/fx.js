// Vertical bars covering the hero lift away upward each on its own (random order, within .5s overall) with 2s expo.inOut — when all are cleared the curtain hides and fx:done fires
(() => {
  kfFx.register("bar-lift-loader", (el, { options, reduce }) => {
    const bars = [...el.querySelectorAll('[data-fx-part="bar"]')];
    const finish = () => { el.classList.add("is-done"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    if (!bars.length || reduce) { finish(); return () => el.classList.remove("is-done"); }
    // with step, bar i is stretched to viewport height + i×step — even when revealed together over the same length, the longer bar’s bottom end rises later so it is revealed in a staircase shape (original site)
    if (options.step) bars.forEach((b, i) => { b.style.alignSelf = "flex-start"; b.style.height = `calc(100% + ${i} * ${options.step})`; });
    const tw = gsap.to(bars, { yPercent: -(+(options.lift ?? 98)), duration: +(options.dur ?? 2), delay: +(options.delay ?? 0), ease: kfFx.ease(options.ease || "expo.inOut", "expo.inOut"), stagger: { amount: +(options.amount ?? 0.5), from: options.from || "random" }, onComplete: finish });
    return () => { tw.kill(); gsap.set(bars, { clearProps: "transform,height,alignSelf" }); el.classList.remove("is-done"); };
  });
})();
