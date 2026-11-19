(() => {
  kfFx.register("jelly-hover", (el, { options, reduce, hover }) => {
    if (reduce) return;
    const target = options.target ? el.querySelector(`[data-fx-part="${options.target}"]`) : el;
    if (!target) return;
    // The original bounces only on cells cut to shape — given an area, interaction is measured only on its child (the plate cut with clip-path)
    const area = (options.area && el.querySelector(`[data-fx-part="${options.area}"]`)) || el;
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    let inside = false, t = 0;
    // Restart from the beginning on every re-entry — remove the class, measure once, then re-add it so the same keyframes run again
    const run = () => { target.classList.remove("fx-jelly-hover-on"); void target.offsetWidth; target.classList.add("fx-jelly-hover-on"); };
    // look: squash(brand) — one wobble when leaving too (.52s)
    const letgo = String(options.look || "") === "squash";
    const end = (e) => { if (!e || e.animationName !== "fx-jelly-letgo") target.classList.remove("fx-jelly-hover-on"); else target.classList.remove("fx-jelly-hover-out"); };
    const enter = () => { clearTimeout(t); target.classList.remove("fx-jelly-hover-out"); if (inside) return; inside = true; run(); };
    // The original waits 80ms on leave so that going in and out at the edge of a droplet doesn’t make it bounce again
    const leave = () => {
      clearTimeout(t);
      if (letgo) { inside = false; target.classList.remove("fx-jelly-hover-on", "fx-jelly-hover-out"); void target.offsetWidth; target.classList.add("fx-jelly-hover-out"); return; }
      t = setTimeout(() => { inside = false; }, 80);
    };
    const focus = () => { inside = true; run(); };
    const blur = () => { inside = false; };
    if (hover) { area.addEventListener("pointerenter", enter); area.addEventListener("pointerleave", leave); }
    el.addEventListener("focusin", focus);
    el.addEventListener("focusout", blur);
    target.addEventListener("animationend", end);
    return () => {
      clearTimeout(t);
      area.removeEventListener("pointerenter", enter);
      area.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", focus);
      el.removeEventListener("focusout", blur);
      target.removeEventListener("animationend", end);
      target.classList.remove("fx-jelly-hover-on", "fx-jelly-hover-out");
      el.style.removeProperty("--fx-dur");
    };
  });
})();
