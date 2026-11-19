// Hovering a name row (tab) puts a 2px underline on that row, and its paired panel rises from 30px below in .3s and swaps.
// The two photos in the panel turn on upright from 10px below, the first tilting -2° (.1s later) and the second 3°, like two instant photos stacked.
// Motion lives in the fx.css keyframes, so here we only pick which panel to switch on. Devices with no hover swap it for press.
(() => {
  kfFx.register("tilt-pair-tabs", (el, { options, hover }) => {
    const tabs = [...el.querySelectorAll('[data-fx-part="tab"]')];
    const panels = [...el.querySelectorAll('[data-fx-part="panel"]')];
    if (!tabs.length || !panels.length) return;
    const ev = options.on === "click" || !hover ? "click" : "mouseenter";
    const pick = (i) => {
      tabs.forEach((t, k) => { t.classList.toggle("is-active", k === i); t.setAttribute("aria-selected", String(k === i)); });
      panels.forEach((p, k) => p.classList.toggle("is-active", k === i));
    };
    const first = Math.max(0, tabs.findIndex((t) => t.classList.contains("is-active")));
    pick(first);
    const handlers = tabs.map((t, i) => {
      const fn = (e) => {
        if (ev === "click" && t.tagName === "A" && !t.classList.contains("is-active")) e.preventDefault();
        if (!t.classList.contains("is-active")) pick(i);
      };
      t.addEventListener(ev, fn);
      t.addEventListener("focus", fn);
      return fn;
    });
    return () => {
      tabs.forEach((t, i) => { t.removeEventListener(ev, handlers[i]); t.removeEventListener("focus", handlers[i]); t.classList.remove("is-active"); });
      panels.forEach((p) => p.classList.remove("is-active"));
    };
  });
})();
