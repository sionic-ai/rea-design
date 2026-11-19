(() => {
  // Index links (href="#id") for each, while the target passes the line px line on screen, is-active and aria-current are attached — on and off only, no curve
  kfFx.register("toc-spy", (el, { options, scroller }) => {
    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const line = +(options.line ?? 162);
    const links = [...el.querySelectorAll('a[href^="#"]')];
    const made = links.map((a) => {
      const id = decodeURIComponent(a.getAttribute("href").slice(1));
      const target = id && document.getElementById(id);
      if (!target) return null;
      const set = (on) => { a.classList.toggle("is-active", on); on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"); };
      return ScrollTrigger.create({ trigger: target, scroller, start: `top top+=${line}`, end: `bottom top+=${line}`, onToggle: (self) => set(self.isActive) });
    }).filter(Boolean);
    return () => made.forEach((st) => st.kill());
  });
})();
