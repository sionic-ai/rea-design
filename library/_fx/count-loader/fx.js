// The panel runs after fonts are fully loaded — letter positions jump if fonts change late
(() => {
  kfFx.register("count-loader", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      const KEY = "kf-fx-count-loader";
      const done = () => document.dispatchEvent(new Event("fx:loaded"));
      if (reduce || (!(options.every === "true") && sessionStorage.getItem(KEY) === "1")) return done();
      sessionStorage.setItem(KEY, "1");
      // Defaults to the original values. For screens opened often, like an app, shorten them — fx:loaded fires only after the panel lifts, so wait dur + out + each × ⅔ × (letter count − 1). The exit starts after the numbers finish counting, so keep in + each × (letter count − 1) within dur
      const dur = +(options.dur ?? 1.4), dIn = +(options.in ?? 0.7), dOut = +(options.out ?? 0.5), each = +(options.each ?? 0.03);
      const slow = kfFx.ease("0.16,1,0.3,1", "expo.out");
      const ld = document.createElement("div");
      ld.className = "fx-loader";
      const t = document.createElement("div"), n = document.createElement("div");
      t.className = "t"; n.className = "n"; n.textContent = "00";
      [...(options.text || "Almost there")].forEach((c) => { const s = document.createElement("span"); s.textContent = c; t.append(s); });
      ld.append(t, n);
      document.body.append(ld);
      signal.addEventListener("abort", () => ld.remove());
      const chars = t.children, v = { v: 0 };
      document.fonts.ready.then(() => gsap.timeline({ onComplete: () => { ld.remove(); done(); } })
        .from(chars, { yPercent: (i) => (i % 2 ? 100 : -100), duration: dIn, ease: slow, stagger: { each, from: "random" } })
        .to(v, { v: 100, duration: dur, ease: "power1.inOut", onUpdate: () => (n.textContent = String(Math.round(v.v)).padStart(2, "0")) }, 0)
        .to(chars, { yPercent: (i) => (i % 2 ? -100 : 100), duration: dOut, ease: "power2.in", stagger: { each: (each * 2) / 3, from: "random" } }, ">")
        .to(n, { autoAlpha: 0, duration: Math.min(0.3, dOut) }, "<"));
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
