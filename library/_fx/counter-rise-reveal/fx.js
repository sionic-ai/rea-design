// When a photo cell enters the view, the inner panel rises from the bottom of the cell (100%), and the photo inside drops in reverse from the top (−100%), settling from 1.75x to 1x — once only.
// The plate and photo move in opposite phase, so the photo stays almost in place and only the cell seems to open from below (full-bleed-product-furniture-store hotspot photo, original Spark ImageReveal)
(() => {
  kfFx.register("counter-rise-reveal", (el, { options, reduce, scroller }) => {
    const box = el.querySelector('[data-fx-part="media"]') || el.firstElementChild;
    if (!box || reduce) return;
    const photo = box.querySelector('[data-fx-part="photo"]') || box.firstElementChild;
    const dur = +(options.dur ?? 0.66), delay = +(options.delay ?? 0), zoom = +(options.zoom ?? 1.75);
    const ease = kfFx.ease(options.ease || "0.33,0,0,1", "expo.out");
    gsap.set(box, { yPercent: 100 });
    if (photo) gsap.set(photo, { yPercent: -100, scale: zoom });
    const tl = gsap.timeline({ paused: true, delay })
      .to(box, { yPercent: 0, duration: dur, ease }, 0);
    if (photo) tl.to(photo, { yPercent: 0, scale: 1, duration: dur, ease }, 0);
    const st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top bottom-=56", once: true, onEnter: () => tl.play() });
    return () => {
      st.kill();
      tl.kill();
      gsap.set(box, { clearProps: "transform" });
      if (photo) gsap.set(photo, { clearProps: "transform" });
    };
  });
})();
