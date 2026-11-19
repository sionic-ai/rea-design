// A full-screen photo slot is tied to scroll and folded into a small slot in the title row via Flip.fit — the slots open from width 0 and the length is divided by the distance between slots
(() => {
  kfFx.register("flip-into-slot", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger || !window.Flip || !options.slot || !el.parentElement) return;
    const slots = [...document.querySelectorAll(options.slot)];
    if (!slots.length || reduce) return;
    const zones = [el.parentElement, ...slots];
    const hide = options.hide ? [...document.querySelectorAll(options.hide)] : [];
    const ease = options.ease || "power1.out";
    const end = options.end || "center 35%";
    const grow = options.grow !== "off";
    const mid = (n) => n.getBoundingClientRect().top + n.offsetHeight / 2;
    const trigger = { trigger: zones[0], scroller, start: "center center", endTrigger: zones[zones.length - 1], end };
    let tl = null;
    const build = () => {
      tl?.scrollTrigger?.kill();
      tl?.kill();
      gsap.set(el, { clearProps: "all" });
      gsap.set(slots, { clearProps: "width" });
      tl = gsap.timeline({ scrollTrigger: { ...trigger, scrub: true } });
      zones.forEach((zone, i) => {
        const next = zones[i + 1];
        if (!next) return;
        const d = Math.max(1, mid(next) - mid(zone));
        tl.add(Flip.fit(el, next, { duration: d, ease }));
        if (grow) tl.from(next, { width: 0, duration: d, ease }, "<");
      });
    };
    build();
    const st = hide.length ? ScrollTrigger.create({ ...trigger, onUpdate: (s) => gsap.set(hide, { opacity: s.progress > 0 ? 0 : 1 }) }) : null;
    ScrollTrigger.addEventListener("refreshInit", build);
    // Watch only the stage size — this part changes the cell width, so watching them would loop re-measuring forever
    let raf = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => ScrollTrigger.refresh()); });
    ro.observe(zones[0]);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      ScrollTrigger.removeEventListener("refreshInit", build);
      tl?.scrollTrigger?.kill();
      tl?.kill();
      st?.kill();
      gsap.set([el, ...slots, ...hide], { clearProps: "all" });
    };
  });
})();
