// Divider line — drawn from the left when it reaches 80% of the screen (1.6s). When the cursor passes near the line it bends to that spot (.3s), and after the cursor leaves it returns straight with a long wobble of 3s elastic.out(1, .035).
(() => {
  const NS = "http://www.w3.org/2000/svg";
  kfFx.register("elastic-bend-divider", (el, { options, reduce, hover, scroller }) => {
    const draw = +(options.draw ?? 1.6), back = +(options.back ?? 3), amp = +(options.amp ?? 0.035), start = options.start || "top 80%";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 1000 100"); svg.setAttribute("preserveAspectRatio", "none"); svg.setAttribute("aria-hidden", "true"); svg.setAttribute("class", "fx-ebd-svg");
    const path = document.createElementNS(NS, "path");
    const at = (x, y) => `M0 50 Q${x} ${y} 1000 50`;
    path.setAttribute("d", at(500, 50)); svg.append(path); el.append(svg);
    let st = null, off = 0;
    gsap.set(svg, { transformOrigin: "left center", scaleX: reduce ? 1 : 0 });
    if (!reduce) {
      if (window.ScrollTrigger) st = ScrollTrigger.create({ trigger: el, scroller, start, once: true, onEnter: () => gsap.to(svg, { scaleX: 1, duration: draw, ease: kfFx.ease("0.9,0.1,0.1,1", "power4.inOut") }) });
      else gsap.to(svg, { scaleX: 1, duration: draw });
    }
    const move = (e) => { const b = el.getBoundingClientRect(), y = ((e.clientY - b.top) / b.height) * 100; off = off || (y < 50 ? 50 : -50); gsap.to(path, { attr: { d: at(((e.clientX - b.left) / b.width) * 1000, 2 * y - 100 + off) }, duration: 0.3, overwrite: true }); };
    const leave = () => { off = 0; gsap.to(path, { attr: { d: at(500, 50) }, duration: back, overwrite: true, ease: `elastic.out(1, ${amp})` }); };
    if (hover && !reduce) { el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave); }
    return () => { st?.kill(); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); gsap.killTweensOf([svg, path]); svg.remove(); };
  });
})();
