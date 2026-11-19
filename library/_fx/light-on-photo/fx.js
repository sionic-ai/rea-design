(() => {
  // The original applies two transitions together with one class the moment the loader clears (intro_open) — delay and curve are left to css, and here only the trigger timing is set
  kfFx.register("light-on-photo", (el, { options, reduce, scroller }) => {
    const lit = el.querySelector('[data-fx-part="lit"]');
    if (!lit) return;
    const vars = { delay: "--fx-delay", dur: "--fx-dur", "zoom-dur": "--fx-zoom-dur" };
    for (const [k, v] of Object.entries(vars)) if (options[k] != null) el.style.setProperty(v, `${+options[k]}s`);
    if (options.dim != null) el.style.setProperty("--fx-dim", +options.dim);
    if (options.zoom != null) el.style.setProperty("--fx-zoom", +options.zoom);
    const on = () => el.classList.add("fx-lo-on");
    let io = null, evt = null;
    if (reduce) on();
    else if (options.wait) { evt = options.wait; document.addEventListener(evt, on, { once: true }); }
    else {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { on(); io.disconnect(); } }, { root: scroller || null });
      io.observe(el);
    }
    return () => {
      io?.disconnect();
      if (evt) document.removeEventListener(evt, on);
      el.classList.remove("fx-lo-on");
      for (const v of ["--fx-delay", "--fx-dur", "--fx-zoom-dur", "--fx-dim", "--fx-zoom"]) el.style.removeProperty(v);
    };
  });
})();
