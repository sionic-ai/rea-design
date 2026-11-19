// Photo and person pieces scattered on the cream curtain turn on at their own time (data-delay) and vanish together at out seconds, then
// At shut seconds the curtain folds up (height 100dvh → 0) revealing the Hero — the opening curtain of Brand (STUDIO entrance effect)
(() => {
  kfFx.register("collage-shut-opening", (el, { options, reduce }) => {
    const fire = (n) => el.dispatchEvent(new CustomEvent(n, { bubbles: true }));
    const group = el.querySelector('[data-fx-part="pieces"]');
    const pieces = [...el.querySelectorAll('[data-fx-part="piece"]')];
    if (reduce) {
      el.classList.add("is-fx-off");
      const t = setTimeout(() => { fire("fx:open"); fire("fx:done"); }, 0);
      return () => { clearTimeout(t); el.classList.remove("is-fx-off"); };
    }
    const timers = [], later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const out = +(options.out ?? 2.6), outDur = +(options["out-dur"] ?? 0.8);
    const shut = +(options.shut ?? 3.3), shutDur = +(options["shut-dur"] ?? 0.6);
    const pieceDur = +(options.dur ?? 0.5);
    const outEase = options["out-ease"] || "ease-in-out", shutEase = options["shut-ease"] || "ease";
    el.classList.add("is-fx-ready");
    pieces.forEach((p) => {
      const d = +(p.dataset.delay ?? 0), dur = +(p.dataset.dur ?? pieceDur);
      later(() => { p.style.transition = `opacity ${dur}s ease-out`; p.style.opacity = "1"; }, d * 1000);
    });
    later(() => {
      if (group) { group.style.transition = `opacity ${outDur}s ${outEase}`; group.style.opacity = "0"; }
    }, out * 1000);
    later(() => {
      el.style.transition = `height ${shutDur}s ${shutEase}`;
      el.classList.add("is-fx-shut");
      fire("fx:open");
      later(() => { el.classList.add("is-fx-done"); fire("fx:done"); }, shutDur * 1000);
    }, shut * 1000);
    return () => {
      timers.forEach(clearTimeout);
      el.classList.remove("is-fx-ready", "is-fx-shut", "is-fx-done");
      el.style.transition = "";
      if (group) { group.style.transition = ""; group.style.opacity = ""; }
      pieces.forEach((p) => { p.style.opacity = ""; p.style.transition = ""; });
    };
  });
})();
