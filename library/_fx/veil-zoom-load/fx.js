(() => {
  // When the hero opens, the accent-color curtain (.8) lifts and the ring loader blurs out, while the background photo slowly grows over a long time,
  // The large text drawing slides in sideways from blur — no separate loading curtain, the hero itself wakes up.
  kfFx.register("veil-zoom-load", (el, { options, reduce }) => {
    const part = (n) => [...el.querySelectorAll(`[data-fx-part="${n}"]`)];
    const veil = part("veil"), spin = part("spinner"), zoom = part("zoom"), blur = part("blur-in"), slide = part("slide-in");
    const all = [...veil, ...spin, ...zoom, ...blur, ...slide];
    if (!all.length) return;
    if (reduce) {
      if (veil.length) gsap.set(veil, { autoAlpha: 0 });
      if (spin.length) gsap.set(spin, { autoAlpha: 0 });
      if (blur.length || slide.length) gsap.set([...blur, ...slide], { opacity: 1 });
      return () => gsap.set(all, { clearProps: "opacity,visibility" });
    }
    const ease = kfFx.ease(options.ease || "0.25,0.1,0.25,1", "power1.inOut");
    const delay = +(options.delay ?? 0.2), from = +(options.veil ?? 0.8);
    const tl = gsap.timeline({ delay });
    if (veil.length) tl.fromTo(veil, { opacity: from }, { opacity: 0, duration: +(options.dur ?? 1), ease }, 0);
    if (spin.length) tl.fromTo(spin, { opacity: 1 }, { opacity: 0, duration: +(options.dur ?? 1), ease }, 0);
    if (zoom.length) tl.fromTo(zoom, { scale: 1 }, { scale: +(options.scale ?? 1.14), duration: +(options.zoom ?? 14), ease }, 0);
    if (blur.length) tl.fromTo(blur, { opacity: 0, xPercent: -(+(options.shift ?? 10)), filter: `blur(${options.blur ?? 30}px)` }, { opacity: 1, xPercent: 0, filter: "blur(0px)", duration: +(options.blurDur ?? 2), ease }, 0);
    if (slide.length) tl.fromTo(slide, { opacity: 0, x: +(options.slide ?? 30) }, { opacity: 1, x: 0, duration: +(options.slideDur ?? 1), ease }, +(options.slideAt ?? 1.2));
    return () => { tl.kill(); gsap.set(all, { clearProps: "opacity,transform,filter,visibility" }); };
  });
})();
