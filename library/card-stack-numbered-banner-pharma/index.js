// Motion unique to the first page — hero opening, card stack under the wordmark, three vertical banners, company tab ↔ slider
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Hero opening (original LeadIndex — as the curtain lifts at .64s, text and wordmark rise 20px over .9s power3.out, button spot top 20→0)
  document.addEventListener("ps:intro", () => {
    const els = $$(".ps-lead [data-rise]");
    if (!window.gsap || matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach((e) => (e.style.visibility = "visible", e.style.opacity = 1)); return; }
    gsap.timeline({ defaults: { duration: 0.9, ease: "power3.out" } })
      .fromTo(els.filter((e) => !e.classList.contains("ps-lead__btnwrap")), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0 }, 0)
      .fromTo(".ps-lead__btnwrap", { autoAlpha: 0, top: 20 }, { autoAlpha: 1, top: 0 }, 0)
      .fromTo(".ps-lead__btnwrap .ps-btn > span", { autoAlpha: 0 }, { autoAlpha: 1 }, 0);
  });

  document.addEventListener("ps:ready", ({ detail: { mm } }) => {
    if (!mm) return;
    mm.add({ d: "(min-width: 1280px)", m: "(max-width: 1279px)" }, (ctx) => {
      const { d } = ctx.conditions;

      // Phone·tablet: the hero vanishes on scroll and the photo scales to .7x (original below xl)
      if (!d) {
        gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".ps-lead", start: "top top", end: "bottom top", scrub: true } })
          .to(".ps-lead__hero", { autoAlpha: 0, yPercent: -8, duration: 1 }, 0)
          .to(".ps-lead__bottom", { autoAlpha: 0, duration: 0.9 }, 0)
          .to(".ps-lead__bg", { scale: 0.7, duration: 1 }, 0);
      }

      // Card stack — the second and third cards rise from 20vh·30vh below (top bottom → top 25%·15%), and the front card fades when the next one arrives
      const cards = $$(".ps-card");
      cards.forEach((c, i) => {
        if (i) gsap.fromTo(c, { y: i === 1 ? "20vh" : "30vh" }, { y: 0, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: i === 1 ? "top 25%" : "top 15%", scrub: true } });
        const next = cards[i + 1];
        if (next) gsap.to(c, { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: next, start: "top 48%", end: "top 15%", scrub: true } });
      });
      if (d) $$("[data-card-media]").forEach((m) => gsap.fromTo(m, { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: m.closest(".ps-card"), start: "top 90%", end: "bottom 10%", scrub: true } }));
    });

    // Vertical banner — with its share of the scroll it peels the upper section away from the bottom (clip-path), clears the darkness of the lower section, and fills the progress ring.
    const vb = $(".ps-vb");
    if (vb) {
      const slides = $$(".ps-vb__slide", vb), prog = $(".ps-vb__ring .is-prog", vb);
      const n = slides.length;
      const paint = (p) => {
        const seg = p * (n - 1);
        slides.forEach((s, i) => {
          const local = Math.min(1, Math.max(0, seg - i));
          s.style.setProperty("--clip", (local * 100).toFixed(2) + "%");
          const under = Math.min(1, Math.max(0, seg - (i - 1)));
          s.style.setProperty("--dark", i ? (0.5 * (1 - under)).toFixed(3) : 0);
        });
        if (prog) prog.style.strokeDashoffset = (1 - (Math.min(n - 1, seg) + 1) / n).toFixed(4);
      };
      paint(0);
      ScrollTrigger.create({ trigger: vb, start: "top top", end: "bottom bottom", scrub: true, onUpdate: (s) => paint(s.progress), onRefresh: (s) => paint(s.progress) });
    }
  });

  // Company tabs ↔ card slider
  addEventListener("load", () => {
    const tabs = $$("[data-tabs-slider] .ps-tab");
    const sw = $('[data-slider-for="companies"]')?.swiper;
    if (!sw) return;
    tabs.forEach((t, i) => t.addEventListener("click", () => { tabs.forEach((x, j) => x.setAttribute("aria-selected", i === j)); sw.slideTo(i); }));
    sw.on("slideChange", () => tabs.forEach((x, j) => x.setAttribute("aria-selected", j === sw.activeIndex)));
  });
})();
