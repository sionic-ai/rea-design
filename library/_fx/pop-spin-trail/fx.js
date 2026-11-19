(() => {
  kfFx.register("pop-spin-trail", (el, { options, reduce, hover }) => {
    const sources = [...el.querySelectorAll('[data-fx-part="source"]')];
    if (!sources.length || reduce || !hover) return;
    const layer = el.querySelector('[data-fx-part="layer"]') || el;

    const base = +(options.base ?? 1600);
    const k = () => (base ? Math.min(1.6, Math.max(0.64, innerWidth / base)) : 1);
    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
    const step = () => clamp(+(options.step ?? 40) * k(), 28, 64);
    const sizeOf = (speed) => clamp((+(options.size ?? 190) + +(options.grow ?? 120) * speed) * k(), 150, 420);
    const ratio = +(options.ratio ?? 0.95);
    const spin = +(options.spin ?? 360);
    const max = +(options.max ?? 18) || 18;

    const live = new Set(), pool = [];
    let next = 0, z = 0, armed = false, lx = 0, ly = 0, px = 0, py = 0, pt = 0, speed = 0;

    const take = () => {
      const node = pool.pop() || sources[next % sources.length].cloneNode(true);
      node.removeAttribute("data-fx-part");
      node.classList.add("fx-pop-spin");
      node.setAttribute("aria-hidden", "true");
      next = (next + 1) % sources.length;
      return node;
    };
    const give = (node) => { node.remove(); node.removeAttribute("style"); if (pool.length < max) pool.push(node); };

    const drop = (x, y) => {
      const node = take();
      const box = layer.getBoundingClientRect();
      const s = sizeOf(speed);
      const rot = (Math.random() - 0.5) * 30 * (1 + speed * 2);
      layer.append(node);
      gsap.set(node, { left: x - box.left, top: y - box.top, width: s, height: s * ratio, xPercent: -50, yPercent: -50, rotation: rot, scale: 0, autoAlpha: 1, zIndex: ++z });
      const tl = gsap.timeline({ onComplete: () => { live.delete(tl); give(node); } })
        .to(node, { scale: 1, duration: 0.55, ease: "back.out(1.25)" })
        .to(node, { scale: 0, rotation: rot + spin, duration: 0.8, ease: "power4.inOut" }, "+=0.05");
      live.add(tl);
    };

    const move = (e) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const now = performance.now();
      if (!armed) { armed = true; lx = px = e.clientX; ly = py = e.clientY; pt = now; return; }
      const v = clamp(Math.hypot(e.clientX - px, e.clientY - py) / Math.max(now - pt, 1) / 1.2, 0, 1);
      speed = speed * 0.75 + v * 0.25;
      px = e.clientX; py = e.clientY; pt = now;
      if (Math.hypot(e.clientX - lx, e.clientY - ly) < step()) return;
      lx = e.clientX; ly = e.clientY;
      drop(e.clientX, e.clientY);
    };
    const leave = () => { armed = false; speed = 0; };

    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      live.forEach((t) => t.kill());
      live.clear();
      layer.querySelectorAll(".fx-pop-spin").forEach((n) => n.remove());
      pool.length = 0;
    };
  });
})();
