// On phones, open the number card grid with ”See more” — the open height is measured beforehand and css moves the height in .6s. Wide screens have no button
(() => {
  const wraps = [...document.querySelectorAll(".js-more")];
  const measure = (wrap) => {
    const was = wrap.style.height;
    wrap.style.height = "auto";
    wrap.style.setProperty("--open-height", `${wrap.scrollHeight}px`);
    wrap.style.height = was;
  };
  wraps.forEach((wrap) => {
    const btn = wrap.querySelector(".js-more-trigger");
    if (!btn) return;
    measure(wrap);
    btn.addEventListener("click", () => {
      const open = wrap.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      // Opening and closing shifts the sections below — after the height move ends, remeasure the scroll-effect spots
      setTimeout(() => window.ScrollTrigger?.refresh(), 650);
    });
  });
  let wait = 0;
  addEventListener("resize", () => { clearTimeout(wait); wait = setTimeout(() => wraps.forEach(measure), 400); });
  document.fonts?.ready.then(() => wraps.forEach(measure));
})();
