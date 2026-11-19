// About device — the hero photo approaches from 1.12 to 1 tied to scroll, and value cards float up in sequence as they enter the screen
(() => {
  window.mkPage = window.mkPage || {};
  window.mkPage.about = () => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(".mk-hv__card .mk-photo", { scale: 1, ease: "none", scrollTrigger: { trigger: ".mk-hv", start: "top top", end: "bottom top", scrub: true } });
      gsap.from(".mk-value", { y: 40, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: ".mk-values", start: "top 80%" } });
    });
    return () => mm.revert();
  };
})();
