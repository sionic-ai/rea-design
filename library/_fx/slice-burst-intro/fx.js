// slice-burst-intro — the big image at the center of the Hero (fruit, logo) swells to 1.3x and bursts after .45s (.4s), and small pieces inside it
// Flies in an arc around to the scatter position, then lands in place (list icon position) (2s, each piece .04s later). Once all settle, the white curtain lifts in .6s.
(() => {
  const DESKTOP = [[0.149, 0.277, -20], [0.329, 0.371, 15], [0.172, 0.658, 10], [0.799, 0.287, 20], [0.605, 0.5, 0], [0.799, 0.653, -15]];
  const MOBILE = [[0.24, 0.24, -20], [0.72, 0.3, 15], [0.26, 0.48, 10], [0.74, 0.55, 20], [0.3, 0.74, 0], [0.7, 0.8, -15]];
  kfFx.register("slice-burst-intro", (el, { options, reduce }) => {
    const burst = el.querySelector('[data-fx-part="burst"]');
    const slices = [...el.querySelectorAll('[data-fx-part="slice"]')];
    const root = document.documentElement;
    const dur = +(options.dur ?? 2000), gap = +(options.gap ?? 40), delay = +(options.delay ?? 300);
    const burstDelay = +(options["burst-delay"] ?? 450), burstDur = +(options["burst-dur"] ?? 400);
    const nav = performance.getEntriesByType("navigation")[0];
    const anims = [];
    let timer = 0, alive = true;
    const settle = () => {
      el.dataset.intro = "done";
      anims.forEach((a) => a.cancel());
      root.style.overflow = "";
      timer = setTimeout(() => { if (alive) el.dataset.intro = "settled"; }, 450);
    };
    if (!slices.length || reduce || (nav && nav.type === "back_forward")) { el.dataset.intro = "settled"; return; }
    el.dataset.intro = "loading";
    const start = () => {
      if (!alive) return;
      root.style.overflow = "hidden";
      const mobile = matchMedia("(max-width: 767.98px)").matches;
      const points = mobile ? MOBILE : DESKTOP;
      const sliceMax = innerWidth <= 767.98 ? 70 : innerWidth <= 991.98 ? 105 : 150;
      const pr = burst ? burst.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
      const pcx = pr.left + pr.width / 2, pcy = pr.top + pr.height / 2;
      if (burst) {
        const b = burst.animate([{ transform: "translate(-50%, -50%) scale(1)", opacity: 1 }, { transform: "translate(-50%, -50%) scale(1.3)", opacity: 0 }],
          { duration: burstDur, delay: burstDelay, easing: "ease-in-out", fill: "forwards" });
        anims.push(b);
      }
      let finished = 0;
      slices.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        if (!r.width) { finished++; return; }
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const toX = pcx - cx, toY = pcy - cy;
        const [px, py, spin] = points[i % points.length];
        const sx = px * innerWidth - cx, sy = py * innerHeight - cy;
        const t = getComputedStyle(s).transform;
        const place = t && t !== "none" ? t : "";
        const big = (sliceMax - (i % 6) * 4) / r.width;
        const pR = pr.width / 2;
        const dx = sx - toX, dy = sy - toY, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
        const x0 = toX + ux * pR * 0.32, y0 = toY + uy * pR * 0.32;
        const arc = (len * 0.22 + (mobile ? 32 : 70)) * (i % 2 ? 1 : -1);
        const ax = x0 + (sx - x0) * 0.55 - uy * arc, ay = y0 + (sy - y0) * 0.55 + ux * arc;
        const a = s.animate([
          { transform: `translate(${x0}px, ${y0}px) ${place} rotate(${spin - 150}deg) scale(${big * 0.45})`, opacity: 0, offset: 0, easing: "cubic-bezier(0.33, 0, 0.3, 1)" },
          { transform: `translate(${x0}px, ${y0}px) ${place} rotate(${spin - 125}deg) scale(${big * 0.7})`, opacity: 1, offset: 0.08, easing: "cubic-bezier(0.5, 0, 1, 0.5)" },
          { transform: `translate(${ax}px, ${ay}px) ${place} rotate(${spin - 50}deg) scale(${big * 1.04})`, opacity: 1, offset: 0.34, easing: "cubic-bezier(0, 0.5, 0.4, 1)" },
          { transform: `translate(${sx}px, ${sy}px) ${place} rotate(${spin}deg) scale(${big})`, opacity: 1, offset: 0.62, easing: "cubic-bezier(0.22, 1, 0.32, 1)" },
          { transform: `translate(0px, 0px) ${place} scale(1)`, opacity: 1, offset: 1 },
        ], { duration: dur, delay: delay + i * gap, fill: "both" });
        a.onfinish = () => { if (++finished === slices.length) settle(); };
        anims.push(a);
      });
      if (finished === slices.length) settle();
    };
    const raf = requestAnimationFrame(start);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      anims.forEach((a) => a.cancel());
      root.style.overflow = "";
      delete el.dataset.intro;
    };
  });
})();
