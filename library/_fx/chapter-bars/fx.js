// Video section progress bars: one bar per time range of one video (or a clock running without video), filling from the left
// Fills up at 92% of the range, and at that moment the bar drops down in .5s, shrinking until it vanishes — fires fx:chapter when the section changes — Brand Hero KV
(() => {
  kfFx.register("chapter-bars", (el, { options, reduce }) => {
    const bars = [...el.querySelectorAll('[data-fx-part="bar"]')];
    if (!bars.length) return;
    const fills = bars.map((b) => b.querySelector('[data-fx-part="fill"]') || b);
    const cuts = (options.cuts || "").split(",").map((s) => s.trim().split(/\s+/).map(Number)).filter((p) => p.length === 2 && p.every(Number.isFinite));
    const length = +options.length || (cuts.length ? cuts[cuts.length - 1][1] : bars.length * 5);
    const spans = bars.map((_, i) => cuts[i] || [(i * length) / bars.length, ((i + 1) * length) / bars.length]);
    const full = +(options.fill ?? 0.92), drop = +(options.drop ?? 0.5);
    const ease = kfFx.ease(options.ease || "0.42,0,0.58,1", "power1.inOut");
    const video = options.video ? document.querySelector(options.video) : el.querySelector("video");
    const host = options.target ? document.querySelector(options.target) || el : el;
    fills.forEach((f) => { f.style.transformOrigin = "0 50%"; });

    const prev = fills.map(() => 0), busy = fills.map(() => false), done = fills.map(() => false);
    const tweens = fills.map(() => null);
    let chapter = -1, t0 = performance.now(), raf = 0;
    const set = (f, sx, y) => { f.style.transform = `translateY(${y}%) scaleX(${sx})`; };
    const fall = (i) => {
      busy[i] = true;
      const f = fills[i];
      if (typeof gsap === "undefined" || reduce) { set(f, 0, 0); busy[i] = false; return; }
      const o = { sx: 1, y: 0 };
      tweens[i] = gsap.to(o, { sx: 0, y: 101, duration: drop, ease, onUpdate: () => set(f, o.sx, o.y), onComplete: () => { set(f, 0, 0); busy[i] = false; } });
    };
    const now = () => (video && video.readyState > 0 && Number.isFinite(video.currentTime) ? video.currentTime : ((performance.now() - t0) / 1000) % length);
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const t = now();
      let at = -1;
      spans.forEach(([a, b], i) => {
        const p = t >= a && t < b ? (t - a) / Math.max(0.001, b - a) : 0;
        if (t >= a && t < b) at = i;
        if (p < full) done[i] = false;
        if (!busy[i]) set(fills[i], done[i] ? 0 : p >= full ? 1 : p / full, 0);
        if (prev[i] < full && p >= full && !busy[i]) { done[i] = true; fall(i); }
        prev[i] = p;
      });
      if (at >= 0 && at !== chapter) {
        chapter = at;
        bars.forEach((b, i) => b.classList.toggle("is-fx-on", i === at));
        host.dispatchEvent(new CustomEvent("fx:chapter", { bubbles: true, detail: { index: at } }));
      }
    };
    if (reduce) {
      fills.forEach((f) => set(f, 0, 0));
      bars[0].classList.add("is-fx-on");
      host.dispatchEvent(new CustomEvent("fx:chapter", { bubbles: true, detail: { index: 0 } }));
      return () => { bars.forEach((b) => b.classList.remove("is-fx-on")); fills.forEach((f) => { f.style.transform = ""; f.style.transformOrigin = ""; }); };
    }
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      tweens.forEach((tw) => tw && tw.kill());
      bars.forEach((b) => b.classList.remove("is-fx-on"));
      fills.forEach((f) => { f.style.transform = ""; f.style.transformOrigin = ""; });
    };
  });
})();
