// Table-of-contents page — TOC links scroll via lenis to that section (original anchors offset -40), and when the section being read passes 40% of the screen, its dot grows (nothing at first)
(() => {
  const { lenis } = window.dSite;
  const links = [...document.querySelectorAll(".p-nav__link")];
  links.forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); lenis.scrollTo(a.getAttribute("href"), { offset: -40 }); }));
  links.forEach((a) => {
    const sec = document.querySelector(a.getAttribute("href"));
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: "top 40%", end: "bottom 40%", onToggle: (s) => s.isActive && links.forEach((l) => l.classList.toggle("is-current", l === a)) });
  });
})();
