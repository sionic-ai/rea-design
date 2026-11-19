// Redraws the bookshelf images on a canvas — per page one background plus four layers (sky · far hills · figure · front grass) and one text layer. Layers overlap at data-rect spots and
// Pushed toward the mouse by the data-depth multiplier (original image layer multiplier .25~3). After drawing, data-fx is set on the stage="book-flip-gl" Attach it to set the book upright.
(() => {
  const stage = document.querySelector(".stage");
  const dedication = document.querySelector(".dedication");
  const root = document.documentElement;

  const setHeight = () => root.style.setProperty("--window-height", `${window.innerHeight}px`);
  setHeight();
  window.addEventListener("resize", setHeight);

  // Skin variables and the colors made from them, as color strings the canvas can read
  const probe = document.createElement("i");
  probe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  document.body.appendChild(probe);
  const color = (v) => { probe.style.color = v; return getComputedStyle(probe).color; };
  const font = (n) => getComputedStyle(root).getPropertyValue(n).trim();

  let seed = 1;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

  const make = (w, h) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    return c;
  };
  // Crayon grain — scatter same-colored dots to give a flat surface a paper grain
  const grain = (g, w, h, col, n, a = 0.12) => {
    g.fillStyle = col;
    for (let i = 0; i < n; i++) { g.globalAlpha = rnd() * a; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); }
    g.globalAlpha = 1;
  };
  const blobPath = (g, cx, cy, rx, ry, wob = 0.06) => {
    g.beginPath();
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI * 2, k = 1 + (rnd() - 0.5) * wob;
      const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.closePath();
  };
  const shade = (base, dl, dc = 0, dh = 0) => color(`oklch(from ${base} calc(l + ${dl}) calc(c + ${dc}) calc(h + ${dh}))`);

  // Open two-page spread (half the resolution of 2100×1200)
  function spread(fig, i) {
    seed = 11 + i * 37;
    const base = `var(--site-page-${i + 1})`;
    const sky = color(base), far = shade(base, -0.06, 0, -8), near = shade(base, -0.12, 0.01, -14);
    const deep = shade(base, -0.3, 0.02, -20), light = shade(base, 0.18, -0.02, 10), ink = shade(base, -0.42, -0.03);
    const W = 1050, H = 600;

    const bg = make(W, H), b = bg.getContext("2d");
    b.fillStyle = sky; b.fillRect(0, 0, W, H);
    b.fillStyle = far; b.fillRect(0, H * 0.6, W, H * 0.4);
    grain(b, W, H, deep, 9000, 0.1);
    grain(b, W, H * 0.6, light, 5000, 0.12);
    // Center fold shadow
    const fold = b.createLinearGradient(W / 2 - 40, 0, W / 2 + 40, 0);
    fold.addColorStop(0, color("transparent"));
    fold.addColorStop(0.5, deep);
    fold.addColorStop(1, color("transparent"));
    b.globalAlpha = 0.25; b.fillStyle = fold; b.fillRect(W / 2 - 40, 0, 80, H); b.globalAlpha = 1;

    // Sky — sun and two clouds
    const s1 = make(525, 150), a = s1.getContext("2d");
    a.fillStyle = light;
    blobPath(a, 380, 58, 40, 40, 0.08); a.fill();
    grain(a, 525, 150, sky, 600, 0.3);
    a.fillStyle = deep;
    blobPath(a, 150, 92, 82, 22, 0.15); a.fill();
    blobPath(a, 300, 118, 46, 14, 0.15); a.fill();

    // Distant hills — two wave layers and thin grass
    const s2 = make(W, 240), h2 = s2.getContext("2d");
    const ridge = (y0, amp, col, ph) => {
      h2.fillStyle = col;
      h2.beginPath(); h2.moveTo(0, 240);
      for (let x = 0; x <= W; x += 10) h2.lineTo(x, y0 + Math.sin(x / 180 + ph) * amp + Math.sin(x / 61 + ph * 2) * amp * 0.25);
      h2.lineTo(W, 240); h2.closePath(); h2.fill();
    };
    ridge(120, 26, far, i);
    ridge(170, 20, near, i * 1.7 + 1);
    grain(h2, W, 240, deep, 3000, 0.14);

    // People and objects — round bodies and heads, number and position differ per page
    const s3 = make(840, 360), f = s3.getContext("2d");
    const count = 2 + (i % 3);
    for (let k = 0; k < count; k++) {
      const cx = 140 + (k * 560) / Math.max(1, count - 1) + (rnd() - 0.5) * 60, sz = 0.75 + rnd() * 0.5;
      const body = k % 2 ? deep : shade(base, 0.1, 0.06, 140 + k * 30);
      f.fillStyle = body;
      blobPath(f, cx, 290 - 40 * sz, 46 * sz, 70 * sz, 0.05); f.fill();
      f.fillStyle = shade(base, 0.22, 0.02, 40 + k * 20);
      blobPath(f, cx, 190 - 60 * sz, 34 * sz, 34 * sz, 0.04); f.fill();
      f.fillStyle = ink;
      f.beginPath(); f.arc(cx - 10 * sz, 186 - 60 * sz, 3.5 * sz, 0, Math.PI * 2); f.arc(cx + 10 * sz, 186 - 60 * sz, 3.5 * sz, 0, Math.PI * 2); f.fill();
    }
    grain(f, 840, 360, light, 1800, 0.18);

    // Front grass — bottom edge of the page, pushed the most
    const s4 = make(W, 140), p = s4.getContext("2d");
    p.strokeStyle = near; p.lineCap = "round";
    for (let k = 0; k < 14; k++) {
      const x = rnd() * W, y = 70 + rnd() * 60, hgt = 40 + rnd() * 50;
      p.lineWidth = 5; p.globalAlpha = 0.6 + rnd() * 0.4;
      p.beginPath(); p.moveTo(x, 140); p.lineTo(x, y - hgt * 0.3); p.stroke();
      for (const d of [-1, 1]) { p.beginPath(); p.moveTo(x, y - hgt * 0.1); p.quadraticCurveTo(x + d * 18, y - hgt * 0.5, x + d * 28, y - hgt * 0.2); p.stroke(); }
    }
    p.globalAlpha = 1;

    // Text — handwritten title and two lines at the top of the left (even sections) or right page
    const s5 = make(378, 180), t = s5.getContext("2d");
    t.fillStyle = ink;
    t.font = `700 46px ${font("--kf-font-hand") || font("--kf-font-display")}`;
    t.fillText(`Your title $ here{i + 1}`, 6, 60);
    t.font = `400 19px ${font("--kf-font-sans")}`;
    t.fillText("Your two body lines here.", 8, 112);
    t.fillText("Short text describing the page image.", 8, 140);
    const tx = i % 2 ? 0.56 : 0.06;

    const layer = (c, rect, depth, text) => {
      c.setAttribute("data-rect", rect);
      if (depth) c.setAttribute("data-depth", depth);
      if (text) c.setAttribute("data-text", "");
      fig.appendChild(c);
    };
    fig.appendChild(bg);
    layer(s1, "0.25 0.05 0.5 0.25", "0.25 0.25");
    layer(s2, "0 0.6 1 0.4", "0.5 0.5");
    layer(s3, "0.1 0.35 0.8 0.6", "1 1");
    layer(s4, "0 0.77 1 0.233", "2 1");
    layer(s5, `${tx} 0.1 0.36 0.3`, null, true);
  }

  // Cover — three handwritten lines on a navy panel with pencil doodles (circle · arrow · underline), subtitle below
  function cover(cv) {
    seed = 5;
    const g = cv.getContext("2d"), w = cv.width, h = cv.height;
    g.fillStyle = color("var(--kf-surface)"); g.fillRect(0, 0, w, h);
    grain(g, w, h, color("var(--kf-raised)"), 9000, 0.2);
    g.fillStyle = color("var(--kf-ink)");
    g.textAlign = "center";
    g.font = `700 54px ${font("--kf-font-hand")}`;
    ["Here", "The book title", "In handwriting"].forEach((line, k) => g.fillText(line, w / 2 - 6 + k * 4, 250 + k * 62));
    g.strokeStyle = color("var(--kf-dim)");
    g.lineWidth = 2; g.lineCap = "round";
    g.beginPath(); g.ellipse(w / 2 - 60, 232, 78, 34, -0.08, 0.3, Math.PI * 2.1); g.stroke();
    g.beginPath(); g.moveTo(410, 300); g.lineTo(450, 268); g.moveTo(410, 300); g.lineTo(452, 306); g.moveTo(410, 300); g.lineTo(470, 280); g.stroke();
    g.beginPath(); g.moveTo(170, 425); for (let x = 170; x < 380; x += 12) g.lineTo(x + 6, 420 + (x % 24 ? -9 : 7)); g.stroke();
    g.fillStyle = color("var(--kf-ink-soft)");
    g.font = `400 17px ${font("--kf-font-sans")}`;
    g.fillText("Your subtitle line here", w / 2, 488);
  }
  function back(cv) {
    seed = 9;
    const g = cv.getContext("2d"), w = cv.width, h = cv.height;
    g.fillStyle = color("var(--kf-surface)"); g.fillRect(0, 0, w, h);
    grain(g, w, h, color("var(--kf-raised)"), 9000, 0.2);
    g.fillStyle = color("var(--kf-dim)");
    g.textAlign = "center";
    g.font = `400 15px ${font("--kf-font-sans")}`;
    g.fillText("Your back cover text here", w / 2, h * 0.78);
    g.fillText("Two lines go here.", w / 2, h * 0.78 + 22);
  }

  // Stage event — after the book stands, lower the dedication, when entering, remove it
  stage.addEventListener("fx:book-flip-gl", (e) => {
    const s = e.detail.state;
    if (s === "ready") document.body.classList.add("is-loaded");
    else if (s === "enter") dedication.classList.add("hide");
    else if (s === "entered") dedication.hidden = true;
  });

  const draw = () => {
    cover(stage.querySelector('[data-fx-part="cover"] canvas'));
    back(stage.querySelector('[data-fx-part="back"] canvas'));
    stage.querySelectorAll('[data-fx-part="spread"]').forEach(spread);
    probe.remove();
    stage.setAttribute("data-fx", "book-flip-gl");
  };
  // Draw after the handwriting·serif fonts arrive — if drawn first, the canvas text hardens into the fallback font
  const hand = font("--kf-font-hand").split(",")[0], serif = font("--kf-font-sans").split(",")[0];
  const fonts = Promise.all(["700 20px " + hand, "400 20px " + hand, "400 20px " + serif].map((f) => document.fonts.load(f, "Gaa"))).catch(() => {});
  Promise.race([fonts, new Promise((r) => setTimeout(r, 1200))]).then(draw);
})();
