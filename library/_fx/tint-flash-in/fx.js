(() => {
  kfFx.register("tint-flash-in", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const dur = +(options.dur ?? 0.6), hold = +(options.hold ?? 0.5);
      gsap.set(el, { opacity: +(options.from ?? 0.3) });
      ScrollTrigger.create({
        scroller, trigger: el, start: options.start || "top bottom", once: true,
        onEnter: () => {
          const own = getComputedStyle(el).color;
          const flash = getComputedStyle(el).getPropertyValue("--fx-flash").trim() || own;
          const probe = document.createElement("i");
          probe.style.color = flash;
          el.appendChild(probe);
          const to = getComputedStyle(probe).color;
          probe.remove();
          gsap.to(el, { color: to, duration: dur, ease: "sine.out" });
          gsap.to(el, { color: own, opacity: 1, duration: dur, ease: "sine.out", delay: hold, onComplete: () => gsap.set(el, { clearProps: "color" }) });
        },
      });
    }, el);
    return () => ctx.revert();
  });
})();
