// The two line segments’ lengths follow the label’s share of the row width, so the line draws at one steady pace like a single stroke
(() => {
  kfFx.register("split-rule-heading", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const rule = el.querySelector('[data-fx-part="rule"]'), label = rule?.querySelector('[data-fx-part="rule-label"]');
    if (reduce) { el.classList.add("is-shown"); gsap.set(el, { "--fx-a": 1, "--fx-b": 1 }); return () => el.classList.remove("is-shown"); }
    const delay = +(options.delay ?? 0.3), total = +(options.total ?? 1);
    let tl, call;
    const st = ScrollTrigger.create({
      trigger: el, once: true, start: options.start || "top bottom", ...(scroller && { scroller }),
      onEnter: () => {
        if (rule && label) {
          const r = Math.min(1, label.getBoundingClientRect().width / Math.max(1, rule.getBoundingClientRect().width));
          tl = gsap.timeline({ delay })
            .to(el, { "--fx-a": 1, duration: total * r, ease: "power2.in" })
            .to(el, { "--fx-b": 1, duration: total * (1 - r), ease: "power2.out" });
        }
        call = gsap.delayedCall(delay, () => el.classList.add("is-shown"));
      },
    });
    return () => { st.kill(); tl?.kill(); call?.kill(); el.classList.remove("is-shown"); gsap.set(el, { clearProps: "--fx-a,--fx-b" }); };
  });
})();
