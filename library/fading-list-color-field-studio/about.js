// About: send fixed table-of-contents links with Lenis to that section (24px above), and mark with aria-current the section that has passed the line at 25% of the screen now
(() => {
  const nav = document.querySelector(".ab-side");
  if (!nav) return;
  const links = [...nav.querySelectorAll("a")];
  links.forEach((a) => a.addEventListener("click", (e) => {
    const sec = document.querySelector(a.getAttribute("href"));
    if (!sec) return;
    e.preventDefault();
    const y = sec.getBoundingClientRect().top + scrollY - 24;
    AM.lenis ? AM.lenis.scrollTo(y) : scrollTo({ top: y, behavior: AM.reduce ? "auto" : "smooth" });
  }));
  const mark = () => {
    const line = innerHeight * 0.25;
    let id = "";
    links.forEach((a) => { const s = document.querySelector(a.getAttribute("href")); if (s && s.getBoundingClientRect().top <= line) id = a.getAttribute("href"); });
    links.forEach((a) => (a.getAttribute("href") === id ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
  };
  addEventListener("scroll", mark, { passive: true });
  mark();
})();
