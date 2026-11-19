// The ball sticks directly to the mouse, each tail dot follows the previous one by .42 per frame, so moving fast lengthens the tail.
// Runs only inside the element it is attached to — on body it covers the whole page, on a single panel the ball works only over that panel.
// Verbs and dark stage marks: put data-fx-cursor-ball on any inner element="verb: view; tone: dark" write as
// Options (data-fx-cursor-ball on the attached element): stretch is the maximum the ball stretches in its direction when moving fast, hop is the height (px) the ball jumps when pressed,
// trail·lag are exponential-interpolation speeds (per second) at which tail dots·verb letters follow — if empty, as before: tail .42 per frame, verb immediate
(() => {
  const read = (n) => {
    const o = {};
    for (const p of (n?.getAttribute("data-fx-cursor-ball") || "").split(";")) { const i = p.indexOf(":"); if (i > 0) o[p.slice(0, i).trim()] = p.slice(i + 1).trim(); }
    return o;
  };
  kfFx.register("cursor-ball", (root, { options, hover, reduce }) => {
    if (!hover) return;
    const stretch = +(options.stretch ?? 0), hopH = +(options.hop ?? 0), trailK = +(options.trail ?? 0), lagK = +(options.lag ?? 0);
    const ac = new AbortController(), on = { signal: ac.signal, passive: true };
    const c = document.createElement("span");
    c.className = "fx-cursor";
    c.dataset.mode = "idle";
    c.innerHTML = `<span class="fx-cursor__verb"><span></span></span><span class="fx-cursor__trail">${'<span class="fx-cursor__dot"></span>'.repeat(6)}</span><span class="fx-cursor__ball"><i></i></span>`;
    document.body.append(c);
    root.classList.add("fx-has-cursor");
    const ball = c.querySelector(".fx-cursor__ball"), verb = c.querySelector(".fx-cursor__verb"), word = verb.firstElementChild;
    const dots = [...c.querySelectorAll(".fx-cursor__dot")];
    [12, 10.5, 9, 7.5, 6, 4.5].forEach((d, i) => { dots[i].style.setProperty("--d", `${d}px`); dots[i].style.opacity = [0.85, 0.7, 0.55, 0.4, 0.28, 0.16][i]; });
    if (reduce) c.querySelector(".fx-cursor__trail").remove();
    const pts = dots.map(() => ({ x: -100, y: -100 }));
    let mx = -100, my = -100;
    root.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      mx = e.clientX; my = e.clientY;
      c.classList.add("is-on");
      const t = e.target.closest?.("[data-fx-cursor-ball]"), o = root.contains(t) ? read(t) : {};
      c.dataset.mode = o.verb ? "word" : "idle";
      if (o.verb && word.dataset.v !== o.verb) { word.dataset.v = o.verb; word.innerHTML = `${o.verb}<b>→</b>`; }
      c.dataset.tone = e.target.closest?.('[data-fx-cursor-ball*="tone"]') ? read(e.target.closest('[data-fx-cursor-ball*="tone"]')).tone : "";
    }, on);
    // Press hop: it jumps the hop height in .44s, and on landing .085s .34 squash → .22 height bounce → .06s .16 squash → .06 height bounce (bounce length proportional to √(height ratio))
    let hop = null, hopT = 0;
    const jump = (K, t) => ({ K, t }), squash = (t, amt) => ({ t, amt });
    const seq = () => { const s = [jump(hopH, .44), squash(.085, .34)]; [.22, .06].forEach((k, i) => { if (hopH * k >= 1.5) { s.push(jump(hopH * k, .44 * Math.sqrt(k))); if (!i) s.push(squash(.06, .16)); } }); return s; };
    const pose = (t) => {
      for (const g of hop) {
        if (t > g.t) { t -= g.t; continue; }
        const e = g.t ? t / g.t : 1;
        if (g.amt != null) { const k = 1 - g.amt * Math.sin(Math.PI * e); return { y: 0, sx: 1 / k, sy: k }; }
        const l = 1 + .2 * Math.min(1, Math.abs(-4 * g.K * (1 - 2 * e)) / (4 * g.K || 1));
        return { y: -4 * g.K * e * (1 - e), sx: 1 / Math.sqrt(l), sy: l };
      }
      return null;
    };
    root.addEventListener("pointerdown", () => { if (hopH && !reduce && c.dataset.mode === "idle") { hop = seq(); hopT = 0; } }, on);
    root.addEventListener("pointerdown", () => gsap.to(verb, { scaleX: 0.82, scaleY: 0.74, duration: 0.18, ease: "power2.out" }), on);
    root.addEventListener("pointerup", () => gsap.to(verb, { scaleX: 1, scaleY: 1, duration: 0.18, ease: "power2.out" }), on);
    root.addEventListener("pointerleave", () => c.classList.remove("is-on"), on);
    const dotEl = ball.firstElementChild, vel = { x: null, y: null, vx: 0, vy: 0 }, lag = { x: mx, y: my };
    const near = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
    const tick = (time, ms) => {
      const dt = Math.max(.001, Math.min(.05, (ms || 16) / 1000));
      let by = my, tf = "";
      if (hop) { hopT += dt; const p = pose(hopT); if (!p) hop = null; else { by += p.y; tf = `scale(${p.sx}, ${p.sy})`; } }
      else if (stretch && !reduce) {
        if (vel.x !== null) { vel.vx = near(vel.vx, (mx - vel.x) / dt, 18, dt); vel.vy = near(vel.vy, (my - vel.y) / dt, 18, dt); }
        const sp = Math.hypot(vel.vx, vel.vy);
        if (sp > 30) { const k = Math.min(stretch, sp / 2600); tf = `rotate(${Math.atan2(vel.vy, vel.vx)}rad) scale(${1 + k}, ${1 / (1 + k)})`; }
      }
      vel.x = mx; vel.y = my;
      gsap.set(ball, { x: mx, y: by });
      if (stretch || hopH) { dotEl.style.transform = tf; dotEl.style.transformOrigin = hop ? "50% 100%" : "50% 50%"; }
      if (lagK && !reduce) { lag.x = near(lag.x, mx, lagK, dt); lag.y = near(lag.y, my, lagK, dt); gsap.set(verb, { x: lag.x + 4, y: lag.y - 8 }); }
      else gsap.set(verb, { x: mx + 4, y: my - 8 });
      let px = mx, py = by;
      pts.forEach((p, i) => {
        if (trailK) { p.x = near(p.x, px, trailK, dt); p.y = near(p.y, py, trailK, dt); } else { p.x += (px - p.x) * 0.42; p.y += (py - p.y) * 0.42; }
        gsap.set(dots[i], { x: p.x, y: p.y }); px = p.x; py = p.y;
      });
    };
    gsap.ticker.add(tick);
    return () => { ac.abort(); gsap.ticker.remove(tick); gsap.killTweensOf(verb); c.remove(); root.classList.remove("fx-has-cursor"); };
  });
})();
