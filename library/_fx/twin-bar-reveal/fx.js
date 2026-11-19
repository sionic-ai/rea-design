(() => {
  // Each row has two bars (a base bar below, a front bar above) covering the text, and the front shrinks to one end first, the base lag later —
  // Both shrink the same way so a tail in the previous section’s color briefly remains at the end of the text. When lines are split again (window width) the bars are re-attached too
  const DIRS = {
    right: ["scaleX", "right center"],
    left: ["scaleX", "left center"],
    up: ["scaleY", "center top"],
    down: ["scaleY", "center bottom"],
  };
  kfFx.register("twin-bar-reveal", (el, { options, reduce, scroller }) => {
    if (reduce || !el.textContent.trim() || !window.SplitText) { el.classList.add("is-fx-shown"); return; }
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const [prop, origin] = DIRS[options.dir] || DIRS.right;
    const dur = +(options.dur ?? 0.6), lag = +(options.lag ?? 0.14), each = +(options.each ?? 0.1), wait = +(options.wait ?? 0.3);
    const fromEnd = options.order === "end";
    const ease = kfFx.ease(options.ease || "power3.inOut", "power3.inOut");
    let split = null, tl = null, st = null, live = true;
    const bars = [];
    const clear = () => { tl?.kill(); st?.kill(); bars.splice(0).forEach((b) => b.remove()); };
    const build = () => {
      if (!live) return;
      split = SplitText.create(el, {
        type: "lines",
        linesClass: "fx-twin-bar-reveal__line",
        autoSplit: true,
        onSplit(self) {
          clear();
          tl = gsap.timeline({ paused: true });
          const n = self.lines.length;
          self.lines.forEach((line, i) => {
            const base = document.createElement("span"), lead = document.createElement("span");
            base.className = "fx-twin-bar-reveal__bar";
            lead.className = "fx-twin-bar-reveal__bar is-lead";
            base.style.transformOrigin = lead.style.transformOrigin = origin;
            line.append(base, lead);
            bars.push(base, lead);
            const t0 = (fromEnd ? n - 1 - i : i) * each;
            tl.to(lead, { [prop]: 0, duration: dur, ease }, t0).to(base, { [prop]: 0, duration: dur, ease }, t0 + lag);
          });
          const play = () => {
            gsap.fromTo(el, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" });
            gsap.delayedCall(wait, () => tl.play());
          };
          st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top 90%", once: true, onEnter: play });
          if (st.progress > 0) play();
        },
      });
    };
    document.fonts.ready.then(build);
    return () => {
      live = false;
      clear();
      split?.revert();
      gsap.set(el, { clearProps: "opacity,visibility,transform" });
    };
  });
})();
