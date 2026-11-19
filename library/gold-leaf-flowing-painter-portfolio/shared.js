// All pages — lenis (defaults), header hide (is-toggled when scrolling down), menu curtain, photo·button·section entrances (class added once at 80% of the viewport)
(() => {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = new Lenis();
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  lenis.on("scroll", ScrollTrigger.update);
  let rt;
  new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => { lenis.resize(); ScrollTrigger.refresh(); }, 1500); }).observe(document.querySelector("main") || document.body);
  window.nSite = { lenis, reduce };

  // Header — hides logo and menu when scrolling down past the header height, shows them again on scroll up
  const header = document.querySelector(".n-header");
  let last = 0;
  const onScroll = () => {
    const y = scrollY, h = header.offsetHeight || 0;
    header.classList.toggle("is-toggled", y > last && y > h);
    last = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("load", onScroll);

  // On reaching 80% of the screen, is-active once — photos (blur-in), buttons (line drawing), named sections
  const once = (el, start = "top 80%") => ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => el.classList.add("is-active") });
  document.querySelectorAll(".n-thumb, .n-btn").forEach((el) => once(el));
  document.querySelectorAll("[data-enter]").forEach((el) => once(el, el.dataset.enter));
  if (reduce) document.querySelectorAll(".n-thumb, .n-btn, [data-enter]").forEach((el) => el.classList.add("is-active"));

  // Menu — opened and closed with a diamond button. On open it remembers the scroll position, and on close it returns there
  const icon = document.querySelector(".n-navicon"), menu = document.querySelector(".n-menu");
  let open = false, pos = 0;
  icon?.addEventListener("click", () => {
    open = !open;
    if (open) { pos = scrollY; lenis.stop(); } else { lenis.start(); scrollTo(0, pos); }
    header.classList.toggle("is-passive", open);
    icon.classList.toggle("is-active", open);
    icon.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-active", open);
    menu.inert = !open;
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) icon.click(); });
})();
