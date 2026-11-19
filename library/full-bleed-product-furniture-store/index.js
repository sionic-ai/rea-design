// Hotspot — press to open that product window and close the others (the original shoppable-image’s ”open modal”). Clicking outside or pressing Esc closes it.
(() => {
  const spots = [...document.querySelectorAll(".kh-spot")];
  const close = () => spots.forEach((s) => { s.classList.remove("is-open"); s.setAttribute("aria-expanded", "false"); });
  spots.forEach((s) => {
    s.setAttribute("aria-expanded", "false");
    s.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !s.classList.contains("is-open");
      close();
      if (open) { s.classList.add("is-open"); s.setAttribute("aria-expanded", "true"); }
    });
  });
  document.addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
