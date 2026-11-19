(() => {
  // Breathing giant words — several words stretched horizontally and vertically to fill the board change on each beat.
  // The current word flattens vertically to 0 and exits 48.5% of the panel height up (or down), and the next word enters flat from the opposite side, grows, and settles at the center (−1.5%).
  kfFx.register("squash-word-cycle", (el, { options, reduce }) => {
    if (!window.gsap) return;
    const words = [...el.querySelectorAll('[data-fx-part="word"]')];
    if (!words.length) return;
    const every = +(options.every || 3);
    const dur = +(options.dur ?? 0.6);
    const ease = kfFx.ease(options.ease || "expo.inOut", "expo.inOut");
    const fillX = +(options["fill-x"] ?? 0.985);
    const fillY = +(options["fill-y"] ?? 0.975);
    const grow = +(options.grow ?? 1.013);
    const shift = +(options.shift ?? 0.485);
    const rest = +(options.rest ?? -0.015);
    let size = [];
    let active = 0;
    let timer = 0;
    let visible = true;
    const measure = () => {
      const bw = el.clientWidth, bh = el.clientHeight;
      size = words.map((w) => {
        const sx = w.offsetWidth ? (bw * fillX) / w.offsetWidth : 1;
        const sy = w.offsetHeight ? (bh * fillY) / w.offsetHeight : 1;
        return { sx, sy, bh };
      });
    };
    const place = () => {
      measure();
      words.forEach((w, i) => {
        const s = size[i];
        if (i === active) gsap.set(w, { xPercent: -50, yPercent: -50, x: 0, y: rest * s.bh, scaleX: s.sx, scaleY: s.sy, autoAlpha: 1 });
        else gsap.set(w, { xPercent: -50, yPercent: -50, x: 0, y: shift * s.bh, scaleX: s.sx, scaleY: 0, autoAlpha: 0 });
      });
    };
    const step = () => {
      if (!visible || words.length < 2) return;
      const prev = active;
      const next = (active + 1) % words.length;
      active = next;
      const r = next % 2 === 0 ? -1 : 1;
      const a = words[prev], b = words[next], sa = size[prev], sb = size[next];
      gsap.to(a, { scaleY: 0, y: shift * sa.bh * r, duration: dur, ease, onComplete: () => gsap.set(a, { autoAlpha: 0 }) });
      gsap.set(b, { autoAlpha: 1, scaleX: sb.sx, scaleY: 0, y: -shift * sb.bh * r });
      gsap.to(b, { scaleY: sb.sy * grow, y: rest * sb.bh, duration: dur, ease });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    words.forEach((w) => ro.observe(w));
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    if (!reduce && words.length > 1) timer = setInterval(step, every * 1000);
    return () => {
      clearInterval(timer);
      ro.disconnect();
      io.disconnect();
      gsap.killTweensOf(words);
      gsap.set(words, { clearProps: "all" });
    };
  });
})();
