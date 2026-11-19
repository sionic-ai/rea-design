(() => {
  // The original swaps classes at each moment using CSS transitions (.64s·.8s), so we do the same — timings come from setTimeout, curves and durations from fx.css
  kfFx.register("collage-drop-intro", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const center = el.querySelector('[data-fx-part="center"]');
    if (!items.length && !center) return;
    const start = +(options.start ?? 1), each = +(options.each ?? 0.147), land = +(options.land ?? 0.4);
    const reveal = +(options.reveal ?? 2.5), fade = +(options.fade ?? 1);
    el.style.setProperty("--fx-dur", +(options.dur ?? 0.64) + "s");
    el.style.setProperty("--fx-center-dur", +(options["center-dur"] ?? 0.8) + "s");
    el.style.setProperty("--fx-mark-dur", +(options["mark-dur"] ?? 1) + "s");
    items.forEach((it, i) => it.style.setProperty("z-index", i));
    if (center) center.style.setProperty("z-index", items.length + 1);
    const timers = [];
    const at = (s, fn) => timers.push(setTimeout(fn, s * 1000));
    const send = () => el.dispatchEvent(new CustomEvent("fx:reveal", { bubbles: true }));
    // session: true means from the second time in the same session, the end state is shown at fade seconds without the placing process (original sessionStorage firstVisited)
    const key = "fx-collage-drop-intro:" + location.pathname;
    const seen = options.session === "true" && sessionStorage.getItem(key);
    if (options.session === "true") sessionStorage.setItem(key, "1");
    if (reduce || seen) {
      el.classList.add("is-fx-quiet", "is-fx-spread");
      items.forEach((it) => it.classList.add("is-fx-on"));
      if (reduce) el.classList.add("is-fx-done");
      else { el.style.setProperty("--fx-fade", fade + "s"); requestAnimationFrame(() => el.classList.add("is-fx-done")); }
      at(reduce ? 0 : 0.01, send);
    } else {
      el.classList.add("is-fx-run");
      // Turn on after two frames so the transition runs from the first-drawn transparent form
      requestAnimationFrame(() => requestAnimationFrame(() => { if (!el.classList.contains("is-fx-spread")) el.classList.add("is-fx-mark"); }));
      at(start, () => items.forEach((it, i) => at(each * i, () => it.classList.add("is-fx-on"))));
      at(start + each * items.length + land, () => { el.classList.remove("is-fx-mark"); el.classList.add("is-fx-spread"); });
      at(start + reveal, () => { el.classList.add("is-fx-done"); send(); });
    }
    return () => {
      timers.forEach(clearTimeout);
      el.classList.remove("is-fx-run", "is-fx-mark", "is-fx-spread", "is-fx-done", "is-fx-quiet");
      items.forEach((it) => { it.classList.remove("is-fx-on"); it.style.removeProperty("z-index"); });
      center?.style.removeProperty("z-index");
      ["--fx-dur", "--fx-center-dur", "--fx-mark-dur", "--fx-fade"].forEach((p) => el.style.removeProperty(p));
    };
  });
})();
