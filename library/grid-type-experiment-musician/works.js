/* Activities: find the cover at screen center · previous·next title · hover info · a hand drawn with text. Values were read from the original bundle. */
window.sh.page("works", ({ on, tick }) => {
  const { reduce, sp, gridSize, lenis } = window.sh;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const items = $$(".contents__item");
  const prevs = $$(".titles__float--prev .titles__float__text");
  const nexts = $$(".titles__float--next .titles__float__text");

  /* Columns 9~10 are half random, from column 11 on all white cells — a stair boundary between the beige grid and the white panel */
  const stair = () => {
    if (sp()) return;
    $$(".sh-pattern__item").forEach((el, n) => {
      const c = n % 24;
      if (c >= 9 && c <= 10) { if (Math.random() < 0.5) el.setAttribute("hidden-tile", ""); return; }
      if (c >= 11) el.setAttribute("hidden-tile", "");
    });
  };
  stair();
  on(document, "sh:grid", stair);

  const r = sp() ? 10 : 80;
  [...prevs, ...nexts].forEach((t) => gsap.set(t, { x: gsap.utils.random(-r, r) + "rem", y: gsap.utils.random(-r, r) + "rem" }));
  let current = 0;
  const nearest = () => {
    const cx = innerWidth / 2, cy = innerHeight / 2;
    let best = 0, d = Infinity;
    items.forEach((it, i) => { const b = it.getBoundingClientRect(); const k = Math.hypot(cx - (b.left + b.width / 2), cy - (b.top + b.height / 2)); if (k < d) { d = k; best = i; } });
    return best;
  };
  const show = () => {
    current = nearest();
    [...prevs, ...nexts].forEach((t) => t.removeAttribute("item-show"));
    items.forEach((it) => it.removeAttribute("item-show"));
    if (prevs[current - 1]) prevs[current - 1].setAttribute("item-show", "");
    if (nexts[current + 1]) nexts[current + 1].setAttribute("item-show", "");
    items[current].setAttribute("item-show", "");
  };
  show();
  const offScroll = lenis ? lenis.on("scroll", show) : (on(window, "scroll", show, { passive: true }), null);

  items.forEach((it) => {
    const info = document.querySelector(`.info__item[item-id="${it.getAttribute("item-id")}"]`);
    it.addEventListener("mouseenter", () => info?.setAttribute("show-item", ""));
    it.addEventListener("mouseleave", () => info?.removeAttribute("show-item"));
  });

  /* Phone: pushes the cover row sideways in grid-cell steps as the page scrolls vertically */
  if (sp()) {
    const list = document.querySelector(".contents__list");
    const move = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const s = max > 0 ? scrollY / max : 0;
      list.style.setProperty("--init-x", String(Math.round(((list.getBoundingClientRect().width - innerWidth) / gridSize()) * s)));
      show();
    };
    on(window, "scroll", move, { passive: true });
    move();
  }

  /* Letter hand: draws a hand shape on an offscreen canvas, measures brightness per cell, and redraws it with the current hero title letters */
  const cv = document.querySelector(".ascii__canvas");
  const ctx = cv.getContext("2d");
  const off = document.createElement("canvas");
  const octx = off.getContext("2d", { willReadFrequently: true });
  let W = 0, H = 0, cell = 8;
  const resize = () => {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    cell = Math.max(6, Math.round(gridSize() / 6.5));
    off.width = Math.ceil(W / cell); off.height = Math.ceil(H / cell);
  };
  resize();
  on(window, "resize", resize);
  /* The fingertip follows the cursor (leftward only up to 1/3 of the screen), the arm extends from off-screen at the bottom right */
  const tip = sp() ? { x: innerWidth * 0.62, y: innerHeight * 0.42 } : { x: innerWidth * 0.42, y: innerHeight * 0.45 }, aim = { ...tip };
  if (!sp()) on(window, "mousemove", (e) => { aim.x = Math.max(e.clientX, innerWidth * 0.33); aim.y = e.clientY; }, { passive: true });
  const hand = (t) => {
    tip.x += (aim.x - tip.x) * 0.4;
    tip.y += (aim.y - tip.y) * 0.4;
    const w = off.width, h = off.height;
    octx.clearRect(0, 0, w, h);
    octx.save();
    // On phone the arm rises straight up from the bottom of the screen
    const ax = sp() ? innerWidth * 0.64 : innerWidth * 1.25, ay = sp() ? innerHeight * 1.6 : innerHeight * 0.75;
    octx.translate(tip.x / cell, tip.y / cell);
    octx.rotate(Math.atan2(ay - tip.y, ax - tip.x) + Math.sin(t * 0.6) * 0.012);
    const s = ((sp() ? innerHeight * 0.75 : innerWidth * 0.58) / cell) / 150;
    octx.scale(s, s);
    octx.translate(54, -2);
    const g = octx.createLinearGradient(-60, 0, 50, 0);
    g.addColorStop(0, "rgba(255,255,255,0.55)"); /* Not skin: hand-shaped panel not drawn on screen — only the alpha is measured and used as text brightness */
    g.addColorStop(1, "rgba(255,255,255,1)"); /* Not skin: alpha of the same plate as above */
    octx.fillStyle = g;
    const finger = (x, y, len, wid, ang) => {
      octx.save(); octx.translate(x, y); octx.rotate(ang);
      octx.beginPath(); octx.roundRect(-len, -wid / 2, len, wid, wid / 2); octx.fill();
      octx.restore();
    };
    octx.beginPath(); octx.ellipse(18, 4, 34, 22, 0.1, 0, Math.PI * 2); octx.fill();
    octx.beginPath(); octx.roundRect(30, -14, 120, 34, 14); octx.fill();
    finger(-6, -14, 46, 10, 0.06);
    finger(-8, -3, 52, 10, 0.02);
    finger(-6, 8, 48, 10, -0.04);
    finger(-2, 18, 40, 9, -0.12);
    finger(4, 24, 30, 11, -0.75);
    octx.restore();
  };
  const COLORS = ["--site-hand-1", "--site-hand-2", "--site-hand-3", "--site-hand-4"].map((v) => window.sh.rgb(v));
  let txt = items[0]?.getAttribute("item-ascii-text") || "Your title here";
  const draw = (t) => {
    txt = (items[current]?.getAttribute("item-ascii-text") || txt).replace(/\s+/g, "");
    hand(t);
    const data = octx.getImageData(0, 0, off.width, off.height).data;
    ctx.clearRect(0, 0, W, H);
    ctx.font = `${cell}px "Fira Mono", "Nanum Gothic Coding", monospace`;
    ctx.textBaseline = "top";
    let k = Math.floor(t * 6);
    for (let y = 0; y < off.height; y++) for (let x = 0; x < off.width; x++) {
      const a = data[(y * off.width + x) * 4 + 3] / 255;
      if (a < 0.08) continue;
      const c = COLORS[Math.min(3, Math.floor((1 - a) * 4 + Math.random() * 0.6))];
      ctx.fillStyle = c;
      ctx.fillText(txt[(k++) % txt.length], x * cell, y * cell);
    }
  };
  // Like the original, start the interaction only after the cursor appears — drawing thousands of letters at 12fps before it shows would block the hero and transition frames
  let shown = sp();
  if (!sp()) on(window, "mousemove", () => { shown = true; draw(gsap.ticker.time); gsap.to(cv, { opacity: 1, duration: 0.3 }); }, { once: true });
  else gsap.set(cv, { opacity: 1 });
  if (shown || reduce) draw(0);
  if (!reduce) {
    let last = 0;
    tick((time) => { if (shown && time - last > 1 / 12) { draw(time); last = time; } });
  }
  return () => offScroll?.();
});
