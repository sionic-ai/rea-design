(() => {
  // Original (Name op) resolves from the center letter (the S in the name), alternating right and left with .12s delay each, over 1.2s from blur 30px → 2px, and
  // After staying .45s, the panel vanishes in 1.4s with 20px blur. When fully lifted it fires fx:done and hides the panel (whether it runs only on the first visit of a session is up to the caller)
  kfFx.register("center-blur-loader", (el, { options, reduce }) => {
    const done = () => { el.classList.add("fx-done"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    const chars = [...el.querySelectorAll('[data-fx-part="char"]')];
    if (reduce || !chars.length) { done(); return; }
    const each = +(options.each ?? 0.12), dur = +(options.dur ?? 1.2), hold = +(options.hold ?? 0.45), out = +(options.out ?? 1.4);
    const sharp = +(options.sharp ?? 2), outBlur = +(options.blur ?? 20);
    let mid = options.center != null ? Math.round(+options.center) : chars.findIndex((c) => c.hasAttribute("data-center"));
    if (!(mid >= 0 && mid < chars.length)) mid = Math.floor((chars.length - 1) / 2);
    const order = [mid];
    for (let d = 1; d < chars.length; d++) {
      if (mid + d < chars.length) order.push(mid + d);
      if (mid - d >= 0) order.push(mid - d);
    }
    const tl = gsap.timeline({ paused: true, onComplete: done });
    order.forEach((k, j) => tl.to(chars[k], { opacity: 1, filter: `blur(${sharp}px)`, duration: dur, ease: "power2.out" }, j * each));
    tl.to(el, { opacity: 0, filter: `blur(${outBlur}px)`, duration: out, ease: "power2.inOut" }, `>+${hold}`);
    const ac = new AbortController();
    const go = () => tl.play();
    if (options.wait) document.addEventListener(options.wait, go, { once: true, signal: ac.signal });
    else go();
    return () => { ac.abort(); tl.kill(); gsap.set([el, ...chars], { clearProps: "opacity,filter" }); el.classList.remove("fx-done"); };
  });
})();
