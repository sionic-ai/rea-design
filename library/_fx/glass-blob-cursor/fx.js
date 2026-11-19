(() => {
  // Original CustomCursor — a 42px blurred glass blob follows by .1 of the remaining distance per frame, and the accent dot in the center by .14.
  // Over an expand area (data-cursor-expand, e.g. video) it grows to 102px over .72s, the dot becomes an 8px ring window, and two Play bands run staggered around it
  let blob = null, users = 0;
  kfFx.register("glass-blob-cursor", (el, { options, reduce, hover }) => {
    if (!hover || reduce || innerWidth < +(options.min ?? 1024)) return;
    users++;
    const lerp = +(options.lerp ?? 0.1), inner = +(options.inner ?? 0.14), label = options.label || "Play";
    if (!blob) {
      blob = document.createElement("div");
      blob.setAttribute("data-fx-part", "blob");
      blob.setAttribute("aria-hidden", "true");
      const word = `<span>${label}</span>`.repeat(8);
      blob.innerHTML = `<span data-fx-part="play"><span data-fx-part="belt"><span>${word}</span><span>${word}</span></span><span data-fx-part="belt" data-reverse><span>${word}</span><span>${word}</span></span></span><span data-fx-part="core"><span data-fx-part="dot"></span></span>`;
      document.body.append(blob);
    }
    const b = blob, core = b.querySelector('[data-fx-part="core"]');
    const p = { x: -200, y: -200, bx: -200, by: -200, cx: -200, cy: -200, seen: false };
    let raf = 0, last = 0;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.max(1, now - last) / 16.67 : 1;
      last = now;
      const kb = 1 - Math.pow(1 - lerp, dt), kc = 1 - Math.pow(1 - inner, dt);
      p.bx += (p.x - p.bx) * kb; p.by += (p.y - p.by) * kb;
      p.cx += (p.x - p.cx) * kc; p.cy += (p.y - p.cy) * kc;
      b.style.transform = `translate3d(${p.bx}px, ${p.by}px, 0) translate(-50%, -50%)`;
      core.style.transform = `translate3d(${p.cx - p.bx}px, ${p.cy - p.by}px, 0)`;
    };
    const move = (e) => {
      p.x = e.clientX; p.y = e.clientY;
      if (!p.seen) { p.seen = true; p.bx = p.cx = p.x; p.by = p.cy = p.y; b.classList.add("is-on"); }
      const t = e.target instanceof Element ? e.target : null;
      b.toggleAttribute("data-expanded", !!t?.closest("[data-cursor-expand]"));
    };
    const gone = () => { p.seen = false; b.classList.remove("is-on"); };
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", gone);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", gone);
      if (--users <= 0 && blob) { blob.remove(); blob = null; users = 0; }
    };
  });
})();
