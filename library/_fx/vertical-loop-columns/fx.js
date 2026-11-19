// Each column gets one more copy of its contents, stacking two sets vertically — each set rises by its own height so it loops seamlessly (motion is in fx.css)
(() => {
  kfFx.register("vertical-loop-columns", (el, { options, reduce }) => {
    const cols = [...el.querySelectorAll('[data-fx-part="col"]')];
    if (!cols.length) return;
    const set = [];
    const put = (k, v) => { el.style.setProperty(k, v); set.push(k); };
    if (options.dur != null) put("--fx-dur", +options.dur + "s");
    if (options.delay != null) put("--fx-delay", +options.delay + "s");
    // reverse: odd — reverses odd columns (default is even columns), none — all go the same direction
    if (options.reverse) el.classList.add(`fx-vlc-rev-${options.reverse}`);
    const clones = [];
    cols.forEach((col) => {
      [...col.children].forEach((c) => {
        const d = c.cloneNode(true);
        d.setAttribute("aria-hidden", "true");
        d.classList.add("fx-vlc-copy");
        col.append(d);
        clones.push(d);
      });
    });
    if (reduce) el.classList.add("fx-vlc-still");
    return () => {
      clones.forEach((d) => d.remove());
      set.forEach((k) => el.style.removeProperty(k));
      el.classList.remove("fx-vlc-still", `fx-vlc-rev-${options.reverse}`);
    };
  });
})();
