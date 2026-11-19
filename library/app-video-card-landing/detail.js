// Career detail: past 200px of scrolling, the right of the header turns into ‹Apply›.
(() => {
  const set = () => document.documentElement.classList.toggle("is-scrolled", scrollY > 200);
  addEventListener("scroll", set, { passive: true });
  set();
})();
