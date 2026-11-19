// Our thinking and strengths — original: with the value card row pinned to the screen, scrub left by (row width − screen width) (only above 900px).
// The bottom step strip paints the current section through a ScrollMagic scene (centered, as tall as the section).
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mm = gsap.matchMedia();
  mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
    const wrap = $(".aboutValue__wrap"), content = $(".aboutValue__content"), cards = $(".aboutValueCards");
    gsap.to(cards, {
      x: () => -(content.clientWidth - wrap.clientWidth), ease: "none",
      scrollTrigger: { trigger: wrap, start: "top top", end: () => `+=${content.clientWidth - wrap.clientWidth}`, scrub: true, pin: true, invalidateOnRefresh: true, anticipatePin: 0.1 },
    });
  });

  // Step strip — each section has a center-based scene, and it fills that cell when it enters
  if (window.ScrollMagic) {
    const ctrl = new ScrollMagic.Controller();
    const items = $$(".anchorMenu li");
    $$("[data-section-anchor]").forEach((sec) => {
      new ScrollMagic.Scene({ triggerElement: sec, triggerHook: "onCenter", duration: sec.clientHeight, offset: 0 }).addTo(ctrl)
        .on("enter", () => { const n = Number(sec.dataset.sectionAnchor); items.forEach((li, i) => li.classList.toggle("is-current", i === n)); document.body.dataset.currentSection = n; });
    });
  }
  const footer = $(".u-footer");
  if (footer) ScrollTrigger.create({ trigger: footer, start: "top center", onEnter: () => (document.body.dataset.currentSection = "-1"), onLeaveBack: () => (document.body.dataset.currentSection = "") });
  $$(".anchorMenu a").forEach((a) => a.addEventListener("click", (e) => { const t = $(a.getAttribute("href")); if (!t) return; e.preventDefault(); U.lenis ? U.lenis.scrollTo(t) : t.scrollIntoView(); }));
})();
