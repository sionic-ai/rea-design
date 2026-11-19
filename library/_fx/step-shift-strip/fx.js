// The logo strip doesn’t flow but “rests one cell and slides” — reverse the list and duplicate enough to fill the screen, then
// Shift right by one cell width (plus gap), and on reaching the first set, secretly snap back to the identical middle set
(() => {
  kfFx.register("step-shift-strip", (el, { options, reduce }) => {
    const track = el.querySelector("[data-fx-part=track]");
    if (!track || !track.children.length) return;
    const first = +(options.first ?? 3);
    const every = +(options.every ?? 2);
    const dur = +(options.dur ?? 0.64);
    const curve = options.ease || "cubic-bezier(0.77, 0, 0.32, 0.95)";
    const leftward = options.dir === "left";
    const base = [...track.children];
    const order = leftward ? base : [...base].reverse();
    const n = order.length;
    const width = (k) => k.getBoundingClientRect().width;
    const gap = () => parseFloat(getComputedStyle(track).gap) || 0;
    let copies = 2, index = 0, timer, stopped = false;
    const build = () => {
      const unit = order.reduce((s, k) => s + width(k) + gap(), 0) || 1;
      copies = Math.max(2, Math.ceil(el.getBoundingClientRect().width / unit) + 1);
      track.replaceChildren();
      for (let c = 0; c < copies * 2; c++) order.forEach((k) => {
        const node = c === 0 ? k : k.cloneNode(true);
        if (c > 0) node.setAttribute("aria-hidden", "true");
        track.append(node);
      });
    };
    const offset = (k) => -[...track.children].slice(0, k).reduce((s, c) => s + width(c) + gap(), 0);
    const jump = (k) => { track.style.transition = "none"; track.style.transform = `translate3d(${offset(k)}px, 0, 0)`; track.getBoundingClientRect(); };
    build();
    index = leftward ? 0 : n * copies;
    jump(index);
    track.style.visibility = "visible";
    if (reduce) return () => { track.replaceChildren(...base); track.style.transform = ""; };

    const onEnd = (e) => {
      if (e.target !== track || e.propertyName !== "transform" || stopped) return;
      if (!leftward && index < n) { index += n * copies; jump(index); }
      if (leftward && index >= n * copies) { index -= n * copies; jump(index); }
      timer = setTimeout(step, every * 1000);
    };
    const step = () => {
      index += leftward ? 1 : -1;
      requestAnimationFrame(() => {
        track.style.transition = `transform ${dur * 1000}ms ${curve}`;
        track.style.transform = `translate3d(${offset(index)}px, 0, 0)`;
      });
    };
    track.addEventListener("transitionend", onEnd);
    timer = setTimeout(step, first * 1000);
    let lastW = innerWidth;
    const onResize = () => {
      if (innerWidth === lastW) return;
      lastW = innerWidth;
      clearTimeout(timer);
      build();
      index = leftward ? 0 : n * copies;
      jump(index);
      timer = setTimeout(step, every * 1000);
    };
    addEventListener("resize", onResize);
    return () => {
      stopped = true;
      clearTimeout(timer);
      removeEventListener("resize", onResize);
      track.removeEventListener("transitionend", onEnd);
      track.replaceChildren(...base);
      track.style.transition = "";
      track.style.transform = "";
    };
  });
})();
