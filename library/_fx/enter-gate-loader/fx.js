// Entry gate — on the cover over the panel, the 000 count and an accent-color line rise by the prep amount, and when full the buttons float up from below.
// It does not lift until the button is pressed (for sites that need a human gesture, like turning sound on). On press, lines · numbers · curtain lift in order and it fires fx:enter.
(() => {
  kfFx.register("enter-gate-loader", (el, { options, reduce }) => {
    if (!window.gsap) return;
    const part = (p) => [...el.querySelectorAll(`[data-fx-part="${p}"]`)];
    const counter = part("counter")[0], line = part("line")[0], actions = part("actions")[0];
    const chrome = part("chrome"), enters = part("enter");
    const steps = String(options.steps ?? ".34, .72, 1").split(",").map(Number).filter((v) => v > 0);
    const T = { step: +(options.step ?? 0.6), gap: +(options.gap ?? 0.35), start: +(options.start ?? 0.25), rise: +(options.rise ?? 0.7), wait: +(options.wait ?? 0.15), out: +(options.out ?? 0.45) };
    const ease = kfFx.ease(options.ease || "0.16,1,0.3,1", "expo.out");
    const v = { value: 0 };
    const paint = () => counter && (counter.textContent = String(Math.round(v.value)).padStart(3, "0"));
    const tweens = [];
    if (actions) gsap.set(actions, { autoAlpha: 0 });
    if (line) gsap.set(line, { scaleX: 0, transformOrigin: "0 50%" });
    if (reduce) { v.value = 100; paint(); if (line) gsap.set(line, { scaleX: 1 }); if (actions) gsap.set(actions, { autoAlpha: 1 }); }
    else {
      steps.forEach((p, i) => {
        tweens.push(gsap.to(v, { value: 100 * p, duration: T.step, ease, delay: T.start + i * T.gap, onUpdate: paint }));
        if (line) tweens.push(gsap.to(line, { scaleX: p, duration: T.step, ease, delay: T.start + i * T.gap }));
      });
      if (actions) tweens.push(gsap.to(actions, { autoAlpha: 1, duration: T.rise, ease, delay: T.start + (steps.length - 1) * T.gap + T.step + T.wait }));
    }
    let gone = false;
    const enter = (e) => {
      if (gone) return;
      gone = true;
      const choice = e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.choice || "" : "";
      const done = () => { el.style.visibility = "hidden"; el.dispatchEvent(new CustomEvent("fx:enter", { bubbles: true, detail: { choice } })); };
      if (reduce) return done();
      const tl = gsap.timeline({ onComplete: done });
      if (chrome.length) tl.to(chrome, { autoAlpha: 0, duration: 0.25, ease: "power2.in" }, 0);
      if (actions) tl.to(actions, { autoAlpha: 0, y: 10, duration: 0.25, ease: "power2.in" }, 0);
      const mid = [counter, line].filter(Boolean);
      if (mid.length) tl.to(mid, { y: -24, autoAlpha: 0, duration: 0.4, ease: "power2.in" }, 0.05);
      tl.to(el, { autoAlpha: 0, duration: T.out, ease: "power2.in" }, 0.15);
      tweens.push(tl);
    };
    enters.forEach((b) => b.addEventListener("click", enter));
    el.addEventListener("fx:open", enter);
    return () => { enters.forEach((b) => b.removeEventListener("click", enter)); el.removeEventListener("fx:open", enter); tweens.forEach((t) => t.kill()); gsap.set([el, counter, line, actions, ...chrome].filter(Boolean), { clearProps: "all" }); };
  });
})();
