// First page — tour-event tab and model-house background switch
(() => {
  // Tour tabs: All · Open · Closed — only the pressed tab darkens and only matching cards remain
  const tabs = document.querySelectorAll(".th-event__tabs li");
  const cards = document.querySelectorAll(".th-event__grid .th-card2");
  tabs.forEach((t) => t.addEventListener("click", () => {
    tabs.forEach((x) => x.classList.toggle("is-active", x === t));
    cards.forEach((c) => (c.hidden = t.dataset.tab !== "all" && c.dataset.state !== t.dataset.tab));
    ScrollTrigger.refresh();
  }));

  // Model home: original TopMh — at 1025 and up, hovering a name row puts :hovered on the panel, and only that home’s background gets is-active. On leave, turn all off unless over another row
  const box = document.querySelector(".th-mh");
  if (!box) return;
  const links = [...box.querySelectorAll(".th-mh__link")];
  const bgs = [...box.querySelectorAll(".th-mh__bg")];
  const mm = matchMedia("(min-width: 1025px)");
  const on = (a) => {
    if (!mm.matches) return;
    links.forEach((l) => l.classList.toggle("is-hovered", l === a));
    box.classList.add("is-hovered");
    bgs.forEach((b) => b.classList.toggle("is-active", b.dataset.mh === a.dataset.mh));
  };
  const off = (a) => {
    a.classList.remove("is-hovered");
    if (links.some((l) => l.matches(":hover"))) return;
    bgs.forEach((b) => b.classList.remove("is-active"));
    box.classList.remove("is-hovered");
  };
  links.forEach((a) => {
    a.addEventListener("mouseenter", () => on(a));
    a.addEventListener("mouseleave", () => off(a));
  });
})();
