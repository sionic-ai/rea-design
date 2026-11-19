(() => {
  // Several rows of cell strips flow endlessly and speed up when scrolling is fast. Each frame pushes by speed + boost × scroll velocity,
  // Scroll speed is the distance moved per scroll ÷ 50 (max 1), followed at .3 per frame, and band positions follow their target at follow per frame.
  // Dragging moves with the hand, hovering over a row makes that row flow in its own direction and the other rows flow in that row’s direction multiplied. Cells are cloned enough to fill the plate and chained.
  kfFx.register("boost-drag-rows", (el, { options, reduce, hover, scroller }) => {
    const tracks = [...el.querySelectorAll('[data-fx-part="track"]')].filter((t) => t.children.length);
    if (!tracks.length || reduce) return;
    const speed = +(options.speed ?? 1), boost = +(options.boost ?? 20), follow = +(options.follow ?? 0.1), offset = +(options.offset ?? 0);
    const drag = options.drag !== "false";
    const appear = options.appear === "event" || options.appear === "scroll" ? options.appear : "";
    const each = +(options.each ?? 0.1), dur = +(options.dur ?? 1.4), startAt = +(options["start-at"] ?? 0.8);
    const ease = kfFx.ease(options.ease || "0.87,0,0.13,1", "expo.inOut");
    const scrollPos = () => (scroller ? scroller.scrollTop : scrollY);
    const T = tracks.map((t) => {
      const dir = Math.sign(+t.dataset.dir || 1);
      return { el: t, dir, dir0: dir, items: [...t.children], clones: [], cur: 0, tgt: 0, end: 0, base: 0 };
    });
    const all = () => T.flatMap((t) => [...t.items, ...t.clones]);
    let width = -1;
    const measure = () => {
      const w = el.offsetWidth;
      if (w === width) return;
      width = w;
      T.forEach((t) => {
        t.clones.forEach((c) => c.remove());
        t.clones = [];
        const W = t.el.offsetWidth;
        if (!W) return;
        const gap = parseFloat(getComputedStyle(t.el).columnGap) || 0;
        t.base = -(W + gap + offset);
        for (let fin = W; fin < w + W; fin += W)
          t.items.forEach((n) => {
            const c = n.cloneNode(true);
            c.setAttribute("aria-hidden", "true");
            t.clones.push(c);
            t.el.append(c);
          });
        t.cur = t.tgt = t.end = t.base - (appear && !shown ? appearFrom() : W / 2);
      });
      if (appear && !shown) gsap.set(all(), { x: appearFrom() });
    };
    // Entering: cells come into place one after another from off-screen right (window width + 100px), and the flow starts at startAt seconds
    const appearFrom = () => innerWidth + 100;
    let shown = !appear, paused = !!appear, inView = true, down = false, dragging = false, startX = 0;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    let appearTl = null;
    const show = () => {
      if (shown) return;
      shown = true;
      el.style.pointerEvents = "none";
      appearTl = gsap.timeline()
        .to(all(), { x: 0, stagger: each, duration: dur, ease }, 0)
        .call(() => (paused = false), [], startAt)
        .call(() => (el.style.pointerEvents = ""), [], ">");
    };
    let st = null;
    if (appear === "event") el.addEventListener("fx:appear", show);
    if (appear === "scroll" && window.ScrollTrigger) st = ScrollTrigger.create({ trigger: el, scroller, start: "top 80%", once: true, onEnter: show });
    // A draggable strip stops off-screen — only after the entrance has finished (as in the original, strips without dragging always run)
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting));
    if (drag) io.observe(el);

    let last = null, want = 0, rate = 0;
    const onScroll = () => {
      const now = scrollPos();
      if (last !== null) want = Math.min(Math.abs(last - now), 50) / 50;
      last = now;
    };
    (scroller || window).addEventListener("scroll", onScroll, { passive: true });

    const xOf = (e) => e.clientX;
    const onDown = (e) => {
      if (!drag || e.button > 0) return;
      down = true;
      startX = xOf(e);
      el.style.cursor = "grabbing";
    };
    const onMove = (e) => {
      if (!down) return;
      const dx = xOf(e) - startX;
      if (!dragging && Math.abs(dx) > 50) {
        dragging = true;
        all().forEach((n) => (n.style.pointerEvents = "none"));
      }
      T.forEach((t) => (t.tgt = t.dir > 0 ? t.end + dx : t.end - dx));
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.style.cursor = "";
      T.forEach((t) => (t.end = t.tgt));
      setTimeout(() => {
        dragging = false;
        all().forEach((n) => (n.style.pointerEvents = ""));
      }, 0);
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    const enters = T.map((t) => () => {
      const k = t.dir;
      T.forEach((o) => (o.dir = o === t ? 1 : o.dir * k));
    });
    const leave = () => T.forEach((t) => (t.dir = t.dir0));
    if (drag && hover) T.forEach((t, i) => { t.el.addEventListener("pointerenter", enters[i]); t.el.addEventListener("pointerleave", leave); });

    const tick = () => {
      rate += (want - rate) * 0.3;
      const run = !down && !paused && (!drag || inView);
      T.forEach((t) => {
        if (run) {
          t.tgt -= t.dir * (speed + boost * rate);
          t.end = t.tgt;
        }
        t.cur += (t.tgt - t.cur) * follow;
        if (t.base) t.el.style.transform = `translateX(${gsap.utils.wrap(-offset, t.base, t.cur)}px)`;
      });
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      appearTl?.kill();
      st?.kill();
      ro.disconnect();
      io.disconnect();
      (scroller || window).removeEventListener("scroll", onScroll);
      el.removeEventListener("fx:appear", show);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      T.forEach((t, i) => {
        t.el.removeEventListener("pointerenter", enters[i]);
        t.el.removeEventListener("pointerleave", leave);
        t.clones.forEach((c) => c.remove());
        t.el.style.transform = "";
        gsap.set(t.items, { clearProps: "transform,pointerEvents" });
      });
      el.style.cursor = el.style.pointerEvents = "";
    };
  });
})();
