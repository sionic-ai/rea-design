(() => {
  // Pins the hero, places plates (layers with the same data-sec number share the same spot) laid end to end by plate width, then pushes them left by the scroll amount (scrub 1).
  // Pieces with data-speed get pushed (1 − speed) × the distance more, flowing faster or slower than the panel, while pieces outside the panel (e.g. the center person photo) stay put.
  kfFx.register("pin-layer-pan", (el, { options, reduce, scroller }) => {
    const secs = [...el.querySelectorAll('[data-fx-part="section"]')];
    if (!secs.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const num = (s) => parseInt(s.dataset.sec || "1", 10);
    const max = Math.max(...secs.map(num));
    let cache = { offsets: {}, total: 0 };
    const measure = () => {
      const offsets = {};
      let sum = 0;
      for (let i = 1; i <= max; i++) {
        offsets[i] = sum;
        const s = secs.find((x) => num(x) === i);
        sum += s ? s.offsetWidth : el.offsetWidth;
      }
      cache = { offsets, total: Math.max(0, sum - el.offsetWidth) };
    };
    const place = () => secs.forEach((s) => gsap.set(s, { x: cache.offsets[num(s)] }));
    measure();
    place();
    if (reduce) return () => gsap.set(secs, { clearProps: "transform" });
    const speeds = [...el.querySelectorAll("[data-speed]")];
    const tl = gsap.timeline();
    tl.to(secs, { x: (i, s) => cache.offsets[num(s)] - cache.total, ease: "none" }, 0);
    speeds.forEach((p) => tl.to(p, { x: () => (1 - parseFloat(p.dataset.speed)) * cache.total, ease: "none" }, 0));
    // While pinned, is-fx-panning is set — so parts attached later (the ribbon inside the panel) can tell the pin had already started when they attach
    const fire = (type) => { el.classList.toggle("is-fx-panning", type === "fx:enter"); el.dispatchEvent(new CustomEvent(type, { bubbles: true })); };
    const st = ScrollTrigger.create({
      scroller,
      trigger: el,
      start: options.start || "top top",
      end: () => "+=" + cache.total,
      pin: true,
      scrub: options.scrub != null ? +options.scrub : 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      animation: tl,
      onRefreshInit: () => { measure(); place(); },
      onEnter: () => fire("fx:enter"),
      onEnterBack: () => fire("fx:enter"),
      onLeaveBack: () => fire("fx:leave"),
      onUpdate: (self) => el.style.setProperty("--fx-pan", self.progress.toFixed(4)),
    });
    if (st.isActive || (st.scroll() >= st.start && st.scroll() <= st.end)) fire("fx:enter");
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(el);
    return () => { el.classList.remove("is-fx-panning"); ro.disconnect(); st.kill(); tl.kill(); gsap.set(secs.concat(speeds), { clearProps: "transform" }); el.style.removeProperty("--fx-pan"); };
  });
})();
