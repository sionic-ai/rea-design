(() => {
  // A text-colored bar sweeps across the title line once — it grows from the left to cover the line (lead), and after reveal seconds it clears from the left (trail), uncovering the text.
  kfFx.register("bar-pass-line", (el, { options, reduce, scroller }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    if (!lines.length) return;
    const set = (lead, trail) => lines.forEach((l) => { l.style.setProperty("--fx-lead", lead); l.style.setProperty("--fx-trail", trail); });
    const narrow = +(options.narrow ?? 1024);
    // On narrow screens rows wrap so the bar can’t follow the row shape — the original also leaves out the bar on phones
    if (reduce || innerWidth <= narrow) { set(1, 1); return () => lines.forEach((l) => { l.style.removeProperty("--fx-lead"); l.style.removeProperty("--fx-trail"); }); }
    const step = +(options.step ?? 0.5), reveal = +(options.reveal ?? 0.44), each = +(options.each ?? 0.1), delay = +(options.delay ?? 0);
    const ease = kfFx.ease(options.ease || "0.92,0.09,0.13,0.97", "power4.inOut");
    set(0, 0);
    const tl = gsap.timeline({ paused: options.start === "load", scrollTrigger: options.start === "load" ? undefined : { trigger: el, start: options.start || "top 65%", once: true, scroller } });
    lines.forEach((l, i) => {
      tl.fromTo(l, { "--fx-lead": 0 }, { "--fx-lead": 1, duration: step, ease }, delay + i * each)
        .fromTo(l, { "--fx-trail": 0 }, { "--fx-trail": 1, duration: step, ease }, delay + i * each + reveal);
    });
    if (options.start === "load") tl.play();
    return () => { tl.scrollTrigger?.kill(); tl.kill(); lines.forEach((l) => { l.style.removeProperty("--fx-lead"); l.style.removeProperty("--fx-trail"); }); };
  });
})();
