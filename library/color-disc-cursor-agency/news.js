// News — page number buttons: the chosen page turns into a white circle (the list is a placeholder so it stays as is)
(() => {
  const pages = [...document.querySelectorAll(".nw__pages button")];
  pages.forEach((b) => b.addEventListener("click", () => pages.forEach((o) => {
    const on = o === b;
    o.classList.toggle("is-active", on);
    if (on) o.setAttribute("aria-current", "page"); else o.removeAttribute("aria-current");
  })));
})();
