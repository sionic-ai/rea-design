(() => {
  // The leaving paper is cut from the left (progress p) and pushed right by push, while the back-side strip of the paper flips over along the cut line up to 2p (squashed by stretch times when exceeding paper width).
  // The revealed area’s shadow goes from .25 to 0, the fold-line shadow is covered at .12 and lifts in the last 30%. The next document reads the sessionStorage mark and rises by enter.
  const KEY = "fx-paper-turn";
  const ease = (e) => (e < 0.5 ? 4 * e ** 3 : 1 - (-2 * e + 2) ** 3 / 2);
  kfFx.register("paper-turn-page", (el, { options, reduce }) => {
    const dur = +(options.dur ?? 800), push = +(options.push ?? 0.06), stretch = +(options.stretch ?? 0.4), enter = +(options.enter ?? 800);
    let raf = 0, layers = [];
    if (sessionStorage.getItem(KEY) === "1") {
      sessionStorage.removeItem(KEY);
      if (!reduce && enter > 0) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: enter, easing: "cubic-bezier(0.33, 1, 0.68, 1)" });
    }
    const clear = () => {
      cancelAnimationFrame(raf);
      layers.forEach((n) => n.remove());
      layers = [];
      el.style.clipPath = "";
      el.style.translate = "";
      el.style.pointerEvents = "";
    };
    const turn = (done) => {
      if (reduce || dur <= 0) return done();
      const { left, top, width, height } = el.getBoundingClientRect();
      const mk = (cls) => { const d = document.createElement("div"); d.className = cls; Object.assign(d.style, { top: `${top}px`, height: `${height}px` }); document.body.append(d); layers.push(d); return d; };
      const shade = mk("fx-ptp-shade"), back = mk("fx-ptp-back");
      shade.style.left = `${left}px`;
      el.style.pointerEvents = "none";
      const t0 = performance.now();
      const step = (now) => {
        const a = Math.min((now - t0) / dur, 1), f = ease(a), p = width * f, m = 2 * p;
        const h = m > width ? width + (m - width) * stretch : m, g = width * push * f, fold = f < 0.7 ? 1 : (1 - f) / 0.3;
        el.style.translate = `${g}px 0`;
        el.style.clipPath = `inset(0 0 0 ${p}px)`;
        back.style.left = `${left + g + p}px`;
        back.style.width = `${h - p}px`;
        back.style.opacity = String(fold);
        shade.style.width = `${g + p}px`;
        shade.style.setProperty("--fx-fold", fold);
        shade.style.setProperty("--fx-edge", `${Math.min(p * 0.5, 90)}px`);
        shade.style.setProperty("--fx-shade", 1 - f);
        if (a < 1) raf = requestAnimationFrame(step);
        else done();
      };
      raf = requestAnimationFrame(step);
    };
    const onClick = (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank" || a.hasAttribute("download")) return;
      // The paper holding links turns over. Links outside the paper (side-board table of contents) belong to the document’s first paper
      const owner = a.closest('[data-fx~="paper-turn-page"]') || document.querySelector('[data-fx~="paper-turn-page"]');
      if (owner !== el) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      sessionStorage.setItem(KEY, "1");
      turn(() => { location.href = url.href; });
    };
    const onShow = (e) => { if (e.persisted) clear(); };
    document.addEventListener("click", onClick);
    addEventListener("pageshow", onShow);
    return () => { document.removeEventListener("click", onClick); removeEventListener("pageshow", onShow); clear(); };
  });
})();
