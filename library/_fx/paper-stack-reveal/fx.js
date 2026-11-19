// When the note paper card appears it stands up from 80px below, .5s late (opacity .5s · position 1s), and the two papers behind slide in from offset spots (±40px, 80px below, ±5°) at their own tilt (front one .25s later).
// Edge stickers pop on 1s late, from .75× scale and 40px below — only the class changes, the motion is a CSS transition
(() => {
  kfFx.register("paper-stack-reveal", (el, { options, reduce }) => {
    if (reduce) { el.classList.add("is-visible"); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add("is-visible"); io.disconnect(); } }), { rootMargin: options.margin || "-20% 0px" });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("is-visible"); };
  });
})();
