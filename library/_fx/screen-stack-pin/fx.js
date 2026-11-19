(() => {
  // Original showcase: n screens overlap at the center of a fixed stage. At progress p (0 ~ n−1), the i-th screen, if it has not yet arrived,
  // Rises from below by .8 × (i − p) of screen height, and once passed, sinks per step by 2.5rem up · .07 smaller · .12 darker (up to three steps).
  // The nearest screen is the current one — gives its row, number and dot is-active.
  kfFx.register("screen-stack-pin", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const screens = items.map((it) => it.querySelector('[data-fx-part="screen"]'));
    const numbers = [...el.querySelectorAll('[data-fx-part="number"]')];
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    if (reduce) return;
    const rise = +(options.rise ?? 0.8);
    const sink = String(options.sink ?? "2.5rem");
    const shrink = +(options.shrink ?? 0.07);
    const dim = +(options.dim ?? 0.12);
    const depth = +(options.depth || 3);
    const off = matchMedia(options.off || "(max-width: 64rem) and (orientation: landscape) and (max-height: 38.6875rem)");
    const ac = new AbortController();
    let raf = 0, active = -1;
    el.style.setProperty("--count", String(items.length));

    const frame = () => {
      raf = 0;
      if (off.matches) return;
      const travel = el.offsetHeight - innerHeight;
      const p = (travel > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / travel)) : 0) * (items.length - 1);
      screens.forEach((s, i) => {
        if (!s) return;
        const r = i - p;
        if (r >= 0) {
          s.style.transform = `translateY(${(r * innerHeight * rise).toFixed(1)}px)`;
          s.style.filter = "";
        } else {
          const e = Math.min(-r, depth);
          s.style.transform = `translateY(calc(${(-e).toFixed(2)} * ${sink})) scale(${(1 - e * shrink).toFixed(3)})`;
          s.style.filter = `brightness(${(1 - e * dim).toFixed(3)})`;
        }
        s.style.zIndex = String(i + 1);
      });
      const now = Math.round(p);
      if (now === active) return;
      active = now;
      el.dispatchEvent(new CustomEvent("fx:screen", { bubbles: true, detail: { index: now } }));
      for (const list of [items, numbers, dots]) list.forEach((n, i) => n.classList.toggle("is-active", i === now));
    };
    const soon = () => { raf ||= requestAnimationFrame(frame); };
    const mode = () => {
      el.classList.toggle("is-pinned", !off.matches);
      if (off.matches) {
        screens.forEach((s) => s && (s.style.transform = s.style.filter = s.style.zIndex = ""));
        return;
      }
      active = -1;
      frame();
    };
    off.addEventListener("change", mode, { signal: ac.signal });
    addEventListener("scroll", soon, { signal: ac.signal, passive: true });
    addEventListener("resize", soon, { signal: ac.signal });
    mode();

    return () => {
      ac.abort();
      cancelAnimationFrame(raf);
      el.classList.remove("is-pinned");
      el.style.removeProperty("--count");
      screens.forEach((s) => s && (s.style.transform = s.style.filter = s.style.zIndex = ""));
      [...items, ...numbers, ...dots].forEach((n) => n.classList.remove("is-active"));
    };
  });
})();
