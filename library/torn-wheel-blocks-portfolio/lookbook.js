// Photo: a closed knot (trefoil) curve is both the camera’s path and the spine of the photos. The camera rides the curve (.012 turns per second + .00009 turns per wheel px, .35s rubber band)
// Looks slightly ahead (.08 lap). Photo panels scatter in place along the curve, ±1425px sideways and up/down and ±1200px front/back, never come within 960px of the curve, and always face the camera head-on.
// Camera matrix written by hand, placing each panel’s view-space position with translate3d — perspective is CSS perspective. The eye shifts 90·55px with the mouse (.28s).
(() => {
  const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  UC.page("lookbook", (main) => {
    const world = main.querySelector(".pg__world"), view = main.querySelector(".pg__view");
    if (!world) return;
    const planes = [...world.querySelectorAll(".pg__plane")];
    const ac = new AbortController(), on = { signal: ac.signal };
    const reduce = UC.reduce;
    const S = 1150;
    const knot = (t) => { const a = t * Math.PI * 2; return [(Math.sin(a) + 2 * Math.sin(2 * a)) * S, (Math.cos(a) - 2 * Math.cos(2 * a)) * S * 0.6, -Math.sin(3 * a) * S]; };
    const R = rnd(57);
    const sizes = [[170, 113], [136, 170], [170, 96], [146, 146]];
    const pts = planes.map((el, i) => {
      const t = i / planes.length;
      const c = knot(t);
      let ox, oy, oz;
      do { ox = (R() * 2 - 1) * 1425; oy = (R() * 2 - 1) * 1425; } while (Math.hypot(ox, oy) < 960);
      oz = (R() * 2 - 1) * 1200;
      const [w, h] = sizes[i % sizes.length];
      el.style.setProperty("--w", `${w}px`); el.style.setProperty("--h", `${h}px`);
      return { el, p: [c[0] + ox, c[1] + oy, c[2] + oz], w, h };
    });
    let u = 0, ut = 0, mx = 0, my = 0, ex = 0, ey = 0, last = 0, raf = 0, alive = true, open = false;
    addEventListener("wheel", (e) => { if (!open) ut += e.deltaY * 0.00009; }, { signal: ac.signal, passive: true });
    addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, on);
    main.querySelectorAll("[data-pg]").forEach((b) => b.addEventListener("click", () => (ut += +b.dataset.pg * 0.05), on));
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const norm = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const frame = (now) => {
      if (!alive) return;
      const dt = last ? Math.max(1, now - last) / 1000 : 1 / 60;
      last = now;
      if (!reduce && !open) ut += 0.012 * dt;
      u += (ut - u) * (reduce ? 1 : 1 - Math.exp(-dt / 0.35));
      ex += (mx - ex) * (reduce ? 1 : 1 - Math.exp(-dt / 0.28));
      ey += (my - ey) * (reduce ? 1 : 1 - Math.exp(-dt / 0.28));
      const eye = knot(u), look = knot(u + 0.08);
      const f = norm(sub(look, eye));
      const r = norm(cross(f, [0, 1, 0]));
      const up = cross(r, f);
      // Eyes dodge toward the mouse (90·55px ×8 scale), and the gaze target turns along by only .35
      const k = 8;
      const off = [r[0] * ex * 90 * k + up[0] * -ey * 55 * k, r[1] * ex * 90 * k + up[1] * -ey * 55 * k, r[2] * ex * 90 * k + up[2] * -ey * 55 * k];
      const E = [eye[0] + off[0] * 0.65, eye[1] + off[1] * 0.65, eye[2] + off[2] * 0.65];
      for (const q of pts) {
        const d = sub(q.p, E);
        const x = dot(d, r), y = dot(d, up), z = dot(d, f);
        if (z < 100 || z > 9000) { q.el.style.visibility = "hidden"; continue; }
        q.el.style.visibility = "visible";
        q.el.style.transform = `translate3d(${(x - q.w / 2).toFixed(1)}px, ${(-y - q.h / 2).toFixed(1)}px, ${(900 - z).toFixed(1)}px)`;
        q.el.style.zIndex = String(10000 - Math.round(z));
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Press and it flies from its plate to the large center plate in .42s and the background goes black, press again to return
    const box = main.querySelector(".pg__box"), boxPic = box.querySelector(".pg__boxpic");
    let from = null;
    const fly = (toOpen) => new Promise((res) => {
      const a = from.getBoundingClientRect(), b = boxPic.getBoundingClientRect();
      const tf = `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
      gsap.fromTo(boxPic, { transform: toOpen ? tf : "none" }, { transform: toOpen ? "none" : tf, duration: reduce ? 0 : 0.42, ease: "power3.out", onComplete: res });
    });
    view.addEventListener("click", (e) => {
      const pl = e.target.closest(".pg__plane");
      if (!pl || open) return;
      open = true; from = pl;
      boxPic.dataset.label = pl.querySelector(".pg__pic").dataset.label;
      box.hidden = false;
      requestAnimationFrame(() => box.classList.add("is-open"));
      fly(true);
    }, on);
    box.addEventListener("click", () => {
      box.classList.remove("is-open");
      fly(false).then(() => { box.hidden = true; open = false; gsap.set(boxPic, { clearProps: "transform" }); });
    }, on);
    return () => { alive = false; cancelAnimationFrame(raf); ac.abort(); gsap.killTweensOf(boxPic); };
  });
})();
