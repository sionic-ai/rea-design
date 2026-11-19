// Layer button — exactly the original Framer layout animation: on hover, first move the layer’s position (left·top) to the vacated spot,
// Offset the moved amount back with transform, then release it to 0, so on screen the layers slide out while tilting. On release, reverse.
// Without gsap, the :hover rule in fx.css (translate · rotate transition) makes the same shape — Brand button
(() => {
  kfFx.register("swing-layer-btn", (el, { options, reduce, hover }) => {
    const layers = [...el.querySelectorAll(':scope > [data-fx-part="layer"]')];
    if (!layers.length || typeof gsap === "undefined" || reduce) return;
    const cs = getComputedStyle(el);
    const px = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
    const off = (i) => {
      const back = { x: px(cs.getPropertyValue("--fx-dx"), -16), y: px(cs.getPropertyValue("--fx-dy"), 100), r: px(cs.getPropertyValue("--fx-rot"), 16) };
      if (i === 0) return back;
      return { x: px(cs.getPropertyValue("--fx-dx2"), back.x), y: px(cs.getPropertyValue("--fx-dy2"), back.y), r: px(cs.getPropertyValue("--fx-rot2"), back.r) };
    };
    const durVar = parseFloat(cs.getPropertyValue("--fx-dur"));
    const dur = +(options.dur ?? (Number.isFinite(durVar) ? durVar : 0.4));
    const ease = kfFx.ease(options.ease || "0.44,0,0.56,1", "sine.inOut");
    el.classList.add("is-fx-js");
    const st = layers.map(() => ({ at: 0 }));
    // Like the original Framer, position moves happen on the frame after the pointer enters — moving in the same frame makes it count from the first release frame as if the layer had already left its spot
    let raf = 0;
    const go = (on) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => layers.forEach((ly, i) => {
      const o = off(i), s = st[i];
      const was = { x: s.at * o.x + (+gsap.getProperty(ly, "x") || 0), y: s.at * o.y + (+gsap.getProperty(ly, "y") || 0) };
      s.at = on ? 1 : 0;
      ly.style.left = s.at * o.x + "px";
      ly.style.top = s.at * o.y + "px";
      gsap.killTweensOf(ly);
      gsap.set(ly, { x: was.x - s.at * o.x, y: was.y - s.at * o.y });
      gsap.to(ly, { x: 0, y: 0, rotation: s.at * o.r, duration: dur, ease });
    })); };
    const enter = () => go(true), leave = () => go(false);
    const host = (options.host && el.closest(options.host)) || el;
    if (hover) { host.addEventListener("pointerenter", enter); host.addEventListener("pointerleave", leave); }
    else { host.addEventListener("pointerdown", enter); host.addEventListener("pointerup", leave); host.addEventListener("pointercancel", leave); }
    return () => {
      ["pointerenter", "pointerdown"].forEach((t) => host.removeEventListener(t, enter));
      ["pointerleave", "pointerup", "pointercancel"].forEach((t) => host.removeEventListener(t, leave));
      cancelAnimationFrame(raf);
      el.classList.remove("is-fx-js");
      layers.forEach((ly) => { gsap.killTweensOf(ly); gsap.set(ly, { clearProps: "transform" }); ly.style.left = ly.style.top = ""; });
    };
  });
})();
