(() => {
  kfFx.register("scatter-gather-in", (el, { options, reduce, scroller }) => {
    if (reduce) { el.classList.add("is-in"); return () => el.classList.remove("is-in"); }
    if (!el.querySelector('[data-fx-part="item"]')) return;
    const at = +(options.at ?? 0);
    if (options.dur != null) el.style.setProperty("--fx-dur", +options.dur + "s");
    if (options.ease) el.style.setProperty("--fx-ease", options.ease.includes(",") ? `cubic-bezier(${options.ease})` : options.ease);
    const box = scroller || window;
    // The original gathers only when the section’s top edge touches the screen’s top edge (+at px), so photos fly in only after the section fully enters the screen.
    const check = () => {
      const r = el.getBoundingClientRect(), top = scroller ? scroller.getBoundingClientRect().top : 0;
      if (r.top - top <= at && r.bottom - top > 0) { el.classList.add("is-in"); off(); }
    };
    const off = () => { box.removeEventListener("scroll", check); removeEventListener("resize", check); };
    box.addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    check();
    return () => { off(); el.classList.remove("is-in"); el.style.removeProperty("--fx-dur"); el.style.removeProperty("--fx-ease"); };
  });
})();
