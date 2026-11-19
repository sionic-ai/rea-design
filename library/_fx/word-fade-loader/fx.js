(() => {
  // In the original, after load each word runs CSS fade_in 1.5s ease (delayed .2·.4·.6s), then the curtain gets jQuery .delay(3400).fadeOut(300), and at 3.6s the body .animate({opacity:1}, 2000) — swing is sine.inOut
  kfFx.register("word-fade-loader", (el, { options, reduce }) => {
    const words = [...el.querySelectorAll('[data-fx-part="word"]')];
    const first = +(options.delay ?? 0.2), step = +(options.step ?? 0.2), wd = +(options.word ?? 1.5);
    const hold = +(options.hold ?? 3.4), out = +(options.out ?? 0.3);
    const at = +(options["reveal-at"] ?? 3.6), rd = +(options["reveal-dur"] ?? 2);
    const wordEase = kfFx.ease(options.ease || "0.25,0.1,0.25,1", "power1.inOut");
    const swing = kfFx.ease(options["out-ease"] || "sine.inOut", "sine.inOut");
    let targets = [];
    try { targets = options.reveal ? [...document.querySelectorAll(options.reveal)] : []; } catch { targets = []; }
    const lock = options.lock === "true";
    const root = document.documentElement;
    const say = (n) => el.dispatchEvent(new CustomEvent(n, { bubbles: true }));
    let tl = null, started = false;

    if (reduce) {
      gsap.set(el, { autoAlpha: 0 });
      if (targets.length) gsap.set(targets, { opacity: 1 });
      say("fx:open");
      say("fx:done");
      return () => gsap.set([el, ...targets], { clearProps: "opacity,visibility" });
    }

    if (targets.length) gsap.set(targets, { opacity: 0 });
    if (words.length) gsap.set(words, { opacity: 0 });
    if (lock) root.style.overflow = "hidden";

    const go = () => {
      if (started) return;
      started = true;
      tl = gsap.timeline();
      words.forEach((w, i) => tl.to(w, { opacity: 1, duration: wd, ease: wordEase }, first + i * step));
      tl.to(el, { autoAlpha: 0, duration: out, ease: swing, onStart: () => say("fx:open") }, hold);
      tl.call(() => { if (lock) root.style.overflow = ""; }, null, at);
      if (targets.length) tl.to(targets, { opacity: 1, duration: rd, ease: swing, onComplete: () => say("fx:done") }, at);
      else tl.call(() => say("fx:done"), null, at);
    };
    if (document.readyState === "complete") go();
    else addEventListener("load", go, { once: true });

    return () => {
      removeEventListener("load", go);
      tl?.kill();
      if (lock) root.style.overflow = "";
      gsap.set([el, ...words, ...targets], { clearProps: "opacity,visibility" });
    };
  });
})();
