// First page — original main.js Top module values as they are: video parallax·pill photo pin·gallery strip, hero letters rising after TransitionEnd
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector("[data-top-hero]");
  const heroImage = document.querySelector("[data-top-hero-image]");

  // Wraps text one character at a time (spaces too, as one cell so they hold their place)
  hero.querySelectorAll("[data-hero-str]").forEach((ln) => {
    ln.setAttribute("aria-label", ln.textContent);
    ln.innerHTML = [...ln.textContent].map((c) => `<span data-ln-animation aria-hidden="true">${c}</span>`).join("");
  });

  const intro = () => {
    gsap.to(hero, { opacity: 1 });
    if (reduce) { gsap.set(hero.querySelectorAll("[data-ln-animation]"), { opacity: 1 }); return; }
    gsap.fromTo(heroImage, { scale: 1 }, { scale: 1.1, ease: "power1.out", duration: 2 });
    hero.querySelectorAll("[data-ln-animation-wrapper]").forEach((w, i) => {
      gsap.fromTo(w.querySelectorAll("[data-ln-animation]"), { y: "101%", rotate: "10deg", opacity: 0 }, { y: 0, rotate: "0deg", opacity: 1, ease: "power4.out", duration: 1, delay: i * 0.2 + 1, stagger: { each: 0.03 } });
    });
  };
  addEventListener("TransitionEnd", intro);

  addEventListener("load", () => {
    if (reduce) return;
    // Video drops down to 50% while leaving the Hero (scrub)
    gsap.fromTo(heroImage, { yPercent: 0 }, { yPercent: 50, scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });

    // Pill photo — stays pinned while widening to 110% width and 110vh with corners going to 0 (scrub 1), inner photo 1.3 → 1
    const wrap = document.querySelector("[data-top-brand]"), fig = document.querySelector("[data-top-brand-figure]"), img = document.querySelector("[data-top-brand-image]");
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1025px)", () => {
      gsap.fromTo(fig, { height: () => `${fig.clientWidth / (16 / 9)}px` }, { ease: "none", width: "110%", height: "110vh", borderRadius: "0vw", scrollTrigger: { trigger: wrap, start: "top top", pin: true, scrub: 1, invalidateOnRefresh: true } });
      gsap.to(img, { ease: "none", scale: 1, scrollTrigger: { trigger: wrap, start: "top top", scrub: true, invalidateOnRefresh: true } });
      gsap.fromTo(img, { yPercent: 0 }, { yPercent: 100, scrollTrigger: { trigger: ".top-event", start: () => `top-=${innerHeight}center`, end: () => `bottom+=${innerHeight}px top`, scrub: true } });
    });
    mm.add("(max-width: 1024px)", () => {
      gsap.fromTo(fig, { height: () => `${fig.clientWidth / (16 / 9)}px` }, { ease: "none", width: "100%", height: "100svh", borderRadius: "0vw", scrollTrigger: { trigger: wrap, start: "top top", pin: true, scrub: 1, invalidateOnRefresh: true } });
      gsap.to(img, { ease: "none", scale: 1, scrollTrigger: { trigger: wrap, start: "top top", scrub: true, invalidateOnRefresh: true } });
    });

    // Gallery photo rows — alternate left and right 10% (scrub 1.5)
    const bgs = document.querySelector("[data-gallery-bgs]");
    document.querySelectorAll("[data-gallery-bg]").forEach((row, i) => {
      gsap.fromTo(row, { x: "0" }, { x: i % 2 === 0 ? "10%" : "-10%", scrollTrigger: { trigger: bgs, start: "top bottom", scrub: 1.5 } });
    });
  });
})();
