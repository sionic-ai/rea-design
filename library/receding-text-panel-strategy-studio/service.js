// Workshop — when the workshop card section is on screen or has scrolled past, blur the photo panel behind it (original BlurTrigger: threshold 0)
(() => {
  const bg = document.querySelector(".fg-bg"), t = document.querySelector(".fg-blur-trigger");
  if (!bg || !t) return;
  new IntersectionObserver((es) => es.forEach((en) => {
    const past = scrollY > en.boundingClientRect.bottom;
    bg.classList.toggle("is-blurred", en.isIntersecting || past);
  }), { threshold: 0 }).observe(t);
})();
