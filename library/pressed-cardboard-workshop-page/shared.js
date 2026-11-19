// Shared by every page — Lenis 1.3.26 (lerp .085 · wheel .9 · anchors offset by the nav height), nav hides on scroll down and shows on scroll up, menu panel open/close, light animation pauses when the hero is out of view, inquiry form (does not send)
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const RV = (window.RV = {});
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const bar = document.querySelector(".rv-nav__bar");
    const lenis = (RV.lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, anchors: { offset: bar ? -bar.offsetHeight : 0 } }));
    const tick = (t) => lenis.raf(t * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); gsap.ticker.lagSmoothing(500, 33); lenis.destroy(); RV.lenis = null; };
  });

  // Nav: hides (.5s) when scrolling down by more than twice the bar height, and comes back when scrolling up
  (() => {
    const nav = document.querySelector(".rv-nav");
    if (!nav) return;
    const bar = nav.querySelector(".rv-nav__bar"), menu = nav.querySelector(".rv-nav__menu"), toggle = nav.querySelector(".rv-nav__toggle"), close = nav.querySelector(".rv-nav__menu-close");
    let last = scrollY;
    addEventListener("scroll", () => {
      const y = scrollY, d = y - last;
      last = y;
      if (!menu.hidden) return;
      if (d > 0 && y > bar.offsetHeight * 2) nav.setAttribute("data-hidden", "");
      else if (d < 0) nav.removeAttribute("data-hidden");
    }, { passive: true });
    nav.addEventListener("focusin", () => nav.removeAttribute("data-hidden"));
    const set = (open) => {
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      if (open) { RV.lenis?.stop(); close.focus(); } else { RV.lenis?.start(); toggle.focus(); }
    };
    toggle.addEventListener("click", () => set(true));
    close.addEventListener("click", () => set(false));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) { menu.hidden = true; toggle.setAttribute("aria-expanded", "false"); RV.lenis?.start(); } });
    addEventListener("keydown", (e) => e.key === "Escape" && !menu.hidden && set(false));
  })();

  // When the hero is off-screen, pause the 16s light flow and shadow sway
  (() => {
    const hero = document.getElementById("hero");
    if (hero && "IntersectionObserver" in window) new IntersectionObserver(([e]) => hero.toggleAttribute("data-paused", !e.isIntersecting)).observe(hero);
  })();

  // Contact form — placeholder, not sent
  document.querySelector(".contact__form")?.addEventListener("submit", (e) => e.preventDefault());
})();
