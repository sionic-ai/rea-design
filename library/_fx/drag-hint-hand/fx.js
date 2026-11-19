(() => {
  // ”Try dragging” hint board — the hand icon drags up, down and sideways by itself, each press moves to the next card, and it folds away at the last one.
  kfFx.register("drag-hint-hand", (el, { options, reduce }) => {
    const hand = el.querySelector('[data-fx-part="hand"]');
    if (!hand) return;
    const arrows = [...el.querySelectorAll('[data-fx-part="arrow"]')];
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    const delay = +(options.delay ?? 1), step = +(options.step ?? .6), fade = +(options.fade ?? .3), close = +(options.close ?? .35);
    const ease = kfFx.ease(options.ease || "0.455,0.03,0.515,0.955", "power2.inOut");
    let tl = null;
    if (!reduce) {
      tl = gsap.timeline({ defaults: { duration: step, ease }, delay });
      if (arrows.length) tl.to(arrows, { autoAlpha: 0, duration: fade, ease: "power1.out" });
      tl.to(hand, { x: "-50%", y: "-40%" }).to(hand, { x: "-50%", y: "10%" }).to(hand, { x: "50%", y: "10%" }).to(hand, { x: "50%", y: "-40%" }).to(hand, { x: 0, y: 0 });
      if (arrows.length) tl.to(arrows, { autoAlpha: 1, duration: fade, ease: "power1.out" });
    }
    let n = 0, out = null;
    cards.forEach((c, i) => c.classList.toggle("is-active", i === 0));
    const onClick = () => {
      n++;
      cards.forEach((c, i) => c.classList.toggle("is-active", i === n));
      if (n >= Math.max(1, cards.length) && !out) {
        out = gsap.to(el, { autoAlpha: 0, duration: reduce ? 0 : close, ease: "power2.out", onComplete: () => el.dispatchEvent(new CustomEvent("fx:hint-done", { bubbles: true })) });
      }
    };
    el.addEventListener("click", onClick);
    return () => {
      el.removeEventListener("click", onClick);
      tl?.kill(); out?.kill();
      gsap.set([hand, ...arrows, el], { clearProps: "transform,opacity,visibility" });
      cards.forEach((c) => c.classList.remove("is-active"));
    };
  });
})();
