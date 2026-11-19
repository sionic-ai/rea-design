// One section holds a pinned panel (several videos) and several step texts — when a step text passes the screen center, only that number’s video plays from the start and the rest pause
(() => {
  kfFx.register("video-step-swap", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const figure = el.querySelector('[data-fx-part="figure"]');
    const videos = [...el.querySelectorAll('[data-fx-part="video"]')];
    const steps = [...el.querySelectorAll('[data-fx-part="step"]')];
    if (!figure || !videos.length || !steps.length) return;
    const dur = +(options.dur ?? 0.3), from = +(options.from ?? 0.5), out = +(options.out ?? 0.8), fade = +(options.fade ?? 300);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    let active = -1, shown = null, tween = null;
    videos.forEach((v) => { v.muted = true; v.playsInline = true; v.loop = true; if (!reduce) v.style.transition = `opacity ${fade}ms ease`; });
    const activate = (i) => {
      if (i === active) return;
      active = i;
      videos.forEach((v, k) => {
        const on = +(v.dataset.index ?? k) === i;
        v.style.opacity = on ? "1" : "0";
        if (on) { v.currentTime = 0; v.play().catch(() => {}); } else v.pause();
      });
      steps.forEach((s, k) => s.toggleAttribute("data-active", k === i));
    };
    const show = (on) => {
      if (shown === on) return;
      shown = on;
      tween?.kill();
      if (!on) activate(-1);
      if (reduce) return gsap.set(figure, { opacity: on ? 1 : 0, scale: on ? 1 : from });
      tween = gsap.to(figure, on ? { scale: 1, opacity: 1, duration: dur, ease, overwrite: "auto" } : { scale: out, opacity: 0, duration: dur, ease, overwrite: "auto" });
    };
    gsap.set(figure, { scale: from, opacity: 0, transformOrigin: "50% 50%" });
    videos.forEach((v) => (v.style.opacity = "0"));
    const st = { ...(scroller && { scroller }) };
    const triggers = [
      ScrollTrigger.create({ ...st, trigger: el, start: options.start || "top 20%", end: options.end || "bottom 80%", onEnter: () => show(true), onEnterBack: () => show(true), onLeave: () => show(false), onLeaveBack: () => show(false) }),
      ...steps.map((s, i) => ScrollTrigger.create({ ...st, trigger: s, start: "top center", end: "bottom center", onEnter: () => activate(i), onEnterBack: () => activate(i) })),
    ];
    return () => {
      triggers.forEach((t) => t.kill());
      tween?.kill();
      videos.forEach((v) => { v.pause(); v.style.removeProperty("opacity"); v.style.removeProperty("transition"); });
      steps.forEach((s) => s.removeAttribute("data-active"));
      gsap.set(figure, { clearProps: "transform,opacity" });
    };
  });
})();
