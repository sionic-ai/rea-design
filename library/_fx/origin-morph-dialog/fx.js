// Writes the pressed spot’s position, size and corners into --fx-from-*, and the target spot into --fx-to-*, then adds .is-shown on the next frame — a CSS transition grows between them.
// On close, re-measure the button position (the page may have scrolled), shrink to that spot, then hide the cover.
(() => {
  kfFx.register("origin-morph-dialog", (el, { options, reduce }) => {
    const layer = el.querySelector("[data-fx-part=layer]");
    const panel = layer && layer.querySelector("[data-fx-part=panel]");
    if (!panel) return;
    const opens = [...el.querySelectorAll("[data-fx-part=open]")];
    const scrim = layer.querySelector("[data-fx-part=scrim]");
    const dur = reduce ? 0 : +(options.dur ?? 460);
    const place = options.place || "corner";
    el.style.setProperty("--fx-dur", `${dur}ms`);
    let origin = null, closing = 0, raf = 0, focusTimer = 0, lastOpener = null;

    const fromOf = () => {
      const r = origin.getBoundingClientRect();
      el.style.setProperty("--fx-from-top", `${r.top}px`);
      el.style.setProperty("--fx-from-right", `${document.documentElement.clientWidth - r.right}px`);
      el.style.setProperty("--fx-from-w", `${r.width}px`);
      el.style.setProperty("--fx-from-h", `${r.height}px`);
      el.style.setProperty("--fx-from-radius", getComputedStyle(origin).borderRadius || "10px");
      return r;
    };
    const toOf = (r) => {
      const vw = document.documentElement.clientWidth, vh = innerHeight;
      let w, h, top, right, rad;
      if (place === "video") {
        w = Math.min(1120, vw - 40, ((vh - 80) * 16) / 9); h = (w * 9) / 16; top = (vh - h) / 2; right = (vw - w) / 2; rad = +(options.radius ?? 12);
      } else {
        w = Math.min(+(options.w ?? 440), vw - 40); h = Math.min(+(options.h ?? vh - 100), vh - 32); rad = +(options.radius ?? 16);
        if (place === "center") { top = Math.max(16, (vh - h) / 2); right = Math.max(16, (vw - w) / 2); }
        else { top = 50; right = Math.max(16, Math.min(vw - w - 16, vw - r.right)); }
      }
      el.style.setProperty("--fx-to-top", `${top}px`);
      el.style.setProperty("--fx-to-right", `${right}px`);
      el.style.setProperty("--fx-to-w", `${w}px`);
      el.style.setProperty("--fx-to-h", `${h}px`);
      el.style.setProperty("--fx-to-radius", `${rad}px`);
    };

    const lock = (on) => {
      const l = window.lenis;
      if (l && l.stop) on ? l.stop() : l.start();
      else document.documentElement.style.overflow = on ? "hidden" : "";
    };
    const key = (e) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      const list = [...panel.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), textarea, select, [tabindex]:not([tabindex="-1"])')].filter((n) => n.offsetParent !== null);
      if (!list.length) return;
      const a = list[0], b = list[list.length - 1], cur = document.activeElement;
      if (e.shiftKey && (cur === a || !panel.contains(cur))) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && cur === b) { e.preventDefault(); a.focus(); }
    };

    function open(opener) {
      if (el.classList.contains("is-open") && !closing) return;
      clearTimeout(closing); closing = 0;
      lastOpener = opener || opens[0] || el;
      origin = (options.from && lastOpener.closest(options.from)) || lastOpener;
      toOf(fromOf());
      layer.hidden = false;
      el.classList.add("is-open");
      lastOpener.setAttribute && lastOpener.setAttribute("aria-expanded", "true");
      lock(true);
      document.addEventListener("keydown", key);
      raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => el.classList.add("is-shown")); });
      focusTimer = setTimeout(() => { const f = panel.querySelector("input, textarea, [data-fx-part=close]"); f && f.focus({ preventScroll: true }); }, dur * 0.6);
      el.dispatchEvent(new CustomEvent("fx:opened", { bubbles: true }));
    }
    function close() {
      if (!el.classList.contains("is-open") || closing) return;
      cancelAnimationFrame(raf); clearTimeout(focusTimer);
      fromOf();
      el.classList.remove("is-shown");
      document.removeEventListener("keydown", key);
      lastOpener && lastOpener.setAttribute && lastOpener.setAttribute("aria-expanded", "false");
      closing = setTimeout(() => {
        closing = 0;
        layer.hidden = true;
        el.classList.remove("is-open");
        lock(false);
        lastOpener && lastOpener.focus && lastOpener.focus({ preventScroll: true });
      }, dur);
    }

    const onOpen = (e) => open(e.currentTarget);
    opens.forEach((b) => { b.setAttribute("aria-haspopup", "dialog"); b.setAttribute("aria-expanded", "false"); b.addEventListener("click", onOpen); });
    const onClose = (e) => { if (e.target.closest("[data-fx-part=close]") || e.target === scrim) close(); };
    layer.addEventListener("click", onClose);
    const evOpen = () => open(), evClose = () => close();
    el.addEventListener("fx:open", evOpen);
    el.addEventListener("fx:close", evClose);
    layer.hidden = true;

    return () => {
      cancelAnimationFrame(raf); clearTimeout(focusTimer); clearTimeout(closing);
      opens.forEach((b) => b.removeEventListener("click", onOpen));
      layer.removeEventListener("click", onClose);
      el.removeEventListener("fx:open", evOpen);
      el.removeEventListener("fx:close", evClose);
      document.removeEventListener("keydown", key);
      if (el.classList.contains("is-open")) lock(false);
      el.classList.remove("is-open", "is-shown");
      layer.hidden = true;
    };
  });
})();
