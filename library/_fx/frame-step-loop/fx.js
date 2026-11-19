// A stop-motion loop that swaps overlapped frame children one at a time with no in-between values — the original is a 9-frame 2fps animated GIF (one loop per 4.5s).
// Runs only while visible. With reduced motion, stops on the first slide (or the one set by hold)
(() => {
  kfFx.register("frame-step-loop", (el, { options, reduce }) => {
    const frames = [...el.querySelectorAll('[data-fx-part="frame"]')];
    if (!frames.length) return;
    const fps = +options.fps || 2;
    const hold = Math.min(frames.length - 1, Math.max(0, +(options.hold ?? 0)));
    let i = hold, timer = 0, seen = false;
    const show = (n) => frames.forEach((f, k) => f.classList.toggle("is-on", k === n));
    show(i);
    if (reduce || frames.length < 2) return () => frames.forEach((f) => f.classList.remove("is-on"));
    const tick = () => { i = (i + 1) % frames.length; show(i); el.dispatchEvent(new CustomEvent("fx:frame", { detail: { index: i } })); };
    // durs — when length differs per scene like the original GIF (ms list, 「2000,500」 = pause 2s → .5s wiggle). delay — keep the first slide longer so several don’t turn on the same tempo (seconds)
    const durs = String(options.durs ?? "").split(",").map((s) => s.trim()).filter(Boolean).map(Number).filter((n) => n >= 0);
    const lead = Math.max(0, +(options.delay ?? 0) * 1000);
    let first = true;
    const step = () => { tick(); timer = setTimeout(step, Math.max(16, durs[i % durs.length])); };
    const run = () => {
      if (timer || !seen || document.hidden) return;
      if (durs.length) timer = setTimeout(step, Math.max(16, durs[i % durs.length]) + (first ? lead : 0));
      else timer = setInterval(tick, 1000 / fps);
      first = false;
    };
    const stop = () => { clearInterval(timer); clearTimeout(timer); timer = 0; };
    const io = new IntersectionObserver((es) => { seen = es[es.length - 1].isIntersecting; seen ? run() : stop(); });
    io.observe(el);
    const vis = () => (document.hidden ? stop() : run());
    document.addEventListener("visibilitychange", vis);
    return () => { stop(); io.disconnect(); document.removeEventListener("visibilitychange", vis); frames.forEach((f) => f.classList.remove("is-on")); };
  });
})();
