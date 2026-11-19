// Work image slot — the original drops work screens and illustrations onto a five-step ladder (base, rust, ember, amber, cream) with a 4×4 Bayer dither, so they read in CRT-tube colors.
// Here each work draws a different shape graphic in the skin color, then applies the same dither <img> Put it in (the image follows even when the sphere clones the card).
// data-raw is the original color without dither — the image the particle plate reads. Spots that sharpen, like the gallery’s center card, swap in eddyCover(i).raw
(() => {
  const css = getComputedStyle(document.documentElement), v = (n) => css.getPropertyValue(n).trim();
  const RAMP = ["--kf-bg", "--kf-accent-soft", "--kf-accent", "--kf-ink-soft", "--kf-ink"].map(v);
  const BRAND = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const rgbOf = (() => { const g = document.createElement("canvas").getContext("2d"); return (c) => { g.fillStyle = c; g.fillRect(0, 0, 1, 1); return [...g.getImageData(0, 0, 1, 1).data.slice(0, 3)]; }; })();
  const ramp = RAMP.map(rgbOf);
  const rand = (s) => () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 4294967295);

  // A different picture of the same texture for each work — mixing screen windows, circles, bands, and person silhouettes
  const paint = (g, i, S) => {
    const r = rand(i * 7919 + 13), C = (k) => RAMP[Math.max(0, Math.min(4, k))];
    const bg = g.createLinearGradient(0, 0, S, S);
    bg.addColorStop(0, C(1 + (i % 2))); bg.addColorStop(1, C(0));
    g.fillStyle = bg; g.fillRect(0, 0, S, S);
    for (let n = 0; n < 4 + (i % 3); n++) {
      g.fillStyle = C(2 + Math.floor(r() * 3));
      g.globalAlpha = 0.55 + r() * 0.45;
      const x = r() * S, y = r() * S, w = S * (0.2 + r() * 0.5);
      if (n % 3 === 0) { g.beginPath(); g.arc(x, y, w / 2, 0, Math.PI * 2); g.fill(); }
      else if (n % 3 === 1) { g.save(); g.translate(x, y); g.rotate((r() - 0.5) * 0.8); g.fillRect(-w / 2, -w / 3, w, w / 1.5); g.fillStyle = C(0); g.fillRect(-w / 2 + 6, -w / 3 + 14, w - 12, w / 1.5 - 20); g.fillStyle = C(4); g.fillRect(-w / 2, -w / 3, w, 8); g.restore(); }
      else { g.lineWidth = 6 + r() * 14; g.strokeStyle = g.fillStyle; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(S * 0.3, y - w, S * 0.7, y + w, S, y - w / 2); g.stroke(); }
    }
    g.globalAlpha = 1;
    if (i % 4 === 3) { g.fillStyle = C(3); g.beginPath(); g.arc(S * 0.5, S * 0.38, S * 0.14, 0, 7); g.fill(); g.beginPath(); g.ellipse(S * 0.5, S * 0.9, S * 0.3, S * 0.34, 0, 0, 7); g.fill(); }
  };
  const dither = (src, S) => {
    const c = document.createElement("canvas"); c.width = c.height = S;
    const g = c.getContext("2d"); g.drawImage(src, 0, 0);
    const im = g.getImageData(0, 0, S, S), d = im.data, cell = 2;
    for (let y = 0; y < S; y += cell) for (let x = 0; x < S; x += cell) {
      const o = (y * S + x) * 4, l = (d[o] * 0.299 + d[o + 1] * 0.587 + d[o + 2] * 0.114) / 255;
      const t = BRAND[((y / cell) % 4) * 4 + ((x / cell) % 4)] / 16 - 0.5;
      const k = Math.max(0, Math.min(4, Math.round(l * 4 + t * 0.9))), col = ramp[k];
      for (let yy = 0; yy < cell; yy++) for (let xx = 0; xx < cell; xx++) { const p = ((y + yy) * S + x + xx) * 4; d[p] = col[0]; d[p + 1] = col[1]; d[p + 2] = col[2]; d[p + 3] = 255; }
    }
    g.putImageData(im, 0, 0);
    return c.toDataURL();
  };
  const cache = new Map();
  const make = (i) => {
    if (cache.has(i)) return cache.get(i);
    const S = 256, c = document.createElement("canvas"); c.width = c.height = S;
    paint(c.getContext("2d"), i, S);
    const out = { raw: c.toDataURL(), dith: dither(c, S) };
    cache.set(i, out);
    return out;
  };
  document.querySelectorAll("img[data-cover]").forEach((img) => {
    const art = make(+img.dataset.cover);
    img.src = img.hasAttribute("data-raw") ? art.raw : art.dith;
  });
  window.eddyCover = make;
})();
