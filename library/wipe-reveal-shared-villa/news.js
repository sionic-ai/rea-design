// Magazine hero — pickup slider (Splide loop · .75s expo-out · auto every 5s, only the current slide’s photo settles from 1.1 to 1)
(() => {
  const { reduce } = window.snSite;
  const el = document.querySelector(".sn-pickup__splide");
  if (!el || !window.Splide) return;
  const vw = (px, base) => `${(px / base) * 100}vw`;
  const s = new Splide(el, {
    type: "loop", speed: 750, easing: "cubic-bezier(0.16, 1, 0.3, 1)", arrows: true, pagination: true, autoplay: !reduce, interval: 5000,
    pauseOnFocus: false, pauseOnHover: false, drag: true, gap: vw(30, 1440), padding: { left: vw(170, 1440), right: vw(170, 1440) },
    mediaQuery: "max", breakpoints: { 768: { gap: vw(24, 390), padding: { left: vw(20, 390), right: vw(20, 390) } } },
  });
  s.on("drag", () => s.Components.Autoplay?.pause());
  s.on("dragged", () => s.Components.Autoplay?.play());
  s.mount();
  // When the current slide number is shown, cloned slides with the same number light up together — so clones don’t stay faded and invisible while the loop wraps. Changed when movement starts (move)
  const slides = el.querySelectorAll(".splide__slide[data-slide-index]");
  const mark = (i) => slides.forEach((sl) => sl.classList.toggle("is-current", Number(sl.dataset.slideIndex) === i));
  s.on("move", (i) => mark(i));
  mark(0);
})();
