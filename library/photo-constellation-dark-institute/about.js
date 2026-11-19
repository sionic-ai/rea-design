// About: pressing an expert or place cell slides a right drawer in over 1s and the backdrop darkens to .8
(() => {
  const drawer = document.querySelector(".gl-drawer");
  if (!drawer) return;
  const set = (on) => { drawer.classList.toggle("show", on); drawer.setAttribute("aria-hidden", String(!on)); document.documentElement.classList.toggle("small-modal-open", on); on ? window.glLenis?.stop() : window.glLenis?.start(); };
  document.querySelectorAll("[data-drawer]").forEach((b) => b.addEventListener("click", () => {
    drawer.querySelector(".gl-drawer-body > strong").textContent = b.querySelector("strong").textContent;
    drawer.querySelector(".gl-drawer-body > small").textContent = b.querySelector("small").textContent;
    set(true);
  }));
  drawer.querySelector(".gl-drawer-close").addEventListener("click", () => set(false));
  drawer.addEventListener("click", (e) => e.target === drawer && set(false));
  addEventListener("keydown", (e) => e.key === "Escape" && set(false));
})();
