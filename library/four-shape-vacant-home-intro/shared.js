// Shared by all pages: .6s brighten on page entry, shape parallax decoration, menu drawer, logo hiding, story and business sliders.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  requestAnimationFrame(() => document.body.classList.add("is-shown"));

  // Original lifts the shape by data-to from when the section top reaches 90% of the screen until the section bottom has passed one more screen above the viewport
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".kh-parallax__item").forEach((item) => {
      const section = item.closest("section, [data-parallax-scope]") || item.parentElement;
      gsap.fromTo(item, { y: 0 }, {
        y: parseFloat(item.dataset.to) || -300,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top 90%", end: "bottom -100%", scrub: true },
      });
      ScrollTrigger.create({ trigger: item, start: "top 90%", once: true, onEnter: () => item.classList.add("is-visible") });
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.querySelectorAll(".kh-parallax__item").forEach((item) => item.classList.add("is-visible"));
  });

  // Menu drawer: a white panel grows from the top right to 90vw × 98dvh (0.7 seconds power4.inOut), and the inside appears with a 0.3 second overlap
  const toggle = document.querySelector(".kh-toggle");
  const drawer = document.querySelector(".kh-drawer");
  const block = drawer?.querySelector(".kh-drawer__block");
  const inner = drawer?.querySelector(".kh-drawer__inner");
  let tl;
  const setMenu = (open) => {
    toggle.classList.toggle("is-active", open);
    toggle.setAttribute("aria-expanded", String(open));
    tl?.kill();
    const d = reduce() ? 0 : 1;
    if (open) {
      drawer.classList.add("is-active");
      drawer.setAttribute("aria-hidden", "false");
      tl = gsap.timeline()
        .to(block, { width: "90vw", height: "98dvh", minHeight: "32rem", duration: 0.7 * d, ease: "power4.inOut" })
        .to(inner, { opacity: 1, duration: 0.5 * d, ease: "power4.inOut" }, d ? "-=0.3" : 0);
    } else {
      tl = gsap.timeline()
        .to(inner, { opacity: 0, duration: 0.4 * d, ease: "power4.inOut" })
        .to(block, { width: 0, height: 0, minHeight: 0, duration: 0.7 * d, ease: "power4.inOut" }, d ? "-=0.4" : 0)
        .call(() => {
          drawer.classList.remove("is-active");
          drawer.setAttribute("aria-hidden", "true");
        });
    }
  };
  if (toggle && drawer) {
    toggle.addEventListener("click", () => setMenu(!toggle.classList.contains("is-active")));
    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle.click(); }
    });
    drawer.addEventListener("click", () => setMenu(false));
    addEventListener("keydown", (e) => e.key === "Escape" && toggle.classList.contains("is-active") && setMenu(false));
  }

  // Logo: disappears in 0.3 seconds once 50px builds up downward, and returns once 50px builds up upward
  const brand = document.querySelector(".kh-hd > .kh-brand");
  if (brand) {
    let last = scrollY, down = 0, up = 0, hidden = false;
    addEventListener("scroll", () => {
      const diff = scrollY - last;
      if (diff > 0) {
        down += diff; up = 0;
        if (!hidden && down >= 50) { gsap.to(brand, { opacity: 0, duration: 0.3, ease: "power2.out" }); brand.style.pointerEvents = "none"; hidden = true; down = 0; }
      } else if (diff < 0) {
        up -= diff; down = 0;
        if (hidden && up >= 50) { gsap.to(brand, { opacity: 1, duration: 0.3, ease: "power2.out" }); brand.style.pointerEvents = "auto"; hidden = false; up = 0; }
      }
      last = scrollY;
    }, { passive: true });
  }

  // The slider is the same Splide 4.1.2 as the original — 3s transition, 7s interval, flowing strip uses auto-scroll 0.2
  const still = reduce();
  const story = document.querySelector("#kh-story-slider");
  if (story) new Splide(story, {
    type: "loop", arrows: true, pagination: false, padding: { left: "0vw", right: "30vw" }, perPage: 1, gap: "6.7vw",
    rewind: true, speed: still ? 0 : 3000, autoplay: !still, interval: 7000, breakpoints: { 767: { padding: "5vw" } },
  }).mount();
  const band = document.querySelector("#kh-teaser-band");
  if (band) new Splide(band, {
    type: "loop", rewind: true, drag: "free", arrows: false, pagination: false, gap: "5em", autoWidth: true,
    autoScroll: { speed: still ? 0 : 0.2, pauseOnHover: false, pauseOnFocus: false },
  }).mount(window.splide.Extensions);
  const shots = document.querySelector("#kh-teaser-slider");
  if (shots) new Splide(shots, {
    type: "loop", arrows: false, pagination: false, padding: "4vw", perPage: 4, perMove: 1, gap: "5vw", rewind: true,
    speed: still ? 0 : 3000, autoplay: !still, interval: 6000, pauseOnHover: false, breakpoints: { 767: { perPage: 2 } },
  }).mount();

  addEventListener("load", () => ScrollTrigger.refresh());
})();
