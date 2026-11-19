(() => {
  // N photo cells each stand in one of N spots set by the page css (--fx-slot-x · --fx-slot-y · --fx-slot-r), and every interval seconds they all move to the next spot, one step at a time.
  // The first and last slots are transparent, so a slot that leaves at the end returns to the front and reappears unseen — a photo strip flowing along an arc
  kfFx.register("slot-step-conveyor", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (items.length < 3) return;
    const interval = +(options.interval ?? 3), dur = +(options.dur ?? 1.2), delay = +(options.delay ?? 0);
    const ease = !options.ease ? "ease" : kfFx.ease(options.ease, "power1.inOut");
    const fade = options.fade !== "none";
    const read = (it, v) => getComputedStyle(it).getPropertyValue(v).trim() || "0px";
    const slots = items.map((it) => ({ x: read(it, "--fx-slot-x"), y: read(it, "--fx-slot-y"), r: read(it, "--fx-slot-r") }));
    const n = slots.length;
    const alpha = (k) => (fade && (k === 0 || k === n - 1) ? 0 : 1);
    let at = items.map((_, i) => i), timer = null, tl = null, visible = true;
    items.forEach((it, i) => gsap.set(it, { opacity: alpha(i) }));
    if (reduce) return () => items.forEach((it) => gsap.set(it, { clearProps: "opacity" }));
    const step = () => {
      at = at.map((k) => (k + 1) % n);
      tl = gsap.timeline();
      items.forEach((it, i) => {
        const s = slots[at[i]];
        tl.to(it, { "--fx-slot-x": s.x, "--fx-slot-y": s.y, "--fx-slot-r": s.r, opacity: alpha(at[i]), duration: dur, ease }, 0);
      });
      el.dispatchEvent(new CustomEvent("fx:step", { detail: { order: at.slice() } }));
    };
    const run = () => { clearInterval(timer); timer = setInterval(() => visible && step(), interval * 1000); };
    const startTimer = setTimeout(run, delay * 1000);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    return () => {
      clearTimeout(startTimer);
      clearInterval(timer);
      io.disconnect();
      if (tl) tl.kill();
      items.forEach((it) => { gsap.set(it, { clearProps: "opacity" }); it.style.removeProperty("--fx-slot-x"); it.style.removeProperty("--fx-slot-y"); it.style.removeProperty("--fx-slot-r"); });
    };
  });
})();
