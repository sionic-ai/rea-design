(() => {
  // How the 19 channels are drawn — rebuilds the shape of the original channels (Prismic layers: background, middle, front) with three placeholder videos and canvas shapes.
  // Even the same video gets different zoom, position and tone per channel, so it looks like a different screen when switching
  const tv = window.jyTV;
  if (!tv) return;
  const vid = (k) => document.querySelector(`.jy-media video[data-media="${k}"]`);
  // Opened via file://, the video counts as another origin so the canvas gets tainted and the shader can’t upload textures — only then, draw a moving gray plate of the same ratio in place of the video
  const local = location.protocol === "file:";
  const standIn = (c, el, x, y, w, h) => {
    const s = performance.now() / 1000, seed = el.dataset.media.charCodeAt(0);
    const g = c.createLinearGradient(x, y + Math.sin(s * 0.7 + seed) * h * 0.3, x + w, y + h);
    g.addColorStop(0, tv.paper());
    g.addColorStop(0.5 + 0.3 * Math.sin(s * 0.5 + seed), tv.ink());
    g.addColorStop(1, tv.paper());
    c.save();
    c.globalAlpha = 0.45;
    c.fillStyle = g;
    c.fillRect(x, y, w, h);
    c.restore();
  };
  const cover = (c, el, W, H, zoom = 1, ox = 0, oy = 0) => {
    if (!el || el.readyState < 1) return;
    const vw = el.videoWidth || 16, vh = el.videoHeight || 9;
    const k = Math.max(W / vw, H / vh) * zoom, w = vw * k, h = vh * k, x = (W - w) / 2 + ox * W, y = (H - h) / 2 + oy * H;
    if (local) standIn(c, el, x, y, w, h);
    else if (el.readyState >= 2) c.drawImage(el, x, y, w, h);
  };
  const full = (k, o = {}) => (t) => {
    const { W, H } = t.size, c = t.ctx;
    c.save();
    c.filter = o.filter || "none";
    cover(c, vid(k), W, H, o.zoom ?? 1, o.ox ?? 0, o.oy ?? 0);
    c.restore();
  };

  // 8 — Round photo on the record (the original middle-layer photo)
  const record = (t, ms) => {
    const { W, H } = t.size, c = t.ctx;
    full("a", { filter: "brightness(.5)", zoom: 1.3 })(t);
    const R = Math.min(W, H) * 0.47, x = W / 2, y = H / 2;
    c.save();
    c.translate(x, y);
    c.rotate((ms / 1800) % (Math.PI * 2));
    c.fillStyle = t.paper();
    c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2); c.fill();
    c.strokeStyle = t.ink();
    c.globalAlpha = 0.08;
    for (let r = R * 0.38; r < R; r += R * 0.035) { c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke(); }
    c.globalAlpha = 1;
    c.beginPath(); c.arc(0, 0, R * 0.34, 0, Math.PI * 2); c.clip();
    c.filter = "contrast(1.4)";
    c.translate(-R * 0.35, -R * 0.35);
    cover(c, vid("c"), R * 0.7, R * 0.7, 1, 0, 0);
    c.restore();
  };

  // 11 — A single newspaper on a wooden table (still photo)
  const still = (t) => {
    const { W, H } = t.size, c = t.ctx;
    c.save();
    c.fillStyle = t.ink();
    c.globalAlpha = 0.22;
    c.fillRect(0, 0, W, H);
    c.globalAlpha = 0.08;
    for (let y = 0; y < H; y += H * 0.06) c.fillRect(0, y, W, H * 0.012);
    c.translate(W * 0.38, H * 0.52);
    c.rotate(-0.2);
    c.globalAlpha = 0.8;
    c.fillRect(-H * 0.24, -H * 0.32, H * 0.48, H * 0.64);
    c.fillStyle = t.paper();
    c.globalAlpha = 0.7;
    for (let i = 0; i < 7; i++) c.fillRect(-H * 0.2, -H * 0.26 + i * H * 0.07, H * (0.4 - (i % 3) * 0.06), H * 0.035);
    c.restore();
  };

  // 12 — Torn tape (each horizontal strip shifts on its own)
  const tear = (t, ms) => {
    const { W, H } = t.size, c = t.ctx, el = vid("c");
    if (!el || el.readyState < 1) return;
    const bands = 24;
    for (let i = 0; i < bands; i++) {
      const y0 = (i / bands) * H, bh = H / bands + 1;
      const off = Math.sin(i * 1.7 + ms / 260) * W * 0.04 * (i % 3 === 0 ? 3 : 1);
      c.save();
      c.beginPath(); c.rect(0, y0, W, bh); c.clip();
      c.filter = "contrast(1.6) brightness(1.2)";
      cover(c, el, W, H, 1.05, off / W, 0);
      c.restore();
    }
  };

  // 15 — Test screen (big text over a checkered strip)
  const card = (t) => {
    const { W, H, dpr } = t.size, c = t.ctx;
    c.save();
    c.fillStyle = t.ink();
    c.globalAlpha = 0.55;
    c.fillRect(0, 0, W, H);
    c.globalAlpha = 1;
    const bw = W * 0.42, bh = H * 0.22, bx = W * 0.29, by = H * 0.52, s = bh / 6;
    for (let r = 0; r < 6; r++) for (let q = 0; q < Math.ceil(bw / s); q++) { c.fillStyle = (r + q) % 2 ? t.ink() : t.paper(); c.fillRect(bx + q * s, by + r * s, s, s); }
    c.fillStyle = t.paper();
    c.fillRect(bx, by + s * 1.6, bw, s * 2.8);
    c.fillStyle = t.ink();
    c.font = `${s * 2.6}px ${t.mono()}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("CHANNEL 00", bx + bw / 2, by + s * 3.05 + dpr);
    c.restore();
  };

  // 18·19 — 4:3 video centered (black bars on both sides). 19 has a large closing text at the bottom right inside the video
  const boxed = (word) => (t) => {
    const { W, H } = t.size, c = t.ctx, h = H, w = h * (4 / 3), x = (W - w) / 2;
    c.save();
    c.fillStyle = t.ink();
    c.globalAlpha = 0.07;
    c.fillRect(x, 0, w, h);
    c.globalAlpha = 1;
    if (word) {
      c.font = `${h * 0.085}px ${t.mono()}`;
      c.textAlign = "right";
      c.textBaseline = "alphabetic";
      c.fillText(word, x + w * 0.89, h * 0.828);
    }
    c.restore();
  };

  tv.channels = [
    full("a", { filter: "contrast(1.5) brightness(1.3)", zoom: 1.2 }),
    full("b", { filter: "brightness(1.1)" }),
    full("c", { filter: "contrast(1.3)", zoom: 1.6, ox: 0.1 }),
    full("a", { filter: "grayscale(1) contrast(2)", zoom: 2 }),
    full("b", { filter: "grayscale(1) brightness(.8)", zoom: 1.4 }),
    full("c", { filter: "brightness(.8) contrast(1.6)", zoom: 1.2, oy: -0.05 }),
    full("b", { filter: "brightness(.6)", zoom: 2.2 }),
    record,
    full("c", { filter: "brightness(.7)", zoom: 1.1 }),
    full("a", { filter: "contrast(1.8) brightness(1.2)", zoom: 1.8 }),
    still,
    tear,
    full("c", { filter: "brightness(.45)", zoom: 1.3 }),
    full("b", { filter: "invert(1) brightness(.7)", zoom: 1.5 }),
    card,
    full("a", { filter: "contrast(1.2) brightness(.9)", zoom: 1.5, ox: -0.1 }),
    full("c", { filter: "brightness(.5) contrast(2)", zoom: 2.4 }),
    boxed(""),
    boxed("THE END"),
  ];
})();
