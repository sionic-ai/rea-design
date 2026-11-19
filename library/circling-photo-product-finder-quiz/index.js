// Hero — when the loader finishes (fx:done) the text pillar rises, and pressing Start turns the text off, the circle grows and vanishes, then it moves on to the question page.
(() => {
  const root = document.documentElement;
  const intro = document.querySelector(".vf-intro");
  const content = intro.querySelector(".vf-intro__content");
  const logo = content.querySelector(".vf-intro__logo");
  const heading = content.querySelector(".vf-intro__heading");
  const start = content.querySelector(".vf-intro__start-wrap");
  const langs = content.querySelector(".vf-intro__langs");
  const rings = [...document.querySelectorAll(".vf-ring")];
  const ease = kfFx.ease("0.32,0.48,0.27,1.02", "power2.out");
  root.classList.add("js-intro");

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.reduce) { gsap.set([logo, heading, start, langs], { opacity: 1, y: 0 }); return; }
    const enter = () => {
      gsap.fromTo(intro, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(logo, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 1.5, ease, delay: 0.2 });
      gsap.fromTo(heading, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.5, ease, delay: 0.2 });
      gsap.fromTo(start, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.5, ease, delay: 0.45 });
      gsap.fromTo(langs, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.5, ease, delay: 0.45 });
    };
    document.addEventListener("fx:done", enter, { once: true });
    return () => document.removeEventListener("fx:done", enter);
  });

  // Start — the text column turns off in .6s, the circle vanishes at 1.2x scale in 1s, then navigates after .8s (original BlockIntro onClick)
  content.querySelector(".vf-intro__start").addEventListener("click", (e) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { window.vfGo(href); return; }
    gsap.to(content, { opacity: 0, duration: 0.6, ease });
    rings.forEach((r) => r.dispatchEvent(new CustomEvent("fx:leave")));
    window.vfGo(href, 800);
  });
})();
