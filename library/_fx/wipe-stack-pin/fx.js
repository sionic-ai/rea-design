// Pile of panels covering upward from below: while the section is pinned (panel count − 1 screens, scrub .6) the next panel fills up from the bottom with clip-path to cover the previous one (power2.inOut),
// That panel’s background settles into place from 1.05 scale·−3%, the photo from 1.06 scale·+6%, and the text from +12% (power1.out) (power2.out) — project stage
(() => {
  kfFx.register("wipe-stack-pin", (el, { options, reduce, scroller }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (slides.length < 2 || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    const mark = (i) => dots.forEach((d, k) => d.classList.toggle("is-fx-on", k === i));
    mark(0);
    if (reduce) return () => dots.forEach((d) => d.classList.remove("is-fx-on"));
    const per = +(options.per ?? 1) || 1;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el, scroller, start: "top top", end: () => `+=${Math.round((slides.length - 1) * per * innerHeight)}`, pin: true, scrub: +(options.scrub ?? 0.6), anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (s) => mark(Math.min(slides.length - 1, Math.round(s.progress * (slides.length - 1)))),
        },
      });
      slides.slice(1).forEach((s, k) => {
        const bg = s.querySelector('[data-fx-part="bg"]'), media = s.querySelector('[data-fx-part="media"]'), text = s.querySelector('[data-fx-part="text"]');
        tl.fromTo(s, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut", duration: 1 }, k);
        if (bg) tl.fromTo(bg, { scale: 1.05, yPercent: -3 }, { scale: 1, yPercent: 0, ease: "power2.out", duration: 1 }, k);
        if (media) tl.fromTo(media, { scale: 1.06, yPercent: 6 }, { scale: 1, yPercent: 0, ease: "power2.out", duration: 1 }, k);
        if (text) tl.fromTo(text, { yPercent: 12 }, { yPercent: 0, ease: "power1.out", duration: 1 }, k);
      });
    }, el);
    return () => { ctx.revert(); dots.forEach((d) => d.classList.remove("is-fx-on")); };
  });
})();
