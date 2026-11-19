// Like the original, cursor speed is measured once per rAF from mousemove over the area, and thrown with the speed and torque at the moment of entering the section
(() => {
  kfFx.register("momentum-hover", (root, { options, reduce, hover }) => {
    if (reduce || !hover || !window.InertiaPlugin) return;
    gsap.registerPlugin(InertiaPlugin);
    const xy = +(options.xy ?? 30), rot = +(options.rotation ?? 20), resistance = +(options.resistance ?? 200);
    // max · spinmax — caps on throw speed and spin speed, duration — when fixing the inertia length (seconds), least — even a slow brush bounces this much (brand logo .6)
    const max = +(options.max ?? 1080), spinmax = +(options.spinmax ?? 60), duration = +(options.duration ?? 0), least = +(options.least ?? 0);
    const clampXY = gsap.utils.clamp(-max, max), clampR = gsap.utils.clamp(-spinmax, spinmax);
    let px = 0, py = 0, vx = 0, vy = 0, started = false, raf = 0;
    const ac = new AbortController(), on = { signal: ac.signal };
    root.addEventListener("mousemove", (e) => {
      if (!started) return void ((started = true), (px = e.clientX), (py = e.clientY));
      if (raf) return;
      const x = e.clientX, y = e.clientY;
      raf = requestAnimationFrame(() => { vx = x - px; vy = y - py; px = x; py = y; raf = 0; });
    }, on);
    const targets = [];
    const toss = (item, x, y, ux, uy) => {
      const t = item.querySelector('[data-fx-part="target"]') || item;
      const boost = least ? Math.max(1, (least * max) / (xy * Math.hypot(ux, uy) || 1)) : 1;
      const r = t.getBoundingClientRect();
      const ox = x - (r.left + r.width / 2), oy = y - (r.top + r.height / 2);
      const torque = ((ox * uy - oy * ux) / (Math.hypot(ox, oy) || 1)) * boost;
      targets.includes(t) || targets.push(t);
      gsap.to(t, { inertia: { x: { velocity: clampXY(ux * boost * xy), end: 0 }, y: { velocity: clampXY(uy * boost * xy), end: 0 }, rotation: { velocity: clampR(torque * rot), end: 0 }, resistance, ...(duration ? { duration } : {}) } });
    };
    if (least) {
      // A fast sweep leaves letters that mouseover skipped — probe every 4px from the previous position to the current one and hit every item passed over.
      let lx = null, ly = null, lastItem = null;
      // The first move entering from outside the area must also count as a path, so listen on the whole window (the original also uses window mousemove)
      addEventListener("mousemove", (e) => {
        if (lx !== null) {
          const hx = e.clientX - lx, hy = e.clientY - ly, steps = Math.max(1, Math.ceil(Math.hypot(hx, hy) / 4));
          const box = root.getBoundingClientRect();
          for (let i = 1; i <= steps; i++) {
            const x = lx + (hx * i) / steps, y = ly + (hy * i) / steps;
            const hit = x < box.left || x > box.right || y < box.top || y > box.bottom ? null : document.elementFromPoint(x, y)?.closest('[data-fx-part="item"]');
            if (hit && hit !== lastItem && root.contains(hit)) toss(hit, x, y, hx, hy);
            lastItem = hit || null;
          }
        }
        lx = e.clientX; ly = e.clientY;
      }, on);
      document.addEventListener("mouseleave", () => { lx = ly = null; lastItem = null; }, on);
    } else {
      // Delegated from the area so late-arriving sections are caught too — mouseenter doesn’t bubble, so only the moment of entering is seen via mouseover
      root.addEventListener("mouseover", (e) => {
        const item = e.target.closest('[data-fx-part="item"]');
        if (!item || !root.contains(item) || (e.relatedTarget && item.contains(e.relatedTarget))) return;
        toss(item, e.clientX, e.clientY, vx, vy);
      }, on);
    }
    return () => { ac.abort(); cancelAnimationFrame(raf); if (targets.length) gsap.killTweensOf(targets), gsap.set(targets, { clearProps: "transform" }); };
  });
})();
