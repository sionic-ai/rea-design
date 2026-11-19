(() => {
  // The hovered cell gets wide and tall, neighbors get medium height, the rest low — cell widths split the remaining width equally
  kfFx.register("focus-columns", (el, { options, reduce, hover }) => {
    const cols = [...el.querySelectorAll(':scope > [data-fx-part="col"]')];
    // Touch devices have no hover, so cells are not overlapped — the consuming css (horizontal drag list) stands as it is
    // Not pinned even on narrow screens (the user decides with min) — the original switches to a horizontal drag list below 1100px
    if (cols.length < 2 || !hover || innerWidth < +(options.min || 0)) return;
    const large = +(options.large ?? 0.3194);
    const tall = +(options.tall ?? 1.217);
    const mid = +(options.mid ?? 0.826);
    const low = +(options.low ?? 0.696);
    const gap = +(options.gap ?? 0);
    const rest = +(options.rest ?? 0);
    const dur = +(options.dur ?? 1.2);
    const ease = kfFx.ease(options.ease || "power4.out", "power4.out");
    let index = -1, tl = null, W = 0;

    const cardOf = (c) => c.querySelector('[data-fx-part="card"]');
    const sizes = () => {
      W = el.clientWidth;
      const L = W * large;
      const small = (W - L - gap * (cols.length - 1)) / (cols.length - 1);
      return { L, small };
    };
    // Like the original, stack the cells (absolute) and push them by x — the front of a wide cell moves by narrow widths, the back starts after the wide width
    let extra = 0;
    const set = (i, instant) => {
      index = i;
      const { L, small } = sizes();
      tl?.kill();
      tl = gsap.timeline({ defaults: { duration: instant || reduce ? 0 : dur, ease, overwrite: "auto" } });
      cols.forEach((c, k) => {
        const card = cardOf(c);
        const near = Math.abs(k - i) === 1;
        c.classList.toggle("is-focus", k === i);
        c.classList.toggle("is-near", near);
        tl.to(c, { width: k === i ? L : small, x: k === 0 ? 0 : k <= i ? k * (small + gap) : L + gap + (k - 1) * (small + gap) }, 0);
        if (card) tl.to(card, { height: (k === i ? tall : near ? mid : low) * L }, 0);
      });
      gsap.set(el, { height: Math.max(tall * L + extra, minH) });
    };
    // Row height is set by the cell height, but the min-height in the consuming css is respected
    const minH = parseFloat(getComputedStyle(el).minHeight) || 0;
    gsap.set(el, { position: "relative" });
    gsap.set(cols, { position: "absolute", top: 0, left: 0 });
    { const c0 = cols[0], k0 = cardOf(c0); extra = k0 ? c0.offsetHeight - k0.offsetHeight : 0; }
    set(rest, true);

    const ro = new ResizeObserver(() => { if (Math.abs(el.clientWidth - W) > 1) set(index, true); });
    ro.observe(el);

    const enters = cols.map((c, k) => {
      const fn = () => { if (k !== index) set(k); };
      c.addEventListener("pointerenter", fn);
      return fn;
    });
    const leave = () => set(rest);
    el.addEventListener("pointerleave", leave);
    return () => {
      cols.forEach((c, k) => c.removeEventListener("pointerenter", enters[k]));
      el.removeEventListener("pointerleave", leave);
      ro.disconnect();
      tl?.kill();
      gsap.set([el, ...cols, ...cols.map(cardOf).filter(Boolean)], { clearProps: "all" });
    };
  });
})();
