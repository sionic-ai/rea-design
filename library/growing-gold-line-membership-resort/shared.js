// All pages — fade-in line at screen height ÷ 1.15 (.hc-fade, .hc-fade-scale), section line (bottom edge of screen), scroll to top in .5s
(() => {
  const $ = window.jQuery;

  // Appear — in the original, on each scroll, if offset().top is above (scroll + screen ÷ 1.15), it gets is_view (never reverted). Section line at the bottom edge of the screen
  const items = [...document.querySelectorAll(".hc-fade, .hc-fade-scale")], secs = [...document.querySelectorAll(".hc-sec")];
  const check = () => {
    const wh = innerHeight, t = scrollY;
    items.forEach((el) => { if (!el.classList.contains("is-view") && t > el.getBoundingClientRect().top + t - wh / 1.15) el.classList.add("is-view"); });
    secs.forEach((el) => { if (!el.classList.contains("is-view") && t > el.getBoundingClientRect().top + t - wh) el.classList.add("is-view"); });
  };
  addEventListener("scroll", check, { passive: true });
  check();
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { items.concat(secs).forEach((el) => el.classList.add("is-view")); }

  // Back to top — jQuery animate scrollTop 500ms (default swing)
  document.querySelectorAll(".hc-pagetop").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    if ($) $("body,html").animate({ scrollTop: 0 }, 500);
    else scrollTo({ top: 0, behavior: "smooth" });
  }));
})();
