(() => {
  // The original (STUDIO appear) holds the pre-visible state as a class, then removes it when it enters the screen and a transition releases it — kept in the same form
  kfFx.register("blur-lines-in", (el, { options, reduce, scroller }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    const soft = [...el.querySelectorAll('[data-fx-part="soft"]')];
    if (!lines.length && !soft.length) return;
    const delay = +(options.delay ?? 0.3), step = +(options.step ?? 0.1), shift = +(options.shift ?? 10);
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options["soft-dur"] != null) el.style.setProperty("--fx-soft-dur", `${+options["soft-dur"]}s`);
    if (options.blur != null) el.style.setProperty("--fx-blur", `${+options.blur}px`);
    if (options.ease) el.style.setProperty("--fx-ease", options.ease);
    lines.forEach((n, i) => {
      n.style.setProperty("--fx-delay", `${delay + i * step}s`);
      n.style.setProperty("--fx-y", `${i % 2 ? -shift : shift}px`);
    });
    soft.forEach((n) => n.style.setProperty("--fx-delay", `${delay}s`));
    if (reduce) return () => [...lines, ...soft].forEach((n) => n.style.removeProperty("--fx-delay"));
    // In the hidden state it jumps straight with no transition — prevents the flicker where an already drawn hero title blurs and clears again
    if (!el.classList.contains("fx-bl-wait")) { el.classList.add("fx-bl-now", "fx-bl-wait"); void el.offsetWidth; el.classList.remove("fx-bl-now"); }
    // enter·leave are % measured on screen (ScrollTrigger start "top 70%" → enter: 70, end "bottom 50%" → leave: 50).
    // With replay, the cover is hidden again each time it leaves that band, and lifts each time it re-enters (play reverse play reverse in the Brand story line)
    const enter = +(options.enter ?? 100), leave = +(options.leave ?? 0), replay = options.replay === "1" || options.replay === "true";
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      el.classList.toggle("fx-bl-wait", !e.isIntersecting);
      if (e.isIntersecting && !replay) io.disconnect();
    }), { root: scroller || null, rootMargin: `${-leave}% 0px ${enter - 100}% 0px` });
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove("fx-bl-wait");
      for (const n of [...lines, ...soft]) { n.style.removeProperty("--fx-delay"); n.style.removeProperty("--fx-y"); }
      for (const k of ["--fx-dur", "--fx-soft-dur", "--fx-blur", "--fx-ease"]) el.style.removeProperty(k);
    };
  });
})();
