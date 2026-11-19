// Product row header: while the card stays pinned to the screen, the inner photo flows up only by the overflow amount (original start top top → end bottom bottom)
(() => {
  // Like the original, video gets its src 50px before the screen (10% visible) — muted, autoplay, loop
  const lazy = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const v = e.target;
    v.src = v.dataset.src;
    v.removeAttribute("data-src");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) v.removeAttribute("autoplay");
    lazy.unobserve(v);
  }), { rootMargin: "50px", threshold: 0.1 });
  document.querySelectorAll("video[data-src]").forEach((v) => lazy.observe(v));

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const wrap = document.querySelector(".pd-mv-wrap");
  const ph = document.querySelector(".pd-mv__ph");
  const card = document.querySelector(".pd-mv__card");
  gsap.to(ph, {
    y: () => -(ph.offsetHeight * 1.08 - card.clientHeight),
    ease: "none",
    scrollTrigger: { trigger: wrap, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
  });
})();
