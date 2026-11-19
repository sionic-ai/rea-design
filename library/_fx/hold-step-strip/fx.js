// A strip that pauses and slides cell by cell — not an endless marquee, it repeats stop one cell, go one cell.
// The original moves transform with a CSS transition and pauses with setTimeout, so to reuse the same curve we apply a transition instead of GSAP.
(() => {
  kfFx.register("hold-step-strip", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    const set = track && (track.querySelector('[data-fx-part="set"]') || track.firstElementChild);
    if (!set || !set.children.length) return;
    const vertical = options.axis === "y";
    const back = options.dir === "right" || options.dir === "down";
    const hold = +(options.hold ?? 1.2) * 1000;
    const dur = +(options.dur ?? 1.65) * 1000;
    const delay = +(options.delay ?? 0) * 1000;
    const curve = `cubic-bezier(${options.ease || ".22,.61,.36,1"})`;
    // So the strip never goes empty after the last cell, clone one more set behind it, and when it has all passed, quietly reset to the start
    const clone = set.cloneNode(true);
    clone.removeAttribute("data-fx-part");
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a,button").forEach((a) => a.setAttribute("tabindex", "-1"));
    track.appendChild(clone);
    el.classList.add("is-fx-hold-step");
    const count = set.children.length;
    let index = 0, step = 0, moveTimer = 0, holdTimer = 0, running = false;

    const measure = () => {
      const cs = getComputedStyle(set);
      const gap = parseFloat(vertical ? cs.rowGap : cs.columnGap) || 0;
      const box = set.children[0].getBoundingClientRect();
      step = (vertical ? box.height : box.width) + gap;
    };
    const place = (i, animate) => {
      const at = back ? -(step * count - step * i) : -step * i;
      track.style.transition = animate ? `transform ${dur}ms ${curve}` : "none";
      track.style.transform = vertical ? `translate3d(0, ${at}px, 0)` : `translate3d(${at}px, 0, 0)`;
    };
    // hover: stop — while the pointer is over the panel the next step is postponed, and after leaving it walks again following one pause (Studio carousel data-hover-stop)
    let paused = false;
    const after = () => {
      if (index >= count) {
        index = 0;
        place(0, false);
        void track.offsetHeight;
      }
      if (running && !paused) holdTimer = setTimeout(next, hold);
    };
    const move = (d) => {
      if (!step) measure();
      if (!step) { holdTimer = setTimeout(next, hold); return; }
      clearTimeout(holdTimer); clearTimeout(moveTimer);
      if (d < 0 && index <= 0) { index = count; place(index, false); void track.offsetHeight; }
      index += d;
      place(index, dur > 0);
      moveTimer = setTimeout(after, dur);
    };
    const next = () => move(1);
    const start = () => {
      if (running) return;
      running = true;
      holdTimer = setTimeout(next, delay + hold);
    };
    // [data-fx-part=prev]·[data-fx-part=next] — pressing moves one slot right away, and the walking tempo restarts at the end of that step
    const prev = el.querySelector('[data-fx-part="prev"]'), fwd = el.querySelector('[data-fx-part="next"]');
    const onPrev = () => move(-1), onNext = () => move(1);
    prev?.addEventListener("click", onPrev);
    fwd?.addEventListener("click", onNext);
    const stopHover = options.hover === "stop";
    const onEnter = () => { paused = true; clearTimeout(holdTimer); };
    const onLeave = () => { paused = false; if (running) { clearTimeout(holdTimer); holdTimer = setTimeout(next, hold); } };
    if (stopHover) { el.addEventListener("pointerenter", onEnter); el.addEventListener("pointerleave", onLeave); }

    measure();
    place(0, false);
    // When fonts or images arrive late or appear from a hidden panel, the cell width changes — re-set it at the current cell position
    const ro = new ResizeObserver(() => { measure(); place(index, false); });
    ro.observe(set);

    // wait: if play, it starts walking when the consumer sends fx:play (after the loader lifts)
    const onPlay = () => start();
    if (!reduce) {
      if (options.wait === "play") el.addEventListener("fx:play", onPlay);
      else start();
    }

    return () => {
      clearTimeout(moveTimer); clearTimeout(holdTimer); ro.disconnect();
      el.removeEventListener("fx:play", onPlay);
      prev?.removeEventListener("click", onPrev);
      fwd?.removeEventListener("click", onNext);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      clone.remove();
      track.style.transition = "";
      track.style.transform = "";
      el.classList.remove("is-fx-hold-step");
    };
  });
})();
