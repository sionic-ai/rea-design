(() => {
  // One dot per section — the dot of the current section (the last section whose top edge crossed the line) swells into a photo circle, and the dots and up/down buttons glide to that section.
  // The sliding is a frame-based table just like the original: distance/speed frames (min~max), and per cell start + distance × p × easeInOutCubic(p).
  const cubic = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);

  kfFx.register("thumb-dot-rail", (el, { options, reduce, scroller }) => {
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    const targets = dots.map((d) => {
      const id = (d.getAttribute("href") || d.dataset.target || "").replace(/^#/, "");
      return id ? document.getElementById(id) : null;
    });
    if (!dots.length || targets.every((t) => !t)) return;
    const prev = el.querySelector('[data-fx-part="prev"]');
    const next = el.querySelector('[data-fx-part="next"]');
    const now = el.querySelector('[data-fx-part="now"]');
    const max = el.querySelector('[data-fx-part="max"]');
    if (max) max.textContent = `/ ${dots.length}`;

    const line = +(options.line ?? 0.5);
    const speed = +(options.speed ?? 30) || 30;
    const minF = +(options.min ?? 10) || 1;
    const maxF = +(options.max ?? 60) || 1;
    const view = scroller || document.scrollingElement;
    const height = () => (scroller ? scroller.clientHeight : innerHeight);
    const topOf = (t) => t.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0);

    let current = -1;
    const mark = (i) => {
      if (i === current) return;
      current = i;
      dots.forEach((d, k) => {
        d.classList.toggle("is-on", k === i);
        if (k === i) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
      if (now) now.textContent = i < 0 ? "" : String(i + 1);
      el.dispatchEvent(new CustomEvent("fx:rail", { detail: { index: i, target: targets[i] || null } }));
    };
    let raf = 0;
    const check = () => {
      raf = 0;
      const mid = height() * line;
      let pick = -1;
      targets.forEach((t, k) => { if (t && topOf(t) <= mid) pick = k; });
      mark(pick);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };

    let glide = 0;
    const stop = () => { cancelAnimationFrame(glide); glide = 0; };
    const go = (i) => {
      const t = targets[i];
      if (!t) return;
      stop();
      const startY = view.scrollTop;
      const endY = Math.round(startY + topOf(t));
      if (reduce) { view.scrollTop = endY; return; }
      const f = Math.min(maxF, Math.max(minF, Math.round(Math.abs(endY - startY) / speed)));
      const d = (endY - startY) / f;
      const ys = [];
      for (let k = 1; k < f; k++) ys.push(startY + d * k * cubic(k / f));
      ys.push(endY);
      let k = 0;
      const tick = () => {
        view.scrollTop = ys[k++];
        glide = k < ys.length ? requestAnimationFrame(tick) : 0;
      };
      glide = requestAnimationFrame(tick);
    };
    const onDot = (e) => {
      const i = dots.indexOf(e.currentTarget);
      if (i < 0 || !targets[i]) return;
      e.preventDefault();
      go(i);
    };
    const onPrev = () => { if (current > 0) go(current - 1); };
    const onNext = () => { if (current < dots.length - 1) go(current + 1); };
    const onWheel = () => stop();

    dots.forEach((d) => d.addEventListener("click", onDot));
    prev?.addEventListener("click", onPrev);
    next?.addEventListener("click", onNext);
    const src = scroller || window;
    src.addEventListener("scroll", onScroll, { passive: true });
    src.addEventListener("wheel", onWheel, { passive: true });
    src.addEventListener("touchstart", onWheel, { passive: true });
    addEventListener("resize", onScroll);
    check();
    return () => {
      stop();
      cancelAnimationFrame(raf);
      dots.forEach((d) => { d.removeEventListener("click", onDot); d.classList.remove("is-on"); d.removeAttribute("aria-current"); });
      prev?.removeEventListener("click", onPrev);
      next?.removeEventListener("click", onNext);
      src.removeEventListener("scroll", onScroll);
      src.removeEventListener("wheel", onWheel);
      src.removeEventListener("touchstart", onWheel);
      removeEventListener("resize", onScroll);
    };
  });
})();
