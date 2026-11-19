// About: photo head zoom · title entrance, enjoy-guide disc pin and image swap (original values as is)
(() => {
  const imgs = [...document.querySelectorAll("[data-enjoy-img]")];
  // On phone the disc is drawn three times separately — clone the same drawing into place
  document.querySelectorAll("[data-sp-ill]").forEach((f) => { f.innerHTML = imgs[+f.dataset.spIll].querySelector("svg").outerHTML; });

  // Retreat spot per picture: 1 up, 2 upper left, 3 lower right
  const AWAY = [{ x: 0, y: "-110%" }, { x: "-110%", y: "-50%" }, { x: "50%", y: "110%" }];
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.to(".ab-kv__bg", { scale: 1.1, ease: "none", scrollTrigger: { trigger: ".ab-spacer", start: "top top", end: "bottom top", scrub: 2 } });
    const [en, ja] = document.querySelectorAll(".ab-kv__in");
    gsap.fromTo(en, { y: 0, yPercent: 100 }, { yPercent: 0, duration: 1.2, ease: "power4.out", delay: 0.3 });
    gsap.fromTo(ja, { y: 0, yPercent: 100 }, { yPercent: 0, duration: 1.1, ease: "power4.out", delay: 0.4 });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { gsap.set(".ab-kv__in", { y: 0, yPercent: 0 }); });

  mm.add("(min-width: 1025px)", () => {
    let current = 0;
    imgs.forEach((el, i) => gsap.set(el, i === 0 ? { x: 0, y: 0 } : AWAY[i]));
    ScrollTrigger.create({ trigger: ".ab-enjoy__texts", start: "top 2%", end: "bottom bottom", pin: ".ab-enjoy__sticky", pinSpacing: false });
    const swap = (to) => {
      if (to === current) return;
      const d = brand.reduce ? 0 : 0.8;
      gsap.to(imgs[current], { ...AWAY[current], duration: d, ease: "power2.inOut", overwrite: true });
      gsap.to(imgs[to], { x: 0, y: 0, duration: d, ease: "power2.inOut", overwrite: true });
      current = to;
    };
    document.querySelectorAll(".ab-enjoy__item").forEach((item, i) => {
      ScrollTrigger.create({ trigger: item, start: "top center", end: "bottom center", onEnter: () => swap(i), onEnterBack: () => swap(i) });
    });
  });
})();
