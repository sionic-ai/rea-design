(() => {
  // Tab benchmark — each tab has data-values (0~1, comma separated). Pressing a tab slides the pill behind the tabs to that tab’s position and width,
  // The bar grows and shrinks to a new length in .52s (0.22,1,0.36,1) while the value text changes. At first it fills once from 0 when it becomes visible
  kfFx.register("tab-bar-swap", (el, { options, reduce, scroller }) => {
    const tabs = [...el.querySelectorAll('[data-fx-part="tab"]')];
    const bars = [...el.querySelectorAll('[data-fx-part="bar"]')];
    if (!tabs.length || !bars.length) return;
    const pill = el.querySelector('[data-fx-part="pill"]');
    const vals = [...el.querySelectorAll('[data-fx-part="value"]')];
    const dur = +(options.dur ?? 0.52), slide = +(options.slide ?? 0.3), digits = +(options.digits ?? 1);
    const ease = kfFx.ease(options.ease || "0.22,1,0.36,1", "expo.out");
    const setOf = (t) => (t.dataset.values || "").split(",").map(Number);
    let now = Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"));
    const place = (i, instant) => {
      const t = tabs[i];
      if (pill) gsap.to(pill, { x: t.offsetLeft, width: t.offsetWidth, duration: instant || reduce ? 0 : slide, ease, overwrite: true });
    };
    const show = (i, instant) => {
      now = i;
      tabs.forEach((t, k) => { t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      place(i, instant);
      const set = setOf(tabs[i]);
      bars.forEach((b, k) => {
        const v = set[k] ?? 0;
        gsap.to(b, { width: `${v * 100}%`, duration: instant || reduce ? 0 : dur, ease, overwrite: true });
        if (vals[k]) vals[k].textContent = `${(v * 100).toFixed(digits)}%`;
      });
    };
    gsap.set(bars, { width: 0 });
    place(now, true);
    const clicks = tabs.map((t, i) => { const f = () => show(i); t.addEventListener("click", f); return () => t.removeEventListener("click", f); });
    const key = (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const i = (now + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
      show(i); tabs[i].focus();
    };
    el.addEventListener("keydown", key);
    const ro = new ResizeObserver(() => place(now, true));
    ro.observe(el);
    const st = window.ScrollTrigger ? ScrollTrigger.create({ trigger: el, scroller: scroller || undefined, start: options.start || "top 85%", once: true, onEnter: () => show(now) }) : (show(now), null);
    return () => { clicks.forEach((f) => f()); el.removeEventListener("keydown", key); ro.disconnect(); st && st.kill(); gsap.killTweensOf([pill, ...bars].filter(Boolean)); gsap.set([pill, ...bars].filter(Boolean), { clearProps: "all" }); };
  });
})();
