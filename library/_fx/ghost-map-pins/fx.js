// When entering a section the blurred map (ghost) sticks to the screen in place and follows, and when the top edge of the real map (map) reaches the stuck ghost map spot
// Clears the blurred map and the pins of the real map drop from above, each with its own delay. Going back, the pins lift with the same delays and the blurred map reattaches.
// The stuck spot uses its own place in the section (offsetTop) from the screen top — it sticks seamlessly the moment the section’s top edge passes the screen top
(() => {
  kfFx.register("ghost-map-pins", (el, { options, reduce, scroller }) => {
    const map = el.querySelector('[data-fx-part="map"]');
    if (!map) return;
    const ghost = el.querySelector('[data-fx-part="ghost"]');
    const pins = [...map.querySelectorAll('[data-fx-part="pin"]')];
    const delays = String(options.delays ?? "20 50 15 120 25 90 35 400 450").trim().split(/[\s,]+/).map(Number).filter((n) => !Number.isNaN(n));
    pins.forEach((p, i) => p.style.setProperty("--fx-delay", `${delays.length ? delays[i % delays.length] : 0}ms`));
    const set = (k, v) => v != null && el.style.setProperty(k, v);
    set("--fx-ghost", options.ghost != null ? String(+options.ghost) : null);
    set("--fx-lift", options.lift ?? null);
    set("--fx-dur", options.dur != null ? `${+options.dur}s` : null);
    if (options.ease) set("--fx-ease", `cubic-bezier(${options.ease})`);
    if (options["ease-out"]) set("--fx-ease-out", `cubic-bezier(${options["ease-out"]})`);
    if (reduce) { map.classList.add("is-on"); return () => map.classList.remove("is-on"); }
    const view = scroller || window;
    const box = () => (scroller ? scroller.getBoundingClientRect().top : 0);
    let gTop = 0;
    const measure = () => {
      if (!ghost) return;
      const was = ghost.classList.contains("is-fixed");
      ghost.classList.remove("is-fixed");
      gTop = ghost.offsetTop;
      ghost.style.setProperty("--fx-top", `${gTop}px`);
      ghost.classList.toggle("is-fixed", was);
    };
    const update = () => {
      const lead = el.getBoundingClientRect().top - box();
      const fixed = lead < 0;
      ghost?.classList.toggle("is-fixed", fixed);
      // If there is no blurred map, turn on when the real map touches the height measured from the section top edge (default: screen top edge)
      const line = ghost && fixed ? ghost.getBoundingClientRect().top - box() : ghost ? gTop : 0;
      const on = fixed && map.getBoundingClientRect().top - box() <= line;
      ghost?.classList.toggle("is-hidden", on);
      map.classList.toggle("is-on", on);
    };
    const ro = new ResizeObserver(() => { measure(); update(); });
    ro.observe(el);
    view.addEventListener("scroll", update, { passive: true });
    measure();
    update();
    return () => {
      ro.disconnect();
      view.removeEventListener("scroll", update);
      ghost?.classList.remove("is-fixed", "is-hidden");
      ghost?.style.removeProperty("--fx-top");
      map.classList.remove("is-on");
      pins.forEach((p) => p.style.removeProperty("--fx-delay"));
      ["--fx-ghost", "--fx-lift", "--fx-dur", "--fx-ease", "--fx-ease-out"].forEach((k) => el.style.removeProperty(k));
    };
  });
})();
