(() => {
  // Original js-floorthreshold + vertical paging: each time a stop in the scroll flow crosses the screen baseline (55%), the content of the detail panel stuck to the screen swaps with a .2s fade,
  // Up/down buttons take you to the neighboring stop in 450ms cubic(.039,.365,.609,1). The plate runs --fx-from 0→1 over min(27.78vw,400px) before the first stop, of
  // Appears with powers (size pow(f,5)×.1+.9 · opacity pow(f,15)), and once the bottom edge below the last stop passes the baseline, the pin is released and it scrolls up with the page
  kfFx.register("line-cross-detail", (el, { options, reduce, scroller }) => {
    const stops = [...el.querySelectorAll('[data-fx-part="stop"]')];
    const panel = el.querySelector('[data-fx-part="panel"]');
    if (!stops.length || !panel) return;
    const body = panel.querySelector('[data-fx-part="body"]') || panel;
    const prev = el.querySelector('[data-fx-part="prev"]'), next = el.querySelector('[data-fx-part="next"]');
    const line = +(options.line ?? 55), fade = +(options.fade ?? 0.2), dur = +(options.dur ?? 0.45);
    const ease = gsap.parseEase(kfFx.ease(options.ease || "0.039,0.365,0.609,1", "power2.out"));
    const fromPx = () => (options.from != null ? +options.from : Math.min(innerWidth * 0.2778, 400));
    const top = () => (scroller ? scroller.scrollTop : scrollY);
    const viewH = () => (scroller ? scroller.clientHeight : innerHeight);
    const stageY = (i) => {
      const r = stops[i].getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0);
      return r + top() - (viewH() * line) / 100 + 2;
    };
    el.style.setProperty("--fx-fade", `${fade}s`);
    let cur = -1, timer = 0, raf = 0;
    const fill = (i) => {
      const tpl = stops[i].querySelector("template");
      if (tpl) body.replaceChildren(tpl.content.cloneNode(true));
      el.dataset.current = stops[i].dataset.key ?? String(i);
      prev?.setAttribute("aria-disabled", String(i <= 0));
      next?.setAttribute("aria-disabled", String(i >= stops.length - 1));
      el.dispatchEvent(new CustomEvent("fx:select", { detail: { index: i, stop: stops[i] } }));
    };
    const select = (i) => {
      i = Math.max(0, Math.min(stops.length - 1, i));
      if (i === cur) return;
      cur = i;
      clearTimeout(timer);
      if (reduce || !fade) return fill(i);
      panel.classList.add("is-switching");
      timer = setTimeout(() => { fill(i); panel.classList.remove("is-switching"); }, fade * 1000);
    };
    const go = (i) => {
      if (i < 0 || i >= stops.length) return;
      cancelAnimationFrame(raf);
      const y0 = top(), y1 = stageY(i), t0 = performance.now(), ms = reduce ? 0 : dur * 1000;
      const step = (now) => {
        const p = ms ? Math.min(1, Math.max(0, now - t0) / ms) : 1;
        const y = y0 + (y1 - y0) * ease(p);
        scroller ? (scroller.scrollTop = y) : scrollTo(0, y);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const onPrev = () => prev.getAttribute("aria-disabled") !== "true" && go(cur - 1);
    const onNext = () => next.getAttribute("aria-disabled") !== "true" && go(cur + 1);
    prev?.addEventListener("click", onPrev);
    next?.addEventListener("click", onNext);
    const onGo = (e) => go(+e.detail);
    el.addEventListener("fx:go", onGo);

    const sts = stops.map((s, i) => ScrollTrigger.create({ trigger: s, scroller, start: `top ${line}%`, onEnter: () => select(i), onLeaveBack: () => select(i - 1) }));
    const setFrom = (s) => {
      el.style.setProperty("--fx-from", s.progress.toFixed(4));
      el.classList.toggle("is-live", s.progress > 0.99 && !el.classList.contains("is-leave"));
    };
    sts.push(ScrollTrigger.create({ scroller, start: () => Math.max(0, stageY(0) - fromPx()), end: () => stageY(0), onUpdate: setFrom, onRefresh: setFrom }));
    sts.push(ScrollTrigger.create({
      trigger: stops[stops.length - 1], scroller, start: `bottom ${line}%`, end: "max",
      onToggle: (s) => { el.classList.toggle("is-leave", s.isActive); el.classList.toggle("is-live", !s.isActive && s.progress === 0 && top() >= stageY(0) - 1); },
      onUpdate: (s) => el.style.setProperty("--fx-shift", Math.max(0, s.scroll() - s.start).toFixed(1)),
      onLeaveBack: () => el.style.setProperty("--fx-shift", 0),
    }));
    // Initial position — show the last of the stops already passed right away (no fade)
    const first = Math.max(0, stops.findLastIndex((_, i) => top() >= stageY(i) - 2));
    cur = first;
    fill(first);
    if (reduce) el.style.setProperty("--fx-from", 1);
    return () => {
      sts.forEach((s) => s.kill());
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      prev?.removeEventListener("click", onPrev);
      next?.removeEventListener("click", onNext);
      el.removeEventListener("fx:go", onGo);
      panel.classList.remove("is-switching");
      el.classList.remove("is-live", "is-leave");
      ["--fx-from", "--fx-shift", "--fx-fade"].forEach((v) => el.style.removeProperty(v));
      delete el.dataset.current;
    };
  });
})();
