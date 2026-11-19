(() => {
  kfFx.register("paint-drip-cover", (el, { options, reduce }) => {
    const trigger = el.querySelector('[data-fx-part="trigger"]');
    if (!trigger) return;
    let canvas = el.querySelector('[data-fx-part="canvas"]');
    const made = !canvas;
    if (made) { canvas = document.createElement("canvas"); canvas.dataset.fxPart = "canvas"; el.append(canvas); }
    const ctx = canvas.getContext("2d");
    // If simplex-noise (4.0.1, _vendor) is present, the same noise as the original, otherwise two sine waves with different phases
    const simplex = window.SimplexNoise?.createNoise2D?.();
    const phase = Array.from({ length: 64 }, () => [Math.random() * 6.28, Math.random() * 6.28]);
    const noise = simplex || ((x, t) => { const p = phase[Math.round(x / 0.15) % 64]; return (Math.sin(x * 6 + t + p[0]) + Math.sin(x * 2.5 + t * 1.7 + p[1])) / 2; });
    const dist = +options.dist || 70, fall = +(options.fall ?? 3), back = +(options.back ?? 30), wobble = +(options.wobble ?? 15);
    const power = +(options.power ?? 0.5), over = +(options.over ?? 150), below = +(options.below ?? 40);
    // Color takes a skin variable name and picks one at random each time it opens — default is the three accent colors
    const names = String(options.colors || "--kf-accent, --kf-accent-soft, --kf-warning").split(",").map((s) => s.trim()).filter(Boolean);
    let drips = [], amount = 0, raf = 0, state = "closed", t0 = 0, fill = "";
    const size = () => {
      const dpr = Math.max(1, devicePixelRatio || 1), w = innerWidth, h = innerHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      amount = Math.floor(w / dist) + 3;
      if (drips.length !== amount) drips = new Array(amount).fill(0);
      if (state === "open") { ctx.fillStyle = fill; ctx.fillRect(0, 0, w, h); }
    };
    const draw = (pts) => {
      ctx.beginPath(); ctx.fillStyle = fill; ctx.moveTo(0, 0); ctx.lineTo(pts[0].x, pts[0].y);
      let p = 1;
      for (; p < pts.length - 2; p++) ctx.quadraticCurveTo(pts[p].x, pts[p].y, (pts[p].x + pts[p + 1].x) / 2, (pts[p].y + pts[p + 1].y) / 2);
      ctx.quadraticCurveTo(pts[p].x, pts[p].y, pts[p + 1].x, pts[p + 1].y);
      ctx.lineTo(innerWidth, 0); ctx.closePath(); ctx.fill();
    };
    const render = (now) => {
      const h = innerHeight, time = (now - t0) / 1200;
      ctx.clearRect(0, 0, innerWidth, h);
      const progress = Math.min(Math.max(...drips) / h, 1), ease = Math.pow(progress, power);
      const pts = drips.map((d, i) => {
        const n = (noise(i * 0.15, time) + 1) * wobble * (0.6 + progress);
        if (state === "opening") drips[i] = Math.min(h + below, d + fall * (0.25 + ease * 1.75) + n);
        else if (state === "closing") drips[i] = Math.max(0, d - (back + n * 0.6));
        return { x: dist * i, y: drips[i] };
      });
      draw(pts);
      const max = Math.max(...drips);
      if (state === "opening" && max >= h + over) { state = "open"; ctx.fillRect(0, 0, innerWidth, h); raf = 0; return; }
      if (state === "closing" && max <= 0) {
        state = "closed"; el.classList.remove("is-fx-open"); ctx.clearRect(0, 0, innerWidth, h); raf = 0;
        el.dispatchEvent(new CustomEvent("fx:close", { bubbles: true }));
        return;
      }
      raf = requestAnimationFrame(render);
    };
    const run = () => { if (!raf) { t0 = performance.now(); raf = requestAnimationFrame(render); } };
    const open = () => {
      const css = getComputedStyle(el);
      fill = css.getPropertyValue(names[(Math.random() * names.length) | 0]).trim() || css.color;
      el.classList.add("is-fx-open", "is-fx-menu");
      trigger.setAttribute("aria-expanded", "true");
      drips.fill(0);
      el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
      if (reduce) { state = "open"; size(); return; }
      state = "opening"; run();
    };
    // Like the original, the menu plate hides the instant it’s pressed (slideToggle 0), and only the paint is pulled up
    const close = () => {
      el.classList.remove("is-fx-menu");
      trigger.setAttribute("aria-expanded", "false");
      if (reduce) { state = "closed"; el.classList.remove("is-fx-open"); ctx.clearRect(0, 0, innerWidth, innerHeight); el.dispatchEvent(new CustomEvent("fx:close", { bubbles: true })); return; }
      state = "closing"; run();
    };
    const toggle = () => (state === "closed" || state === "closing" ? open() : close());
    size();
    addEventListener("resize", size);
    trigger.addEventListener("click", toggle);
    const closers = [...el.querySelectorAll('[data-fx-part="close"]')];
    closers.forEach((c) => c.addEventListener("click", close));
    return () => {
      closers.forEach((c) => c.removeEventListener("click", close));
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
      trigger.removeEventListener("click", toggle);
      trigger.removeAttribute("aria-expanded");
      el.classList.remove("is-fx-open", "is-fx-menu");
      if (made) canvas.remove(); else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  });
})();
