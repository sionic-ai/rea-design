// Several words stacked in one spot change one at a time every beat (each) — the new word rises from 80px below, tilted 7°, and settles,
// In the same beat the current word slides up 50px and tilts −3° (both 1.5s expo.out). The word cell clips, so the exiting word is not visible
(() => {
  kfFx.register("skew-word-cycle", (el, { options, reduce }) => {
    const words = [...el.querySelectorAll(':scope > [data-fx-part="word"]')];
    if (words.length < 2) return;
    const made = [];
    const movers = words.map((w) => {
      if (w.firstElementChild) return w.firstElementChild;
      const s = document.createElement("span");
      s.append(...w.childNodes);
      w.append(s);
      made.push(s);
      return s;
    });
    const undo = () => made.forEach((s) => s.replaceWith(...s.childNodes));
    if (reduce) {
      gsap.set(words.slice(1), { autoAlpha: 0 });
      return () => { gsap.set(words, { clearProps: "opacity,visibility" }); undo(); };
    }
    const each = +(options.each || 2.25), dur = +(options.dur ?? 1.5);
    // Adding % like ”140%” makes it a word-height ratio (yPercent) — even if the font size changes with screen width, it goes out of the box by the same amount
    const axis = (v) => (String(v).trim().endsWith("%") ? "yPercent" : "y");
    const fromKey = axis(options.from ?? 80), toKey = axis(options.to ?? -50);
    const from = parseFloat(options.from ?? 80), to = parseFloat(options.to ?? -50);
    const skewIn = +(options["skew-in"] ?? 7), skewOut = +(options["skew-out"] ?? -3);
    const ease = kfFx.ease(options.ease || "expo.out", "expo.out");
    // One turn per word = Beats × word count — rest time between one entrance and the next
    const rest = Math.max(0, each * words.length - dur);
    const tl = gsap.timeline()
      .from(movers, { [fromKey]: from, skewY: skewIn, duration: dur, ease, stagger: { each, repeat: -1, repeatDelay: rest } })
      .to(movers, { [toKey]: to, skewY: skewOut, duration: dur, ease, stagger: { each, repeat: -1, repeatDelay: rest } }, each);
    // Pause when offscreen
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.resume() : tl.pause()));
    io.observe(el);
    return () => {
      io.disconnect();
      tl.kill();
      gsap.set(movers, { clearProps: "transform" });
      undo();
    };
  });
})();
