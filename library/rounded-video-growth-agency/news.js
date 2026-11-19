// Post list: category tabs — panels switch in the style of a site-builder tab (out .1s · in .3s ease).
(() => {
  const { reduce } = window.RV;
  const tabs = [...document.querySelectorAll(".rv-tab")], panes = [...document.querySelectorAll(".rv-tabpane")];
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
  window.RV.ready();
})();
