// Home-only motion — the service circle figure (original data-service-figure) and the pinned reason title cell (original data-advantage-title-wrapper)
(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Three circles sit faintly (.12) gathered 30% toward the center (average of the three centers), then spread to their places in .95s (.1s stagger) when the title reaches 70% of the screen,
    // The triangle line is drawn in .9s (opacity .44) and the text floats up from 8px below in .7s (.05s stagger)
    const figure = document.querySelector("[data-service-figure]"), title = document.querySelector("[data-service-title]");
    const svg = figure && figure.querySelector("svg");
    if (svg && title) {
      const circles = [...svg.querySelectorAll("[data-service-part=circle]")], details = [...svg.querySelectorAll("[data-service-part=detail]")];
      const poly = svg.querySelector("[data-service-part=polygon]");
      const boxes = circles.map((c) => { const b = c.getBBox(); return { c, x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
      const mid = boxes.reduce((a, b) => ({ x: a.x + b.x / boxes.length, y: a.y + b.y / boxes.length }), { x: 0, y: 0 });
      const k = 1 - 0.7, len = poly.getTotalLength();
      gsap.set(svg, { opacity: 0 });
      boxes.forEach((b) => gsap.set(b.c, { x: (mid.x - b.x) * k, y: (mid.y - b.y) * k, opacity: 0.12 }));
      gsap.set(details, { opacity: 0, y: 8 });
      gsap.set(poly, { opacity: 0, strokeDasharray: len, strokeDashoffset: len });
      ScrollTrigger.create({ trigger: title, start: "top 70%", once: true, onEnter: () => {
        gsap.timeline()
          .to(svg, { opacity: 1, duration: 0.35, ease: "power2.out" })
          .to(circles, { x: 0, y: 0, opacity: 1, duration: 0.95, stagger: 0.1, ease: "power2.out" }, 0.05)
          .to(poly, { opacity: 0.44, strokeDashoffset: 0, duration: 0.9, ease: "power2.out" }, 0.15)
          .to(details, { opacity: 1, y: 0, duration: 0.7, stagger: 0.05, ease: "power2.out" }, 0.35);
      } });
    }
    // While the reason cards stack, the left title column is pinned too — from first card center to last card center (no pinSpacing)
    const titleWrap = document.querySelector("[data-adv-title]"), cards = [...document.querySelectorAll(".cn-adv__item")];
    if (titleWrap && cards.length > 1) {
      ScrollTrigger.create({ trigger: cards[0], start: "center center", endTrigger: cards[cards.length - 1], end: "center center", pin: titleWrap, pinSpacing: false, anticipatePin: 1 });
    }
  });
})();
