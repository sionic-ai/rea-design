(() => {
  // Turns on in five beats from transparent, .04s each: on, off, on, off, on (original registerEffect flicker). If children (item) exist, they go in random order, one every each seconds.
  // look: instead of switching off and on each beat, the ramp repeatedly fills from transparent to opaque.
  // If loop is given, after turning on, each child (or element) waits 0~loop seconds, then endlessly repeats a blink that flashes off twice in the last 10% of a 2s beat.
  kfFx.register("flicker-on", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const targets = items.length ? items : [el];
    const timers = new Set();
    const loopMax = +(options.loop ?? 0);
    const loopOnce = (t) => {
      const id = setTimeout(() => {
        timers.delete(id);
        t.classList.add("is-flickering");
        t.addEventListener("animationend", () => {
          t.classList.remove("is-flickering");
          loopOnce(t);
        }, { once: true });
      }, Math.random() * loopMax * 1000);
      timers.add(id);
    };
    const startLoop = () => loopMax > 0 && targets.forEach(loopOnce);
    if (reduce) return;
    gsap.set(targets, { opacity: 0 });
    const tl = gsap.timeline({ paused: true, delay: +(options.delay ?? 0), onComplete: startLoop });
    if (options.look === "ramp") {
      // look: ramp — each piece repeats transparent → opaque for step seconds linear, beats times (filling up like a sawtooth), randomly delayed by 0~spread seconds.
      // Giving first turns on only the first piece once at that second for 2 × step (brand title F: .1s · 4~5 times · .4s · first piece .2s at .8s)
      const step = +(options.step ?? 0.1), spread = +(options.spread ?? 0.4);
      const [lo, hi] = String(options.beats ?? "4-5").split("-").map(Number);
      const first = options.first === undefined ? null : +options.first;
      targets.forEach((t, i) => {
        if (i === 0 && first !== null) return tl.fromTo(t, { opacity: 0 }, { opacity: 1, duration: step * 2, ease: "none" }, first);
        const n = Math.max(1, (hi > lo ? lo + Math.floor(Math.random() * (hi - lo + 1)) : lo) || 1);
        tl.fromTo(t, { opacity: 0 }, { opacity: 1, duration: step, ease: "none", repeat: n - 1 }, Math.random() * spread);
      });
    } else if (options.look === "glitch") {
      // look: glitch — each piece is randomly delayed 0~spread s, on .04 → off .08 (+.12) → on .12 (+.2), expo.out (ai-model title·items).
      // With shift, each piece turns on while moving x or y from −shift% to home in .04s (Hero SVG letter pieces)
      const spread = +(options.spread ?? 0.4), shift = +(options.shift ?? 0);
      targets.forEach((t) => {
        const at = Math.random() * spread;
        if (shift) tl.fromTo(t, { [Math.random() > 0.5 ? "x" : "y"]: `-${shift}%` }, { x: "0%", y: "0%", duration: 0.04, ease: "expo.out" }, at);
        tl.to(t, { opacity: 1, duration: 0.04, ease: "expo.out" }, at)
          .to(t, { opacity: 0, duration: 0.08, ease: "expo.out" }, at + 0.12)
          .to(t, { opacity: 1, duration: 0.12, ease: "expo.out" }, at + 0.2);
      });
    } else {
      const step = +(options.step ?? 0.04);
      const frames = [1, 0, 1, 0, 1].map((opacity) => ({ opacity, duration: step }));
      tl.to(targets, { keyframes: frames, stagger: items.length ? { each: +(options.each ?? 0.03), from: options.from || "random" } : 0 });
    }
    // on: load — doesn’t wait for scroll, turns on delay after attaching (hero title after the loader)
    // on: event — turns on when fx:play is fired at the element (when the caller decides the timing, like the moment the loader ends)
    const play = () => tl.play();
    if (options.on === "event") el.addEventListener("fx:play", play);
    const st = options.on === "load" ? (tl.play(), null)
      : options.on === "event" ? null
      : ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top center+=25%", once: true, onEnter: () => tl.play() });
    return () => {
      el.removeEventListener("fx:play", play);
      st?.kill();
      tl.kill();
      timers.forEach(clearTimeout);
      targets.forEach((t) => t.classList.remove("is-flickering"));
      gsap.set(targets, { clearProps: "opacity" });
    };
  });
})();
