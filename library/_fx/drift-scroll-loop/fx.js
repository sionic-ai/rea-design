// Flow is pushed by the board’s scrollTop rather than transform — so pushing by wheel or finger continues the flow from that spot, and off-screen text is also at its real scroll position (Studio home).
(() => {
  kfFx.register("drift-scroll-loop", (el, { options, reduce }) => {
    const set = el.querySelector('[data-fx-part="set"]');
    if (!set || reduce) return;
    const speed = +(options.speed ?? 1);
    const below = (options.start || "below") === "below";
    const inner = set.innerHTML;
    let clone = null, start = below, paused = false, y = 0, raf = 0;

    // If one set is shorter than the plate, the spot where it jumps from end to start lands inside the screen and the seam shows — so repeat the inner content enough to fill the plate
    const build = () => {
      set.innerHTML = inner;
      const h = set.offsetHeight;
      if (h > 0 && h < el.clientHeight) set.insertAdjacentHTML("beforeend", inner.repeat(Math.ceil(el.clientHeight / h)));
      clone?.remove();
      clone = set.cloneNode(true);
      clone.setAttribute("data-fx-part", "clone");
      clone.setAttribute("aria-hidden", "true");
      clone.style.marginTop = "";
      el.append(clone);
      if (start) set.style.marginTop = `${el.clientHeight}px`;
    };
    build();
    y = el.scrollTop = 1;

    // Like the original, speed px per frame — reaching the end (head of the second set) jumps to the head of the first set, and pushing up to the very top jumps to the head of the second set
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (paused) return;
      const now = el.scrollTop;
      if (Math.abs(now - y) > 1.5) y = now;
      const h = set.offsetHeight;
      if (h + y >= el.scrollHeight) {
        if (start) { start = false; set.style.marginTop = ""; }
        y = 1;
      } else if (y < 1) {
        y = start ? 1 : el.scrollHeight - h;
      } else {
        y += speed;
      }
      el.scrollTop = y;
    };
    raf = requestAnimationFrame(tick);

    const pause = () => { paused = true; };
    const play = () => { paused = false; y = el.scrollTop; };
    el.addEventListener("fx:pause", pause);
    el.addEventListener("fx:play", play);
    let lastW = el.clientWidth, lastH = el.clientHeight;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === lastW && el.clientHeight === lastH) return;
      lastW = el.clientWidth; lastH = el.clientHeight;
      build();
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("fx:pause", pause);
      el.removeEventListener("fx:play", play);
      clone?.remove();
      set.innerHTML = inner;
      set.style.marginTop = "";
    };
  });
})();
