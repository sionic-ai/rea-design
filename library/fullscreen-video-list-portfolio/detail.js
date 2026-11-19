/* Work detail: fixed text over the image blends in when it becomes visible (42ms interval · 520~920ms). Menu collapse · frost clearing · video playback are handled in shared.js. */
(() => {
  const { scramble, reduce, CHARS } = window.AL;
  if (reduce) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const text = e.target.textContent;
    scramble(e.target, text, { from: text.replace(/\S/g, () => CHARS[(Math.random() * CHARS.length) | 0]) });
  }), { rootMargin: "0px 0px -6% 0px", threshold: 0.12 });
  document.querySelectorAll('[data-scramble="view"]').forEach((el) => io.observe(el));
})();
