(() => {
  // Original: centered on a point that trails the cursor coordinates late with .8s power2.out, a blurred circle mask of screen width × .5 (height × 666/719) and
  // Overlay a 60-step stripe flicker mask (30 steps per second) with intersect to reveal the panel. On touch devices it is placed at screen center at screen width × 1.2.
  const NS = "http://www.w3.org/2000/svg";
  const sprite = (frames) => {
    let seed = 4242; const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    let rects = "";
    for (let f = 0; f < frames; f++) for (let y = 0; y < 100;) { const h = 2 + Math.floor(r() * 9), a = r() < 0.18 ? (r() * 0.25).toFixed(2) : (0.7 + r() * 0.3).toFixed(2); rects += `<rect x="${f * 100}" y="${y}" width="100" height="${h}" fill-opacity="${a}"/>`; y += h; }
    return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="${NS}" width="${frames * 100}" height="100" viewBox="0 0 ${frames * 100} 100">${rects}</svg>`)}")`;
  };
  const art = (el) => {
    const W = 1440, H = 1080, tan = Math.tan((27 * Math.PI) / 180);
    let seed = 7, d = "";
    const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let c = 1; c < 12; c++) if (r() < 0.55) d += `M${c * 120} ${Math.round(r() * 400)}V${Math.round(600 + r() * 480)}`;
    for (let g = 0; g < 5; g++) { const x = 120 * Math.floor(r() * 11), y = r() * 700, l = 200 + r() * 240; for (let k = 0; k < 3; k++) d += `M${x + k * 28} ${y}L${(x + k * 28 + l * tan).toFixed(1)} ${(y + l).toFixed(1)}`; }
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("preserveAspectRatio", "none"); svg.setAttribute("data-fx-part", "art"); svg.setAttribute("aria-hidden", "true");
    const p = document.createElementNS(NS, "path"); p.setAttribute("d", d); svg.append(p);
    el.append(svg);
    return svg;
  };
  let shared = null;
  const pointer = () => {
    if (shared) return shared;
    const s = { x: innerWidth / 2, y: innerHeight / 2 };
    shared = { s, qx: null, qy: null, dur: 0.8 };
    addEventListener("pointermove", (e) => { if (!shared.qx) { shared.qx = gsap.quickTo(s, "x", { duration: shared.dur, ease: "power2.out" }); shared.qy = gsap.quickTo(s, "y", { duration: shared.dur, ease: "power2.out" }); } shared.qx(e.clientX); shared.qy(e.clientY); }, { passive: true });
    return shared;
  };
  kfFx.register("cursor-grid-mask", (el, { options, reduce, hover }) => {
    const made = el.children.length ? null : art(el);
    const size = +(options.size ?? 0.5), aspect = +(options.aspect ?? 666 / 719), frames = Math.max(1, +options.frames || 60), fps = +options.fps || 30;
    const flicker = (options.flicker || "on") !== "off";
    const P = pointer();
    if (options.follow != null) P.dur = +options.follow;
    const radial = "radial-gradient(closest-side, currentColor 0%, currentColor 42%, transparent 100%)";
    const img = flicker ? `${sprite(frames)}, ${radial}` : radial;
    el.style.maskImage = img; el.style.webkitMaskImage = img;
    if (flicker) { el.style.maskComposite = "intersect"; el.style.webkitMaskComposite = "source-in"; }
    let on = false;
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; }, { rootMargin: "200px 0px" });
    io.observe(el);
    const tick = () => {
      if (!on) return;
      const U = innerWidth * (hover ? size : +(options.touch ?? 1.2)), Wm = U * aspect, G = U * 0.87;
      const frame = reduce || !flicker ? 0 : Math.floor((performance.now() / 1000) * fps) % frames;
      const mx = hover && !reduce ? P.s.x : innerWidth / 2, my = hover && !reduce ? P.s.y : innerHeight / 2;
      const r = el.getBoundingClientRect(), x = mx - r.left - U / 2, y = my - r.top - Wm / 2;
      const sz = flicker ? `${G * frames}px ${G}px, ${U}px ${Wm}px` : `${U}px ${Wm}px`;
      const pos = flicker ? `${x + U / 2 - G / 2 - frame * G}px ${y}px, ${x}px ${y}px` : `${x}px ${y}px`;
      el.style.maskSize = sz; el.style.webkitMaskSize = sz; el.style.maskPosition = pos; el.style.webkitMaskPosition = pos;
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); io.disconnect(); made?.remove(); ["maskImage", "webkitMaskImage", "maskComposite", "webkitMaskComposite", "maskSize", "webkitMaskSize", "maskPosition", "webkitMaskPosition"].forEach((k) => (el.style[k] = "")); };
  });
})();
