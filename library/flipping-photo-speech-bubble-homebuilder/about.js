// About page: marks the current reading spot in the table of contents (original anchor_link li.active).
(() => {
  const links = [...document.querySelectorAll(".a-toc a")];
  links.forEach((a) => {
    const sec = document.querySelector(a.getAttribute("href"));
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: "top 40%", end: "bottom 40%",
      onToggle: (st) => st.isActive && links.forEach((x) => x.parentElement.classList.toggle("is-current", x === a)),
    });
  });
})();
