(() => {
  // Pressing on the board sticks a sticker in place, tilted ±24° (max 12) — drag while pressed and it stretches, then detaches past 140px and follows along.
  const shapes = [
    (c) => `<svg viewBox="0 0 100 100"><path d="M50 4l12 30 32 2-25 20 9 31-28-18-28 18 9-31L6 36l32-2z" style="fill:${c}"/></svg>`,
    (c) => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" style="fill:${c}"/></svg>`,
    (c) => `<svg viewBox="0 0 100 100"><rect x="6" y="22" width="88" height="56" rx="28" style="fill:${c}"/></svg>`,
    (c) => `<svg viewBox="0 0 100 100"><path d="M50 6c10 18 26 18 44 18-8 18-8 34 0 52-18 0-34 0-44 18-10-18-26-18-44-18 8-18 8-34 0-52 18 0 34 0 44-18z" style="fill:${c}"/></svg>`,
  ];
  const tones = ["var(--kf-accent)", "var(--kf-accent-soft)", "var(--kf-accent-text)", "var(--kf-ink)"];
  kfFx.register("click-sticker-drop", (el, { options, reduce }) => {
    const size = +(options.size || 330), mobile = +(options.mobile || 66), max = +(options.max || 12), snap = +(options.snap || 140);
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    const layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    Object.assign(layer.style, { position: "absolute", inset: "0", pointerEvents: "none", overflow: "hidden", zIndex: "30" });
    el.append(layer);
    const stickers = [];
    let pull = null;
    const pick = () => ({ shape: Math.floor(Math.random() * shapes.length), tone: Math.floor(Math.random() * tones.length), rot: -24 + 48 * Math.random() });
    let next = pick();
    const down = (e) => {
      if (e.button > 0 || e.target.closest("a, button, input, [role='button'], [data-no-sticker]")) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const s = document.createElement("div");
      const px = innerWidth < 768 ? mobile : size;
      const rot = next.rot;
      s.innerHTML = shapes[next.shape](tones[next.tone]);
      next = pick();
      Object.assign(s.style, { position: "absolute", left: `${x - px / 2}px`, top: `${y - px / 2}px`, width: `${px}px`, height: `${px}px` });
      layer.append(s);
      stickers.push(s);
      while (stickers.length > max) stickers.shift().remove();
      gsap.set(s, { rotate: rot });
      if (!reduce) gsap.fromTo(s, { scale: 0.6 }, { scale: 1, duration: 0.35, ease: "back.out(2)" });
      if (e.pointerType === "mouse" && !reduce) pull = { s, x, y, snapped: false };
    };
    const move = (e) => {
      if (!pull) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - r.left - pull.x, dy = e.clientY - r.top - pull.y;
      if (!pull.snapped && Math.hypot(dx, dy) > snap) pull.snapped = true;
      const k = pull.snapped ? 1 : 0.25;
      gsap.to(pull.s, { x: dx * k, y: dy * k, duration: 0.2, ease: "power2.out", overwrite: "auto" });
    };
    const up = () => {
      if (!pull) return;
      if (!pull.snapped) gsap.to(pull.s, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.55)" });
      pull = null;
    };
    el.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    return () => { el.removeEventListener("pointerdown", down); removeEventListener("pointermove", move); removeEventListener("pointerup", up); layer.remove(); };
  });
})();
