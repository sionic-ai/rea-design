// Careers list: hero logo-drawing loader (logo-draw-dock — when done, the head and title appear on lv:intro), and polaroids drift with scroll at a different speed per card (greater than 1 rises faster).
// Original (a film site): after the logo sits in the head spot, the head logo stands right away and the pill .07s later. The five title lines use the Framer appear values as they are —
// From size .5 · y 20 · x 60/0/−100/60/80 with spring(duration .4, bounce .2 = Strength 506 · damping 36), settle starting .13s before at .1s intervals
(() => {
  const mark = document.querySelector(".cr-intro__logo");
  if (mark) mark.innerHTML = window.LV.logo;
  if (window.LV.reduce) return;
  const head = document.querySelector("header[data-slot=header]");
  if (head && mark) {
    gsap.set(head.children, { opacity: 0 });
    document.querySelector(".cr-intro").addEventListener("fx:done", () => gsap.to(head.children, { opacity: 1, duration: 0.1, stagger: 0.07, ease: "none" }), { once: true });
  }
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-pol-speed]").forEach((el) => {
      const k = +el.dataset.polSpeed - 1;
      gsap.fromTo(el, { y: () => k * innerHeight }, { y: () => -k * innerHeight, ease: "none", scrollTrigger: { trigger: ".cr-photos", start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
  });
})();
