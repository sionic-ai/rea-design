// Shop section: the hero stuck behind — while scrolling down the rounded frame grows 91.59%→200% and the photo goes 1.2→1x, and while the intro band rises the panel moves up 1/4 of a screen.
// Photos in the frame use embla (loop, duration 40) with fade and label plugins: first slide after 1.5s, then advance every 3s
(() => {
  const kv = document.querySelector(".nk-activity-kv");
  if (!kv) return;
  const cover = kv.querySelector(".cover");
  const slides = cover.querySelectorAll(".embla__slide");

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const st = ScrollTrigger.create({
      trigger: kv,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        cover.style.webkitMaskSize = cover.style.maskSize = `${91.59 + 108.41 * self.progress}%`;
        slides.forEach((s) => { s.style.scale = String(-0.2 * self.progress + 1.2); });
      },
    });
    const tw = gsap.fromTo(kv.querySelector(".inner"), { y: 0 }, {
      y: () => -innerHeight / 4,
      ease: "sine.in",
      scrollTrigger: { trigger: ".nk-activity-summary", start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true },
    });
    return () => { st.kill(); tw.scrollTrigger?.kill(); tw.kill(); };
  });

  const root = cover.querySelector(".embla"), first = slides[0];
  if (slides.length > 1 && window.EmblaCarousel && !nk.reduce) {
    first.style.opacity = "1";
    first.style.transition = "none";
    requestAnimationFrame(() => { first.style.transition = ""; });
    const embla = EmblaCarousel(root, { loop: true, duration: 40 }, [EmblaCarouselClassNames(), EmblaCarouselFade()]);
    let timer, firstTurn = true;
    const tick = () => {
      timer = setTimeout(() => { embla.scrollNext(); firstTurn = false; tick(); }, firstTurn ? 1500 : 3000);
    };
    tick();
    embla.on("destroy", () => clearTimeout(timer));
  } else if (first) {
    first.style.opacity = "1";
    first.style.position = "relative";
    first.style.transition = "none";
  }
})();
