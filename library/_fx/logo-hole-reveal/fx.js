// Hero opening: a progress bar fills at the center of a black curtain (folds to the right in .3s), the color logo lights up and a band of light sweeps across once, then
// The logo turns into a black plate with a logo-shaped hole, the screen (video/photo) shows through the hole, and the plate scales 52x over .8s as the screen opens.
// Uses the original openingAnime step delays (300·500·1600·500·300·200ms) as defaults. On a return visit in the same session it opens at once without the curtain
(() => {
  kfFx.register("logo-hole-reveal", (el, { options, reduce }) => {
    const part = (p) => el.querySelector(`[data-fx-part="${p}"]`);
    const cover = part("cover"), logo = part("logo"), hole = part("hole"), frame = part("frame");
    if (!hole) return;
    const key = options.once ? `fx-logo-hole-${options.once}` : "";
    const quick = reduce || (key && sessionStorage.getItem(key) === "1");
    const s = (k, d) => +(options[k] ?? d) * 1000;
    const fire = (name, detail = {}) => el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
    el.style.setProperty("--fx-scale", String(+(options.scale ?? 52)));
    el.style.setProperty("--fx-load", `${+(options.load ?? 1)}s`);
    el.style.setProperty("--fx-zoom", `${+(options.zoom ?? 0.8)}s`);
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    if (quick) {
      el.classList.add("is-done");
      fire("fx:play", { quick: true });
      fire("fx:open", { quick: true });
      fire("fx:done", { quick: true });
      return () => { el.classList.remove("is-done"); };
    }
    // Stages — bars full (load) → bars fold → logo on → curtain lifts · light band → video on · logo off (hole shows through) → panel grows → open
    let t = s("load", 1);
    el.classList.add("is-loading");
    at(t, () => el.classList.add("is-loaded"));
    t += s("bar", 0.5);
    at(t, () => el.classList.add("is-logo"));
    t += s("hold", 1.6);
    at(t, () => el.classList.add("is-sweep"));
    t += s("sweep", 0.5);
    at(t, () => { el.classList.add("is-hole"); fire("fx:play"); });
    t += s("gap", 0.3);
    at(t, () => el.classList.add("is-zoom"));
    t += s("open", 0.2);
    at(t, () => fire("fx:open"));
    at(t + s("zoom", 0.8) - s("open", 0.2), () => {
      el.classList.add("is-done");
      if (key) sessionStorage.setItem(key, "1");
      fire("fx:done");
    });
    return () => {
      timers.forEach(clearTimeout);
      el.classList.remove("is-loading", "is-loaded", "is-logo", "is-sweep", "is-hole", "is-zoom", "is-done");
      ["--fx-scale", "--fx-load", "--fx-zoom"].forEach((v) => el.style.removeProperty(v));
    };
  });
})();
