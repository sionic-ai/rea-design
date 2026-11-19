(() => {
  // Current step = The last step, when the bottom edge of the text block touches or passes the bottom edge of the photo panel. Smooth scrolling (Lenis) delays window scroll events, so it is measured every frame while visible
  kfFx.register("step-cover-swap", (el, { options, reduce }) => {
    const frame = el.querySelector('[data-fx-part="frame"]');
    const pics = [...el.querySelectorAll('[data-fx-part="pic"]')];
    const steps = [...el.querySelectorAll('[data-fx-part="step"]')];
    if (!frame || !pics.length || !steps.length) return;
    const dur = +(options.dur ?? 800);
    el.style.setProperty("--fx-dur", dur + "ms");
    if (options.shift) el.style.setProperty("--fx-shift", options.shift);
    if (options.dim != null) el.style.setProperty("--fx-dim", options.dim);
    let current = -1;
    const set = (idx, first) => {
      if (idx === current) return;
      const prev = current;
      el.classList.toggle("is-fx-reverse", prev > -1 && idx < prev);
      el.classList.toggle("is-fx-still", !!first || reduce);
      pics.forEach((p, i) => {
        p.classList.remove("is-fx-active", "is-fx-prev");
        if (i === prev && !first && !reduce) p.classList.add("is-fx-prev");
      });
      const incoming = pics[Math.min(idx, pics.length - 1)];
      void incoming.offsetWidth;
      incoming.classList.add("is-fx-active");
      current = idx;
      el.dispatchEvent(new CustomEvent("fx:step", { bubbles: true, detail: { index: idx } }));
    };
    const resolve = () => {
      const bottom = frame.getBoundingClientRect().bottom;
      let idx = 0;
      steps.forEach((s, i) => { if (s.getBoundingClientRect().bottom <= bottom + 1) idx = i; });
      return idx;
    };
    set(resolve(), true);
    let raf = 0;
    const tick = () => { set(resolve()); raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver((en) => {
      en.forEach((e) => {
        if (e.isIntersecting && !raf) tick();
        else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
      });
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      pics.forEach((p) => p.classList.remove("is-fx-active", "is-fx-prev"));
      el.classList.remove("is-fx-reverse", "is-fx-still");
    };
  });
})();
