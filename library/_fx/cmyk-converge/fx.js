(() => {
  kfFx.register("cmyk-converge", (el, { options, reduce, scroller }) => {
    const plates = [...el.querySelectorAll('[data-fx-part="plate"]')];
    const full = el.querySelector('[data-fx-part="full"]');
    if (!plates.length || !full || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const after = el.parentElement?.querySelector('[data-fx-part="after"]') || null;
    const frames = [...el.querySelectorAll('[data-fx-part="frame"]')];
    const fade = +(options.fade ?? 0.6);
    const mm = gsap.matchMedia();
    mm.add({ desk: "(min-width: 861px)", phone: "(max-width: 860px)" }, (ctx) => {
      const { desk } = ctx.conditions;
      const width = desk ? options.width || "75vw" : options.phone || "86vw";
      const grow = options.grow ?? "100vw";
      // On desktop, the plate ratio matches the screen ratio — when everything has gathered it becomes a window shaped like the screen
      const fit = () => desk && gsap.set(frames, { paddingTop: `${(innerHeight / innerWidth) * 100}%` });
      fit();
      // Fixed length = Screen height × number of panels (including the base color). Phones have no widening step, so one fewer
      const span = +(options.span || plates.length + 1) - (desk ? 0 : 1);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, scroller, start: "center center", end: () => `+=${innerHeight * span}`, pin: true, scrub: true, invalidateOnRefresh: true, onRefreshInit: fit },
      });
      // Per plate — as the plate center passes the screen center it darkens from 0 → .6 (four plates in the original, except the solid-color one)
      plates.forEach((p) => gsap.to(p, { opacity: fade, duration: 0.6, scrollTrigger: { trigger: p, scroller, start: "center center", end: "bottom top", scrub: true } }));
      [...plates, full].forEach((p) => tl.to(p, { x: 0, y: 0, width, duration: 0.6 }, "<="));
      tl.to(full, { opacity: 1, duration: 0.05 });
      if (desk && grow !== "none") tl.to(full, { width: grow, duration: 0.2 });
      if (desk && after) {
        const inner = full.querySelector('[data-fx-part="frame"] > *');
        if (inner) gsap.timeline({ scrollTrigger: { trigger: after, scroller, start: "bottom bottom", end: "bottom top", scrub: true } }).to(inner, { scale: 1.1, y: "10%" });
      }
    });
    return () => {
      mm.revert();
      gsap.set([...plates, full], { clearProps: "transform,opacity,width" });
      gsap.set(frames, { clearProps: "paddingTop" });
    };
  });
})();
