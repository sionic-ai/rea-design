// Work detail — the whole page scrolls smoothly with Lenis, and the box on the small right map follows the spot currently visible in the center column
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const col = document.querySelector("[data-viewer]");
  const shots = [...col.querySelectorAll(".shot")].map((n) => n.closest(".shot-zoom") || n);
  const thumbs = document.querySelector(".minimap__thumbs"), view = document.querySelector(".minimap__view");
  thumbs.innerHTML = shots.map(() => "<i></i>").join("");
  const tis = [...thumbs.children];
  let k = 0;
  const size = () => {
    k = thumbs.clientWidth / Math.max(1, col.clientWidth);
    shots.forEach((s, i) => (tis[i].style.height = `${s.offsetHeight * k}px`));
    view.style.height = `${innerHeight * k}px`;
    move();
  };
  // Lower the box by however far the pillar top has passed the screen top
  const move = () => {
    const top = col.getBoundingClientRect().top;
    view.style.transform = `translateY(${Math.max(0, -top) * k}px)`;
  };
  new ResizeObserver(size).observe(col);
  size();
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ autoRaf: false });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  addEventListener("scroll", move, { passive: true });
  // Clicking a hero photo enlarges it — it fades in rising 12px over .15s
  const lb = document.querySelector(".lightbox");
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-lightbox]")) { lb.classList.add("is-open"); lenis?.stop(); return; }
    if (lb.classList.contains("is-open")) { lb.classList.remove("is-open"); lenis?.start(); }
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { lb.classList.remove("is-open"); lenis?.start(); } });
  thumbs.addEventListener("click", (e) => {
    const r = thumbs.getBoundingClientRect(), y = col.offsetTop + ((e.clientY - r.top) / k) - innerHeight / 2;
    lenis ? lenis.scrollTo(Math.max(0, y)) : scrollTo({ top: y, behavior: "smooth" });
  });
})();
