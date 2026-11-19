(() => {
  kfFx.register("rise-from-fold", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (reduce || !items.length) return;
    const dur = +(options.dur ?? 1.3), each = +(options.each ?? 0.075), delay = +(options.delay ?? 0);
    const wh = innerHeight, ww = innerWidth;
    const seen = items.map((it) => ({ it, r: it.getBoundingClientRect() })).filter(({ r }) => r.width && r.bottom > 0 && r.top < wh && r.right > 0 && r.left < ww).sort((a, b) => a.r.top - b.r.top);
    const moved = [];
    seen.forEach(({ it }, i) => {
      const box = it.closest('[data-fx-part="box"]');
      const y = wh - (box || it).getBoundingClientRect().top;
      const targets = [it, ...(box ? box.querySelectorAll('[data-fx-part="text"]') : [])];
      moved.push(...targets);
      gsap.fromTo(targets, { y }, { y: 0, duration: dur, ease: "expo", delay: delay + i * each, clearProps: "transform" });
    });
    return () => { if (!moved.length) return; gsap.killTweensOf(moved); gsap.set(moved, { clearProps: "transform" }); };
  });
})();
