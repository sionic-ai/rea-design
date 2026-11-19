// Tilting word swap: one word slot in a sentence changes each beat — the old word exits upward at −160% and −8° tilt (.7s power2.in),
// A new word stands up straight from 150% below at 12° (1.1s, after .58s) and the cell width grows and shrinks to fit the new word in 1.2s — Brand hero ”For_”
(() => {
  kfFx.register("word-tilt-rotate", (el, { options, reduce }) => {
    const slot = el.querySelector('[data-fx-part="slot"]');
    const words = [...el.querySelectorAll('[data-fx-part="word"]')].map((w) => w.textContent.trim()).filter(Boolean);
    if (!slot || words.length < 2) return;
    const step = +(options.step ?? 2.75), outD = +(options.out ?? 0.7), inD = +(options.in ?? 1.1), overlap = +(options.overlap ?? 0.12);
    const tiltIn = +(options["tilt-in"] ?? 12), tiltOut = +(options["tilt-out"] ?? -8);
    const ease = kfFx.ease(options.ease || "0.22,1,0.36,1", "power3.out");
    const bars = [...el.querySelectorAll('[data-fx-part="bar"]')];
    const keep = slot.textContent;
    const inner = document.createElement("span");
    inner.className = "fx-wtr-inner";
    const els = words.map((w) => { const s = document.createElement("span"); s.className = "fx-wtr-word"; s.textContent = w; inner.appendChild(s); return s; });
    const sizer = document.createElement("span"); sizer.className = "fx-wtr-sizer"; sizer.textContent = "Go"; sizer.setAttribute("aria-hidden", "true"); inner.appendChild(sizer);
    slot.textContent = ""; slot.appendChild(inner);
    let widths = els.map((e) => e.getBoundingClientRect().width);
    inner.style.width = widths[0] + "px";
    gsap.set(els, { yPercent: 150, rotation: tiltIn, autoAlpha: 0, transformOrigin: "0% 100%" });
    gsap.set(els[0], { yPercent: 0, rotation: 0, autoAlpha: 1 });
    const fill = (i, v) => { const f = bars[i]?.querySelector('[data-fx-part="fill"]') || bars[i]; if (f) f.style.setProperty("--fx-fill", v); };
    let cur = 0, raf = 0, t0 = 0, done = 0;
    const swap = (to) => {
      const a = els[cur], b = els[to];
      gsap.killTweensOf([inner, a, b]);
      gsap.to(inner, { width: widths[to], duration: 1.2, ease });
      gsap.to(a, { yPercent: -160, rotation: tiltOut, autoAlpha: 0, duration: outD, ease: "power2.in" });
      gsap.fromTo(b, { yPercent: 150, rotation: tiltIn, autoAlpha: 0 }, { yPercent: 0, rotation: 0, autoAlpha: 1, duration: inD, ease, delay: outD - overlap });
    };
    const tick = (now) => { done = Math.min((now - t0) / (step * 1000), 1); fill(cur, done); done < 1 ? (raf = requestAnimationFrame(tick)) : go((cur + 1) % els.length); };
    const go = (i) => {
      cancelAnimationFrame(raf);
      if (i !== cur) swap(i);
      bars.forEach((b, j) => { fill(j, j < i ? 1 : 0); b.toggleAttribute("data-active", j === i); });
      cur = i; done = 0; t0 = performance.now(); raf = requestAnimationFrame(tick);
    };
    const clicks = bars.map((b, i) => { const f = () => i !== cur && go(i); b.addEventListener("click", f); return [b, f]; });
    const ro = new ResizeObserver(() => { widths = els.map((e) => e.getBoundingClientRect().width); inner.style.width = widths[cur] + "px"; });
    ro.observe(el);
    if (!reduce) go(0);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); clicks.forEach(([b, f]) => b.removeEventListener("click", f)); gsap.killTweensOf([inner, ...els]); slot.textContent = keep; bars.forEach((b, j) => fill(j, 0)); };
  });
})();
