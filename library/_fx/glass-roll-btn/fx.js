(() => {
  // All buttons share one tick — so each button doesn’t run its own rAF
  const live = new Set();
  let cols = null, ticking = false;
  const read = () => {
    const s = getComputedStyle(document.documentElement);
    cols = ["--kf-accent", "--kf-accent-soft", "--kf-surface"].map((n) => s.getPropertyValue(n).trim());
  };
  const tick = (t) => {
    for (const b of live) {
      if (!b.cv.offsetParent) continue;
      const x = b.cx;
      x.clearRect(0, 0, 120, 40);
      x.globalAlpha = b.glow;
      for (let i = 0; i < 3; i++) {
        const a = t * b.speed + b.seed + i * 2.1, px = 60 + Math.cos(a) * 40, py = 20 + Math.sin(a * 1.3) * 10;
        const g = x.createRadialGradient(px, py, 0, px, py, 34);
        g.addColorStop(0, cols[i] || cols[0]);
        g.addColorStop(1, "transparent");
        x.fillStyle = g;
        x.fillRect(0, 0, 120, 40);
      }
    }
  };
  kfFx.register("glass-roll-btn", (el, { options, reduce, hover }) => {
    if (!cols) { read(); new MutationObserver(read).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] }); }
    const glowBox = document.createElement("span");
    glowBox.className = "fx-grb-glow";
    const cv = document.createElement("canvas");
    cv.width = 120; cv.height = 40;
    glowBox.appendChild(cv);
    const shadow = document.createElement("span");
    shadow.className = "fx-grb-shadow";
    el.prepend(glowBox, shadow);
    const label = el.querySelector("[data-fx-part=label]");
    let roll = null;
    if (label && hover) {
      roll = document.createElement("span");
      roll.className = "fx-grb-roll";
      label.replaceWith(roll);
      const twin = label.cloneNode(true);
      twin.setAttribute("aria-hidden", "true");
      twin.removeAttribute("data-fx-part");
      roll.append(label, twin);
    }
    const b = { cv, cx: cv.getContext("2d"), seed: Math.random() * 10, speed: reduce ? 0 : +(options.speed ?? 0.6), glow: +(options.glow ?? 0.55) };
    live.add(b);
    if (!ticking) { ticking = true; gsap.ticker.add(tick); }
    tick(gsap.ticker.time);
    return () => {
      live.delete(b);
      if (!live.size) { gsap.ticker.remove(tick); ticking = false; }
      glowBox.remove(); shadow.remove();
      if (roll) { const lb = roll.firstElementChild; roll.replaceWith(lb); }
    };
  });
})();
