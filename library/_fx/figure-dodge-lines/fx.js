// Text lines that avoid a fixed image: when a text line passes the vertical center of the image fixed at screen center, if the distance dy is within 190px above and 255px below (phone 90 · 150)
// pushed outward by sin(depth × π/2) (left chunk to the left, right chunk to the right) up to 160px (phone 75) and blurred up to 18% by the same amount — tied directly to scroll (no Curve). Brand
(() => {
  kfFx.register("figure-dodge-lines", (host, { options, reduce }) => {
    const fig = options.figure ? document.querySelector(options.figure) : null;
    const lines = [...host.querySelectorAll('[data-fx-part="line"]')];
    if (!fig || !lines.length || reduce) return;
    const phoneW = +(options.phone ?? 480);
    const side = (el) => (el.closest("[data-dir]")?.getAttribute("data-dir") === "left" ? -1 : 1);
    const dirs = lines.map(side);
    let raf = 0;
    const update = () => {
      raf = 0;
      const phone = innerWidth <= phoneW;
      const up = +(phone ? options["phone-top"] ?? 90 : options.top ?? 190);
      const down = +(phone ? options["phone-bottom"] ?? 150 : options.bottom ?? 255);
      const max = +(phone ? options["phone-push"] ?? 75 : options.push ?? 160);
      const fade = +(options.fade ?? 0.18);
      const r = fig.getBoundingClientRect(), cy = r.top + r.height / 2;
      lines.forEach((line, i) => {
        const b = line.getBoundingClientRect(), dy = b.top + b.height / 2 - cy, R = dy < 0 ? up : down;
        const f = Math.abs(dy) < R ? Math.sin(((1 - Math.abs(dy) / R) * Math.PI) / 2) : 0;
        line.style.transform = `translate3d(${dirs[i] * f * max}px, 0, 0)`;
        line.style.opacity = String(1 - f * fade);
      });
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(update); };
    addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", ask);
    const ro = new ResizeObserver(ask);
    ro.observe(host);
    update();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", ask);
      removeEventListener("resize", ask);
      ro.disconnect();
      lines.forEach((l) => { l.style.transform = ""; l.style.opacity = ""; });
    };
  });
})();
