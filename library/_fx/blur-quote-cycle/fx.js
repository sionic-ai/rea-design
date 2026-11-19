(() => {
  kfFx.register("blur-quote-cycle", (el, { options, reduce }) => {
    const tabs = [...el.querySelectorAll('[data-fx-part="tab"]')];
    const panes = [...el.querySelectorAll('[data-fx-part="quote"]')];
    if (!tabs.length || tabs.length !== panes.length) return;
    const pill = el.querySelector('[data-fx-part="pill"]');
    const every = +options.every || 8;
    const dur = +(options.dur ?? 0.8);
    const ease = kfFx.ease(options.ease || "0.22,1,0.36,1", "power3.out");
    let at = Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"));
    let timer = null, visible = false;

    const parts = (p) => ({ text: [...p.children].find((c) => c.getAttribute("data-fx-part") !== "by"), by: p.querySelector('[data-fx-part="by"]') });
    const movePill = (instant) => {
      if (!pill) return;
      const t = tabs[at];
      const to = { x: t.offsetLeft, width: t.offsetWidth };
      if (instant || reduce) gsap.set(pill, to); else gsap.to(pill, { ...to, duration: 0.5, ease, overwrite: true });
    };
    const mark = () => tabs.forEach((t, i) => {
      t.setAttribute("aria-selected", String(i === at));
      panes[i].toggleAttribute("data-quote-on", i === at);
    });

    function show(next, instant) {
      if (next === at && !instant) return;
      const old = panes[at];
      at = next;
      mark();
      movePill(instant);
      const cur = panes[at], o = parts(old), n = parts(cur);
      if (instant || reduce) {
        panes.forEach((p, i) => gsap.set(p, { autoAlpha: i === at ? 1 : 0 }));
        return;
      }
      gsap.killTweensOf([old, cur, o.text, o.by, n.text, n.by].filter(Boolean));
      gsap.to(old, { autoAlpha: 0, duration: 0.48, ease });
      if (o.text) gsap.to(o.text, { y: -10, filter: "blur(5px)", duration: dur, ease });
      if (o.by) gsap.to(o.by, { y: -4, duration: dur, ease });
      gsap.fromTo(cur, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.48, ease });
      if (n.text) gsap.fromTo(n.text, { y: 10, filter: "blur(5px)" }, { y: 0, filter: "blur(0px)", duration: dur, ease });
      if (n.by) gsap.fromTo(n.by, { y: 6, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: dur, ease, delay: 0.1 });
    }

    const tick = () => { show((at + 1) % tabs.length); arm(); };
    const arm = () => { timer?.kill(); timer = visible && !reduce ? gsap.delayedCall(every, tick) : null; };
    const onClick = (e) => {
      const i = tabs.indexOf(e.currentTarget);
      if (i < 0) return;
      show(i);
      arm();
    };
    tabs.forEach((t) => t.addEventListener("click", onClick));
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; arm(); });
    io.observe(el);
    const ro = new ResizeObserver(() => movePill(true));
    ro.observe(el);
    show(at, true);

    return () => {
      timer?.kill();
      io.disconnect();
      ro.disconnect();
      tabs.forEach((t) => t.removeEventListener("click", onClick));
      gsap.killTweensOf(panes);
      panes.forEach((p) => { p.removeAttribute("data-quote-on"); gsap.set([p, ...p.querySelectorAll("*")], { clearProps: "all" }); });
      if (pill) gsap.set(pill, { clearProps: "all" });
    };
  });
})();
