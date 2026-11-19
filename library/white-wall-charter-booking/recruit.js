// Careers — left section navigation: shows the current section, and a click scrolls to it with Lenis
(() => {
  const links = [...document.querySelectorAll(".vl-job__nav a")];
  const mark = (id) => links.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === `#${id}`)));
  links.forEach((a) => {
    const sec = document.querySelector(a.getAttribute("href"));
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (st) => st.isActive && mark(sec.id) });
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.lenis) window.lenis.scrollTo(sec, { offset: -100 });
      else sec.scrollIntoView({ behavior: "smooth" });
    });
  });
})();
