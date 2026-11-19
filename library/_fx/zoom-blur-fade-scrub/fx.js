// Tie zoom, blur and fade directly to scroll — same formula as the Studio ‘Scroll’ animation (CSS animation-timeline: view(), cover from% → to%).
// A CSS scroll timeline treats a fixed (position: fixed) panel’s ”position at scroll 0” as its document position when setting the range — that is why the original’s fixed hero grows with the scroll.
(() => {
  const inFixed = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) if (getComputedStyle(n).position === "fixed") return true;
    return false;
  };

  kfFx.register("zoom-blur-fade-scrub", (el, { options, reduce, scroller }) => {
    const from = +(options.from ?? 50) / 100;
    const to = +(options.to ?? 120) / 100;
    const mid = Math.min(0.99, Math.max(0, +(options.mid ?? 35) / 100));
    const scale = +(options.scale ?? 1.8);
    const blur = +(options.blur ?? 8);
    const midOp = +(options["mid-opacity"] ?? 1);
    const endOp = +(options.opacity ?? 0);

    const paint = (p) => {
      if (scale !== 1) el.style.scale = String(1 + (scale - 1) * p);
      const q = p <= mid ? 0 : (p - mid) / (1 - mid);
      el.style.opacity = String(p <= mid ? 1 + (midOp - 1) * (mid ? p / mid : 1) : midOp + (endOp - midOp) * q);
      el.style.filter = blur && q > 0 ? `blur(${blur * q}px)` : "none";
    };
    if (reduce) { paint(0); return () => { el.style.scale = el.style.opacity = el.style.filter = ""; }; }

    const src = scroller || window;
    const read = () => (scroller ? scroller.scrollTop : window.scrollY);
    const view = () => (scroller ? scroller.clientHeight : window.innerHeight);
    let a = 0, b = 1;
    const measure = () => {
      const keep = el.style.scale;
      el.style.scale = "";
      const r = el.getBoundingClientRect();
      el.style.scale = keep;
      const vh = view();
      const top = inFixed(el) ? r.top : r.top + (scroller ? scroller.scrollTop - scroller.getBoundingClientRect().top : window.scrollY);
      const span = vh + r.height;
      a = top - vh + from * span;
      b = top - vh + to * span;
    };
    const update = () => paint(Math.min(1, Math.max(0, (read() - a) / Math.max(1, b - a))));
    const refresh = () => { measure(); update(); };
    const ro = new ResizeObserver(refresh);
    ro.observe(el);
    ro.observe(document.documentElement);
    src.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", refresh);
    refresh();
    return () => {
      ro.disconnect();
      src.removeEventListener("scroll", update);
      removeEventListener("resize", refresh);
      el.style.scale = el.style.opacity = el.style.filter = "";
    };
  });
})();
