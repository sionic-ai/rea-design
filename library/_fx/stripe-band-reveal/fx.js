// Draws a band of horizontal lines whose thickness grows from top to bottom, and when it enters the screen unfolds line by line at .05s intervals.
// Three types — wipe: a face cropped from the bottom opens upward (.9s power3.inOut) · reveal: grows from the bottom-left point, from 30px below at 0 scale (1.3s power2.inOut) · grow: stretches horizontally from the left (1.3s power2.inOut).
// With drift on, the band spreads row by row from 0 → 100px in turn until it passes the screen center and exits upward (more for lower rows).
(() => {
  const NS = "http://www.w3.org/2000/svg";
  // n lines — positions nearly even, thickness grows by a power toward the bottom (top hairline thickness → bottom 11% of band height)
  const draw = (el, n) => {
    const W = 1440, H = 215, svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.style.cssText = "display:block;width:100%;height:100%";
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 1 : i / (n - 1);
      const h = Math.max(0.6, 24 * Math.pow(t, 2.1));
      const y = Math.min(H - h, (H - 24) * Math.pow(t, 0.92));
      const r = document.createElementNS(NS, "rect");
      r.setAttribute("x", "-1"); r.setAttribute("y", y.toFixed(1)); r.setAttribute("width", W + 2); r.setAttribute("height", h.toFixed(1));
      r.setAttribute("fill", "currentColor");
      svg.append(r);
    }
    el.append(svg);
    return svg;
  };
  kfFx.register("stripe-band-reveal", (el, { options, reduce, hover, scroller }) => {
    let made = null;
    if (!el.querySelector("svg")) made = draw(el, Math.max(2, +options.count || 10));
    const bars = el.querySelectorAll("svg rect, svg path");
    if (!bars.length) return () => made?.remove();
    if (reduce) return () => made?.remove();
    gsap.registerPlugin(ScrollTrigger);
    const look = options.look || "wipe";
    const each = +(options.stagger ?? 0.05);
    const from = look === "reveal" ? { y: 30, scaleX: 0, scaleY: 0, clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)", transformOrigin: "left bottom" }
      : look === "grow" ? { scaleX: 0, transformOrigin: "left center" }
      : { clipPath: "inset(100% 0% 0% 0%)" };
    const to = look === "reveal" ? { y: 0, scaleX: 1, scaleY: 1, clipPath: "polygon(-15% 0, 115% 0, 115% 115%, -15% 115%)", duration: +(options.dur ?? 1.3), ease: kfFx.ease(options.ease || "power2.inOut", "power2.inOut") }
      : look === "grow" ? { scaleX: 1, duration: +(options.dur ?? 1.3), ease: kfFx.ease(options.ease || "power2.inOut", "power2.inOut") }
      : { clipPath: "inset(0% 0% 0% 0%)", duration: +(options.dur ?? 0.9), ease: kfFx.ease(options.ease || "power3.inOut", "power3.inOut") };
    // scrub — on touch devices it is not tied to scroll like the original, plays once
    const scrub = hover && options.scrub != null && options.scrub !== "false" ? (options.scrub === "true" ? true : +options.scrub) : null;
    const st = { trigger: el, ...(scroller && { scroller }), start: options.start || "top bottom", end: scrub != null ? options.end || "bottom top" : options.end || "bottom bottom", ...(scrub != null ? { scrub } : { once: true }) };
    const tw = gsap.fromTo(bars, from, { ...to, stagger: each, scrollTrigger: st });
    let drift = null;
    if (options.drift !== "off") {
      // Line i drops by i/(n−1)×100 (px), so lower lines spread farther apart — the original uses svg coordinates as is, so it is scaled to the band height
      const n = bars.length, k = +(options.spread ?? 100);
      drift = gsap.fromTo(bars, { y: 0 }, { y: (i) => (n > 1 ? (i / (n - 1)) * k : 0), ease: "none", immediateRender: false, scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: "top center", end: "bottom top", scrub: true } });
    }
    return () => {
      tw.scrollTrigger?.kill(); tw.kill();
      if (drift) { drift.scrollTrigger?.kill(); drift.kill(); }
      gsap.set(bars, { clearProps: "transform,clipPath" });
      made?.remove();
    };
  });
})();
