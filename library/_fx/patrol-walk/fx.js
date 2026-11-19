(() => {
  // Walks a set distance at constant speed and back, endlessly — flipping left-right at each turn so it always faces the direction it is going.
  kfFx.register("patrol-walk", (el, { options, reduce }) => {
    if (reduce) return;
    const body = el.querySelector('[data-fx-part="body"]') || el;
    const dist = +options.dist || 300, speed = +options.speed || 30;
    const dir = options.dir === "left" ? -1 : 1, flip = options.flip !== "false";
    let tw;
    const go = () => {
      if (flip) gsap.set(body, { scaleX: dir });
      tw = gsap.to(body, { duration: dist / speed, x: dist * dir, ease: "none", onComplete: back });
    };
    const back = () => {
      if (flip) gsap.set(body, { scaleX: -dir });
      tw = gsap.to(body, { duration: dist / speed, x: 0, ease: "none", onComplete: go });
    };
    go();
    return () => { tw?.kill(); gsap.set(body, { clearProps: "transform" }); };
  });
})();
