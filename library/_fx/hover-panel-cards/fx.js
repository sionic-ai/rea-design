(() => {
  kfFx.register("hover-panel-cards", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const panel = el.querySelector('[data-fx-part="panel"]'), contents = el.querySelector('[data-fx-part="contents"]');
    if (!items.length) return;
    if (!hover || reduce) { gsap.set(items, { opacity: 1 }); return () => gsap.set(items, { clearProps: "opacity" }); }
    const dur = +(options.dur ?? 0.7), delay = +(options.delay ?? 0.4), each = +(options.each ?? 0.04), rise = +(options.rise ?? 60);
    const ease = kfFx.ease("0.32,0.48,0,1", "power3.out");
    if (contents) gsap.set(contents, { pointerEvents: "none" });
    if (panel) gsap.set(panel, { scaleX: 0, scaleY: 0.25 });
    gsap.set(items, { opacity: 0, y: `${rise}%` });
    const tl = gsap.timeline({
      paused: true,
      onStart: () => contents && (contents.style.pointerEvents = "auto"),
      onReverseComplete: () => contents && (contents.style.pointerEvents = "none"),
    });
    if (panel) tl.to(panel, { scaleX: 1, duration: dur, ease }, 0).to(panel, { scaleY: 1, duration: dur, ease: "power2.inOut" }, 0);
    tl.to(items, { y: "0%", opacity: 1, duration: dur, ease, stagger: each }, delay);
    let over = false, timer;
    // When the hand moves from the band to a card, wait one beat (10ms) so a brief exit-and-enter event in between doesn’t collapse it
    const enter = () => { over = true; clearTimeout(timer); tl.play(); };
    const leave = () => { over = false; clearTimeout(timer); timer = setTimeout(() => !over && tl.reverse(), 10); };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      clearTimeout(timer); tl.kill();
      el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave);
      gsap.set([...items, panel, contents].filter(Boolean), { clearProps: "all" });
    };
  });
})();
