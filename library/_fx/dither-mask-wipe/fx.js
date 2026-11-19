// Hide the element with a mask of a full plate plus a Bayer slope as long as the element width, and when it comes 10% above the bottom of the screen, push the mask from the left to reveal it.
// The slope cell count is the width the children actually occupy ÷ dot size, so the dots fully vanish at the end of the text, whether it is a single big number or number plus unit.
// The mask image is baked as SVG on the fly (per cell 1 − (x + .5)/cell count > 8×8 Bayer threshold).
(() => {
  const bayer = (x, y) => {
    let v = 0;
    for (let b = 0; b < 3; b++) {
      const xb = (x >> b) & 1, yb = (y >> b) & 1;
      v |= ((xb ^ yb) << (2 * (2 - b) + 1)) | (yb << (2 * (2 - b)));
    }
    return (v + 0.5) / 64;
  };
  const ramp = (n) => {
    let d = `M0 0h${n}v8h-${n}z`;
    for (let y = 0; y < 8; y++) for (let x = 0; x < n; x++) if (1 - (x + 0.5) / n > bayer(x % 8, y)) d += `M${n + x} ${y}h1v1h-1z`;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${n * 2} 8' shape-rendering='crispEdges'><path d='${d}'/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  };
  const small = matchMedia("(max-width: 767px)");

  kfFx.register("dither-mask-wipe", (el, { options, reduce }) => {
    if (reduce) return;
    const dur = +(options.dur ?? 0.8), delay = +(options.delay ?? 0.25);
    const dot = +(options.dot || 3), dotSm = +(options["dot-sm"] || 2);
    const ease = options.ease || "cubic-bezier(0.65, 0, 0.35, 1)";
    let anim = null;
    el.classList.add("is-fx-pending");

    const span = () => {
      const box = el.getBoundingClientRect();
      let l = Infinity, r = -Infinity;
      for (const c of el.children) {
        const b = c.getBoundingClientRect();
        if (b.width) { l = Math.min(l, b.left); r = Math.max(r, b.right); }
      }
      return r <= l ? { left: 0, width: box.width } : { left: l - box.left, width: r - l };
    };
    const finish = () => {
      anim?.cancel();
      anim = null;
      el.classList.remove("is-fx-pending", "is-fx-wiping");
      el.style.removeProperty("--fx-wipe-mask");
      el.style.removeProperty("--fx-wipe-band");
    };
    const go = () => {
      if (!el.classList.contains("is-fx-pending")) return;
      const d = small.matches ? dotSm : dot;
      el.style.setProperty("--fx-dot", `${d}px`);
      const { left, width } = span();
      const n = Math.max(1, Math.ceil(width / d)), band = n * d;
      el.style.setProperty("--fx-wipe-mask", ramp(n));
      el.style.setProperty("--fx-wipe-band", `${band}px`);
      el.classList.add("is-fx-wiping");
      el.classList.remove("is-fx-pending");
      anim = el.animate({ maskPosition: [`${left - band * 2}px 0`, `${left}px 0`], webkitMaskPosition: [`${left - band * 2}px 0`, `${left}px 0`] }, { duration: dur * 1000, delay: delay * 1000, easing: ease, fill: "both" });
      anim.addEventListener("finish", finish);
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); go(); } }), { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);

    return () => { io.disconnect(); finish(); };
  });
})();
