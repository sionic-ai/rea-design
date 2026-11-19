// About — each photo over the big acronym drifts by its data-parallax (%) across the whole section (scrub .8, phone starts at 12·18%),
// With two or more sections, every 2.5s the next section overlaps in with a .9s osmoFade, staggered by .7s each
(() => {
  const mm = gsap.matchMedia();
  document.querySelectorAll(".a-letters").forEach((sec) => {
    const media = sec.querySelectorAll(".a-media");
    mm.add({ ok: "(prefers-reduced-motion: no-preference)", phone: "(max-width: 1023px)" }, (c) => {
      if (!c.conditions.ok) return;
      const stops = [];
      media.forEach((m, i) => {
        const slides = [...m.querySelectorAll(".a-slide")], shift = +m.dataset.parallax || -14, wide = m.classList.contains("is-landscape");
        if (slides.length > 1) {
          gsap.set(slides, { autoAlpha: 0, zIndex: 0 });
          gsap.set(slides[0], { autoAlpha: 1, zIndex: 1 });
          let n = 0;
          const next = () => {
            const a = slides[n]; n = (n + 1) % slides.length; const b = slides[n];
            gsap.set(b, { zIndex: 2, autoAlpha: 0 }); gsap.set(a, { zIndex: 1 });
            gsap.timeline().to(b, { autoAlpha: 1, duration: 0.9, ease: "osmoFade" }).set(a, { autoAlpha: 0, zIndex: 0 }).set(b, { zIndex: 1 });
          };
          const t = setTimeout(() => { const iv = setInterval(next, 2500); stops.push(() => clearInterval(iv)); }, i * 700);
          stops.push(() => clearTimeout(t));
        }
        if (shift) gsap.fromTo(m, { yPercent: c.conditions.phone ? (wide ? 18 : 12) : 0 }, { yPercent: shift, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 0.8 } });
      });
      return () => stops.forEach((s) => s());
    });
  });
})();
