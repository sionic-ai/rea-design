// Flip reveal with intensity: holds the front (logo card) briefly, then flips the panel 180° on the Y axis to show the back (score card),
// While flipping, the back-side number counts 0 → its value, the tick arc is drawn and the handle follows the end of the arc — Brand fitscore hero loader
(() => {
  kfFx.register("flip-reveal-count", (el, { options, reduce }) => {
    const front = el.querySelector(':scope > [data-fx-part="front"]'), back = el.querySelector(':scope > [data-fx-part="back"]');
    if (!front || !back || !window.gsap) return;
    const nums = [...back.querySelectorAll('[data-fx-part="num"]')]
      .map((n) => ({ n, text: n.textContent, to: parseFloat(n.dataset.to ?? n.textContent.replace(/[^\d.-]/g, "")) }))
      .filter((it) => Number.isFinite(it.to));
    const arc = back.querySelector('[data-fx-part="arc"]'), knob = back.querySelector('[data-fx-part="knob"]');
    const len = arc && typeof arc.getTotalLength === "function" ? arc.getTotalLength() : 0;
    const c = { p: 0 };
    const draw = () => {
      nums.forEach((it) => (it.n.textContent = String(Math.round(it.to * c.p))));
      if (!len) return;
      arc.style.strokeDasharray = `${len}`;
      arc.style.strokeDashoffset = `${len * (1 - c.p)}`;
      if (knob) { const at = arc.getPointAtLength(len * c.p); knob.setAttribute("cx", at.x); knob.setAttribute("cy", at.y); }
    };
    const reset = () => {
      nums.forEach((it) => (it.n.textContent = it.text));
      if (arc) arc.style.strokeDasharray = arc.style.strokeDashoffset = "";
      el.classList.remove("is-fx-flip");
    };
    // If the script doesn’t run or motion is reduced, only the back face (end screen) shows
    if (reduce) return reset;
    const delay = +(options.delay ?? 0.45), dur = +(options.dur ?? 1.1), at = +(options.at ?? 0.28), count = +(options.count ?? 1.4);
    const ease = kfFx.ease(options.ease || "0.455,0.03,0.515,0.955", "power1.inOut"), countEase = kfFx.ease(options["count-ease"] || "0.25,0.46,0.45,0.94", "power1.out");
    el.classList.add("is-fx-flip");
    let knobHome = knob && [knob.getAttribute("cx"), knob.getAttribute("cy")];
    draw();
    let tl;
    const start = () => {
      if (tl) return;
      tl = gsap.timeline({ onComplete: () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })) })
        .fromTo(el, { rotateY: 0, transformPerspective: 1200 }, { rotateY: 180, duration: dur, ease }, delay)
        .to(c, { p: 1, duration: count, ease: countEase, onUpdate: draw }, delay + at);
    };
    // on: document event name — starts when it receives the loader-finished signal (immediately on attach if absent)
    if (options.on) document.addEventListener(options.on, start, { once: true });
    else start();
    return () => {
      if (options.on) document.removeEventListener(options.on, start);
      tl?.kill();
      gsap.set(el, { clearProps: "transform" });
      if (knob && knobHome) { knob.setAttribute("cx", knobHome[0]); knob.setAttribute("cy", knobHome[1]); }
      reset();
    };
  });
})();
