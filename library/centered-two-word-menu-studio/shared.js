// Interaction shared by every page: when going to one of our pages the body fades (the header line stays so the pressed menu moves to center), and the sub-page header inverts (difference blend once scrolled past 80% of window height).
(() => {
  const KEY = "ox-came-from";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const content = document.querySelector(".ox-content");

  if (content && sessionStorage.getItem(KEY) && !reduce) {
    sessionStorage.removeItem(KEY);
    content.classList.add("is-arriving");
    content.addEventListener("animationend", () => content.classList.remove("is-arriving"), { once: true });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || !content || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(?:[?#].*)?$/.test(href)) return;
    e.preventDefault();
    sessionStorage.setItem(KEY, location.pathname);
    if (reduce) { location.href = href; return; }
    content.classList.add("is-leaving");
    setTimeout(() => (location.href = href), 1000);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) content?.classList.remove("is-leaving"); });

  // Only outside the first page and work list: once past 80% of window height, the header line is blended with difference so it stays readable over photos (768px and up)
  const nav = document.querySelector(".ox-nav[data-contrast]");
  if (nav) {
    const wide = matchMedia("(min-width: 768px)");
    const tick = () => nav.classList.toggle("is-contrast", wide.matches && scrollY > innerHeight * 0.8);
    addEventListener("scroll", tick, { passive: true });
    tick();
  }
})();
