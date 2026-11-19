(() => {
  // Original Brand listening record — spins once per 1.8s (33⅓rpm), and when dragged it spins like hand scratching by the cursor angle, then on release regains its own speed at a rate of 3 per second.
  // fx:flip event (detail: "A"|"B") flips the plate on the Y axis in .72s expo.inOut. fx:play / fx:pause turn the spin on and off
  kfFx.register("record-spin", (el, { options, reduce }) => {
    const disc = el.querySelector('[data-fx-part="disc"]');
    if (!disc) return;
    const turn = +options.turn || 1.8, catchUp = +(options.catch ?? 3), flipDur = +(options.flip ?? 0.72);
    const dps = 360 / turn;
    let angle = 0, speed = options.paused === "1" ? 0 : dps, target = speed, drag = null;
    const tick = (t, dt) => {
      if (!drag) { speed += (target - speed) * Math.min(1, (dt / 1000) * catchUp); angle += speed * (dt / 1000); }
      disc.style.transform = `rotate(${reduce ? 0 : angle.toFixed(2)}deg)`;
    };
    gsap.ticker.add(tick);
    const ang = (e) => { const r = el.getBoundingClientRect(); return (Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180) / Math.PI; };
    const down = (e) => { if (e.pointerType !== "mouse" && options.touch !== "1") return; drag = { a: ang(e), t: performance.now() }; el.setPointerCapture?.(e.pointerId); };
    const move = (e) => { if (!drag) return; const a = ang(e), now = performance.now(); let d = a - drag.a; if (d > 180) d -= 360; if (d < -180) d += 360; angle += d; speed = (d / Math.max(1, now - drag.t)) * 1000; drag.a = a; drag.t = now; };
    const up = () => { drag = null; };
    const flip = (e) => gsap.to(el, { rotateY: e.detail === "B" ? 180 : 0, duration: reduce ? 0 : flipDur, ease: "expo.inOut" });
    const play = () => { target = dps; }, pause = () => { target = 0; };
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    el.addEventListener("fx:flip", flip); el.addEventListener("fx:play", play); el.addEventListener("fx:pause", pause);
    return () => {
      gsap.ticker.remove(tick);
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
      el.removeEventListener("fx:flip", flip); el.removeEventListener("fx:play", play); el.removeEventListener("fx:pause", pause);
      gsap.set([el, disc], { clearProps: "transform" });
    };
  });
})();
