// The caller handles positioning (centering transform etc.), so don’t overwrite transform and only touch the independent scale property
(() => {
  kfFx.register("swell-ball-cover", (el, { options, reduce, scroller }) => {
    const ball = el.querySelector('[data-fx-part="ball"]');
    if (!ball) return;
    const over = el.querySelector('[data-fx-part="over"]');
    const rate = +(options.rate ?? 0.0045), max = +(options.max ?? 40) || 40, fade = +(options.fade ?? 0.0015);
    // from: enter — counts from when the panel’s top edge reaches the screen bottom + lead px (original phone panel). The default is from the top of the document
    const fromEnter = options.from === "enter", lead = +(options.lead ?? 200);
    const box = scroller || window;
    const at = () => (scroller ? scroller.scrollTop : scrollY);
    const view = () => (scroller ? scroller.clientHeight : innerHeight);
    const top = () => el.getBoundingClientRect().top + at() - (scroller ? scroller.getBoundingClientRect().top : 0);
    const apply = () => {
      const d = fromEnter ? at() - (top() + lead - view()) : at();
      const s = d > 0 ? Math.min(1 + d * rate, max) : 1;
      for (const n of [ball, over]) if (n) n.style.scale = String(s);
      if (over) over.style.opacity = String(d > 0 ? Math.max(0, 1 - d * fade) : 1);
      el.classList.toggle("is-rest", d < 1);
    };
    if (reduce) { el.classList.add("is-rest"); return () => el.classList.remove("is-rest"); }
    box.addEventListener("scroll", apply, { passive: true });
    addEventListener("resize", apply);
    apply();
    return () => {
      box.removeEventListener("scroll", apply);
      removeEventListener("resize", apply);
      for (const n of [ball, over]) if (n) n.style.removeProperty("scale");
      if (over) over.style.removeProperty("opacity");
      el.classList.remove("is-rest");
    };
  });
})();
