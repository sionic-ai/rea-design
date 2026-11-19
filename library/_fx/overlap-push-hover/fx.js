(() => {
  kfFx.register("overlap-push-hover", (el, { options, reduce, hover, scroller }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length || reduce || !hover) return;
    const rest = (options.rest || "-3,5,-3,-3").split(",").map(Number);
    const rows = (options.push || "0,7,5,5 / -10,0,8,8 / -15,-8,0,10 / -10,-8,-10,0").split("/").map((r) => r.split(",").map(Number));
    const big = +(options.scale ?? 1.1), back = "back.out(1.7)", settle = kfFx.ease("0.25,0.1,0.25,1", "power1.inOut");
    const restOf = (i) => rest[Math.min(i, rest.length - 1)] || 0;
    const pushOf = (i, j) => (rows[Math.min(i, rows.length - 1)] || [])[j] || 0;
    gsap.set(cards, { rotation: (i) => restOf(i) });
    let enter = null;
    if (options.enter !== "none")
      enter = gsap.from(cards, { x: () => innerWidth, rotation: 40, transformOrigin: "100% 100%", duration: 1, ease: back, stagger: { amount: 0.4 }, scrollTrigger: { trigger: el, scroller, start: "top center" } });
    const offs = cards.map((c, i) => {
      const on = () => {
        gsap.to(c, { scale: big, rotation: 0, duration: 0.8, ease: back, transformOrigin: "50% 50%", overwrite: "auto" });
        cards.forEach((o, j) => j !== i && gsap.to(o, { x: (innerWidth * pushOf(i, j)) / 100, duration: 0.8, ease: back, overwrite: "auto" }));
      };
      const out = () => {
        gsap.to(c, { scale: 1, duration: 0.6, ease: back });
        gsap.to(c, { rotation: restOf(i), duration: 0.6, ease: settle });
        cards.forEach((o, j) => j !== i && gsap.to(o, { x: 0, duration: 0.6, ease: back }));
      };
      c.addEventListener("pointerenter", on);
      c.addEventListener("pointerleave", out);
      return () => { c.removeEventListener("pointerenter", on); c.removeEventListener("pointerleave", out); };
    });
    return () => { offs.forEach((f) => f()); enter?.scrollTrigger?.kill(); enter?.kill(); gsap.killTweensOf(cards); gsap.set(cards, { clearProps: "transform" }); };
  });
})();
