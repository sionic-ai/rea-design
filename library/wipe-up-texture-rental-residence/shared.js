// Shared by all pages — Lenis smooth scroll, header band hide and show, phone menu drawer, float up when visible.
// The original scrolls a screen-height wrapper div as the Lenis wrapper. Here the same Lenis (1.3.3 · default lerp) is attached to window scroll.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page;
  const header = document.getElementById("tr-header");
  const scrollTop = () => window.scrollY || document.documentElement.scrollTop;

  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ syncTouch: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  window.trLenis = lenis;

  // Same-page anchor — scrolls down less by the height of the header band
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = a.hash.length > 1 ? document.querySelector(a.hash) : null;
      if (!target && a.hash !== "#top") return;
      e.preventDefault();
      const y = target ? scrollTop() + target.getBoundingClientRect().top - (header?.clientHeight || 40) : 0;
      if (lenis) lenis.scrollTo(Math.max(0, y)); else window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  // Items float up once they pass the bottom quarter of the screen
  const fades = document.querySelectorAll(".tr-fade");
  const checkFades = () => {
    const y = scrollTop(), h = innerHeight;
    fades.forEach((el) => {
      const top = el.getBoundingClientRect().top + y;
      if (y > top - h + h / 4) el.classList.add("scroll-in");
    });
  };
  checkFades();
  addEventListener("scroll", checkFades, { passive: true });

  // Phone menu drawer
  const menu = document.getElementById("tr-header-menu");
  menu?.addEventListener("click", () => {
    const open = !header.classList.contains("is-nav-open");
    header.classList.toggle("is-nav-open", open);
    menu.setAttribute("aria-expanded", String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  // When a panel that covers the screen like a drawer opens (item search filter panel), stop scrolling
  new MutationObserver(() => {
    if (!lenis) return;
    document.body.classList.contains("is-bk-fixed") ? lenis.stop() : lenis.start();
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });

  document.querySelectorAll(".js-nav").forEach((a) => a.classList.toggle("is-current", a.dataset.nav === page));

  let shown = !header.classList.contains("is-hide");
  const hide = () => { header.classList.add("is-hide"); shown = false; };
  const show = () => { header.classList.remove("is-hide"); shown = true; };

  if (page === "top") {
    // First page: appears 6.5s after the logo sequence ends if at the top, hides during the first scene, and comes back from the region-finder section on
    setTimeout(() => { if (scrollTop() === 0) show(); }, 6500);
    const hideAt = document.querySelector(".js-header-hide"), showAt = document.querySelector(".js-header-show");
    if (hideAt) ScrollTrigger.create({ trigger: hideAt, start: "top bottom", end: "bottom top", onEnter: hide, onLeaveBack: show });
    if (showAt) ScrollTrigger.create({ trigger: showAt, start: "top top+=80px", end: "bottom top", onEnter: show, onLeaveBack: hide });
    ScrollTrigger.create({ trigger: ".tr-main", start: "bottom top+=80px", end: "bottom top", onEnter: hide, onLeaveBack: show });
  } else {
    // Subpage: appears after 1 second, hides when scrolling down and returns when scrolling up (judged once per 0.8 seconds)
    setTimeout(show, 1000);
    let last = 0, lastRun = 0, timer = 0;
    const judge = () => {
      const y = scrollTop();
      if (y > 0 && last < y) { if (shown) hide(); } else if (!shown) show();
      last = y;
      lastRun = Date.now();
    };
    addEventListener("scroll", () => {
      const since = Date.now() - lastRun;
      if (since >= 800) judge();
      else { clearTimeout(timer); timer = setTimeout(judge, 800 - since); }
    }, { passive: true });
  }
})();
