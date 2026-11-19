(() => {
  // The original uses jQuery: after load, spinner .delay(500).fadeOut(500), curtain .delay(1000).fadeOut(800), first video plays after 1s — if load doesn’t arrive within 10s, runs in the same order then
  const json = (src) => { try { return JSON.parse(document.querySelector(src)?.textContent || "null"); } catch { return null; } };
  kfFx.register("veil-fade-loader", (el, { options, reduce }) => {
    const spin = el.querySelector('[data-fx-part="spinner"]');
    let anim = null;
    if (spin && options.src && window.lottie) {
      const data = options.src.startsWith("#") ? json(options.src) : null;
      if (data || !options.src.startsWith("#"))
        anim = lottie.loadAnimation({ container: spin, renderer: "svg", loop: true, autoplay: !reduce, ...(data ? { animationData: data } : { path: options.src }) });
    }
    const sd = +(options["spin-delay"] ?? 0.5), sf = +(options["spin-fade"] ?? 0.5);
    const d = +(options.delay ?? 1), fd = +(options.fade ?? 0.8), play = +(options.play ?? 1), wait = +(options.timeout ?? 10000);
    const ease = kfFx.ease(options.ease || "sine.inOut", "sine.inOut");
    const timers = [], tweens = [];
    let done = false;
    const say = (n) => el.dispatchEvent(new CustomEvent(n, { bubbles: true }));
    const go = () => {
      if (done) return;
      done = true;
      if (reduce) { gsap.set(el, { autoAlpha: 0 }); say("fx:play"); say("fx:done"); return; }
      if (spin) tweens.push(gsap.to(spin, { autoAlpha: 0, duration: sf, delay: sd, ease }));
      tweens.push(gsap.to(el, { autoAlpha: 0, duration: fd, delay: d, ease, onComplete: () => say("fx:done") }));
      timers.push(setTimeout(() => say("fx:play"), play * 1000));
    };
    if (document.readyState === "complete") go();
    else addEventListener("load", go, { once: true });
    timers.push(setTimeout(go, wait));
    return () => {
      removeEventListener("load", go);
      timers.forEach(clearTimeout);
      tweens.forEach((t) => t.kill());
      anim?.destroy();
      gsap.set([el, spin].filter(Boolean), { clearProps: "opacity,visibility" });
    };
  });
})();
