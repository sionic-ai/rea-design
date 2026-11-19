// Shrinks the current section’s mask-size from 100% → 0 to reveal the underlying (next) section. When fully shrunk, sends the current section to the bottom and restores the mask
(() => {
  kfFx.register("mask-cycle-slides", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length) return;
    const every = (+options.every || 4) * 1000, dur = +(options.dur ?? 1.2), wait = +(options.delay ?? 0.2);
    const ease = kfFx.ease(options.ease || "expo.out", "expo.out");
    const side = ["top", "left", "right"].includes(options.from) ? options.from : "bottom";
    const across = side === "left" || side === "right";
    const toward = { bottom: "to top", top: "to bottom", left: "to right", right: "to left" }[side];
    const backs = options.back ? [...(document.querySelector(options.back)?.children || [])] : [];
    const mask = (p) => ({ maskImage: `linear-gradient(${toward}, currentColor 0%, currentColor 100%)`, maskSize: across ? `${p}% 100%` : `100% ${p}%`, maskRepeat: "no-repeat", maskPosition: side });
    const put = (s, z) => gsap.set(s, { zIndex: z, ...mask(100) });
    slides.forEach((s, i) => put(s, i === 0 ? 1 : -1));
    if (slides.length < 2 || reduce) return () => gsap.set(slides, { clearProps: "zIndex,maskImage,maskSize,maskRepeat,maskPosition" });
    let at = 0, timer = 0;
    // If first is given, only the first turn happens after that many seconds (after that every). With order: random it picks a random slide other than the current one
    const first = options.first != null ? +options.first * 1000 : every;
    const pick = () => { if (options.order !== "random" || slides.length < 3) return (at + 1) % slides.length; let n; do n = Math.floor(Math.random() * slides.length); while (n === at); return n; };
    const step = () => {
      const cur = slides[at], next = pick();
      put(slides[next], 0);
      gsap.to(cur, {
        ...mask(0), duration: dur, ease, delay: wait,
        onStart: () => {
          backs.forEach((b, i) => { b.style.zIndex = i === next ? "10" : "0"; if (i !== next) b.style.opacity = "0"; });
          const b = backs[next];
          if (b) { gsap.fromTo(b, { opacity: 0.5 }, { opacity: 1, duration: 0.8, ease: "power2.out" }); gsap.fromTo(b, { scale: 1.08 }, { scale: 1, duration: 4, ease: "none" }); }
        },
        onComplete: () => { put(cur, -1); put(slides[next], 1); at = next; },
      });
      timer = setTimeout(step, every);
    };
    timer = setTimeout(step, first);
    return () => {
      clearTimeout(timer);
      gsap.killTweensOf([...slides, ...backs]);
      gsap.set(slides, { clearProps: "zIndex,maskImage,maskSize,maskRepeat,maskPosition" });
      if (backs.length) gsap.set(backs, { clearProps: "zIndex,opacity,transform" });
    };
  });
})();
