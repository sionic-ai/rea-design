(() => {
  // Section height = Number of panels × per + one screen. While the stage is stuck to the screen, is-fx-active is added to the panel in the slot given by dividing progress by the number of panels (floor(progress × count)).
  // The changing look is a state rule in fx.css — the front plates are stacked on top, so when the current plate leaves its photo folds upward and reveals the next plate spread out beneath.
  kfFx.register("split-step-panels", (el, { options, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!stage || !items.length) return;
    const per = +(options.per || 112.5);
    el.style.height = `calc(${items.length} * ${per}svh + 100svh)`;
    items.forEach((it, i) => (it.style.zIndex = items.length - i));
    let cur = -1;
    const show = (i) => {
      if (i === cur) return;
      cur = i;
      items.forEach((it, k) => it.classList.toggle("is-fx-active", k === i));
    };
    const src = scroller || window;
    const update = () => {
      const r = el.getBoundingClientRect();
      const top = scroller ? r.top - scroller.getBoundingClientRect().top : r.top;
      const view = scroller ? scroller.clientHeight : innerHeight;
      const range = r.height - view;
      const p = range > 0 ? -top / range : 0;
      show(p < 0 ? 0 : p > 1 ? items.length - 1 : Math.min(items.length - 1, Math.floor(p * items.length)));
    };
    src.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
    return () => {
      src.removeEventListener("scroll", update);
      removeEventListener("resize", update);
      el.style.removeProperty("height");
      items.forEach((it) => { it.classList.remove("is-fx-active"); it.style.removeProperty("z-index"); });
    };
  });
})();
