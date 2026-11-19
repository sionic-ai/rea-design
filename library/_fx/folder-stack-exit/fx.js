(() => {
  // Sections stacked with sticky — the moment the next section’s head touches the bottom of the previous section’s head, the previous one is released from sticky and left standing in place.
  // So a front plate isn’t endlessly laid under the next one but slides out upward, and the last plate leaves together when the group ends
  kfFx.register("folder-stack-exit", (el, { reduce }) => {
    const folders = () => Array.from(el.querySelectorAll(':scope > [data-fx-part="folder"]'));
    if (folders().length < 2) return;
    let items = [], raf = 0;
    const update = () => {
      const y = scrollY;
      items.forEach((it) => {
        const out = y >= it.trigger;
        if (out === it.out) return;
        it.out = out;
        it.el.style.position = out ? "relative" : "";
        it.el.style.top = out ? "0" : "";
        it.el.style.transform = out ? `translateY(${it.offset}px)` : "";
      });
    };
    const measure = () => {
      const fs = folders();
      fs.forEach((f) => { f.style.position = "static"; f.style.top = ""; f.style.transform = ""; });
      const tops = fs.map((f) => f.getBoundingClientRect().top + scrollY);
      const hs = fs.map((f) => f.getBoundingClientRect().height);
      const heads = fs.map((f) => f.querySelector('[data-fx-part="head"]')?.getBoundingClientRect().height || 0);
      fs.forEach((f) => (f.style.position = ""));
      const st = fs.map((f) => parseFloat(getComputedStyle(f).top) || 0);
      const bottom = el.getBoundingClientRect().bottom + scrollY, last = fs.length - 1;
      items = fs.map((f, i) => {
        const trigger = i === last ? bottom - hs[last] - st[last] : tops[i + 1] - st[i + 1] - heads[i];
        return { el: f, trigger, offset: st[i] + trigger - tops[i], out: false };
      });
      update();
    };
    if (reduce) return;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    addEventListener("scroll", onScroll, { passive: true });
    measure();
    return () => {
      ro.disconnect(); removeEventListener("scroll", onScroll); cancelAnimationFrame(raf);
      folders().forEach((f) => { f.style.position = ""; f.style.top = ""; f.style.transform = ""; });
    };
  });
})();
