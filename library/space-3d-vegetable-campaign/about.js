// About motion (original AboutFadeIn values): a text group appears once with .6s expo.out when it hits 90% of the screen (delay .1s),
// The big photo parallaxes +y → -y within the section (scrub 1, desktop 60·53·87px · phone 30px), and the voice photos are pushed in a staggered way: 10 down · 10 up · 25px up,
// For video, pressing the cover shows the control bar and plays.
// Attached each time we arrive via barba, detached on leaving.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  window.vPages = window.vPages || {};
  window.vPages.about = (root) => {
  root.querySelectorAll("[data-star]").forEach((n) => (n.innerHTML = window.vIcon.star));
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    root.querySelectorAll("[data-fade]").forEach((el) => {
      gsap.set(el, { opacity: 0 });
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => gsap.to(el, { opacity: 1, duration: 0.6, ease: "expo.out", delay: 0.1 }) });
    });
    root.querySelectorAll("[data-parallax]").forEach((el) => {
      const inner = el.querySelector("[data-parallax-inner]");
      const y = parseFloat(innerWidth < 768 ? el.dataset.parallaxSp ?? 53 : el.dataset.parallax);
      gsap.fromTo(inner, { y }, { y: -y, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } });
    });
    root.querySelectorAll("[data-shift]").forEach((el) => {
      const d = parseFloat(el.dataset.shift), down = el.dataset.shiftDir === "down";
      gsap.fromTo(el, { y: down ? -d : d }, { y: down ? d : -d, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } });
    });
  });
  const players = [...root.querySelectorAll("[data-video]")].map((box) => {
    const video = box.querySelector("video");
    const play = () => {
      if (box.classList.contains("is-playing")) return;
      video.controls = true;
      box.classList.add("is-playing");
      video.play().catch(() => { box.classList.remove("is-playing"); video.controls = false; });
    };
    box.addEventListener("click", play);
    return () => { box.removeEventListener("click", play); video.pause(); video.currentTime = 0; video.controls = false; box.classList.remove("is-playing"); };
  });
  return () => { mm.revert(); players.forEach((f) => f()); };
  };
})();
