// Home page: the green header band opens after 1s, pressing ”See more” sends the photo constellation upward with 1.5s expo.in and then scrolls to the end of the Hero, the certification card photo strip flows endlessly and is pushed by the wheel (lerp .05)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const banner = document.querySelector(".gl-banner");
  if (banner) setTimeout(() => banner.classList.add("open"), 1000);
  const hero = document.querySelector(".gl-hero"), field = hero?.querySelector(".gl-field");
  hero?.querySelector(".gl-hero-btn")?.addEventListener("click", () => {
    const end = hero.offsetHeight;
    const go = () => (window.glLenis ? glLenis.scrollTo(end) : scrollTo({ top: end, behavior: reduce ? "auto" : "smooth" }));
    if (reduce || !field) return go();
    gsap.to(field, { y: "-100%", duration: 1.5, ease: "expo.in", onComplete: () => { go(); gsap.set(field, { y: "0%" }); } });
  });

  document.querySelectorAll(".gl-gallery").forEach((box) => {
    const track = box.querySelector(".gl-gallery-track");
    if (!track || reduce) return;
    const speed = +(box.dataset.speed || 1.2);
    track.append(...[...track.children].map((n) => n.cloneNode(true)));
    let cur = 0, target = 0, w = 0, seen = true;
    const size = () => (w = track.scrollWidth / 2);
    const wheel = (e) => { if (seen) target += (e.deltaY || 0) * 0.054; };
    const loop = () => {
      if (seen) {
        target += speed;
        cur += (target - cur) * 0.05;
        const x = ((cur % w) + w) % w;
        track.style.transform = `translate3d(${-x}px,0,0)`;
      }
      requestAnimationFrame(loop);
    };
    new IntersectionObserver(([e]) => (seen = e.isIntersecting)).observe(box);
    addEventListener("wheel", wheel, { passive: true });
    addEventListener("resize", size);
    size(); loop();
  });
})();
