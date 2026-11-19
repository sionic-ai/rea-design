// Draws the step list in order tied to scroll — each step has a number, text and vertical line, and the last step has a line curving round at the bottom and an end dot
(() => {
  kfFx.register("flow-steps-draw", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const steps = [...el.querySelectorAll('[data-fx-part="step"]')];
    if (!steps.length) return;
    const q = (s, p) => s.querySelector(`[data-fx-part="${p}"]`);
    const nums = steps.map((s) => q(s, "num")), bodies = steps.map((s) => q(s, "body")), lines = steps.map((s) => q(s, "line"));
    const curve = el.querySelector('[data-fx-part="curve"]'), path = curve?.querySelector("path"), dot = el.querySelector('[data-fx-part="dot"]');
    const gap = +(options.gap ?? 0.38), radius = +(options.radius ?? 31.5);
    // Last bent line — comes down from the cell’s top left, bends round by a radius at the bottom, and runs to the right end
    const draw = () => {
      if (!curve || !path) return 0;
      const { width: n, height: r } = curve.getBoundingClientRect();
      if (n <= 0 || r <= 0) return 0;
      const s = Math.min(radius, n, r), a = 0.5, o = Math.max(n, s + a), c = Math.max(r - 0.5, s + a), u = Math.max(c - s, 0), f = Math.min(s + a, o);
      curve.setAttribute("viewBox", `0 0 ${n} ${r}`);
      path.setAttribute("d", `M${a} 0V${u}C${a} ${u + s * 0.5523} ${f - s * 0.5523} ${c} ${f} ${c}H${o}`);
      return path.getTotalLength() * 2;
    };
    let len = draw();
    if (reduce) return;
    const tl = gsap.timeline({ paused: true });
    steps.forEach((s, i) => {
      const p = i * gap;
      if (nums[i]) { gsap.set(nums[i], { opacity: 0, y: 12 }); tl.to(nums[i], { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, p); }
      if (bodies[i]) { gsap.set(bodies[i], { opacity: 0, x: -16 }); tl.to(bodies[i], { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, p + 0.1); }
      if (lines[i]) { gsap.set(lines[i], { scaleY: 0, transformOrigin: "top center" }); tl.to(lines[i], { scaleY: 1, duration: 0.55, ease: "power2.inOut" }, p + 0.3); }
    });
    const last = (steps.length - 1) * gap;
    if (path) { gsap.set(path, { strokeDasharray: len, strokeDashoffset: len }); tl.to(path, { strokeDashoffset: 0, duration: 0.65, ease: "power2.inOut" }, last + 0.3); }
    if (dot) { gsap.set(dot, { scale: 0 }); tl.to(dot, { scale: 1, duration: 0.35, ease: "back.out(2)" }, last + 0.85); }
    const st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top 90%", end: options.end || "bottom 65%", scrub: true, animation: tl });
    // When the cell size changes, redraw the curved line and match the dash to the current progress
    const ro = new ResizeObserver(() => {
      len = draw();
      if (path) gsap.set(path, { strokeDasharray: len, strokeDashoffset: len * (1 - Math.min(1, Math.max(0, (tl.time() - last - 0.3) / 0.65))) });
      ScrollTrigger.refresh();
    });
    if (curve) ro.observe(curve);
    return () => { ro.disconnect(); st.kill(); tl.kill(); gsap.set([...nums, ...bodies, ...lines, path, dot].filter(Boolean), { clearProps: "all" }); };
  });
})();
