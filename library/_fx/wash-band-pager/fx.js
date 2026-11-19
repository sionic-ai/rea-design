(() => {
  // A board (track) of screen-height sections (page) stacked vertically moves one section at a time by one wheel tick, a 60px vertical drag or up/down keys, in dur (1.2s power2.out) — no document scroll.
  // The white band laid across the bottom of the section, while scrolling past, starts after a progress lag (10%) and chases −100% by a follow of 6% each frame, sweeping up faster than the section and washing the screen.
  // Once a section has entered, text lines (line) rise from 100% below with rise (1.1s power2.out), delayed .5s per data-step, and the band fires fx:sweep after a delay (.4s) (paired with feather-mask-sweep).
  kfFx.register("wash-band-pager", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    const pages = track ? [...track.querySelectorAll('[data-fx-part="page"]')] : [];
    if (!track || !pages.length) return;
    const dur = reduce ? 0 : +(options.dur ?? 1.2);
    const lag = +(options.lag ?? 0.1);
    const follow = +(options.follow ?? 0.06);
    const rise = reduce ? 0 : +(options.rise ?? 1.1);
    const stepGap = +(options.step ?? 0.5);
    const sweepDelay = +(options.delay ?? 0.4);
    const lock = +(options.lock ?? 500);
    const ease = kfFx.ease(options.ease || "0.45,0,0.55,1", "power2.out");
    const state = { y: 0 };
    const H = () => pages[0].offsetHeight;
    const set = gsap.quickSetter(track, "y", "px");
    let cur = 0, tween = null, moving = null, lastUp = 0, ty = 0, acc = 0, timers = [];
    const lines = (p) => [...p.querySelectorAll('[data-fx-part="line"]')];
    const hide = (p) => lines(p).forEach((l) => gsap.set(l, { autoAlpha: 0, y: "100%" }));
    const show = (p) => lines(p).forEach((l) => gsap.set(l, { autoAlpha: 1, y: 0 }));
    pages.slice(1).forEach(hide);
    const go = (to, dir) => {
      if (to < 0 || to >= pages.length) return;
      const from = cur, upper = pages[Math.min(from, to)], enter = pages[to];
      const bands = [...upper.querySelectorAll('[data-fx-part="band"]')].map((b) => ({ b, y: dir > 0 ? 0 : -100 }));
      cur = to; moving = dir;
      tween?.kill(); timers.forEach((t) => t.kill()); timers = [];
      if (dir > 0) hide(enter);
      el.dispatchEvent(new CustomEvent("fx:page", { detail: { index: to, from } }));
      if (dir < 0) timers.push(gsap.delayedCall(reduce ? 0 : sweepDelay, () => enter.querySelectorAll('[data-fx-part="band"]').forEach((b) => b.dispatchEvent(new Event("fx:sweep")))));
      tween = gsap.to(state, {
        y: -H() * to, duration: dur, ease,
        onUpdate() {
          set(state.y);
          const t = Math.min(1, Math.max(0, (this.progress() - lag) / (1 - lag)));
          const goal = dir > 0 ? -100 * t : -100 * (1 - t);
          bands.forEach((x) => { x.y += (goal - x.y) * follow; gsap.set(x.b, { yPercent: x.y }); });
        },
        onComplete() {
          tween = null; moving = null; set(state.y);
          bands.forEach((x) => gsap.set(x.b, { yPercent: dir > 0 ? -100 : 0 }));
          if (dir > 0) {
            lines(enter).forEach((l) => gsap.fromTo(l, { autoAlpha: 0, y: "100%" }, { autoAlpha: 1, y: 0, duration: rise, ease: "power2.out", delay: reduce ? 0 : stepGap * (+l.dataset.step || 0) }));
            timers.push(gsap.delayedCall(reduce ? 0 : sweepDelay, () => enter.querySelectorAll('[data-fx-part="band"]').forEach((b) => b.dispatchEvent(new Event("fx:sweep")))));
          } else show(enter);
        },
      });
    };
    const step = (dy) => {
      const dir = dy < 0 ? -1 : 1;
      if (tween && moving === dir) return;
      const now = Date.now();
      if (dir < 0 && now - lastUp < lock) return;
      if (dir < 0 && tween) lastUp = now;
      go(cur + dir, dir);
    };
    const onWheel = (e) => { e.preventDefault(); step(e.deltaY); };
    const onStart = (e) => { if (e.touches.length === 1) { ty = e.touches[0].clientY; acc = 0; } };
    const onMove = (e) => {
      if (e.touches.length !== 1) return;
      const y = e.touches[0].clientY, d = ty - y; ty = y; acc += d;
      if (Math.abs(acc) < 60) return;
      e.preventDefault(); step(acc); acc = 0;
    };
    const onKey = (e) => {
      if (!el.isConnected || e.target.closest("input, textarea")) return;
      if (["ArrowDown", "PageDown"].includes(e.key)) { e.preventDefault(); step(1); }
      if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); step(-1); }
    };
    const onGo = (e) => { const i = +e.detail; if (i !== cur) go(i, i > cur ? 1 : -1); };
    const onResize = () => { state.y = -H() * cur; set(state.y); };
    // The first section’s band is drawn once too (a delay leaves room for the band parts to attach)
    timers.push(gsap.delayedCall(reduce ? 0 : sweepDelay, () => pages[0].querySelectorAll('[data-fx-part="band"]').forEach((b) => b.dispatchEvent(new Event("fx:sweep")))));
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("fx:goto", onGo);
    addEventListener("keydown", onKey);
    addEventListener("resize", onResize);
    return () => {
      tween?.kill(); timers.forEach((t) => t.kill());
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("fx:goto", onGo);
      removeEventListener("keydown", onKey);
      removeEventListener("resize", onResize);
      gsap.set(track, { clearProps: "transform" });
      pages.forEach((p) => { show(p); p.querySelectorAll('[data-fx-part="band"]').forEach((b) => gsap.set(b, { clearProps: "transform" })); });
    };
  });
})();
