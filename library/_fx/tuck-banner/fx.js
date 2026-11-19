(() => {
  // Corner banner — starts expanded, then folds sideways by the panel width when the bottom of the reference section (after) passes half the screen, or after scrolling more than away px since it expanded.
  // Pressing the handle folds and unfolds it. Measuring restarts from the unfolded position.
  kfFx.register("tuck-banner", (el, { options, scroller }) => {
    const handle = el.querySelector('[data-fx-part="handle"]'), panel = el.querySelector('[data-fx-part="panel"]');
    if (!handle || !panel) return;
    const ac = new AbortController(), signal = ac.signal, box = scroller || window;
    const narrow = matchMedia("(max-width: 768px)");
    const away = () => +((narrow.matches ? options["away-phone"] : null) ?? options.away ?? 1000);
    const top = () => (scroller ? scroller.scrollTop : window.scrollY);
    const anchor = options.after ? document.querySelector(options.after) : null;
    let from = top(), armed = true, past = false;
    const set = (tucked) => {
      el.style.setProperty("--fx-tuck", panel.getBoundingClientRect().width + "px");
      el.classList.toggle("is-fx-tucked", tucked);
      handle.setAttribute("aria-expanded", String(!tucked));
    };
    const onScroll = () => {
      if (anchor) {
        const now = anchor.getBoundingClientRect().bottom < innerHeight / 2;
        if (now !== past) { past = now; set(now); if (!now) { from = top(); armed = true; } }
      }
      if (armed && Math.abs(top() - from) > away()) { set(true); armed = false; }
    };
    handle.addEventListener("click", () => {
      const tucked = el.classList.contains("is-fx-tucked");
      set(!tucked);
      if (tucked) { from = top(); armed = true; } else armed = false;
    }, { signal });
    box.addEventListener("scroll", onScroll, { passive: true, signal });
    set(false);
    onScroll();
    return () => { ac.abort(); el.classList.remove("is-fx-tucked"); el.style.removeProperty("--fx-tuck"); handle.removeAttribute("aria-expanded"); };
  });
})();
