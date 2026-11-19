(() => {
  // Float runs all attached pieces with one ticker — giving each piece its own rAF would run twenty for twenty images
  const floating = new Set();
  const mqNarrow = matchMedia("(max-width: 800px)");
  const tick = () => {
    if (document.hidden) return;
    // The original adds phase every frame (at 60Hz) — set to 60Hz so it doesn’t run twice as fast on 120Hz screens
    const k = Math.max(0, Math.min(4, gsap.ticker.deltaRatio(60)));
    const narrow = mqNarrow.matches;
    const now = performance.now();
    for (const s of floating) {
      if (now < s.from) continue;
      s.rx += s.ax * k;
      s.ry += s.ay * k;
      const m = narrow ? s.sp : 1;
      s.el.style.translate = `${(Math.cos(s.rx) * s.radX * m).toFixed(2)}px ${(Math.sin(s.ry) * s.radY * m).toFixed(2)}px`;
    }
  };
  const sync = () => (floating.size ? gsap.ticker.add(tick) : gsap.ticker.remove(tick));

  kfFx.register("pop-float", (el, { options, reduce, scroller }) => {
    const look = options.look || "pop";
    const photo = look === "photo";
    const from = +(options.from ?? (photo ? 1.2 : 0.78));
    const dur = +(options.dur ?? (photo ? 0.7 : 1.05));
    const ease = kfFx.ease(options.ease || (photo ? "back.out" : "elastic.out(1, 0.45)"), photo ? "back.out" : "elastic.out(1, 0.45)");
    const delay = +(options.delay ?? 0);
    const amp = +(options.float ?? (photo ? 0 : 10));
    const on = options.on || "enter";

    if (reduce) {
      gsap.set(el, { autoAlpha: 1 });
      return () => gsap.set(el, { clearProps: "opacity,visibility" });
    }

    // Each piece gets its own phase and speed — bobbing at the same tempo makes the whole plate heave as one lump.
    // When speed·phase are given, uses a fixed tempo like the original (Brand Hero: .01 per frame, piece i has phase i·1.5i)
    const speed = options.speed != null ? +options.speed : null;
    const s = {
      el,
      rx: options.phase != null ? +options.phase : (Math.random() - 0.5) * Math.PI,
      ry: options["phase-y"] != null ? +options["phase-y"] : (Math.random() - 0.5) * Math.PI,
      ax: speed ?? Math.random() * 0.01 + 0.01,
      ay: speed ?? Math.random() * 0.01 + 0.01,
      radX: +(options.sway ?? 0),
      radY: amp,
      sp: +(options.sp ?? 1),
      from: performance.now() + +(options.wait ?? 0) * 1000,
    };
    if (amp || s.radX) { floating.add(s); sync(); }

    // Given x · y, the single line scale(s) translate(x%, y%) is driven along one curve — like the original CSS transition, size and offset shrink with the same progress
    const ox = +(options.x ?? 0), oy = +(options.y ?? 0);
    const shift = ox !== 0 || oy !== 0;
    const fade = options.fade != null ? +options.fade : null;
    const setP = (p) => { el.style.transform = `scale(${from + (1 - from) * p}) translate(${ox * (1 - p)}%, ${oy * (1 - p)}%)`; };

    let tween = null, st = null;
    const play = () => {
      if (tween) return;
      if (shift || fade != null) {
        const pr = { p: 0 };
        tween = gsap.timeline({ delay })
          .to(pr, { p: 1, duration: dur, ease, onUpdate: () => setP(pr.p) }, 0)
          .to(el, { autoAlpha: 1, duration: fade ?? dur, ease: fade != null ? "power1.inOut" : ease }, 0);
        return;
      }
      tween = gsap.fromTo(el, { autoAlpha: 0, scale: from, transformOrigin: "50% 50%" }, { autoAlpha: 1, scale: 1, duration: dur, ease, delay });
    };
    const onPlay = () => play();

    if (look === "still") {
      gsap.set(el, { autoAlpha: 1 });
    } else if (shift || fade != null) {
      gsap.set(el, { autoAlpha: 0, transformOrigin: "50% 50%" });
      setP(0);
      if (on === "load") play();
      else if (on === "event") el.addEventListener("fx:play", onPlay);
      else if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 88%", once: true, onEnter: play });
      } else play();
    } else {
      gsap.set(el, { autoAlpha: 0, scale: from, transformOrigin: "50% 50%" });
      if (on === "load") play();
      else if (on === "event") el.addEventListener("fx:play", onPlay);
      else if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        // Original IntersectionObserver bottom −12% (photos −15%) — it must rise that far from the bottom of the screen before it pops
        st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || (photo ? "top 85%" : "top 88%"), once: true, onEnter: play });
      } else play();
    }

    return () => {
      st?.kill();
      tween?.kill();
      el.removeEventListener("fx:play", onPlay);
      floating.delete(s);
      sync();
      el.style.removeProperty("translate");
      gsap.set(el, { clearProps: "transform,opacity,visibility" });
    };
  });
})();
