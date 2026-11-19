// In the middle of the black curtain, the number beside the name counts 0 → 100 (font 52 · document 92 · both approach 100 by 1 − e^(−dt/160)) while the color shifts from a blue-side dusk to orange, it holds .1s at 100, then the curtain lifts upward
(() => {
  let loadedAt = 0;
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (el, name) => {
    const s = getComputedStyle(el).getPropertyValue(name).trim();
    if (!s || !probe) return null;
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = s;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };

  kfFx.register("tint-count-loader", (el, { options, reduce }) => {
    const root = document.documentElement;
    const count = el.querySelector('[data-fx-part="count"]');
    const key = "fx-tint-count-loader";
    const done = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    let seen = false;
    try { seen = !options.every && sessionStorage.getItem(key) === "1"; } catch {}
    const late = loadedAt && performance.now() - loadedAt > 100;
    if (seen || late) {
      el.classList.add("is-gone");
      queueMicrotask(done);
      return () => el.classList.remove("is-gone");
    }
    try { sessionStorage.setItem(key, "1"); } catch {}
    // 0 is the orange end (--fx-tint-7), 100 is the blue end (--fx-tint-1)
    const stops = [7, 6, 5, 4, 3, 2, 1].map((i) => rgbOf(el, `--fx-tint-${i}`)).filter(Boolean);
    const colorAt = (p) => {
      if (stops.length < 2) return "";
      const s = Math.min(1, Math.max(0, p / 100)) * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(s)), t = s - i;
      const [a, b] = [stops[i], stops[i + 1]];
      return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)}, ${Math.round(a[1] + (b[1] - a[1]) * t)}, ${Math.round(a[2] + (b[2] - a[2]) * t)})`;
    };
    const dur = +(options.dur ?? 1.6) * 1000, hold = +(options.hold ?? 0.1) * 1000, min = +(options.min ?? 0.4) * 1000;
    el.style.setProperty("--fx-lift", `${dur}ms`);
    const show = (v) => {
      const n = Math.min(100, Math.round(v));
      if (count) { count.textContent = String(n); count.style.color = colorAt(n); }
      el.setAttribute("aria-valuenow", String(n));
    };
    const timers = [];
    let raf = 0, shown = 0, goal = 12, prev = performance.now(), finished = false;
    const start = prev;
    const aim = (v) => { goal = Math.max(goal, v); if (!raf && !finished) raf = requestAnimationFrame(tick); };
    root.classList.add("fx-loading");
    const close = () => {
      if (finished) return;
      finished = true;
      show(100);
      if (reduce) { root.classList.remove("fx-loading"); el.classList.add("is-gone"); done(); return; }
      timers.push(setTimeout(() => {
        el.classList.add("is-opening");
        timers.push(setTimeout(() => { root.classList.remove("fx-loading"); el.classList.add("is-gone"); done(); }, dur));
      }, hold));
    };
    function tick(now) {
      raf = 0;
      const dt = Math.min(64, Math.max(1, now - prev));
      prev = now;
      shown += (goal - shown) * (1 - Math.exp(-dt / 160));
      if (goal === 100 && shown >= 99.35 && now - start >= min) return close();
      show(shown);
      raf = requestAnimationFrame(tick);
    }
    show(0);
    raf = requestAnimationFrame(tick);
    const fonts = document.fonts?.ready || Promise.resolve();
    fonts.then(() => aim(52));
    const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }));
    loaded.then(() => aim(92));
    Promise.all([fonts, loaded]).then(() => aim(100));
    timers.push(setTimeout(() => aim(100), 5000));
    if (reduce) close();
    return () => {
      finished = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      root.classList.remove("fx-loading");
      el.classList.remove("is-opening", "is-gone");
      el.style.removeProperty("--fx-lift");
      if (count) count.style.removeProperty("color");
    };
  });
  // Loaders that arrive after the page is fully open do not cover with the curtain
  if (document.readyState === "complete") loadedAt = performance.now();
  else addEventListener("load", () => { loadedAt = performance.now(); }, { once: true });
})();
