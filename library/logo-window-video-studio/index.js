// First page — hero title lines (raised by the loader, or here when arriving via transition) and partner logos follow the raised line height
(() => {
  const { E, on, isMobile } = window.pSite;
  const D = document;
  const fig = D.querySelector(".p-hero__figure"), title = D.querySelector(".p-hero__title");

  on("split", () => {
    if (!title) return;
    SplitText.create(title, { type: "lines", mask: "lines", linesClass: "p-line" });
    gsap.set(title.querySelectorAll(".p-line"), { yPercent: 125, transformOrigin: "left bottom", willChange: "transform" });
  });
  // When arriving from another page — original Hero: --hero-entrance 0→1 (1s easeOut), title lines 1.5s expoOut at .1 intervals
  on("showPage", (first) => {
    if (first) return;
    gsap.fromTo(fig, { "--hero-entrance": 0, opacity: 0 }, { "--hero-entrance": 1, opacity: 1, duration: 1, ease: E.vt });
    gsap.to(title.querySelectorAll(".p-line"), { yPercent: 0, duration: 1.5, delay: 0.1, stagger: 0.1, ease: E.fe });
    gsap.set(".p-hero__scroll", { opacity: 1 });
  });

  // Partners: only the hovered row goes to 1 (.3s expoOut), on leave .7 (.3s easeOut), the left logo follows to that row’s height in .2s. On phones the row at the screen center lights up
  const items = [...D.querySelectorAll(".p-partner")], logos = [...D.querySelectorAll(".p-partner-logo")];
  const figure = D.querySelector(".p-partners__logo figure");
  if (!items.length || !figure) return;
  const tweens = [];
  const setActive = (i) => logos.forEach((l, j) => l.classList.toggle("is-active", j === i));
  if (isMobile()) {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(+e.target.dataset.index)), { rootMargin: "-50% 0px -49% 0px" });
    items.forEach((it) => io.observe(it));
    return;
  }
  const qTop = gsap.quickTo(figure, "top", { duration: 0.2, ease: E.vt });
  items.forEach((it, i) => {
    it.addEventListener("mouseenter", () => {
      setActive(i);
      tweens[i]?.kill();
      tweens[i] = gsap.to(it, { opacity: 1, duration: 0.3, ease: E.fe });
      qTop(it.getBoundingClientRect().top - items[0].getBoundingClientRect().top);
    });
    it.addEventListener("mouseleave", () => {
      const t = tweens[i], out = () => (tweens[i] = gsap.to(it, { opacity: 0.7, duration: 0.3, ease: E.vt }));
      t && t.isActive() ? t.then(out) : out();
    });
  });
})();
