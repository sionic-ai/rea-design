// Moves the press-printed look of text and board shadows (text-shadow · box-shadow) with scroll — the shadow’s rest shape stays as the user’s css and the part only creates the starting point from it.
//   emboss (default) — shadow pressed flat (0px) and offset 3·8px, then when it reaches 88% of the screen it stamps into place in 1.1s power3.out and the shadow returns (once)
//   crease — the fold line is drawn from the left over 1.3s power2.inOut (92% of screen, once)
//   press  — from a big lifted shadow (lift) · 1.035x · 3px up, bound to scroll (92% → 48%), it is pressed into the board
//   rake   — in a shadow with light from the opposite side (flipped horizontally), tied to scroll (screen bottom → 30%) it rotates to its own shadow
(() => {
  const flat = (v) => v.replace(/-?\d*\.?\d+px/g, "0px");
  const mirror = (v) => v.replace(/(-?\d*\.?\d+)px\s+(-?\d*\.?\d+)px/g, (m, x, y) => `${-parseFloat(x)}px ${y}px`);
  const scale = (v, k) => v.replace(/(-?\d*\.?\d+)px/g, (m, n) => `${(parseFloat(n) * k).toFixed(2)}px`);
  const which = (el) => {
    const cs = getComputedStyle(el);
    if (cs.textShadow !== "none") return "textShadow";
    if (cs.boxShadow !== "none") return "boxShadow";
    return null;
  };
  // Resolve the variable used by the consumer (shadow recipe) on that element and read it
  const recipe = (el, token, prop) => {
    const before = el.style[prop];
    el.style[prop] = `var(${token})`;
    const v = getComputedStyle(el)[prop];
    el.style[prop] = before;
    return v && v !== "none" ? v : null;
  };

  kfFx.register("relief-press-text", (el, { options, reduce, scroller }) => {
    if (reduce || !window.ScrollTrigger) return;
    const mode = options.mode || "emboss";
    const prop = which(el);
    const rest = prop ? getComputedStyle(el)[prop] : null;
    let tl;
    if (mode === "crease") {
      tl = gsap.timeline().fromTo(el, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: +(options.dur ?? 1.3), ease: "power2.inOut" });
    } else if (mode === "press") {
      if (!prop) return;
      const lifted = (options.lift && recipe(el, options.lift, prop)) || scale(rest, 3);
      tl = gsap.timeline().fromTo(el, { [prop]: lifted, scale: 1.035, y: -3, transformOrigin: "0% 60%" }, { [prop]: rest, scale: 1, y: 0, ease: "none", duration: 1 });
    } else if (mode === "rake") {
      if (!prop) return;
      tl = gsap.timeline().fromTo(el, { [prop]: mirror(rest) }, { [prop]: rest, ease: "none", duration: 1 });
    } else {
      const from = { x: +(options.x ?? 3), y: +(options.y ?? 8) }, to = { x: 0, y: 0, duration: +(options.dur ?? 1.1), ease: kfFx.ease(options.ease || "power3.out", "power3.out") };
      if (prop) { from[prop] = flat(rest); to[prop] = rest; }
      tl = gsap.timeline().fromTo(el, from, to);
    }
    const when = {
      emboss: { start: "top 88%", once: true },
      crease: { start: "top 92%", once: true },
      press: { start: "top 92%", end: "top 48%", scrub: true },
      rake: { start: "top bottom", end: "top 30%", scrub: true },
    }[mode] || { start: "top 88%", once: true };
    const st = ScrollTrigger.create({ trigger: el, scroller, ...when, start: options.start || when.start, ...(options.end ? { end: options.end } : {}), animation: tl });
    return () => { st.kill(); tl.revert(); };
  });
})();
