// Home page — member photo strip: Splide loop · slide width as is · 25px gap (16 below 900) · auto scroll .5 (doesn’t pause on hover)
(() => {
  const el = document.querySelector(".homeRecruit__gallery");
  if (!el || !window.Splide) return;
  const auto = window.splide?.Extensions?.AutoScroll;
  new Splide(el, {
    type: "loop", arrows: false, pagination: false, autoWidth: true, snap: true, gap: 25,
    autoScroll: { speed: U.reduce ? 0 : 0.5, autoStart: !U.reduce, pauseOnHover: false, pauseOnFocus: false },
    breakpoints: { 900: { gap: 16 } },
  }).mount(auto ? { AutoScroll: auto } : {});
})();
