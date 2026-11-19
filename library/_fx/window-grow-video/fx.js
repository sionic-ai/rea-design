// With the section pinned to the screen (for the section’s height), a small video window in the center grows slightly larger than the screen, text floats up and then vanishes upward, and then
// As the video blurs, the video window (video embed spot) rises over it — one step is 1 on wide screens, .5 on narrow (original Brand movie)
(() => {
  kfFx.register("window-grow-video", (el, { options, reduce, scroller }) => {
    const win = el.querySelector('[data-fx-part="window"]');
    if (!win) return;
    gsap.registerPlugin(ScrollTrigger);
    const text = [...el.querySelectorAll('[data-fx-part="text"]')];
    const full = el.querySelector('[data-fx-part="full"]');
    const media = el.querySelector('[data-fx-part="media"]');
    const w = options.w || "calc(100vw + 20px)";
    const h = options.h || "calc(100vh + 20px)";
    const blur = +(options.blur ?? 10);
    const parts = [win, full, media, ...text].filter(Boolean);
    const mm = gsap.matchMedia();
    if (reduce) {
      gsap.set(win, { width: w, height: h });
      if (full) gsap.set(full, { opacity: 1, y: 0 });
      if (media) gsap.set(media, { filter: `blur(${blur}px)` });
    } else {
      mm.add("all", () => {
        const step = innerWidth <= +(options.narrow ?? 768) ? +(options["step-narrow"] ?? 0.5) : +(options.step ?? 1);
        // No curve given, so the GSAP default (power1.out) applies at each step — same as the original
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, pin: true, pinSpacing: true, start: "top top", end: options.end || "bottom top", scrub: +(options.scrub ?? 1) } });
        tl.to(win, { width: w, height: h, duration: step }, 0);
        if (text.length) {
          tl.to(text, { opacity: 1, y: 0, duration: step }, +(options["text-in"] ?? 1.5));
          tl.to(text, { opacity: 0, y: -(+(options.rise ?? 50)), duration: step }, +(options["text-out"] ?? 3));
        }
        const at = +(options["full-in"] ?? 3.5);
        if (full) tl.to(full, { opacity: 1, y: 0, duration: step }, at);
        if (media) tl.to(media, { filter: `blur(${blur}px)`, duration: step }, at);
      });
    }
    return () => {
      mm.revert();
      gsap.set(parts, { clearProps: "width,height,opacity,transform,filter" });
    };
  });
})();
