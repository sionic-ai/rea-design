// Careers: ENTRY button (300px down), interview slider (same Swiper 11.2.10 as the original — slidesPerView auto · speed 1000 · grabCursor · loop),
// Draws the number graphic slot (three faint big numbers + three people + a rising arrow).
(() => {
  const { reduced } = window.TK;

  const entry = document.querySelector(".rc-entry");
  const check = () => entry.classList.toggle("is-visible", (TK.lenis ? TK.lenis.scroll : scrollY) >= 300);
  TK.onScroll(check);
  check();

  // The original is a drawing of numbers and person icons, so redraw them fresh in the same spot and feel
  const person = (x, s) => `<g transform="translate(${x} ${300 - 120 * s}) scale(${s})" style="fill:var(--kf-accent)"><circle cx="50" cy="26" r="24"/><path d="M6 120c0-30 18-58 44-58s44 28 44 58Z"/></g>`;
  const graphic = `<svg viewBox="0 0 640 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <g fill="none" style="stroke:var(--site-accent-tint);font-family:var(--kf-font-label)" stroke-width="4" font-weight="700" font-size="190">
      <text x="-10" y="170">100</text><text x="330" y="150">62</text><text x="20" y="400">78</text><text x="420" y="410">908</text>
    </g>
    <g style="stroke:var(--site-accent-mid)" stroke-width="18" stroke-linecap="round" fill="none"><path d="M420 330 560 220M520 214h44v44"/></g>
    ${person(190, 1.1)}${person(300, 1.3)}${person(420, 1.05)}
    <rect x="160" y="300" width="340" height="12" rx="6" style="fill:var(--site-accent-tint)"/>
  </svg>`;
  document.querySelectorAll("[data-graphic]").forEach((f) => (f.innerHTML = graphic));

  // ---------- Interview slides: same Swiper settings as the original ----------
  const slider = document.querySelector(".rc-iv__slider");
  if (slider && window.Swiper) {
    const swiper = new Swiper(slider, {
      slidesPerView: "auto",
      speed: reduced ? 0 : 1000,
      grabCursor: true,
      loop: true,
      navigation: { nextEl: ".rc-arrow.is-next", prevEl: ".rc-arrow.is-prev" },
    });
    let lastWidth = slider.querySelector(".swiper-slide")?.offsetWidth;
    addEventListener("resize", () => {
      const w = slider.querySelector(".swiper-slide")?.offsetWidth;
      if (w === lastWidth) return;
      lastWidth = w;
      swiper.update();
      swiper.slideTo(swiper.activeIndex, 0);
    });
  }

  TK.parallax();
})();
