// Big text band — while each letter slides in from outside the cell’s right (101%), the band surges (speeding up with a fourth power over the first 30%, settling with a cubic over the last 70%) and
// Runs at the usual speed. After that it flows one more frame per unit of scroll speed, cooling ×.8 each frame. Speed is in rem/frame, so on a rem site proportional to screen width, the tempo stays the same when the width changes
(() => {
  kfFx.register("rush-marquee", (el, { options, reduce }) => {
    const track = el.querySelector("[data-fx-part=track]");
    const line = track && track.querySelector("[data-fx-part=line]");
    if (!track || !line || !line.textContent.trim()) return;
    const base = +(options.speed ?? 0.1);
    const peak = +(options.peak ?? 3.75);
    const rush = +(options.rush ?? 3);
    const wait = +(options.wait ?? 0.3);
    const each = +(options.each ?? 0.015);
    const reveal = +(options.reveal ?? 0.4);
    const rate = +(options.boost ?? 0.2);
    const max = +(options.max ?? 0.3);
    const maxNarrow = +(options["max-narrow"] ?? 0.0625);
    const decay = +(options.decay ?? 0.8);
    const text = line.textContent;
    const copy = line.cloneNode(false);
    copy.setAttribute("aria-hidden", "true");
    const split = (p) => {
      p.textContent = "";
      [...text].forEach((c) => {
        const o = document.createElement("span");
        o.className = "fx-rush-ch";
        const i = document.createElement("span");
        i.textContent = c === " " ? " " : c;
        o.append(i);
        p.append(o);
      });
    };
    split(line);
    split(copy);
    track.append(copy);
    const chars = [...track.querySelectorAll(".fx-rush-ch > span")];
    const restore = () => { copy.remove(); line.textContent = text; track.style.transform = ""; };
    if (reduce) { chars.forEach((c) => { c.style.transform = "none"; }); return restore; }

    const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const narrow = matchMedia("(max-width: 767px)");
    let mode = "rush", x = 0, boost = 0, t0 = 0, resetT, lastY = scrollY;
    const anims = chars.map((c, i) => c.animate(
      [{ transform: "translate3d(101%, 0, 0)" }, { transform: "translate3d(0, 0, 0)" }],
      { duration: reveal * 1000, delay: (wait + i * each) * 1000, fill: "forwards", easing: "ease-out" },
    ));
    const speed = (p) => {
      const a = base * rem(), b = peak * rem();
      if (p < 0.3) { const r = p / 0.3; return a + r * r * r * r * (b - a); }
      const r = (p - 0.3) / 0.7;
      return a + (b - a) * (1 - r) * (1 - r) * (1 - r);
    };
    const tick = () => {
      const half = track.scrollWidth / 2;
      let v;
      if (mode === "rush") {
        const p = rush > 0 ? Math.min((performance.now() - t0) / 1000 / rush, 1) : 1;
        v = speed(p);
        if (p >= 1) mode = "loop";
      } else {
        v = base * rem() + boost;
        if (boost > 0) boost *= decay;
      }
      x -= v;
      if (half > 0 && x <= -half) x += half;
      track.style.transform = `translateX(${x}px)`;
    };
    const onScroll = () => {
      const v = scrollY - lastY;
      lastY = scrollY;
      if (mode !== "loop") return;
      boost = Math.min(Math.abs(v) * rate, narrow.matches ? maxNarrow : max) * rem();
      clearTimeout(resetT);
      resetT = setTimeout(() => { boost = 0; }, 0);
    };
    const start = setTimeout(() => { t0 = performance.now(); gsap.ticker.add(tick); }, wait * 1000);
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(start);
      clearTimeout(resetT);
      gsap.ticker.remove(tick);
      removeEventListener("scroll", onScroll);
      anims.forEach((a) => a.cancel());
      restore();
    };
  });
})();
