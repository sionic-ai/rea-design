// About — original StickyNav: the section caught in the central 20% band of the screen (rootMargin -40%) is the current section, it shows when the first section is reached and hides when the list bottom passes above 40px from the wrapper bottom
(() => {
  const nav = document.querySelector(".sticky-nav");
  if (!nav) return;
  const links = [...nav.querySelectorAll(".sticky-nav__link")];
  const targets = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle("-is-current", a.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-40% 0px -40% 0px", threshold: 0 });
  targets.forEach((t) => io.observe(t));
  const wrap = nav.parentElement, list = nav.querySelector(".sticky-nav__list");
  const first = targets[0];
  const check = () => {
    const shown = first && first.getBoundingClientRect().top < innerHeight;
    const over = list.getBoundingClientRect().bottom > wrap.getBoundingClientRect().bottom - 40;
    nav.classList.toggle("-is-hidden", !shown || over);
  };
  addEventListener("scroll", check, { passive: true });
  addEventListener("resize", check);
  check();
})();
