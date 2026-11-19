// About — 3D line wordmark (the back outline shifts by (86 ± 30)·−.62 over a 9s cycle and returns, 30fps), value accordion (next cell every 7.2s · overlapping 8 depth · tilt)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const css = getComputedStyle(document.documentElement);

  const cv = document.querySelector(".ab-mark");
  if (cv) {
    const g = cv.getContext("2d");
    const word = cv.dataset.word || "STUDIO8";
    let W = 0, H = 0, dpr = 1, inView = false, raf = 0, last = 0, elapsed = 0;
    const size = () => {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio, 2);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      draw(elapsed / 9000 * Math.PI * 2);
    };
    // Fits the original unit (viewBox about 4000 wide) push of 86 ± 30 to the canvas width
    function draw(phase) {
      if (!W) return;
      const k = W / 4000, dx = (86 + 30 * Math.sin(phase)) * k, dy = -dx * 0.62;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      g.font = `300 ${H * 0.62}px ${css.getPropertyValue("--kf-font-display")}`;
      g.textAlign = "center"; g.textBaseline = "middle";
      g.lineJoin = "round";
      const ink = css.getPropertyValue("--kf-ink"), bg = css.getPropertyValue("--kf-bg");
      g.strokeStyle = ink; g.lineWidth = 1.2;
      // After being pushed back: outline → two in-between layers → front outline (filled with background to hide what’s behind)
      for (let i = 3; i >= 1; i--) {
        g.globalAlpha = i === 3 ? 1 : 0.35;
        g.strokeText(word, W / 2 + dx * (i / 3), H * 0.56 + dy * (i / 3));
      }
      g.globalAlpha = 1;
      g.fillStyle = bg; g.fillText(word, W / 2, H * 0.56);
      g.strokeText(word, W / 2, H * 0.56);
    }
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 32) return;
      const delta = last ? Math.min(now - last, 100) : 0;
      last = now; elapsed += delta;
      draw((elapsed / 9000) * Math.PI * 2);
    };
    const sync = () => {
      cancelAnimationFrame(raf); raf = 0; last = 0;
      if (inView && !document.hidden && !reduce.matches) raf = requestAnimationFrame(loop);
    };
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }).observe(cv);
    document.addEventListener("visibilitychange", sync);
    new ResizeObserver(size).observe(cv);
    document.fonts.ready.then(size);
  }

  const list = document.querySelector(".ab-values__list");
  if (list) {
    const rows = [...list.querySelectorAll(".ab-value")];
    const camera = document.querySelector(".ab-eight__camera");
    const layers = [...camera.children];
    const caption = document.querySelector(".ab-values__caption");
    let active = 0, elapsed = 0, last = 0, raf = 0, visible = false;
    const select = (i) => {
      active = i; elapsed = 0;
      caption.textContent = rows[i].querySelector(".ab-value__t").textContent;
      rows.forEach((r, j) => { r.style.setProperty("--value-progress", "0%"); if (j !== i) r.open = false; });
    };
    const drawEight = (p) => {
      const depth = 3 + 13 * (0.5 - 0.5 * Math.cos(p * Math.PI * 2));
      const tilt = -28 + 8 * Math.sin(p * Math.PI * 2);
      camera.style.transform = `translate(-50%, -50%) rotateX(12deg) rotateY(${tilt.toFixed(3)}deg)`;
      layers.forEach((l, i) => { l.style.transform = `translateZ(${((i - 4.5) * depth).toFixed(3)}px)`; });
      rows[active].style.setProperty("--value-progress", `${(p * 100).toFixed(2)}%`);
    };
    rows.forEach((r, i) => r.addEventListener("toggle", () => { if (r.open && i !== active) select(i); }));
    const loop = (now) => {
      raf = 0;
      if (!visible || document.hidden || reduce.matches) { last = 0; return; }
      elapsed += last ? Math.min(now - last, 80) : 0;
      last = now;
      if (elapsed >= 7200) {
        elapsed = 0;
        if (!list.matches(":hover") && !list.contains(document.activeElement)) { const n = (active + 1) % rows.length; select(n); rows[n].open = true; }
      }
      drawEight(elapsed / 7200);
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      cancelAnimationFrame(raf); raf = 0; last = 0;
      if (reduce.matches) { drawEight(0.35); rows[active].style.setProperty("--value-progress", "0%"); return; }
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    select(0); drawEight(0);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(list.closest(".ab-values"));
    document.addEventListener("visibilitychange", sync);
  }
})();
