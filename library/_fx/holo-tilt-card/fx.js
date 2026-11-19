(() => {
  // Converts the pointer position into a ratio within the card and passes it as variables, and CSS draws the tilt · drag · light pool · rainbow band positions — formulas as in the original, tilt clamped to ±max
  kfFx.register("holo-tilt-card", (el, { options, reduce }) => {
    if (reduce) return;
    const max = +(options.max ?? 30);
    const tx = +(options.tx ?? -30), ty = +(options.ty ?? 100);
    const spread = +(options.spread ?? 28);
    const parts = ["glare", "foil"].map((role) => {
      let p = el.querySelector(`[data-fx-part="${role}"]`);
      if (!p) {
        p = document.createElement("span");
        p.setAttribute("data-fx-part", role);
        p.setAttribute("data-made", "");
        el.append(p);
      }
      return p;
    });
    const clamp = (v) => Math.max(-max, Math.min(max, v));
    let frame = 0, active = false;
    const update = (x, y) => {
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) return;
      const rx0 = (x - b.x) / b.width, ry0 = (y - b.y) / b.height;
      const set = (k, v) => el.style.setProperty(k, v);
      set("--fx-ratiox", rx0);
      set("--fx-ratioy", ry0);
      set("--fx-mx", `${rx0 * 100}%`);
      set("--fx-my", `${ry0 * 100}%`);
      set("--fx-rx", `${clamp((rx0 - 0.5) * tx)}deg`);
      set("--fx-ry", `${clamp((ry0 - 0.5) * ty)}deg`);
      set("--fx-posx", `${50 + (rx0 - 0.5) * spread}%`);
      set("--fx-posy", `${50 + (ry0 - 0.5) * spread}%`);
      set("--fx-hyp", (Math.hypot(rx0 - 0.5, ry0 - 0.5) * 10) / 7);
    };
    const enter = () => { active = true; el.setAttribute("data-on", ""); };
    const move = (e) => {
      if (!active) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => update(e.clientX, e.clientY));
    };
    const leave = () => {
      active = false;
      cancelAnimationFrame(frame);
      el.removeAttribute("data-on");
      el.style.setProperty("--fx-rx", "0deg");
      el.style.setProperty("--fx-ry", "0deg");
      el.style.setProperty("--fx-hyp", 0);
    };
    // Touch only while pressing and pushing — the default action isn’t blocked so the page still scrolls down
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerdown", enter);
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointercancel", leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerdown", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointercancel", leave);
      el.removeAttribute("data-on");
      ["--fx-ratiox", "--fx-ratioy", "--fx-mx", "--fx-my", "--fx-rx", "--fx-ry", "--fx-posx", "--fx-posy", "--fx-hyp"].forEach((k) => el.style.removeProperty(k));
      parts.forEach((p) => p.hasAttribute("data-made") && p.remove());
    };
  });
})();
