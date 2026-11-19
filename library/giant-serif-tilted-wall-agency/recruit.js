// The B&W photo turns to color when it enters the screen (original data-inview: rootMargin bottom -10% · threshold .1)
AD.page("recruit", (main) => {
  const els = main.querySelectorAll("[data-inview]");
  if (AD.reduced) { els.forEach((el) => el.classList.add("is-inview")); return; }
  const io = AD.observe(new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-inview"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }));
  els.forEach((el) => io.observe(el));
});
