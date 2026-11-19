// Specialties: the tab pinned to the top underlines the specialty currently in view.
(() => {
  window.SF.page.expertise = (c) => {
    const { $$ } = window.SF;
    const tabs = $$(".ex-tabs a", c);
    $$(".ex-svc", c).forEach((sec, i) => ScrollTrigger.create({ trigger: sec, start: "top center", end: "bottom center", onToggle: (st) => st.isActive && tabs.forEach((t, j) => t.classList.toggle("is-here", i === j)) }));
  };
})();
