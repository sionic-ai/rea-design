// Flips stacked sections one at a time by one wheel (|deltaY| ≥ 30) · one push (30px) · up/down keys · list buttons. Locked for 700ms after flipping.
// The leaving section’s title line exits upward (−100%) over .8s power3.inOut and its image and text turn off in .35s, the entering section’s title rises from below (100%) on the same curve
// After .4s the artwork pops out from .4x with elastic.out(1,.6) over 1.1s (if there is a video inside it plays once from the start) and the text floats up from 12px below at .08s intervals
(() => {
  kfFx.register("wheel-stage-swap", (el, { options, reduce }) => {
    const stages = [...el.querySelectorAll('[data-fx-part="stage"]')].map((main) => ({
      main,
      title: main.querySelector('[data-fx-part="title"] > *'),
      image: main.querySelector('[data-fx-part="image"]'),
      video: main.querySelector('[data-fx-part="image"] video'),
      fades: [...main.querySelectorAll('[data-fx-part="fade"]')],
    }));
    if (stages.length < 2) return;
    const navs = [...el.querySelectorAll('[data-fx-part="nav"]')];
    const lock = +(options.lock ?? 700), gate = +(options.threshold || 30), D = reduce ? 0 : +(options.dur ?? 0.8), AT = reduce ? 0 : +(options.pop ?? 0.4);
    const E = kfFx.ease(options.ease || "power3.inOut", "power3.inOut");
    const ac = new AbortController(), on = { signal: ac.signal };
    const has = (o) => (Array.isArray(o) ? o.length > 0 : !!o);
    const stop = (s) => { gsap.set(s.main, { autoAlpha: 0 }); if (s.video) { s.video.pause(); s.video.currentTime = 0; } };
    const leave = (s) => {
      const t = gsap.timeline();
      if (s.title) t.to(s.title, { yPercent: -100, duration: D, ease: E }, 0);
      if (s.image) t.to(s.image, { autoAlpha: 0, scale: 0.85, duration: reduce ? 0 : 0.35, ease: "power2.in" }, 0);
      if (has(s.fades)) t.to(s.fades, { autoAlpha: 0, y: -10, duration: reduce ? 0 : 0.35, ease: "power2.in" }, 0);
      return t.add(() => stop(s));
    };
    const enter = (s) => {
      const t = gsap.timeline().set(s.main, { autoAlpha: 1 }, 0);
      if (s.title) t.fromTo(s.title, { yPercent: 100 }, { yPercent: 0, duration: D, ease: E }, 0);
      if (s.image) {
        t.fromTo(s.image, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.25, ease: "none" }, AT);
        t.fromTo(s.image, { scale: 0.4 }, { scale: 1, duration: reduce ? 0 : 1.1, ease: "elastic.out(1, 0.6)" }, AT);
        if (s.video) t.add(() => { s.video.currentTime = 0; s.video.play().catch(() => {}); }, AT);
      }
      if (has(s.fades)) t.fromTo(s.fades, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.7, ease: "power2.out", stagger: reduce ? 0 : 0.08 }, AT + 0.12);
      return t;
    };
    stages.forEach((s) => {
      if (s.video) Object.assign(s.video, { muted: true, defaultMuted: true, playsInline: true, loop: false });
      stop(s);
      if (s.title) gsap.set(s.title, { yPercent: 100 });
    });
    let cur = Math.min(stages.length - 1, Math.max(0, +(options.start || 0))), tl = enter(stages[cur]), last = 0;
    const paint = () => navs.forEach((b, i) => { b.classList.toggle("is-current", i === cur); b.setAttribute("aria-current", i === cur ? "true" : "false"); });
    const go = (i) => {
      if (i < 0 || i >= stages.length || i === cur || performance.now() - last < lock) return;
      last = performance.now();
      tl.kill();
      stages.forEach((s, k) => { if (k !== cur && k !== i) stop(s); });
      tl = gsap.timeline().add(leave(stages[cur]), 0).add(enter(stages[i]), 0);
      cur = i;
      paint();
      el.dispatchEvent(new CustomEvent("fx:stage", { bubbles: true, detail: { index: i } }));
    };
    el.addEventListener("wheel", (e) => { e.preventDefault(); if (Math.abs(e.deltaY) >= gate) go(cur + (e.deltaY > 0 ? 1 : -1)); }, { passive: false, signal: ac.signal });
    let tx = 0, ty = 0;
    el.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true, signal: ac.signal });
    // Since the panel is a section covering the screen, vertical swipes are used for advancing — horizontal swipes are left alone
    el.addEventListener("touchmove", (e) => {
      const { clientX: x, clientY: y } = e.touches[0], dy = ty - y;
      if (Math.abs(dy) < Math.abs(tx - x)) return;
      e.preventDefault();
      if (Math.abs(dy) < gate || performance.now() - last < lock) return;
      tx = x; ty = y;
      go(cur + (dy > 0 ? 1 : -1));
    }, { passive: false, signal: ac.signal });
    addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") go(cur + 1);
      if (e.key === "ArrowUp" || e.key === "PageUp") go(cur - 1);
    }, on);
    navs.forEach((b, i) => b.addEventListener("click", () => go(i), on));
    paint();
    if (reduce) tl.progress(1);
    return () => {
      ac.abort();
      tl.kill();
      stages.forEach((s) => { if (s.video) s.video.pause(); gsap.set([s.main, s.title, s.image, ...s.fades].filter(Boolean), { clearProps: "all" }); });
      navs.forEach((b) => { b.classList.remove("is-current"); b.removeAttribute("aria-current"); });
    };
  });
})();
