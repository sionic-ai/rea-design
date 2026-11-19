// Original top.js values: on load the logo comes into focus from blur and the curtain lifts at 1.5s (.end) · at 1.499s the Hero Splide fade (3s interval · 2s transition · rewind)
// · The second section is ‹top-=Once it reaches “10% top” the navy header line drops in over .15s linear · the photo strip below auto-scrolls .5px per frame.
(() => {
  scrollTo(0, 0);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const strip = new Splide(".top__slider", {
    type: "loop", arrows: false, pagination: false, drag: false, gap: 8, perPage: 4,
    breakpoints: { 896: { perPage: 2, gap: 4 } },
    autoScroll: { speed: reduce ? 0 : 0.5, pauseOnHover: false },
  });
  strip.mount(window.splide.Extensions);

  const opening = () => {
    const head = document.querySelector(".pk-head:not(.pk-subhead)");
    const logo = head?.querySelector(".pk-logo");
    const cover = document.querySelector(".opening");
    if (!head || !cover) return;
    if (reduce) {
      cover.classList.add("end");
      head.classList.remove("opening-active");
      document.body.classList.add("top-loaded");
      return;
    }
    logo?.classList.add("show");
    cover.querySelector(".opening__logo .pk-logo")?.parentElement.classList.add("show");
    setTimeout(() => {
      cover.classList.add("end");
      document.body.classList.add("top-loaded");
      head.classList.remove("opening-active");
    }, 1500);
  };

  const subheader = () => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 897px)", () => {
      gsap.to(".pk-subhead", {
        y: 0, duration: 0.15, ease: "none",
        scrollTrigger: { trigger: ".top__concept", start: "top-=10% top", toggleActions: "play none none reverse" },
      });
    });
  };

  document.querySelector(".pk-head:not(.pk-subhead)")?.classList.add("opening-active");

  addEventListener("load", () => {
    gsap.registerPlugin(ScrollTrigger);
    opening();
    subheader();
    setTimeout(() => {
      new Splide(".mv_slider", {
        pagination: true, type: "fade", rewind: true, autoplay: !reduce, pauseOnHover: false, pauseOnFocus: false,
        arrows: false, drag: false, interval: 3000, speed: 2000,
      }).mount();
    }, reduce ? 0 : 1499);
  });
})();
