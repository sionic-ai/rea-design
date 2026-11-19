// Service list: the left index bolds (darkens) the service currently visible, and clicking slides to it. On phones a sticky picker box (collapse 750ms outExpo).
(() => {
  const { lenis, fold } = window.CS;
  const links = [...document.querySelectorAll(".sv-nav__in a")];
  const items = [...document.querySelectorAll(".sv-item")];
  const go = (el) => (lenis ? lenis.scrollTo(el, { offset: -(innerHeight / 2) + el.offsetHeight / 2 }) : el.scrollIntoView({ block: "center" }));
  items.forEach((it, i) => ScrollTrigger.create({ trigger: it, start: "top center", end: "bottom center", onToggle: (s) => s.isActive && links.forEach((a, j) => a.classList.toggle("is-on", j === i)) }));
  links.forEach((a, i) => a.addEventListener("click", (e) => { e.preventDefault(); go(items[i]); }));

  const pick = document.querySelector(".sv-picker");
  const menu = pick.querySelector(".sv-picker__menu");
  pick.querySelector(".sv-picker__btn").addEventListener("click", () => { const open = !pick.classList.contains("is-open"); pick.classList.toggle("is-open", open); fold(menu, open); });
  menu.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    pick.classList.remove("is-open"); fold(menu, false);
    pick.querySelector(".sv-picker__btn span").textContent = b.textContent;
    go(document.getElementById(b.dataset.go));
  }));
})();
