// Press page: when the media contact panel reaches 60% from the top, text rises line by line and color boxes pop out (once, no rewind).
(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.fonts.ready.then(() => {
      const chars = [...document.querySelectorAll(".hs-media__line h2")].flatMap((h) => HS.split(h, "chars").chars);
      gsap.timeline({ scrollTrigger: { trigger: ".hs-media", start: "top 60%", once: true } })
        .from(chars, { yPercent: 101, duration: 0.5, ease: "back.out(1.7)", stagger: { amount: 0.2 } })
        .from(".hs-w", { scale: 0, opacity: 0.5, duration: 0.5, ease: "back.out(1.7)", stagger: 0.1 }, 0.2)
        .from(".hs-media__mail", { yPercent: 100, opacity: 0, duration: 0.4, ease: "back.out(1.7)" }, 0.4);
    });
  });
})();
