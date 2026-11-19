// Store list — lights only the store passing the screen center (the original hides the list itself at 767px and below)
(() => {
  if (innerWidth <= 767) return;
  const links = [...document.querySelectorAll(".cc-shop-list__link")];
  const on = (link) => { links.forEach((l) => l.classList.remove("is-inview")); link.classList.add("is-inview"); };
  document.querySelectorAll(".cc-shop-detail").forEach((d, i) => {
    const link = links[i];
    if (!link) return;
    ScrollTrigger.create({
      trigger: d, start: "top center", end: "bottom center",
      onEnter: () => on(link), onEnterBack: () => on(link), onLeave: () => link.classList.remove("is-inview"),
    });
  });
  // Going to a shop within the same page glides without the transition curtain (travels less by the header height)
  links.forEach((l) => l.addEventListener("click", (e) => {
    const t = document.querySelector(l.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    const y = t.getBoundingClientRect().top + scrollY - document.querySelector(".cc-header").offsetHeight;
    window.ccLenis ? window.ccLenis.scrollTo(y, { duration: 1 }) : scrollTo({ top: y, behavior: "smooth" });
  }));
})();
