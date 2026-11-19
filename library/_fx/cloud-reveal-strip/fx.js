// Each cell of the strip is stood at the center of the board, and at every stop the hand drawing (before) is covered with clouds then lifted to swap to the photo (after), with the decoration (burst)
// Bounces out from the plate center into place. For endless looping, one set is cloned and appended, and on reaching the end of a set it silently resets to the first cell.
// Pauses when off screen. On cover, reveal and rest, it fires fx:cover, fx:reveal and fx:rest on the board so other devices (such as a neighboring character’s expression) imitate it
(() => {
  // The bounce curve the original wrote in a table (overshoots to 1.16, returns and settles at .97) — between table entries it joins straight
  const SPRING = [0, 0.0178, 0.0663, 0.1384, 0.2275, 0.3273, 0.4327, 0.539, 0.6423, 0.7396, 0.8287, 0.9079, 0.9762, 1.0332, 1.079, 1.1139, 1.1387, 1.1544, 1.1619, 1.1625, 1.1574, 1.1478, 1.1348, 1.1194, 1.1027, 1.0854, 1.0682, 1.0517, 1.0363, 1.0224, 1.0102, 0.9999, 0.9913, 0.9846, 0.9796, 0.9762, 0.9742, 0.9734, 0.9737, 0.9749, 0.9767, 0.979, 0.9816, 0.9844, 0.9872, 0.99, 0.9926, 0.995, 0.9972, 0.9991, 1.0006, 1.0019, 1.0029, 1.0036, 1.004, 1.0043, 1.0043, 1.0042, 1.004, 1.0037, 1.0033, 1.0028, 1.0024, 1.0019, 1.0015, 1.001, 1.0007, 1.0003, 1, 0.9998, 0.9996, 0.9995, 0.9994, 0.9993, 0.9993, 0.9993, 0.9993, 0.9994, 0.9994, 0.9995, 0.9996, 0.9996, 0.9997, 0.9998, 0.9999, 0.9999, 1, 1, 1, 1.0001, 1.0001, 1.0001, 1.0001, 1.0001, 1.0001, 1.0001, 1.0001, 1.0001, 1.0001, 1.0001, 1];
  const spring = (t) => { const e = SPRING.length - 1, x = t * e, r = Math.min(Math.floor(x), e - 1); return SPRING[r] + (SPRING[r + 1] - SPRING[r]) * (x - r); };

  kfFx.register("cloud-reveal-strip", (el, { options, reduce, scroller }) => {
    const track = el.querySelector(':scope > [data-fx-part="track"]');
    const real = track ? [...track.querySelectorAll(':scope > [data-fx-part="item"]')] : [];
    if (!real.length) return;
    const stopFor = +(options.stop ?? 3), move = +(options.move ?? 0.8), swap = +(options.swap ?? 1.6), cloudIn = +(options.cloud ?? 0.5), cloudOut = +(options.out ?? 0.4);
    const coverAt = +(options.cover ?? 1), grow = +(options.grow ?? 1.04), burstFor = +(options.burst ?? 2), hidden = 0.3, stagger = 0.08;
    const moveEase = options.ease ? kfFx.ease(options.ease, "back.out") : "back.out";
    const cloudBox = el.querySelector(':scope > [data-fx-part="cloud"]'), burstBox = el.querySelector(':scope > [data-fx-part="burst"]');
    const clouds = cloudBox ? [...cloudBox.children] : [], bursts = burstBox ? [...burstBox.children] : [];
    const clones = real.map((n) => { const c = n.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.append(c); return c; });
    const items = [...real, ...clones], u = real.length, start = Math.floor(u / 2);
    const part = (it, role) => it.querySelector(`[data-fx-part="${role}"]`);
    const set = (t, v) => { if (Array.isArray(t) ? t.length : t) gsap.set(t, v); };
    const toBefore = (it) => { set(part(it, "after"), { autoAlpha: 0, scale: hidden }); set(part(it, "before"), { autoAlpha: 1, scale: 1 }); };
    const toAfter = (it) => { set(part(it, "after"), { autoAlpha: 1, scale: 1 }); set(part(it, "before"), { autoAlpha: 0, scale: hidden }); };
    const say = (name) => el.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    // Band shift when cell i comes to panel center (band width %) — the band starts at panel center (left 50%), so it is pushed back by the cell’s center
    const at = (i) => -((items[i].offsetLeft + items[i].offsetWidth / 2) / track.offsetWidth) * 100;

    gsap.set(track, { xPercent: at(start) });
    if (reduce) { toAfter(items[start]); return () => { clones.forEach((c) => c.remove()); gsap.set([track, ...real.flatMap((it) => [part(it, "after"), part(it, "before")]).filter(Boolean)], { clearProps: "all" }); }; }

    set(clouds, { autoAlpha: 0, scale: 0 });
    set(bursts, { autoAlpha: 0, scale: 0 });
    items.forEach(toBefore);
    const history = [];
    let active = null;
    const kept = new Set();
    const reset = (it) => { it.classList.remove("is-fx-center"); kept.has(it) ? toAfter(it) : toBefore(it); };
    const center = (i) => {
      if (history.length >= 2) reset(history.shift());
      active?.classList.remove("is-fx-center");
      set(clouds, { autoAlpha: 0, scale: 0 });
      set(bursts, { autoAlpha: 0, scale: 0 });
      active = items[i];
      active.classList.add("is-fx-center");
      history.push(active);
    };
    const burstFrom = (b) => {
      const k = (b.dataset.key || "").split(/\s+/).map(Number);
      return { x: burstBox.clientWidth / 2 - (b.offsetLeft + b.offsetWidth / 2), y: burstBox.clientHeight / 2 - (b.offsetTop + b.offsetHeight / 2), rotation: k[0] || 0, scale: Number.isFinite(k[1]) ? k[1] : 0 };
    };
    const tl = gsap.timeline({ repeat: -1, paused: true });
    const stop = (i) => {
      tl.call(() => { gsap.set(track, { xPercent: at(i) }); center(i); const b = part(active, "before"); if (b) gsap.to(b, { scale: grow, duration: swap, ease: spring }); });
      tl.to({}, { duration: coverAt });
      tl.call(() => { const b = part(active, "before"); if (b) gsap.to(b, { autoAlpha: 0, scale: hidden, duration: cloudIn, ease: spring }); say("fx:cover"); }, undefined, "<");
      if (clouds.length) tl.fromTo(clouds, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: cloudIn, ease: "back.out(1.6)", stagger }, "<");
      tl.add("reveal");
      tl.call(() => { const a = part(active, "after"); if (a) gsap.to(a, { autoAlpha: 1, scale: 1, duration: swap, ease: spring }); say("fx:reveal"); }, undefined, "reveal");
      tl.call(() => say("fx:rest"), undefined, `reveal+=${swap}`);
      tl.to({}, { duration: cloudOut }, "reveal");
      if (clouds.length) tl.to(clouds, { autoAlpha: 0, scale: 1.2, duration: cloudOut, ease: "none" }, "reveal");
      if (bursts.length) {
        tl.fromTo(bursts, { autoAlpha: 1, scale: (k, b) => burstFrom(b).scale, rotation: (k, b) => burstFrom(b).rotation, x: (k, b) => burstFrom(b).x, y: (k, b) => burstFrom(b).y }, { autoAlpha: 1, scale: 1, rotation: 0, x: 0, y: 0, duration: burstFor * 0.8, ease: spring, immediateRender: false }, "reveal");
        tl.to(bursts, { autoAlpha: 0, duration: burstFor * 0.15, overwrite: "auto" }, ">");
      }
      // Like the original, the pause attaches after all decoration is gone (4.5 seconds per cell with decoration, 3 without)
      tl.to({}, { duration: Math.max(0, stopFor - coverAt - cloudOut) });
    };
    const resetBursts = () => set(bursts, { autoAlpha: 0, scale: 0, x: 0, y: 0 });
    stop(start);
    for (let k = 1; k < u; k++) {
      tl.to(track, { xPercent: () => at(start + k), duration: move, ease: moveEase, onStart: resetBursts });
      stop(start + k);
    }
    tl.to(track, { xPercent: () => at(start + u), duration: move, ease: moveEase, onStart: resetBursts });
    // After rewinding, keep the first cell’s left neighbor the same photo as the clone cell just seen
    tl.call(() => { history.splice(0).forEach(reset); if (start > 0) { kept.add(items[start - 1]); toAfter(items[start - 1]); } });

    const st = ScrollTrigger.create({ trigger: el, scroller, start: "top bottom", end: "bottom top", onToggle: (self) => (self.isActive ? tl.play() : tl.pause()) });
    let rf = 0;
    const ro = new ResizeObserver(() => { if (rf) return; rf = requestAnimationFrame(() => { rf = 0; tl.invalidate(); if (!tl.isActive()) gsap.set(track, { xPercent: at(items.indexOf(active ?? items[start])) }); }); });
    ro.observe(track);
    return () => {
      st.kill(); tl.kill(); ro.disconnect(); cancelAnimationFrame(rf);
      clones.forEach((c) => c.remove());
      gsap.killTweensOf([track, ...clouds, ...bursts]);
      const parts = real.flatMap((it) => [part(it, "after"), part(it, "before")]).filter(Boolean);
      gsap.killTweensOf(parts);
      gsap.set([track, ...clouds, ...bursts, ...parts], { clearProps: "all" });
      real.forEach((it) => it.classList.remove("is-fx-center"));
    };
  });
})();
