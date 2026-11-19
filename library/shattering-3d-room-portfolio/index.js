// Home start order — first visit gets the orbit loader (dark disc · 88px grid · stars · two orbits · orbiting dot · falling dot and ripple · number), arrivals from a handoff or return visits get the transition curtain.
// Original values (read from the loader timeline): orbit radius 112·64 × min(width,height)/340, dot one lap 1.5s power3.inOut (after .03s), tail .4s on · .5s off,
// 1.75s dot drops from 112 above to center .62s power4.in, 1.65s ripple .95s expo.out, 2.6s ring .7s expo.out, 2.85s light rays (From idea), 4.05s focus corners 78→15 (Through design), 5.98s big circle 4.5→30 · ticks (To business), 7.2s small orbit, 8.9s white light · number reaches 100 at 9.2s
(() => {
  const root = document.documentElement, loader = document.getElementById("orbit-loader");
  const fromNav = sessionStorage.getItem("ri:nav") === "1", seen = sessionStorage.getItem("ri:seen") === "1";
  const go = () => { RI.after(); RI.roomIntro?.(); };
  if (RI.reduced || fromNav || seen || !loader) { loader?.setAttribute("hidden", ""); if (RI.reduced) go(); else RI.arrive().then(go); return; }
  sessionStorage.setItem("ri:seen", "1");
  root.classList.add("ol-on", "ri-covered");

  const cv = loader.querySelector(".ol-canvas"), x = cv.getContext("2d"), num = loader.querySelector("[data-ol-num]"), bar = loader.querySelector("[data-ol-bar]"), cap = loader.querySelector("[data-ol-cap]");
  const flash = document.createElement("i");
  flash.className = "ol-flash";
  loader.append(flash);
  const ink = getComputedStyle(loader).color;
  let W = 0, H = 0, dpr = 1, k = 1, back = null;
  const stars = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random(), r: 0.4 + Math.random() * 0.9, a: 0.06 + Math.random() * 0.3, ph: Math.random() * 6.28, sp: 0.3 + Math.random() * 1.2 }));
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; k = Math.min(W, H) / 340;
    cv.width = W * dpr; cv.height = H * dpr;
    back = document.createElement("canvas"); back.width = W; back.height = H;
    const b = back.getContext("2d");
    b.strokeStyle = ink; b.globalAlpha = 0.022; b.lineWidth = 1;
    for (let p = (W / 2) % 88; p < W; p += 88) { b.beginPath(); b.moveTo(p + 0.5, 0); b.lineTo(p + 0.5, H); b.stroke(); }
    for (let p = (H / 2) % 88; p < H; p += 88) { b.beginPath(); b.moveTo(0, p + 0.5); b.lineTo(W, p + 0.5); b.stroke(); }
    b.globalAlpha = 0.05; b.fillStyle = ink;
    for (let i = 0; i < 26; i++) b.fillRect(Math.random() * W, Math.random() * H, Math.random() < 0.5 ? 3 : 1, 1);
  }
  size();
  addEventListener("resize", size);
  const p3io = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const p4in = (t) => t ** 4;
  const eo = (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));
  const seg = (t, a, d) => Math.min(1, Math.max(0, (t - a) / d));
  const t0 = performance.now();
  let raf = 0, done = false;
  function draw() {
    const t = (performance.now() - t0) / 1000;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, W, H);
    x.drawImage(back, 0, 0);
    x.fillStyle = ink; x.strokeStyle = ink;
    stars.forEach((s) => { x.globalAlpha = s.a * (0.6 + 0.4 * Math.sin(t * s.sp + s.ph)); x.beginPath(); x.arc(s.x * W, s.y * H, s.r, 0, 6.28); x.fill(); });
    const cx = W / 2, cy = H / 2, zoom = 1 + 0.05 * Math.sin(Math.min(1, t / 3.3) * Math.PI / 2);
    x.save(); x.translate(cx, cy); x.scale(zoom, zoom);
    const r1 = 112 * k * 0.6, r2 = 64 * k * 0.6;
    const a1 = 1 - seg(t, 1.9, 0.5);
    x.globalAlpha = 0.28 * a1; x.lineWidth = 1;
    x.beginPath(); x.arc(0, 0, r1, 0, 6.28); x.stroke();
    x.beginPath(); x.arc(0, 0, r2, 0, 6.28); x.stroke();
    x.globalAlpha = 0.5 * a1; x.beginPath(); x.moveTo(-6, 0); x.lineTo(6, 0); x.moveTo(0, -6); x.lineTo(0, 6); x.stroke();
    // One lap of the dot — leaving a tail
    const sweep = p3io(seg(t, 0.03, 1.5)), th = -Math.PI / 2 + sweep * 6.28;
    const trail = seg(t, 0.05, 0.4) * 0.5 * (1 - seg(t, 1.15, 0.5));
    if (t < 1.55) {
      x.globalAlpha = trail; x.lineWidth = 4.6 * 0.6;
      x.beginPath(); x.arc(0, 0, r1, th - 0.9 * Math.min(1, sweep * 4), th); x.stroke();
      x.globalAlpha = 1; x.beginPath(); x.arc(Math.cos(th) * r1, Math.sin(th) * r1, 4.5 * 0.9, 0, 6.28); x.fill();
    } else {
      // Drops from the top to the center and ripples spread out
      const fall = p4in(seg(t, 1.75, 0.62)), y = -112 * k * 0.6 * (1 - fall);
      x.globalAlpha = 1 - seg(t, 2.78, 0.3); x.beginPath(); x.arc(0, y, 4.5 * 0.9, 0, 6.28); x.fill();
      const rp = eo(seg(t, 1.65, 0.95));
      x.globalAlpha = 0.4 * (1 - rp); x.lineWidth = 1; x.beginPath(); x.arc(0, 0, rp * r1 * 1.4, 0, 6.28); x.stroke();
      const ring = eo(seg(t, 2.6, 0.7));
      if (ring > 0) { x.globalAlpha = 0.6 * (1 - seg(t, 3.9, 0.5)); x.beginPath(); x.arc(0, 0, r2 * 0.6 + ring * r2 * 0.6, 0, 6.28 * ring); x.stroke(); }
    }
    // Light beam: a cone spreading from the center to the right point (From idea)
    const cone = seg(t, 2.9, 0.3) * (1 - seg(t, 3.72, 0.3));
    if (cone > 0) { const hx = 130 * k * 0.6 * eo(seg(t, 2.85, 1.05)); x.globalAlpha = 0.5 * cone; x.beginPath(); x.moveTo(0, 0); x.lineTo(hx, -18 * k * 0.6); x.lineTo(hx, 18 * k * 0.6); x.closePath(); x.fill(); x.globalAlpha = cone; x.beginPath(); x.arc(hx, 0, 4.5 * 0.9, 0, 6.28); x.fill(); }
    // Focus ring and four corners (Through design)
    const focus = seg(t, 4.05, 0.25) * (1 - seg(t, 4.82, 0.3));
    if (focus > 0) { const b = (78 - 63 * eo(seg(t, 4.05, 0.8))) * k * 0.4; x.globalAlpha = 0.7 * focus; x.setLineDash([3, 4]); x.beginPath(); x.arc(0, 0, b * 1.3, 0, 6.28); x.stroke(); x.setLineDash([]); for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { x.beginPath(); x.moveTo(sx * b, sy * b * 0.6); x.lineTo(sx * b, sy * b); x.lineTo(sx * b * 0.6, sy * b); x.stroke(); } }
    // Big circle, tick ring and orbiting dot (To business)
    const planet = seg(t, 5.95, 0.4) * (1 - seg(t, 6.95, 0.25));
    if (planet > 0) { const pr = (4.5 + 25.5 * eo(seg(t, 5.98, 0.95))) * k * 0.9; x.globalAlpha = 0.75 * planet; x.beginPath(); x.arc(0, 0, pr, 0, 6.28); x.fill(); x.globalAlpha = 0.4 * planet; x.beginPath(); x.arc(0, 0, r1 * 1.4, 0, 6.28); x.stroke(); const ticks = seg(t, 6.3, 0.5); for (let i = 0; i < 60 * ticks; i++) { const a = (i / 60) * 6.28; x.beginPath(); x.moveTo(Math.cos(a) * pr * 1.25, Math.sin(a) * pr * 1.25); x.lineTo(Math.cos(a) * pr * 1.4, Math.sin(a) * pr * 1.4); x.stroke(); } const oa = 2.9 - 1.7 * p3io(seg(t, 6.2, 0.75)); x.globalAlpha = planet; x.beginPath(); x.arc(Math.cos(oa) * r1 * 1.4, Math.sin(oa) * r1 * 1.4, 3, 0, 6.28); x.fill(); }
    // End — a dot circles a small orbit (near 97%)
    const tail = seg(t, 7.1, 0.3) * (1 - seg(t, 8.9, 0.3));
    if (tail > 0) { const rr = r2 * 0.75, oa = -Math.PI / 2 + p3io(seg(t, 7.2, 1.4)) * 6.28; x.globalAlpha = 0.6 * tail; x.beginPath(); x.arc(0, 0, rr, 0, 6.28); x.stroke(); x.beginPath(); x.moveTo(-5, -5); x.lineTo(5, 5); x.moveTo(5, -5); x.lineTo(-5, 5); x.stroke(); x.globalAlpha = tail; x.beginPath(); x.arc(Math.cos(oa) * rr, Math.sin(oa) * rr, 3.5, 0, 6.28); x.fill(); }
    x.restore();
    x.globalAlpha = 1;
    cap.textContent = t > 7.0 ? "" : t > 5.9 ? "To business" : t > 4 ? "Through design" : t > 2.5 ? "From idea" : "";
    flash.style.opacity = (0.9 * seg(t, 8.9, 0.5)).toFixed(3);
    const pr = Math.round(100 * (1 - (1 - Math.min(1, t / 9.2)) ** 1.6));
    num.textContent = String(pr).padStart(3, "0");
    bar.style.transform = `scaleX(${pr / 100})`;
    if (pr >= 100 && !done && t > 9.4) { done = true; finish(); }
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
  function finish() {
    loader.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "forwards" }).finished.then(() => {
      cancelAnimationFrame(raf);
      loader.hidden = true;
      root.classList.remove("ol-on", "ri-covered");
    });
    setTimeout(go, 180);
  }
})();
