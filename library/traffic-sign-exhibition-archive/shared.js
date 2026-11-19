// Same handles on every page: the bottom-right ↑ button toggles the section number column (the original switches display directly), and MENU opens the red panel
(() => {
  const toggle = document.getElementById("navToggle");
  const sections = document.getElementById("navSections");
  toggle?.addEventListener("click", () => {
    sections.style.display = sections.style.display === "block" ? "none" : "block";
  });

  const menu = document.querySelector(".sp-menu");
  document.querySelectorAll(".menu-toggle").forEach((b) => b.addEventListener("click", () => menu?.classList.add("is-open")));
  document.querySelector(".sp-menu__close")?.addEventListener("click", () => menu?.classList.remove("is-open"));
  menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.classList.remove("is-open")));
})();
