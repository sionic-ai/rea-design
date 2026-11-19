// A graph of hundreds of vertical lines lined up at curve height — height goes 12→100% up to the peak (sin^3.85), then 55→100% after it (cos^1.35).
// When the cursor is over the panel, the lines within the span on either side of the cursor stretch with a cosine up to ”cursor height − pad” and shrink back (quickTo scaleY .35 power2.out), and return to their own height when it leaves.
// On touch screens it just stays put (doesn’t hijack touch)
(() => {
  kfFx.register("cursor-bar-field", (el, { options, reduce, hover }) => {
    const n = Math.max(2, +(options.lines || 220)), peak = +(options.peak ?? 0.62), span = +(options.span || 50), pad = +(options.pad ?? 74);
    const dur = +(options.dur ?? 0.35);
    const H = [];
    for (let i = 0; i < n; i++) { const t = i / (n - 1); H.push(t <= peak ? 12 + 88 * Math.sin((peak ? t / peak : 1) * Math.PI / 2) ** 3.85 : 55 + 45 * Math.cos(((t - peak) / (1 - peak || 1)) * Math.PI / 2) ** 1.35); }
    const before = el.innerHTML;
    el.innerHTML = H.map((h, i) => `<i data-fx-part="line"${Math.abs(i / (n - 1) - peak) < 0.004 ? ' data-hot=""' : ""} style="height:${h.toFixed(2)}%"></i>`).join("");
    const lines = [...el.children];
    if (reduce || !hover) return () => { el.innerHTML = before; };
    gsap.set(lines, { transformOrigin: "50% 100%", scaleY: 1 });
    const q = lines.map((l) => gsap.quickTo(l, "scaleY", { duration: dur, ease: options.ease || "power2.out" }));
    const move = (e) => {
      const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, w = r.width / lines.length;
      const c = Math.max(0, Math.min(lines.length - 1, Math.round(x / w))), lo = Math.max(0, c - span), hi = Math.min(lines.length - 1, c + span), target = Math.max(1, r.height - (y + pad));
      for (let d = 0; d < lines.length; d++) {
        if (d < lo || d > hi) { q[d](1); continue; }
        const base = r.height * (H[d] / 100);
        if (!base) continue;
        const k = 0.5 + 0.5 * Math.cos((Math.abs(d - c) / span) * Math.PI);
        q[d](Math.max(0.01, (base + (target - base) * k) / base));
      }
    };
    const leave = () => q.forEach((f) => f(1));
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); gsap.killTweensOf(lines); el.innerHTML = before; };
  });
})();
