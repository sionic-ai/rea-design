(() => {
  // Original loader: two strips chained, one turn per 2s, and when stopping it decelerates over .7s to the nearest ”set image” slot from the current position
  kfFx.register("slot-reel", (el, { options, reduce }) => {
    const reels = [...el.querySelectorAll('[data-fx-part="reel"]')];
    if (!reels.length) return;
    const lever = el.querySelector('[data-fx-part="lever"]');
    const step = String(options.look || "").trim() === "step";
    const stop = +(options.stop ?? 4), delay = +(options.delay ?? 0.5);
    const strips = reels.map((r) => {
      const s = document.createElement("div");
      s.className = "fx-slot-reel__strip";
      const kids = [...r.children];
      kids.forEach((k) => s.append(k));
      const copies = step ? 9 : 1;
      for (let c = 0; c < copies; c++) kids.forEach((k) => s.append(k.cloneNode(true)));
      r.append(s);
      return { r, s, kids };
    });
    const Q = strips[0].kids.length;
    if (!Q) return () => strips.forEach(({ r, s, kids }) => { kids.forEach((k) => r.append(k)); s.remove(); });
    let H = 0, K = 0;
    const measure = () => (H = strips[0].kids[0].offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(strips[0].r);
    const calls = [], tweens = [];
    let loops = [];
    const done = () => el.dispatchEvent(new CustomEvent("fx:done"));

    function spinStop() {
      if (reduce) { strips.forEach(({ s }) => gsap.set(s, { y: -stop * H })); done(); return; }
      loops.forEach((l) => l.kill());
      loops = strips.map(({ s }) => gsap.to(s, { y: -Q * H, duration: 2, ease: "none", repeat: -1, paused: true, modifiers: { y: gsap.utils.unitize(gsap.utils.wrap(-Q * H, 0)) } }));
      if (lever) tweens.push(gsap.timeline().to(lever, { duration: 0.8, ease: "power3.inOut", rotateX: -70, z: 65 }).to(lever, { duration: 0.5, ease: "power3.out", rotateX: 0, z: 0 }));
      calls.push(gsap.delayedCall(0.8, () => loops.forEach((l, i) => {
        l.timeScale(2.5 + 0.5 * i).play();
        calls.push(gsap.delayedCall(2 + 0.5 * i, () => {
          l.pause();
          const y = gsap.getProperty(strips[i].s, "y"), o = Q * H;
          let a = Math.ceil(y / o) * o - stop * H;
          if (a > y) a -= o;
          tweens.push(gsap.to(strips[i].s, { y: a, duration: 0.7, ease: "power3.out", onComplete: () => i === strips.length - 1 && done() }));
        }));
      })));
    }
    function spinStep() {
      if (!H) return;
      const n = (K + 1) % Q, o = Q * H;
      if (reduce) { strips.forEach(({ s }) => gsap.set(s, { y: -n * H })); K = n; return; }
      strips.forEach(({ s }, i) => {
        gsap.set(s, { y: -((K * H) % o) });
        tweens.push(gsap.to(s, { y: -(n * H + 5 * o), duration: 1.5 + 0.2 * i, ease: "power3.out", delay: 0.1 * (i + 1) }));
      });
      K = n;
    }
    const go = () => (step ? spinStep() : spinStop());
    el.addEventListener("fx:spin", go);
    el.addEventListener("click", go);
    if (!step) calls.push(gsap.delayedCall(delay, spinStop));
    return () => {
      el.removeEventListener("fx:spin", go);
      el.removeEventListener("click", go);
      ro.disconnect();
      calls.forEach((c) => c.kill());
      tweens.forEach((t) => t.kill());
      loops.forEach((l) => l.kill());
      lever && gsap.set(lever, { clearProps: "transform" });
      strips.forEach(({ r, s, kids }) => { kids.forEach((k) => r.append(k)); s.remove(); });
    };
  });
})();
