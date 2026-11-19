(() => {
  // Original brand scrubTextReveal (effect: color): splits the sentence into words, and word i reaches the screen center at element top + element height/word count × i × speed
  // Turns on when reached (is-on) — not a scroll-tied value, but a .2s color transition the moment it passes that spot. Scrolling back up turns it off again there.
  kfFx.register("word-tint-steps", (el, { options, reduce, scroller }) => {
    if (!window.ScrollTrigger || !el.textContent.trim()) return;
    const speed = +(options.speed || 1), once = options.once === "true";
    const src = el.innerHTML;
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach((w, i) => {
      const s = document.createElement("span");
      s.className = "fx-tint-word";
      s.textContent = w;
      el.append(s);
      if (i < words.length - 1) el.append(" ");
    });
    const spans = [...el.querySelectorAll(".fx-tint-word")];
    if (reduce) { spans.forEach((s) => s.classList.add("is-on")); return () => { el.innerHTML = src; }; }
    const sts = spans.map((s, i) => ScrollTrigger.create({
      scroller, trigger: el, start: () => `top+=${(el.clientHeight / spans.length) * speed * i}px ${options.at || "center"}`, once,
      onEnter: () => s.classList.add("is-on"), onLeaveBack: () => s.classList.remove("is-on"),
    }));
    return () => { sts.forEach((t) => t.kill()); el.innerHTML = src; };
  });
})();
