(() => {
  // Webflow tab: the current panel goes down and vanishes in .5s (out), then the new panel rises from 2em below in .5s (in) — the two don’t overlap, so the panel height changes only once
  kfFx.register("pill-tab-slide", (el, { options, reduce }) => {
    if (!window.gsap) return;
    const tabs = [...el.querySelectorAll('[data-fx-part="tab"]')];
    const panels = [...el.querySelectorAll('[data-fx-part="panel"]')];
    if (!tabs.length) return;
    const pill = el.querySelector('[data-fx-part="pill"]');
    const dur = +(options.dur ?? 0.5), rise = options.rise ?? "2em";
    const ease = kfFx.ease(options.ease || "power4.out", "power4.out");
    const vertical = options.axis === "y";
    let now = Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"));
    let tl = null;

    // Vertical list (step tabs) has cell heights that vary with line count, so position and height move together
    const place = (i, d) => {
      if (!pill) return;
      const t = tabs[i], first = tabs[0];
      const to = vertical
        ? { y: t.offsetTop - first.offsetTop, height: t.offsetHeight }
        : { x: t.offsetLeft - first.offsetLeft, width: t.offsetWidth };
      gsap.to(pill, { ...to, duration: d, ease, overwrite: true });
    };
    const mark = (i) => tabs.forEach((t, k) => { t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; t.classList.toggle("is-fx-on", k === i); });
    panels.forEach((p, k) => { p.hidden = k !== now; });
    mark(now);
    place(now, 0);

    const go = (i) => {
      if (i === now || i < 0 || i >= tabs.length) return;
      const from = panels[now], to = panels[i];
      now = i;
      mark(i);
      place(i, reduce ? 0 : dur);
      tl?.progress(1);
      if (!from || !to || reduce) { panels.forEach((p, k) => { p.hidden = k !== i; }); return; }
      tl = gsap.timeline()
        .to(from, { y: rise, opacity: 0, duration: dur, ease })
        .add(() => { from.hidden = true; gsap.set(from, { clearProps: "transform,opacity" }); to.hidden = false; })
        .fromTo(to, { y: rise, opacity: 0 }, { y: 0, opacity: 1, duration: dur, ease });
    };
    const click = (e) => {
      const t = e.target.closest('[data-fx-part="tab"]');
      if (!t || !el.contains(t)) return;
      if (t.tagName === "A") e.preventDefault();
      go(tabs.indexOf(t));
    };
    const key = (e) => {
      const k = tabs.indexOf(e.target);
      if (k < 0) return;
      const next = vertical ? "ArrowDown" : "ArrowRight", prev = vertical ? "ArrowUp" : "ArrowLeft";
      const n = e.key === next ? k + 1 : e.key === prev ? k - 1 : -1;
      if (n < 0 || n >= tabs.length) return;
      e.preventDefault();
      tabs[n].focus();
      go(n);
    };
    const ro = new ResizeObserver(() => place(now, 0));
    ro.observe(el);
    el.addEventListener("click", click);
    el.addEventListener("keydown", key);
    return () => {
      ro.disconnect();
      el.removeEventListener("click", click);
      el.removeEventListener("keydown", key);
      tl?.kill();
      if (pill) gsap.set(pill, { clearProps: "transform,width,height" });
      panels.forEach((p) => gsap.set(p, { clearProps: "transform,opacity" }));
    };
  });
})();
