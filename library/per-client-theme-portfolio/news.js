// While the year header is stuck 40px from the top, data-stuck is set (underline on), and when it is pushed up past that, data-after-stuck is set (year text dims)
(() => {
  const heads = [...document.querySelectorAll(".dt-group__header")];
  if (!heads.length) return;
  const stick = parseFloat(getComputedStyle(heads[0]).top) || 0;
  const sync = () => heads.forEach((h) => {
    const top = Math.round(h.getBoundingClientRect().top);
    h.toggleAttribute("data-stuck", top === stick);
    h.toggleAttribute("data-after-stuck", top < stick);
  });
  addEventListener("scroll", sync, { passive: true });
  addEventListener("resize", sync);
})();
