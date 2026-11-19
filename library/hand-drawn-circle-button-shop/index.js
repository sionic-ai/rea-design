// Hero slider (original values): next slide every 5 seconds, lower the current slide and light the next one 50ms later (the .9s fade is CSS),
// 1 second after turning on, that section’s water-drop dots appear one by one at .5s intervals. Manual swipe resets the timer. Horizontal swipe 50px.
(() => {
  const hero = document.querySelector(".hero");
  const slides = [...hero.querySelectorAll("[data-hero-slide]")];
  const dots = [...hero.querySelectorAll("[data-hero-dot]")];
  let timer = null;
  const current = () => slides.findIndex((s) => s.classList.contains("is-show"));
  const mark = (i) => dots.forEach((d, k) => d.classList.toggle("is-active", k === i));
  const popDots = (slide) => {
    const ds = slide.querySelectorAll(".k-dot");
    ds.forEach((d) => d.classList.remove("is-show"));
    if (!window.kMotion.on) return;
    ds.forEach((d, k) => setTimeout(() => d.classList.add("is-show"), 500 * k));
  };
  const go = (i) => {
    const now = current();
    if (now === i) return;
    if (now >= 0) {
      slides[now].classList.remove("is-show");
      slides[now].querySelectorAll(".k-dot").forEach((d) => d.classList.remove("is-show"));
    }
    setTimeout(() => {
      slides[i].classList.add("is-show");
      mark(i);
      setTimeout(() => popDots(slides[i]), 1000);
    }, 50);
  };
  const start = () => { if (timer === null) timer = setInterval(() => go((current() + 1) % slides.length), 5000); };
  const stop = () => { clearInterval(timer); timer = null; };
  const restart = () => { if (window.kMotion.on) { stop(); start(); } };
  const prev = () => { go((current() - 1 + slides.length) % slides.length); restart(); };
  const next = () => { go((current() + 1) % slides.length); restart(); };

  hero.querySelector("[data-hero-prev]").addEventListener("click", prev);
  hero.querySelector("[data-hero-next]").addEventListener("click", next);
  dots.forEach((d, i) => d.addEventListener("click", () => { go(i); restart(); }));
  window.kMotion.listen((on) => (on ? start() : stop()));
  if (window.kMotion.on) start();
  setTimeout(() => popDots(slides[0]), 1000);

  let sx = 0, sy = 0, swiping = false;
  hero.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiping = false; }, { passive: true });
  hero.addEventListener("touchmove", (e) => {
    if (Math.abs(e.touches[0].clientX - sx) > Math.abs(e.touches[0].clientY - sy)) { swiping = true; e.preventDefault(); }
  }, { passive: false });
  hero.addEventListener("touchend", (e) => {
    if (!swiping) return;
    const dx = sx - e.changedTouches[0].clientX;
    if (Math.abs(dx) >= 50) (dx > 0 ? next : prev)();
  }, { passive: true });

  // Swap product card photo — product only / worn shot
  const products = document.querySelector(".products");
  products.querySelectorAll("[data-view]").forEach((b) =>
    b.addEventListener("click", () => {
      products.querySelectorAll("[data-view]").forEach((x) => x.classList.toggle("is-active", x === b));
      products.classList.toggle("is-model", b.dataset.view === "model");
    }),
  );
})();
