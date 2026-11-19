// First page: hero·menu (phone)·contact photo Splide fade (original settings as is). The gallery View All round button floats up once it enters 20% inside the right·bottom of the screen
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fade = (sel, o) => { const el = document.querySelector(sel); if (!el || !window.Splide) return null; const s = new Splide(el, { arrows: false, pagination: false, type: "fade", rewind: true, pauseOnFocus: false, pauseOnHover: false, ...o, ...(reduce && { autoplay: false, speed: 0 }) }); return s; };
  fade("[data-kv-slide]", { autoplay: true, interval: 3500, speed: 3000, drag: false })?.mount();
  fade("[data-contact-slide]", { autoplay: true, interval: 3000, speed: 2000, drag: false })?.mount();
  const menu = fade("[data-menu-slide]", { autoplay: true, interval: 3500, speed: 3000, drag: true });
  if (menu) {
    const wrap = document.querySelector(".kn-menu__sp"), now = wrap.querySelector("[data-now]"), total = wrap.querySelector("[data-total]");
    menu.on("mounted move", () => { now.textContent = String(menu.index + 1).padStart(2); total.textContent = String(menu.length).padStart(2); });
    wrap.querySelector("[data-prev]")?.addEventListener("click", () => menu.go("<"));
    wrap.querySelector("[data-next]")?.addEventListener("click", () => menu.go(">"));
    menu.mount();
  }
  const more = document.querySelector("[data-more]");
  if (more) new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("is-active")), { rootMargin: "0px -20% -20% 0px" }).observe(more);
})();
