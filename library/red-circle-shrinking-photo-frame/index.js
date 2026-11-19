// First page: five photos crossfade for 1.5s every 4s · three column cards slide (both Swiper 11.2.10) · photo frame shrink · dot map.
// Original figures: PC frame width 80%·height 90vh, start "top 20px" end "+=1000" scrub 1 pin / phone width 75%, start "top 250px" end "+=550" scrub 1
(() => {
  const { reduced } = SW;

  // Dot map — four islands linked in an arc, stamped on a dot grid (original map coordinates not used)
  const map = document.querySelector(".dotmap");
  const isles = [
    { cx: 930, cy: 190, rx: 120, ry: 95, r: -20 },
    { cx: 760, cy: 470, rx: 70, ry: 250, r: 38 },
    { cx: 520, cy: 720, rx: 60, ry: 190, r: 70 },
    { cx: 360, cy: 860, rx: 55, ry: 90, r: 40 },
    { cx: 250, cy: 960, rx: 70, ry: 60, r: 0 },
    { cx: 130, cy: 1060, rx: 20, ry: 20, r: 0 },
  ];
  const inside = (x, y) => isles.some(({ cx, cy, rx, ry, r }) => {
    const a = (r * Math.PI) / 180;
    const dx = x - cx, dy = y - cy;
    const u = dx * Math.cos(a) + dy * Math.sin(a);
    const v = -dx * Math.sin(a) + dy * Math.cos(a);
    return (u * u) / (rx * rx) + (v * v) / (ry * ry) <= 1;
  });
  let dots = "";
  for (let y = 10; y < 1100; y += 14) for (let x = 10; x < 1200; x += 14) if (inside(x, y)) dots += `<circle cx="${x}" cy="${y}" r="3.2"/>`;
  map.innerHTML = `<g fill="var(--site-map-dot)">${dots}</g>`;

  // Hero photos — Swiper 11 fade same as the original (1.5s every 4s, can’t be swiped by hand)
  new Swiper(".mv-swiper", {
    loop: true, effect: "fade", speed: 1500, fadeEffect: { crossFade: true },
    autoplay: reduced ? false : { delay: 4000, disableOnInteraction: false },
    allowTouchMove: false, simulateTouch: false,
  });

  // Column: same Swiper 11 as the original (one slide, three at 768 and up, 15 · 20px gap, draggable red progress bar, arrows)
  document.querySelectorAll(".column-swiper").forEach((el) => new Swiper(el, {
    slidesPerView: 1, spaceBetween: 15, loop: false,
    scrollbar: { el: el.querySelector(".scrollbar"), draggable: true },
    navigation: { nextEl: el.querySelector(".next"), prevEl: el.querySelector(".prev") },
    breakpoints: { 768: { slidesPerView: 3, spaceBetween: 20 } },
  }));

  const mm = gsap.matchMedia();
  mm.add({ pc: "(min-width: 769px) and (prefers-reduced-motion: no-preference)", sp: "(max-width: 768px) and (prefers-reduced-motion: no-preference)" }, ({ conditions }) => {
    if (conditions.pc) {
      gsap.to(".mv-frame", { width: "80%", height: "90vh", ease: "none", scrollTrigger: { trigger: ".mv-pin", start: "top 20px", end: "+=1000", scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
    } else {
      gsap.to(".mv-frame", { width: "75%", ease: "none", scrollTrigger: { trigger: ".mv-pin", start: "top 250px", end: "+=550", scrub: 1, invalidateOnRefresh: true } });
    }
  });
})();
