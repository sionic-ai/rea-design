(() => {
  kfFx.register("radius-morph-scroll", (el, { options, reduce, scroller }) => {
    const plate = el.querySelector("[data-fx-part=plate]") || el;
    const round = String(options.to || "square").trim() === "round";
    const R = +(options.radius ?? 79);
    const ease = gsap.parseEase("power2.inOut");
    const box = () => (scroller ? scroller.clientHeight : innerHeight);
    const set = (p) => {
      const e = ease(Math.min(1, Math.max(0, p)));
      const r = R * ((scroller ? scroller.clientWidth : innerWidth) / 1440);
      plate.style.borderRadius = `${round ? r * e : r * (1 - e)}px`;
    };
    if (reduce) { set(1); return () => { plate.style.borderRadius = ""; }; }
    const st = ScrollTrigger.create({
      trigger: el, scroller: scroller || undefined, start: "top bottom", end: () => `center ${box() / 2}px`, invalidateOnRefresh: true,
      onUpdate: (s) => set(s.progress), onRefresh: (s) => set(s.progress),
    });
    set(st.progress);
    return () => { st.kill(); plate.style.borderRadius = ""; };
  });
})();
