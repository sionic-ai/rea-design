// Contact — contact cards float up in turn, three progress cards rise at .1s intervals, and Start Chat scrolls down to the form with Lenis
(() => {
  const { lenis, reduce } = window.fg;
  document.querySelectorAll('a[href="#form"]').forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    lenis ? lenis.scrollTo("#form", { duration: 1.6 }) : document.querySelector("#form").scrollIntoView();
  }));
  window.fg.scene(() => {
    if (reduce) return;
    const rise = (els, trigger) => gsap.fromTo(els, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger, start: "top 85%", once: true } });
    rise(gsap.utils.toArray(".fg-card, .fg-sites"), ".fg-cards");
    rise(gsap.utils.toArray(".fg-steps li"), ".fg-steps");
  });
})();
