(() => {
  // On tab press, the indicator pill overshoots the new slot by 6~16px (distance × .08) and returns, squashing to .78 vertically and bouncing back. If there is a panel, the card squishes sideways and
  // The current panel slides away by 35px and the new panel enters from the opposite side, with the height shrinking and growing to fit the new panel. A faint shadow pill follows behind the hovered cell
  kfFx.register("bouncy-tab-pill", (el, { options, reduce }) => {
    const tabs = [...el.querySelectorAll('[data-fx-part="tab"]')];
    const pill = el.querySelector('[data-fx-part="pill"]');
    if (!tabs.length || !pill) return;
    const nav = pill.offsetParent || el;
    const ghost = el.querySelector('[data-fx-part="ghost"]');
    const panels = [...el.querySelectorAll('[data-fx-part="panel"]')];
    const panes = el.querySelector('[data-fx-part="panes"]');
    const stage = el.querySelector('[data-fx-part="stage"]');
    const k = reduce ? 0 : 1, d = (s) => s * k;
    let cur = Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"));
    const box = { l: 0, r: 0 };
    const rect = (t) => {
      const n = nav.getBoundingClientRect(), r = t.getBoundingClientRect();
      return { left: r.left - n.left, right: n.right - r.right, top: r.top - n.top, height: r.height, width: r.width };
    };
    const paint = () => gsap.set(pill, { left: box.l, right: box.r });
    const place = () => {
      const r = rect(tabs[cur]);
      box.l = r.left; box.r = r.right;
      paint();
      gsap.set(pill, { y: r.top, height: r.height });
      tabs.forEach((t, i) => { t.setAttribute("aria-selected", i === cur ? "true" : "false"); t.tabIndex = i === cur ? 0 : -1; });
      if (panes && panels[cur]) gsap.set(panes, { height: panels[cur].offsetHeight });
    };
    gsap.set(pill, { top: 0, right: "auto" });
    panels.forEach((p, i) => gsap.set(p, { autoAlpha: i === cur ? 1 : 0 }));
    const go = (i) => {
      if (i === cur) return;
      const dir = i > cur ? 1 : -1, old = panels[cur], neu = panels[i];
      cur = i;
      const r = rect(tabs[i]), w = Math.abs(r.left - box.l);
      let over = gsap.utils.clamp(+(options["over-min"] ?? 6), +(options["over-max"] ?? 16), 0.08 * w) * dir;
      over = dir > 0 ? Math.min(over, r.right) : Math.max(over, -r.left);
      gsap.killTweensOf([box, pill]);
      gsap.to(pill, { y: r.top, height: r.height, duration: d(0.35), ease: "power3.out" });
      gsap.timeline()
        .to(box, { l: r.left + over, r: r.right - over, duration: d(0.35), ease: "power3.out", onUpdate: paint })
        .to(box, { l: r.left, r: r.right, duration: d(0.25), ease: "power2.inOut", onUpdate: paint });
      if (!reduce) gsap.timeline().to(pill, { scaleY: 0.78, duration: 0.15, ease: "power2.out" }).to(pill, { scaleY: 1, duration: 0.45, ease: "back.out(2.5)" });
      tabs.forEach((t, j) => { t.setAttribute("aria-selected", j === i ? "true" : "false"); t.tabIndex = j === i ? 0 : -1; });
      if (!neu) return;
      const tl = gsap.timeline();
      if (stage && !reduce) tl.to(stage, { scaleX: 0.96, scaleY: 1.02, x: 10 * dir, duration: 0.2, ease: "power2.out" }, 0);
      if (old) tl.to(old, { x: -35 * dir * k, autoAlpha: 0, duration: d(0.2), ease: "power2.out" }, 0);
      if (panes) tl.to(panes, { height: neu.offsetHeight, duration: d(0.3), ease: "power2.inOut" }, d(0.1));
      tl.fromTo(neu, { x: 35 * dir * k, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: d(0.3), ease: "power2.out" }, d(0.2));
      if (stage && !reduce) tl.to(stage, { scaleX: 1, scaleY: 1, x: 0, duration: 0.45, ease: "back.out(2)" }, 0.2);
      if (old) tl.set(old, { x: 0 });
    };
    let shown = false;
    const hoverIn = (e) => {
      if (!ghost) return;
      const r = rect(e.currentTarget);
      const to = { x: r.left, y: r.top, width: r.width, height: r.height };
      if (shown) gsap.to(ghost, { ...to, autoAlpha: 1, duration: d(0.3), ease: "power3.out" });
      else { shown = true; gsap.killTweensOf(ghost); gsap.set(ghost, to); gsap.to(ghost, { autoAlpha: 1, duration: d(0.25), ease: "power2.out" }); }
    };
    const hoverOut = () => { if (!ghost) return; shown = false; gsap.to(ghost, { autoAlpha: 0, duration: d(0.2), ease: "power1.out" }); };
    const click = (e) => go(tabs.indexOf(e.currentTarget));
    const key = (e) => {
      const map = { ArrowRight: Math.min(tabs.length - 1, cur + 1), ArrowLeft: Math.max(0, cur - 1), Home: 0, End: tabs.length - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      go(map[e.key]);
      tabs[cur].focus();
    };
    if (ghost) gsap.set(ghost, { autoAlpha: 0, left: 0, top: 0 });
    tabs.forEach((t) => { t.addEventListener("click", click); t.addEventListener("mouseenter", hoverIn); });
    nav.addEventListener("mouseleave", hoverOut);
    el.addEventListener("keydown", key);
    place();
    const ro = new ResizeObserver(place);
    ro.observe(nav);
    document.fonts.ready.then(place);
    return () => {
      ro.disconnect();
      tabs.forEach((t) => { t.removeEventListener("click", click); t.removeEventListener("mouseenter", hoverIn); });
      nav.removeEventListener("mouseleave", hoverOut);
      el.removeEventListener("keydown", key);
      gsap.killTweensOf([box, pill, ghost, stage, panes, ...panels].filter(Boolean));
    };
  });
})();
