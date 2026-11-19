// Order and values of the Bootstrap 5 modal fade — pressing a photo first fades the backdrop in over .15s linear, and once it is fully in, the window fades in from transparent over .15s linear and settles down from 50px above in .3s ease-out.
// On close the window turns off over the same duration and moves back up 50px, and once the window is off the veil lifts in .15s. Close via the veil, outside the window, the close button, or Esc.
(() => {
  kfFx.register("drop-fade-modal", (el, { options, reduce }) => {
    const items = () => [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items().length) return;
    const ac = new AbortController(), on = { signal: ac.signal };
    const sec = (k, d) => (reduce ? 0 : +(options[k] ?? d));
    const fade = sec("fade", 0.15), dur = sec("dur", 0.3);
    el.style.setProperty("--fx-fade", `${fade}s`);
    el.style.setProperty("--fx-dur", `${dur}s`);
    el.style.setProperty("--fx-drop", `${-(+(options.drop ?? 50))}px`);
    el.style.setProperty("--fx-veil", String(+(options.veil ?? 0.5)));
    el.style.setProperty("--fx-tint", `${+(options.tint ?? 0.4) * 100}%`);

    const backdrop = document.createElement("div");
    backdrop.setAttribute("data-fx-part", "backdrop");
    const modal = document.createElement("div");
    modal.setAttribute("data-fx-part", "modal");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", options.label || "View Large");
    modal.tabIndex = -1;
    modal.innerHTML = '<div data-fx-part="dialog"><div data-fx-part="box"><button type="button" data-fx-part="close" aria-label="Close">×</button><div data-fx-part="body"></div><p data-fx-part="caption"></p></div></div>';
    const body = modal.querySelector('[data-fx-part="body"]');
    const caption = modal.querySelector('[data-fx-part="caption"]');
    const closeBtn = modal.querySelector('[data-fx-part="close"]');

    let open = false, timers = [], back = null, padded = "";
    const later = (fn, s) => timers.push(setTimeout(fn, s * 1000));
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    // Window after the curtain is up — attaching and adding the class right away jumps to the end value with no transition, so draw once first, then is-show
    const show = (item) => {
      if (open) return;
      open = true;
      clear();
      const art = item.querySelector('[data-fx-part="media"]') || item.firstElementChild || item;
      const copy = art.cloneNode(true);
      [copy, ...copy.querySelectorAll("[data-fx-part], [id]")].forEach((n) => { n.removeAttribute("data-fx-part"); n.removeAttribute("id"); });
      body.replaceChildren(copy);
      caption.textContent = item.dataset.caption || "";
      caption.hidden = !caption.textContent;
      back = document.activeElement;
      // As in the original, lock scrolling and pad the right side by the width of the vanished scrollbar
      const gap = innerWidth - document.documentElement.clientWidth;
      padded = document.body.style.paddingRight;
      if (gap > 0) document.body.style.paddingRight = `${gap}px`;
      document.body.style.overflow = "hidden";
      el.append(backdrop, modal);
      void backdrop.offsetWidth;
      backdrop.classList.add("is-show");
      later(() => {
        modal.classList.add("is-on");
        void modal.offsetWidth;
        modal.classList.add("is-show");
        closeBtn.focus({ preventScroll: true });
        el.dispatchEvent(new CustomEvent("fx:open", { detail: { item } }));
      }, fade);
    };
    const hide = () => {
      if (!open) return;
      open = false;
      clear();
      modal.classList.remove("is-show");
      later(() => {
        modal.classList.remove("is-on");
        backdrop.classList.remove("is-show");
        later(() => {
          backdrop.remove();
          modal.remove();
          body.replaceChildren();
          document.body.style.overflow = "";
          document.body.style.paddingRight = padded;
          if (back && back.isConnected) back.focus({ preventScroll: true });
          el.dispatchEvent(new CustomEvent("fx:close"));
        }, fade);
      }, fade);
    };

    el.addEventListener("click", (e) => {
      if (modal.contains(e.target)) return;
      const item = e.target.closest('[data-fx-part="item"]');
      if (item && el.contains(item)) show(item);
    }, on);
    el.addEventListener("keydown", (e) => {
      const item = e.target.closest?.('[data-fx-part="item"]');
      if (!item || modal.contains(item) || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      show(item);
    }, on);
    // Pressing outside the window (the modal backdrop itself) closes it — pressing on the image·text doesn’t
    modal.addEventListener("click", (e) => { if (e.target === modal || e.target === modal.firstElementChild || e.target === closeBtn) hide(); }, on);
    addEventListener("keydown", (e) => { if (open && e.key === "Escape") hide(); }, on);
    el.addEventListener("fx:close-modal", hide, on);
    items().forEach((item) => { if (!item.hasAttribute("tabindex")) item.tabIndex = 0; });

    return () => {
      ac.abort();
      clear();
      if (open) { document.body.style.overflow = ""; document.body.style.paddingRight = padded; }
      backdrop.remove();
      modal.remove();
      ["fade", "dur", "drop", "veil", "tint"].forEach((k) => el.style.removeProperty(`--fx-${k}`));
    };
  });
})();
