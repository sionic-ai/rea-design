// pathLength instead of measuring line length=Set to 1 to cover with a single dash — lines of different lengths are drawn with the same value
(() => {
  kfFx.register("stroke-draw", (el, { options, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const SHAPES = "path, line, polyline, polygon, circle, ellipse, rect";
    const lines = el.matches(SHAPES) ? [el] : [...el.querySelectorAll(SHAPES)];
    if (!lines.length) return;
    const had = lines.map((l) => l.getAttribute("pathLength"));
    lines.forEach((l) => { l.setAttribute("pathLength", "1"); l.style.strokeDasharray = "1"; });
    const steps = +(options.steps || 0), mm = gsap.matchMedia();
    // Type 0.33,1,0.68,1 is a numeric curve, anything else is a GSAP name (none · slow(0.7,0.7,false))
    const ease = options.ease && (/^[\d.\s,-]+$/.test(options.ease) ? kfFx.ease(options.ease, "power2.inOut") : options.ease);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const dur = +(options.duration || (steps ? 0.42 : 1.6)), curve = ease || (steps ? `steps(${steps})` : "power2.inOut");
      const tl = gsap.timeline({ delay: +(options.delay ?? 0.3), scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: options.start || "top 85%" } });
      tl.fromTo(lines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur, ease: curve, stagger: +(options.stagger ?? 0.12) }, 0);
      // fade — during the first this-fraction of the drawn length the line turns on from 0 → 1 (street-illustration-fintech-landing number circle .8 — original keyframes 0%·80%)
      const fade = +(options.fade ?? 0);
      if (fade > 0) tl.fromTo(lines, { opacity: 0 }, { opacity: 1, duration: dur * fade, ease: curve, stagger: +(options.stagger ?? 0.12) }, 0);
    });
    return () => { mm.revert(); lines.forEach((l, i) => { l.style.strokeDasharray = ""; had[i] == null ? l.removeAttribute("pathLength") : l.setAttribute("pathLength", had[i]); }); };
  });
})();
