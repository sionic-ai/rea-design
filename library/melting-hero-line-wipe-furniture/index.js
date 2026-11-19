/* Home — the sticky scene swap is handled by the goo-scene-swap part, here the part is attached only on wide screens and the header band is set as white text over video */
(() => {
  const { $, pc } = EDI;
  const gate = (c) => {
    const hero = $(".e-hero", c);
    if (!hero) return;
    if (pc.matches) hero.setAttribute("data-fx", "goo-scene-swap"); else hero.removeAttribute("data-fx");
  };
  gate(document);

  EDI.view("home", (c) => {
    gate(c);
    const html = document.documentElement, bg = $(".e-header__bg");
    if (!pc.matches) { html.classList.remove("is-dark"); gsap.set(bg, { opacity: 1 }); return; }
    html.classList.add("is-dark");
    gsap.set(bg, { opacity: 0 });
    const light = () => { html.classList.remove("is-dark"); gsap.to(bg, { duration: 0.2, opacity: 1 }); };
    const dark = () => { html.classList.add("is-dark"); gsap.to(bg, { duration: 0.2, opacity: 0 }); };
    ScrollTrigger.create({ trigger: $(".e-prod", c), start: "top 208px", end: "top 52px", onEnter: light, onLeave: light, onLeaveBack: dark, onEnterBack: dark });
    return () => { html.classList.remove("is-dark"); gsap.set(bg, { opacity: 1 }); };
  });
})();
