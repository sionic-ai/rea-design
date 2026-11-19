(() => {
  // Original slidesScrollVertical: while the section stays pinned and scrolls (item count × 100%), the left title stack rises by the height of each passed title,
  // The previous item’s body folds to height 0 and transparent while the current item’s body unfolds to a height of ‹screen height − header − title stack›. On the right the next photo panel
  // Rises from 100% below and covers. Item t sits at timeline position 1 + 1.2(t−1) with length 1 (no curve, scrub). Past ones get is-passed · upcoming ones get is-upcoming.
  kfFx.register("slides-scroll-vertical", (el, { options, reduce, scroller }) => {
    const stack = el.querySelector('[data-fx-part="stack"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')], medias = [...el.querySelectorAll('[data-fx-part="media"]')];
    if (!stack || !items.length || !window.gsap || !window.ScrollTrigger) return;
    const pad = +(options.pad ?? 15);
    const headH = () => { const h = options.head && document.querySelector(options.head); return h ? h.offsetHeight : +(options.top ?? 0); };
    const textOf = (it) => it.querySelector('[data-fx-part="text"]');
    const mark = (i) => {
      items.forEach((it, k) => { it.classList.toggle("is-passed", k < i); it.classList.toggle("is-upcoming", k > i); it.classList.toggle("is-on", k === i); });
      medias.forEach((m, k) => { m.classList.toggle("is-passed", k < i); m.classList.toggle("is-upcoming", k > i); });
    };
    if (reduce) { items.forEach((it) => { const t = textOf(it); if (t) gsap.set(t, { height: "auto", opacity: 1 }); }); mark(0); return () => {}; }
    let tl = null;
    const build = () => {
      tl?.scrollTrigger?.kill(true); tl?.kill();
      const offs = []; let sum = 0;
      items.forEach((it) => { offs.push(sum); const t = it.querySelector('[data-fx-part="title"]'); sum += (t ? t.offsetHeight : 0) + pad * 2; });
      const room = Math.max(0, innerHeight - headH() - sum);
      medias.forEach((m, k) => gsap.set(m, { zIndex: k + 1, yPercent: k ? 100 : 0 }));
      items.forEach((it, k) => { const t = textOf(it); if (t) gsap.set(t, { height: k ? 0 : room, opacity: k ? 0 : 1 }); });
      gsap.set(stack, { y: 0 });
      const at = items.map((_, k) => (k === 1 ? 1 : 1 + 1.2 * (k - 1)));
      const cur = () => { const time = tl ? tl.time() : 0; let i = 0; at.forEach((a, k) => { if (k && time >= a + 0.5) i = k; }); return i; };
      tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { scroller, trigger: el, start: options.start || "top top", end: () => `+=${100 * items.length}%`, scrub: true, pin: true, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: () => mark(cur()) } });
      items.forEach((it, k) => {
        if (!k) return;
        const prev = textOf(items[k - 1]), t = textOf(it), l = at[k];
        if (prev) tl.to(prev, { height: 0, opacity: 0, duration: 1 }, l);
        if (t) tl.to(t, { height: room, opacity: 1, duration: 1 }, l);
        if (medias[k]) tl.to(medias[k], { yPercent: 0, duration: 1 }, l);
        tl.to(stack, { y: -offs[k], duration: 1 }, l);
      });
      tl.to({}, { duration: 1 }, at[items.length - 1] + 1);
      mark(cur());
    };
    build();
    // Heading height changes if the font arrives late or the width changes — body height changes on every scroll, so watch only the section width, not a dummy
    // Rebuilding creates new spacing, so re-measure the positions of the pinned sections that follow.
    // Newly created triggers are appended at the list end and measured later than the sections below (on narrow screens a lower pinned section overlapped the panel) so re-sort them in page order
    const rebuild = () => { if (!el.isConnected) return; build(); ScrollTrigger.sort(); ScrollTrigger.refresh(); };
    document.fonts?.ready.then(rebuild);
    let rt, w = el.offsetWidth; const ro = new ResizeObserver(() => { if (el.offsetWidth === w) return; w = el.offsetWidth; clearTimeout(rt); rt = setTimeout(rebuild, 200); });
    ro.observe(el);
    return () => { clearTimeout(rt); ro.disconnect(); tl?.scrollTrigger?.kill(true); tl?.kill(); gsap.set([stack, ...medias, ...items.map(textOf).filter(Boolean)], { clearProps: "all" }); items.forEach((it) => it.classList.remove("is-passed", "is-upcoming", "is-on")); medias.forEach((m) => m.classList.remove("is-passed", "is-upcoming")); };
  });
})();
