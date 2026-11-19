// Shared by the three subpages — fills in the header ribbon and arrows and attaches the common entrance motion
(() => {
  const ARROW = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 10h11M11 5.5 15.5 10 11 14.5"/></svg>';
  document.querySelectorAll("[data-ribbon]").forEach((el) => { el.innerHTML = window.zmRibbon(`zm-rb-${el.dataset.ribbon}`); });
  document.querySelectorAll(".zm-btn__icon, .zm-arrow").forEach((el) => { el.innerHTML = ARROW; });
  window.zmMotion();
})();
