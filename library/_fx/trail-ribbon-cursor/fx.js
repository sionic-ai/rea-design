// A small dot replaces the cursor and follows .25s late, leaving a faint accent-color glow trail for 250ms — the faster you move, the thinner the trail (16 → 2px). Over links the dot grows and brightens
(() => {
  kfFx.register("trail-ribbon-cursor", (root, { options, reduce, hover }) => {
    if (reduce || !hover || !window.gsap) return;
    const life = 1000 * +(options.life ?? 0.25), wide = +(options.wide ?? 16), thin = +(options.thin ?? 2), lag = +(options.lag ?? 0.25);
    const vLo = +(options.vlo ?? 0.08), vHi = +(options.vhi ?? 2.8), glow = +(options.glow ?? 40);
    const cv = document.createElement("canvas"), dot = document.createElement("span");
    cv.className = "fx-trail-canvas"; dot.className = "fx-trail-dot";
    cv.setAttribute("aria-hidden", "true"); dot.setAttribute("aria-hidden", "true");
    document.body.append(cv, dot);
    const ctx = cv.getContext("2d");
    const ac = new AbortController(), on = { signal: ac.signal };
    // Even if the skin color is color-mix or oklab, resolve it at one canvas point and read three rgb values
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const ink = () => { probe.clearRect(0, 0, 1, 1); probe.fillStyle = getComputedStyle(cv).color; probe.fillRect(0, 0, 1, 1); return [...probe.getImageData(0, 0, 1, 1).data].slice(0, 3).join(","); };
    let color = ink();
    const tint = (a) => `rgba(${color},${a})`;
    gsap.set(dot, { xPercent: -50, yPercent: -50, opacity: 0 });
    const xTo = gsap.quickTo(dot, "x", { duration: lag, ease: "power3" }), yTo = gsap.quickTo(dot, "y", { duration: lag, ease: "power3" });
    let pts = [], w = thin, live = false, inside = false, moving = false;
    const size = () => { const k = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(innerWidth * k); cv.height = Math.round(innerHeight * k); ctx.setTransform(k, 0, 0, k, 0, 0); pts = []; color = ink(); };
    size(); addEventListener("resize", size, on);
    const tick = () => {
      const now = performance.now();
      if (inside && moving) {
        const x = +gsap.getProperty(dot, "x"), y = +gsap.getProperty(dot, "y"), last = pts[pts.length - 1];
        if (!last || (x - last.x) ** 2 + (y - last.y) ** 2 >= 0.1) pts.push({ x, y, t: now });
        moving = xTo.tween.isActive() || yTo.tween.isActive();
      }
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      pts = pts.filter((p) => now - p.t < life);
      ctx.lineCap = "butt"; ctx.shadowColor = tint(0.75); ctx.shadowBlur = glow;
      for (let i = 1; i < pts.length - 1; i++) {
        const a = pts[i - 1], b = pts[i], c = pts[i + 1];
        const v = Math.hypot(b.x - a.x, b.y - a.y) / Math.max(1, b.t - a.t);
        const goal = wide - gsap.utils.clamp(0, 1, (v - vLo) / Math.max(1e-3, vHi - vLo)) * (wide - thin);
        const al = (1 - (now - b.t) / life) ** 2;
        if (al <= 0.005) continue;
        w += (goal - w) * 0.5;
        ctx.beginPath(); ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2); ctx.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2);
        ctx.lineWidth = w; ctx.strokeStyle = tint(al); ctx.stroke();
      }
      if (!pts.length && !moving) { gsap.ticker.remove(tick); live = false; }
    };
    const stop = () => { inside = false; moving = false; gsap.set(dot, { opacity: 0 }); };
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      if (!inside) { xTo(e.clientX, e.clientX); yTo(e.clientY, e.clientY); }
      inside = true; moving = true; gsap.set(dot, { opacity: 1 }); xTo(e.clientX); yTo(e.clientY);
      if (!live) { gsap.ticker.add(tick); live = true; }
    }, { passive: true, signal: ac.signal });
    // leave — dot size (px) after leaving a link. The original writes .5rem as 0.5px, so after leaving the dot almost vanishes and only the band remains
    const leave = options.leave != null ? +options.leave : null;
    document.addEventListener("mouseover", (e) => { const a = e.target.closest?.("a, button"); if (a && !a.contains(e.relatedTarget)) { dot.style.width = dot.style.height = ""; dot.classList.add("is-link"); } }, on);
    document.addEventListener("mouseout", (e) => { const a = e.target.closest?.("a, button"); if (a && !a.contains(e.relatedTarget)) { dot.classList.remove("is-link"); if (leave != null) dot.style.width = dot.style.height = `${leave}px`; } }, on);
    document.addEventListener("mouseleave", stop, on);
    addEventListener("blur", stop, on);
    return () => { ac.abort(); gsap.ticker.remove(tick); xTo.tween.kill(); yTo.tween.kill(); cv.remove(); dot.remove(); };
  });
})();
