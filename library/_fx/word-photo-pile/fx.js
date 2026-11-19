(() => {
  kfFx.register("word-photo-pile", (el, { options, reduce, hover }) => {
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!photos.length) return;
    const every = +(options.every ?? 240), spread = +(options.spread ?? 50), rise = +(options.rise ?? 50), tilt = +(options.tilt ?? 10);
    const box = +(options.box ?? 248), dur = +(options.dur ?? 0.4), wait = +(options.wait ?? 0.5), out = +(options.out ?? 0.25), shrink = +(options.shrink ?? 0.9);
    let timer = 0, n = 0;
    const spawn = () => {
      const src = photos[n++ % photos.length];
      const [a, b] = (src.dataset.ratio || "1/1").split("/").map(Number);
      const item = document.createElement("span");
      item.dataset.fxPart = "pile";
      const pic = src.cloneNode(true);
      pic.removeAttribute("data-fx-part");
      pic.style.width = `${a >= b ? box : (box * a) / b}px`;
      pic.style.height = `${a >= b ? (box * b) / a : box}px`;
      item.append(pic);
      el.append(item);
      // From the word’s center, ±spread/2 left and right, floats up from rise below tilted (±tilt/2), settles in place, then after wait shrinks by shrink and disappears
      gsap.fromTo(item, { xPercent: -50, yPercent: -50, x: (Math.random() - 0.5) * spread, y: rise, rotation: (Math.random() - 0.5) * tilt },
        { y: 0, rotation: (Math.random() - 0.5) * tilt, duration: reduce ? 0 : dur, ease: "power4.out" });
      gsap.to(item, { scale: shrink, delay: reduce ? 0 : wait, duration: reduce ? 0 : out, ease: "back.in(3)", onComplete: () => item.remove() });
    };
    const start = (limit = Infinity) => {
      let k = 0;
      clearInterval(timer);
      timer = setInterval(() => { spawn(); if (++k >= limit) clearInterval(timer); }, every);
    };
    const stop = () => clearInterval(timer);
    const enter = () => start();
    const tap = () => start(photos.length);
    if (hover) { el.addEventListener("pointerenter", enter); el.addEventListener("pointerleave", stop); }
    else el.addEventListener("click", tap);
    return () => {
      stop();
      el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", stop); el.removeEventListener("click", tap);
      el.querySelectorAll(':scope > [data-fx-part="pile"]').forEach((p) => { gsap.killTweensOf(p); p.remove(); });
    };
  });
})();
