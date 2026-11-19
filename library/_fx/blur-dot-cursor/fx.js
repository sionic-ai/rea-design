// Each frame the dot closes 1/ease of the remaining distance (no time correction — as in the original). Opacity and diameter follow in the same step,
// Over a link the target diameter becomes size × link (default −1), passes through 0 and vanishes (negative widths are ignored, so it stops at the last small width), and returns on leave
(() => {
  kfFx.register("blur-dot-cursor", (root, { options, reduce, hover }) => {
    const wide = +(options.wide ?? 960);
    if (!hover || reduce || innerWidth <= wide) return;
    const ease = Math.max(1, +options.ease || 6), size = +options.size || 10, link = +(options.link ?? -1);
    const targets = options.targets || "a, input[type='submit']";
    const dot = document.createElement("span");
    dot.className = "fx-blur-dot-cursor";
    dot.setAttribute("aria-hidden", "true");
    document.body.append(dot);
    const to = { x: 0, y: 0, o: 0, d: size }, at = { x: 0, y: 0, o: 0, d: size };
    let started = false, raf = 0;
    const step = () => {
      for (const k of ["x", "y", "o", "d"]) at[k] += (to[k] - at[k]) / ease;
      dot.style.transform = `translate3d(${at.x - at.d / 2}px, ${at.y - at.d / 2}px, 0)`;
      dot.style.opacity = at.o;
      dot.style.width = dot.style.height = `${at.d}px`;
      raf = requestAnimationFrame(step);
    };
    const move = (e) => {
      to.x = e.clientX;
      to.y = e.clientY;
      to.o = 1;
      if (started) return;
      started = true;
      at.x = to.x;
      at.y = to.y;
      step();
    };
    const over = (e) => { const t = e.target.closest?.(targets); if (t && root.contains(t)) to.d = size * link; };
    const out = (e) => { const t = e.target.closest?.(targets); if (t && root.contains(t) && !t.contains(e.relatedTarget)) to.d = size; };
    root.addEventListener("mousemove", move, { passive: true });
    root.addEventListener("mouseover", over);
    root.addEventListener("mouseout", out);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("mousemove", move);
      root.removeEventListener("mouseover", over);
      root.removeEventListener("mouseout", out);
      dot.remove();
    };
  });
})();
