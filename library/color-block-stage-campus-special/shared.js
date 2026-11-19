// Shared by the special pages: ScrollSmoother (smooth 1.5 · effects · normalizeScroll), same-page anchor moves, blob menu drawer,
// Split into single letters (loading text), is-visible once when seen (floor plan), micromodal modal·modal-video window, OverlayScrollbars.
// Touch devices, like the original, smooth 0 · effects off.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin);
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.OverlayScrollbarsGlobal) OverlayScrollbarsGlobal.OverlayScrollbars(body, { showNativeOverlaidScrollbars: true });

  const touch = ScrollTrigger.isTouch === 1;
  const smoother = document.getElementById("smooth-wrapper") && !reduce
    ? ScrollSmoother.create({ smooth: touch ? 0 : 1.5, effects: !touch, normalizeScroll: true })
    : null;
  if (smoother) ScrollTrigger.normalizeScroll({ allowNestedScroll: true });
  window.kgSmoother = smoother;
  const go = (hash) => {
    const target = hash === "#top" ? 0 : document.querySelector(hash);
    if (target == null) return;
    if (smoother) smoother.scrollTo(target, true, "top top");
    else if (target === 0) scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };
  if (location.hash.length > 1) addEventListener("load", () => go(location.hash));
  document.querySelectorAll("a[data-scroll-anchor]").forEach((a) => a.addEventListener("click", (e) => {
    const href = a.getAttribute("href"), i = href.indexOf("#");
    if (i < 0) return;
    e.preventDefault();
    go(href.slice(i));
  }));

  // Menu — is-nav-open on the button and body, and is-nav-closing for 1s when closing
  const menu = document.querySelector(".kg-menu");
  if (menu) {
    const close = () => {
      if (!menu.classList.contains("is-nav-open")) return;
      menu.classList.remove("is-nav-open");
      menu.setAttribute("aria-expanded", "false");
      body.classList.remove("kg-no-scroll", "is-nav-open");
      body.classList.add("is-nav-closing");
      setTimeout(() => body.classList.remove("is-nav-closing"), 1000);
      smoother?.paused(false);
    };
    menu.addEventListener("click", () => {
      if (menu.classList.toggle("is-nav-open")) {
        menu.setAttribute("aria-expanded", "true");
        body.classList.add("kg-no-scroll", "is-nav-open");
        smoother?.paused(true);
      } else close();
    });
    document.querySelectorAll(".kg-header a").forEach((a) => a.addEventListener("click", close));
    addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  document.querySelectorAll("[data-split]").forEach((el) => {
    el.innerHTML = [...el.textContent].map((ch) => `<span>${ch === " " ? "&#32;" : ch}</span>`).join("");
    [...el.children].forEach((s, i) => (s.style.animationDelay = `${(i + 1) * 0.05}s`));
  });

  document.querySelectorAll(".js-visible").forEach((el) => {
    ScrollTrigger.create({ trigger: el, toggleClass: "is-visible", start: "top bottom-=20%", once: true });
  });

  if (window.MicroModal) MicroModal.init({ disableScroll: true });
  addEventListener("DOMContentLoaded", () => { if (window.ModalVideo) new ModalVideo(".js-modal-video", { channel: "custom" }); });
})();
