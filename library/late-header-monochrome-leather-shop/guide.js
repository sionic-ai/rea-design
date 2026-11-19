// Shopping guide tabs: only the chosen contents show (.5s fade), and each switch scrolls to the top of the guide over 1s.
(() => {
  const root = document.querySelector(".shopping-guide");
  const buttons = root.querySelectorAll(".nav-button");
  const panels = root.querySelectorAll(".shopping-guide__content");
  buttons.forEach((btn) =>
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.setAttribute("aria-selected", "false"));
      panels.forEach((p) => p.setAttribute("aria-hidden", "true"));
      btn.setAttribute("aria-selected", "true");
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      panel && panel.setAttribute("aria-hidden", "false");
      window.MT.lenis && window.MT.lenis.resize();
      window.MT.scrollTo(root, { duration: 1 });
    })
  );
})();
