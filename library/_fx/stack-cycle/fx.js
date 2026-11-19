(() => {
  kfFx.register("stack-cycle", (el, { options, reduce }) => {
    const cards = Array.from(el.querySelectorAll('[data-fx-part="card"]'));
    if (cards.length < 2) return;
    const step = +(options.y ?? 20), shrink = +(options.scale ?? 0.05), tilt = +(options.tilt ?? 5);
    const dur = +(options.dur ?? 1), hold = +(options.hold ?? 2.5);
    const ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    const fades = String(options.fade ?? "0.8,0.5").split(",").map(Number);
    // Shape of the k-th place from the front — only the second tilts, and further back each one lowers, shrinks and fades (original 3 sections: 0·20·40px, 1·.95·.9, 1·.8·.5)
    const slot = (k) => ({
      y: step * k, scale: 1 - shrink * k, rotation: k === 1 ? tilt : 0,
      opacity: k === 0 ? 1 : fades[Math.min(k - 1, fades.length - 1)], zIndex: 10 - k,
    });
    const n = cards.length;
    cards.forEach((c, i) => gsap.set(c, slot(i)));
    if (reduce) return () => gsap.set(cards, { clearProps: "all" });
    const tl = gsap.timeline({ repeat: -1 });
    // One loop: the first section goes to the end and the rest move one slot forward — all move together in 1s and rest for hold.
    for (let r = 0; r < n; r++) {
      const at = r * (dur + hold);
      cards.forEach((c, i) => {
        const k = (i - r - 1 + n * 2) % n;
        tl.to(c, { ...slot(k), duration: dur, ease }, at);
      });
      tl.to({}, { duration: hold }, at + dur);
    }
    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()));
      io.observe(el);
    }
    return () => { io?.disconnect(); tl.kill(); gsap.set(cards, { clearProps: "all" }); };
  });
})();
