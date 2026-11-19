(() => {
  kfFx.register("cover-bar-words", (el, { options, reduce, scroller }) => {
    const words = [...el.querySelectorAll('[data-fx-part="word"]')];
    if (!words.length) return;
    if (reduce) {
      words.forEach((w) => w.style.setProperty("--fx-cover-x", "0"));
      return () => words.forEach((w) => w.style.removeProperty("--fx-cover-x"));
    }
    const delay = +(options.delay ?? 1), each = +(options.each ?? 0.2), dur = +(options.dur ?? 0.3);
    const ease = kfFx.ease(options.ease || "0.75,0,0.25,1", "power2.inOut");
    let tl = null, st = null;
    const play = () => {
      tl = gsap.timeline({ delay });
      words.forEach((w, i) => tl.fromTo(w, { "--fx-cover-x": 1 }, { "--fx-cover-x": 0, duration: w.dataset.dur != null ? +w.dataset.dur : dur, ease }, i * each));
    };
    if (options.trigger === "scroll" && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({ trigger: el, scroller, start: "top 80%", once: true, onEnter: play });
    } else play();
    return () => {
      st?.kill();
      tl?.kill();
      words.forEach((w) => w.style.removeProperty("--fx-cover-x"));
    };
  });
})();
