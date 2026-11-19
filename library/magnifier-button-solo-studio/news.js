/* Journal — over a row, a round preview follows the cursor by .16 each frame (switching to that row’s cover in .3s), and when the list is visible the guide lines·row lines are drawn. */
(() => {
  const box = document.querySelector("[data-jindex]");
  if (!box) return;
  const io = new IntersectionObserver((l) => l.forEach((e) => { if (e.isIntersecting) { box.classList.add("is-in"); io.disconnect(); } }), { rootMargin: "0px 0px -15% 0px" });
  io.observe(box);
  const prev = box.querySelector(".mt-jpreview"), covers = [...prev.querySelectorAll("[data-ph]")];
  const rows = [...box.querySelectorAll(".mt-jrow")];
  rows.forEach((r, i) => r.querySelector(".mt-jrow-rule").style.transitionDelay = `${i * 70}ms`);
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, seen = false;
  const step = () => {
    x += (tx - x) * 0.16; y += (ty - y) * 0.16;
    prev.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(step) : 0;
  };
  box.addEventListener("pointermove", (e) => {
    const b = box.getBoundingClientRect();
    tx = e.clientX - b.left; ty = e.clientY - b.top;
    if (!seen) { seen = true; x = tx; y = ty; }
    if (!raf) raf = requestAnimationFrame(step);
  });
  box.addEventListener("pointerleave", () => { seen = false; prev.classList.remove("is-on"); });
  rows.forEach((r, i) => r.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse") return;
    prev.classList.add("is-on");
    covers.forEach((c, j) => c.classList.toggle("is-on", j === i));
  }));
})();
