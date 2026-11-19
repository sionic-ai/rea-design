// Work detail: the hero video shrinks slightly with scroll as it is pushed out, the title enters word by word, media blocks rise in from below
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(".dt-hero__media", { scale: 1.12 }, { scale: 1, yPercent: 18, ease: "none", scrollTrigger: { trigger: ".dt-hero", start: "top top", end: "bottom top", scrub: true } });
    const words = new SplitText(".dt-info h1", { type: "words", wordsClass: "w" });
    gsap.set(words.words, { yPercent: 60, opacity: 0 });
    gsap.set([".dt-info__cat", ".dt-info__side", ".dt-info__sum", ".dt-info__date"], { opacity: 0, y: 20 });
    document.addEventListener("dk:reveal", () => {
      gsap.to(words.words, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.05, ease: "expo.out", delay: 0.3 });
      gsap.to([".dt-info__cat", ".dt-info__side", ".dt-info__sum", ".dt-info__date"], { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "expo.out", delay: 0.45 });
    }, { once: true });
    gsap.utils.toArray(".dt-reveal").forEach((el) => gsap.from(el, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
  });
})();
