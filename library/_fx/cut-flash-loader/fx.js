// Give each cut a length (data-ms) or leave it blank to use the original table (420 → 60ms) in order. The two strips are made by the part
(() => {
  const TABLE = [420, 360, 310, 270, 230, 200, 170, 150, 190, 110, 90, 80, 70];
  kfFx.register("cut-flash-loader", (el, { options, reduce }) => {
    const cuts = [...el.querySelectorAll('[data-fx-part="cut"]')];
    const done = () => { el.hidden = true; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    if (reduce || !cuts.length) { done(); return () => {}; }
    const speed = +options.speed || 1, dur = +(options.dur ?? 0.9), delay = +(options.delay ?? 0.12), ease = kfFx.ease(options.ease || "", "power4.out");
    const bar = (k) => { const b = document.createElement("span"); b.className = `fx-bar is-${k}`; el.append(b); return b; };
    const bars = [bar("top"), bar("bot")];
    const probe = document.createElement("span"); probe.className = "fx-probe"; el.append(probe);
    const cap = () => { const c = document.createElement("canvas").getContext("2d"); c.font = `400 100px ${getComputedStyle(probe).fontFamily}`; return c.measureText("H").actualBoundingBoxAscent / 100 || .79; };
    const fit = (txt, w) => { probe.style.fontSize = "100px"; probe.textContent = txt; return 100 * w / (probe.getBoundingClientRect().width || 1); };
    const ms = cuts.map((c, i) => (+c.dataset.ms || TABLE[i] || 60) / speed);
    // Word cuts (cuts holding only text) fit within .9 width and .76 height, while full cuts fit to fill the screen
    const size = (c) => {
      if (c.children.length) return;
      const W = el.clientWidth, H = el.clientHeight, full = /\bfull\b/.test(c.dataset.look || "");
      c.style.fontSize = `${full ? Math.min(fit(c.textContent, W), H / cap()) : Math.min(fit(c.textContent, .9 * W), .76 * H / cap())}px`;
    };
    const timers = [], starts = [];
    let at = 0, raf = 0, tl;
    el.classList.add("is-on");
    cuts.forEach((c, i) => { starts.push(at); timers.push(setTimeout(() => { cuts.forEach((o) => o.classList.toggle("is-now", o === c)); size(c); }, at)); at += ms[i]; });
    const total = at, big = cuts.findIndex((c) => /\bfull\b/.test(c.dataset.look || ""));
    const from = big >= 0 ? starts[big] + ms[big] : .6 * total, t0 = performance.now();
    // From after the big word ends to the last cut, the band closes by (1 − cos πp)/2
    const close = () => {
      const p = Math.min(Math.max(0, performance.now() - t0 - from) / Math.max(1, total - from), 1);
      gsap.set(bars, { scaleY: (1 - Math.cos(p * Math.PI)) / 2 });
      if (p < 1) raf = requestAnimationFrame(close);
    };
    raf = requestAnimationFrame(close);
    timers.push(setTimeout(() => {
      gsap.set(bars, { scaleY: 1 }); cuts.forEach((c) => c.classList.remove("is-now")); el.classList.add("is-split");
      tl = gsap.timeline({ onComplete: done })
        .to(bars[0], { yPercent: -100, duration: dur, ease }, delay)
        .to(bars[1], { yPercent: 100, duration: dur, ease }, "<");
    }, total));
    return () => {
      timers.forEach(clearTimeout); cancelAnimationFrame(raf); tl?.kill();
      bars.forEach((b) => b.remove()); probe.remove();
      cuts.forEach((c) => { c.classList.remove("is-now"); c.style.fontSize = ""; });
      el.classList.remove("is-on", "is-split");
    };
  });
})();
