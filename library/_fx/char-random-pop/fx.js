(() => {
  // Splits the big English title into characters and pops each from 0 to 1 — scattered in random order with very short gaps (within .1s)
  kfFx.register("char-random-pop", (el, { options, reduce, scroller }) => {
    const text = el.textContent;
    if (!text.trim()) return;
    const original = el.innerHTML;
    el.innerHTML = [...text].map((c) => (c === " " ? " " : `<em data-fx-part="char">${c}</em>`)).join("");
    const chars = [...el.querySelectorAll('[data-fx-part="char"]')];
    const undo = () => { gsap.killTweensOf(chars); el.innerHTML = original; };
    if (reduce) return undo;
    const dur = +(options.dur ?? 0.6), delay = +(options.delay ?? 0.6), amount = +(options.amount ?? 0.1);
    const ease = kfFx.ease(options.ease || "M0,0 C0.205,0 0.188,1.077 0.573,1.078 0.746,1.078 0.825,1 1,1", "back.out(1.4)");
    gsap.set(chars, { scale: 0 });
    const play = () => gsap.to(chars, { scale: 1, duration: dur, delay, ease, stagger: { amount, from: options.from || "random" } });
    let st;
    if (options.start && window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); st = ScrollTrigger.create({ trigger: el, scroller, start: options.start, once: true, onEnter: play }); }
    else play();
    return () => { st && st.kill(); undo(); };
  });
})();
