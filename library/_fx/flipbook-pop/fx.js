// When a cut-out person or object photo comes into view it approaches stepwise (steps) from diagonally above with a shake, then alternates two frames, moving like a hand-flipped picture book
(() => {
  kfFx.register("flipbook-pop", (el, { options, reduce }) => {
    const frames = el.querySelectorAll('[data-fx-part="frame"]');
    if (!frames.length) return;
    const set = [];
    const put = (k, v) => { el.style.setProperty(k, v); set.push(k); };
    if (options.dur != null) put("--fx-dur", +options.dur + "s");
    if (options.cycle != null) put("--fx-cycle", +options.cycle + "s");
    if (options.delay != null) put("--fx-delay", +options.delay + "s");
    if (options.lag != null) put("--fx-lag", +options.lag + "s");
    el.classList.toggle("fx-fb-two", frames.length > 1);
    if (reduce) { el.classList.add("fx-fb-in"); return () => { el.classList.remove("fx-fb-in", "fx-fb-two"); set.forEach((k) => el.style.removeProperty(k)); }; }
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      el.classList.add("fx-fb-in");
    }, { rootMargin: options.margin || "0px 0px -10% 0px" });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("fx-fb-in", "fx-fb-two"); set.forEach((k) => el.style.removeProperty(k)); };
  });
})();
