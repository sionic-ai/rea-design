// Collaboration brands — list type from the original PagePortfolio.js (the grid toggle button is hidden in the original)
(() => {
  const AM = (window.AM = window.AM || { pages: {} });
  AM.pages.works = (main, { mobile }) => {
    const off = [];
    const hero = main.querySelector(".w-hero");
    const heroImg = hero.querySelector(".a-hero__image");
    const title = hero.querySelector(".a-hero__title");
    ScrollTrigger.create({
      trigger: hero, start: "top top", endTrigger: main.querySelector(".w-text"), end: "top top", pin: hero, pinSpacing: false,
      onUpdate: (s) => {
        gsap.set(title, { opacity: 1 - s.progress * 1.5 });
        const p = s.progress * 2;
        gsap.set(heroImg, { clipPath: `polygon(0 0, 100% 0, 100% ${(1 - p) * 100}%, 0% ${(1 - p) * 100}%)` });
        gsap.set(heroImg.querySelector(".a-hero__img"), { scale: 1 + s.progress * 0.4 });
      },
    });
    // Logo strip height = That line height, attached to the cursor height every frame (on phone it stays centered on screen)
    const rows = [...main.querySelectorAll(".w-client")];
    const fit = () => rows.forEach((r) => (r.querySelector(".w-logo-band").style.height = `${Math.floor(r.getBoundingClientRect().height)}px`));
    fit();
    const ro = new ResizeObserver(fit);
    rows.forEach((r) => ro.observe(r));
    const bands = rows.map((r) => r.querySelector(".w-logo-band"));
    let my = 0, raf = 0;
    const move = (e) => { if (!mobile) my = e.clientY; };
    addEventListener("mousemove", move, { passive: true });
    const loop = () => { bands.forEach((b) => gsap.set(b, { y: my })); raf = requestAnimationFrame(loop); };
    loop();
    off.push(() => { cancelAnimationFrame(raf); removeEventListener("mousemove", move); ro.disconnect(); });
    return () => off.forEach((f) => f());
  };
})();
