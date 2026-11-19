// The menu panel is a drawer extending diagonally from the bottom right — in the original a cat paw drawing is attached behind the panel, so it looks like the paw carries the menu in
(() => {
  kfFx.register("reach-drawer", (el, { options }) => {
    const lock = options.lock !== "false";
    const openers = () => {
      if (options.open) return [...document.querySelectorAll(options.open)];
      if (el.id) return [...document.querySelectorAll(`[aria-controls="${el.id}"]`)];
      return [...document.querySelectorAll('[data-fx-part="open"]')].filter((b) => !el.contains(b));
    };
    let open = false, pos = 0;
    // On the first paint, the path into the hidden slot appears one frame later so it stays invisible
    const ready = requestAnimationFrame(() => el.classList.add("is-ready"));
    el.setAttribute("aria-hidden", "true");
    const set = (want) => {
      if (want === open) return;
      open = want;
      if (lock) {
        if (open) { pos = scrollY; document.body.classList.add("fx-reach-lock"); document.body.style.top = `${-pos}px`; }
        else { document.body.classList.remove("fx-reach-lock"); document.body.style.top = ""; scrollTo(0, pos); }
      }
      el.classList.toggle("is-open", open);
      el.setAttribute("aria-hidden", open ? "false" : "true");
      openers().forEach((b) => b.setAttribute("aria-expanded", String(open)));
      el.dispatchEvent(new CustomEvent(open ? "fx:open" : "fx:close"));
    };
    const onDoc = (e) => {
      if (openers().some((b) => b.contains(e.target))) { e.preventDefault(); set(!open); return; }
      const close = e.target.closest('[data-fx-part="close"]');
      if (close && el.contains(close)) { e.preventDefault(); set(false); }
    };
    const onKey = (e) => { if (e.key === "Escape") set(false); };
    document.addEventListener("click", onDoc);
    addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(ready);
      set(false);
      document.removeEventListener("click", onDoc);
      removeEventListener("keydown", onKey);
      el.classList.remove("is-open", "is-ready");
    };
  });
})();
