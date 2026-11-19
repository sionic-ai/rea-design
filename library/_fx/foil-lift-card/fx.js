(() => {
  // Cursor ratio inside the hovered panel (element) to card (data-fx-part="tilt", or the element itself if absent) is tilted at 900px perspective and lifted up.
  // Sparkle layers (rainbow foil · light pool · border rainbow) are drawn by css with --fx-mx · --fx-my · --fx-bgx · --fx-bgy · --fx-active.
  // While following, it moves immediately with .12s ease-out. On release it clears the transform and returns with the card css bounce curve (.4s cubic-bezier(.34,1.45,.64,1)).
  kfFx.register("foil-lift-card", (el, { options, reduce, hover }) => {
    const card = el.querySelector('[data-fx-part="tilt"]') || el;
    const flat = options.flat === "1" || options.flat === "true" || reduce || !hover;
    const rx = +(options.rx ?? 13);
    const ry = +(options.ry ?? 20);
    const lift = +(options.lift ?? -21);
    const apexLift = +(options["apex-lift"] ?? -16);
    const persp = +(options.perspective ?? 900);
    const follow = +(options.follow ?? 0.12);
    const clamp = (v) => Math.max(0, Math.min(1, v));
    let frame = 0, px = 0, py = 0;
    const paint = () => {
      frame = 0;
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) return;
      const x = clamp((px - b.left) / b.width), y = clamp((py - b.top) / b.height);
      if (!flat) {
        const up = el.hasAttribute("data-apex") ? apexLift : lift;
        card.style.transition = `transform ${follow}s ease-out`;
        card.style.transform = `perspective(${persp}px) rotateX(${(y - 0.5) * -rx}deg) rotateY(${(x - 0.5) * ry}deg) translateY(${up}%)`;
      }
      card.style.setProperty("--fx-mx", `${x * 100}%`);
      card.style.setProperty("--fx-my", `${y * 100}%`);
      card.style.setProperty("--fx-bgx", `${30 + 40 * x}%`);
      card.style.setProperty("--fx-bgy", `${30 + 40 * y}%`);
      card.style.setProperty("--fx-active", "1");
    };
    const move = (e) => {
      px = e.clientX; py = e.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const leave = () => {
      if (frame) cancelAnimationFrame(frame), (frame = 0);
      if (!flat) { card.style.transition = ""; card.style.transform = ""; }
      card.style.setProperty("--fx-active", "0");
    };
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointercancel", leave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointercancel", leave);
      ["--fx-mx", "--fx-my", "--fx-bgx", "--fx-bgy", "--fx-active", "transform", "transition"].forEach((k) => card.style.removeProperty(k));
    };
  });
})();
