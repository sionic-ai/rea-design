(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelector("[data-iv] .swiper-wrapper").innerHTML = window.tySlides(window.TY_INTERVIEWS);
  window.tySwiper(document.querySelector("[data-iv]"));

  // TOC: on press it scrolls smoothly to 100px above the heading, and while scrolling it lights the dot on the last heading passed (150px ahead)
  const list = document.querySelector("[data-anchor-list]");
  const links = [...list.querySelectorAll("a")];
  const mark = (k) => list.querySelectorAll("li").forEach((li, i) => li.classList.toggle("is-active", i === k));
  links.forEach((a, i) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute("href"));
    scrollTo({ top: t.getBoundingClientRect().top + scrollY - 100, behavior: reduce ? "auto" : "smooth" });
    mark(i);
  }));
  let ticking = false;
  const spy = () => {
    const y = scrollY + 150;
    let k = 0;
    links.forEach((a, i) => { const t = document.querySelector(a.getAttribute("href")); if (y >= t.getBoundingClientRect().top + scrollY) k = i; });
    mark(k);
  };
  addEventListener("scroll", () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { spy(); ticking = false; }); }, { passive: true });
  spy();
})();
