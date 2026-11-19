(() => {
  kfFx.register("bar-aurora-intro", (el, { options, reduce }) => {
    const box = el.querySelector('[data-fx-part="bars"]');
    const bars = box ? [...box.children] : [];
    const title = el.querySelector('[data-fx-part="title"]');
    const text = el.querySelector('[data-fx-part="text"]');
    if (!bars.length && !title) return;
    bars.forEach((b, i) => b.style.setProperty("--fx-i", i));
    if (reduce) return;
    const num = (k, d) => (options[k] != null && options[k] !== "" ? +options[k] : d);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const each = num("each", 0.035), dur = num("dur", 1.5), lead = num("lead", -0.2);
    const narrow = innerWidth <= num("narrow", 767);
    // The original multiplies bar count − 1 by .025 to place the title (a different number from the bar stagger .035) — that mismatch is kept as is
    const total = Math.max(0, bars.length - 1) * num("gap", 0.025);
    const base = narrow ? total - num("narrow-shift", 0.6) : total;
    const titleAt = base + num("title-at", 0.5);
    const blur = `blur(${num("blur", 8)}px)`;
    const tl = gsap.timeline({ delay: num("delay", 0) });
    if (bars.length) {
      gsap.set(bars, { opacity: 0 });
      bars.forEach((b, i) => tl.to(b, { opacity: 1, duration: dur, ease }, i * each + lead));
    }
    if (title) {
      gsap.set(title, { opacity: 0, filter: blur });
      tl.to(title, { opacity: 1, filter: "blur(0px)", duration: num("title-dur", 1), ease }, titleAt);
    }
    if (text) {
      gsap.set(text, { opacity: 0, filter: blur });
      tl.to(text, { opacity: 1, filter: "blur(0px)", duration: num("text-dur", 0.6), ease }, base + num("text-at", 0.8));
    }
    return () => { tl.kill(); gsap.set([...bars, title, text].filter(Boolean), { clearProps: "opacity,filter" }); };
  });
})();
