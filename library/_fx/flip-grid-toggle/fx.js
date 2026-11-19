// Pressing the list-view button makes the cells slide with Flip from where they are into the new layout (class is-grid) in .6s power2.out — original Studio work list
(() => {
  kfFx.register("flip-grid-toggle", (el, { options, reduce }) => {
    const list = el.querySelector('[data-fx-part="list"]');
    const toggles = [...el.querySelectorAll('[data-fx-part="toggle"]')];
    if (!list || !toggles.length || !window.Flip) return;
    gsap.registerPlugin(Flip);
    const cls = options.class || "is-grid", dur = reduce ? 0 : +(options.dur ?? 0.6), ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const each = reduce ? 0 : +(options.each ?? 0), delay = reduce ? 0 : +(options.delay ?? 0);
    const flip = () => {
      const items = [...list.children];
      const state = Flip.getState([list, ...items]);
      list.classList.toggle(cls);
      toggles.forEach((t) => { t.classList.toggle(cls); t.setAttribute("aria-pressed", String(list.classList.contains(cls))); });
      Flip.from(state, { absolute: items, duration: dur, ease, delay, stagger: each ? { from: "start", each } : 0, onComplete: () => window.ScrollTrigger?.refresh() });
      if (options.top !== "false") scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    };
    toggles.forEach((t) => t.addEventListener("click", flip));
    return () => { toggles.forEach((t) => t.removeEventListener("click", flip)); list.classList.remove(cls); };
  });
})();
