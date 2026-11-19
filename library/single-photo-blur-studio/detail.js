// Horizontal photo row — wheel and drag flow sideways following at .085 per frame (same feel as the work strip), and it counts the index of the photo past center
(() => {
  const box = document.querySelector(".b-gallery"), row = box?.querySelector(".b-gallery__row"), num = box?.querySelector(".b-gallery__count span");
  if (!row || matchMedia("(max-width: 922px)").matches) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cur = 0, to = 0, max = 0, ty = 0;
  const measure = () => { max = Math.max(0, row.scrollWidth - box.clientWidth); to = Math.min(to, max); };
  measure();
  new ResizeObserver(measure).observe(row);
  addEventListener("wheel", (e) => { to = Math.max(0, Math.min(max, to + (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY))); }, { passive: true });
  addEventListener("touchstart", (e) => { ty = e.touches[0].clientX; }, { passive: true });
  addEventListener("touchmove", (e) => { const x = e.touches[0].clientX; to = Math.max(0, Math.min(max, to + (ty - x) * 1.6)); ty = x; }, { passive: true });
  const figs = [...row.children];
  gsap.ticker.add(() => {
    cur += (to - cur) * (reduce ? 1 : 0.085);
    row.style.transform = `translate3d(${(-cur).toFixed(2)}px,0,0)`;
    const w = figs[0]?.getBoundingClientRect().width || 1;
    if (num) num.textContent = String(Math.min(figs.length, Math.floor((cur + w / 2) / w) + 1));
  });

  // Dot cursor, follows in 0.1s and over a photo shows that photo’s number
  const dot = document.querySelector(".b-cursor");
  if (dot && matchMedia("(hover: hover)").matches) {
    const label = dot.querySelector("span");
    // Measuring the original, it moves like .15s power3.out toward a pointer that jumped once (per frame .31·.53·.71·.83·.91·.96) — quickTo restarts every time when the pointer moves in several steps, which makes it faster, so it is set to .19s
    const xTo = gsap.quickTo(dot, "x", { duration: 0.19, ease: "power3.out" }), yTo = gsap.quickTo(dot, "y", { duration: 0.19, ease: "power3.out" });
    gsap.set(dot, { x: -20, y: -20 });
    addEventListener("pointermove", (e) => {
      xTo(e.clientX - 2); yTo(e.clientY - 2);
      const f = e.target.closest?.(".b-gallery__row figure");
      label.textContent = f ? `${String(figs.indexOf(f) + 1).padStart(2, "0")} / ${String(figs.length).padStart(2, "0")}` : "";
    });
  }
})();
