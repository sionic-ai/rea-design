// A pill nav floating at the bottom of the screen — pressing the menu button makes a same-size panel hidden behind the pill grow to drawer size while holding its bottom left corner,
// The pill button blurs out at once while the drawer links turn on from .45s at .05s intervals. On closing, the links turn off first, the panel shrinks .3s later, and the pill button returns after .6s.
(() => {
  const VARS = { w: "--fx-w", h: "--fx-h", pad: "--fx-pad", shift: "--fx-shift", radius: "--fx-r" };
  const SECS = { dur: "--fx-dur", close: "--fx-close", back: "--fx-back", "link-delay": "--fx-link-delay", lag: "--fx-lag" };
  kfFx.register("pill-drawer-menu", (el, { options, reduce }) => {
    const pill = el.querySelector('[data-fx-part="pill"]'), toggle = el.querySelector('[data-fx-part="toggle"]');
    if (!pill || !toggle) return;
    for (const [k, v] of Object.entries(VARS)) if (options[k] != null) el.style.setProperty(v, options[k]);
    for (const [k, v] of Object.entries(SECS)) if (options[k] != null) el.style.setProperty(v, `${+options[k]}s`);
    const links = [...el.querySelectorAll('[data-fx-part="link"]')];
    links.forEach((l, i) => l.style.setProperty("--fx-i", i));
    // The closed panel is the same size as the pill — measured so it follows even when font or width changes late
    const size = () => { el.style.setProperty("--fx-w0", `${pill.offsetWidth}px`); el.style.setProperty("--fx-h0", `${pill.offsetHeight}px`); };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(pill);
    if (reduce) el.classList.add("fx-reduce");
    const set = (on) => {
      if (el.classList.contains("is-open") === on) return;
      el.classList.toggle("is-open", on);
      toggle.setAttribute("aria-expanded", on);
      el.dispatchEvent(new CustomEvent(on ? "fx:open" : "fx:close", { bubbles: true }));
    };
    toggle.setAttribute("aria-expanded", "false");
    const onToggle = () => set(!el.classList.contains("is-open"));
    const onKey = (e) => e.key === "Escape" && set(false);
    const onDoc = (e) => !el.contains(e.target) && set(false);
    toggle.addEventListener("click", onToggle);
    addEventListener("keydown", onKey);
    document.addEventListener("click", onDoc);
    return () => {
      toggle.removeEventListener("click", onToggle);
      removeEventListener("keydown", onKey);
      document.removeEventListener("click", onDoc);
      ro.disconnect();
      el.classList.remove("is-open", "fx-reduce");
      links.forEach((l) => l.style.removeProperty("--fx-i"));
      [...Object.values(VARS), ...Object.values(SECS), "--fx-w0", "--fx-h0"].forEach((v) => el.style.removeProperty(v));
    };
  });
})();
