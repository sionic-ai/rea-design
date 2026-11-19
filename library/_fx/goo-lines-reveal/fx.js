(() => {
  /* Title line ([data-fx-part=line] — if absent, the element’s child blocks) melt in and settle one line at a time:
     A very faint blur (font size × blur) comes in slightly narrow (.92), and because of the contrast threshold on the whole title it becomes one fused ink blob,
     Blur lessens as the clumps split into letters and sharpen. Once settled, the filter is removed and the original text stays. With on: scroll it starts when entering the view, with load right on attach */
  kfFx.register("goo-lines-reveal", (el, { options, reduce }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    const L = lines.length ? lines : [...el.children].filter((c) => c.textContent.trim());
    if (!L.length) return;
    const delay = +(options.delay ?? 0.2), gap = +(options.gap ?? 0.32), dur = +(options.dur ?? 0.8), blur = +(options.blur ?? 0.12);
    const narrow = +(options.narrow ?? 0.92), on = options.on || "load";
    const ease = gsap.parseEase(kfFx.ease(options.ease || "0.215,0.61,0.355,1", "power3.out"));
    if (reduce) return;
    let raf = 0, st = null, t0 = 0;
    const clear = () => { el.classList.remove("is-gooing"); L.forEach((l) => { l.style.filter = l.style.transform = l.style.opacity = ""; }); };
    const hide = () => { L.forEach((l) => { l.style.opacity = "0"; }); };
    function frame(now) {
      const fs = parseFloat(getComputedStyle(el).fontSize) || 40;
      let done = true;
      L.forEach((l, i) => {
        const t = Math.min(1, Math.max(0, ((now - t0) / 1000 - delay - i * gap) / Math.max(0.01, dur)));
        if (t < 1) done = false;
        const left = 1 - ease(t);
        l.style.opacity = t > 0 ? "1" : "0";
        l.style.filter = t > 0 && t < 1 ? `blur(${(left * blur * fs).toFixed(2)}px)` : "";
        l.style.transform = t > 0 && t < 1 ? `scaleX(${(narrow + (1 - narrow) * ease(t)).toFixed(4)})` : "";
      });
      if (done) { clear(); raf = 0; return; }
      raf = requestAnimationFrame(frame);
    }
    function play() { if (raf) return; el.classList.add("is-gooing"); t0 = performance.now(); raf = requestAnimationFrame(frame); }
    hide();
    if (on === "scroll" && window.ScrollTrigger) {
      st = ScrollTrigger.create({ trigger: el, start: options.start || "top 85%", once: true, onEnter: play });
    } else play();
    return () => { cancelAnimationFrame(raf); raf = 0; if (st) st.kill(); clear(); };
  });
})();
