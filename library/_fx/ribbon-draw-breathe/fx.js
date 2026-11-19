(() => {
  // A thick ribbon line is drawn to the end in 2s sine.in, and from the moment it is fully drawn it erases from the tail in 2s sine.out.
  // Meanwhile line weight breathes .7 → 1 → .7x, and after finishing rests 1s and repeats. If scrolling stops for 4s it turns only through the current revolution and stops.
  kfFx.register("ribbon-draw-breathe", (el, { options, reduce, scroller }) => {
    const paths = [...el.querySelectorAll("path")];
    if (!paths.length || !window.DrawSVGPlugin) return;
    gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger);
    if (reduce) { gsap.set(paths, { drawSVG: "0% 100%" }); return () => gsap.set(paths, { clearProps: "all" }); }
    const dur = +(options.dur ?? 2), rest = +(options.rest ?? 1), idle = +(options.idle ?? 4000);
    const back = options.dir === "reverse";
    const from = back ? "100% 100%" : "0% 0%", mid = "0% 100%", to = back ? "0% 0%" : "100% 100%";
    const min = +(options.min ?? 0.7), total = dur * 2;
    const state = { loop: false, again: null, inView: false, active: true };
    const tl = gsap.timeline({ paused: true, onComplete: () => { if (state.loop) state.again = gsap.delayedCall(rest, () => tl.restart()); } });
    paths.forEach((p) => {
      const base = parseFloat(p.getAttribute("stroke-width") || getComputedStyle(p).strokeWidth) || 60;
      tl.fromTo(p, { drawSVG: from }, { drawSVG: mid, duration: dur, ease: "sine.in" }, 0)
        .to(p, { drawSVG: to, duration: dur, ease: "sine.out" }, dur)
        .fromTo(p, { strokeWidth: base * min }, { strokeWidth: base, duration: total * 0.5, ease: "sine.inOut" }, 0)
        .to(p, { strokeWidth: base * min, duration: total * 0.5, ease: "sine.inOut" }, total * 0.5);
    });
    gsap.set(paths, { drawSVG: from });
    const start = () => { state.loop = true; tl.restart(); };
    const stop = () => { state.loop = false; state.again?.kill(); state.again = null; tl.pause(); };
    let timer = setTimeout(() => (state.active = false, state.loop = false), idle);
    const onScroll = () => {
      clearTimeout(timer);
      if (!state.active) { state.active = true; if (state.inView) start(); }
      timer = setTimeout(() => { state.active = false; state.loop = false; state.again?.kill(); state.again = null; }, idle);
    };
    const target = scroller || window;
    target.addEventListener("scroll", onScroll, { passive: true });
    // Inside a pinned panel, it starts spinning when the panel pins (fx:enter) and stops when going back (fx:leave)
    const host = options.host ? el.closest(options.host) : null;
    let st = null;
    const enter = () => { state.inView = true; el.style.opacity = "1"; if (state.active) start(); };
    const leave = () => { state.inView = false; stop(); };
    if (host) { host.addEventListener("fx:enter", enter); host.addEventListener("fx:leave", leave); if (host.classList.contains("is-fx-panning")) enter(); }
    else st = ScrollTrigger.create({ scroller, trigger: el, start: options.start || "top 85%", end: "bottom top", onEnter: enter, onEnterBack: enter, onLeave: leave, onLeaveBack: leave });
    return () => {
      clearTimeout(timer); target.removeEventListener("scroll", onScroll);
      if (host) { host.removeEventListener("fx:enter", enter); host.removeEventListener("fx:leave", leave); }
      st?.kill(); stop(); tl.kill(); gsap.set(paths, { clearProps: "all" }); el.style.removeProperty("opacity");
    };
  });
})();
