// While the section passes through the screen (top edge at the 80% line → bottom edge at the 40% line), a dark overlay covers the full screen in 1s — so white text stays readable as it rises over photos.
// Only one film per page, turned on if even one section with this part is passing
(() => {
  let veil = null, live = 0;
  const on = new Set();
  const sync = () => veil?.classList.toggle("is-on", on.size > 0);
  kfFx.register("pass-veil", (el, { options, reduce, scroller }) => {
    if (!window.ScrollTrigger) return;
    if (!veil) { veil = document.createElement("div"); veil.className = "fx-pass-veil"; veil.setAttribute("aria-hidden", "true"); document.body.append(veil); }
    live++;
    const st = ScrollTrigger.create({
      trigger: el, scroller: scroller || undefined,
      start: options.start || "top 80%", end: options.end || "bottom 40%",
      onToggle: (self) => { self.isActive ? on.add(el) : on.delete(el); sync(); },
    });
    if (reduce) veil.classList.add("is-instant");
    return () => {
      st.kill(); on.delete(el); sync();
      if (--live === 0) { veil.remove(); veil = null; }
    };
  });
})();
