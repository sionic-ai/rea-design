// Sawtooth band transition — for one cover screen before the boundary element’s top reaches the top of the screen, rows of bands with sawtooth bottom edges slide in alternately from left and right
// Covers the screen (stacking from the top row with stag), holds for hold screens, then exits the opposite way from the bottom row over uncover screens. Tied to scroll and rewinds.
(() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  kfFx.register("zigzag-row-wipe", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const n = Math.max(2, Math.round(+options.rows || 14)), stag = clamp(+(options.stag ?? 0.58), 0.05, 1);
    const coverVh = +(options.cover ?? 1), holdVh = +(options.hold ?? 0), uncoverVh = +(options.uncover ?? 1.05);
    const box = document.createElement("div");
    box.className = "fx-zzw";
    box.setAttribute("aria-hidden", "true");
    const rows = Array.from({ length: n }, (_, i) => { const r = document.createElement("i"); r.className = "fx-zzw__row"; r.style.top = (i * 100) / n + "vh"; r.style.height = `calc(100vh / ${n} + 3vh)`; box.appendChild(r); return r; });
    document.body.appendChild(box);
    const sc = scroller || null;
    const scrollTop = () => (sc ? sc.scrollTop : scrollY);
    const viewH = () => (sc ? sc.clientHeight : innerHeight);
    let T = 0, last = -1, raf = 0;
    const measure = () => { const top = el.getBoundingClientRect().top - (sc ? sc.getBoundingClientRect().top : 0); T = top + scrollTop(); last = -1; };
    const R = (x, k) => clamp((x - (k / (n - 1)) * (1 - stag)) / stag);
    function paint() {
      raf = 0;
      const H = viewH(), y = scrollTop(), a0 = T - H * coverVh, b0 = T, c0 = T + H * holdVh, d0 = c0 + H * uncoverVh;
      let u;
      if (y <= a0) u = 0; else if (y < b0) u = ((y - a0) / Math.max(1, b0 - a0)) * 0.5; else if (y < c0) u = 0.5; else if (y < d0) u = 0.5 + ((y - c0) / Math.max(1, d0 - c0)) * 0.5; else u = 1;
      if (u === last) return;
      last = u;
      box.style.visibility = u > 0 && u < 1 ? "visible" : "hidden";
      const a = clamp(u / 0.5), b = clamp((u - 0.5) / 0.5);
      rows.forEach((r, k) => { const dir = k % 2 ? 1 : -1, x = (1 - R(a, k)) * 110 * dir - R(b, n - 1 - k) * 110 * dir; r.style.transform = `translateX(${x.toFixed(2)}%)`; });
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const target = sc || window;
    target.addEventListener("scroll", queue, { passive: true });
    const onResize = () => { measure(); queue(); };
    addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    window.ScrollTrigger?.addEventListener("refresh", onResize);
    measure(); paint();
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("scroll", queue);
      removeEventListener("resize", onResize);
      ro.disconnect();
      window.ScrollTrigger?.removeEventListener("refresh", onResize);
      box.remove();
    };
  });
})();
