// White bubbles float up on the canvas. Endless: while the panel is visible, len bubbles start in the lower half and rise forever, re-entering from the bottom after exiting the top.
// scroll — when scrolling down, float len items up from the bottom of the screen and don’t float more for cooldown seconds (original Brand BubbleUp·EndlessBubbleUp)
// Size·speed scale with the board size (width/1600·height/900), opacity .4, each bubble rotates -1~1 °/frame. Color is --kf-surface (white bubble)
(() => {
  const rnd = (a, b) => Math.random() * (b - a) + a;
  kfFx.register("bubble-rise", (el, { options, reduce }) => {
    if (!(el instanceof HTMLCanvasElement) || reduce) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const endless = (options.mode || "endless") !== "scroll";
    const fixed = (options.look || "") === "fixed";
    const o = {
      len: +(options.len || (endless ? 10 : 5)),
      sMin: +(options["size-min"] ?? 5), sMax: +(options["size-max"] ?? (endless ? 120 : 100)),
      vMin: +(options["speed-min"] ?? (endless ? 1 : 5)), vMax: +(options["speed-max"] ?? (endless ? 3 : 10)),
      alpha: +(options.alpha ?? 0.4), cool: +(options.cooldown ?? 2),
    };
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, inView = !endless, bubbles = [], waiting = false, prevY = scrollY, timer = 0;
    const color = () => getComputedStyle(el).getPropertyValue("--kf-surface").trim() || "white";
    let ink = color();
    const make = (startLow) => ({
      size: rnd(o.sMin, o.sMax) * (W / 1600), speed: rnd(o.vMin, o.vMax) * (H / 900),
      x: rnd(0, W), y: startLow ? rnd(H / 2, H) : H + (o.sMax * (W / 1600)) / 2, rot: rnd(0, 360), rs: rnd(-1, 1),
    });
    const resize = () => {
      const host = fixed ? null : el.parentElement;
      W = fixed ? innerWidth : host.offsetWidth;
      H = fixed ? innerHeight : host.offsetHeight;
      el.width = Math.max(1, W * pr);
      el.height = Math.max(1, H * pr);
      el.style.width = W + "px";
      el.style.height = H + "px";
      ctx.setTransform(pr, 0, 0, pr, 0, 0);
      ink = color();
    };
    const drawOne = (b) => {
      const r = Math.max(0.5, b.size / 2);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate((b.rot * Math.PI) / 180);
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      ctx.lineWidth = Math.max(0.6, r * 0.06);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha *= 0.25; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha /= 0.25; ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.35, r * 0.28, Math.PI * 1.05, Math.PI * 1.6); ctx.lineWidth *= 1.6; ctx.stroke();
      ctx.restore();
    };
    let last = 0;
    const tick = (now) => {
      if (!last) last = now;
      const dt = Math.max(1, now - last);
      last = now;
      if (!inView || !bubbles.length) return;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = o.alpha;
      for (const b of bubbles) {
        drawOne(b);
        b.y -= b.speed * dt * 0.05;
        b.rot += b.rs * dt;
        if (endless && b.y + b.size / 2 < 0) { b.y = H + b.size / 2; b.x = rnd(0, W); }
      }
      if (!endless) bubbles = bubbles.filter((b) => b.y + b.size / 2 > 0);
    };
    let raf = 0;
    const loop = (t) => { tick(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    resize();
    const ro = new ResizeObserver(resize);
    if (!fixed && el.parentElement) ro.observe(el.parentElement);
    addEventListener("resize", resize);
    let io = null;
    if (endless) {
      for (let i = 0; i < o.len; i++) bubbles.push(make(true));
      io = new IntersectionObserver((es) => es.forEach((e) => { inView = e.isIntersecting; if (!inView) ctx.clearRect(0, 0, W, H); }));
      io.observe(el.parentElement || el);
    }
    const onScroll = () => {
      const y = scrollY, d = y - prevY;
      prevY = y;
      if (d < 0 || waiting) return;
      waiting = true;
      timer = setTimeout(() => (waiting = false), o.cool * 1000);
      for (let i = 0; i < o.len; i++) bubbles.push(make(false));
    };
    if (!endless) addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      ro.disconnect();
      io?.disconnect();
      removeEventListener("resize", resize);
      removeEventListener("scroll", onScroll);
      ctx.clearRect(0, 0, el.width, el.height);
    };
  });
})();
