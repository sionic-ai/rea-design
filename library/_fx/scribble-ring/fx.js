(() => {
  // Original disc doodle — draws a band of radius (1 + margin + ring × gap) and width with n points of jitter, and only one lap of sweep (±jitter/2) runs from a random position.
  // Entering steps through .3→.5→.72→1, leaving .72→.5→.3 frames by fps, and after fully entering keeps redrawing at the same tempo (the line trembles alive)
  const NS = "http://www.w3.org/2000/svg";
  kfFx.register("scribble-ring", (el, { options, reduce, hover }) => {
    const o = {
      fps: +options.fps || 10,
      loops: Math.max(1, Math.round(+options.loops || 2)),
      points: Math.max(4, Math.round(+options.points || 24)),
      sweep: +(options.sweep ?? 0.68),
      sweepJitter: +(options["sweep-jitter"] ?? 0.4),
      jitter: +(options.jitter ?? 0.028),
      width: +(options.width ?? 0.012),
      pad: +(options.pad ?? 0.06),
      gap: +(options.gap ?? 0.045),
      always: options.always === "1" || options.always === "true" || !hover,
    };
    const IN = [0.3, 0.5, 0.72], OUT = [0.72, 0.5, 0.3];
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "-1.25 -1.25 2.5 2.5");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("data-fx-part", "ring");
    const paths = Array.from({ length: o.loops }, () => svg.appendChild(document.createElementNS(NS, "path")));
    el.append(svg);
    const segs = o.points * 3;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const draw = (amount) => {
      paths.forEach((p, l) => {
        const R = 1 + o.pad + l * o.gap, half = o.width / 2;
        const sweep = clamp(o.sweep * (1 + (Math.random() - 0.5) * o.sweepJitter), 0.12, 1) * amount;
        const arc = Math.PI * 2 * sweep, start = Math.random() * Math.PI * 2;
        const jit = Array.from({ length: o.points + 1 }, () => 1 + (Math.random() - 0.5) * 2 * o.jitter);
        const outer = [], inner = [];
        for (let i = 0; i <= segs; i++) {
          const t = i / segs, a = start + t * arc;
          const u = t * o.points * sweep, d = Math.floor(u), f = Math.min(o.points, d + 1), q = u - d, s = q * q * (3 - 2 * q);
          const r = jit[Math.min(o.points, d)] * (1 - s) + jit[f] * s;
          const taper = Math.min(1, Math.min(t, 1 - t) * 14 + 0.15);
          const c = Math.cos(a), sn = -Math.sin(a);
          outer.push(`${(c * (R * r + half * taper)).toFixed(4)} ${(sn * (R * r + half * taper)).toFixed(4)}`);
          inner.push(`${(c * (R * r - half * taper)).toFixed(4)} ${(sn * (R * r - half * taper)).toFixed(4)}`);
        }
        p.setAttribute("d", `M${outer.join("L")}L${inner.reverse().join("L")}Z`);
      });
    };
    let state = "hidden", step = 0, last = 0, want = o.always, raf = 0;
    const show = (v) => svg.classList.toggle("is-on", v);
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / o.fps) return;
      last = now;
      if (want) {
        if (state === "hidden" || state === "out") { state = "in"; step = 0; show(true); }
        if (state === "in" && step < IN.length) draw(IN[step++]);
        else { state = "on"; draw(1); }
      } else if (state !== "hidden") {
        if (state !== "out") { state = "out"; step = 0; }
        if (step < OUT.length) draw(OUT[step++]);
        else { state = "hidden"; show(false); cancelAnimationFrame(raf); raf = 0; }
      }
    };
    const run = () => { if (!raf) { last = 0; raf = requestAnimationFrame(loop); } };
    if (reduce) {
      draw(1);
      show(want);
      const on = () => show(true), off = () => show(o.always);
      el.addEventListener("pointerenter", on);
      el.addEventListener("pointerleave", off);
      return () => { el.removeEventListener("pointerenter", on); el.removeEventListener("pointerleave", off); svg.remove(); };
    }
    const on = () => { want = true; run(); };
    const off = () => { want = o.always; run(); };
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("focusin", on);
    el.addEventListener("focusout", off);
    if (want) run();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointerleave", off);
      el.removeEventListener("focusin", on);
      el.removeEventListener("focusout", off);
      svg.remove();
    };
  });
})();
