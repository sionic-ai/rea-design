// About: front photo parallax, and a face looking toward the mouse (front + 8 directions).
// Original values — anchor point (0.5, 0.32), radius 1.05 (in face-width units), center ignore 0.12, direction-change margin 6°.
// When mouse, scroll and press are idle for 5 seconds, each face looks around separately: sides stay 0.55~1.1s, front stays 1.4s, with a 0.22 chance of returning to front.
(() => {
  const mm = gsap.matchMedia();
  const DIRS = ["right", "down-right", "down", "down-left", "left", "up-left", "up", "up-right"];
  const G = { ox: 0.5, oy: 0.32, radius: 1.05, dead: 0.12, hyst: 6 };
  const W = { delay: 5000, holdMin: 550, holdMax: 1100, centerHold: 1400, centerChance: 0.22 };
  const portraits = [...document.querySelectorAll("[data-gaze]")].map((el) => ({ el, dir: "center" }));
  const setDir = (p, dir) => {
    p.dir = dir;
    p.el.dataset.gaze = dir;
    const i = DIRS.indexOf(dir);
    p.el.style.setProperty("--gaze-on", i < 0 ? 0 : 1);
    if (i >= 0) p.el.style.setProperty("--gaze-a", i * 45 + "deg");
  };
  const pick = (p, x, y) => {
    const r = p.el.getBoundingClientRect();
    const dx = (x - r.left - r.width * G.ox) / r.width, dy = (y - r.top - r.height * G.oy) / r.width;
    const dist = Math.hypot(dx, dy), held = p.dir !== "center", slack = G.dead * 0.15;
    if (dist > G.radius + (held ? slack : 0) || dist < G.dead + (held ? -slack : slack)) return "center";
    const a = Math.atan2(dy, dx), step = Math.PI / 4, cur = DIRS.indexOf(p.dir);
    if (cur >= 0) {
      const diff = Math.atan2(Math.sin(a - cur * step), Math.cos(a - cur * step));
      if (Math.abs(diff) <= step / 2 + G.hyst * Math.PI / 180) return p.dir;
    }
    return DIRS[(Math.round(a / step) + 8) % 8];
  };

  // The original also turns this on only on devices with a mouse — touch screens stay front-facing
  mm.add("(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
    let last = null, idle = 0;
    const shown = (p) => { const r = p.el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
    const look = () => portraits.forEach((p) => { const d = last && shown(p) ? pick(p, last.x, last.y) : "center"; if (d !== p.dir) setDir(p, d); });
    const step = (p) => {
      // A face off-screen is left to rest — the scroll on re-entry restarts the 5s count via wake
      if (!shown(p)) return setDir(p, "center");
      const i = DIRS.indexOf(p.idle);
      p.idle = i < 0 ? DIRS[Math.floor(Math.random() * 8)] : Math.random() < W.centerChance ? "center" : DIRS[(i + (Math.random() < 0.5 ? -1 : 1) + 8) % 8];
      setDir(p, p.idle);
      p.wander = setTimeout(() => step(p), p.idle === "center" ? W.centerHold : W.holdMin + Math.random() * (W.holdMax - W.holdMin));
    };
    const stop = () => { clearTimeout(idle); portraits.forEach((p) => { clearTimeout(p.wander); p.idle = "center"; }); };
    const wake = () => { stop(); look(); idle = setTimeout(() => portraits.forEach(step), W.delay); };
    const onMove = (e) => {
      if (e.pointerType !== "mouse") { last = null; stop(); look(); return; }
      last = { x: e.clientX, y: e.clientY };
      wake();
    };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", stop, { passive: true });
    addEventListener("pointerup", wake, { passive: true });
    addEventListener("scroll", wake, { passive: true });
    // The original also counts the page open as the last movement — even with no mouse, it looks around after 5 seconds
    wake();
    return () => {
      removeEventListener("pointermove", onMove); removeEventListener("pointerdown", stop); removeEventListener("pointerup", wake); removeEventListener("scroll", wake);
      stop(); portraits.forEach((p) => setDir(p, "center"));
    };
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const fulls = [...document.querySelectorAll(".about-full")];
    const onScroll = () => fulls.forEach((full) => {
      const r = full.getBoundingClientRect();
      const p = (innerHeight - r.top) / (innerHeight + r.height);
      full.style.setProperty("--parallax", (Math.max(0, Math.min(1, p)) * 2 - 1).toFixed(4));
    });
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  });
})();
