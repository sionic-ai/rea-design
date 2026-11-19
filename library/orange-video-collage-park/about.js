// About section: a canvas map you drag to move and switch to 50, 100, 200% (pin labels + tap for a window), with a vertical label on the right that changes per cell.
// Instead of the original map art, our own art at the same size (1328×1180.5 at 100%) is drawn once to a canvas, and like the original that art is moved and redrawn.
(() => {
  const canvas = document.getElementById("mapCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const box = canvas.closest(".control");
    const zoomBtns = box.querySelectorAll(".zoom_button");
    const css = getComputedStyle(document.documentElement);
    const v = (name) => css.getPropertyValue(name).trim();
    const font = v("--kf-font-sans");

    // The original map image is 5312×4722 — drawn at 1/4 of that × zoom (664×590 at 50%, 1328×1180.5 at 100%, 2656×2361 at 200%)
    const MAP_W = 5312, MAP_H = 4722;
    const art = document.createElement("canvas");
    art.width = MAP_W / 4; art.height = MAP_H / 4;
    const paint = () => {
      const a = art.getContext("2d"), W = art.width, H = art.height;
      // Not skin: forest, grass and water colors in the map drawing are map content, so left alone regardless of skin
      a.fillStyle = "#e7ecd9"; a.fillRect(0, 0, W, H); // Not Skin: meadow
      const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
      a.fillStyle = "#2f5e3d"; // Not skin: forest
      for (let i = 0; i < 1100; i++) {
        const x = rnd() * W, y = rnd() * H;
        const inField = (x - W * 0.55) ** 2 / (W * 0.27) ** 2 + (y - H * 0.6) ** 2 / (H * 0.32) ** 2 < 1;
        if (inField && rnd() > 0.04) continue;
        a.beginPath(); a.arc(x, y, (inField ? 8 : 18) + rnd() * 28, 0, Math.PI * 2); a.fill();
      }
      a.strokeStyle = "#f6f1e3"; a.lineWidth = 9; a.lineCap = "round"; // Not skin: path
      a.beginPath(); a.moveTo(W * 0.18, H * 0.42); a.bezierCurveTo(W * 0.35, H * 0.38, W * 0.42, H * 0.62, W * 0.58, H * 0.58);
      a.bezierCurveTo(W * 0.7, H * 0.55, W * 0.72, H * 0.75, W * 0.86, H * 0.8); a.stroke();
      a.beginPath(); a.moveTo(W * 0.46, H * 0.3); a.bezierCurveTo(W * 0.5, H * 0.45, W * 0.44, H * 0.6, W * 0.47, H * 0.78); a.stroke();
      a.fillStyle = "#9cc7c9"; // Not Skin: pond
      a.beginPath(); a.ellipse(W * 0.66, H * 0.86, 70, 34, -0.2, 0, Math.PI * 2); a.fill();
      a.fillStyle = "#d9cbb4"; // Not skin: building roof
      [[0.47, 0.62, 120, 26], [0.53, 0.7, 40, 70], [0.6, 0.66, 60, 22]].forEach(([x, y, w, h]) => a.fillRect(W * x, H * y, w, h));
    };
    paint();

    const s = { x: 0, y: 0, zoom: 1, dragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0, moved: false, raf: 0 };
    const pins = [...document.querySelectorAll('[data-modal_main="map"][data-pin-id]')].map((el) => ({
      el, id: +el.dataset.pinId, x: +el.dataset.pinX / 1328, y: +el.dataset.pinY / 1180.5, text: el.dataset.pinText || "",
    }));
    let hits = [];
    const metrics = new Map();
    const dpr = () => window.devicePixelRatio || 1;
    const drawW = () => (MAP_W / 4) * s.zoom, drawH = () => (MAP_H / 4) * s.zoom;

    const drawPin = (x, y, d) => {
      // Original pin graphic slot — white dot inside an orange drop
      ctx.save();
      ctx.fillStyle = v("--kf-accent");
      ctx.beginPath();
      ctx.arc(x, y - d * 0.62, d * 0.3, Math.PI * 0.85, Math.PI * 2.15);
      ctx.lineTo(x, y - d * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = v("--kf-on-accent");
      ctx.beginPath(); ctx.arc(x, y - d * 0.62, d * 0.11, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };
    const draw = () => {
      const W = canvas.width / dpr(), H = canvas.height / dpr();
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = v("--kf-on-accent");
      ctx.fillRect(0, 0, W, H);
      const mw = drawW(), mh = drawH();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(art, s.x, s.y, mw, mh);
      hits = [];
      const r = s.zoom === 2 ? 1 : s.zoom === 1 ? 0.66 : s.zoom === 0.5 ? 0.53 : s.zoom > 1 ? 0.66 + (s.zoom - 1) * 0.34 : 0.53 + (0.13 * (s.zoom - 0.5)) / 0.5;
      pins.forEach((p) => {
        const px = s.x + p.x * mw + 25 * r, py = s.y + p.y * mh + 60 * r, d = 61 * r;
        if (s.zoom !== 0.5) {
          const fs = 12 * r, key = `${p.text}_${r}`;
          ctx.save();
          ctx.font = `${fs}px ${font}`;
          ctx.letterSpacing = "0.11em";
          let m = metrics.get(key);
          if (!m) { m = ctx.measureText(p.text); metrics.set(key, m); }
          const tw = m.width, f = 24 * r, pp = 13 * r, hh = 10 * r, gap = 14 * r, w = tw + f + pp + gap + hh, g = 29 * r;
          const bx = px + d / 2 - 24 * r + 5 * (1 - r), by = py - d / 2 - g / 2 + 3 * (1 - r);
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = v("--kf-on-accent");
          ctx.fillRect(bx, by, w, g);
          ctx.globalAlpha = 1;
          ctx.fillStyle = v("--kf-accent");
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          const tx = bx + f, ty = by + (8 * r + (14 * r) / 2);
          ctx.fillText(p.text, tx, ty);
          const cx = tx + tw + gap;
          ctx.strokeStyle = v("--kf-accent");
          ctx.lineWidth = r;
          ctx.beginPath();
          ctx.moveTo(cx, ty); ctx.lineTo(cx + hh, ty);
          ctx.moveTo(cx + hh / 2, ty - hh / 2); ctx.lineTo(cx + hh / 2, ty + hh / 2);
          ctx.stroke();
          ctx.restore();
          hits.push({ p, x: Math.min(px - d / 2, bx), y: Math.min(py - d, by), w: Math.max(d, w + pp + gap + hh), h: Math.max(d, g) });
        } else hits.push({ p, x: px - d / 2, y: py - d, w: d, h: d });
        drawPin(px, py, d);
      });
    };
    const hitAt = (x, y) => hits.find((h) => x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h);

    // When the zoom changes, shift so the screen center stays on the same map spot
    const setZoom = (pct) => {
      const W = canvas.width / dpr(), H = canvas.height / dpr();
      const cx = (-s.x + W / 2) / drawW(), cy = (-s.y + H / 2) / drawH();
      s.zoom = pct / 100;
      s.x = -(cx * drawW() - W / 2);
      s.y = -(cy * drawH() - H / 2);
      zoomBtns.forEach((b) => b.classList.toggle("active", +b.dataset.zoom === pct));
      draw();
    };
    // At 50% keep it centered. Beyond that, clamp so the outside of the map edge is never visible
    const clamp = () => {
      const mw = (MAP_W / 4) * s.zoom, mh = (MAP_H / 4) * s.zoom, W = canvas.width / dpr(), H = canvas.height / dpr();
      if (s.zoom === 0.5) {
        if (mw < W) s.x = (W - mw) / 2;
        if (mh < H) s.y = (H - mh) / 2;
      } else {
        s.x = Math.max(Math.min(0, W - mw), Math.min(0, s.x));
        s.y = Math.max(Math.min(0, H - mh), Math.min(0, s.y));
      }
    };
    const redraw = () => { cancelAnimationFrame(s.raf); s.raf = requestAnimationFrame(draw); };
    const size = () => {
      const r = dpr(), w = box.clientWidth, h = box.clientHeight;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      canvas.width = Math.floor(w * r); canvas.height = Math.floor(h * r);
      ctx.setTransform(r, 0, 0, r, 0, 0);
    };

    canvas.addEventListener("mousemove", (e) => {
      if (s.dragging) return;
      const b = canvas.getBoundingClientRect();
      canvas.style.cursor = hitAt(e.clientX - b.left, e.clientY - b.top) ? "pointer" : "grab";
    });
    canvas.addEventListener("click", (e) => {
      if (s.moved) { s.moved = false; return; }
      const b = canvas.getBoundingClientRect(), h = hitAt(e.clientX - b.left, e.clientY - b.top);
      if (h) nk.toggleModal(h.p.el, true);
    });
    const down = (x, y) => { s.dragging = true; s.moved = false; s.startX = x - s.x; s.startY = y - s.y; s.lastX = x; s.lastY = y; };
    const move = (x, y) => {
      if (!s.dragging || (Math.abs(x - s.lastX) < 1 && Math.abs(y - s.lastY) < 1)) return;
      s.moved = true; s.x = x - s.startX; s.y = y - s.startY; s.lastX = x; s.lastY = y;
      clamp(); redraw();
    };
    const up = () => { s.dragging = false; canvas.style.cursor = "grab"; };
    canvas.addEventListener("mousedown", (e) => { e.preventDefault(); down(e.clientX, e.clientY); canvas.style.cursor = "grabbing"; });
    addEventListener("mousemove", (e) => move(e.clientX, e.clientY));
    addEventListener("mouseup", up);
    // Phone: map dragging is this cell’s job, so it intercepts one-finger horizontal and vertical drags (same as the original)
    canvas.addEventListener("touchstart", (e) => { if (e.touches.length !== 1) return; e.preventDefault(); down(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    addEventListener("touchmove", (e) => { if (!s.dragging || e.touches.length !== 1) return; e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    addEventListener("touchend", (e) => {
      if (s.dragging && !s.moved && e.changedTouches.length === 1) {
        const b = canvas.getBoundingClientRect(), t = e.changedTouches[0], h = hitAt(t.clientX - b.left, t.clientY - b.top);
        if (h) nk.toggleModal(h.p.el, true);
      }
      s.moved = false;
      up();
    });
    zoomBtns.forEach((b) => b.addEventListener("click", () => setZoom(+b.dataset.zoom)));

    size();
    s.x = (canvas.width / dpr() - MAP_W / 4) / 2;
    s.y = (canvas.height / dpr() - MAP_H / 4) / 2;
    setZoom(100);
    document.fonts?.ready.then(() => { metrics.clear(); draw(); });
    addEventListener("resize", () => {
      size();
      s.x = (canvas.width / dpr() - drawW()) / 2;
      s.y = (canvas.height / dpr() - drawH()) / 2;
      draw();
    });
  }

  // Right vertical label — when a cell sits at screen center, shows that cell’s name (long dashes are laid sideways in vertical writing)
  const label = document.querySelector(".nk-about-feature .nk-summary-fixed .ja");
  if (label) {
    [["map", "Yard map"], ["price", "Entry fee"], ["access", "Directions"], ["open", "Opening time<span class=\"rotate\">·</span>Time"]].forEach(([id, text]) => {
      const set = () => { label.innerHTML = text; };
      ScrollTrigger.create({ trigger: `#${id}`, start: "top center", onEnter: set, onEnterBack: set });
    });
  }
})();
