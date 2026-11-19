(() => {
  kfFx.register("drawer-sheet", (el, { options, reduce }) => {
    const sheets = [...el.querySelectorAll('[data-fx-part="sheet"]')];
    if (!sheets.length) return;
    const dur = reduce ? 0 : +(options.dur ?? 0.6), under = reduce ? 0 : +(options.under ?? 0.8);
    const ease = kfFx.ease(options.ease || "expo.out", "expo.out");
    const flick = +(options.flick ?? 500), ratio = +(options.ratio ?? 0.5);
    const backdrop = document.createElement("div");
    backdrop.dataset.fxPart = "backdrop";
    el.append(backdrop);
    const handles = sheets.map((s) => { const h = document.createElement("div"); h.dataset.fxPart = "handle"; h.innerHTML = "<span></span>"; s.prepend(h); return h; });
    const stack = [];
    let busy = false;
    const go = (t, vars) => gsap.to(t, { duration: dur, ease, overwrite: "auto", ...vars }).then();
    // Stacked panel underneath: moves down 2rem and scales to .94, darker (the original is a black overlay at .15 — brightness .85 for the same amount)
    const sink = (s, on) => go(s, { duration: under, ease: "power2.out", y: on ? "2rem" : 0, scale: on ? 0.94 : 1, filter: on ? "brightness(0.85)" : "brightness(1)" });
    const open = async (key) => {
      const s = sheets.find((x) => x.dataset.key === key) || (!key && sheets[0]);
      if (!s || busy || stack.includes(s)) return;
      busy = true;
      const prev = stack.at(-1);
      stack.push(s);
      el.setAttribute("data-open", "");
      gsap.set(s, { visibility: "visible", yPercent: 100, y: 0 });
      await Promise.all([go(s, { yPercent: 0 }), prev ? sink(prev, true) : go(backdrop, { opacity: 1 })]);
      s.focus?.({ preventScroll: true });
      busy = false;
    };
    const close = async (fast) => {
      const s = stack.at(-1);
      if (!s || busy) return;
      busy = true;
      const prev = stack.at(-2);
      if (!fast) await Promise.all([go(s, { yPercent: 100, y: 0 }), prev ? sink(prev, false) : go(backdrop, { opacity: 0 })]);
      stack.pop();
      gsap.set(s, { visibility: "hidden" });
      if (!stack.length) el.removeAttribute("data-open");
      busy = false;
    };
    const onClick = (e) => {
      const t = e.target.closest('[data-fx-part="open"], [data-fx-part="close"], [data-fx-part="backdrop"]');
      if (!t || !el.contains(t)) return;
      e.preventDefault();
      t.dataset.fxPart === "open" ? open(t.dataset.key) : close();
    };
    const onKey = (e) => { if (e.key === "Escape" && stack.length) close(); };
    el.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    // Drag to close: the handle works with mouse and finger, the panel body only when swiping down from the top with a finger. Upward it stretches only by the square root.
    // If the speed exceeds flick or the drag exceeds ratio of the panel height, it closes in remaining distance / speed (.15~.45s), otherwise it returns in .4s.
    const obs = window.Observer ? sheets.map((s) => {
      let grab = null, dy = 0, h = 0;
      return Observer.create({
        target: s, type: "touch,pointer", lockAxis: true, dragMinimum: 6, preventDefault: false,
        onPress: (o) => { dy = 0; h = s.offsetHeight; const t = o.event.target; grab = stack.at(-1) !== s ? false : t.closest('[data-fx-part="handle"]') ? true : o.event.pointerType === "mouse" || s.scrollTop > 0 ? false : null; },
        onDrag: (o) => {
          if (o.axis === "x") return;
          if (grab === null) grab = o.deltaY > 0;
          if (!grab) return;
          o.event.cancelable && o.event.preventDefault();
          dy = (o.y ?? 0) - (o.startY ?? 0);
          gsap.set(s, { y: dy > 0 ? dy : -Math.sqrt(-dy) });
          if (stack.length === 1) gsap.set(backdrop, { opacity: 1 - gsap.utils.clamp(0, 1, dy / h) });
        },
        onRelease: async (o) => {
          if (!grab || dy === 0) return;
          grab = null;
          if (dy > 0 && (o.velocityY > flick || dy > h * ratio)) {
            const d = reduce ? 0 : gsap.utils.clamp(0.15, 0.45, (h - Number(gsap.getProperty(s, "y"))) / Math.max(o.velocityY, 1));
            const prev = stack.at(-2);
            await Promise.all([go(s, { yPercent: 100, y: 0, duration: d, ease: "power2.out" }), prev ? sink(prev, false) : go(backdrop, { opacity: 0, duration: d })]);
            close(true);
          } else {
            go(s, { y: 0, duration: reduce ? 0 : 0.4 });
            if (stack.length === 1) go(backdrop, { opacity: 1, duration: reduce ? 0 : 0.4 });
          }
        },
      });
    }) : [];
    el.addEventListener("fx:open", (e) => open(e.detail?.key));
    el.addEventListener("fx:close", () => close());
    return () => {
      el.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      obs.forEach((o) => o.kill());
      gsap.killTweensOf([backdrop, ...sheets]);
      gsap.set(sheets, { clearProps: "all" });
      handles.forEach((h) => h.remove());
      backdrop.remove();
      el.removeAttribute("data-open");
    };
  });
})();
