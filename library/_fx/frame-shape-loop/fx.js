(() => {
  // The frame(s) cycle through set horizontal and vertical shares in turn, and scenes change by overlapping one layer at a time — the first shape is the last in the list, and the first scene hangs on that shape.
  kfFx.register("frame-shape-loop", (el, { options, reduce, scroller }) => {
    const frames = [...el.querySelectorAll('[data-fx-part="frame"]')];
    const scenes = [...el.querySelectorAll('[data-fx-part="scene"]')];
    if (!frames.length) return;
    const shapes = String(options.shapes || "63/100, 91/80, 77/98, 100/84, 100/70")
      .split(",").map((s) => s.trim().split("/").map(Number)).filter((a) => a.length === 2 && a.every(Number.isFinite));
    if (shapes.length < 2) return;
    const dur = +(options.dur ?? 0.6);
    const fade = +(options.fade ?? 0.4);
    const gap = +(options.gap ?? 0.6);
    const first = +(options.first ?? 0.1);
    const hold = +(options.hold ?? 0.5);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const [lw, lh] = shapes[shapes.length - 1];
    gsap.set(frames, { width: `${lw}%`, height: `${lh}%` });
    scenes.forEach((s, k) => gsap.set(s, { opacity: k === 0 ? 1 : 0 }));
    const clear = () => {
      gsap.set(frames, { clearProps: "width,height" });
      gsap.set(scenes, { clearProps: "opacity" });
    };
    if (reduce) return clear;

    let tl = null;
    const build = () => {
      tl = gsap.timeline({ repeat: -1, defaults: { ease } });
      shapes.forEach(([w, h], k) => {
        const at = tl.duration();
        const delay = k === 0 ? first : gap;
        tl.to(frames, { width: `${w}%`, height: `${h}%`, duration: dur, delay }, at);
        if (scenes.length > 1) {
          tl.to(scenes[k % scenes.length], { opacity: 0, duration: fade, delay }, at)
            .to(scenes[(k + 1) % scenes.length], { opacity: 1, duration: fade, delay }, at);
        }
      });
      if (hold > 0) tl.to({}, { duration: hold });
    };
    const st = window.ScrollTrigger
      ? ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 80%", once: true, onEnter: build })
      : (build(), null);
    return () => {
      st?.kill();
      tl?.kill();
      clear();
    };
  });
})();
