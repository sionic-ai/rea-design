// Manifesto — the app icon grid printed in dot characters (4px cells), with a few cells slowly blinking (the original artwork slot)
(() => {
  const cv = document.querySelector(".as-term__art");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height, C = 4;
  const ink = getComputedStyle(document.documentElement).getPropertyValue("--kf-contrast-ink").trim();
  const off = document.createElement("canvas");
  off.width = W; off.height = H;
  const o = off.getContext("2d");
  o.fillStyle = "#fff"; /* Not skin: white ink that only measures shape on an off-screen plate */
  const shapes = [
    (x, y, s) => { o.beginPath(); o.arc(x + s / 2, y + s / 2, s / 2.4, 0, 7); o.fill(); },
    (x, y, s) => { o.fillRect(x + s * 0.1, y + s * 0.1, s * 0.8, s * 0.8); },
    (x, y, s) => { o.beginPath(); o.moveTo(x + s / 2, y); o.lineTo(x + s, y + s); o.lineTo(x, y + s); o.fill(); },
    (x, y, s) => { o.fillRect(x, y + s * 0.2, s, s * 0.18); o.fillRect(x, y + s * 0.5, s, s * 0.18); o.fillRect(x, y + s * 0.8, s * 0.6, s * 0.18); },
    (x, y, s) => { o.beginPath(); o.arc(x + s * 0.35, y + s / 2, s * 0.3, 0, 7); o.arc(x + s * 0.7, y + s / 2, s * 0.25, 0, 7); o.fill(); },
  ];
  const S = 48, G = 18;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 10; c++) {
    if ((r * 7 + c * 3) % 9 === 0) continue;
    shapes[(r * 10 + c) % shapes.length](c * (S + G) + 6, r * (S + 8) + 4, S - (r % 2) * 6);
  }
  const mask = o.getImageData(0, 0, W, H).data;
  const cells = [];
  for (let y = 0; y < H; y += C) for (let x = 0; x < W; x += C) {
    const a = mask[(y * W + x) * 4 + 3];
    const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]][(y / C) % 4][(x / C) % 4] / 16;
    cells.push({ x, y, on: a > 0, base: a > 0 ? 0.55 + 0.4 * (bayer > 0.5) : (bayer > 0.94 ? 0.12 : 0) });
  }
  const draw = (t) => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = ink;
    for (const c of cells) {
      if (!c.base) continue;
      const flick = c.on && Math.sin(t / 900 + c.x * 0.07 + c.y * 0.11) > 0.96 ? 0.3 : 1;
      ctx.globalAlpha = c.base * flick * 0.6;
      ctx.fillRect(c.x, c.y, C - 1, C - 1);
    }
    ctx.globalAlpha = 1;
  };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { draw(0); return; }
  gsap.ticker.add(() => draw(performance.now()));
})();
