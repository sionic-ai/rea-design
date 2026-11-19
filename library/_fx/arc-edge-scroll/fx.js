// Arc edge: lay an SVG panel on top of (or below) the section, and as scroll progresses the panel fills in (cover) or clears away (reveal) while its edge bows like an arc in the center —
// Bend = Bend value × item aspect ratio × sin(progress × π), so it bends most in the middle and is straight at the ends (scrub .3) — brand (Osmo Arc Scroll Transition)
(() => {
  kfFx.register("arc-edge-scroll", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const mode = options.mode === "reveal" ? "reveal" : "cover";
    const curve = +(options.curve ?? 12), V = 100;
    const section = el.closest("section") || el.parentElement;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${V} ${V}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("fx-arc-edge-scroll__shape");
    const path = document.createElementNS(ns, "path");
    svg.append(path);
    el.append(svg);
    let depth = 0;
    const measure = () => { const r = section.getBoundingClientRect(); depth = curve * (r.height ? r.width / r.height : 1); };
    const r2 = (v) => Math.round(v * 100) / 100;
    const draw = (p) => {
      const fill = mode === "cover" ? p : 1 - p, bend = depth * Math.sin(fill * Math.PI);
      if (mode === "cover") { const e = r2(V - V * fill); path.setAttribute("d", `M0 ${V} L0 ${e} Q${V / 2} ${r2(e - bend * 2)} ${V} ${e} L${V} ${V} Z`); }
      else { const e = r2(V * fill); path.setAttribute("d", `M0 0 L0 ${e} Q${V / 2} ${r2(e + bend * 2)} ${V} ${e} L${V} 0 Z`); }
    };
    measure();
    if (reduce) { draw(1); return () => svg.remove(); }
    draw(0);
    const s = { p: 0 };
    const tw = gsap.to(s, {
      p: 1, ease: "none", onUpdate: () => draw(s.p),
      scrollTrigger: { scroller, trigger: section, start: options.start || (mode === "cover" ? "bottom bottom" : "top bottom"), end: options.end || (mode === "cover" ? "bottom top" : "top top"), scrub: +(options.scrub ?? 0.3), invalidateOnRefresh: true, onRefresh: measure },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); svg.remove(); };
  });
})();
