// Give each section of a long page a skin name (data-bg), and while the section passes the 50% line of the screen height html[data-page-theme] becomes that name and
// Page background, text and accent — three values blend over .8s ease (@property transition). Changing data-bg within a section (before/after toggle) is followed immediately when that section is the current one.
(() => {
  kfFx.register("section-theme-switch", (el, { options, scroller }) => {
    if (!window.ScrollTrigger) return;
    const attr = options.attr || "data-bg", base = options.base || "base";
    // The line trigger is a screen height ratio (.5) or a distance measured from the top of the screen (300px — in Brand it flips when the second group’s header reaches 300px above).
    const raw = String(options.line ?? "0.5").trim(), px = /px$/.test(raw), line = parseFloat(raw);
    const at = px ? `${line}px` : `${line * 100}%`;
    const root = document.documentElement;
    const set = (name, instant) => {
      name = name || base;
      if (root.dataset.pageTheme === name) return;
      if (instant) {
        root.classList.add("fx-theme-instant");
        root.dataset.pageTheme = name;
        void root.offsetHeight;
        root.classList.remove("fx-theme-instant");
      } else root.dataset.pageTheme = name;
      el.dispatchEvent(new CustomEvent("fx:theme", { detail: { name, instant: !!instant }, bubbles: true }));
    };
    const parts = [...el.querySelectorAll(`[${attr}]`)];
    if (!parts.length) return;
    // On first open: use the skin of the section on the line, or the default skin if none — immediately, no flicker
    const vh = px ? line : innerHeight * line;
    const hit = parts.find((p) => p.getBoundingClientRect().bottom >= vh);
    set(hit && hit.getBoundingClientRect().top <= vh ? hit.getAttribute(attr) : base, true);
    const triggers = parts.map((p) => ScrollTrigger.create({
      trigger: p, scroller, start: `top ${at}`, end: `bottom ${at}`,
      onToggle: (s) => s.isActive && set(p.getAttribute(attr)),
    }));
    const mo = new MutationObserver((list) => list.forEach((m) => {
      const i = parts.indexOf(m.target);
      if (i >= 0 && triggers[i].isActive) set(m.target.getAttribute(attr));
    }));
    parts.forEach((p) => mo.observe(p, { attributes: true, attributeFilter: [attr] }));
    return () => { mo.disconnect(); triggers.forEach((t) => t.kill()); };
  });
})();
