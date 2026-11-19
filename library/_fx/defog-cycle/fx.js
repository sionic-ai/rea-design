(() => {
  // Stacked photos advance to the next one every N seconds — the incoming one settles from a brightly blooming (brightness 2·blur 8px) 1.2x down to clear. Pauses when off-screen, and on return advances half a beat later
  kfFx.register("defog-cycle", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll(':scope > [data-fx-part="item"]')];
    if (!items.length) return;
    let i = 0, timer = null, able = true;
    const show = () => items.forEach((it, k) => it.classList.toggle("is-active", k === i));
    show();
    if (reduce || items.length < 2) return () => items.forEach((it) => it.classList.remove("is-active"));
    const every = (+options.every || 5) * 1000;
    const play = (mul = 1) => {
      clearTimeout(timer);
      timer = setTimeout(() => { i = (i + 1) % items.length; show(); if (able) play(); }, every * mul);
    };
    const pause = () => { able = false; clearTimeout(timer); };
    const resume = () => { able = true; play(0.5); };
    play();
    const st = window.ScrollTrigger
      ? ScrollTrigger.create({ trigger: el, scroller: scroller || undefined, start: "top bottom", end: "bottom top", onEnter: resume, onEnterBack: resume, onLeave: pause, onLeaveBack: pause })
      : null;
    return () => { clearTimeout(timer); st && st.kill(); items.forEach((it) => it.classList.remove("is-active")); };
  });
})();
