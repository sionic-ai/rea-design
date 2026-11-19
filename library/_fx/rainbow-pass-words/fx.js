// When a highlighted word enters 10% within 100px of the screen bottom, once, a 6em rainbow band passes through the letters from outside left to outside right.
// Each word has its own length and delay (original .8s·.8s·1.2s, 0·.2·.4s, ease-in-out). After passing, it stays as plain solid-color text.
(() => {
  kfFx.register("rainbow-pass-words", (el, { options, reduce }) => {
    const words = [...el.querySelectorAll('[data-fx-part="word"]')];
    if (!words.length) return;
    const durs = String(options.dur ?? "0.8, 0.8, 1.2").split(",").map((s) => +s.trim()).filter((n) => !Number.isNaN(n));
    const step = +(options.step ?? 0.2);
    const on = (w, i) => {
      w.style.transitionDuration = `${durs[Math.min(i, durs.length - 1)] ?? 0.8}s`;
      w.style.transitionDelay = `${step * i}s`;
      w.classList.add("is-on");
    };
    if (reduce) { words.forEach((w) => w.classList.add("is-on")); return () => words.forEach((w) => w.classList.remove("is-on")); }
    let io = null;
    const arm = () => {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { on(e.target, words.indexOf(e.target)); io.unobserve(e.target); } });
      }, { rootMargin: options.margin || "0px 0px -100px 0px", threshold: +(options.threshold ?? 0.1) });
      words.forEach((w) => io.observe(w));
    };
    const wait = +(options.wait ?? 0);
    const t = wait > 0 ? setTimeout(arm, wait * 1000) : (arm(), 0);
    return () => {
      clearTimeout(t);
      if (io) io.disconnect();
      words.forEach((w) => { w.classList.remove("is-on"); w.style.transitionDuration = w.style.transitionDelay = ""; });
    };
  });
})();
