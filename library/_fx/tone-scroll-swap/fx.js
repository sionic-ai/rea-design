(() => {
  kfFx.register("tone-scroll-swap", (el, { options, reduce }) => {
    const tones = [...el.querySelectorAll('[data-fx-part="tone"]')];
    if (!tones.length) return;
    const target = options.target === "body" ? document.body : el;
    const line = +(options.line ?? 0.5);
    const dur = reduce ? 0 : +(options.dur ?? 0.4);
    const ease = options.ease || "ease-out";
    const before = { transition: target.style.transition, bg: target.style.backgroundColor, color: target.style.color };
    target.style.transition = `background-color ${dur}s ${ease}, color ${dur}s ${ease}`;
    let current = null;
    const apply = (t) => {
      if (t === current) return;
      current = t;
      const cs = getComputedStyle(t);
      const bg = cs.getPropertyValue("--fx-bg").trim(), ink = cs.getPropertyValue("--fx-ink").trim();
      if (bg) target.style.backgroundColor = bg;
      if (ink) target.style.color = ink;
      el.dispatchEvent(new CustomEvent("fx:tone", { detail: { el: t, key: t.dataset.key || "" } }));
    };
    let raf = 0;
    const check = () => {
      raf = 0;
      const mid = innerHeight * line;
      let pick = null;
      for (const t of tones) {
        const r = t.getBoundingClientRect();
        if ((scrollY === 0 && t === tones[0] && r.top <= mid) || (Math.max(r.top, 0) <= mid && r.bottom >= mid)) pick = t;
      }
      if (pick) apply(pick);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    check();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      target.style.transition = before.transition;
      target.style.backgroundColor = before.bg;
      target.style.color = before.color;
    };
  });
})();
