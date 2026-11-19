(() => {
  kfFx.register("skew-drop-in", (el, { options, reduce, scroller }) => {
    if (reduce) { el.classList.add("is-in"); return () => el.classList.remove("is-in"); }
    const offset = +(options.offset ?? 200);
    if (options.dur != null) el.style.setProperty("--fx-dur", +options.dur + "s");
    if (options.skew != null) el.style.setProperty("--fx-skew", +options.skew + "deg");
    if (options.ease) el.style.setProperty("--fx-ease", options.ease.includes(",") ? `cubic-bezier(${options.ease})` : options.ease);
    if (options.y != null) el.style.setProperty("--fx-y", /[a-z%]$/i.test(options.y) ? options.y : +options.y + "px");
    if (options.origin) el.style.setProperty("--fx-origin", options.origin);
    if (options.fade != null && options.fade !== "0" && options.fade !== "false") el.style.setProperty("--fx-o0", "0");
    const box = scroller || window;
    const view = () => (scroller ? scroller.getBoundingClientRect() : { top: 0, height: innerHeight });
    // Like the original, measure with the box in its current tilted-up shape — the right end is higher by the tilt, so it triggers earlier than at rest
    const check = () => {
      const r = el.getBoundingClientRect(), v = view();
      if (r.top - v.top < v.height - offset && r.bottom - v.top > 0) { el.classList.add("is-in"); off(); }
    };
    const off = () => { box.removeEventListener("scroll", check); removeEventListener("resize", check); };
    box.addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    check();
    return () => { off(); el.classList.remove("is-in"); ["--fx-dur", "--fx-skew", "--fx-ease", "--fx-y", "--fx-origin", "--fx-o0"].forEach((p) => el.style.removeProperty(p)); };
  });
})();
