// The same splide 4.1.2 as the original — the two Hero photo strips flow endlessly (AutoScroll .3, bottom row reversed), the banner is three center-aligned slides auto-advancing every 5 seconds (phone one). Close the floating banner.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ext = window.splide && window.splide.Extensions;
  if (window.Splide) {
    document.querySelectorAll(".sv-hero__row").forEach((el) => {
      new Splide(el, { type: "loop", arrows: false, pagination: false, drag: false, autoWidth: true, gap: "16px", direction: el.classList.contains("is-bottom") ? "rtl" : "ltr",
        autoScroll: { speed: reduce ? 0 : 0.3, pauseOnHover: false } }).mount(ext || {});
    });
    const banner = new Splide(".sv-banners__splide", { type: "loop", perPage: 3, perMove: 1, gap: "2em", padding: 0, arrows: false, pagination: false, drag: true, focus: "center", trimSpace: false,
      autoplay: !reduce, interval: 5000, breakpoints: { 767: { perPage: 1, gap: "1.1em" } } });
    banner.mount();
    document.querySelectorAll(".sv-banners__ctrl button").forEach((b) => b.addEventListener("click", () => banner.go(Number(b.dataset.dir) < 0 ? "<" : ">")));
  }
  const pop = document.querySelector(".sv-pop");
  pop?.querySelector(".sv-pop__close").addEventListener("click", () => pop.classList.add("is-closed"));
})();
