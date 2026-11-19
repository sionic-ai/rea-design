/* Director list — entrance (title from .5em below over .8s, .1s stagger) · cursor preview card (follow .1, tilt at speed x 1.5, max 12°) */
(() => {
  const { reduce } = window.PG;
  window.PG.enter((tl) => {
    if (!tl) return;
    tl.from("[data-load-title]", { opacity: 0, y: "0.5em", duration: 0.8, ease: "power2.out", stagger: 0.1 }, "<10%");
  });

  const wrap = document.querySelector("[data-follower]");
  if (!wrap || reduce || !matchMedia("(hover: hover) and (min-width: 992px)").matches) return;
  const mouse = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  let lastX = 0, rot = 0;
  addEventListener("mousemove", (e) => { target.x = e.clientX; target.y = e.clientY; });
  const tick = () => {
    mouse.x += (target.x - mouse.x) * 0.1;
    mouse.y += (target.y - mouse.y) * 0.1;
    const want = Math.max(-12, Math.min(12, (mouse.x - lastX) * 1.5));
    rot += (want - rot) * 0.1;
    lastX = mouse.x;
    wrap.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%) rotateZ(${rot}deg)`;
    requestAnimationFrame(tick);
  };
  tick();
})();
