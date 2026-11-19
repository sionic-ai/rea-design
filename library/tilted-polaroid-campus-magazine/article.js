// Article detail: fixed photo (Splide fade — original interval 4000 · speed 3000 · rewind) · statue button (disappears in .5s once the body section has fully passed, and reappears when scrolled back up)
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const fade = document.querySelector(".ar-fade");
  if (fade && window.Splide) {
    new Splide(fade, { type: "fade", rewind: true, autoplay: true, interval: 4000, speed: 3000, updateOnMove: true, drag: false, arrows: false, pagination: false, pauseOnHover: false, pauseOnFocus: false }).mount();
  }
  const statue = document.querySelector(".ar-statue");
  if (!statue) return;
  addEventListener("load", () => {
    gsap.set(statue, { opacity: 1 });
    gsap.to(statue, { opacity: 0, duration: 0.5, scrollTrigger: { trigger: ".ar-detail", start: "bottom top", end: "top bottom", toggleActions: "play none none reverse", invalidateOnRefresh: true } });
  });
})();
