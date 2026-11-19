// Each band cell is set at the center of the board, pauses, then slides to the next one. To loop endlessly, one end cell is cloned in front and a full set behind,
// On reaching the end of a set, after the slide finishes it silently returns to the first cell (the cloned cell looks identical, so there’s no jump)
(() => {
  kfFx.register("pause-center-slider", (el, { options, reduce }) => {
    const track = el.querySelector(':scope > [data-fx-part="track"]');
    const real = track ? [...track.children] : [];
    if (!real.length) return;
    const pause = +(options.pause ?? 2.4) * 1000, slide = +(options.slide ?? 1.5) * 1000, first = +(options.first ?? 0.8) * 1000;
    const bez = (options.ease || "0.65,0,0.35,1").split(",").map(Number);
    const ease = bez.length === 4 && bez.every((n) => !isNaN(n)) ? `cubic-bezier(${bez.join(",")})` : "cubic-bezier(0.65,0,0.35,1)";
    const clones = [real[real.length - 1], ...real].map((n) => {
      const c = n.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      return c;
    });
    track.prepend(clones[0]);
    track.append(...clones.slice(1));
    const items = [...track.children];
    const n = real.length;
    let index = 1, timer = 0, firstTimer = 0, backTimer = 0, raf = 0, started = false;
    const offset = (i) => el.clientWidth / 2 - (items[i].offsetLeft + items[i].offsetWidth / 2);
    const goTo = (i, ms = slide) => {
      track.style.transition = ms > 0 ? `transform ${ms}ms ${ease}` : "none";
      track.style.transform = `translateX(${offset(i)}px)`;
    };
    const next = () => {
      index++;
      goTo(index);
      if (index >= 1 + n) backTimer = setTimeout(() => goTo((index = 1), 0), slide);
    };
    const start = () => {
      if (started) return;
      started = true;
      raf = requestAnimationFrame(() => el.classList.add("is-in"));
      if (reduce) return;
      firstTimer = setTimeout(() => { next(); timer = setInterval(next, pause + slide); }, first + slide);
    };
    goTo(index, 0);
    // Enter after the loader lifts — if wait is given a document event name, wait for that event
    const wait = options.wait;
    if (wait) document.addEventListener(wait, start, { once: true });
    else start();
    // Keeps things centered even if cell width changes late due to fonts or images (original window resize .3s)
    let rf = 0;
    const ro = new ResizeObserver(() => {
      if (rf) return;
      rf = requestAnimationFrame(() => { rf = 0; goTo(index, started ? 300 : 0); });
    });
    ro.observe(el);
    return () => {
      clearInterval(timer); clearTimeout(firstTimer); clearTimeout(backTimer); cancelAnimationFrame(raf); cancelAnimationFrame(rf);
      ro.disconnect();
      if (wait) document.removeEventListener(wait, start);
      clones.forEach((c) => c.remove());
      track.style.transition = track.style.transform = "";
      el.classList.remove("is-in");
    };
  });
})();
