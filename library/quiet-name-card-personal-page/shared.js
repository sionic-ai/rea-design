// Shared: Email button — copies the address and shows a ”Copied” notice above (hides 1 second after the .25s rise ends)
(() => {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const toast = btn.closest(".ll-copy")?.querySelector(".ll-toast");
    btn.addEventListener("click", (e) => {
      navigator.clipboard?.writeText(btn.dataset.copy).catch(() => {});
      e.currentTarget.blur();
      if (!toast) return;
      toast.classList.remove("is-on", "ll-reveal");
      void toast.offsetWidth;
      toast.classList.add("is-on", "ll-reveal");
    });
    toast?.addEventListener("animationend", () => {
      clearTimeout(toast._t);
      toast._t = setTimeout(() => toast.classList.remove("is-on", "ll-reveal"), 1000);
    });
    if (toast && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      btn.addEventListener("click", () => { clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove("is-on", "ll-reveal"), 1000); });
    }
  });
})();
