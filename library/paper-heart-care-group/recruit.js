// Division intro: moves the current-position marker in the side menu to match the division passing through the screen center (original top center → bottom center)
(() => {
  const links = document.querySelectorAll(".js-nav-link");
  const mark = (id) => links.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + id));
  document.querySelectorAll(".js-nav-target").forEach((t) => {
    ScrollTrigger.create({ trigger: t, start: "top center", end: "bottom center", onEnter: () => mark(t.id), onEnterBack: () => mark(t.id) });
  });
})();
