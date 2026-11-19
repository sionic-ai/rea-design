(() => {
  // Original (a wedding site’s guest letter): per card keyframes [1 beat → center 0°] [hold 2 beats] [1 beat → up −50%, left 120%, 10°], between cards, ">" connects with
  kfFx.register("tilt-pass-cards", (el, { options, reduce, scroller }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const tilt = +(options.tilt ?? 10);
    const hold = +(options.hold ?? 2);
    const per = +(options.per ?? 2.17) || 2.17;
    el.style.setProperty("--fx-screens", String(cards.length * per + 1));
    el.style.setProperty("--fx-tilt", `${tilt}deg`);
    if (reduce) return () => { el.style.removeProperty("--fx-screens"); el.style.removeProperty("--fx-tilt"); };
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: "top top", end: "bottom bottom", scrub: true } });
    cards.forEach((card) => {
      gsap.set(card, { top: "120%", left: "-50%", rotate: tilt });
      tl.to(card, {
        keyframes: [
          { duration: 1, top: "50%", left: "50%", rotate: 0, ease: "none" },
          { duration: hold, top: "50%", left: "50%", rotate: 0, ease: "none" },
          { duration: 1, top: "-50%", left: "120%", rotate: tilt, ease: "none" },
        ],
      }, ">");
    });
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set(cards, { clearProps: "top,left,rotate" });
      el.style.removeProperty("--fx-screens");
      el.style.removeProperty("--fx-tilt");
    };
  });
})();
