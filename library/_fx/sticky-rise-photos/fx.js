// Photos layered on the pinned panel fill up from the bottom edge for each list row and cover the previous photo (clip-path scrub), and only the blurred background of the row passing the screen center turns on
(() => {
  kfFx.register("sticky-rise-photos", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    const backs = [...el.querySelectorAll('[data-fx-part="back"]')];
    gsap.registerPlugin(ScrollTrigger);
    const scrub = options.scrub === "true" ? true : +(options.scrub ?? 1);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const setActive = (i) => backs.forEach((b, k) => b.classList.toggle("is-active", k === i));
    setActive(0);
    const ctx = gsap.context(() => {
      items.forEach((item, i) => {
        ScrollTrigger.create({
          trigger: item, scroller,
          start: options["back-start"] || "top center", end: options["back-end"] || "bottom center",
          onEnter: () => setActive(i), onEnterBack: () => setActive(i),
        });
        if (reduce || !photos[i]) return;
        gsap.fromTo(photos[i], { clipPath: "inset(100% 0% 0% 0%)" }, {
          clipPath: "inset(0% 0% 0% 0%)", ease,
          scrollTrigger: { trigger: item, scroller, start: options.start || "top bottom-=100px", end: options.end || "top center", scrub },
        });
      });
    });
    return () => { ctx.revert(); backs.forEach((b) => b.classList.remove("is-active")); };
  });
})();
