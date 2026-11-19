// News post: the back-to-top button turns on in .4s (jQuery fadeIn default) after scrolling down past 100px, and stops 10px above the footer when it reaches it.
// The three-line button in the phone frame opens the menu panel in .4s. Back to top with .5s swing (jQuery animate default curve)
(() => {
  const top = document.querySelector(".ku-pagetop"), foot = document.querySelector(".ku-footer");
  const swing = (p) => 0.5 - Math.cos(p * Math.PI) / 2;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fade = (show) => {
    if (!top || top.dataset.shown === String(show)) return;
    top.dataset.shown = String(show);
    top.style.display = "flex";
    const from = +getComputedStyle(top).opacity, t0 = performance.now();
    cancelAnimationFrame(top._raf);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / (reduce ? 1 : 400));
      top.style.opacity = from + ((show ? 1 : 0) - from) * swing(p);
      if (p < 1) top._raf = requestAnimationFrame(step);
      else if (!show) top.style.display = "none";
    };
    top._raf = requestAnimationFrame(step);
  };
  const onScroll = () => {
    fade(scrollY > 100);
    if (!top || !foot) return;
    const fh = foot.offsetHeight, near = document.documentElement.scrollHeight - (innerHeight + scrollY) <= fh;
    Object.assign(top.style, near ? { position: "absolute", bottom: `${fh + 10}px` } : { position: "fixed", bottom: "" });
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  top?.addEventListener("click", (e) => {
    e.preventDefault();
    const y0 = scrollY, t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / (reduce ? 1 : 500));
      scrollTo(0, y0 * (1 - swing(p)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  const btn = document.querySelector(".ku-sp-btn--menu"), menu = document.getElementById("ku-menu");
  btn?.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    menu.style.height = open ? `${menu.scrollHeight}px` : "0px";
  });
  // Search — the original is a fancybox popup (.25s fade). Close it with the overlay, the close button or Esc
  const pop = document.getElementById("ku-search");
  const openSearch = (on) => {
    if (!pop) return;
    if (on) { pop.classList.add("is-open"); pop.setAttribute("aria-hidden", "false"); requestAnimationFrame(() => pop.classList.add("is-shown")); pop.querySelector("input")?.focus(); }
    else { pop.classList.remove("is-shown"); pop.setAttribute("aria-hidden", "true"); setTimeout(() => pop.classList.remove("is-open"), 250); }
  };
  document.querySelector(".ku-search-link")?.addEventListener("click", (e) => { e.preventDefault(); openSearch(true); });
  pop?.querySelectorAll("[data-close]").forEach((n) => n.addEventListener("click", () => openSearch(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") openSearch(false); });

  matchMedia("(max-width: 768px)").addEventListener("change", () => { menu.style.height = ""; btn?.setAttribute("aria-expanded", "false"); });
})();
