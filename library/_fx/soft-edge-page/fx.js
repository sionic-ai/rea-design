// Hide the white veil (and the faint marks) with a 200%-height gradient mask — moving the mask position makes a soft edge sweep across the screen instead of a sharp one.
// Opened page: once the typeface arrives (wait seconds at most), .05s later the curtain is revealed from the bottom and lifts upward. Same-site link: the curtain fills up from the bottom to cover, and after go seconds the page changes
(() => {
  kfFx.register("soft-edge-page", (root, { options, reduce }) => {
    const num = (k, d) => +(options[k] ?? d);
    const inDur = num("in", 3.375), markIn = num("mark-in", 1), delay = num("delay", 0.2);
    const cover = num("cover", 0.9), markDelay = num("mark-delay", 0.2), go = num("go", 0.45), wait = num("wait", 2);
    const ease = options.ease ? `cubic-bezier(${options.ease})` : "cubic-bezier(0.19, 1, 0.22, 1)";
    const veil = document.createElement("div");
    veil.className = "fx-sep";
    veil.setAttribute("aria-hidden", "true");
    const mark = root.querySelector(':scope > [data-fx-part="mark"]');
    const layer = (cls) => {
      const l = document.createElement("div");
      l.className = cls;
      l.innerHTML = '<div class="fx-sep__cover"></div>';
      if (mark) { const m = document.createElement("div"); m.className = "fx-sep__mark"; m.append(mark.cloneNode(true)); l.append(m); }
      return l;
    };
    veil.append(layer("fx-sep__in"), layer("fx-sep__out"));
    const vars = { "--fx-in": inDur + "s", "--fx-mark-in": markIn + "s", "--fx-delay": delay + "s", "--fx-cover": cover + "s", "--fx-mark-delay": markDelay + "s", "--fx-ease": ease, "--fx-done": delay + inDur + "s" };
    Object.entries(vars).forEach(([k, v]) => veil.style.setProperty(k, v));
    root.append(veil);
    root.classList.add("fx-sep-ready");
    const ac = new AbortController(), on = { signal: ac.signal };
    // Elements added late (after the page is fully open) have nothing to lift, so they start without a curtain
    const late = document.readyState === "complete" && performance.now() > 4000;
    if (reduce || late) veil.classList.add("is-done");
    else {
      let started = false;
      const start = () => { if (started) return; started = true; setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add("is-in"))), 50); };
      // on: load — uncovers on window load (images included) instead of on fonts. With a skin that loads web fonts late (Google Fonts @import), font readiness lags far behind load and the curtain stays up for a long time
      // on: ready — lifts right after attaching (after DOMContentLoaded). Changes caused by late-arriving fonts may show after the cover lifts
      if (options.on === "ready") start();
      else if (options.on === "load") {
        if (document.readyState === "complete") start();
        else addEventListener("load", start, { once: true, signal: ac.signal });
      } else (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);
      setTimeout(start, wait * 1000);
    }
    root.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/.test(href) || a.origin !== location.origin || a.href === location.href) return;
      e.preventDefault();
      veil.classList.remove("is-done");
      veil.classList.add("is-cover");
      requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add("is-out")));
      setTimeout(() => { location.href = a.href; }, reduce ? 0 : go * 1000);
    }, on);
    addEventListener("pageshow", (e) => { if (e.persisted) veil.classList.remove("is-cover", "is-out"); }, on);
    return () => { ac.abort(); veil.remove(); root.classList.remove("fx-sep-ready"); };
  });
})();
