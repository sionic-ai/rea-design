// Measured once per frame rather than on every scroll — the original also batches with requestAnimationFrame
(() => {
  kfFx.register("appear-past-scroll", (el, { options, scroller }) => {
    // once — once shown it does not hide again on scrolling back. key — pressing the close child records this name in the session so it is not shown again (Studio newsletter window)
    const once = options.once === "true" || options.once === "1";
    const key = options.key || "";
    let seen = false;
    try { seen = !!(key && sessionStorage.getItem(key)); } catch (e) { seen = false; }
    if (seen) return;
    // With a screen-height value like ”100vh”, it re-measures at that ratio when the window resizes (the header that only comes down after the hero)
    const raw = String(options.at ?? 500).trim(), vh = raw.endsWith("vh") ? parseFloat(raw) / 100 : null, px = +raw || 0;
    const src = scroller || window;
    let raf = 0;
    // after — when it must appear after passing the hero whose height changes with screen width. Hardcoded numbers drift at each width
    const after = options.after ? document.querySelector(options.after) : null;
    const past = () => {
      const r = after.getBoundingClientRect();
      return scroller ? r.bottom - scroller.getBoundingClientRect().top + scroller.scrollTop : r.bottom + scrollY;
    };
    const at = () => (after ? past() : vh == null ? px : vh * (scroller ? scroller.clientHeight : innerHeight));
    const stop = () => { src.removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
    // edge: bottom — when the bottom edge of the screen reaches that spot (original ”scrollTop >= a slab whose document position is measured from the bottom end, like 「1720 - window height」)
    const bottom = options.edge === "bottom";
    const check = () => {
      raf = 0;
      const view = bottom ? (scroller ? scroller.clientHeight : innerHeight) : 0;
      const shown = (scroller ? scroller.scrollTop : scrollY) + view >= at();
      if (once) { if (shown) { el.classList.add("is-shown"); stop(); } return; }
      el.classList.toggle("is-shown", shown);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    const close = el.querySelector('[data-fx-part="close"]');
    const dismiss = () => {
      el.classList.remove("is-shown");
      stop();
      try { if (key) sessionStorage.setItem(key, "1"); } catch (e) { /* Window where session saving is blocked */ }
    };
    close?.addEventListener("click", dismiss);
    src.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    check();
    return () => { stop(); close?.removeEventListener("click", dismiss); el.classList.remove("is-shown"); };
  });
})();
