// Contact: the original moves between two tabs as pages, /contact and /contact/casual (STUDIO-style handoff — .3s out, .6s in, cubic-bezier(.4,.4,0,1)).
// Same panel with different cells, switching panels on one page, and lifting and clearing the panel over that transition length. Opens directly at the #casual address. Sending is blocked (product feature).
(() => {
  const tabs = [...document.querySelectorAll(".ct__tab")];
  const panels = [...document.querySelectorAll(".ct__panel")];
  if (!tabs.length) return;
  const ease = CustomEase.create("ctPage", "0.4,0.4,0,1");
  let busy = false;

  const set = (name) => {
    tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.tab === name));
    panels.forEach((p) => (p.hidden = p.dataset.panel !== name));
  };
  const go = (name) => {
    const now = panels.find((p) => !p.hidden);
    if (busy || now.dataset.panel === name) return;
    busy = true;
    const d = HS.reduced ? 0 : 1;
    gsap.to(now, { opacity: 0, duration: 0.3 * d, ease, onComplete: () => {
      set(name);
      const next = panels.find((p) => !p.hidden);
      ScrollTrigger.refresh();
      gsap.fromTo(next, { opacity: 0 }, { opacity: 1, duration: 0.6 * d, ease, onComplete: () => (busy = false) });
    } });
  };

  tabs.forEach((t) =>
    t.addEventListener("click", (e) => {
      e.preventDefault();
      history.replaceState(null, "", t.getAttribute("href"));
      go(t.dataset.tab);
    })
  );
  if (location.hash === "#casual") set("casual");
  document.querySelectorAll(".ct__form").forEach((f) => f.addEventListener("submit", (e) => e.preventDefault()));
})();
