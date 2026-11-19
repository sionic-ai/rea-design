(() => {
  kfFx.register("rubberband-bars", (el, { options, reduce, hover }) => {
    const strip = el.querySelector('[data-fx-part="strip"]');
    const bars = [...el.querySelectorAll('[data-fx-part="bar"]')];
    if (reduce || !strip || bars.length < 2) return;
    // Wrap the bar in a layer to make a panel to pin, keeping the line’s space as is
    const row = document.createElement("div");
    row.append(...bars);
    strip.append(row);
    const space = document.createElement("div");
    space.style.height = options.space || "35vh";
    space.setAttribute("aria-hidden", "true");
    el.append(space);
    const edge = +(options.edge ?? 0.2), back = +(options.back ?? 0.8), c = (bars.length - 1) / 2;
    const weights = bars.map((_, i) => edge + (1 - edge) * (1 - Math.abs(i - c) / c));
    const set = bars.map((b) => gsap.quickSetter(b, "scaleY"));
    const pin = (on) => strip.classList.toggle("fx-pinned", on);
    let barH = 12, maxPull = 0, enough = true, st = null, timer = 0, returning = false;
    const measure = () => {
      barH = bars[0].offsetHeight || 12;
      enough = document.documentElement.scrollHeight - space.offsetHeight > innerHeight * 1.35;
      space.style.display = enough && hover ? "" : "none";
      maxPull = Math.max((hover ? space.offsetHeight : innerHeight * 0.28) - barH, 0);
      if (!enough) { pin(false); gsap.set(bars, { scaleY: 1 }); }
    };
    const stretch = (p) => set.forEach((s, i) => s(1 + (p * maxPull * weights[i]) / barH));
    const expo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const release = () => {
      clearTimeout(timer);
      if (returning || !enough || !st || st.progress <= 0.001) return;
      returning = true;
      const done = () => (returning = false);
      if (window.lenis?.scrollTo) window.lenis.scrollTo(st.start, { duration: back, easing: expo, onComplete: done });
      else { const o = { y: scrollY }; gsap.to(o, { y: st.start, duration: back, ease: expo, onUpdate: () => scrollTo(0, o.y), onComplete: done }); }
    };
    const wheel = () => { returning = false; clearTimeout(timer); timer = setTimeout(release, 100); };
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(document.body);
    if (hover) {
      st = ScrollTrigger.create({ trigger: space, start: "top bottom", end: "bottom bottom", invalidateOnRefresh: true,
        onRefresh: measure, onUpdate: (s) => enough && stretch(s.progress),
        onEnter: () => enough && pin(true), onEnterBack: () => enough && pin(true), onLeaveBack: () => pin(false) });
      addEventListener("wheel", wheel, { passive: true });
      addEventListener("keyup", release);
    }
    const state = { p: 0 };
    let oy = 0, pulling = false, tw = null;
    const ts = (e) => { pulling = false; oy = e.touches[0].clientY; };
    const tm = (e) => {
      if (!enough) return;
      const y = e.touches[0].clientY;
      if (!pulling) {
        if (oy - y <= 0 || scrollY + innerHeight < document.documentElement.scrollHeight - 2) { oy = y; return; }
        tw?.kill(); measure(); pin(true); pulling = true; oy = y; return;
      }
      state.p = maxPull ? 1 - Math.exp((-Math.max(oy - y, 0) * 0.75) / maxPull) : 0;
      stretch(state.p);
    };
    const te = () => { if (!pulling) return; pulling = false; tw = gsap.to(state, { p: 0, duration: 0.9, ease: "elastic.out(1, 0.55)", onUpdate: () => stretch(state.p), onComplete: () => pin(false) }); };
    if (!hover) {
      addEventListener("touchstart", ts, { passive: true });
      addEventListener("touchmove", tm, { passive: true });
      addEventListener("touchend", te, { passive: true });
    }
    return () => {
      clearTimeout(timer);
      tw?.kill();
      st?.kill();
      ro.disconnect();
      removeEventListener("wheel", wheel);
      removeEventListener("keyup", release);
      removeEventListener("touchstart", ts);
      removeEventListener("touchmove", tm);
      removeEventListener("touchend", te);
      pin(false);
      gsap.set(bars, { clearProps: "transform" });
      strip.append(...bars);
      row.remove();
      space.remove();
    };
  });
})();
