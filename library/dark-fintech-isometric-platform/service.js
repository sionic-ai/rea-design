// Maker side: Parts tab — switches plates with the Webflow tab (out .1s · in .3s). The rest is handled by shared pieces (dividers, grid appear, button roll) and parts.
(() => {
  const { reduce } = window.DB;
  const tabs = [...document.querySelectorAll(".db-tab")], panes = [...document.querySelectorAll(".db-tabpane")];
  let busy = null;
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    const next = panes.find((p) => p.dataset.pane === tab.dataset.tab), now = panes.find((p) => p.classList.contains("is-current"));
    if (!next || next === now) return;
    tabs.forEach((t) => { const on = t === tab; t.classList.toggle("is-current", on); t.setAttribute("aria-selected", on); });
    busy?.kill();
    busy = gsap.timeline({ onComplete: () => ScrollTrigger.refresh() })
      .to(now, { opacity: 0, duration: reduce ? 0 : 0.1, ease: "power1.inOut" })
      .add(() => { now.classList.remove("is-current"); next.classList.add("is-current"); gsap.set(now, { clearProps: "opacity" }); })
      .fromTo(next, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.3, ease: "power1.inOut", clearProps: "opacity" });
  }));
  window.DB.ready();
})();
