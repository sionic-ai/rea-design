(() => {
  // Hovering a header trigger turns on one panel (.15s). Moving to another trigger swaps the panel content and slides it under that trigger (.3s ease).
  // Why one panel is moved: the original doesn’t open a separate panel per menu, so the panel follows without flicker when passing between triggers
  kfFx.register("slide-popover-nav", (el, { options, hover }) => {
    const pop = el.querySelector('[data-fx-part="pop"]');
    const inner = pop?.querySelector('[data-fx-part="inner"]');
    const triggers = [...el.querySelectorAll('[data-fx-part="trigger"]')];
    const menus = pop ? [...pop.querySelectorAll('[data-fx-part="menu"]')] : [];
    if (!pop || !inner || !triggers.length || !menus.length) return;

    const shift = +(options.shift ?? 124);
    const delay = +(options.delay ?? 0.15) * 1000;
    inner.style.setProperty("--fx-slide", `${+(options.slide ?? 0.3)}s`);
    pop.style.setProperty("--fx-fade", `${+(options.fade ?? 0.15)}s`);
    if (options["slide-ease"]) inner.style.setProperty("--fx-slide-ease", options["slide-ease"]);
    if (options["fade-ease"]) pop.style.setProperty("--fx-fade-ease", options["fade-ease"]);
    let timer = null, current = null;

    const stop = () => { if (timer !== null) { clearTimeout(timer); timer = null; } };
    const hide = () => {
      pop.dataset.open = "false";
      triggers.forEach((t) => { t.dataset.active = "false"; t.setAttribute("aria-expanded", "false"); });
      current = null;
    };
    const later = () => { stop(); timer = setTimeout(hide, delay); };
    const show = (t) => {
      stop();
      const key = t.dataset.key;
      if (current !== key) {
        current = key;
        menus.forEach((m) => { m.hidden = m.dataset.key !== key; });
        const a = t.getBoundingClientRect(), b = pop.getBoundingClientRect();
        inner.style.transform = `translateX(${a.left - b.left - shift}px)`;
      }
      triggers.forEach((x) => { const on = x === t; x.dataset.active = String(on); x.setAttribute("aria-expanded", String(on)); });
      pop.dataset.open = "true";
    };

    const offs = [];
    const on = (node, type, fn) => { node.addEventListener(type, fn); offs.push(() => node.removeEventListener(type, fn)); };
    for (const t of triggers) {
      t.setAttribute("aria-haspopup", "true");
      if (hover) {
        on(t, "mouseenter", () => show(t));
        on(t, "mouseleave", later);
      } else {
        on(t, "click", () => (pop.dataset.open === "true" && current === t.dataset.key ? hide() : show(t)));
      }
      on(t, "focus", () => show(t));
      on(t, "blur", later);
    }
    on(inner, "mouseenter", stop);
    on(inner, "mouseleave", later);
    on(inner, "focusin", stop);
    on(inner, "focusout", later);
    const esc = (e) => { if (e.key === "Escape") hide(); };
    on(document, "keydown", esc);
    hide();

    return () => {
      stop();
      offs.forEach((f) => f());
      menus.forEach((m) => { m.hidden = false; });
      triggers.forEach((t) => { delete t.dataset.active; t.removeAttribute("aria-expanded"); t.removeAttribute("aria-haspopup"); });
      delete pop.dataset.open;
      inner.style.transform = "";
      ["--fx-slide", "--fx-slide-ease"].forEach((v) => inner.style.removeProperty(v));
      ["--fx-fade", "--fx-fade-ease"].forEach((v) => pop.style.removeProperty(v));
    };
  });
})();
