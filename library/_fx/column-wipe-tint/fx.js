(() => {
  // Original Lottie mask start frame (30fps) — bars beyond the fifth start 3 frames later each
  const AT = [0, 4, 7, 10, 13];
  kfFx.register("column-wipe-tint", (el, { options, reduce, scroller }) => {
    if (!window.gsap) return;
    const cols = [...el.querySelectorAll('[data-fx-part="col"]')];
    if (!cols.length) return;
    const clear = () => gsap.set(cols, { clearProps: "clipPath,--fx-t" });
    if (reduce) { gsap.set(cols, { clipPath: "inset(0% 0% 0% 0%)", "--fx-t": 1 }); return clear; }

    const fromRight = options.from === "right";
    const order = [...cols].sort((a, b) => (fromRight ? -1 : 1) * (a.getBoundingClientRect().left - b.getBoundingClientRect().left));
    const speed = +(options.speed ?? 1);
    const f = (n) => (n / 30) * speed;
    const ease = kfFx.ease(options.ease || "0.333,0,0,1", "expo.out");
    gsap.set(cols, { clipPath: "inset(100% 0% 0% 0%)", "--fx-t": 0 });
    const tl = gsap.timeline({ paused: true, delay: +(options.delay ?? 0) });
    order.forEach((c, i) => {
      const at = i < AT.length ? AT[i] : AT[AT.length - 1] + (i - AT.length + 1) * 3;
      tl.to(c, { clipPath: "inset(0% 0% 0% 0%)", duration: f(16), ease }, f(at));
    });
    tl.to(cols, { "--fx-t": 1, duration: f(10), ease: "none" }, f(10));

    const on = options.on || "enter";
    const play = () => tl.play();
    let st;
    if (on === "load" || (on === "enter" && !window.ScrollTrigger)) play();
    else if (on === "state") el.addEventListener("fx:play", play);
    else st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 80%", once: true, onEnter: play });
    return () => { tl.kill(); st?.kill(); el.removeEventListener("fx:play", play); clear(); };
  });
})();
