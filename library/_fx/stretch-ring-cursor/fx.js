// Over the panel a thin ring follows the mouse with damping (.1/frame), stretches in the direction of movement by the lagging distance (×.001, max .55) and tilts that way.
// Diameter 0 normally — over [data-cursor-label] it grows to diameter size in .7s showing that text, with stretch reduced to 1/5 (brand-varied)
(() => {
  kfFx.register("stretch-ring-cursor", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const damp = +(options.damp ?? 0.1), max = +(options.max ?? 0.55), gain = +(options.gain ?? 0.001), calm = +(options.calm ?? 0.2);
    let ring = el.querySelector('[data-fx-part="ring"]'), made = false;
    if (!ring) {
      ring = document.createElement("div");
      ring.setAttribute("data-fx-part", "ring");
      ring.innerHTML = '<span data-fx-part="circle"><svg viewBox="0 0 180 180" aria-hidden="true"><defs><linearGradient id="fx-srg" x1="32" y1="16" x2="145.5" y2="163" gradientUnits="userSpaceOnUse"><stop offset="0" stop-opacity=".3"/><stop offset=".5"/><stop offset="1" stop-opacity=".3"/></linearGradient></defs><circle cx="90" cy="90" r="89.5" stroke="url(#fx-srg)"/></svg></span><span data-fx-part="label"></span>';
      el.append(ring);
      made = true;
    }
    // As in the original, centers with GSAP xPercent and yPercent — the offset (px) changes along with it while the size grows
    if (window.gsap) gsap.set(ring, { xPercent: -50, yPercent: -50 }); else ring.style.translate = "-50% -50%";
    const circle = ring.querySelector('[data-fx-part="circle"]');
    const label = ring.querySelector('[data-fx-part="label"]');
    if (!circle) return () => { if (made) ring.remove(); };
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, raf = 0, labelOn = false;
    const frame = () => {
      const nx = Math.round(tx - x), ny = Math.round(ty - y);
      x += nx * damp; y += ny * damp;
      const angle = (180 * Math.atan2(ny, nx)) / Math.PI;
      let sq = Math.min(Math.sqrt(nx * nx + ny * ny) * gain, max);
      if (labelOn) sq *= calm;
      ring.style.setProperty("--fx-x", x);
      ring.style.setProperty("--fx-y", y);
      circle.style.transform = `rotate(${angle}deg) scale(${1 + sq}, ${1 - sq})`;
      raf = requestAnimationFrame(frame);
    };
    const move = (e) => { tx = e.clientX; ty = e.clientY; };
    const over = (e) => {
      const t = e.target.closest && e.target.closest("[data-cursor-label]");
      const on = !!(t && el.contains(t));
      if (on === labelOn && (!on || (label && label.textContent === t.dataset.cursorLabel))) return;
      labelOn = on;
      ring.classList.toggle("is-on", on);
      if (label && on) label.textContent = t.dataset.cursorLabel;
    };
    // Collapse right away when leaving a text-bearing spot — so it doesn’t stay enlarged until entering the next spot (original @mouseleave)
    const out = (e) => {
      const t = e.target.closest && e.target.closest("[data-cursor-label]");
      if (!t || !labelOn || (e.relatedTarget && t.contains(e.relatedTarget))) return;
      labelOn = false;
      ring.classList.remove("is-on");
    };
    const enter = () => { if (window.gsap) { gsap.to(ring, { scale: 1, duration: 0.3, ease: "power2.inOut", overwrite: true }); gsap.set(ring, { xPercent: -50, yPercent: -50 }); } else ring.style.scale = "1"; };
    const leave = () => { if (window.gsap) gsap.to(ring, { scale: 0, duration: 0.3, ease: "power2.inOut", overwrite: true }); else ring.style.scale = "0"; };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerover", over);
    el.addEventListener("pointerout", out);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerover", over);
      el.removeEventListener("pointerout", out);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      if (window.gsap) gsap.killTweensOf(ring);
      if (made) ring.remove();
      else { ring.classList.remove("is-on"); ring.style.scale = ""; ring.style.translate = ""; ring.style.transform = ""; circle.style.transform = ""; }
    };
  });
})();
