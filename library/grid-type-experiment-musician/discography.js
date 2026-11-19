/* Records: a panel of titles scattered without overlap is pushed infinitely by drag · wheel, getting smaller the farther from the center circle. Lyrics turn on on touch, and touched titles are joined by curves. Values are from the original bundle. */
window.sh.page("discography", ({ on, tick: every }) => {
  const { reduce, sp } = window.sh;
  window.lenis?.stop();
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const box = document.querySelector(".circle__box");
  const inner = document.querySelector(".circle__box__inner");
  const items = $$(".circle__item");
  const GAP = 20, TRIES = 100;
  const pos = [];

  const place = () => {
    const b = box.getBoundingClientRect();
    const taken = [];
    const sizes = items.map((it) => { gsap.set(it.querySelector(".circle__item__text"), { scale: 1 }); const r = it.getBoundingClientRect(); return { w: r.width, h: r.height }; });
    const hit = (a, c) => !(a.right + GAP < c.left || a.left - GAP > c.right || a.bottom + GAP < c.top || a.top - GAP > c.bottom);
    items.forEach((it, i) => {
      const s = sizes[i];
      let p = null;
      for (let k = 0; k < TRIES && !p; k++) {
        const x = Math.random() * (b.width - s.w), y = Math.random() * (b.height - s.h);
        const r = { left: x, right: x + s.w, top: y, bottom: y + s.h };
        if (!taken.some((t) => hit(r, t))) { p = { x, y }; taken.push(r); }
      }
      if (!p) {
        let best = null, far = -1;
        for (let gx = 0; gx < 20; gx++) for (let gy = 0; gy < 20; gy++) {
          const x = (gx / 20) * (b.width - s.w), y = (gy / 20) * (b.height - s.h);
          let near = Infinity;
          taken.forEach((t) => { near = Math.min(near, Math.hypot(x + s.w / 2 - (t.left + t.right) / 2, y + s.h / 2 - (t.top + t.bottom) / 2)); });
          if (near > far) { far = near; best = { x, y }; }
        }
        p = best || { x: 0, y: 0 };
        taken.push({ left: p.x, right: p.x + s.w, top: p.y, bottom: p.y + s.h });
      }
      pos[i] = p;
    });
  };
  place();
  const ro = new ResizeObserver(place);
  ro.observe(box);

  const off = { x: 0, y: 0 };
  let drag = false, lx = 0, ly = 0, vx = 0, vy = 0, dx = 0, dy = 0;
  on(window, "wheel", (e) => { e.preventDefault(); off.x += e.deltaX * 0.4; off.y += e.deltaY * 0.4; }, { passive: false });
  box.addEventListener("mousedown", (e) => { drag = true; lx = e.clientX; ly = e.clientY; vx = vy = 0; box.style.cursor = "grabbing"; });
  on(window, "mousemove", (e) => { if (!drag) return; dx = e.clientX - lx; dy = e.clientY - ly; off.x += dx; off.y += dy; lx = e.clientX; ly = e.clientY; });
  on(window, "mouseup", () => { if (drag) { vx = dx * 1.5; vy = dy * 1.5; } drag = false; box.style.cursor = "grab"; });
  box.addEventListener("touchstart", (e) => { drag = true; lx = e.touches[0].clientX; ly = e.touches[0].clientY; vx = vy = 0; }, { passive: true });
  box.addEventListener("touchmove", (e) => { if (!drag) return; dx = e.touches[0].clientX - lx; dy = e.touches[0].clientY - ly; off.x += dx; off.y += dy; lx = e.touches[0].clientX; ly = e.touches[0].clientY; }, { passive: true });
  box.addEventListener("touchend", () => { if (drag) { vx = dx * 1.5; vy = dy * 1.5; } drag = false; }, { passive: true });

  let labels = null;
  const tick = () => {
    if (!drag && (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1)) {
      off.x += vx; off.y += vy; vx *= 0.95; vy *= 0.95;
      if (Math.abs(vx) < 0.1) vx = 0;
      if (Math.abs(vy) < 0.1) vy = 0;
    }
    const b = box.getBoundingClientRect(), ib = inner.getBoundingClientRect();
    const cx = ib.left + ib.width / 2, cy = ib.top + ib.height / 2;
    const rIn = Math.min(ib.width, ib.height) / 2, rOut = Math.min(b.width, b.height) / 2;
    // Do all the reading first and the writing after — alternating read and write per heading recomputes layout dozens of times in one frame and delays clicks
    const rects = items.map((it) => it.getBoundingClientRect());
    labels ||= items.map((it) => it.querySelector(".circle__item__text"));
    items.forEach((it, i) => {
      const p = pos[i];
      const r = rects[i];
      if (r.top > b.bottom) p.y -= b.height + r.height;
      if (r.bottom < b.top) p.y += b.height + r.height;
      if (r.left > b.right) p.x -= b.width + r.width;
      if (r.right < b.left) p.x += b.width + r.width;
      const dist = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy);
      const sc = dist > rIn ? Math.max(0, 1 - (dist - rIn) / (rOut - rIn)) : 1;
      gsap.set(it, { x: p.x + off.x, y: p.y + off.y });
      gsap.set(labels[i], { scale: sc });
    });
  };
  every(tick);

  /* Lyrics: on touch, line chunks light up in random order, and rolling the wheel rewinds them */
  const texts = $$(".contents__item-text");
  const tls = new Map();
  texts.forEach((t) => {
    const spans = $$("span:not(.contents__item-text-break)", t);
    if (!spans.length) return;
    tls.set(t.getAttribute("item-id"), gsap.timeline({ paused: true }).fromTo(spans, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: { each: 0.01, from: "random", grid: "auto" } }));
  });
  const showText = (id) => texts.forEach((t) => {
    const on = t.getAttribute("item-id") === id;
    t.toggleAttribute("show-item", on);
    const tl = tls.get(t.getAttribute("item-id"));
    if (tl) on ? tl.play() : tl.reverse();
  });
  on(window, "wheel", () => tls.forEach((tl) => tl.reverse()), { passive: true });

  /* Curve connecting the touched titles: each fills in over 0.5s and vanishes 4 seconds later over 0.5s */
  const cv = document.querySelector(".circle__canvas");
  const ctx = cv.getContext("2d");
  const ink = window.sh.rgb("--kf-ink");
  const size = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
  size();
  on(window, "resize", size);
  const mouse = sp() ? { x: innerWidth / 2, y: innerHeight / 2 } : { x: null, y: null };
  if (!sp()) on(window, "mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  const trail = [];
  const touch = (i) => {
    let h = trail.find((t) => t.index === i);
    if (h) { clearTimeout(h.timer); gsap.to(h.p, { v: 1, duration: 0.5, ease: "power2.out" }); }
    else { h = { index: i, p: { v: 0 }, timer: 0 }; trail.push(h); gsap.to(h.p, { v: 1, duration: 0.5, ease: "power2.out" }); }
    h.timer = setTimeout(() => gsap.to(h.p, { v: 0, duration: 0.5, ease: "power2.out", onComplete: () => trail.splice(trail.indexOf(h), 1) }), 4000);
  };
  let activeId = null;
  every(() => {
    if (mouse.x !== null) {
      let hitId = null;
      items.forEach((it, i) => {
        const r = it.getBoundingClientRect();
        const inside = mouse.x >= r.left - 10 && mouse.x <= r.right + 10 && mouse.y >= r.top - 10 && mouse.y <= r.bottom + 10;
        it.toggleAttribute("item-active-target", inside);
        if (inside) { touch(i); hitId = it.getAttribute("item-id"); }
      });
      if (sp()) {
        const c = document.querySelector(".circle__box__circle").getBoundingClientRect();
        hitId = null;
        items.forEach((it) => { const r = it.getBoundingClientRect(); if (!(r.right < c.left || r.left > c.right || r.bottom < c.top || r.top > c.bottom)) hitId = it.getAttribute("item-id"); });
      }
      if (hitId !== activeId) { activeId = hitId; showText(hitId); }
    }
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (!trail.length || mouse.x === null) return;
    const f = cv.getBoundingClientRect();
    const pts = [{ x: mouse.x - f.left, y: mouse.y - f.top }, ...trail.map((t) => { const r = items[t.index].getBoundingClientRect(); return { x: r.left + r.width / 2 - f.left, y: r.top + r.height / 2 - f.top, v: t.p.v }; })];
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      const v = p2.v ?? 1;
      ctx.globalAlpha = v;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      for (let s = 1; s <= 16; s++) {
        const t = (s / 16) * v, t2 = t * t, t3 = t2 * t;
        const x = 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
        const y = 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  if (reduce) gsap.ticker.remove(tick), tick();
  // The record board blocks page scroll and uses the wheel to push the board. On moving to another page, smooth scroll turns back on.
  return () => { ro.disconnect(); window.lenis?.start(); };
});
