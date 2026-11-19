// First page — the original app.js first-screen handles with the same values.
// Wide screens (768 and up): video card drift and magnet come from the drift-card-magnet part. Narrow screens: the same cards as a horizontally flowing strip — passes 1440px of width in 28.8s, pauses when off screen.
// When the width crosses 768 it reopens like the original. The SCROLL hint fades away once the hero leaves the 2% band at the bottom of the screen
(() => {
  const pc = matchMedia("(min-width: 768px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  pc.addEventListener("change", () => location.reload());
  const mv = document.getElementById("mv");
  const grid = mv?.querySelector(".vl-mv__grid");

  if (grid && !pc.matches) {
    grid.removeAttribute("data-fx");
    const track = grid.querySelector(".vl-mv__track"), set = track.querySelector(".vl-mv__set");
    const SPEED = 2880 / 100;
    let tween = null;
    const build = () => {
      tween?.kill();
      gsap.set(track, { x: 0 });
      const winW = innerWidth, cloneW = set.offsetWidth;
      if (!cloneW) return;
      const count = Math.max(2, Math.ceil((2 * winW) / cloneW));
      while (track.children.length < count) track.append(set.cloneNode(true));
      const step = count > 3 ? Math.floor(winW / cloneW) : 1;
      if (reduce) return;
      tween = gsap.to(track, { x: -cloneW * step, duration: SPEED * ((cloneW * step) / 1440), ease: "none", repeat: -1 });
    };
    new ResizeObserver(build).observe(document.body);
    new IntersectionObserver((es) => es.forEach((e) => tween && (e.isIntersecting ? tween.play() : tween.pause())), { rootMargin: "10% 0px 10% 0px", threshold: [0.15, 0] }).observe(grid);
  }

  const scroll = document.getElementById("mv-scroll");
  if (mv && scroll) new IntersectionObserver((es) => es.forEach((e) => scroll.classList.toggle("is-scroll-hide", !e.isIntersecting)), { rootMargin: "-98% 0px 0px" }).observe(mv);

  // English tagline — the original resolves blur and opacity three times per glyph stroke (path) in .08 steps. Here the same sequence is applied per text chunk
  document.querySelectorAll(".vl-st__catch .en").forEach((line) => {
    line.innerHTML = [...line.textContent].map((c) => (c === " " ? " " : `<span class="ch">${c}</span>`)).join("");
  });

  // Reading list — Swiper (original version 9) slidesPerView auto, left and right buttons, transition .55s (original slider default speed 550)
  const slider = document.querySelector(".vl-jr-slider");
  if (slider && window.Swiper) {
    new Swiper(slider, {
      slidesPerView: "auto", watchSlidesProgress: true, speed: reduce ? 0 : 550,
      navigation: { nextEl: slider.querySelector(".vl-arrow.is-next"), prevEl: slider.querySelector(".vl-arrow.is-prev"), disabledClass: "swiper-button-disabled" },
    });
  }
})();
