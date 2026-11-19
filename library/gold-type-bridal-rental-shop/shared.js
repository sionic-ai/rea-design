// Across all pages — menu and search panels and the large Dress/Kimono menu (original Alpine x-show + x-transition defaults), phone header background and bottom booking bar (after 800px),
// Text block rise ([data-inview]) · photo settle ([data-image-inview]), news strip swiper
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // x-transition: when shown, from transparent and .95 scale over 150ms, when hidden, 75ms
  // Even after hiding, the end state (transparent·.95 scale) is kept — Alpine also holds that state until shown again
  const timers = new WeakMap();
  const show = (el) => {
    if (!el) return;
    clearTimeout(timers.get(el));
    if (!el.hidden) { el.classList.remove("is-leave"); return; }
    el.classList.remove("is-leave");
    el.hidden = false;
    if (reduce) return;
    el.classList.add("is-from");
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove("is-from")));
  };
  const hide = (el) => {
    if (!el || el.hidden) return;
    if (reduce) { el.hidden = true; return; }
    // Like Alpine, hide the moment the leave transition ends (75ms later if there is no transition)
    const done = () => { clearTimeout(timers.get(el)); el.removeEventListener("transitionend", done); if (el.classList.contains("is-leave")) el.hidden = true; };
    el.classList.add("is-leave");
    el.addEventListener("transitionend", done);
    timers.set(el, setTimeout(done, 90));
  };
  window.rdShow = show;
  window.rdHide = hide;

  const menu = document.querySelector("#rd-menu");
  const search = document.querySelector("#rd-search");
  const menuBtn = document.querySelector(".rd-sq--menu");
  const setMenu = (open) => {
    if (open) { show(menu); hide(search); hide(menuBtn); } else { hide(menu); show(menuBtn); }
    menuBtn?.setAttribute("aria-expanded", String(open));
  };
  menuBtn?.addEventListener("click", () => setMenu(true));
  menu?.querySelector(".rd-panel__close")?.addEventListener("click", () => setMenu(false));
  document.querySelector(".rd-sp-icon--search")?.addEventListener("click", () => { show(search); setMenu(false); });
  search?.querySelector(".rd-panel__close")?.addEventListener("click", () => hide(search));

  const megas = [...document.querySelectorAll(".rd-mega")];
  document.querySelectorAll("[data-mega]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.mega);
      const open = target.hidden;
      megas.forEach((m) => (m === target && open ? show(m) : hide(m)));
      document.querySelectorAll("[data-mega]").forEach((b) => b.setAttribute("aria-expanded", String(b === btn && open)));
    });
  });
  addEventListener("keydown", (e) => {
    // Like the original, buttons made as a (MENU, DRESS, KIMONO) can also be pressed with Enter and Space
    const fake = e.target.closest?.('a[role="button"]');
    if (fake && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); fake.click(); return; }
    if (e.key !== "Escape") return;
    setMenu(false); hide(search); megas.forEach(hide);
  });

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll("[data-image-inview]").forEach((el) => {
        gsap.from(el, { scaleX: 1.1, scaleY: 1.1, opacity: 0, duration: 1, scrollTrigger: { trigger: el, start: "top bottom", end: "bottom center" } });
      });
    });
    mm.add("(max-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll("[data-inview]").forEach((el) => {
        gsap.from(el, { opacity: 0, y: "50px", duration: 1, scrollTrigger: { trigger: el, start: "top bottom-=100", end: "bottom center" } });
      });
      const bar = document.querySelector(".rd-bottom");
      if (bar) gsap.to(bar, { opacity: 1, bottom: 0, scrollTrigger: { trigger: "body", start: "+=800", end: "bottom-=1200", toggleActions: "play reverse play reverse" } });
      const bg = document.querySelector(".rd-headbg");
      if (bg) gsap.to(bg, { opacity: 1, scrollTrigger: { trigger: "body", start: "800", toggleActions: "play none none reverse" } });
    });
    mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll("[data-inview]").forEach((el) => {
        gsap.from(el, { opacity: 0, y: "50px", duration: 1, scrollTrigger: { trigger: el, start: "top center", end: "bottom center" } });
      });
    });
  }

  if (window.Swiper) {
    document.querySelectorAll("[data-blog-swiper]").forEach((el) => {
      const key = el.getAttribute("data-blog-swiper");
      new Swiper(el, {
        slidesPerView: 1.3,
        spaceBetween: 26,
        navigation: { nextEl: `.${key}-next`, prevEl: `.${key}-prev` },
        pagination: { el: `.${key}-progress`, type: "progressbar" },
        breakpoints: { 768: { slidesPerView: 4 } },
      });
    });
  }
})();
