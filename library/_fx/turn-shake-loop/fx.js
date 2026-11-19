(() => {
  kfFx.register("turn-shake-loop", (el, { options, reduce }) => {
    if (reduce) return;
    const items = () => [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items().length) return;
    const every = (+(options.every ?? 1.8) || 1.8) * 1000;
    const dur = +(options.dur ?? 0.6) * 1000;
    const steps = Math.max(1, Math.round(+options.steps || 6));
    const range = +(options.range ?? 4);
    const hops = Math.max(1, Math.round(+options.hops || 4));
    const rnd = () => (Math.random() * 2 - 1) * range;
    let i = 0, timer = 0, io = null;
    const shake = () => {
      const list = items();
      if (!list.length) return;
      const target = list[i % list.length];
      i = (i + 1) % list.length;
      const frames = [{ transform: "translate(0px, 0px) rotate(0deg)" }];
      for (let k = 0; k < hops; k++) {
        frames.push({ transform: `translate(${rnd()}px, ${rnd()}px) rotate(${rnd()}deg)` });
        frames.push({ transform: "translate(0px, 0px) rotate(0deg)" });
      }
      target.animate(frames, { duration: dur, easing: `steps(${steps}, end)` });
    };
    const begin = () => { if (!timer) timer = setInterval(shake, every); };
    const onStart = () => begin();
    if (options.start === "event") el.addEventListener("fx:start", onStart);
    else {
      io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { begin(); io.disconnect(); } });
      io.observe(el);
    }
    return () => { clearInterval(timer); timer = 0; io?.disconnect(); el.removeEventListener("fx:start", onStart); };
  });
})();
