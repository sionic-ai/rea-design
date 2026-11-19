(() => {
  // Original LoadingFadeOut — the verse settles right on attach (1s, blur 1.3s), then after the hold the verse blurs out and the curtain lifts after delay over fade seconds
  kfFx.register("frost-veil-loader", (el, { options, reduce }) => {
    if (reduce) { el.style.display = "none"; return; }
    const hold = +(options.hold ?? 3), fade = +(options.fade ?? 2), delay = +(options.delay ?? 0.5);
    const plain = options.look === "plain";
    el.classList.add("is-fx-in");
    const t = setTimeout(() => {
      el.classList.add("is-fx-out");
      el.style.transition = `opacity ${fade}s ${delay}s`;
      el.style.opacity = 0;
      el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
    }, (plain ? 0 : hold) * 1000);
    const done = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    el.addEventListener("transitionend", done);
    return () => { clearTimeout(t); el.removeEventListener("transitionend", done); el.classList.remove("is-fx-in", "is-fx-out"); el.style.transition = el.style.opacity = ""; };
  });
})();
