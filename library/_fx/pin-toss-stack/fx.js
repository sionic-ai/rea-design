(() => {
  // Stretch the section height to (card count × per)vh and pin the stage to the screen. Stacked photo cards are tied to scroll and fly up one at a time (tilting alternately left · right as they vanish)
  // The section below is revealed, and the current section number is announced via data-step — text, dots and background color are changed by the consuming css through [data-step]
  kfFx.register("pin-toss-stack", (el, { options, reduce, scroller }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    const stage = el.querySelector('[data-fx-part="stage"]');
    if (!cards.length || !stage) return;
    const n = cards.length, per = +(options.per ?? 150), span = +(options.span ?? 1.6);
    // first·every — the position where the first sheet starts flying and the spacing between sheets (vh). The original uses different spacing for sheet numbers and for flying, so they are taken separately
    const first = +(options.first ?? per), every = +(options.every ?? per), height = +(options.height ?? n * per);
    const x = +(options.x ?? 350), y = +(options.y ?? -350), rot = +(options.rotate ?? 30), scrub = +(options.scrub ?? 1);
    el.style.setProperty("--fx-toss-h", `${height}vh`);
    cards.forEach((c, i) => { c.style.zIndex = String(n - i); });
    const setStep = (k) => { if (el.dataset.step !== String(k)) el.dataset.step = String(k); };
    setStep(1);
    if (reduce) return () => { el.style.removeProperty("--fx-toss-h"); cards.forEach((c) => c.style.removeProperty("z-index")); delete el.dataset.step; };
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const total = height;
      ScrollTrigger.create({
        trigger: el, scroller, start: "top top", end: "bottom bottom",
        onUpdate: (st) => setStep(Math.min(n, Math.floor((st.scroll() - st.start) / (per * innerHeight / 100)) + 1)),
      });
      cards.slice(0, -1).forEach((c, i) => {
        const dir = i % 2 ? 1 : -1;
        const from = first + i * every, to = Math.min(total, from + per * span);
        gsap.fromTo(c, { autoAlpha: 1, x: 0, y: 0, rotation: 0 }, {
          autoAlpha: 0, x: dir * x, y, rotation: dir * rot, ease: "none",
          scrollTrigger: { trigger: el, scroller, start: () => `top+=${from * innerHeight / 100} top`, end: () => `top+=${to * innerHeight / 100} top`, scrub, invalidateOnRefresh: true },
        });
      });
    });
    return () => {
      mm.revert();
      el.style.removeProperty("--fx-toss-h");
      cards.forEach((c) => c.style.removeProperty("z-index"));
      delete el.dataset.step;
    };
  });
})();
