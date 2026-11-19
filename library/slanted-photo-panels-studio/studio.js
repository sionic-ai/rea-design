(() => {
  // Image · intro · nameplate rows turn on in turn at .15s intervals, 1s power1.inOut
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = [...document.querySelectorAll(".uv-reveal")];
  gsap.to(els, { opacity: 1, ease: "power1.inOut", duration: reduce ? 0 : 1, stagger: reduce ? 0 : 0.15 });

  // Spot for the original halftone eye image — draw an eye close-up in grayscale, then rebuild it by stamping dots with a 4×4 Bayer threshold
  const BRAND = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function paintEye(g, s) {
    const bg = g.createLinearGradient(0, 0, s, s);
    bg.addColorStop(0, "rgb(200 200 200)"); /* Not skin: grayscale underdrawing before halftone baking (only brightness is used) */
    bg.addColorStop(1, "rgb(70 70 70)"); /* Not skin: underdrawing brightness */
    g.fillStyle = bg; g.fillRect(0, 0, s, s);
    g.lineCap = "round";
    for (let i = 0; i < 7; i++) {
      g.strokeStyle = `rgb(${30 + i * 18} ${30 + i * 18} ${30 + i * 18})`; /* Not skin: hair brightness steps */
      g.lineWidth = s * (0.05 + (i % 3) * 0.025);
      g.beginPath();
      g.moveTo(-s * 0.1, s * (0.02 + i * 0.07));
      g.bezierCurveTo(s * 0.3, s * (0.1 + i * 0.05), s * 0.6, s * (-0.05 + i * 0.06), s * 1.1, s * (0.18 + i * 0.05));
      g.stroke();
    }
    const cx = s * 0.46, cy = s * 0.5, rx = s * 0.36, ry = s * 0.17;
    g.save();
    g.translate(cx, cy); g.rotate(-0.12);
    g.beginPath();
    g.moveTo(-rx, 0);
    g.quadraticCurveTo(0, -ry * 2.1, rx, -ry * 0.1);
    g.quadraticCurveTo(0, ry * 1.6, -rx, 0);
    g.closePath();
    g.fillStyle = "rgb(235 235 235)"; /* Not skin: eye-white brightness */
    g.fill();
    g.clip();
    const ir = g.createRadialGradient(s * 0.02, -s * 0.02, s * 0.02, 0, 0, s * 0.16);
    ir.addColorStop(0, "rgb(40 40 40)"); /* Not skin: iris brightness */
    ir.addColorStop(0.55, "rgb(120 120 120)"); /* Not skin: iris brightness */
    ir.addColorStop(1, "rgb(25 25 25)"); /* Not skin: iris ring brightness */
    g.fillStyle = ir; g.beginPath(); g.arc(s * 0.03, -s * 0.01, s * 0.16, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgb(10 10 10)"; /* Not skin: pupil brightness */
    g.beginPath(); g.arc(s * 0.03, -s * 0.01, s * 0.06, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgb(255 255 255)"; /* Not skin: eye-light brightness */
    g.beginPath(); g.arc(-s * 0.03, -s * 0.06, s * 0.03, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(s * 0.09, s * 0.04, s * 0.012, 0, Math.PI * 2); g.fill();
    g.restore();
    g.save();
    g.translate(cx, cy); g.rotate(-0.12);
    g.strokeStyle = "rgb(8 8 8)"; /* Not skin: eyelid line brightness */
    g.lineWidth = s * 0.03;
    g.beginPath(); g.moveTo(-rx * 1.05, s * 0.005); g.quadraticCurveTo(0, -ry * 2.2, rx * 1.04, -ry * 0.12); g.stroke();
    g.lineWidth = s * 0.008;
    for (let i = 0; i < 9; i++) {
      const t = i / 8, x = -rx + t * rx * 2, y = -ry * 2.2 * (1 - (2 * t - 1) ** 2) * 0.48 - s * 0.01;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 0.03, y - s * 0.05); g.stroke();
    }
    g.restore();
    const cheek = g.createLinearGradient(0, s * 0.7, s, s);
    cheek.addColorStop(0, "rgb(225 225 225 / 0.9)"); /* Not skin: cheek brightness */
    cheek.addColorStop(1, "rgb(20 20 20 / 0.9)"); /* Not skin: shadow brightness */
    g.fillStyle = cheek;
    g.beginPath(); g.moveTo(0, s * 0.78); g.quadraticCurveTo(s * 0.5, s * 0.66, s, s * 0.8); g.lineTo(s, s); g.lineTo(0, s); g.fill();
  }
  function halftone(canvas) {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(devicePixelRatio || 1, 2), size = Math.round(r.width * dpr);
    canvas.width = canvas.height = size;
    const src = document.createElement("canvas");
    const cell = Math.max(2, Math.round(3 * dpr));
    const n = Math.ceil(size / cell);
    src.width = src.height = n;
    const sg = src.getContext("2d", { willReadFrequently: true });
    paintEye(sg, n);
    const px = sg.getImageData(0, 0, n, n).data;
    const g = canvas.getContext("2d");
    g.clearRect(0, 0, size, size);
    g.fillStyle = getComputedStyle(canvas).color;
    const dot = Math.max(1, Math.round(cell * 0.62));
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const k = (y * n + x) * 4;
      const dark = 1 - (px[k] * 0.299 + px[k + 1] * 0.587 + px[k + 2] * 0.114) / 255;
      if (dark > (BRAND[(y % 4) * 4 + (x % 4)] + 0.5) / 16) g.fillRect(x * cell, y * cell, dot, dot);
    }
  }
  const eyes = [...document.querySelectorAll(".uv-studio__eye, .uv-studio__eye-sm")];
  const draw = () => eyes.forEach(halftone);
  draw();
  new ResizeObserver(draw).observe(document.documentElement);
})();
