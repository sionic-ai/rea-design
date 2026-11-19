// One facility — original facility.js. The shared-area character hops once, and on phones only, the four cards use Swiper (loop · 500ms · 20px)
(() => {
  gsap.defaults({ ease: "power3.out" });
  if (innerWidth < 768) new Swiper(".js-swiper", { loop: true, speed: 500, spaceBetween: 20, slidesPerView: "auto", breakpoints: { 768: { enabled: false } } });

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)" }, () => {
    const chars = [...document.querySelectorAll(".c-public-area .c-character span")];
    gsap.set(chars, { opacity: 0, y: 30 });
    ScrollTrigger.batch(".c-public-area", {
      start: "top 60%", once: true,
      onEnter: () => gsap.timeline().to(chars, { y: -35, opacity: 1, duration: 0.15, ease: "power2.out" }).to(chars, { y: 0, duration: 0.15, ease: "power2.in" }),
    });
  });
})();
