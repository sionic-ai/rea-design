/* Brand — the wordmark scene melt is the goo-scene-swap (scrub) part, the workshop photo row is the drag-loop-lerp part. 
    Here, extras the original adds in the same section — a group where portraits light up one by one, fixed text sliding up at the section tail (--fx-p2 100→200), and the share where the portrait row floats up (--p3) */
(() => {
  const { $, $$, pc } = EDI;
  const gate = (c) => {
    const s = $(".e-brand", c);
    if (!s) return;
    if (pc.matches) s.setAttribute("data-fx", "goo-scene-swap"); else s.removeAttribute("data-fx");
  };
  gate(document);

  EDI.view("brand", (c) => {
    gate(c);
    const s = $(".e-brand", c);
    if (!s || !pc.matches) return;
    ScrollTrigger.create({
      trigger: s, start: () => `bottom bottom+=${innerHeight * 0.5}`, end: () => `+=${innerHeight * 0.3}`, invalidateOnRefresh: true,
      onUpdate: (st) => gsap.set(s, { "--fx-p2": 100 + 100 * st.progress }),
    });
    ScrollTrigger.create({
      trigger: s, start: () => `top bottom-=${innerHeight / 2}`, end: "bottom top", invalidateOnRefresh: true,
      onUpdate: (st) => gsap.set(s, { "--p3": st.progress }),
    });
    const on = (els) => gsap.to(els, { duration: 1, "--p": 1, stagger: 0.15 });
    const off = (els) => gsap.to(els, { duration: 1, "--p": 0, stagger: 0.15 });
    ScrollTrigger.batch($$(".e-greats__item", c), { start: "top 90%", end: "bottom 30%", onEnter: on, onEnterBack: on, onLeave: off, onLeaveBack: off });
  });
})();
