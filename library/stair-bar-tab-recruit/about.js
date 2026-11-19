// Policies and environment — fills the benefit cards, office photo Swiper (same version and options as the original), DRAG cursor over the slider (follows at a 0.05 ratio).
(() => {
  const { burst, art } = window.CREA;

  const BENEFITS = ["Benefits 1", "Benefits 2", "Benefits 3", "Benefits 4", "Benefits 5", "Benefits 6", "Benefits 7", "Benefits 8", "Benefits 9", "Benefits 10", "Benefits 11"];
  document.querySelector(".a-benefit__list").innerHTML = BENEFITS.map((t, i) => `
    <div class="c-card">
      <div class="c-card__tag is-number"></div>
      ${art(i + 1)}
      <h3>$ here{t}${i === 6 ? "<small>(Some job types)</small>" : ""}</h3>
      <p>${i < 2 ? "Your explanation of the program here in three-odd lines. Say who uses it and when, and what the company helps with and how much." : "Your policy description here in two lines. Keep it short."}</p>
    </div>`).join("");

  document.querySelector(".a-entry__circle.is-default span").innerHTML = burst();

  /* ── Photo slider — Swiper 11.2.10 same as the original, same options (loop · slidesPerView auto · grabCursor · centeredSlides) ── */
  const SLIDES = ["Long conference room table · City beyond glass wall · Landscape 3:2", "Lounge sofa and green planting · warm indirect light · landscape 3:2", "Entrance logo wall · dark wall with soft lighting · landscape 3:2", "Personal work space · natural window light · landscape 3:2", "Round table in a consultation room · bright white wall · landscape 3:2"];
  const slider = document.querySelector(".a-slider");
  slider.querySelector(".swiper-wrapper").innerHTML = SLIDES.map((s) => `<div class="a-slider__slide swiper-slide"><div class="wf-img" data-label="${s}"></div></div>`).join("");
  new Swiper(slider, { loop: true, slidesPerView: "auto", grabCursor: true, centeredSlides: true });

  /* ── DRAG cursor: as in the original, starts at (0,0) and each frame follows .05 of the remaining distance, positioned with left and top. Appears and disappears over 1s ── */
  const cursor = slider.querySelector(".a-cursor");
  if (matchMedia("(min-width: 769px)").matches) {
    document.body.append(cursor);
    let mx = 0, my = 0, cx = 0, cy = 0, running = false;
    const ease = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0.05;
    const loop = () => {
      cx += (mx - cx) * ease;
      cy += (my - cy) * ease;
      cursor.style.left = `${cx - cursor.offsetWidth / 2}px`;
      cursor.style.top = `${cy - cursor.offsetHeight / 2}px`;
      if (running) requestAnimationFrame(loop);
    };
    slider.addEventListener("mouseenter", () => {
      cursor.style.display = "grid";
      setTimeout(() => (cursor.style.opacity = 1), 10);
      running = true;
      loop();
    });
    slider.addEventListener("mouseleave", () => {
      cursor.style.opacity = 0;
      setTimeout(() => (cursor.style.display = "none"), 300);
      running = false;
    });
    slider.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
  }
})();
