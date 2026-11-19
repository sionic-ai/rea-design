// Grid/list toggle — only the pressed side’s panel shows and its items rise like the original Framer appear (opacity .001 → 1, .7s cubic-bezier(.44,0,.56,1), list rows delayed .01s each).
// The first grid card’s rise-in is a CSS animation in works.css
(() => {
  const btns = [...document.querySelectorAll("[data-sc-view]")];
  const panes = [...document.querySelectorAll("[data-sc-pane]")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = window.CustomEase ? CustomEase.create("sc-appear-card", "0.44,0,0.56,1") : "sine.inOut";
  const rise = (pane) => {
    const items = pane.matches("[data-sc-pane='list']") ? pane.children : pane.querySelectorAll(".sc-card");
    if (reduce || !items.length) return;
    gsap.fromTo(items, { opacity: 0.001 }, { opacity: 1, duration: 0.7, ease, stagger: pane.dataset.scPane === "list" ? 0.01 : 0 });
  };
  btns.forEach((b) => b.addEventListener("click", () => {
    const v = b.dataset.scView;
    btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    panes.forEach((p) => { const was = p.hidden; p.hidden = p.dataset.scPane !== v; if (was && !p.hidden) rise(p); });
  }));
})();
