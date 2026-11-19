/* Photo slot art — instead of the original cutout photos and products, draws our own shapes of the same position, size and silhouette ratio in skin colors. 
   The depth plate (depth-tilt-photo) blurs this canvas’s alpha and uses it as depth, so keep the background transparent. Write in the lower strip what photo it is. */
(() => {
  const kf = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const grad = (x, w, h, a, b) => { const g = x.createLinearGradient(0, 0, w * 0.4, h); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  // The original sunglasses are a single wrap-around shield lens (top rim arched like a bow, notch at the nose) — rim, lens, lens mask and bundle light all share the same shape
  const shield = (w, h, sx = 1, sy = 1, dy = 0) => {
    const p = new Path2D(), cx = w * 0.5, cy = h * 0.298;
    const P = (u, v) => [cx + (w * u - cx) * sx, cy + (h * v - cy) * sy + h * dy];
    const m = (...a) => p.moveTo(...P(...a)), b = (a, c, d, e, f, g) => p.bezierCurveTo(...P(a, c), ...P(d, e), ...P(f, g)), q = (a, c, d, e) => p.quadraticCurveTo(...P(a, c), ...P(d, e));
    m(0.285, 0.272);
    b(0.36, 0.25, 0.64, 0.25, 0.715, 0.272);
    b(0.724, 0.29, 0.717, 0.31, 0.7, 0.323);
    b(0.67, 0.344, 0.59, 0.347, 0.556, 0.327);
    q(0.5, 0.291, 0.444, 0.327);
    b(0.41, 0.347, 0.33, 0.344, 0.3, 0.323);
    b(0.283, 0.31, 0.276, 0.29, 0.285, 0.272);
    p.closePath();
    return p;
  };
  const lens = (w, h) => shield(w, h, 0.95, 0.76, 0.006);
  const shapes = {
    portrait(x, w, h) {
      const body = new Path2D();
      body.moveTo(0, h); body.bezierCurveTo(w * 0.04, h * 0.7, w * 0.3, h * 0.66, w * 0.4, h * 0.62);
      body.lineTo(w * 0.42, h * 0.5); body.ellipse(w / 2, h * 0.32, w * 0.2, h * 0.22, 0, Math.PI * 0.72, Math.PI * 2.28);
      body.lineTo(w * 0.6, h * 0.62); body.bezierCurveTo(w * 0.7, h * 0.66, w * 0.96, h * 0.7, w, h); body.closePath();
      x.fillStyle = grad(x, w, h, kf("--kf-accent-soft"), kf("--kf-raised"));
      x.fill(body);
      // The original photo has braided hair, denim and necklace texture across the whole face, so cursor tilt and push show over the whole panel — a pushed silhouette only changes at the edge, so we draw texture lines in the same place
      x.save(); x.clip(body);
      x.strokeStyle = kf("--kf-dim"); x.lineCap = "round";
      x.globalAlpha = 0.45; x.lineWidth = w * 0.007;
      for (let i = 0; i < 26; i++) {
        const a = Math.PI * (-0.62 + (1.24 * i) / 25), sx = w / 2 + Math.sin(a) * w * 0.19, sy = h * 0.32 - Math.cos(a) * h * 0.21, side = Math.abs(Math.sin(a)) > 0.5;
        x.beginPath(); x.moveTo(sx, sy);
        if (side) x.bezierCurveTo(sx + Math.sin(a) * w * 0.03, sy + h * 0.1, sx + Math.sin(a) * w * 0.02, h * 0.42, sx + Math.sin(a) * w * 0.04, h * 0.6);
        else x.quadraticCurveTo(w / 2 + Math.sin(a) * w * 0.12, h * 0.16, w / 2 + Math.sin(a) * w * 0.14, h * 0.2);
        x.stroke();
      }
      x.globalAlpha = 0.22; x.lineWidth = w * 0.004;
      for (let k = -h; k < w + h; k += w * 0.022) { x.beginPath(); x.moveTo(k, h * 0.64); x.lineTo(k + h * 0.36, h); x.stroke(); }
      x.globalAlpha = 0.45; x.lineWidth = w * 0.006;
      x.beginPath(); x.moveTo(w * 0.49, h * 0.34); x.quadraticCurveTo(w * 0.47, h * 0.4, w * 0.455, h * 0.415); x.quadraticCurveTo(w * 0.5, h * 0.43, w * 0.545, h * 0.415); x.stroke();
      x.beginPath(); x.ellipse(w / 2, h * 0.455, w * 0.065, h * 0.014, 0, 0, Math.PI * 2); x.stroke();
      for (let i = -3; i <= 3; i++) { x.beginPath(); x.moveTo(w * (0.5 + i * 0.022), h * 0.53); x.lineTo(w * (0.5 + i * 0.026), h * 0.6); x.stroke(); }
      x.fillStyle = kf("--kf-dim"); x.globalAlpha = 0.45;
      for (let yy = h * 0.4; yy < h * 0.53; yy += w * 0.014)
        for (let xx = w * 0.36; xx < w * 0.64; xx += w * 0.014) {
          const u = (xx - w / 2) / (w * 0.15), v = (yy - h * 0.47) / (h * 0.075);
          if (u * u + v * v < 1 && Math.abs(yy - h * 0.455) > h * 0.012) { x.beginPath(); x.arc(xx, yy, w * 0.0034, 0, Math.PI * 2); x.fill(); }
        }
      x.restore();
      x.fillStyle = kf("--site-ink");
      x.fill(shield(w, h));
      x.fillStyle = grad(x, w, h, kf("--kf-accent"), kf("--kf-accent-soft"));
      x.fill(lens(w, h));
      x.strokeStyle = kf("--kf-ink-soft"); x.lineWidth = w * 0.014;
      x.setLineDash([w * 0.018, w * 0.008]);
      for (let i = 0; i < 2; i++) { x.beginPath(); x.ellipse(w / 2, h * (0.6 + i * 0.04), w * (0.13 + i * 0.03), h * 0.06, 0, 0, Math.PI); x.stroke(); }
      x.setLineDash([]);
    },
    // Deeply carved lens mask — the reflection image shows only on white (same size as the portrait)
    "portrait-lens"(x, w, h) { x.fillStyle = "white"; x.fill(lens(w, h)); },
    // Bundle light over the lens (overlay) — a top rim, a bright band below, and two slanted light streaks
    "portrait-sheen"(x, w, h) {
      const L = lens(w, h);
      x.save(); x.clip(L);
      const top = x.createLinearGradient(0, h * 0.262, 0, h * 0.3);
      top.addColorStop(0, kf("--kf-contrast-bg")); top.addColorStop(1, "transparent");
      x.globalAlpha = 0.7; x.fillStyle = top; x.fillRect(0, h * 0.25, w, h * 0.06);
      x.fillStyle = kf("--kf-contrast-bg");
      [[0.36, 0.035, 0.45], [0.6, 0.018, 0.3]].forEach(([u, bw, a]) => {
        x.globalAlpha = a;
        x.beginPath(); x.moveTo(w * u, h * 0.24); x.lineTo(w * (u + bw), h * 0.24); x.lineTo(w * (u + bw - 0.07), h * 0.36); x.lineTo(w * (u - 0.07), h * 0.36); x.closePath(); x.fill();
      });
      x.restore();
    },
    // Lens corner Brand spot (multiply): outside top of the left lens
    "portrait-logo"(x, w, h) { x.strokeStyle = kf("--site-ink"); x.lineWidth = w * 0.004; x.beginPath(); x.ellipse(w * 0.322, h * 0.284, w * 0.012, h * 0.006, 0, 0, Math.PI * 2); x.stroke(); },
    shoe(x, w, h) {
      x.fillStyle = grad(x, w, h, kf("--kf-ink-soft"), kf("--kf-accent-soft"));
      x.beginPath(); x.moveTo(w * 0.14, h * 0.62); x.bezierCurveTo(w * 0.2, h * 0.3, w * 0.36, h * 0.24, w * 0.44, h * 0.3);
      x.bezierCurveTo(w * 0.56, h * 0.42, w * 0.78, h * 0.5, w * 0.88, h * 0.62); x.bezierCurveTo(w * 0.9, h * 0.72, w * 0.7, h * 0.74, w * 0.2, h * 0.72); x.closePath(); x.fill();
      x.fillStyle = kf("--kf-raised");
      for (let i = 0; i < 6; i++) x.fillRect(w * (0.24 + i * 0.1), h * 0.72, w * 0.03, h * 0.05);
    },
    duo(x, w, h) {
      [[-0.06, 0.3, 0.42], [0.05, 0.58, 0.5]].forEach(([r, cx, cy]) => {
        x.save(); x.translate(w * cx, h * cy); x.rotate(r);
        x.fillStyle = kf("--kf-ink"); x.fillRect(-w * 0.17, -h * 0.34, w * 0.34, h * 0.62);
        x.fillStyle = grad(x, w, h, kf("--kf-dim"), kf("--kf-raised")); x.fillRect(-w * 0.15, -h * 0.31, w * 0.3, h * 0.48);
        x.restore();
      });
    },
    bust(x, w, h) {
      x.fillStyle = grad(x, w, h, kf("--kf-accent"), kf("--kf-accent-soft"));
      x.beginPath(); x.moveTo(w * 0.1, h); x.bezierCurveTo(w * 0.14, h * 0.7, w * 0.36, h * 0.66, w * 0.44, h * 0.62);
      x.ellipse(w * 0.5, h * 0.36, w * 0.13, h * 0.24, 0, Math.PI * 0.7, Math.PI * 2.3);
      x.lineTo(w * 0.56, h * 0.62); x.bezierCurveTo(w * 0.66, h * 0.66, w * 0.88, h * 0.7, w * 0.92, h); x.closePath(); x.fill();
    },
    boxes(x, w, h) {
      [[0.2, 0.2, -0.05], [0.5, 0.12, 0], [0.78, 0.2, 0.05]].forEach(([cx, top, r], i) => {
        x.save(); x.translate(w * cx, h * 0.55); x.rotate(r);
        x.fillStyle = grad(x, w, h, i === 1 ? kf("--kf-ink-soft") : kf("--kf-accent"), kf("--kf-accent-soft"));
        x.fillRect(-w * 0.13, -h * (0.55 - top), w * 0.26, h * 0.82); x.restore();
      });
    },
    profile(x, w, h) {
      x.fillStyle = grad(x, w, h, kf("--kf-raised"), kf("--kf-accent-soft"));
      x.beginPath(); x.moveTo(w * 0.3, h); x.bezierCurveTo(w * 0.32, h * 0.7, w * 0.3, h * 0.5, w * 0.36, h * 0.3);
      x.bezierCurveTo(w * 0.44, h * 0.1, w * 0.66, h * 0.08, w * 0.72, h * 0.24); x.lineTo(w * 0.78, h * 0.4); x.lineTo(w * 0.72, h * 0.46);
      x.bezierCurveTo(w * 0.72, h * 0.6, w * 0.62, h * 0.66, w * 0.6, h); x.closePath(); x.fill();
      x.fillStyle = kf("--kf-accent"); x.fillRect(w * 0.5, h * 0.24, w * 0.26, h * 0.04);
    },
    phones(x, w, h) {
      x.strokeStyle = kf("--kf-ink-soft"); x.lineWidth = w * 0.06; x.lineCap = "round";
      x.beginPath(); x.arc(w / 2, h * 0.5, w * 0.24, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
      x.fillStyle = grad(x, w, h, kf("--kf-ink"), kf("--kf-ink-soft"));
      x.beginPath(); x.ellipse(w * 0.27, h * 0.62, w * 0.09, h * 0.17, 0, 0, 7); x.fill();
      x.beginPath(); x.ellipse(w * 0.73, h * 0.62, w * 0.09, h * 0.17, 0, 0, 7); x.fill();
    },
    cleat(x, w, h) { shapes.shoe(x, w, h); },
    ball(x, w, h) {
      x.fillStyle = grad(x, w, h, kf("--kf-raised"), kf("--kf-bg"));
      x.beginPath(); x.ellipse(w / 2, h / 2, w * 0.36, h * 0.24, 0, 0, 7); x.fill();
      x.strokeStyle = kf("--kf-ink"); x.lineWidth = w * 0.012;
      x.beginPath(); x.moveTo(w * 0.36, h * 0.3); x.lineTo(w * 0.64, h * 0.3); x.stroke();
      for (let i = 0; i < 7; i++) { x.beginPath(); x.moveTo(w * (0.38 + i * 0.04), h * 0.27); x.lineTo(w * (0.38 + i * 0.04), h * 0.33); x.stroke(); }
    },
    jersey(x, w, h) {
      x.fillStyle = grad(x, w, h, kf("--kf-accent"), kf("--kf-accent-soft"));
      x.beginPath(); x.moveTo(w * 0.3, h * 0.18); x.lineTo(w * 0.42, h * 0.14); x.quadraticCurveTo(w / 2, h * 0.22, w * 0.58, h * 0.14); x.lineTo(w * 0.7, h * 0.18);
      x.lineTo(w * 0.86, h * 0.36); x.lineTo(w * 0.76, h * 0.44); x.lineTo(w * 0.72, h * 0.4); x.lineTo(w * 0.72, h * 0.86); x.lineTo(w * 0.28, h * 0.86); x.lineTo(w * 0.28, h * 0.4); x.lineTo(w * 0.24, h * 0.44); x.lineTo(w * 0.14, h * 0.36); x.closePath(); x.fill();
      x.fillStyle = kf("--kf-ink"); x.font = `${Math.round(h * 0.22)}px ${kf("--kf-font-display")}`; x.textAlign = "center"; x.fillText("00", w / 2, h * 0.62);
    },
  };
  const paint = (c) => {
    const x = c.getContext("2d"), w = c.width, h = c.height, f = shapes[c.dataset.art];
    x.clearRect(0, 0, w, h);
    if (f) f(x, w, h);
    const label = c.dataset.label;
    if (label) {
      x.font = `500 ${Math.max(14, Math.round(w * 0.022))}px ${kf("--kf-font-mono")}`;
      x.fillStyle = kf("--kf-ink");
      x.globalAlpha = 0.7;
      x.textAlign = "left";
      x.fillText(label, w * 0.04, h - w * 0.03, w * 0.92);
      x.globalAlpha = 1;
    }
  };
  window.JJArt = { paint, shapes };
  document.querySelectorAll("canvas[data-art]").forEach(paint);
})();
