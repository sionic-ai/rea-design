// Logo curtain loader — original (reference site function.js loading): distinguishes whether you came from the same site via document.referrer.
// Start: play the mark (Lottie) on an accent-color curtain, after a hold (1.5s) the mark rests for delay (1s) then shrinks to .8x and fades over 1s power2.out, and the curtain vanishes in 1.5s power1.out after the same delay.
// Again: the background-color curtain rests .5s and lifts in 1.5s power1.out. The original code uses ease:"Linear" …but TweenMax 1.19 does not know that name, so it runs on the default curve (Power1.easeOut) — the measured screen does too. When it ends, the overlay is removed and fx:done is fired (the Hero motion listens for it and starts).
(() => {
  kfFx.register("veil-mark-loader", (el, { options, reduce }) => {
    const mark = el.querySelector('[data-fx-part="mark"]');
    const num = (k, d) => +(options[k] ?? d);
    const ease = options.ease || "power1.out";
    let same = false;
    try { same = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) { same = false; }
    if (options.mode === "first") same = false;
    if (options.mode === "again") same = true;
    const tweens = [];
    let timer = 0, anim = null;
    const finish = () => {
      el.classList.add("is-done");
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    };
    if (reduce) { finish(); return () => el.classList.remove("is-done"); }
    if (!same) {
      el.classList.add("is-first");
      // Given src, plays a Lottie once at the mark spot (when lottie-web is loaded first)
      if (mark && options.src && window.lottie) anim = lottie.loadAnimation({ container: mark, renderer: "svg", loop: false, autoplay: true, path: options.src });
      timer = setTimeout(() => {
        const d = num("delay", 1);
        if (mark) tweens.push(gsap.fromTo(mark, { scale: 1 }, { opacity: 0, scale: num("scale", 0.8), delay: d, duration: num("mark-dur", 1), ease: "power2.out" }));
        tweens.push(gsap.fromTo(el, { opacity: 1 }, { opacity: 0, delay: d, duration: num("dur", 1.5), ease, onComplete: finish }));
      }, num("hold", 1.5) * 1000);
    } else {
      el.classList.add("is-again");
      tweens.push(gsap.fromTo(el, { opacity: 1 }, { opacity: 0, delay: num("again-delay", 0.5), duration: num("again-dur", 1.5), ease, onComplete: finish }));
    }
    return () => {
      clearTimeout(timer);
      tweens.forEach((t) => t.kill());
      anim?.destroy();
      el.classList.remove("is-first", "is-again", "is-done");
      gsap.set(mark ? [el, mark] : el, { clearProps: "opacity,scale,transform" });
    };
  });
})();
