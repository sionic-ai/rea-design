// About section: pins the fire photo panel to the screen until all About content has passed (scrub 1), while passing the blank space above
// The photo opens to fill the screen from 10.83vw (phone 5.33vw) side margins, settling from 1.03 → 1× and opacity .4 (scrub 1.2)
(() => {
  const about = document.querySelector(".ku-about");
  const container = about?.querySelector(".ku-about__container");
  const pin = about?.querySelector(".ku-aboutBackground");
  const image = pin?.querySelector(".ku-aboutBackground__image");
  const blank = document.querySelector(".ku-aboutBlank");
  if (!container || !pin || !image || !blank) return;
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({ scrollTrigger: { trigger: container, scrub: 1, pin, start: "top+=0 top", end: "bottom-=0 bottom" } });
    const side = ku.isMobile() ? "inset(0vw 5.33vw)" : "inset(0vw 10.83vw)";
    gsap.timeline({ scrollTrigger: { trigger: blank, scrub: 1.2, pin: false, start: "top 0%", end: "bottom 0%" } })
      .fromTo(image, { clipPath: side, scale: 1.03 }, { clipPath: "inset(0vw 0vw)", scale: 1, opacity: 0.4 });
  });
})();
