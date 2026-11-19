// Featured employees: hero photo rotation — like the original, the section is duplicated once more and run as a Splide loop (three visible · centered, 4.8s, transition .7ms for instant),
// Adds a class to the previous, center and next slots relative to the current section, and the css transition (.9s) handles size and blur.
(() => {
  const el = document.querySelector(".mb-fv__slider");
  if (!el || !window.Splide) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const list = el.querySelector(".splide__list");
  [...list.children].forEach((li) => list.appendChild(li.cloneNode(true)));
  const s = new Splide(el, { type: "loop", perPage: 3, perMove: 1, focus: "center", trimSpace: false, arrows: false, pagination: false, drag: false, flickMaxPages: 1, autoplay: !reduce, interval: 4800, speed: 0.7, pauseOnHover: false, pauseOnFocus: false, updateOnMove: true, breakpoints: { 896: { perPage: 1, padding: "11.5%", focus: "center" } } });
  const mark = (active, clear) => {
    if (!active) return;
    const slides = [...el.querySelectorAll(".splide__slide")], at = slides.indexOf(active), n = s.length;
    slides.forEach((sl, i) => {
      const d = (((i - at) % n) + n) % n;
      const cls = d === 0 ? "is-center3" : d === 1 ? "is-next3" : d === n - 1 ? "is-prev3" : null;
      if (cls || clear) sl.classList.remove("is-prev3", "is-center3", "is-next3");
      if (cls) sl.classList.add(cls);
    });
  };
  const now = () => el.querySelector(".splide__slide.is-active");
  s.on("mounted", () => { mark(now(), true); setTimeout(() => { mark(now(), true); ScrollTrigger.refresh(); }, 100); });
  s.on("active", (sl) => mark(sl.slide, false));
  s.on("moved shifted", () => mark(now(), true));
  s.mount();
})();
