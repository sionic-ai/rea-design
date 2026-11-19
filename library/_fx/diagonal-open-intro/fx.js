// On open the panel appears from .2 scale as diagonal masks at two corners (top left · bottom right) open halfway each (.5s power1.inOut), and grows to full size in .5s (power2.inOut).
// At 1s the cover lifts and is-in is added to continue the inner entrance (CSS transition), and the after child comes down from 30% above over 1s at 2.3s (power2.out)
(() => {
  kfFx.register("diagonal-open-intro", (el, { options, reduce }) => {
    const scale = +(options.scale ?? 0.2), open = +(options.open ?? 0.5), grow = +(options.grow ?? 0.5), after = +(options.after ?? 2.3);
    const later = [...el.querySelectorAll('[data-fx-part="after"]')];
    const done = () => { el.classList.add("is-in"); el.dispatchEvent(new CustomEvent("fx:intro", { bubbles: true })); };
    if (reduce) { done(); return () => el.classList.remove("is-in"); }
    const closed = "linear-gradient(135deg, black 0%, transparent 0%), linear-gradient(315deg, black 0%, transparent 0%)"; /* Not skin: masking plate */
    const half = "linear-gradient(135deg, black 50%, transparent 50%), linear-gradient(315deg, black 50%, transparent 50%)"; /* Not skin: masking plate */
    const tl = gsap.timeline()
      .set(el, { autoAlpha: 1, scale, maskImage: closed, webkitMaskImage: closed })
      .addLabel("start")
      .to(el, { duration: open, maskImage: half, webkitMaskImage: half, ease: "power1.inOut" }, "start")
      .to(el, { scale: 1, duration: grow, ease: "power2.inOut" }, `start+=${open}`)
      .set(el, { maskImage: "none", webkitMaskImage: "none", onComplete: done }, `start+=${open + grow}`);
    if (later.length) tl.fromTo(later, { yPercent: -30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1, ease: "power2.out" }, `start+=${after}`);
    return () => { tl.kill(); gsap.set([el, ...later], { clearProps: "all" }); el.classList.remove("is-in"); };
  });
})();
