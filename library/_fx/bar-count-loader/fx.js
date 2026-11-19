// Hero loader: while the progress line fills 0→100% the number counts along (2s power1.inOut), and when full the curtain disappears in .5s power2.out.
// When everything has cleared, the curtain fires fx:done — attach the first video playback and scroll unlock to it (Brand hero loader)
// With blink·done·hold, after counting finishes the text is swapped and blinks, and the cover stays until the caller sends fx:go (until all images have arrived) (Brand)
(() => {
  kfFx.register("bar-count-loader", (el, { options, reduce }) => {
    const fill = el.querySelector('[data-fx-part="fill"]'), num = el.querySelector('[data-fx-part="num"]');
    const prefix = options.prefix ? `${options.prefix} ` : "";
    const done = () => { el.hidden = true; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    const unit = options.unit === "none" ? "" : (options.unit ?? "%");
    const show = (v) => { if (fill) fill.style.width = `${v}%`; if (num) num.textContent = `${prefix}${Math.round(v)}${unit}`; };
    if (reduce) { show(100); if (num && options.done) num.textContent = options.done; const t = setTimeout(done, 0); return () => clearTimeout(t); }
    const blink = +(options.blink ?? 0), blinkDur = +(options.blinkdur ?? 0.4);
    let free = options.hold !== "true", waiting = false;
    const s = { v: 0 };
    show(0);
    const tl = gsap.timeline({ onComplete: done, delay: +(options.delay ?? 0) })
      .to(s, { v: 100, duration: +(options.dur ?? 2), ease: kfFx.ease(options.ease || "power1.inOut", "power1.inOut"), onUpdate: () => show(s.v) });
    if (num && options.done) tl.call(() => { num.textContent = options.done; });
    if (num && blink > 0) tl.to(num, { opacity: 0, duration: blinkDur, repeat: blink, yoyo: true, ease: "none" });
    tl.addPause(">", () => { el.dispatchEvent(new CustomEvent("fx:counted", { bubbles: true })); if (free) tl.play(); else waiting = true; });
    if (num && blink > 0) tl.to(num, { opacity: 1, duration: blinkDur, ease: "power2.out" });
    tl.to(el, { opacity: 0, duration: +(options.out ?? 0.5), ease: kfFx.ease(options.outease || "power2.out", "power2.out") }, "<");
    const go = () => { free = true; if (waiting) { waiting = false; tl.play(); } };
    el.addEventListener("fx:go", go);
    return () => { tl.kill(); el.removeEventListener("fx:go", go); el.hidden = false; gsap.set([el, num].filter(Boolean), { clearProps: "opacity" }); };
  });
})();
