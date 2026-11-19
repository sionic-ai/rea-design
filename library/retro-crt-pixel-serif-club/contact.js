// Contact section — photo strip (original pssst strip): the strip is duplicated to over 3x the screen width, and every frame it is pushed left by window width × speed (wide screen .02, under 1024 .1) × elapsed seconds
(() => {
  const strip = (root, k) => {
    const carousel = root.querySelector("[data-pssst-carousel]"), track = root.querySelector("[data-pssst-track]");
    if (!carousel || !track) return;
    const items = [...track.querySelectorAll("[data-pssst-item]")];
    if (!items.length) return;
    const speed = () => (innerWidth <= 1024 ? 0.1 : 0.02);
    const width = () => items.reduce((s, it) => { const cs = getComputedStyle(it); return s + it.offsetWidth + (parseFloat(cs.marginRight) || 0) + (parseFloat(cs.marginLeft) || 0); }, 0);
    const fill = () => {
      track.querySelectorAll('[data-pssst-clone="true"]').forEach((c) => c.remove());
      const w = width(), n = w === 0 ? 2 : Math.max(2, Math.ceil((3 * innerWidth) / w) - 1);
      for (let i = 0; i < n; i++) items.forEach((it) => { const c = it.cloneNode(true); c.setAttribute("data-pssst-clone", "true"); c.setAttribute("aria-hidden", "true"); track.append(c); });
      return w;
    };
    let span = fill(), x = 0, last = null, raf = 0, rt = 0, p = speed();
    const tick = (now) => {
      if (last === null) last = now;
      const dt = (now - last) / 1000;
      last = now;
      if (span > 0 && dt < 0.5) { x += innerWidth * p * dt; x = ((x % span) + span) % span; track.style.transform = `translate3d(${-x}px, 0, 0)`; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    k.on(window, "resize", () => { clearTimeout(rt); rt = setTimeout(() => { span = fill(); p = speed(); x %= span || 1; }, 150); });
    k.add(() => { cancelAnimationFrame(raf); clearTimeout(rt); track.querySelectorAll('[data-pssst-clone="true"]').forEach((c) => c.remove()); track.style.transform = ""; });
  };

  TDS.page("contact", (root, { k, reduce }) => { if (!reduce) strip(root, k); });
})();
