// Interaction shared across several pages: scrolling down past 50px hides the top menu and leaves the hamburger (it comes back on scrolling up or within the top 20px), pressing the hamburger opens a small menu panel
(() => {
  const body = document.body;
  let last = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    if (y > 50 && y > last) body.classList.add("is-nav-hidden");
    else if (y < last || y <= 20) body.classList.remove("is-nav-hidden");
    last = Math.max(0, y);
  }, { passive: true });

  const burger = document.querySelector(".ms-burger"), menu = document.getElementById("ms-menu");
  if (burger && menu) {
    const set = (on) => { burger.classList.toggle("is-open", on); menu.classList.toggle("is-open", on); burger.setAttribute("aria-expanded", String(on)); };
    burger.addEventListener("click", (e) => { e.stopPropagation(); set(!menu.classList.contains("is-open")); });
    document.addEventListener("click", (e) => { if (!menu.contains(e.target)) set(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }
})();

// Legal notice in the footer row — opens a panel, closes with ×, an outside click or Esc
(() => {
  const dlg = document.getElementById("legal");
  if (!dlg?.showModal) return;
  document.querySelectorAll(".ms-foot__legal").forEach((a) => { a.addEventListener("click", () => dlg.showModal()); a.addEventListener("keydown", (e) => { if (e.key === "Enter") dlg.showModal(); }); });
  dlg.querySelector(".ms-legal__close")?.addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
})();
