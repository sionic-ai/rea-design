// List page — card photo paging (arrows, loops from end to start), filter drawer (Lenis stops when open, Esc closes)
(() => {
  document.querySelectorAll("[data-card-carousel]").forEach((box) => {
    const track = box.querySelector(".a-pcard__track");
    const n = track ? track.children.length : 0;
    if (n < 2) return;
    let i = 0;
    const go = (d) => { i = (i + d + n) % n; track.style.transform = `translateX(${-100 * i}%)`; };
    box.querySelector(".a-pcard__arrow--prev")?.addEventListener("click", (e) => { e.preventDefault(); go(-1); });
    box.querySelector(".a-pcard__arrow--next")?.addEventListener("click", (e) => { e.preventDefault(); go(1); });
  });
  const drawer = document.querySelector("[data-filter-drawer]");
  if (!drawer) return;
  const set = (open) => {
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    const lenis = window.aMotion?.lenis;
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  document.querySelectorAll("[data-filter-open]").forEach((b) => b.addEventListener("click", () => set(true)));
  drawer.querySelectorAll("[data-filter-close]").forEach((b) => b.addEventListener("click", () => set(false)));
  drawer.querySelector(".a-drawer__btn--reset")?.addEventListener("click", () => drawer.querySelectorAll("input[type=checkbox]").forEach((c) => { c.checked = false; }));
  addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
})();
