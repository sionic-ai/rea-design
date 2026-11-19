// Home page: Hero cross-fade (5s interval · 3s) and News slider (25vw · gap 20 · 0.5s) use Splide, plus pinned sky and blur scrub, facility clip-path scrub with blurred background swap, and affiliated people illustrations
(() => {
  const { reduced } = window.TF;

  // Hero: original .hero .splide as is — fade · 5s interval · 3s crossfade · autoplay · no arrows or dots
  document.querySelectorAll(".tf-hero .tf-fade").forEach((el) => new Splide(el, {
    type: "fade", rewind: true, autoplay: true, arrows: false, pagination: false, interval: 5000, speed: 3000, i18n: TF.i18n,
  }).mount());

  // News: original .top-post-slider — 25vw cells · gap 20 · 0.5s · loop + arrows for 3 or more slides, 70vw at 1024 and below
  const topics = document.querySelector(".tf-topics");
  if (topics) {
    const loop = topics.querySelectorAll(".splide__slide").length >= 3;
    new Splide(topics, {
      perMove: 1, fixedWidth: "25vw", gap: 20, type: loop ? "loop" : "slide", arrows: loop, autoplay: false, speed: 500, interval: 0,
      pauseOnFocus: false, pagination: false, i18n: TF.i18n, breakpoints: { 1024: { fixedWidth: "70vw", gap: 20, perPage: 1 } },
    }).mount();
  }

  // Connection illustration: scattered little people (original illustration spot) — seeded random, so the layout is always the same
  const people = document.getElementById("tfPeople");
  if (people) {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const tones = ["--kf-accent", "--site-accent-mute", "--kf-accent-soft", "--site-alert", "--site-people-1", "--site-people-2", "--site-people-3"];
    const spots = [[90, 330], [150, 360], [210, 300], [300, 380], [330, 250], [410, 330], [470, 270], [520, 380], [560, 210], [610, 300], [660, 360], [700, 240], [250, 200], [380, 170], [450, 120], [600, 130], [150, 240], [720, 410], [100, 430], [480, 440], [280, 450], [640, 450]];
    people.innerHTML = spots.map(([x, y], i) => {
      const s = 0.8 + rnd() * 0.5;
      const c = tones[i % tones.length];
      const pair = i % 5 === 2;
      const one = (dx) => `<g transform="translate(${x + dx} ${y}) scale(${s})"><circle cx="0" cy="-30" r="6" style="fill: var(--site-people-hair)"/><path d="M-7 -22h14l3 22h-20z" style="fill: var(${c})"/><path d="M-5 0v16M5 0v16" style="stroke: var(--kf-ink-soft)" stroke-width="3" stroke-linecap="round"/></g>`;
      return one(0) + (pair ? one(18) : "");
    }).join("") + `<g fill="none" style="stroke: var(--kf-accent-soft)" stroke-width="1.5" stroke-dasharray="3 5"><path d="M210 300q60-60 120-50M470 270q50-40 90-60M410 330q100 20 200-30"/></g>`;
  }

  // Sky photo: like the original .sec03, pin the background panel with ScrollTrigger from the section top to bottom
  ScrollTrigger.create({ trigger: ".tf-sec03", start: "top top", end: "bottom bottom", pin: ".tf-sky__bg", pinSpacing: true });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.to(".tf-sky__stick .blur", {
      opacity: 1,
      ease: "power2.out",
      scrollTrigger: { trigger: ".tf-sky__contents", start: "top-=150px center", end: "top+=150px center", scrub: 1 },
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(".tf-sky__stick .blur", { opacity: 1 }));

  mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
    const items = gsap.utils.toArray(".tf-fac__item");
    const figs = gsap.utils.toArray(".tf-fac__img");
    items.forEach((item, i) => {
      gsap.fromTo(figs[i].querySelector(".img"), { clipPath: "inset(100% 0% 0% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "power1.out", // The original gives no curve, so GSAP default
        scrollTrigger: { trigger: item, start: "top bottom-=100px", end: "top center", scrub: 1 },
      });
      ScrollTrigger.create({
        trigger: item,
        start: "top center",
        end: "bottom center",
        onEnter: () => figs.forEach((f, k) => f.classList.toggle("is-active", k === i)),
        onEnterBack: () => figs.forEach((f, k) => f.classList.toggle("is-active", k === i)),
      });
    });
  });
})();
