(() => {
  // Staying at the very end of the page fills the bottom bar over dwell seconds, and when full the bar clears to the right, the next card grows to fill the panel, then moves on to the next page.
  // If you leave the end before it fills (even slightly upward), the bar returns along the same curve and the transition is undone.
  kfFx.register("bottom-dwell-next", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    const panel = el.querySelector('[data-fx-part="panel"]');
    const card = el.querySelector('[data-fx-part="card"]');
    if (!panel && !el.querySelector('[data-fx-part="bar"]')) return;
    const dwell = +(options.dwell ?? 2), grow = +(options.grow ?? 1.2);
    const to = options.to || card?.getAttribute("href") || el.querySelector("a[href]")?.getAttribute("href") || "";
    const vars = {
      "--fx-dwell": dwell + "s",
      "--fx-grow": grow + "s",
      "--fx-fade": +(options.fade ?? 0.5) + "s",
      "--fx-leave": +(options.leave ?? 1) + "s",
    };
    if (options["bar-ease"]) vars["--fx-bar-ease"] = kfCurve(options["bar-ease"]);
    if (options["leave-ease"]) vars["--fx-leave-ease"] = kfCurve(options["leave-ease"]);
    Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v));
    const view = scroller || window;
    const atBottom = () =>
      scroller ? scroller.scrollHeight - 1 <= scroller.scrollTop + scroller.clientHeight : document.documentElement.scrollHeight - 1 <= scrollY + innerHeight;
    let timer = 0, later = 0, armed = false, gone = false;

    function fire() {
      gone = true;
      el.classList.add("is-leave");
      el.dispatchEvent(new CustomEvent("fx:grow", { bubbles: true, detail: { to } }));
      if (panel) {
        const narrow = matchMedia("(max-width: 768px)").matches;
        const ratio = +(narrow ? options["ratio-narrow"] : options.ratio) || 0;
        const w = panel.offsetWidth, h = ratio ? w / ratio : panel.offsetHeight;
        if (ratio) panel.style.aspectRatio = String(ratio);
        el.style.setProperty("--fx-to-ratio", String(w / h));
        // Align the panel top edge to the top of the screen — the original moves the margin below the panel to screen height − panel height
        const top = scroller ? scroller.getBoundingClientRect().top : 0;
        panel.style.bottom = Math.max(0, el.getBoundingClientRect().bottom - top - h) + "px";
      }
      el.classList.add("is-grow");
      later = setTimeout(() => {
        const ev = new CustomEvent("fx:next", { bubbles: true, cancelable: true, detail: { to } });
        if (el.dispatchEvent(ev) && to) location.href = to;
      }, grow * 1000);
    }
    function onScroll() {
      if (gone) return;
      const end = atBottom();
      if (end && !armed) {
        armed = true;
        el.classList.add("is-dwell");
        timer = setTimeout(fire, dwell * 1000);
      } else if (!end && armed) {
        armed = false;
        clearTimeout(timer);
        el.classList.remove("is-dwell");
      }
    }
    view.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      view.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
      clearTimeout(later);
      el.classList.remove("is-dwell", "is-leave", "is-grow");
      Object.keys(vars).concat("--fx-to-ratio").forEach((k) => el.style.removeProperty(k));
      if (panel) { panel.style.bottom = ""; panel.style.aspectRatio = ""; }
    };
  });
  // Four numbers like ”0.16,1,0.3,1” go to CSS transitions as cubic-bezier, names (ease·linear) as they are
  function kfCurve(v) {
    return /^[\d.\s,-]+$/.test(v) ? `cubic-bezier(${v})` : v;
  }
})();
