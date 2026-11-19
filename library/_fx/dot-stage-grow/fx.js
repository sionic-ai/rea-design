// Once, the moment the dot at the section center becomes visible, it spreads into an ellipse wider than the screen to become a white stage and the content floats up (a reference site’s .solution__each)
(() => {
  kfFx.register("dot-stage-grow", (el, { options, reduce, scroller }) => {
    const dot = el.querySelector(':scope > [data-fx-part="dot"]');
    if (!dot) return;
    const content = [...el.querySelectorAll('[data-fx-part="content"]')];
    gsap.registerPlugin(ScrollTrigger);
    const narrow = +(options.narrow || 1080);
    const w = () => (innerWidth <= narrow ? options["w-narrow"] || "280vw" : options.w || "160vw");
    const h = options.h || "100%";
    if (reduce) {
      gsap.set(dot, { width: w(), height: h });
      return () => gsap.set(dot, { clearProps: "width,height" });
    }
    const ease = kfFx.ease(options.ease || "0.25,0.1,0.25,1", "power1.inOut");
    const dur = +(options.dur ?? 1), rise = +(options.rise ?? 40), riseDur = +(options["rise-dur"] ?? 0.4);
    if (content.length) gsap.set(content, { y: rise, opacity: 0 });
    let tweens = [];
    const st = ScrollTrigger.create({
      trigger: el, scroller, start: options.start || "top 66.667%", once: true,
      onEnter: () => {
        tweens.push(gsap.to(dot, { width: w(), height: h, duration: dur, ease }));
        if (content.length) tweens.push(gsap.to(content, { y: 0, opacity: 1, duration: riseDur, ease }));
      },
    });
    const fit = () => { if (st.progress === 1 || tweens.length) gsap.set(dot, { width: w() }); };
    addEventListener("resize", fit);
    return () => {
      st.kill(); tweens.forEach((t) => t.kill());
      removeEventListener("resize", fit);
      gsap.set(dot, { clearProps: "width,height" });
      if (content.length) gsap.set(content, { clearProps: "transform,opacity" });
    };
  });
})();
