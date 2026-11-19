// About — in the left table of contents, the section currently in view is darkened (original Company: each section’s ScrollTrigger start "top center-=50" · end "bottom center-=50" toggleClass),
// History is collapsed and expanded via View all (expanding calls ScrollTrigger.refresh)
(() => {
  const links = [...document.querySelectorAll(".th-co__menu a[href^='#']")];
  links.forEach((a) => {
    const sec = document.querySelector(a.getAttribute("href"));
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: "top center-=50", end: "bottom center-=50", toggleClass: { targets: a, className: "is-inview" } });
  });
  const list = document.querySelector(".th-co__years"), more = document.querySelector(".th-co__more"), moreBtn = document.querySelector(".th-co__more-btn");
  if (list && more && moreBtn) moreBtn.addEventListener("click", () => {
    list.classList.remove("is-collapsed");
    more.hidden = true;
    ScrollTrigger.refresh();
  });
})();
