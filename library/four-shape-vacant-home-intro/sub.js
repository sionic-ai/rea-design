// Subpage sliders — the same Splide 4.1.2 as the original. The before/after photos in About crossfade over 4 seconds (6s interval), and the photo strip in Vacant-home care flows with auto-scroll 0.2.
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ba = document.querySelector("#kh-ba-slider");
  if (ba) new Splide(ba, {
    type: "fade", arrows: false, pagination: true, perPage: 1, rewind: true,
    speed: still ? 0 : 4000, autoplay: !still, interval: 6000, pauseOnHover: false,
  }).mount();
  const ex = document.querySelector("#kh-example-slider");
  if (ex) new Splide(ex, {
    type: "loop", rewind: true, drag: "free", arrows: false, pagination: false, gap: "2rem", autoWidth: true,
    autoScroll: { speed: still ? 0 : 0.2, pauseOnHover: false, pauseOnFocus: false },
    breakpoints: { 767: { gap: "1rem" } },
  }).mount(window.splide.Extensions);
})();
