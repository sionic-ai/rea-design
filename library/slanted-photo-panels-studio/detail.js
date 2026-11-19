(() => {
  // Name, intro and photo lines turn on together after .35s over .5s power1.inOut (values measured by opening the original detail — that page’s code isn’t in the archive)
  const els = [document.querySelector(".uv-detail__head"), document.querySelector(".uv-detail__media"), document.querySelector(".uv-detail__next")].filter(Boolean);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.to(els, { opacity: 1, ease: "power1.inOut", duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.35 });
})();
