// Terms of use — at 959 and below, the three-line button opens the blue drawer in .3s
(() => {
  const btn = document.querySelector(".tm-drawer-btn");
  btn.addEventListener("click", () => {
    const on = document.body.classList.toggle("is-drawer-active");
    btn.setAttribute("aria-expanded", on);
    btn.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
  });
  // Footer at 959 and below: rows with children expand on tap
  document.querySelectorAll(".tm-footer .row p.tit").forEach((t) => t.addEventListener("click", () => {
    if (matchMedia("(max-width: 959px)").matches) t.closest(".row").classList.toggle("is-open");
  }));
})();
