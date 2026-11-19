// About scene: two blocks of sentences over a full-bleed photo enter from both sides (phone: from below) over 1.1s at 60% of the screen.
RK.scene(() => {
  const sec = document.querySelector(".rk-about-studio");
  gsap.matchMedia().add({
    desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    mobile: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
  }, ({ conditions: c }) => {
    const [a, b] = c.desktop ? [{ xPercent: -100 }, { xPercent: 100 }] : [{ yPercent: 100 }, { yPercent: 100 }];
    gsap.timeline({ defaults: { duration: 1.1, ease: "power3.out" }, scrollTrigger: { trigger: sec, start: "top 60%", once: true } })
      .fromTo(sec.querySelector(".rk-about-headline__part--start"), a, { xPercent: 0, yPercent: 0 }, 0)
      .fromTo(sec.querySelector(".rk-about-headline__part--end"), b, { xPercent: 0, yPercent: 0 }, 0);
  });
});
