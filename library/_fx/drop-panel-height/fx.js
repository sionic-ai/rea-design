// Panel below the header menu — measures panel height and opens it in .35s, floating the cells in sequence. Moving between items swaps it right away
(() => {
  kfFx.register("drop-panel-height", (el, { options, hover }) => {
    const box = el.querySelector('[data-fx-part="box"]');
    const toggles = [...el.querySelectorAll('[data-fx-part="toggle"]')];
    if (!box || !toggles.length) return;
    const backdrop = el.querySelector('[data-fx-part="backdrop"]');
    const openD = +(options.open ?? 0.35), closeD = +(options.close ?? 0.25), enterMs = +(options.enter ?? 120), leaveMs = +(options.leave ?? 150);
    const panelOf = (k) => el.querySelector(`[data-fx-part="panel"][data-key="${k}"]`);
    const itemsOf = (p) => [...p.querySelectorAll('[data-fx-part="item"]')];
    const st = { on: null, tl: null, hover: 0, leave: 0 };
    const stag = (n) => (n <= 1 ? 0 : { amount: 0.25 });
    const open = (k) => {
      if (st.on === k) return;
      const p = panelOf(k);
      if (!p) return;
      st.tl?.kill();
      el.querySelectorAll('[data-fx-part="panel"]').forEach((q) => q !== p && gsap.set(q, { autoAlpha: 0, pointerEvents: "none" }));
      gsap.set(p, { visibility: "visible", opacity: 0 });
      const h = p.getBoundingClientRect().height;
      st.on = k;
      el.setAttribute("data-open", "");
      toggles.forEach((t) => t.setAttribute("aria-expanded", String(t.dataset.key === k)));
      const items = itemsOf(p);
      st.tl = gsap.timeline().to(box, { height: h, duration: openD, ease: "power3.out" }, 0).set(p, { autoAlpha: 1, pointerEvents: "auto" }, 0.05);
      if (backdrop) st.tl.to(backdrop, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0);
      if (items.length) st.tl.fromTo(items, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: stag(items.length), ease: "power3.out" }, 0.1);
    };
    const close = () => {
      if (st.on === null) return;
      const p = panelOf(st.on);
      st.tl?.kill();
      const items = p ? itemsOf(p) : [];
      st.tl = gsap.timeline({ onComplete: () => { if (p) gsap.set(p, { autoAlpha: 0, pointerEvents: "none" }); if (items.length) gsap.set(items, { y: 0 }); } });
      if (items.length) st.tl.to(items, { autoAlpha: 0, y: -4, duration: 0.14, ease: "power2.in" }, 0);
      st.tl.to(box, { height: 0, duration: closeD, ease: "power2.in" }, 0.05);
      if (backdrop) st.tl.to(backdrop, { autoAlpha: 0, duration: 0.2, ease: "power2.out" }, 0);
      st.on = null;
      el.removeAttribute("data-open");
      toggles.forEach((t) => t.setAttribute("aria-expanded", "false"));
    };
    const offs = [];
    const on = (n, ev, fn) => { n.addEventListener(ev, fn); offs.push(() => n.removeEventListener(ev, fn)); };
    toggles.forEach((t) => {
      t.setAttribute("aria-expanded", "false");
      if (hover) {
        on(t, "mouseenter", () => { clearTimeout(st.leave); clearTimeout(st.hover); st.hover = setTimeout(() => open(t.dataset.key), st.on !== null ? 0 : enterMs); });
        on(t, "mouseleave", () => { clearTimeout(st.hover); st.leave = setTimeout(close, leaveMs); });
      }
      if (!hover) on(t, "click", () => (st.on === t.dataset.key ? close() : open(t.dataset.key)));
      on(t, "keydown", (e) => { if (e.key === "ArrowDown") { e.preventDefault(); open(t.dataset.key); itemsOf(panelOf(t.dataset.key) || el)[0]?.focus?.(); } });
    });
    if (hover) {
      on(box, "mouseenter", () => clearTimeout(st.leave));
      on(box, "mouseleave", () => { st.leave = setTimeout(close, leaveMs); });
    }
    if (backdrop) on(backdrop, "click", close);
    on(document, "keydown", (e) => e.key === "Escape" && close());
    on(document, "click", (e) => { if (st.on !== null && !el.contains(e.target)) close(); });
    return () => {
      clearTimeout(st.hover); clearTimeout(st.leave); st.tl?.kill();
      offs.forEach((f) => f());
      gsap.set([box, ...el.querySelectorAll('[data-fx-part="panel"], [data-fx-part="item"]'), backdrop].filter(Boolean), { clearProps: "all" });
      el.removeAttribute("data-open");
    };
  });
})();
