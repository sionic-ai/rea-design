(() => {
  kfFx.register("corner-clip-cycle", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (items.length < 2) return;
    const DELAY = +(options.delay ?? 0.2), EACH = +(options.each ?? 0.2), DUR = +(options.dur ?? 0.8);
    const HOLD = +(options.hold ?? 3), SCALE = +(options.scale ?? 1.1);
    const pic = (it) => it.querySelector('[data-fx-part="img"]') || it;
    const base = pic(items[0]);
    const layers = items.slice(1);
    const imgs = layers.map(pic);
    const reset = () => layers.forEach((it) => it.style.setProperty("--fx-clip", "0"));
    reset();
    items.forEach((it, i) => { it.style.zIndex = String(i + 1); });
    if (reduce) return () => { layers.forEach((it) => it.style.removeProperty("--fx-clip")); items.forEach((it) => { it.style.zIndex = ""; }); };

    const clip = layers.map((it) => ({ v: 0, it }));
    const setClip = (c) => c.it.style.setProperty("--fx-clip", String(c.v));
    const tweens = [];
    let visible = true;
    const loaderDur = DUR + EACH * (layers.length - 1);
    const loader = gsap.timeline({ delay: DELAY, onComplete: loop });
    loader.fromTo(base, { scale: SCALE }, { scale: 1, duration: loaderDur, ease: "power1.out" }, 0);
    clip.forEach((c, i) => {
      loader.fromTo(c, { v: 0 }, { v: 1, duration: DUR, ease: "power2.inOut", onUpdate: () => setClip(c) }, i * EACH);
      loader.fromTo(imgs[i], { scale: SCALE }, { scale: 1, duration: DUR + EACH * (layers.length - 1 - i), ease: "power1.out" }, i * EACH);
    });
    tweens.push(loader);

    function loop() {
      clip.forEach((c) => { c.v = 0; setClip(c); });
      gsap.set(imgs, { scale: SCALE });
      tweens.push(gsap.fromTo(base, { scale: 1 }, { scale: SCALE, duration: (HOLD + DUR) / 2, ease: "power1.inOut", yoyo: true, repeat: -1 }));
      const tl = gsap.timeline({ repeat: -1 });
      clip.forEach((c, i) => {
        tl.fromTo(c, { v: 0 }, { v: 1, duration: DUR, ease: "power2.inOut", onUpdate: () => setClip(c), immediateRender: false }, i * HOLD);
        tl.to(imgs[i], { scale: 1, duration: HOLD + DUR, ease: "power1.inOut" }, i * HOLD);
      });
      tl.call(() => { clip.forEach((c) => { c.v = 0; setClip(c); }); gsap.set(imgs, { scale: SCALE }); });
      tweens.push(tl);
      if (!visible) tweens.forEach((t) => t.pause());
    }
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; tweens.forEach((t) => (visible ? t.resume() : t.pause())); });
    io.observe(el);
    return () => {
      io.disconnect();
      tweens.forEach((t) => t.kill());
      gsap.killTweensOf(clip);
      gsap.set([base, ...imgs], { clearProps: "transform" });
      layers.forEach((it) => it.style.removeProperty("--fx-clip"));
      items.forEach((it) => { it.style.zIndex = ""; });
    };
  });
})();
