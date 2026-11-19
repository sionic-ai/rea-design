// First page — order in which the hero cutouts fly in (original values as is) and the company video slider (centered·infinite·0.4s)
(() => {
  /* Hero — ten sheets settle into place in steps(5) jolts over 1.5s, 0.1s apart */
  const FROM = [
    { x: "0vw", y: "100vh" }, { x: "30vw", y: "0vh" }, { x: "10vw", y: "-30vh", rotate: 45 }, { x: "0vw", y: "-50vh" }, { x: "-30vw", y: "-30vh" },
    { x: "-30vw", y: "-30vh" }, { x: "0vw", y: "30vh" }, { x: "-30vw", y: "30vh" }, { x: "-30vw", y: "0vh" }, { x: "-30vw", y: "0vh" },
  ];
  const imgs = [...document.querySelectorAll("[data-hh-img]")];
  const title = document.querySelector("[data-hh-title]");
  const loop = document.querySelector("[data-hh-loop]");
  const decos = document.querySelectorAll(".hh__deco");

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const tl = gsap.timeline();
    tl.set(loop, { opacity: 0, xPercent: 20 });
    gsap.set(title, { opacity: 0 });
    gsap.set(decos, { opacity: 0 });
    imgs.forEach((el, i) => {
      const f = FROM[i];
      gsap.set(el, { x: f.x, y: f.y, rotate: f.rotate || 0, opacity: 0 });
      tl.to(el, { x: 0, y: 0, rotate: 0, opacity: 1, duration: 1.5, ease: "steps(5)" }, i * 0.1);
    });
    tl.to(title, { opacity: 1, duration: 1, ease: "power2.out" }, "+=1")
      .to(title, { keyframes: { "0%": { scale: 1 }, "30%": { scale: 1.15 }, "50%": { scale: 0.95 }, "70%": { scale: 1.05 }, "100%": { scale: 1 } }, duration: 0.8, ease: "none" }, "<")
      .to(loop, { opacity: 1, duration: 1, xPercent: 0, ease: "power2.out", delay: 0.5 })
      .to(decos, { opacity: 1, duration: 1, ease: "power2.out" }, "<");
  });

  /* ── Company video — same Swiper 12 settings as the original (centered·infinite·auto width·16px gap, 40px at 768 and up·default 300ms slide) ── */
  document.querySelectorAll("[data-hm-prev], [data-hm-next]").forEach((b) => { b.innerHTML = ec.ARROW + ec.ARROW; });
  const sw = document.querySelector("[data-hm-swiper]");
  if (sw && window.Swiper) {
    new Swiper(sw, {
      slidesPerView: "auto", loop: true, centeredSlides: true, spaceBetween: 16,
      breakpoints: { 768: { spaceBetween: 40 } },
      navigation: { nextEl: "[data-hm-next]", prevEl: "[data-hm-prev]" },
    });
  }
})();
