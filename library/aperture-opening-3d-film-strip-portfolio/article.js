/* Article: when the aperture opens the first print develops in 2.4s, and the prints below develop once each as they come into view. The title rises letter by letter from below */
(() => {
  const layer = document.querySelector(".hc-print-layer");
  if (!layer || !window.THREE) { hc.loader(); return; }
  const pr = hcPrint.create(layer);
  const title = document.querySelector(".jy-title");
  hc.loader(() => {
    pr.develop(0, 2.4, 0.1);
    if (!hc.reduce && title) gsap.from(title, { yPercent: 30, opacity: 0, duration: 1.1, ease: "expo.out", delay: 0.2 });
  });
  pr.items.forEach((it, i) => { if (i > 0) it.u.uDev.value = 0; });
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const i = pr.items.findIndex((it) => it.el === e.target);
    if (i > 0) pr.develop(i, 2.2);
    io.unobserve(e.target);
  }), { threshold: 0.35 });
  pr.items.forEach((it, i) => { if (i > 0) io.observe(it.el); });
})();
