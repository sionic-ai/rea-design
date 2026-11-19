// Grab and drag the magnifier placed in the corner and it follows the cursor with a spring, and the hidden notes inside the glass (data-fx-part="secret") only is visible. When released, it returns to the corner.
(() => {
  kfFx.register("loupe-grab-reveal", (el, { options, reduce }) => {
    const secrets = [...el.querySelectorAll('[data-fx-part="secret"]')];
    const num = (k, d) => +(options[k] ?? d);
    const O = { dx: num("dock-x", 40), dy: num("dock-y", 132), r: num("r", 24) || 24, held: num("held-r", 128) || 128, k: num("k", 70) || 70, z: num("z", 0.92), kh: num("k-held", 520) || 520, zh: num("z-held", 0.72), glass: num("glass", 0.895) };
    const lens = document.createElement("div");
    lens.className = "fx-loupe";
    lens.setAttribute("aria-hidden", "true");
    lens.innerHTML = '<span class="fx-loupe-rim"></span><span class="fx-loupe-dot"></span><span class="fx-loupe-handle"></span>';
    document.body.appendChild(lens);
    const S = (x) => ({ x, v: 0 });
    const spring = (s, t, k, z, dt) => { const a = 2 * z * Math.sqrt(k); let left = dt; while (left > 0) { const h = Math.min(left, 1 / 120); s.v += (k * (t - s.x) - a * s.v) * h; s.x += s.v * h; left -= h; } };
    const dock = () => ({ x: innerWidth - O.dx, y: innerHeight - O.dy });
    const d0 = dock();
    const p = { x: S(d0.x), y: S(d0.y), R: S(O.r) };
    let held = false, px = d0.x, py = d0.y, gx = 0, gy = 0, raf = 0, last = 0;
    const paint = () => {
      const R = p.R.x, g = R * O.glass;
      lens.style.width = lens.style.height = `${2 * R}px`;
      lens.style.transform = `translate3d(${(p.x.x - R).toFixed(1)}px, ${(p.y.x - R).toFixed(1)}px, 0)`;
      for (const s of secrets) {
        const b = s.getBoundingClientRect();
        const hit = p.x.x + g > b.left && p.x.x - g < b.right && p.y.x + g > b.top && p.y.x - g < b.bottom;
        s.style.setProperty("--fx-sx", `${(p.x.x - b.left).toFixed(1)}px`);
        s.style.setProperty("--fx-sy", `${(p.y.x - b.top).toFixed(1)}px`);
        s.style.setProperty("--fx-sr", hit ? `${g.toFixed(1)}px` : "0px");
        s.classList.toggle("is-lit", hit);
        if (hit && held && !s.classList.contains("is-found") && Math.hypot(b.left + b.width / 2 - p.x.x, b.top + b.height / 2 - p.y.x) < Math.max(40, 0.55 * g)) {
          s.classList.add("is-found");
          s.dispatchEvent(new CustomEvent("fx:found", { bubbles: true }));
        }
      }
    };
    const tick = (now) => {
      raf = 0;
      const dt = Math.min(0.05, Math.max(0.001, (now - (last || now)) / 1000)); last = now;
      const tx = held ? px + gx : dock().x, ty = held ? py + gy : dock().y, tr = held ? O.held : O.r;
      if (reduce) { p.x = S(tx); p.y = S(ty); p.R = S(tr); }
      else {
        spring(p.x, tx, held ? O.kh : O.k, held ? O.zh : O.z, dt);
        spring(p.y, ty, held ? O.kh : O.k, held ? O.zh : O.z, dt);
        spring(p.R, tr, 150, 0.9, dt);
      }
      paint();
      const moving = Math.abs(p.x.v) + Math.abs(p.y.v) + Math.abs(p.R.v) > 0.5 || Math.abs(tx - p.x.x) + Math.abs(ty - p.y.x) + Math.abs(tr - p.R.x) > 0.3;
      if (held || moving) raf = requestAnimationFrame(tick); else last = 0;
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const ac = new AbortController(), on = { signal: ac.signal };
    lens.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      try { lens.setPointerCapture(e.pointerId); } catch (err) {}
      held = true; px = e.clientX; py = e.clientY;
      gx = p.x.x - px; gy = p.y.x - py;
      lens.classList.add("is-held");
      e.preventDefault();
      ask();
    }, on);
    const drop = () => { if (!held) return; held = false; lens.classList.remove("is-held"); ask(); };
    lens.addEventListener("pointerup", drop, on);
    lens.addEventListener("pointercancel", drop, on);
    addEventListener("pointermove", (e) => { if (!held) return; px = e.clientX; py = e.clientY; ask(); }, { passive: true, signal: ac.signal });
    addEventListener("keydown", (e) => e.key === "Escape" && drop(), on);
    addEventListener("resize", ask, on);
    addEventListener("scroll", ask, { passive: true, signal: ac.signal });
    paint();
    return () => { ac.abort(); cancelAnimationFrame(raf); lens.remove(); secrets.forEach((s) => { s.classList.remove("is-lit"); s.style.removeProperty("--fx-sr"); }); };
  });
})();
