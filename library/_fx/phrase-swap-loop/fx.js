(() => {
  // Several sentences are stacked in one spot: word by word the current one slides up and out (.35s power3.in) while the next sentence’s words rise from below (.4s power3.out) — repeated every beat
  const words = (el) => {
    if (el.querySelector('[data-fx-part="word"]')) return [...el.querySelectorAll('[data-fx-part="word"]')];
    const text = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    return text.map((w, i) => {
      const s = document.createElement("span");
      s.setAttribute("data-fx-part", "word");
      s.textContent = w;
      el.append(s);
      if (i < text.length - 1) el.append(" ");
      return s;
    });
  };
  kfFx.register("phrase-swap-loop", (el, { options, reduce }) => {
    const phrases = [...el.querySelectorAll(':scope > [data-fx-part="phrase"]')];
    if (phrases.length < 2) return;
    // look: rise — not split into words but whole sentences. The current sentence hides at once and the next rises from .5em below, transparent, in 1s (figure intro second sentence)
    if (options.look === "rise") {
      const each = +(options.every || 3), dur = +(options.in ?? 1);
      const ease = kfFx.ease(options.ease || "0.25,0.46,0.45,0.94", "power1.out");
      let k = 0, timer = 0;
      gsap.set(phrases, { autoAlpha: 0, y: "0.5em" });
      gsap.set(phrases[0], { autoAlpha: 1, y: 0 });
      if (reduce) return () => gsap.set(phrases, { clearProps: "opacity,visibility,transform" });
      const step = () => {
        gsap.killTweensOf(phrases[k]);
        gsap.set(phrases[k], { autoAlpha: 0, y: "0.5em" });
        k = (k + 1) % phrases.length;
        gsap.to(phrases[k], { autoAlpha: 1, y: 0, duration: dur, ease, overwrite: true });
      };
      const seen = new IntersectionObserver(([e]) => { clearInterval(timer); if (e.isIntersecting) timer = setInterval(step, each * 1000); });
      seen.observe(el);
      return () => { seen.disconnect(); clearInterval(timer); gsap.killTweensOf(phrases); gsap.set(phrases, { clearProps: "opacity,visibility,transform" }); };
    }
    const every = +(options.every || 3.8);
    const out = +(options.out ?? 0.35), inn = +(options.in ?? 0.4);
    const sets = phrases.map(words);
    gsap.set(phrases.slice(1), { position: "absolute", inset: 0 });
    gsap.set(sets.slice(1).flat(), { yPercent: 105 });
    if (reduce) return () => gsap.set(sets.flat(), { clearProps: "transform" });
    const tl = gsap.timeline({ repeat: -1, paused: true });
    sets.forEach((ws, k) => {
      const nx = sets[(k + 1) % sets.length], t = k * every;
      tl.to(ws, { yPercent: -105, duration: out, stagger: 0.03, ease: "power3.in" }, t)
        .set(nx, { yPercent: 105 }, t + out + 0.02)
        .to(nx, { yPercent: 0, duration: inn, stagger: 0.04, ease: "power3.out" }, t + out + 0.03);
    });
    tl.to({}, { duration: 0 }, sets.length * every);
    // Runs only while the panel is on screen
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()));
    io.observe(el);
    return () => { io.disconnect(); tl.kill(); gsap.set(sets.flat(), { clearProps: "transform" }); };
  });
})();
