// Work list — header entrance (blur 12px · from 12px below), then the first card straddling the hero follows once the header letters have all landed (.25 + letter count × .02 + .1). Other cards·cursor·background blur clearing are in shared.js
(() => {
  const E = MD.ease();
  const blur = (px) => (MD.touch ? {} : { filter: `blur(${px}px)` });
  const clear = MD.touch ? {} : { filter: "blur(0px)" };
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const h = document.querySelector(".ab-hero__h"), body = document.querySelector(".ab-hero__body");
    const hc = MD.split(h);
    gsap.set([h, body], { opacity: 0, y: 12, ...blur(12) });
    gsap.set(hc, { opacity: 0, y: 8 });
    const card = document.querySelector("[data-hero-card]");
    const img = card?.querySelector(".md-card__img"), info = card?.querySelector(".md-card__info");
    if (img) gsap.set(img, { opacity: 0, y: 40, ...blur(8) });
    if (info) gsap.set(info, { opacity: 0, y: 20, ...blur(6) });
    MD.onReveal(() => {
      const after = 0.25 + hc.length * 0.02 + 0.1;
      if (img) gsap.to(img, { opacity: 1, y: 0, ...clear, duration: 0.8, ease: E, delay: after });
      if (info) gsap.to(info, { opacity: 1, y: 0, ...clear, duration: 0.6, ease: E, delay: after + 0.25 });
      gsap.to(h, { opacity: 1, y: 0, ...clear, duration: 0.9, ease: E, delay: 0.1 });
      gsap.to(hc, { opacity: 1, y: 0, duration: 0.45, ease: E, stagger: 0.02, delay: 0.25 });
      gsap.to(body, { opacity: 1, y: 0, ...clear, duration: 0.6, ease: E, delay: 0.1 });
    });
  });
})();
