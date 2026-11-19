// Clicking a link inside adds is-diving and navigates to that address after go ms. The scale at which the gap covers the screen’s long side (width or 100lvh) is measured as --fx-zoom.
// Fire fx:dive (cancelable) first — the app is blocked and its own screen transition is attached. When returning via back (bfcache), the dive state is undone
(() => {
  kfFx.register("hole-dive-link", (el, { options, reduce }) => {
    const go = +(options.go ?? 1800);
    const ac = new AbortController(), on = { signal: ac.signal };
    let timer = 0;
    const lvh = () => {
      const probe = document.createElement("div");
      probe.style.cssText = "position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none";
      document.body.append(probe);
      const h = probe.getBoundingClientRect().height;
      probe.remove();
      return h || innerHeight;
    };
    const measure = () => {
      const hole = el.querySelector('[data-fx-part="hole"]');
      if (hole?.offsetWidth) el.style.setProperty("--fx-zoom", String(Math.max(innerWidth, lvh()) / hole.offsetWidth));
    };
    el.addEventListener("click", (e) => {
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!a || !el.contains(a) || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
      e.preventDefault();
      const href = a.getAttribute("href");
      if (!el.dispatchEvent(new CustomEvent("fx:dive", { bubbles: true, cancelable: true, detail: { href } }))) return;
      if (reduce || go <= 0) { location.href = href; return; }
      measure();
      el.classList.add("is-diving");
      timer = setTimeout(() => (location.href = href), go);
    }, on);
    addEventListener("resize", measure, on);
    addEventListener("pageshow", (e) => { if (e.persisted) el.classList.remove("is-diving"); }, on);
    measure();
    return () => { ac.abort(); clearTimeout(timer); el.classList.remove("is-diving"); el.style.removeProperty("--fx-zoom"); };
  });
})();
