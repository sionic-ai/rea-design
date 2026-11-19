(() => {
  // In the original, a widget opens immediately on press — use wait for a gap only when imitating a widget that opens after drawing its window.
  // The loader is a circle that spins while the conversation loads, so it clears in .3s after load seconds
  kfFx.register("chat-launcher-pop", (el, { options, reduce }) => {
    const toggle = el.querySelector('[data-fx-part="toggle"]'), panel = el.querySelector('[data-fx-part="panel"]');
    if (!toggle || !panel) return;
    const loader = el.querySelector('[data-fx-part="loader"]');
    const wait = reduce ? 0 : +(options.wait ?? 0) * 1000;
    const load = reduce ? 0 : +(options.load ?? 0.8) * 1000;
    const curve = String(options.ease || "");
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.rise != null) el.style.setProperty("--fx-rise", `${+options.rise}px`);
    if (/^[\d.\s-]+(,[\d.\s-]+){3}$/.test(curve)) el.style.setProperty("--fx-ease", `cubic-bezier(${curve})`);
    let open = false, t1 = 0, t2 = 0;
    const mark = (v) => {
      open = v;
      el.classList.toggle("is-open", v);
      toggle.setAttribute("aria-expanded", String(v));
      panel.setAttribute("aria-hidden", String(!v));
    };
    const show = () => {
      clearTimeout(t1); clearTimeout(t2);
      t1 = setTimeout(() => {
        mark(true);
        if (loader && !loader.classList.contains("is-loaded")) t2 = setTimeout(() => loader.classList.add("is-loaded"), load);
      }, wait);
    };
    const hide = () => { clearTimeout(t1); clearTimeout(t2); mark(false); };
    const onToggle = (e) => { e.preventDefault(); open ? hide() : show(); };
    const onKey = (e) => { if (e.key === "Escape" && open) hide(); };
    const onClose = (e) => { if (e.target.closest('[data-fx-part="dismiss"]')) { e.preventDefault(); hide(); } };
    toggle.addEventListener("click", onToggle);
    panel.addEventListener("click", onClose);
    addEventListener("keyup", onKey);
    mark(false);
    return () => {
      clearTimeout(t1); clearTimeout(t2);
      toggle.removeEventListener("click", onToggle);
      panel.removeEventListener("click", onClose);
      removeEventListener("keyup", onKey);
      el.classList.remove("is-open");
      loader?.classList.remove("is-loaded");
      toggle.removeAttribute("aria-expanded");
      panel.removeAttribute("aria-hidden");
      el.style.removeProperty("--fx-dur"); el.style.removeProperty("--fx-rise"); el.style.removeProperty("--fx-ease");
    };
  });
})();
