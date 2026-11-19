// Once the fish school or piece artwork crosses the line 20% from the bottom of the screen, each piece goes from .8x and transparent to full, over its own random length (.4~.8s).
// Pops in on quart.out — delay between pieces steps by 20ms each, so the swarm lights up as if spreading from one side
(() => {
  kfFx.register("school-pop-in", (el, { options, reduce, scroller }) => {
    const parts = [...el.querySelectorAll('[data-fx-part="item"]')];
    const items = parts.length ? parts : [...el.children];
    if (!items.length) return;
    const from = +(options.scale ?? 0.8);
    const min = +(options.min ?? 0.4), max = +(options.max ?? 0.8), each = +(options.each ?? 0.02);
    const at = +(options.at ?? 80);
    const ease = kfFx.ease(options.ease || "0.25,1,0.5,1", "power4.out");
    const show = () => gsap.set(items, { clearProps: "opacity,scale,transformOrigin" });
    if (reduce) return show;
    gsap.set(items, { opacity: 0, scale: from, transformOrigin: "50% 50%" });
    let tw = null;
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      tw = gsap.to(items, { opacity: 1, scale: 1, ease, duration: () => gsap.utils.random(min, max), delay: (i) => i * each });
    }, { root: scroller || null, rootMargin: `0px 0px ${-(100 - at)}% 0px` });
    io.observe(el);
    return () => { io.disconnect(); tw?.kill(); show(); };
  });
})();
