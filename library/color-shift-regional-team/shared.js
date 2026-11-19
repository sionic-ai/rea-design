// All pages — menu open/close, marking that the hero has passed, section-head speech bubbles, in-page anchor scroll (500ms)
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mm = gsap.matchMedia();
  window.siteMM = mm;

  // Menu — pressing the pill turns on an ink-colored plate and the pill text swaps to Close. The close button or pressing outside also closes it
  const menu = $(".gl-menu");
  if (menu) {
    const btn = $(".gl-menu__btn", menu);
    const set = (open) => {
      menu.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    };
    btn.addEventListener("click", () => set(!menu.classList.contains("is-open")));
    $$(".gl-menu__close, .gl-menu__bg", menu).forEach((b) => b.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  }

  // Once the hero’s bottom edge passes above the screen, show it — the transparent pill gets a white background
  const fv = $("#fv");
  if (fv) ScrollTrigger.create({ trigger: fv, start: "bottom top", onEnter: () => document.body.classList.add("is-fv-end"), onLeaveBack: () => document.body.classList.remove("is-fv-end") });

  // Section-head speech bubble — pops out when the section’s top edge reaches 65% of the screen, and hides when scrolled back up
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    $$(".js-balloon").forEach((sec) => {
      ScrollTrigger.create({ trigger: sec, start: "top center+=15%", onEnter: () => sec.classList.add("is-balloon"), onLeaveBack: () => sec.classList.remove("is-balloon") });
    });
  });

  // In-page anchor — scrolls with 500ms easeInOutQuad like the original
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    const to = a && a.getAttribute("href").length > 1 && document.getElementById(a.getAttribute("href").slice(1));
    if (!to) return;
    e.preventDefault();
    const from = scrollY, dist = to.getBoundingClientRect().top;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return scrollTo(0, from + dist);
    let t0 = null;
    const step = (now) => {
      t0 ??= now;
      let t = Math.min(1, (now - t0) / 500);
      t = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      scrollTo(0, from + dist * t);
      if (now - t0 < 500) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
})();
