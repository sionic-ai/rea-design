(() => {
  // Original waveform formula — mixes the average with the neighboring bar into the seed random so bars aren’t too jagged
  const fxWave = (seed, n, min) => {
    let t = (seed * 7919 + 13) >>> 0;
    const rnd = () => ((t = (Math.imul(t, 1103515245) + 12345) >>> 0), ((t >>> 8) & 0xffff) / 0x10000);
    const raw = Array.from({ length: n }, rnd);
    return raw.map((v, i) => min + (1 - min) * (0.4 * v + 0.6 * (((raw[i - 1] ?? v) + 2 * v + (raw[i + 1] ?? v)) / 4)));
  };
  kfFx.register("wave-bars", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const beat = 60 / (+options.bpm || 142), out = kfFx.ease("0.16,1,0.3,1", "expo.out");
      const vals = fxWave(+options.seed || 1, +options.n || 96, options.min ? +options.min : 0.18);
      const bars = () => { const b = document.createElement("div"); b.className = "fx-bars"; b.innerHTML = vals.map((v) => `<i style="--h:${v.toFixed(3)}"></i>`).join(""); return b; };
      const base = bars(), on = bars(), ph = document.createElement("i");
      on.classList.add("is-on"); on.setAttribute("aria-hidden", "true"); ph.className = "fx-ph";
      const saved = [...el.childNodes];
      el.replaceChildren(base, on, ph);
      signal.addEventListener("abort", () => el.replaceChildren(...saved));
      const play = options.play || "scroll";
      if (reduce) return el.style.setProperty("--p", play === "none" ? 0 : 0.5);
      gsap.from(base.children, { scaleY: 0.05, duration: beat * 2, ease: out, stagger: { amount: beat }, scrollTrigger: { scroller, trigger: el, start: "top bottom", once: true } });
      if (play === "scroll") ScrollTrigger.create({ scroller, start: 0, end: "max", onUpdate: (s) => el.style.setProperty("--p", s.progress.toFixed(5)) });
      if (play === "loop") {
        const tw = gsap.fromTo(el, { "--p": 0 }, { "--p": 1, duration: beat * 16, ease: "none", repeat: -1, paused: true });
        ScrollTrigger.create({ scroller, trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? tw.play() : tw.pause()) });
      }
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
