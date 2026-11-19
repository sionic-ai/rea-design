// Product list: view buttons (3·4 columns on wide screens, 1·2 on phones) change the grid column count, and filter items open and close in .4s
(() => {
  const grid = document.querySelector("[data-grid]");
  document.querySelectorAll("[data-cols]").forEach((b) => b.addEventListener("click", () => {
    const wide = b.classList.contains("mm-view-wide");
    document.querySelectorAll(wide ? ".mm-view-wide" : ".mm-view-sp").forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    grid.style.setProperty(wide ? "--cols" : "--cols-sp", b.dataset.cols);
  }));

  // Phone — once the sorting row leaves the top of the screen (and before the footer), the bottom pill floats up
  const float = document.querySelector("[data-float]"), bar = document.querySelector(".mm-coll__bar"), foot = document.querySelector(".mm-footer");
  let barGone = false, footIn = false;
  const show = () => float.classList.toggle("is-on", barGone && !footIn);
  new IntersectionObserver(([e]) => { barGone = !e.isIntersecting && e.boundingClientRect.top < 0; show(); }).observe(bar);
  new IntersectionObserver(([e]) => { footIn = e.isIntersecting; show(); }).observe(foot);

  document.querySelectorAll("[data-filter]").forEach((f) => {
    const btn = f.querySelector(".mm-filter__btn"), body = f.querySelector(".mm-filter__body");
    btn.addEventListener("click", () => {
      const on = !f.classList.contains("is-open");
      body.style.height = `${body.scrollHeight}px`;
      requestAnimationFrame(() => { body.style.height = on ? `${body.firstElementChild.offsetHeight}px` : "0px"; });
      f.classList.toggle("is-open", on);
      btn.setAttribute("aria-expanded", String(on));
    });
  });
})();
