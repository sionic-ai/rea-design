(() => {
  // Original (a pill menu at bottom center of a portfolio site): the white handle sits under the current page cell, and when the cell that opens the panel (Contact) is pressed it moves to that cell
  // slides with .46s cubic-bezier(.77,0,.18,1), and two panels rise at the upper right of the pill from 8px below and transparent on the same curve — the panel nearer the pill first, the others .1s · .2s later.
  // Pressing anywhere outside the board or another cell folds the board and the handle returns to the current page cell.
  kfFx.register("pill-handle-pop", (el, { options, reduce }) => {
    const handle = el.querySelector('[data-fx-part="handle"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!handle || !items.length) return;
    const pop = el.querySelector('[data-fx-part="pop"]');
    const cards = pop ? [...pop.querySelectorAll('[data-fx-part="card"]')] : [];
    const dur = reduce ? 0 : +(options.dur ?? 0.46);
    const each = reduce ? 0 : +(options.each ?? 0.1);
    const rise = +(options.rise ?? 8);
    const ease = kfFx.ease(options.ease || "0.77,0,0.18,1", "power4.inOut");
    const home = () => items.find((i) => i.getAttribute("aria-current") === "page") || items[0];
    const opener = items.find((i) => i.hasAttribute("data-pop")) || null;
    let open = false;
    const place = (item, d) => {
      gsap.to(handle, { x: item.offsetLeft - items[0].offsetLeft, width: item.offsetWidth, duration: d, ease, overwrite: true });
    };
    gsap.set(handle, { left: items[0].offsetLeft, width: home().offsetWidth });
    place(home(), 0);
    if (cards.length) gsap.set(cards, { autoAlpha: 0, y: rise });
    const setOpen = (on) => {
      if (on === open) return;
      open = on;
      place(on && opener ? opener : home(), dur);
      el.classList.toggle("is-fx-open", on);
      // Plates closest to the pill (bottom) rise first — with n plates, the last plate is delayed by each, the first by each × n
      cards.forEach((c, i) => gsap.to(c, { autoAlpha: on ? 1 : 0, y: on ? 0 : rise, duration: dur, delay: (cards.length - i) * each, ease, overwrite: true }));
    };
    const onItem = (e) => {
      const it = e.currentTarget;
      if (it === opener) { e.stopPropagation(); setOpen(true); }
      else setOpen(false);
    };
    const outside = (e) => { if (open && !(pop && pop.contains(e.target))) setOpen(false); };
    const ro = new ResizeObserver(() => place(open && opener ? opener : home(), 0));
    items.forEach((i) => i.addEventListener("click", onItem));
    document.addEventListener("click", outside);
    ro.observe(el);
    return () => {
      items.forEach((i) => i.removeEventListener("click", onItem));
      document.removeEventListener("click", outside);
      ro.disconnect();
      gsap.killTweensOf([handle, ...cards]);
      gsap.set([handle, ...cards], { clearProps: "all" });
    };
  });
})();
