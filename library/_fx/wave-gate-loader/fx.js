(() => {
  // A sine wave grows with progress (envelope fading at both 1/3 ends) and when full the start button appears. Pressing it splits the top and bottom panels open
  kfFx.register("wave-gate-loader", (el, { options, reduce }) => {
    const wave = el.querySelector('[data-fx-part="wave"]');
    const start = el.querySelector('[data-fx-part="start"]');
    if (!start) return;
    const path = wave ? wave.querySelector("path") || wave.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "path")) : null;
    const made = [];
    for (const k of ["up", "down"]) if (!el.querySelector(`[data-fx-part="${k}"]`)) { const d = document.createElement("div"); d.dataset.fxPart = k; el.prepend(d); made.push(d); }
    const dur = +(options.dur ?? 2.4), split = +(options.split ?? 0.7), cycles = +(options.cycles || 4), amp = +(options.amp ?? 0.45);
    el.style.setProperty("--fx-split", `${split}s`);
    const W = 600, H = 50;
    if (wave) wave.setAttribute("viewBox", `0 0 ${W} ${H}`);
    let prog = 0, phase = 0, raf = 0, manual = false, timer = 0, ready = false;
    const draw = () => {
      if (path) {
        const end = Math.round(prog * W);
        let d = "";
        for (let x = 0; x <= W; x += 2) {
          let y = H / 2;
          if (x <= end && end > 0) { const p = x / end, g = Math.min(p / 0.33, 1), m = Math.min((1 - p) / 0.33, 1); y += H * amp * prog * g * m * m * Math.sin((x / W) * Math.PI * cycles * 2 - phase); }
          d += `${x ? "L" : "M"}${x},${y.toFixed(2)}`;
        }
        path.setAttribute("d", d);
      }
      if (!reduce) phase += 0.1;
      raf = requestAnimationFrame(draw);
    };
    const setReady = () => { if (ready) return; ready = true; el.classList.add("is-ready"); start.hidden = false; el.dispatchEvent(new CustomEvent("fx:ready", { bubbles: true })); };
    const onProgress = (e) => { manual = true; prog = Math.min(1, Math.max(0, +e.detail || 0)); if (prog >= 1) setReady(); };
    el.addEventListener("fx:progress", onProgress);
    // If the writer doesn’t send fx:progress, it fills up on its own over dur seconds
    const t0 = performance.now();
    const auto = () => {
      if (manual) return;
      const k = reduce || dur <= 0 ? 1 : Math.min(1, (performance.now() - t0) / (dur * 1000));
      prog = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      if (k >= 1) setReady(); else timer = requestAnimationFrame(auto);
    };
    auto();
    draw();
    const open = () => {
      el.classList.add("is-open");
      setTimeout(() => el.dispatchEvent(new CustomEvent("fx:start", { bubbles: true })), reduce ? 0 : split * 1000);
      setTimeout(() => { cancelAnimationFrame(raf); el.classList.add("is-gone"); }, reduce ? 0 : Math.max(split, 1) * 1000 + 100);
    };
    start.addEventListener("click", open);
    return () => {
      cancelAnimationFrame(raf); cancelAnimationFrame(timer);
      start.removeEventListener("click", open);
      el.removeEventListener("fx:progress", onProgress);
      el.classList.remove("is-ready", "is-open", "is-gone");
      el.style.removeProperty("--fx-split");
      made.forEach((d) => d.remove());
    };
  });
})();
