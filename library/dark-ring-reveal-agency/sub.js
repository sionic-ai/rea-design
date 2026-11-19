// Sub-page-only motion — hover photo swap on the field list, two photo rows flowing staggered (original horizontalRowSliding: even rows go left · odd rows go right,
// While the section passes from bottom to top of the screen, by the overflowing width, the phone at .5x), closing photo parallax (130% height from −15% to +15% · a dark veil 0 to 1 as it crosses the center).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".nv-lh").forEach((sec) => {
    const imgs = [...sec.querySelectorAll(".nv-lh__imgs .wf-img")], links = [...sec.querySelectorAll("[data-img]")];
    links.forEach((a) => a.addEventListener("mouseenter", () => { const i = +a.dataset.img; imgs.forEach((im, k) => im.classList.toggle("is-on", k === i)); links.forEach((l) => l.classList.toggle("is-on", l === a)); }));
  });
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const made = [];
    document.querySelectorAll(".nv-rows").forEach((sec) => {
      const rows = [...sec.querySelectorAll(".nv-rows__row")];
      const over = () => Math.min(...rows.map((r) => r.scrollWidth - sec.clientWidth)) * (innerWidth < 768 ? 0.5 : 1);
      rows.forEach((r, i) => made.push(gsap.fromTo(r, { x: () => (i % 2 === 0 ? 0 : -over()) }, { x: () => (i % 2 === 0 ? -over() : 0), ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } })));
    });
    document.querySelectorAll(".nv-para").forEach((sec) => {
      const img = sec.querySelector("[data-para]");
      if (img) made.push(gsap.fromTo(img, { yPercent: -15 }, { yPercent: 15, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true } }));
      made.push(ScrollTrigger.create({ trigger: sec, start: "top center", end: "bottom center", scrub: true, onUpdate: (s) => sec.style.setProperty("--fx-progress", s.progress.toFixed(3)) }));
    });
    return () => made.forEach((m) => { m.scrollTrigger?.kill(); m.kill?.(); });
  });
  if (reduce) document.querySelectorAll(".nv-para").forEach((s) => s.style.setProperty("--fx-progress", "0.5"));
})();
