// Duplicate the frame once and place the copy right behind it, then cut the copy using the rectangle where the dark section and the frame overlap. Check the marker so it does not attach to the copy again, then loop back.
(() => {
  kfFx.register("overlap-invert", (el, { options }) => {
    if (el.classList.contains("fx-oi-clone")) return;
    const zones = () => [...document.querySelectorAll(options.zone || "[data-invert-zone]")];
    if (!zones().length) return;
    const twin = el.cloneNode(true);
    twin.classList.add("fx-oi-clone");
    twin.removeAttribute("id");
    twin.setAttribute("aria-hidden", "true");
    twin.inert = true;
    twin.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    twin.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach((n) => n.setAttribute("tabindex", "-1"));
    el.after(twin);
    let raf = 0;
    const clip = () => {
      raf = 0;
      const f = twin.getBoundingClientRect();
      let best = null;
      for (const z of zones()) {
        const t = z.getBoundingClientRect();
        const top = Math.max(t.top, f.top), bottom = Math.min(t.bottom, f.bottom), left = Math.max(t.left, f.left), right = Math.min(t.right, f.right);
        if (bottom > top && right > left && (!best || bottom - top > best.bottom - best.top)) best = { top, bottom, left, right };
      }
      twin.style.clipPath = best ? `inset(${best.top - f.top}px ${f.right - best.right}px ${f.bottom - best.bottom}px ${best.left - f.left}px)` : "inset(0 0 100% 0)";
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(clip); };
    const ro = new ResizeObserver(ask);
    zones().forEach((z) => ro.observe(z));
    ro.observe(el);
    clip();
    addEventListener("scroll", ask, { passive: true, capture: true });
    addEventListener("resize", ask);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener("scroll", ask, { capture: true });
      removeEventListener("resize", ask);
      twin.remove();
    };
  });
})();
