(() => {
  kfFx.register("scrub-view-swap", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      if (options.length) el.style.setProperty("--fx-length", options.length + "vh");
      const beat = 60 / (+options.bpm || 142), io = kfFx.ease("0.65,0,0.15,1", "power3.inOut"), out = kfFx.ease("0.16,1,0.3,1", "expo.out");
      const a = el.querySelector("[data-fx-part=before]"), b = el.querySelector("[data-fx-part=after]"), tos = [...el.querySelectorAll("[data-fx-part=pick]")];
      if (!a || !b) return;
      a.parentElement.classList.add("fx-views");
      const setMode = (m) => { if (el.dataset.mode === m) return; el.dataset.mode = m; tos.forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.to === m))); };
      const flip = gsap.timeline({ paused: true, defaults: { ease: io } })
        .fromTo(a.querySelectorAll("[data-fx-part=out]"), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -10, duration: 0.45, stagger: 0.08 }, 0)
        .fromTo(b.querySelectorAll("[data-fx-part=head]"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 }, 0.55)
        .fromTo(b.querySelectorAll("[data-fx-part=grow]"), { scaleY: 0.1, autoAlpha: 0 }, { scaleY: 1, autoAlpha: 1, duration: 0.6, stagger: 0.08, ease: out }, 0.55)
        .set(a, { autoAlpha: 1 }, 0.499).set(a, { autoAlpha: 0 }, 0.5);
      flip.eventCallback("onUpdate", () => setMode(flip.progress() >= 0.5 ? "b" : "a"));
      flip.progress(0); setMode("a");
      // The view changes only during the pinned range 35%–65% — tied to the whole pinned range, with progress clipped to that span
      let st = ScrollTrigger.create({ scroller, trigger: el, start: "top top", end: "bottom bottom",
        onUpdate: (s) => { const p = gsap.utils.clamp(0, 1, (s.progress - 0.35) / 0.3); flip.progress(reduce ? (p >= 0.5 ? 1 : 0) : p); } });
      tos.forEach((t) => t.addEventListener("click", () => {
        st?.kill(); st = null;
        const p = t.dataset.to === "b" ? 1 : 0;
        reduce ? flip.progress(p) : gsap.to(flip, { progress: p, duration: beat * 1.5, ease: io, overwrite: true });
      }, { signal }));
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
