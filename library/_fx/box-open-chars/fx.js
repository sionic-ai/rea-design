(() => {
  // The white text box opens from height 0 (vertical text) or width 0 (horizontal text), and from .6s on the characters light up one by one. A box that was pushed aside waits a moment, then returns to its place.
  // Multiple boxes open in succession .2s before the previous one ends — the caller binds them into the same group
  const queues = new Map();
  kfFx.register("box-open-chars", (el, { options, reduce }) => {
    const text = el.querySelector('[data-fx-part="text"]') || el;
    if (!text.textContent.trim()) return;
    if (reduce) return;
    const vertical = options.axis ? options.axis === "height" : getComputedStyle(el).writingMode.startsWith("vertical");
    const dim = vertical ? "height" : "width";
    const dur = +(options.dur ?? 1), each = +(options.each ?? 0.15), x = +(options.x ?? 0), hold = +(options.hold ?? 1);
    const split = window.SplitText ? new SplitText(text, { type: "chars" }) : null;
    const chars = split ? split.chars : [text];
    gsap.set(el, { overflow: "hidden", whiteSpace: "nowrap" });
    const key = options.group || el;
    let q = queues.get(key);
    if (!q) {
      q = gsap.timeline({ delay: +(options.delay ?? 1), paused: options.start === "enter" && !!window.ScrollTrigger });
      if (options.start === "enter" && window.ScrollTrigger) ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => q.play() });
      queues.set(key, q);
      q.fxBack = [];
    }
    const first = !q.getChildren().length;
    q.from(el, { [dim]: 0, duration: dur }, first ? 0 : ">-0.2");
    q.fromTo(el, { autoAlpha: 0, x }, { autoAlpha: 1, duration: dur }, "<");
    q.fromTo(chars, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1, stagger: each }, "<0.6");
    if (x) {
      q.fxBack.push(el);
      // After attaching the last box of the group, add a single step in place just once
      clearTimeout(q.fxTimer);
      q.fxTimer = setTimeout(() => q.to(q.fxBack, { x: 0, duration: dur }, `>${hold}`));
    }
    return () => {
      clearTimeout(q.fxTimer);
      q.kill();
      queues.delete(key);
      split?.revert();
      gsap.set(el, { clearProps: "all" });
    };
  });
})();
