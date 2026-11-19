// Among variants stacked in the same spot, pick one at random excluding only the previous one, crossfade it with the visible one in .3s, then play it from the start.
// How to play: if the variant has an fxPlay function use it (for Lottie, goToAndStop(0)+play), otherwise restart the CSS motion inside from the beginning. It also sends fx:play.
(() => {
  kfFx.register("variant-swap-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const main = el.querySelector("[data-fx-part=main]");
    const fade = +(options.fade ?? 0.3);
    let active = null;
    const play = (v) => {
      if (typeof v.fxPlay === "function") v.fxPlay();
      else v.getAnimations({ subtree: true }).forEach((a) => { a.cancel(); a.play(); });
      v.dispatchEvent(new CustomEvent("fx:play", { bubbles: true }));
    };
    const enter = () => {
      const all = [...el.querySelectorAll("[data-fx-part=variant]")];
      const pool = all.filter((v) => v !== active);
      if (!pool.length) return;
      const next = pool[Math.floor(Math.random() * pool.length)];
      const out = active || main;
      if (out) gsap.to(out, { opacity: 0, duration: fade });
      active = next;
      gsap.to(next, { opacity: 1, duration: fade, onComplete: () => play(next) });
    };
    el.addEventListener("mouseenter", enter);
    return () => {
      el.removeEventListener("mouseenter", enter);
      const parts = el.querySelectorAll("[data-fx-part=variant]");
      if (parts.length) gsap.set(parts, { clearProps: "opacity" });
      if (main) gsap.set(main, { clearProps: "opacity" });
    };
  });
})();
