// Home — pinned video frame expansion, photo flying in and landing in the pinned About cell, hero news and news strip (Splide)
(() => {
  const mm = gsap.matchMedia();
  const movie = document.querySelector("[data-kv-movie]");

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Original: start "bottom bottom-=10%", toggleActions play none none reverse
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".ky-hero", start: "bottom bottom-=10%", toggleActions: "play none none reverse" } });
    tl.to(movie, { borderRadius: 0, marginTop: 0, marginLeft: 0, marginRight: 0, width: "100%", duration: 1.4, ease: "power4.inOut" });
    tl.to("[data-kv-news]", { opacity: 0, duration: 0.5, ease: "power4.inOut" }, "<");
    tl.to("[data-catch]", { opacity: 0, duration: 0.5, ease: "power4.inOut" }, "<");
  });

  // The original only flies photos at 1025px and above — one photo at a time, delayed by the cell height (100svh)
  mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
    const main = document.querySelector(".ky-thought__main");
    const figs = gsap.utils.toArray("[data-thought-fig]");
    figs.forEach((fig, i) => {
      const g = main.offsetHeight;
      gsap.set(fig, { x: "-10vh", y: "-30vh", rotate: -6, opacity: 0 });
      gsap.to(fig, {
        opacity: 1, x: 0, y: 0, rotate: 0,
        scrollTrigger: {
          trigger: main, start: `top+=${g * i} center`, end: `bottom+=${g * i} center`, toggleActions: "play none none reverse",
          onLeave: () => gsap.to(fig, { rotate: 3, duration: 0.5 }),
        },
      });
    });
  });

  // Same Splide 4.1.4 as the original — hero news is a fade (5s interval · 2s transition · rewind), the news strip is 367px card dragging + progress bar
  const kv = document.querySelector("[data-kv-news-slider]");
  if (kv) new Splide(kv, { autoplay: true, type: "fade", rewind: true, gap: 20, destroy: false, arrows: false, interval: 5000, speed: 2000 }).mount();
  const top = document.querySelector("[data-top-news-slider]");
  if (top) {
    const sl = new Splide(top, { pagination: false, fixedWidth: "367px", gap: 20, destroy: false, arrows: false, breakpoints: { 375: { fixedWidth: "240px" }, 575: { fixedWidth: "285px" } } });
    const bar = top.querySelector("[data-news-bar]");
    sl.on("mounted move", () => {
      const end = sl.Components.Controller.getEnd() + 1;
      bar.style.width = `${100 * Math.min((sl.index + 1) / end, 1)}%`;
    });
    sl.mount();
  }
})();
