// News list: lead article switches every 4000ms (the bar fills linearly over that time) · the new slide grows .95 → 1 over 250ms cubicOut while the old slide disappears after 250ms ·
// Photo at 115% height with scroll parallax · “All posts” fold 750ms outExpo · masonry stacking places items one by one in the shortest column.
(() => {
  const { reduced, fold, mm } = window.CS;
  const slides = [...document.querySelectorAll(".nw-slide")];
  const bars = [...document.querySelectorAll(".nw-bars i")];
  const title = document.querySelector(".nw-copy h2");
  const titles = JSON.parse(title.dataset.titles);
  let cur = 0;
  const prog = gsap.to({}, { duration: 4, ease: "none", paused: true, onUpdate() { bars.forEach((b, i) => gsap.set(b, { scaleX: i === cur ? this.progress() : 0 })); }, onComplete: () => show((cur + 1) % slides.length) });
  const show = (n) => {
    const old = slides[cur];
    cur = n;
    const nu = slides[n];
    slides.forEach((s) => s.classList.toggle("is-on", s === nu));
    gsap.set(old, { opacity: 1, zIndex: 0 });
    gsap.fromTo(nu, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: reduced ? 0 : 0.25, ease: "power3.out", zIndex: 1 });
    gsap.to(old, { opacity: 0, duration: 0.25, delay: 0.25, ease: "none", clearProps: "zIndex" });
    gsap.fromTo(title, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "none", onStart: () => (title.textContent = titles[n]) });
    if (!reduced) prog.restart();
  };
  document.querySelectorAll(".nw-bars button").forEach((b, i) => b.addEventListener("click", () => i !== cur && show(i)));
  if (!reduced) prog.play();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.to(".nw-slide__par", { yPercent: 15 / 1.15, ease: "none", scrollTrigger: { trigger: ".nw-hero", start: "top top", end: "bottom top", scrub: true } });
  });

  const box = document.querySelector(".nw-filter");
  box.querySelector(".nw-filter__btn").addEventListener("click", () => { const open = !box.classList.contains("is-open"); box.classList.toggle("is-open", open); fold(box.querySelector(".nw-filter__panel"), open); });
  box.querySelectorAll(".nw-filter__cols button").forEach((b) => b.addEventListener("click", () => b.classList.toggle("is-on")));

  const grid = document.querySelector(".nw-grid");
  const cards = [...grid.querySelectorAll(".nw-card")];
  const lay = () => {
    const cols = innerWidth <= 768 ? 2 : 4, w = grid.clientWidth / cols, hs = Array(cols).fill(0);
    cards.forEach((c) => {
      const k = hs.indexOf(Math.min(...hs));
      c.style.left = `${k * w}px`; c.style.top = `${hs[k]}px`;
      hs[k] += c.offsetHeight;
    });
    grid.style.height = `${Math.max(...hs)}px`;
    ScrollTrigger.refresh();
  };
  new ResizeObserver(lay).observe(grid);
  lay();
})();
