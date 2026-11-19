(() => {
  // Gaussian weight (default 320×160) from the distance between cursor and letter center — the closer the letter, the more it lifts up and stretches vertically. When the cursor leaves it wobbles back into place
  kfFx.register("gauss-lift-chars", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    let chars = [...el.querySelectorAll('[data-fx-part="char"]')];
    let made = false;
    if (!chars.length) {
      const text = el.textContent;
      if (!text.trim()) return;
      el.setAttribute("aria-label", el.getAttribute("aria-label") || text.trim());
      chars = [...text].map((c) => { const s = document.createElement("span"); s.dataset.fxPart = "char"; s.setAttribute("aria-hidden", "true"); s.textContent = c; return s; });
      el.replaceChildren(...chars); made = true;
      el.dataset.gaussText = text;
    }
    const spread = +(options.spread || 51200), sy = +(options["scale-y"] ?? 0.45), sx = +(options["scale-x"] ?? 0.18), lift = +(options.lift ?? 18);
    const zone = el.closest("[data-fx-part='zone']") || el;
    let raf = 0, px = 0, py = 0;
    const move = (e) => {
      px = e.clientX; py = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        chars.forEach((c) => {
          const r = c.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - px, r.top + r.height / 2 - py), p = Math.exp(-(d * d) / spread);
          gsap.to(c, { scaleY: 1 + p * sy, scaleX: 1 + p * sx, y: -p * lift, duration: 0.4, ease: "power2.out", overwrite: "auto" });
        });
      });
    };
    const leave = () => chars.forEach((c) => gsap.to(c, { scaleX: 1, scaleY: 1, y: 0, duration: 0.7, ease: options.ease || "elastic.out(1, 0.6)", overwrite: "auto" }));
    zone.addEventListener("pointermove", move); zone.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      zone.removeEventListener("pointermove", move); zone.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(chars); gsap.set(chars, { clearProps: "transform" });
      if (made) { el.textContent = el.dataset.gaussText; delete el.dataset.gaussText; }
    };
  });
})();
