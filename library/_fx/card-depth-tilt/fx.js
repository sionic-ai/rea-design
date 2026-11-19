// The card tilts in perspective toward the cursor, the inner photo is slightly enlarged and shifts the opposite way, and front layers like labels and buttons float slightly toward the cursor.
// Cursor position is given only by two numbers from −1 to 1 relative to the card center (--fx-x · --fx-y) and fx.css draws the shape from them — the original also drew with two CSS variables
(() => {
  kfFx.register("card-depth-tilt", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const set = (k, v) => el.style.setProperty(k, v);
    if (options.tilt != null) set("--fx-tilt", `${+options.tilt}deg`);
    if (options.zoom != null) set("--fx-zoom", String(+options.zoom));
    if (options.shift != null) set("--fx-shift", `${+options.shift}%`);
    if (options.pull != null) set("--fx-pull", `${+options.pull}%`);
    const follow = { duration: +(options.dur ?? 0.6), ease: kfFx.ease(options.ease || "0.16,1,0.3,1", "expo.out") };
    const back = { duration: +(options.back ?? 0.8), ease: kfFx.ease(options["back-ease"] || options.ease || "0.16,1,0.3,1", "expo.out") };
    const t = { x: 0, y: 0 };
    let last = null, on = false;
    const paint = () => { set("--fx-x", t.x.toFixed(3)); set("--fx-y", t.y.toFixed(3)); };
    const go = (x, y, v, done) => gsap.to(t, { x, y, ...v, overwrite: true, onUpdate: paint, onComplete: done });
    const clamp = gsap.utils.clamp(-1, 1);
    const move = (e) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const p = [clamp(((e.clientX - r.left) / r.width) * 2 - 1), clamp(((e.clientY - r.top) / r.height) * 2 - 1)];
      if (last && last[0] === p[0] && last[1] === p[1]) return;
      last = p;
      if (!on) { on = true; el.dataset.tilting = ""; }
      go(p[0], p[1], follow);
    };
    const leave = () => {
      if (!last) return;
      last = null;
      go(0, 0, back, () => { on = false; delete el.dataset.tilting; el.style.removeProperty("--fx-x"); el.style.removeProperty("--fx-y"); });
    };
    el.addEventListener("pointerenter", move);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", move);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(t);
      delete el.dataset.tilting;
      ["--fx-x", "--fx-y", "--fx-tilt", "--fx-zoom", "--fx-shift", "--fx-pull"].forEach((k) => el.style.removeProperty(k));
    };
  });
})();
