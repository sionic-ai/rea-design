(() => {
  const CORNERS = {
    "top left": "inset(0% 100% 100% 0%)",
    "top right": "inset(0% 0% 100% 100%)",
    "bottom left": "inset(100% 100% 0% 0%)",
    "bottom right": "inset(100% 0% 0% 100%)",
  };
  kfFx.register("corner-grow-row", (el, { options, reduce, scroller }) => {
    const rule = el.querySelector(':scope > [data-fx-part="rule"]');
    let items = [...el.querySelectorAll(':scope > [data-fx-part="item"]')];
    if (!items.length) items = [...el.children].filter((c) => c !== rule);
    items = items.filter((c) => getComputedStyle(c).display !== "none");
    if (reduce || !items.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const ease = kfFx.ease(options.ease || "power3.inOut", "power3.inOut");
    const from = CORNERS[options.corner] || CORNERS["top left"];
    const fx = gsap.context(() => {
      gsap.set(items, { clipPath: from });
      if (rule) gsap.set(rule, { scaleX: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: options.start || "top 80%", once: true } });
      if (rule) tl.to(rule, { scaleX: 1, duration: 0.85, ease }, 0);
      tl.to(items, { clipPath: "inset(0% 0% 0% 0%)", duration: +(options.dur ?? 1.05), stagger: +(options.stagger ?? 0.08), ease }, +(options.delay ?? 0.15));
    });
    return () => fx.revert();
  });
})();
