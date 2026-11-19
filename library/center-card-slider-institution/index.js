// Home page: Swiper centered card slider (original settings as-is), activity tabs (switch instantly on click, and newly shown cards rise out of a blur),
// About photo panels — shadow at .6s after opening, and when the section is 30% visible, fx:play is sent to the three panels so they start changing in turn at 3, 6 and 9s
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  new Swiper("#topSlider", {
    loop: true,
    allowTouchMove: true,
    autoplay: reduce ? false : { delay: 5000 },
    speed: reduce ? 0 : 500,
    centeredSlides: true,
    slidesPerView: "auto",
    spaceBetween: 20,
    pagination: { el: "#topSlider .swiper-pagination", clickable: true },
    navigation: { nextEl: "#topSlider .swiper-button-next", prevEl: "#topSlider .swiper-button-prev" },
    breakpoints: { 780: { spaceBetween: 60 } },
  });

  const tabs = [...document.querySelectorAll(".ic-tabs [data-tab]")];
  const panels = [...document.querySelectorAll("[data-tab-panel]")];
  tabs.forEach((b) =>
    b.addEventListener("click", () => {
      const n = b.dataset.tab;
      tabs.forEach((t) => { const on = t === b; t.classList.toggle("is-on", on); t.setAttribute("aria-selected", String(on)); });
      panels.forEach((p) => p.classList.toggle("is-on", p.dataset.tabPanel === n));
      // Cards in a hidden panel should blur-in for the first time when shown (the original jQuery inview doesn’t catch hidden elements)
      panels.find((p) => p.dataset.tabPanel === n)?.querySelectorAll("[data-later]").forEach((c) => {
        c.setAttribute("data-fx", c.dataset.later);
        c.removeAttribute("data-later");
      });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }),
  );

  const about = document.querySelector("#about");
  const clips = [...document.querySelectorAll(".ic-about__clip")];
  clips.forEach((clip) => {
    ScrollTrigger.create({
      trigger: clip,
      start: "top bottom",
      once: true,
      onEnter: () => gsap.delayedCall(reduce ? 0 : 0.6, () => clip.parentElement.classList.add("is-lit")),
    });
  });
  if (about) {
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      clips.forEach((c) => c.dispatchEvent(new CustomEvent("fx:play")));
    }, { threshold: 0.3 });
    io.observe(about);
  }
})();
