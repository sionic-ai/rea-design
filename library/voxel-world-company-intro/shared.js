// Menu, view toggle, sound and scroll movement — short 8-bit sounds made with WebAudio instead of the original files
(() => {
  const root = document.documentElement;

  // Sound: short beep on hover, three rising notes on enter. When off, nothing plays
  let ctx = null, soundOn = true;
  const beep = (freq, at, len, vol = 0.05) => {
    if (!soundOn) return;
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + at;
    o.type = "square"; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + len + 0.02);
  };
  window.ynSound = {
    over: () => beep(880, 0, 0.06),
    click: () => { beep(523, 0, 0.1); beep(659, 0.09, 0.1); beep(784, 0.18, 0.16); },
  };

  const pick = (sw, value) => sw.querySelectorAll("button").forEach((b) => b.classList.toggle("is-on", b.dataset.value === value));
  document.querySelectorAll("[data-switch]").forEach((sw) => {
    sw.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      pick(sw, b.dataset.value);
      if (sw.dataset.switch === "sound") soundOn = b.dataset.value === "on";
      if (sw.dataset.switch === "view") {
        root.classList.toggle("lite", b.dataset.value === "lite");
        window.ynWorld?.relayout?.();
      }
    });
    sw.querySelectorAll("button").forEach((b) => b.addEventListener("pointerenter", () => window.ynSound.over()));
  });

  // Original scroll movement: adds .6 per frame to the speed, and once it passes 20% of the remaining distance it clamps to 20% — it attaches fast, then stops softly. Wheel or touch stops it
  let moving = 0;
  window.ynScrollTo = (to) => {
    cancelAnimationFrame(moving);
    let v = 0, acc = 0;
    const stop = () => { cancelAnimationFrame(moving); removeEventListener("wheel", stop); removeEventListener("touchstart", stop); };
    addEventListener("wheel", stop, { passive: true }); addEventListener("touchstart", stop, { passive: true });
    const step = () => {
      const y = scrollY, left = to - y;
      if (Math.abs(left) < 1) { scrollTo(0, to); return stop(); }
      const want = 0.2 * Math.abs(left);
      if (v < want) v += acc += 0.6; else { acc = 0; v = want; }
      scrollTo(0, y + Math.sign(left) * Math.min(v, Math.abs(left)));
      moving = requestAnimationFrame(step);
    };
    step();
  };

  document.querySelectorAll("[data-go]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    root.classList.remove("yn-menu");
    const id = a.dataset.go;
    if (root.classList.contains("lite")) return document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    window.ynScrollTo(id === "top" ? 0 : window.ynWorld?.scrollFor?.(id) ?? 0);
  }));
  document.querySelector(".yn-burger")?.addEventListener("click", () => root.classList.toggle("yn-menu"));
})();
