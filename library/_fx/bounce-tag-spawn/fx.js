// Spawns one short footer-line pill at a time inside the card, floating like a screensaver and bouncing off the walls — when several pile up on one card, the oldest are removed first
(() => {
  kfFx.register("bounce-tag-spawn", (el, { options, reduce }) => {
    const source = [...el.querySelectorAll('[data-fx-part="tag"]')].map((n) => n.textContent.trim()).filter(Boolean);
    if (!source.length) return;
    const every = +(options.every ?? 500), max = +options.max || 10;
    const minSpeed = +(options.min ?? 0.3), maxSpeed = +(options.speed ?? 1.5);
    const area = +(options.area ?? 0.1);
    const delayMin = +(options["delay-min"] ?? 100), delayMax = +(options["delay-max"] ?? 2000);
    const live = [];
    const make = (text) => {
      const n = document.createElement("span");
      n.className = "fx-bounce-tag";
      n.setAttribute("aria-hidden", "true");
      n.textContent = text;
      el.append(n);
      return n;
    };
    if (reduce) {
      // With reduced motion, only the first three footers sit in the fixed spot inside the card
      const spots = [[0.1, 0.42], [0.45, 0.55], [0.2, 0.68]];
      const made = source.slice(0, 3).map((t, i) => { const n = make(t); n.style.transform = `translate(${spots[i][0] * el.clientWidth}px, ${spots[i][1] * el.clientHeight}px)`; return n; });
      return () => made.forEach((n) => n.remove());
    }
    const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    let order = shuffle(source), at = 0, visible = false, focused = true, timer = 0, start = 0;
    const clear = () => { live.forEach((t) => t.el.remove()); live.length = 0; };
    const spawn = () => {
      const text = order[at];
      at = (at + 1) % order.length;
      if (live.some((t) => t.text === text)) return;
      const W = el.clientWidth, H = el.clientHeight;
      const cx = W / 2, cy = H / 2, rx = area * cx, ry = area * cy;
      if (live.length >= max) live.shift().el.remove();
      const n = make(text);
      const w = n.offsetWidth, h = n.offsetHeight;
      const x = Math.max(0, Math.min((Math.random() * 2 - 1) * rx + cx - w / 2, W - w));
      const y = Math.max(0, Math.min((Math.random() * 2 - 1) * ry + cy - h / 2, H - h));
      const sp = Math.random() * (maxSpeed - minSpeed) + minSpeed, ang = Math.random() * Math.PI * 2;
      let dx = sp * Math.cos(ang), dy = sp * Math.sin(ang);
      // A pill moving along almost a single axis can’t travel between the walls, so let it move at least .5px per axis
      if (Math.abs(dx) < 0.5) dx = dx < 0 ? -0.5 : 0.5;
      if (Math.abs(dy) < 0.5) dy = dy < 0 ? -0.5 : 0.5;
      const t = { text, el: n, x, y, dx, dy };
      live.push(t);
      n.style.transform = `translate(${x}px, ${y}px)`;
    };
    const tick = () => {
      const W = el.clientWidth, H = el.clientHeight;
      for (const t of live) {
        const w = t.el.offsetWidth, h = t.el.offsetHeight;
        if (t.x + t.dx < 0) { t.dx = Math.abs(t.dx); t.x = 0; } else if (t.x + w + t.dx > W) { t.dx = -Math.abs(t.dx); t.x = W - w; }
        if (t.y + t.dy < 0) { t.dy = Math.abs(t.dy); t.y = 0; } else if (t.y + h + t.dy > H) { t.dy = -Math.abs(t.dy); t.y = H - h; }
        t.x = Math.max(0, Math.min(t.x + t.dx, W - w));
        t.y = Math.max(0, Math.min(t.y + t.dy, H - h));
        t.el.style.transform = `translate(${t.x}px, ${t.y}px)`;
      }
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (!visible) clear(); });
    io.observe(el);
    const onFocus = () => (focused = true), onBlur = () => (focused = false);
    addEventListener("focus", onFocus);
    addEventListener("blur", onBlur);
    let lastW = innerWidth;
    const onResize = () => { if (innerWidth === lastW) return; lastW = innerWidth; clear(); order = shuffle(source); at = 0; spawn(); };
    addEventListener("resize", onResize);
    // Scatter each card’s start by 0.1~2s so they don’t pop out in the same tempo
    start = setTimeout(() => {
      spawn();
      timer = setInterval(() => { if (focused) visible ? spawn() : clear(); }, every);
      gsap.ticker.add(tick);
    }, delayMin + Math.random() * (delayMax - delayMin));
    return () => {
      clearTimeout(start); clearInterval(timer); gsap.ticker.remove(tick); io.disconnect();
      removeEventListener("focus", onFocus); removeEventListener("blur", onBlur); removeEventListener("resize", onResize);
      clear();
    };
  });
})();
