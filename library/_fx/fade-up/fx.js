(() => {
  kfFx.register("fade-up", (el, { options, scroller }) => {
    gsap.registerPlugin(ScrollTrigger, CustomEase);
    // Give y-narrow and it floats at that distance in windows 1023px or narrower (Brand: 32px on wide screens, 8px on narrow)
    const narrow = options["y-narrow"] != null && matchMedia("(max-width: 1023px)").matches;
    const ease = CustomEase.create("fxFadeUp", "0.22,1,0.36,1"), y = String(narrow ? options["y-narrow"] : options.y || "40"), mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // With stagger, the child lines appear in turn instead of the element — text blocks that appear line by line like a serif poem
      const each = options.stagger != null ? +options.stagger : null;
      const targets = each != null && el.children.length ? [...el.children] : el;
      const dur = +(options.duration || 0.9), easeOf = options.ease ? kfFx.ease(options.ease, "power2.out") : ease;
      const blur = +(options.blur ?? 0), bright = options.bright != null ? +options.bright : null;
      // x is px if a number, and a ratio of its own width if % (Brand text block: enters from translateX(8%))
      const xs = String(options.x ?? 0).trim(), xVar = xs.endsWith("%") ? { xPercent: parseFloat(xs) } : +xs ? { x: +xs } : {};
      // back: when on, it disappears over the same length when scrolling back above the start line (a villa site’s section fade — toggled on and off each time it crosses the 70% screen line)
      const back = each == null && (options.back === "on" || options.back === "true");
      const st = { trigger: el, ...(scroller && { scroller }), start: options.start || "top 88%", ...(each != null && { once: true }), ...(back && { toggleActions: "play none none reverse" }) };
      // y as % is a ratio of its own height, with a unit like rem · vw it is used as is (Brand -2rem — html font size scales with window width), a number is px
      const yVar = y.endsWith("%") ? { yPercent: parseFloat(y) } : { y: /[a-z]$/i.test(y.trim()) ? y.trim() : parseFloat(y) };
      // base — initial opacity (brand turns on at .05), default 0
      // scale — starting size (Brand 1.05: slightly larger, settling down from above to its own size)
      // alpha: opacity — keep visibility so hands still reach it while hidden, and shift only the opacity (Brand: the original .anim-fadeup is opacity 0, so it still takes hover and click before rising)
      const alphaKey = options.alpha === "opacity" ? "opacity" : "autoAlpha";
      // rotate — initial tilt (deg). Brand text blocks stand up from 80px below · 3px to the side · tilted 2° (even-numbered ones −3px·−2°)
      const vars = { ...yVar, ...xVar,...(options.rotate != null && { rotation: +options.rotate }), ...(options.scale != null && { scale: +options.scale }), [alphaKey]: +(options.base ?? 0), duration: dur, ease: easeOf, delay: +(options.delay || 0), ...(each != null && { stagger: each }) };
      // fade-ease·fade-delay — only opacity (and blur) gets a different curve and delay (brand-zero: position .25,.46,.45,.94 delayed .15s, opacity .55,.085,.68,.53 delayed .1s, blur same curve delayed .15s)
      const fadeEase = options["fade-ease"] ? kfFx.ease(options["fade-ease"], "power2.in") : null;
      const fadeDelay = options["fade-delay"] != null ? +options["fade-delay"] : null;
      // fade-dur — duration for opacity only (Brand: position 1s cubic-bezier(0,.4,.3,1), opacity 1.4s ease)
      const fadeDur = options["fade-dur"] != null ? +options["fade-dur"] : null;
      if (fadeEase || fadeDelay != null || fadeDur != null) {
        const { [alphaKey]: a0, ...moveVars } = vars;
        const tl = gsap.timeline({ scrollTrigger: st });
        tl.from(targets, moveVars, 0).from(targets, { [alphaKey]: a0, duration: fadeDur ?? dur,ease: fadeEase || easeOf, delay: fadeDelay ?? vars.delay, ...(each != null && { stagger: each }) }, 0);
        if (blur) tl.from(targets, { filter: `blur(${blur}px)`, duration: +(options["blur-dur"] ?? dur), ease: fadeEase || easeOf, delay: options["blur-delay"] != null ? +options["blur-delay"] : vars.delay, ...(each != null && { stagger: each }) }, 0);
        return;
      }
      // again — when the element’s top edge moves farther below the viewport top than the viewport height × this value (scrolled far back up), it is hidden again, and shows once more after coming back down past the start line.
      // Turns on only when going down, when scrolling up across the start line it is left as is (original waypoint) "down" 90% + opacity 0 when 1.5 screens away)
      if (!blur && options.again != null && each == null) {
        const tw = gsap.from(targets, { ...vars, paused: true });
        const far = 100 + +options.again * 100;
        const on = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top 88%", onEnter: () => tw.restart(true) });
        const off = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: `top ${far}%`, onLeaveBack: () => tw.pause(0) });
        return () => { on.kill(); off.kill(); tw.revert(); };
      }
      if (!blur) { gsap.from(targets, { ...vars, scrollTrigger: st }); return; }
      // The blur clears separately and briefly (brand: opacity and position 1s, blur .5s)
      const tl = gsap.timeline({ scrollTrigger: st });
      // bright — initial brightness that lifts together with the blur (Brand photo cell: blur 14px · brightness 1.15 with opacity for 1.2s)
      const filter = bright != null ? `blur(${blur}px) brightness(${bright})` : `blur(${blur}px)`;
      tl.from(targets, vars, 0).from(targets, { filter, duration: +(options["blur-dur"] ?? dur), ease: easeOf, delay: vars.delay, ...(each != null && { stagger: each }) }, 0);
    });
    return () => mm.revert();
  });
})();
