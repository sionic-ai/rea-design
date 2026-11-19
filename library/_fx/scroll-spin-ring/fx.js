// A text line wrapped around a big circle turns bound to scroll — progress ratio × 360° while passing the section (no curve). Scrolling back turns it in reverse.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;
  function build(el, text, size, inset, repeat, sep, bottom) {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 1000 1000");
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "width:100%;height:100%;overflow:visible;display:block";
    const id = `fx-ssr-${++uid}`;
    // On the bottom-reading side, wind counterclockwise so the text stands upright below the circle and the letter tops face the center — the letters stand inside the circumference.
    const r = bottom ? 500 - inset - size * 0.22 : 500 - inset - size * 0.75;
    const path = document.createElementNS(NS, "path");
    path.setAttribute("id", id);
    path.setAttribute("fill", "none");
    const sw = bottom ? 0 : 1;
    path.setAttribute("d", `M 500 ${500 - r} a ${r} ${r} 0 1 ${sw} 0 ${2 * r} a ${r} ${r} 0 1 ${sw} 0 ${-2 * r}`);
    const t = document.createElementNS(NS, "text");
    t.setAttribute("font-size", size);
    t.setAttribute("fill", "currentColor");
    t.style.cssText = "font-family:var(--kf-font-display);font-weight:var(--kf-weight-display);text-transform:uppercase;letter-spacing:.04em";
    const tp = document.createElementNS(NS, "textPath");
    tp.setAttribute("href", `#${id}`);
    const circ = 2 * Math.PI * r;
    t.appendChild(tp);
    svg.append(path, t);
    el.appendChild(svg);
    // If no repeat count is given, it measures one set’s length and wraps so the circumference is full — wrapping a few sets of short text and stretching it makes the letters sparse
    let n = repeat;
    if (!n) {
      tp.textContent = text + sep;
      const unit = tp.getComputedTextLength?.() || size * 0.62 * (text + sep).length;
      n = Math.max(1, Math.round(circ / unit));
    }
    tp.textContent = Array(n).fill(text).join(sep) + sep;
    tp.setAttribute("textLength", String(Math.floor(circ) - 2));
    tp.setAttribute("lengthAdjust", "spacing");
    return svg;
  }

  kfFx.register("scroll-spin-ring", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const text = (options.text || el.getAttribute("aria-label") || "").trim();
    let target = el.querySelector('[data-fx-part="ring"]');
    let made = null;
    if (!target) {
      if (!text) return;
      made = target = build(el, text, +(options.size ?? 14), +(options.inset ?? 4), +(options.repeat || 0), options.sep ?? "  ✿  ", options.side === "bottom");
    }
    if (reduce) return () => made?.remove();
    const host = options.trigger ? el.closest(options.trigger) || el : el;
    const turns = +(options.turns ?? 1), scale = +(options.scale ?? 1), dir = options.dir === "back" ? -1 : 1, lag = +(options.lag ?? 0);
    const st = ScrollTrigger.create({
      trigger: host,
      scroller,
      start: options.start || "top bottom",
      end: options.end || "bottom top",
      onUpdate: (self) => (lag > 0
        ? gsap.to(target, { rotate: dir * 360 * turns * self.progress, scale, transformOrigin: "50% 50%", duration: lag, ease: "power2.out", overwrite: true })
        : gsap.set(target, { rotate: dir * 360 * turns * self.progress, scale, transformOrigin: "50% 50%" })),
    });
    return () => { st.kill(); gsap.killTweensOf(target); gsap.set(target, { clearProps: "transform" }); made?.remove(); };
  });
})();
