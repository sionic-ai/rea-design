// One news item — the table-of-contents line for the subheading being read lights up
(() => {
  if (!window.ScrollTrigger) return;
  const links = [...document.querySelectorAll(".r-toc a")];
  links.forEach((a) => {
    const h = document.querySelector(a.getAttribute("href"));
    if (!h) return;
    ScrollTrigger.create({ trigger: h, start: "top 40%", endTrigger: "#q-collab", end: "top top", onToggle: (s) => { if (s.isActive) links.forEach((x) => x.classList.toggle("is-on", x === a)); } });
  });
})();
