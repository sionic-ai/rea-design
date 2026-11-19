(() => {
  // Over a card, the inner photo shifts and tilts in 4px·1° steps following the cursor (.05s linear). On leave it snaps back in 5 steps of 42ms each — not smoothly, but in jerks
  kfFx.register("stepped-tilt-follow", (el, { options, reduce, hover }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    if (!media || reduce || !hover) return;
    const div = +options.div || 20, step = +options.step || 4, rot = +(options.rot ?? 2), rstep = +options.rstep || 1;
    const backSteps = +options["back-steps"] || 5, backMs = +(options["back-ms"] ?? 42);
    let cur = { x: 0, y: 0, r: 0 }, last = "", timers = [];
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const apply = (x, y, r) => { cur = { x, y, r }; const t = `translate3d(${x}px, ${y}px, 0) rotateZ(${r}deg)`; if (t !== last) { last = t; media.style.transform = t; } };
    const move = (e) => {
      clear();
      const b = el.getBoundingClientRect(), dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
      const x = Math.round(dx / div / step) * step, y = Math.round(dy / div / step) * step;
      const r = Math.round(((dx / (b.width / 2 || 1)) * rot) / rstep) * rstep;
      media.style.transition = "transform 0.05s linear";
      apply(x, y, r);
    };
    const leave = () => {
      clear();
      const from = { ...cur };
      media.style.transition = "none";
      for (let k = 1; k <= backSteps; k++) {
        timers.push(setTimeout(() => {
          const a = 1 - k / backSteps;
          apply(Math.round((from.x * a) / step) * step, Math.round((from.y * a) / step) * step, Math.round((from.r * a) / rstep) * rstep);
        }, k * backMs));
      }
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => { clear(); el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); media.style.transition = ""; media.style.transform = ""; };
  });
})();
