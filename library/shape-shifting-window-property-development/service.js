// Business space page — hero background parallax and down arrow, gray About stage (original business values), space picker
(() => {
  if (!window.gsap) return;
  BA.lists();
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    BA.subHero(document.querySelector(".sub-hero"));
    // Original business About: only the window size is large and the bundle moves across just −50%, the second screen at .33~.58, the third from .65
    BA.intro(document.querySelector(".ba-intro"), {
      shift: -50,
      bands: [[0, 0.22], [0.33, 0.58], [0.65]],
      stagger: { two: 0.02, three: 0.03 },
      sizes: {
        tablet: { w1: "30vh", h1: "40vh", r1: "0", t1: "5rem", w2: "40vh", h2: "40vh", l2: "0", b2: "50vh" },
        laptop: { w1: "22.5rem", h1: "30rem", r1: "0", t1: "14%", w2: "33.188rem", h2: "33.188rem", l2: "0", b2: "20%" },
        desktop: { w1: "30rem", h1: "39rem", r1: "0", t1: "14%", w2: "44.25rem", h2: "44rem", l2: "0", b2: "20%" },
      },
    });
  });
})();
