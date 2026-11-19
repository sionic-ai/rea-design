// Duplicate the letter row once more and hide it below, on hover the original row slides up 100% and fades while the duplicate rises from below and turns on.
// Clones are made by this part (aria-hidden) — just reattach them when the text changes. No clones are made on touch devices.
(() => {
  kfFx.register("roll-fade-label", (el, { options, hover, reduce }) => {
    if (!hover || !el.textContent.trim()) return;
    const inner = document.createElement("span");
    inner.setAttribute("data-fx-part", "text");
    while (el.firstChild) inner.append(el.firstChild);
    const clone = inner.cloneNode(true);
    clone.setAttribute("data-fx-part", "clone");
    clone.setAttribute("aria-hidden", "true");
    el.append(inner, clone);
    // look: once — rolls and changes once per hover and stays changed, and is not reverted on release. The next hover starts again from the first line (original: out .6s expo.inOut · in .4s cubic-bezier(.115,.405,.24,1))
    let off = () => {};
    if (options.look === "once" && window.gsap && !reduce) {
      const host = el.closest("a, button") || el;
      const outDur = +(options.out ?? 0.6), inDur = +(options.in ?? 0.4);
      const ease = kfFx.ease(options.ease || "0.115,0.405,0.24,1", "power3.out");
      // The original uses a drop-off curve "expo.inout"(written in lowercase so GSAP doesn’t recognize it and runs the default curve power1.out — the measured values match that, so the default is set to power1.out)
      const outEase = kfFx.ease(options["out-ease"] || "power1.out", "power1.out");
      // The cloned row waits below 150% and starts from 105% on every lift (same as the original)
      // Pin y to 0 so GSAP does not read the CSS translateY(100%) as y and add it
      gsap.set([inner, clone], { y: 0 });
      gsap.set(clone, { yPercent: 150, opacity: 1 });
      const run = () => {
        gsap.fromTo(inner, { y: 0, yPercent: 0, opacity: 1 }, { y: 0, yPercent: -105, opacity: 0, duration: outDur, ease: outEase, overwrite: true });
        gsap.fromTo(clone, { y: 0, yPercent: 105 }, { y: 0, yPercent: 0, duration: inDur, ease, overwrite: true });
      };
      host.addEventListener("pointerenter", run);
      host.addEventListener("focus", run);
      off = () => { host.removeEventListener("pointerenter", run); host.removeEventListener("focus", run); gsap.killTweensOf([inner, clone]); };
    }
    return () => {
      off();
      clone.remove();
      while (inner.firstChild) el.insertBefore(inner.firstChild, inner);
      inner.remove();
    };
  });
})();
