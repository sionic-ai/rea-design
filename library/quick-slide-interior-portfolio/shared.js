// Shared by all pages: header-line board placement (200px), phone menu popup, scroll-to-top arrow.
// Header hiding is handled by the hide-on-scroll part, and the orange dot cursor by the grow-dot-cursor part (data-fx on html).
(() => {
  const head = document.querySelector(".wc-head");
  // The original lays the panel based on whether the previous scroll position passed 200px — including being laid one tempo late
  let prev = scrollY;
  const solid = () => {
    if (head) head.classList.toggle("is-solid", prev > 200);
    prev = scrollY;
  };
  addEventListener("scroll", solid, { passive: true });

  const pop = document.querySelector(".wc-pop");
  const openBtn = document.querySelector(".wc-burger");
  const closeBtn = pop && pop.querySelector(".wc-pop__close");
  const setPop = (open) => {
    if (!pop) return;
    pop.classList.toggle("is-open", open);
    pop.setAttribute("aria-hidden", open ? "false" : "true");
    if (openBtn) openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.documentElement.style.overflow = open ? "hidden" : "";
  };
  if (openBtn) openBtn.addEventListener("click", () => setPop(true));
  if (closeBtn) closeBtn.addEventListener("click", () => setPop(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setPop(false); });

  // Back to top — the original Brand uses window smooth scroll, instant if reduced motion is set
  document.querySelectorAll("[data-to-top]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      scrollTo({ top: 0, left: 0, behavior: reduce ? "auto" : "smooth" });
    });
  });
})();
