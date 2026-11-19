(() => {
  // Side panel opened with a corner button — button (data-fx-part=toggle) pressed, the attached panel slides out from outside its own side (side: left·right) over 1s cubic-bezier(.23,1,.32,1),
  // After .6s, the contents inside the panel (data-fx-part=content) turns on at .75s. On close, the content turns off at .2s and the panel leaves the same way. Hovering a row in the panel list turns on the photo for that row’s number (data-key) at .25s
  const open = new Set();
  kfFx.register("corner-slide-panel", (el, { options, reduce }) => {
    const side = options.side === "left" ? "left" : "right";
    const id = el.id;
    const toggles = id ? [...document.querySelectorAll(`[data-fx-part="toggle"][aria-controls="${id}"]`)] : [];
    const closers = [...el.querySelectorAll('[data-fx-part="close"]')];
    el.dataset.side = side;
    if (reduce) el.style.setProperty("--fx-panel-dur", "0s");
    if (options.dur) el.style.setProperty("--fx-panel-dur", `${+options.dur}s`);
    if (options.delay) el.style.setProperty("--fx-panel-delay", `${+options.delay}s`);
    el.inert = true;
    const set = (on) => {
      el.classList.toggle("is-open", on);
      el.inert = !on;
      toggles.forEach((t) => t.setAttribute("aria-expanded", String(on)));
      on ? open.add(el) : open.delete(el);
      el.dispatchEvent(new CustomEvent(on ? "fx:open" : "fx:close", { bubbles: true }));
    };
    const toggle = () => { for (const o of [...open]) if (o !== el) o.dispatchEvent(new CustomEvent("fx:shut")); set(!el.classList.contains("is-open")); };
    const shut = () => el.classList.contains("is-open") && set(false);
    const key = (e) => e.key === "Escape" && shut();
    toggles.forEach((t) => t.addEventListener("click", toggle));
    closers.forEach((c) => c.addEventListener("click", shut));
    el.addEventListener("fx:shut", shut);
    addEventListener("keydown", key);
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const pic = (k, on) => el.querySelectorAll(`[data-fx-part="pic"][data-key="${k}"]`).forEach((p) => p.classList.toggle("is-on", on));
    const hov = items.map((it) => { const k = it.dataset.key, a = () => pic(k, true), b = () => pic(k, false); it.addEventListener("mouseenter", a); it.addEventListener("mouseleave", b); return [it, a, b]; });
    return () => {
      toggles.forEach((t) => t.removeEventListener("click", toggle));
      closers.forEach((c) => c.removeEventListener("click", shut));
      el.removeEventListener("fx:shut", shut);
      removeEventListener("keydown", key);
      hov.forEach(([it, a, b]) => { it.removeEventListener("mouseenter", a); it.removeEventListener("mouseleave", b); });
      open.delete(el);
      el.classList.remove("is-open");
    };
  });
})();
