(() => {
  // A stage that does not scroll — each scene (child) has a length (data-dur seconds) and time flows by itself (rate ×). Wheel, up-down drag and arrow keys
  // Winds or rewinds by that amount: the wheel amount accumulates in a target, the current value follows by .2 per frame, and the target decays toward 0 by .2 per frame (original kai wheel).
  // Attach is-in to the current scene and write --fx-p (0~1), every frame fx:time { index, progress, time, velocity } Fires it. When it ends, back to the start (stops if loop: false)
  kfFx.register("wheel-time-stage", (el, { options, reduce }) => {
    const scenes = [...el.querySelectorAll('[data-fx-part="scene"]')];
    if (!scenes.length) return;
    const durs = scenes.map((s) => Math.max(0.1, +s.dataset.dur || 5));
    const starts = durs.map((_, i) => durs.slice(0, i).reduce((a, b) => a + b, 0));
    const total = durs.reduce((a, b) => a + b, 0);
    const rate = reduce ? 0 : +(options.rate ?? 1);
    const k = +(options.speed ?? 0.0016);
    const follow = +(options.follow ?? 0.2), decay = +(options.decay ?? 0.2);
    const loop = options.loop !== "false";
    const knob = el.querySelector('[data-fx-part="knob"]');
    let t = 0, dist = 0, wd = 0, vel = 0, cur = -1, last = performance.now(), raf = 0, ty = null;

    const onWheel = (e) => { e.preventDefault(); const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX; dist += e.deltaMode === 1 ? d * 33 : d; };
    const onDown = (e) => { if (e.target.closest("a, button, input")) return; ty = e.clientY; };
    const onMove = (e) => { if (ty == null) return; dist += (ty - e.clientY) * 4; ty = e.clientY; };
    const onUp = () => { ty = null; };
    const onKey = (e) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) dist += 400;
      if (["ArrowUp", "PageUp"].includes(e.key)) dist -= 400;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("keydown", onKey);

    const frame = (now) => {
      const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
      last = now;
      const f = dt * 60;
      wd += follow * (dist - wd) * f;
      dist -= dist * Math.min(1, decay * f);
      const push = wd * k * f;
      vel += (push / dt - vel) * 0.25;
      t += dt * rate + push;
      t = loop ? ((t % total) + total) % total : Math.max(0, Math.min(total - 0.0001, t));
      const i = Math.max(0, starts.findIndex((s, n) => t >= s && t < s + durs[n]));
      if (i !== cur) { scenes.forEach((s, n) => s.classList.toggle("is-in", n === i)); cur = i; }
      const p = (t - starts[i]) / durs[i];
      scenes[i].style.setProperty("--fx-p", p.toFixed(4));
      if (knob) knob.style.setProperty("--fx-total", (t / total).toFixed(4));
      el.dispatchEvent(new CustomEvent("fx:time", { detail: { index: i, progress: p, time: t, velocity: vel } }));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("keydown", onKey);
      scenes.forEach((s) => { s.classList.remove("is-in"); s.style.removeProperty("--fx-p"); });
    };
  });
})();
