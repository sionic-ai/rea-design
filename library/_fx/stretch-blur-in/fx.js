// Add the class when the panel (paper panel) enters the screen="is-in" Attach it and apply a css transition — the panel stretches from the right, blurred, then clears up,
// The edge strip grows 1 second late, and the text chunks inside enter one after another .2 seconds apart after that. If there is no board child, the element itself is the board
(() => {
  kfFx.register("stretch-blur-in", (el, { options, reduce, scroller }) => {
    const self = !el.querySelector(':scope > [data-fx-part="panel"]');
    el.classList.toggle("fx-sb-self", self);
    [...el.querySelectorAll('[data-fx-part="item"]')].forEach((n, k) => n.style.setProperty("--fx-k", k));
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.band != null) el.style.setProperty("--fx-band", `${+options.band}s`);
    if (options.each != null) el.style.setProperty("--fx-each", `${+options.each}s`);
    const undo = () => {
      el.classList.remove("fx-sb-self");
      el.classList.remove("is-in");
      el.querySelectorAll('[data-fx-part="item"]').forEach((n) => n.style.removeProperty("--fx-k"));
      ["--fx-dur", "--fx-band", "--fx-each"].forEach((p) => el.style.removeProperty(p));
    };
    if (reduce) { el.classList.add("is-in"); return undo; }
    const again = options.repeat === "1";
    const io = new IntersectionObserver((es) => {
      const on = es.some((e) => e.isIntersecting);
      if (on) { el.classList.add("is-in"); if (!again) io.disconnect(); }
      else if (again) el.classList.remove("is-in");
    }, { root: scroller || null, rootMargin: options.margin || "0px 0px -10% 0px" });
    io.observe(el);
    return () => { io.disconnect(); undo(); };
  });
})();
