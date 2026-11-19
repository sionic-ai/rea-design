(() => {
  kfFx.register("sticky-clip-swap", (el, { options, reduce }) => {
    const reveal = el.querySelector('[data-fx-part="reveal"]');
    const drive = el.querySelector('[data-key="drive"]') || [...el.querySelectorAll('[data-fx-part="fade"]')].pop();
    if (!reveal || !drive) return;
    const labelA = el.querySelector('[data-fx-part="label-a"]');
    const labelB = el.querySelector('[data-fx-part="label-b"]');
    const fades = [...el.querySelectorAll('[data-fx-part="fade"]')];
    const sw = el.querySelector('[data-fx-part="switch"]');
    const blurMax = +(options.blur ?? 4);
    const cls = options.class || "is-change";
    const blur = (v) => (v < 0.1 ? "blur(0px)" : `blur(${v}px)`);
    const clamp = (v) => Math.max(0, Math.min(1, v));

    const paint = () => {
      const vh = innerHeight;
      // Text block — fades and blurs from when its center touches the screen center until its bottom edge touches the screen top
      fades.forEach((f) => {
        const r = f.getBoundingClientRect();
        if (r.top + r.height / 2 <= vh / 2) {
          const start = vh / 2 - r.height / 2, end = -r.height;
          const p = clamp((start - r.top) / (start - end));
          f.style.opacity = String(1 - p);
          f.style.filter = `blur(${p * blurMax}px)`;
          f.style.visibility = p >= 1 ? "hidden" : "visible";
        } else {
          f.style.opacity = "1";
          f.style.filter = "blur(0px)";
          f.style.visibility = "visible";
        }
      });
      // Second photo — fills from below, from when the top edge of the text block touches the screen bottom until its bottom edge touches the screen bottom
      const r = drive.getBoundingClientRect();
      if (r.top <= vh) {
        const p = clamp((vh - r.top) / r.height);
        const y = 100 - p * 100;
        reveal.style.clipPath = `polygon(0 100%, 100% 100%, 100% ${y}%, 0 ${y}%)`;
        if (labelA) { labelA.style.opacity = String(1 - p); labelA.style.filter = blur(p * blurMax); }
        if (labelB) { labelB.style.opacity = String(p); labelB.style.filter = blur((1 - p) * blurMax); }
      } else {
        reveal.style.clipPath = "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)";
        if (labelA) { labelA.style.opacity = "1"; labelA.style.filter = "blur(0px)"; }
        if (labelB) { labelB.style.opacity = "0"; labelB.style.filter = `blur(${blurMax}px)`; }
      }
      // Change marker — when the second cell’s top edge touches the top of the screen, swap the stage color
      if (sw) el.classList.toggle(cls, sw.getBoundingClientRect().top <= 0);
    };

    if (reduce) {
      reveal.style.clipPath = "none";
      if (labelA) labelA.style.opacity = "0";
      if (labelB) { labelB.style.opacity = "1"; labelB.style.filter = "none"; }
      return () => { reveal.style.clipPath = ""; [labelA, labelB].forEach((l) => l && (l.style.opacity = l.style.filter = "")); };
    }
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; paint(); });
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    paint();
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      el.classList.remove(cls);
      [reveal, labelA, labelB, ...fades].forEach((n) => n && (n.style.clipPath = n.style.opacity = n.style.filter = n.style.visibility = ""));
    };
  });
})();
