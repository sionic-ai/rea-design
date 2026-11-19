// Home page: Hero entrance (is-animated once it touches the top center line — immediately on first open), and when the first photo starts opening, hide the bottom-left intro text,
// The second photo settles from 1.1 to 1 while the third photo covers it (the original starts at 1.1 when entering that range)
(() => {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  const kv = document.querySelector(".ew-kv");
  if (!kv) return;
  ScrollTrigger.create({ trigger: kv, start: "top center", once: true, onEnter: () => kv.classList.add("is-animated") });

  const text = kv.querySelector(".ew-kv__text");
  kv.addEventListener("fx:open", () => text?.classList.add("is-hide"));
  kv.addEventListener("fx:close", () => text?.classList.remove("is-hide"));

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo("#kv-second .ew-kv__image", { scale: 1.1 }, {
      scale: 1, immediateRender: false,
      scrollTrigger: { trigger: "#kv-third", start: "top bottom", end: "top top", scrub: 1 },
    });
  });
})();
