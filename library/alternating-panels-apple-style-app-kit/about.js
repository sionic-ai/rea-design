// About — when the blue card’s number board enters the screen, each digit rolls from 0 to its number and stops (digits further right roll later and more)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-flip]").forEach((box) => {
    const cells = [...box.querySelectorAll("span")];
    const target = box.dataset.flip.split("");
    if (reduce) return;
    cells.forEach((c) => { c.textContent = "0"; });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      cells.forEach((c, i) => {
        const end = +target[i];
        const turns = 10 * (i + 1) + end;
        let n = 0;
        const tick = () => {
          c.textContent = String(n % 10);
          if (n++ < turns) setTimeout(tick, 28 + n * 0.9);
        };
        setTimeout(tick, i * 90);
      });
    }, { threshold: 0.6 });
    io.observe(box);
  });
})();
