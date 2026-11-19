// Job tabs — swap ”Job details” and ”Application” right away. The header and bottom apply buttons open the Application tab and scroll down to the tab row
(() => {
  const tabs = [...document.querySelectorAll(".bx-jd__tabs button")];
  const panes = [...document.querySelectorAll(".bx-jd__pane")];
  if (!tabs.length) return;
  const show = (i) => {
    tabs.forEach((t, j) => t.setAttribute("aria-selected", String(i === j)));
    panes.forEach((p, j) => (p.hidden = i !== j));
  };
  tabs.forEach((t, i) => t.addEventListener("click", () => show(i)));
  document.querySelectorAll("[data-tab]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    show(+a.dataset.tab);
    const bar = document.querySelector(".bx-jd__tabs");
    scrollTo({ top: bar.getBoundingClientRect().top + scrollY - 90, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }));
})();
