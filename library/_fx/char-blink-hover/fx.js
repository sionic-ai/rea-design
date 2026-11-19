// On hover, letters fade to .2 one character at a time from the front, then sharpen one at a time again — a blink. Color · underline are left as is.
// Before the dimming (.4s, .05s per character, power1.out) ends, the sharpening (.4s, .1s per character, power1.in) starts overlapping, ‹character count × .06s› early
(() => {
  kfFx.register("char-blink-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover || !window.SplitText) return;
    const target = el.querySelector('[data-fx-part="text"]') || el;
    if (!target.textContent.trim()) return;
    const split = new SplitText(target, { type: "chars" });
    const chars = split.chars;
    const dim = +(options.dim ?? 0.2), dur = +(options.dur ?? 0.4);
    const out = +(options.out ?? 0.05), back = +(options.back ?? 0.1), lap = +(options.lap ?? 0.06);
    const tl = gsap.timeline({ paused: true })
      .to(chars, { opacity: dim, duration: dur, stagger: out, ease: "power1.out" })
      .to(chars, { opacity: 1, duration: dur, stagger: back, ease: "power1.in" }, `-=${lap * chars.length}`);
    // marks: all — like the original, every mark in the document reacts together (the original’s .js-hover1-class collects from the whole document)
    const marks = () => [...(options.marks === "all" ? document : el).querySelectorAll('[data-fx-part="mark"]')];
    const enter = () => { marks().forEach((m) => m.classList.add("is-hovered")); if (!tl.isActive()) tl.restart(); };
    const leave = () => marks().forEach((m) => m.classList.remove("is-hovered"));
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      tl.kill();
      leave();
      split.revert();
    };
  });
})();
