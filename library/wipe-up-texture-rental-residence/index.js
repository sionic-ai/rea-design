// First page — original values as is: key visual Splide fade (every 7s for 5s), background wipe scrub 1, center photo and text swap at the line of screen center+150px,
// The photo pile starts when the section top touches the screen top, new items Splide loop (3 centered slides, 1 second).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("tr-kv").classList.add("is-show");

  new Splide(".tr-kv__slider", {
    type: "fade", rewind: true, autoplay: !reduce, interval: 7000, speed: reduce ? 0 : 5000,
    pauseOnHover: false, pauseOnFocus: false, arrows: false, pagination: false,
  }).mount();

  const leadImgs = document.querySelectorAll("#tr-lead-img > .tr-ph");
  const leadTexts = document.querySelectorAll("#tr-lead-text > p");
  const bkFigs = document.querySelectorAll("#tr-bk-img > figure");
  const steps = [[".js-lead-bk-02", ".js-lead-bk-03"], [".js-lead-bk-03", ".js-lead-bk-04"], [".js-lead-bk-04", ".js-lead-bk-05"], [".js-lead-bk-05", ".js-top-copy"]];

  // Center vertical photo: when the next background is half wiped, it switches with a 1.5s fade
  steps.forEach(([from, to], i) => {
    const img = leadImgs[i + 1];
    ScrollTrigger.create({
      trigger: from, start: "top center+=150", endTrigger: to, end: "top center",
      onEnter: () => img.classList.remove("is-hidden"),
      onLeaveBack: () => img.classList.add("is-hidden"),
    });
  });

  const mm = gsap.matchMedia();
  // Right text: the previous text slides up and vanishes and the next rises from below. On phones the switching line is 150px higher
  const textSteps = (offset) => {
    const made = steps.map(([from, to], i) => {
      const cur = leadTexts[i], next = leadTexts[i + 1];
      return ScrollTrigger.create({
        trigger: from, start: `top center${offset}`, endTrigger: to, end: "top center",
        onEnter: () => { cur.classList.remove("is-hide-bottom"); cur.classList.add("is-hide-top"); next.classList.remove("is-hide-bottom"); },
        onLeaveBack: () => { cur.classList.remove("is-hide-top"); next.classList.add("is-hide-bottom"); },
      });
    });
    return () => made.forEach((t) => t.kill());
  };
  mm.add("(min-width: 992px)", () => textSteps("+=150"));
  mm.add("(max-width: 991px)", () => textSteps("-=150"));

  // Background wipe: the top cover (inset top) of the next section goes 100% → 0, scrub 1 over one screen of scroll
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    bkFigs.forEach((fig, i) => {
      if (!i) return;
      const n = String(i + 1).padStart(2, "0");
      if (ctx.conditions.still) {
        ScrollTrigger.create({ trigger: `.js-lead-bk-${n}`, start: "top bottom", onEnter: () => gsap.set(fig, { "--clip": "0%" }), onLeaveBack: () => gsap.set(fig, { "--clip": "100%" }) });
        return;
      }
      gsap.fromTo(fig, { "--clip": "100%" }, {
        "--clip": "0%", ease: "none",
        scrollTrigger: { trigger: `.js-lead-bk-${n}`, endTrigger: `.js-lead-bk-${n}-end`, start: "top bottom", end: "top bottom", scrub: 1 },
      });
    });
  });

  // Photo pile: scatters when the section reaches the top, and regathers when leaving the section (either above or below). The side text stays once it has appeared.
  const copyImg = document.getElementById("tr-copy-img");
  const copyTexts = [document.getElementById("tr-copy-text-01"), document.getElementById("tr-copy-text-02")];
  ScrollTrigger.create({
    trigger: ".js-top-copy", start: "top top", end: "bottom top",
    onEnter: () => { copyImg.classList.add("is-animate"); copyTexts.forEach((t) => t.classList.add("is-show")); },
    onLeave: () => copyImg.classList.remove("is-animate"),
    onEnterBack: () => copyImg.classList.add("is-animate"),
    onLeaveBack: () => copyImg.classList.remove("is-animate"),
  });

  // Hovering a region label turns on only that region’s overlay
  const overlays = document.querySelectorAll(".tr-area__overlay");
  document.querySelectorAll("#tr-area-link a").forEach((a) => {
    a.addEventListener("mouseover", () => overlays.forEach((o) => o.dataset.area === a.dataset.area && o.classList.add("is-show")));
    a.addEventListener("mouseleave", () => overlays.forEach((o) => o.classList.remove("is-show")));
  });

  const listings = new Splide("#tr-listings", {
    type: "loop", perPage: 3, focus: "center", gap: 40, speed: reduce ? 0 : 1000, interval: 2000,
    pauseOnHover: false, pauseOnFocus: false, pagination: false,
    arrowPath: "M0 19.3h36.6l-8.4-8.4 1-1 10 10.1-10 10.1-1-1 8.4-8.4H0z",
    breakpoints: { 991: { perPage: 2 }, 767: { perPage: 1 } },
  }).mount();
  const cur = document.getElementById("tr-slide-current"), len = document.getElementById("tr-slide-length");
  const count = () => { cur.textContent = listings.index + 1; len.textContent = listings.length; };
  listings.on("active", count);
  count();
})();
