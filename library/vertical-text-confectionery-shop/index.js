// Motion only for the first page: three hero images crossfade (after 3s at first, then every 5s · 4s ease-in-out),
// Testimonial slider (Swiper 11.2.10 like the original — loop · .3s · 4.5 slides on PC, slot width on phones),
// Seven flagship product sections (same as the original’s seven ScrollTrigger pins — the first when its own box touches the top of the screen,
// From the second on, it sticks when the previous box touches and stays until its own box has fully passed the screen).
(() => {
  document.querySelector("[data-find]").innerHTML = window.oFindForm();

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const slides = [...document.querySelectorAll("[data-fade] > .wf-img")];
  let cur = 0;
  const next = () => {
    slides[cur].classList.remove("is-active");
    cur = (cur + 1) % slides.length;
    slides[cur].classList.add("is-active");
  };
  if (!reduce) setTimeout(() => { next(); setInterval(next, 5000); }, 3000);

  new Swiper("[data-rec]", {
    loop: true,
    speed: reduce ? 0 : 300,
    pagination: { el: "[data-rec-dots]", clickable: true },
    navigation: { nextEl: "[data-rec-next]", prevEl: "[data-rec-prev]" },
    slidesPerView: "auto",
    breakpoints: { 768: { slidesPerView: 4.5 } },
  });

  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const boxes = gsap.utils.toArray(".i-box");
    boxes.forEach((box, k) => {
      ScrollTrigger.create({
        trigger: k ? boxes[k - 1] : box,
        pin: box.querySelector(".i-pin"),
        start: "top top",
        end: k ? "bottom top-=100%" : "bottom top",
      });
    });
  });
})();
