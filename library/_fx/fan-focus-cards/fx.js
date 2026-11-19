(() => {
  // Overlapping card row — each card stands crooked at its own tilt (data-tilt, in degrees), and when interaction lands on one, that card stands straight and scales 1.025x,
  // Sections behind shift right by (push ÷ distance)% (the last one by .25 of that), sections in front shift left by (back ÷ distance)%, and tilt an extra ±(turn ÷ distance)°.
  // A spring (bounce 0, .3s) so moving the hand continues from midway. When the hand leaves the row it returns to its own tilt
  kfFx.register("fan-focus-cards", (el, { options, reduce, hover }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length || reduce) return;
    const turn = +(options.turn ?? 2.5), back = +(options.back ?? 5), lift = +(options.scale ?? 1.025);
    const lastShare = +(options.last ?? 0.25), dur = +(options.dur ?? 0.3);
    // Backward shift amount — original is 33500 ÷ line width (px, max 986)
    const pushOf = () => +(options.push ?? 0) || 33500 / Math.max(1, Math.min(+(options.ref ?? 986), el.clientWidth));
    const base = cards.map((c) => +(c.dataset.tilt ?? 0));
    const ease = kfFx.ease(options.ease || "0.33,1,0.68,1", "power2.out");
    const place = (h) => {
      const push = pushOf();
      cards.forEach((c, i) => {
        let x = 0, r = base[i], s = 1;
        if (h != null) {
          const l = i - h, a = Math.abs(l);
          if (l === 0) { r = 0; s = lift; }
          else if (l > 0) { x = (push / a) * (i === cards.length - 1 ? lastShare : 1); r = base[i] + turn / a; }
          else { x = -back / a; r = base[i] - turn / a; }
        }
        gsap.to(c, { xPercent: x, rotation: r, scale: s, duration: dur, ease, overwrite: "auto" });
      });
    };
    gsap.set(cards, { rotation: (i) => base[i] });
    const offs = [];
    cards.forEach((c, i) => {
      const on = () => place(i), off = () => place(null);
      if (hover) { c.addEventListener("pointerenter", on); c.addEventListener("pointerleave", off); }
      c.addEventListener("focusin", on); c.addEventListener("focusout", off);
      offs.push(() => { c.removeEventListener("pointerenter", on); c.removeEventListener("pointerleave", off); c.removeEventListener("focusin", on); c.removeEventListener("focusout", off); });
    });
    return () => { offs.forEach((f) => f()); gsap.killTweensOf(cards); gsap.set(cards, { clearProps: "transform" }); };
  });
})();
