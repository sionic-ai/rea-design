// Product hub: clicking the category box at top right scrolls down to that category — original jQuery animate({ scrollTop }, 1000, "swing") as is (swing = sine.inOut).
(() => {
  document.querySelectorAll('.p-catmenu a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + scrollY;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return scrollTo(0, y);
    const pos = { y: scrollY };
    gsap.to(pos, { y, duration: 1, ease: "sine.inOut", overwrite: true, onUpdate: () => scrollTo(0, pos.y) });
  }));
})();
