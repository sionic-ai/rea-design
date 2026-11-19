// First page — original Index class values as they are:
//  The video is pinned for the whole Hero (pinType transform), and for one screen at the end of the Hero the video is pushed up by −50%,
//  On wide screens the Full Movie button sticks 30px from the bottom of the screen and rises together at the end of the Hero.
(() => {
  const fv = document.querySelector(".i-fv");
  if (!fv) return;
  const video = fv.querySelector(".i-fv__video"), player = fv.querySelector(".i-fv__player");
  const movie = fv.querySelector(".i-fv__movie");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.create({ trigger: video, endTrigger: fv, start: "top top", end: "bottom top", pin: true, pinType: "transform" });
    ScrollTrigger.create({ trigger: fv, start: "bottom bottom", end: "bottom top", onUpdate: (st) => { player.style.transform = `translateY(${-50 * st.progress}%)`; } });
  });
  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
    ScrollTrigger.create({ trigger: movie, endTrigger: fv, start: () => `bottom bottom-=${3 * rem()}`, end: "bottom bottom", pin: true });
  });

  // Full video curtain — stops lenis when opened and resumes it when closed
  const modal = document.querySelector(".i-modal");
  movie.addEventListener("click", () => { window.lenis?.stop(); modal.classList.add("is-show"); });
  modal.querySelector(".i-modal__close").addEventListener("click", () => { window.lenis?.start(); modal.classList.remove("is-show"); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("is-show")) modal.querySelector(".i-modal__close").click(); });
})();
