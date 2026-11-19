// Shared by Brand — Lenis 1.0.19 same as the original (duration 1.2 · curve min(1, 1.001 − 2^(−10t)) · touch uses native scroll), current page menu, phone menu window
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothTouch: false });
    window.lenis = lenis;
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  // One notification keeps the News menu at its current spot, like the original
  const page = document.body.dataset.page === "article" ? "news" : document.body.dataset.page;
  document.querySelectorAll(".sp-nav a[data-page]").forEach((a) => { if (a.dataset.page === page) a.setAttribute("aria-current", "page"); });

  const menu = document.querySelector(".sp-menu");
  const burger = document.querySelector(".sp-burger");
  if (menu && burger) {
    const open = () => {
      menu.showModal();
      burger.setAttribute("aria-expanded", "true");
      requestAnimationFrame(() => menu.classList.add("is-ready"));
    };
    const close = () => {
      menu.classList.remove("is-ready");
      burger.setAttribute("aria-expanded", "false");
      setTimeout(() => menu.close(), reduce ? 0 : 400);
    };
    burger.addEventListener("click", open);
    menu.querySelector(".sp-menu__close").addEventListener("click", close);
    menu.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  }
})();
