// Product (original product-hero · collapsible-section · quantity-selector): a big white text band flows one loop in 45s (phone 30s), and
// At 1024↑ the panel stays fixed, from scroll 1 to the end of the detail column — as the text band fades, the panel shrinks from screen width to detail column width (50vw), photo 50→80%,
// After handing over everything, hold the plate width for another 50%. On entry it scrolls over 1s to 40px above the detail cell, and when the detail cell leaves below the screen it scrolls to the top in .5s.
(() => {
  PV.page("detail", (el) => {
    const $ = (s) => el.querySelector(s);
    const hero = $("[data-phero]"), marquee = $("[data-phero-marquee]"), media = $("[data-phero-media]"), details = $("[data-details]");
    const scroller = () => PV.smoother;
    const scrollTo = (y, d) => (scroller() ? gsap.to(scroller(), { scrollTop: y, duration: d }) : gsap.to(window, { scrollTo: y, duration: d }));

    if (!PV.reduce) {
      const text = marquee.querySelector(".pv-phero__text");
      gsap.fromTo(marquee, { x: 0 }, { duration: innerWidth < PV.DESK ? 30 : 45, ease: "none", x: -text.offsetWidth, repeat: -1 });
    }

    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${PV.DESK}px) and (prefers-reduced-motion: no-preference)`, () => {
      let tween = null;
      const offset = () => (scroller() ? scroller().offset(details) : details.getBoundingClientRect().top + scrollY);
      gsap.timeline({
        scrollTrigger: {
          start: 1, end: "bottom bottom-=1", endTrigger: details, pin: hero, scrub: true,
          onEnter: () => { if (!(tween && tween.isActive()) && scroller()) tween = scrollTo(offset() - 40, 1); },
        },
      })
        .fromTo(marquee, { opacity: 1 }, { opacity: 0 })
        .fromTo(hero, { width: () => innerWidth }, { width: () => details.clientWidth }, "<")
        .fromTo(media, { width: "50%" }, { width: "80%" }, "<")
        .fromTo(hero, { width: () => details.clientWidth }, { width: () => details.clientWidth }, "+=50%");
      ScrollTrigger.create({
        trigger: details, start: "top bottom", end: "top bottom+=1",
        onLeaveBack: () => { if (!(tween && tween.isActive()) && scroller()) tween = scrollTo(0, 0.5); },
      });
    });

    // Expand cell — original open/close (.3s height · inner text .2s)
    el.querySelectorAll("[data-fold]").forEach((sec) => {
      const content = sec.querySelector("[data-fold-content]"), wrap = sec.querySelector("[data-fold-wrap]");
      sec.querySelector("[data-fold-toggle]").addEventListener("click", () => {
        if (sec.classList.contains("is-anim")) return;
        sec.classList.add("is-anim");
        const done = (open) => () => { sec.classList.toggle("is-open", open); sec.classList.remove("is-anim"); content.style.removeProperty("height"); ScrollTrigger.refresh(); };
        if (sec.classList.contains("is-open")) {
          gsap.fromTo(content, { height: wrap.clientHeight }, { duration: PV.reduce ? 0 : 0.3, height: 20, onUpdate: () => ScrollTrigger.update(), onComplete: done(false) });
          gsap.fromTo(wrap, { opacity: 1 }, { delay: 0.1, duration: PV.reduce ? 0 : 0.2, opacity: 0 });
        } else {
          sec.classList.add("is-open");
          gsap.fromTo(content, { height: 20, opacity: 0 }, { duration: PV.reduce ? 0 : 0.3, height: wrap.clientHeight, opacity: 1, onUpdate: () => ScrollTrigger.update(), onComplete: done(true) });
          gsap.fromTo(wrap, { opacity: 0 }, { delay: 0, duration: PV.reduce ? 0 : 0.2, opacity: 1 });
        }
      });
    });

    // Quantity — at 0 the add button stays dimmed and blocked
    const n = $("[data-qty-n]"), add = $("[data-add]");
    const set = (v) => { n.textContent = Math.max(0, v); add.disabled = +n.textContent === 0; };
    $("[data-qty-plus]").addEventListener("click", (e) => { e.preventDefault(); set(+n.textContent + 1); });
    $("[data-qty-minus]").addEventListener("click", (e) => { e.preventDefault(); set(+n.textContent - 1); });

    return () => mm.revert();
  });
})();
