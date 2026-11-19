// Bottom pill — after passing a set section, rolling up makes it float up, and pressing opens it into a list panel (text drops out, the two-line icon moves to center and becomes an X, rows slide in one after another)
(() => {
  kfFx.register("rise-dock-list", (el, { options, reduce, scroller }) => {
    if (!window.gsap) return;
    const part = (name) => el.querySelector(`[data-fx-part="${name}"]`);
    const box = part("box"), toggle = part("toggle");
    if (!box || !toggle) return;
    const list = part("list"), label = part("label"), icon = part("icon");
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')];
    const lines = icon ? [...icon.children].slice(0, 2) : [];
    const after = options.after ? document.querySelector(options.after) : null;
    const threshold = +options.threshold || 16;
    const widthRem = +options.width || 23.25;
    const dur = +(options.dur ?? 0.8);
    const back = +options.back || 1.35;
    const html = document.documentElement;
    const state = { open: false, passed: !after, stopped: false, up: false };
    let flow = null;

    const sync = () => { el.inert = !(state.passed && !state.stopped && state.up); };
    const setOpen = (on) => {
      if (state.open === on) return;
      state.open = on;
      toggle.setAttribute("aria-expanded", String(on));
      if (list) list.inert = !on;
      if (!flow) return;
      if (reduce) return void flow.progress(on ? 1 : 0).pause();
      on ? flow.timeScale(1).play() : flow.timeScale(back).reverse();
    };
    const build = () => {
      flow?.kill();
      const targets = [box, list, label, icon, ...lines, ...rows].filter(Boolean);
      gsap.set(targets, { clearProps: "all" });
      const rem = parseFloat(getComputedStyle(html).fontSize) || 16;
      const w = Math.min(widthRem * rem, innerWidth - 2 * rem);
      if (list) gsap.set(list, { width: w });
      flow = gsap.timeline({ paused: true, defaults: { duration: dur, ease: "expo.out" } })
        .to(box, { width: w, height: (list ? list.offsetHeight : 0) + toggle.offsetHeight }, 0);
      if (label) flow.to(label, { xPercent: 110 }, 0);
      if (icon) {
        const off = toggle.offsetWidth - (icon.offsetLeft + icon.offsetWidth / 2);
        const d = 0.125 * icon.offsetHeight;
        flow.to(icon, { x: -(w / 2 - off) }, 0);
        if (lines[0]) flow.to(lines[0], { y: d, rotation: 45 }, 0);
        if (lines[1]) flow.to(lines[1], { y: -d, rotation: -45 }, 0);
      }
      if (rows.length) flow.fromTo(rows, { x: (i) => -(6 + 10 * i) * rem }, { x: 0, duration: Math.max(0, dur - 0.1) }, Math.min(0.1, dur));
      flow.progress(state.open ? 1 : 0);
    };
    build();
    let raf = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (!state.open) build(); }); });
    ro.observe(html);
    if (list) ro.observe(list);

    const ac = new AbortController();
    const on = (t, ev, fn, o) => t.addEventListener(ev, fn, { signal: ac.signal, ...o });
    on(toggle, "click", () => setOpen(!state.open));
    if (list) on(list, "click", (e) => { if (e.target.closest("a")) setOpen(false); });
    on(window, "keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    on(document, "pointerdown", (e) => { if (state.open && !el.contains(e.target)) setOpen(false); });

    const scrollTop = () => (scroller ? scroller.scrollTop : scrollY);
    let last = scrollTop(), acc = 0;
    on(scroller || window, "scroll", () => {
      const y = scrollTop(), dy = y - last;
      last = y;
      if (!dy) return;
      acc = Math.sign(dy) === Math.sign(acc) ? acc + dy : dy;
      if (acc <= -threshold) state.up = true;
      else if (acc >= threshold) { state.up = false; setOpen(false); }
      sync();
    }, { passive: true });

    const io = after ? new IntersectionObserver(([e]) => {
      state.passed = !e.isIntersecting && e.boundingClientRect.top < 0;
      if (!state.passed) setOpen(false);
      sync();
    }, { root: scroller || null, threshold: 0 }) : null;
    io?.observe(after);
    const mo = new MutationObserver(() => {
      state.stopped = html.classList.contains("lenis-stopped");
      if (state.stopped) setOpen(false);
      sync();
    });
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    sync();

    return () => {
      cancelAnimationFrame(raf);
      ac.abort();
      ro.disconnect();
      io?.disconnect();
      mo.disconnect();
      flow?.kill();
      el.inert = false;
      gsap.set([box, list, label, icon, ...lines, ...rows].filter(Boolean), { clearProps: "all" });
    };
  });
})();
