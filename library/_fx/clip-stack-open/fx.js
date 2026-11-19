(() => {
  kfFx.register("clip-stack-open", (el, { options, reduce, scroller }) => {
    const shots = [...el.querySelectorAll('[data-fx-part="shot"]')];
    if (shots.length < 2) return;
    const front = shots.slice(0, -1);
    if (reduce) { gsap.set(front, { opacity: 0 }); return () => gsap.set(front, { clearProps: "opacity" }); }
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const fade = +(options.fade ?? 0.5);
    gsap.set(shots, { clipPath: "inset(0% 0% 100% 0%)" });
    // Delay is kept as a slot inside the timeline — the delay of a timeline built paused has already passed by the time of a later play
    const tl = gsap.timeline({ paused: true })
      .to(shots, {
        clipPath: "inset(0% 0% 0% 0%)", duration: +(options.each ?? 0.8), ease, stagger: +(options.gap ?? 0.5),
        onComplete: () => gsap.to(front, { opacity: 0, duration: fade }),
      }, +(options.delay ?? 0.4));
    const start = options.start || "load";
    let st = null;
    if (start === "load" || !window.ScrollTrigger) tl.play();
    else {
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start, once: true, onEnter: () => tl.play() });
    }
    return () => { st?.kill(); tl.kill(); gsap.killTweensOf(front); gsap.set(shots, { clearProps: "clipPath,opacity" }); };
  });
})();
