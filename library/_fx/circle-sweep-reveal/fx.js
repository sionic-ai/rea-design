// An accent-color circle covers the cell from outside the top left, turns on the photo, then shrinks toward outside the bottom right and clears away
(() => {
  const IN = "M0,0,C0.25,0,0.294,0.023,0.335,0.05,0.428,0.11,0.466,0.292,0.498,0.502,0.532,0.73,0.586,0.88,0.64,0.928,0.679,0.962,0.698,1,1,1";
  const OUT = "M0,0,C0.084,0.61,0.214,0.802,0.28,0.856,0.356,0.918,0.374,1,1,1";
  kfFx.register("circle-sweep-reveal", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const img = el.querySelector(':scope > [data-fx-part="img"]') || [...el.children].find((c) => c.dataset.fxPart !== "cover");
    const cover = document.createElement("div");
    cover.dataset.fxPart = "cover";
    el.append(cover);
    el.classList.add("is-hidden");
    const inE = kfFx.ease(options["ease-in"] || IN, "expo.inOut");
    const outE = kfFx.ease(options["ease-out"] || OUT, "expo.out");
    const tl = gsap.timeline({ paused: true, onComplete: () => cover.remove() });
    tl.fromTo(cover, { clipPath: "circle(50% at -65% 0%)", visibility: "hidden" }, { clipPath: "circle(200% at -65% 0%)", visibility: "visible", duration: +(options.in ?? 0.9), ease: inE });
    tl.call(() => el.classList.remove("is-hidden"));
    tl.fromTo(cover, { clipPath: "circle(200% at 165% 100%)" }, { clipPath: "circle(50% at 165% 100%)", duration: +(options.out ?? 1.2), ease: outE }, "<");
    const zoom = +(options.zoom ?? 1.1);
    if (img && zoom !== 1) tl.from(img, { scale: zoom, duration: +(options["zoom-dur"] ?? 1.4), ease: outE }, "<");
    tl.timeScale(+(options.speed ?? 1) || 1);
    const st = ScrollTrigger.create({ scroller, trigger: el, start: options.start || "top bottom", once: true, onEnter: () => tl.play() });
    return () => { st.kill(); tl.kill(); cover.remove(); el.classList.remove("is-hidden"); if (img) gsap.set(img, { clearProps: "transform" }); };
  });
})();
