// Photos around the board center are linked by lines (SVG) in angle order, and the lines sway with wind waves and spring nodes (ends fixed).
// When the mouse passes near the string it pushes the joint in the direction it passed, and when a hand is on the photo it tilts 6° more toward the side the hand came from.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  // Each photo always has the same ±3° base tilt — set by index so it doesn’t change each time it opens
  const baseTilt = (i, range) => { const n = Math.sin((i + 1) * 12.9898) * 43758.5453; return ((n - Math.floor(n)) * 2 - 1) * range; };
  const rand = (a, b) => a + Math.random() * (b - a);

  kfFx.register("rope-hang-photos", (el, { options, reduce, hover }) => {
    const photos = [...el.querySelectorAll("[data-fx-part=photo]")];
    if (photos.length < 2) return;
    let svg = el.querySelector("[data-fx-part=ropes]");
    const made = !svg;
    if (made) {
      svg = document.createElementNS(NS, "svg");
      svg.setAttribute("data-fx-part", "ropes");
      svg.setAttribute("aria-hidden", "true");
      el.prepend(svg);
    }
    const tiltRange = +(options.tilt ?? 3);
    const lean = +(options.lean ?? 6);
    const waveAmp = +(options.wave ?? 1);
    const sagK = +(options.sag ?? 0.08);
    const N = 24, K = 640, DAMP = 0.55;

    photos.forEach((p, i) => gsap.set(p, { rotation: baseTilt(i, tiltRange), transformOrigin: "50% 0%" }));

    let ropes = [], W = 0, H = 0;
    const measure = () => {
      const box = el.getBoundingClientRect();
      W = box.width; H = box.height;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const pins = photos.map((p) => {
        const r = p.getBoundingClientRect();
        // Measured with the tilt applied, so re-find the center above the photo (the rotation axis is top center, so that point doesn’t move)
        const x = (r.left + r.right) / 2 - box.left, y = r.top - box.top + 4;
        return { x, y, a: Math.atan2(y - H / 2, x - W / 2) };
      }).map((pin, i) => ({ ...pin, i })).sort((a, b) => a.a - b.a);
      const keep = ropes;
      svg.replaceChildren();
      ropes = pins.map((p0, k) => {
        const p1 = pins[(k + 1) % pins.length];
        const old = keep[k];
        const path = document.createElementNS(NS, "path");
        svg.append(path);
        return old ? Object.assign(old, { p0, p1, path }) : {
          p0, p1, path,
          o: new Float32Array(N + 1), v: new Float32Array(N + 1),
          phase: rand(0, Math.PI * 2), cycles: rand(1.8, 3.3), amp: rand(10, 19) * waveAmp, drift: rand(0.16, 0.34),
        };
      });
    };

    const pointsOf = (r, t) => {
      const dx = r.p1.x - r.p0.x, dy = r.p1.y - r.p0.y, len = Math.hypot(dx, dy) || 1;
      let nx = -dy / len, ny = dx / len;
      if (ny < 0) { nx = -nx; ny = -ny; }
      r.nx = nx; r.ny = ny;
      const pts = [];
      for (let k = 0; k <= N; k++) {
        const s = k / N, bell = Math.sin(Math.PI * s);
        const ph = r.phase + t * r.drift * Math.PI * 2;
        const wave = bell * r.amp * 0.35 * (Math.sin(s * Math.PI * 2 * r.cycles + ph) + 0.28 * Math.sin(s * Math.PI * 2 * (r.cycles * 0.52 + 0.35) + ph * 1.41));
        const off = bell * len * sagK + wave + r.o[k];
        pts.push([r.p0.x + dx * s + nx * off, r.p0.y + dy * s + ny * off]);
      }
      return pts;
    };
    const draw = (t) => ropes.forEach((r) => r.path.setAttribute("d", pointsOf(r, t).map((p, k) => `${k ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("")));

    measure();
    draw(0);
    if (reduce) return () => { made ? svg.remove() : svg.replaceChildren(); gsap.set(photos, { clearProps: "transform" }); };

    // Spring node: pulls by the difference from its neighbors and damps in proportion to speed. Both ends are tied to the photos at 0
    const step = (r, dt) => {
      const { o, v } = r;
      for (let k = 1; k < N; k++) v[k] += (K * (o[k - 1] + o[k + 1] - 2 * o[k]) - DAMP * v[k]) * dt;
      for (let k = 1; k < N; k++) o[k] += v[k] * dt;
    };
    let t = 0, last = 0, running = false;
    const tick = (time) => {
      if (!last) last = time;
      const dt = Math.min(1 / 30, Math.max(0.001, time - last));
      last = time;
      t += dt;
      ropes.forEach((r) => { step(r, dt / 2); step(r, dt / 2); });
      draw(t);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; last = 0; gsap.ticker.add(tick); }
      else if (!e.isIntersecting && running) { running = false; gsap.ticker.remove(tick); }
    });
    io.observe(el);

    // When the mouse passes within 60px of the line, push that segment in the direction it passed (the line’s normal component)
    let px = null, py = null;
    const onMove = (e) => {
      const box = el.getBoundingClientRect();
      const x = e.clientX - box.left, y = e.clientY - box.top;
      if (px !== null) {
        const mx = x - px, my = y - py;
        ropes.forEach((r) => {
          const pts = pointsOf(r, t);
          let best = -1, bd = 60;
          pts.forEach((p, k) => { const d = Math.hypot(p[0] - x, p[1] - y); if (d < bd && k > 0 && k < N) { bd = d; best = k; } });
          if (best < 0) return;
          const push = (mx * r.nx + my * r.ny) * 18 * (1 - bd / 60);
          for (let k = Math.max(1, best - 2); k <= Math.min(N - 1, best + 2); k++) r.v[k] += push * (1 - Math.abs(k - best) / 3);
        });
      }
      px = x; py = y;
    };
    const onLeave = () => { px = py = null; };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    const offs = photos.map((p, i) => {
      if (!hover) return null;
      const enter = (e) => {
        const r = p.getBoundingClientRect();
        const side = e.clientX < r.left + r.width / 2 ? -1 : 1;
        gsap.to(p, { rotation: baseTilt(i, tiltRange) + side * lean, duration: 0.64, ease: "power2.out", overwrite: true });
      };
      const leave = () => gsap.to(p, { rotation: baseTilt(i, tiltRange), duration: 0.44, ease: "power3.out", overwrite: true });
      p.addEventListener("pointerenter", enter);
      p.addEventListener("pointerleave", leave);
      return () => { p.removeEventListener("pointerenter", enter); p.removeEventListener("pointerleave", leave); };
    });

    const ro = new ResizeObserver(() => { measure(); draw(t); });
    ro.observe(el);

    return () => {
      gsap.ticker.remove(tick); io.disconnect(); ro.disconnect();
      el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave);
      offs.forEach((f) => f?.());
      gsap.killTweensOf(photos);
      gsap.set(photos, { clearProps: "transform" });
      made ? svg.remove() : svg.replaceChildren();
    };
  });
})();
