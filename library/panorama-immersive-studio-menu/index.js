// Home page — loader (Part I) → entrance door over a cathedral panorama → press the door to get the band·header line·menu. Pressing the menu turns the camera toward the door (longitude 9.8°) and
// Approaches at a 28° field of view, and the curtain covers it 1.05s later (original MainScene entering: In 9.8 · Ln 7.8 · Rn 28, rotation 2.2 · field of view 1.6).
// The panorama photo slot draws a cathedral with the same composition on a canvas — stone, light and candle colors are derived from the outfit color
(() => {
  const body = document.body;
  const pano = document.querySelector(".cs-pano");
  const map = pano.querySelector('[data-fx-part="map"]');
  const pre = document.querySelector(".cs-pre");
  const gate = document.querySelector(".cs-gate");
  const menu = document.querySelector(".cs-menu");
  const list = menu.querySelector(".cs-menu__list");

  cs.rooms.forEach((r) => {
    list.insertAdjacentHTML("beforeend", `<li><a class="cs-menu__link" href="${r.href}" data-room="${r.id}" data-fx="scramble-magnet-link" data-fx-scramble-magnet-link="to: ${r.alt}">${r.label}</a></li>`);
  });

  // Convert the skin variable (any color type) into rgba numbers for the canvas — paint it on a 1×1 canvas and read it
  const probe = document.createElement("i");
  probe.style.display = "none";
  body.append(probe);
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (css) => {
    probe.style.color = css;
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = getComputedStyle(probe).color;
    px.fillRect(0, 0, 1, 1);
    const d = px.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  const BG = rgbOf("var(--kf-bg)"), INK = rgbOf("var(--kf-ink)"), COLD = rgbOf("var(--site-cold)"), CREAM = rgbOf("var(--kf-ink-soft)"), GOLD = rgbOf("var(--site-gold)");
  probe.remove();
  const mix = (a, b, t, al = 1) => `rgba(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(", ")}, ${al})`;

  // ── Cathedral equirectangular image — converts longitude and latitude to pixels and draws pillars, arches, windows, floor ──
  function paintNave(cv) {
    const W = 4096, H = 2048, s = cv.width / W;
    const g = cv.getContext("2d");
    g.setTransform(s, 0, 0, s, 0, 0);
    const X = (lon) => (((lon % 360) + 360) % 360) / 360 * W;
    const Y = (lat) => (90 - lat) / 180 * H;
    const beam = 281.6;
    const near = (lon) => { let d = Math.abs(lon - beam) % 360; if (d > 180) d = 360 - d; return 1 - Math.min(1, d / 120); };

    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, mix(BG, COLD, 0));
    sky.addColorStop(0.3, mix(BG, COLD, 0.033));
    sky.addColorStop(0.5, mix(BG, COLD, 0.077));
    sky.addColorStop(0.62, mix(BG, COLD, 0.11));
    sky.addColorStop(1, mix(BG, COLD, 0.022));
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);
    // The lit side is brighter — a wide band per longitude
    for (let lon = 0; lon < 360; lon += 2) {
      g.fillStyle = mix(BG, COLD, 0.066, near(lon) * 0.35);
      g.fillRect(X(lon), Y(40), W / 180 + 1, Y(-40) - Y(40));
    }
    // Dome ribs — horizontal arcs and vertical lines per bay
    g.lineWidth = 3;
    for (let lon = 0; lon < 360; lon += 15) {
      g.strokeStyle = mix(BG, COLD, 0.066 + near(lon) * 0.08);
      g.beginPath();
      for (let k = 0; k <= 15; k++) { const l = lon + k; const y = Y(58 + 14 * Math.sin((k / 15) * Math.PI)); k ? g.lineTo(X(l), y) : g.moveTo(X(l), y); }
      g.stroke();
      g.beginPath(); g.moveTo(X(lon), Y(42)); g.lineTo(X(lon), Y(86)); g.stroke();
    }
    // Arcade — a column every 15°, darkness inside a pointed arch between, a small high window above
    for (let lon = 0; lon < 360; lon += 15) {
      const x0 = X(lon), x1 = X(lon + 15), cx = (x0 + x1) / 2, top = Y(36), base = Y(-3), spring = Y(16);
      if (Math.abs(lon + 7.5 - beam) < 9) continue;
      g.fillStyle = mix(BG, COLD, 0.011, 0.92);
      g.beginPath();
      g.moveTo(x0 + 22, base); g.lineTo(x0 + 22, spring);
      g.quadraticCurveTo(x0 + 22, top + 30, cx, top);
      g.quadraticCurveTo(x1 - 22, top + 30, x1 - 22, spring);
      g.lineTo(x1 - 22, base); g.closePath(); g.fill();
      g.fillStyle = mix(BG, COLD, 0.044, 0.7);
      g.fillRect(cx - 5, spring, 10, base - spring);
      const wTop = Y(54), wBot = Y(42);
      g.fillStyle = mix(BG, COLD, 0.193 + near(lon) * 0.3, 0.55);
      g.beginPath(); g.moveTo(cx - 14, wBot); g.lineTo(cx - 14, wTop + 18); g.quadraticCurveTo(cx, wTop - 8, cx + 14, wTop + 18); g.lineTo(cx + 14, wBot); g.closePath(); g.fill();
    }
    for (let lon = 0; lon < 360; lon += 15) {
      const x = X(lon), lit = near(lon);
      const col = g.createLinearGradient(x - 26, 0, x + 26, 0);
      col.addColorStop(0, mix(BG, COLD, 0.055 + lit * 0.12));
      col.addColorStop(0.5, mix(BG, COLD, 0.11 + lit * 0.25));
      col.addColorStop(1, mix(BG, COLD, 0.033));
      g.fillStyle = col;
      g.fillRect(x - 26, Y(44), 52, Y(-4) - Y(44));
      g.fillStyle = mix(BG, COLD, 0.017, 0.5);
      for (let k = -2; k <= 2; k++) g.fillRect(x + k * 9 - 1, Y(44), 2, Y(-4) - Y(44));
    }
    // East window: three tall lancets, a row of small windows below, a rose window beside
    const wx = X(beam);
    const glow = g.createRadialGradient(wx, Y(22), 20, wx, Y(22), 520);
    glow.addColorStop(0, mix(BG, COLD, 0.75, 0.55));
    glow.addColorStop(1, mix(BG, COLD, 0.11, 0));
    g.fillStyle = glow;
    g.fillRect(wx - 600, Y(60), 1200, Y(-20) - Y(60));
    [-1, 0, 1].forEach((k) => {
      const cx = wx + k * 46, top = Y(k ? 32 : 36), bot = Y(9);
      g.fillStyle = mix(BG, COLD, 0.95);
      g.beginPath(); g.moveTo(cx - 15, bot); g.lineTo(cx - 15, top + 24); g.quadraticCurveTo(cx, top - 10, cx + 15, top + 24); g.lineTo(cx + 15, bot); g.closePath(); g.fill();
      g.fillStyle = mix(BG, COLD, 0.165, 0.6);
      for (let r = 0; r < 6; r++) g.fillRect(cx - 15, bot - (r + 1) * ((bot - top) / 7), 30, 2);
      g.fillRect(cx - 1, top + 10, 2, bot - top - 10);
    });
    [-3, -2, -1, 0, 1, 2, 3].forEach((k) => {
      const cx = wx + k * 30;
      g.fillStyle = mix(BG, COLD, 0.7, 0.85);
      g.fillRect(cx - 7, Y(6), 14, Y(1) - Y(6));
    });
    const rx = X(beam + 22), ry = Y(27), rr = 48;
    g.fillStyle = mix(BG, COLD, 0.65, 0.85);
    g.beginPath(); g.arc(rx, ry, rr, 0, Math.PI * 2); g.fill();
    g.strokeStyle = mix(BG, COLD, 0.028, 0.9); g.lineWidth = 6;
    for (let a = 0; a < 12; a++) { g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx + Math.cos(a * Math.PI / 6) * rr, ry + Math.sin(a * Math.PI / 6) * rr); g.stroke(); }
    g.beginPath(); g.arc(rx, ry, rr * 0.45, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(rx, ry, rr, 0, Math.PI * 2); g.stroke();
    // Altar steps with a small black figure on top
    const ax = X(273);
    [[-1.2, 150], [-2.4, 190], [-3.8, 240]].forEach(([lat, w], i) => {
      g.fillStyle = mix(BG, COLD, 0.033 + i * 0.02);
      g.fillRect(ax - w, Y(lat), w * 2, 16 + i * 6);
      g.fillStyle = mix(BG, COLD, 0.209, 0.7);
      g.fillRect(ax - w, Y(lat), w * 2, 2);
    });
    g.fillStyle = mix(BG, BG, 0, 0.95);
    g.beginPath(); g.ellipse(ax + 6, Y(0.2), 9, 16, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(ax, Y(1.4)); g.lineTo(ax + 3, Y(2.4)); g.lineTo(ax + 6, Y(1.4)); g.lineTo(ax + 9, Y(2.4)); g.lineTo(ax + 12, Y(1.4)); g.fill();
    // Floor tiles — at camera height 1.6, concentric circles at distance d are horizontal lines, vertical lines every 6° (each row offset by half a cell)
    const rings = [1.1, 1.45, 1.9, 2.5, 3.2, 4.1, 5.3, 6.9, 9, 12, 16, 22, 32];
    g.lineWidth = 2.5;
    rings.forEach((d, i) => {
      const y = Y(-Math.atan(1.6 / d) * 180 / Math.PI);
      g.strokeStyle = mix(BG, BG, 0, 0.45 - i * 0.02);
      g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
      const prev = i ? Y(-Math.atan(1.6 / rings[i - 1]) * 180 / Math.PI) : H;
      for (let lon = (i % 2) * 3; lon < 360; lon += 6) { g.beginPath(); g.moveTo(X(lon), y); g.lineTo(X(lon), prev); g.stroke(); }
    });
    // Window light pooled on the floor and light-shaft marks
    const pool = g.createRadialGradient(wx, Y(-16), 10, wx, Y(-16), 640);
    pool.addColorStop(0, mix(BG, COLD, 0.78, 0.8));
    pool.addColorStop(0.45, mix(BG, COLD, 0.248, 0.38));
    pool.addColorStop(1, mix(BG, COLD, 0.11, 0));
    g.save(); g.translate(wx, Y(-16)); g.scale(1.25, 0.55); g.translate(-wx, -Y(-16));
    g.fillStyle = pool; g.fillRect(wx - 900, Y(-16) - 700, 1800, 1400);
    g.restore();
    // Wall sconce — warm light (hue 320~60)
    for (let lon = 322; lon < 420; lon += 15) {
      const x = X(lon + 4), y = Y(7);
      const fl = g.createRadialGradient(x, y, 2, x, y, 70);
      fl.addColorStop(0, mix(BG, GOLD, 1, 0.7)); fl.addColorStop(1, mix(BG, GOLD, 0.6, 0));
      g.fillStyle = fl; g.fillRect(x - 70, y - 70, 140, 140);
      [-14, 0, 14].forEach((k) => {
        g.fillStyle = mix(BG, CREAM, 0.7); g.fillRect(x + k - 3, y, 6, 22);
        g.fillStyle = mix(BG, GOLD, 1); g.beginPath(); g.ellipse(x + k, y - 6, 3, 7, 0, 0, Math.PI * 2); g.fill();
      });
    }
    // Stone grain — fine speckles
    for (let i = 0; i < 26000; i++) {
      g.fillStyle = Math.random() < 0.5 ? mix(BG, BG, 0, 0.08) : mix(BG, COLD, 0.275, 0.025);
      g.fillRect(Math.random() * W, Math.random() * H, 2 + Math.random() * 6, 2 + Math.random() * 4);
    }
  }

  // ── Loader background video spot: a gothic castle on a moonlit hill with dry branches in front ──
  function paintCastle(cv) {
    const W = cv.width, H = cv.height, g = cv.getContext("2d");
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, mix(BG, INK, 0.02)); sky.addColorStop(0.6, mix(BG, INK, 0.12)); sky.addColorStop(1, mix(BG, INK, 0.04));
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    const moon = g.createRadialGradient(W * 0.42, H * 0.2, 4, W * 0.42, H * 0.2, 160);
    moon.addColorStop(0, mix(BG, CREAM, 0.8, 0.9)); moon.addColorStop(0.2, mix(BG, CREAM, 0.5, 0.35)); moon.addColorStop(1, mix(BG, CREAM, 0.2, 0));
    g.fillStyle = moon; g.fillRect(0, 0, W, H);
    g.fillStyle = mix(BG, INK, 0.03);
    g.beginPath(); g.moveTo(0, H * 0.78);
    for (let x = 0; x <= W; x += 40) g.lineTo(x, H * 0.72 + Math.sin(x / 210) * 22 - Math.exp(-((x - W * 0.5) ** 2) / 90000) * 60);
    g.lineTo(W, H); g.lineTo(0, H); g.fill();
    const cx = W * 0.5, base = H * 0.66;
    g.fillStyle = mix(BG, BG, 0, 1);
    [[-150, 90, 40], [-90, 150, 30], [-30, 230, 46], [40, 170, 34], [110, 120, 40], [170, 80, 30]].forEach(([dx, h, w]) => {
      g.fillRect(cx + dx - w / 2, base - h, w, h);
      g.beginPath(); g.moveTo(cx + dx - w / 2 - 4, base - h); g.lineTo(cx + dx, base - h - w * 1.6); g.lineTo(cx + dx + w / 2 + 4, base - h); g.fill();
    });
    g.fillRect(cx - 190, base - 70, 380, 70);
    g.fillStyle = mix(BG, GOLD, 0.9, 0.85);
    [[-30, 150], [-30, 120], [40, 110], [-90, 100], [110, 80], [-150, 60], [0, 40], [60, 40]].forEach(([dx, h]) => g.fillRect(cx + dx - 2, base - h, 4, 7));
    g.strokeStyle = mix(BG, BG, 0, 0.95);
    const branch = (x, y, a, len, w) => {
      if (len < 10) return;
      const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
      branch(x2, y2, a - 0.35 - Math.random() * 0.2, len * 0.72, w * 0.68);
      branch(x2, y2, a + 0.3 + Math.random() * 0.25, len * 0.66, w * 0.62);
    };
    branch(-20, H * 0.05, 0.25, 260, 22);
    branch(-30, H * 0.45, -0.35, 200, 16);
    const mist = g.createLinearGradient(0, H * 0.6, 0, H);
    mist.addColorStop(0, mix(BG, INK, 0.2, 0)); mist.addColorStop(0.5, mix(BG, INK, 0.2, 0.25)); mist.addColorStop(1, mix(BG, INK, 0.1, 0));
    g.fillStyle = mist; g.fillRect(0, H * 0.6, W, H * 0.4);
  }

  const small = innerWidth <= 640;
  if (small) { map.width = 2048; map.height = 1024; }
  paintNave(map);

  menu.addEventListener("animationend", () => menu.classList.add("is-ready"));

  const label = gate.querySelector(".cs-gate__label");
  const showGate = () => {
    gate.hidden = false;
    label.dispatchEvent(new CustomEvent("fx:play"));
  };
  const enter = () => {
    // The original detaches the entry screen the moment the door is pressed
    gate.remove();
    sessionStorage.setItem("cs-entered", "1");
    cs.enter(false);
  };
  gate.querySelectorAll("[data-enter]").forEach((b) => b.addEventListener("click", enter));

  if (sessionStorage.getItem("cs-entered")) {
    pre.remove();
    cs.enter(true);
  } else {
    // Background video slot — bakes one castle image, then repaints every frame so three fog bands flow over it and window lights flicker (the same motion as an autoplay looping video)
    const bg = pre.querySelector(".cs-pre__bg");
    const still = document.createElement("canvas");
    still.width = bg.width; still.height = bg.height;
    paintCastle(still);
    const g = bg.getContext("2d");
    const mists = [[0.2, 0.7, 260, 38], [0.6, 0.78, 340, -26], [0.9, 0.64, 220, 18]];
    let mistRaf = 0;
    const roll = (now) => {
      mistRaf = requestAnimationFrame(roll);
      const t = now / 1000, W = bg.width, H = bg.height;
      g.drawImage(still, 0, 0);
      mists.forEach(([x0, y, r, v]) => {
        const x = ((x0 * W + t * v) % (W + r * 2) + W + r * 2) % (W + r * 2) - r;
        const m = g.createRadialGradient(x, H * y, 0, x, H * y, r);
        m.addColorStop(0, mix(BG, INK, 0.3, 0.32)); m.addColorStop(1, mix(BG, INK, 0.3, 0));
        g.fillStyle = m;
        g.fillRect(x - r, H * y - r, r * 2, r * 2);
      });
      g.fillStyle = mix(BG, GOLD, 0.9, 0.35 + 0.35 * Math.abs(Math.sin(t * 3.1)));
      g.fillRect(W * 0.5 - 32, H * 0.66 - 152, 4, 7);
    };
    if (cs.reduce) g.drawImage(still, 0, 0); else mistRaf = requestAnimationFrame(roll);
    if (!cs.reduce) gsap.fromTo(bg, { scale: 1 }, { scale: 1.06, duration: 6, ease: "none", repeat: -1, yoyo: true });
    pre.addEventListener("fx:done", () => { cancelAnimationFrame(mistRaf); gsap.killTweensOf(bg); pre.remove(); showGate(); });
    // Once the scene is up, the loader doesn’t wait — original gate (model ready). Parts attach after DOMContentLoaded, so notify after load.
    addEventListener("load", () => pre.dispatchEvent(new CustomEvent("fx:open")), { once: true });
  }

  // Pressing a menu door makes the camera turn toward the door and approach — shared.js calls this before the transition
  window.csLeave = (a, href) => {
    if (!a.dataset.room) return false;
    menu.classList.add("is-leaving");
    pano.dispatchEvent(new CustomEvent("fx:look", { detail: { lon: 9.8, lat: 7.8, fov: 28, rate: 1.6, turn: 2.2, hold: true } }));
    cs.go(href, "enter");
    return true;
  };
})();
