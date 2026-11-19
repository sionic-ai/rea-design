(() => {
  // Measure where the dark text (back) sits, place the bright text (front) at the same horizontal position and width, then align both to the screen’s vertical center (+offset).
  kfFx.register("mark-handoff", (el, { options }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    const front = el.querySelector('[data-fx-part="front"]');
    const back = el.querySelector('[data-fx-part="back"]');
    if (!stage || !front || !back) return;
    const offset = +(options.offset ?? 0);
    if (options.hold != null) el.style.setProperty("--fx-hold", `${+options.hold}vh`);
    const place = () => {
      const r = back.getBoundingClientRect();
      el.style.setProperty("--fx-top", `${Math.round((innerHeight - r.height) / 2 + offset)}px`);
      front.style.left = `${r.left}px`;
      front.style.width = `${r.width}px`;
    };
    const ro = new ResizeObserver(place);
    ro.observe(back);
    addEventListener("resize", place);
    place();
    return () => {
      ro.disconnect();
      removeEventListener("resize", place);
      el.style.removeProperty("--fx-top");
      el.style.removeProperty("--fx-hold");
      front.style.left = "";
      front.style.width = "";
    };
  });
})();
