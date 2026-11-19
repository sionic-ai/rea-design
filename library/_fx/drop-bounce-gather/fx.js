(() => {
  // Chip positions are set by a seed random — rewinding the scroll or reopening gives the same pile
  kfFx.register("drop-bounce-gather", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      const stage = el.querySelector("[data-fx-part=stage]"), chips = stage ? [...stage.querySelectorAll("[data-fx-part=chip]")] : [];
      if (!chips.length) return;
      gsap.registerPlugin(ScrollTrigger, CustomBounce);
      if (options.length) el.style.setProperty("--fx-length", options.length + "vh");
      const beat = 60 / (+options.bpm || 142);
      const io = kfFx.ease("0.65,0,0.15,1", "power3.inOut"), rel = kfFx.ease("0.1,0.6,0.3,0.9", "power2.out");
      const land = window.CustomBounce ? CustomEase.get("fx-land") || CustomBounce.create("fx-land", { strength: 0.35, squash: 2 }) : "bounce.out";
      const cap = stage.querySelector("[data-fx-part=capsule]");
      const W = stage.clientWidth, H = stage.clientHeight;
      let t = 142 >>> 0; const rnd = () => ((t = (Math.imul(t, 1103515245) + 12345) >>> 0), ((t >>> 8) & 0xffff) / 0x10000);
      const fh = Math.max(...chips.map((f) => f.offsetHeight)), rows = [[]];
      let used = 0;
      chips.forEach((f, k) => {
        const limit = W * Math.max(0.4, 0.94 - 0.16 * (rows.length - 1));
        if (used && used + f.offsetWidth + 10 > limit) { rows.push([]); used = 0; }
        rows[rows.length - 1].push(k); used += f.offsetWidth + 10;
      });
      const lift = Math.min(fh + 6, (H - fh - 8) / Math.max(1, rows.length - 1)), spot = [];
      rows.forEach((row, r) => {
        let x = (W - (row.reduce((s, k) => s + chips[k].offsetWidth, 0) + (row.length - 1) * 10)) / 2;
        row.forEach((k) => { spot[k] = { x: gsap.utils.clamp(0, Math.max(0, W - chips[k].offsetWidth), x + 6 * rnd() - 3), y: H - fh - 2 - r * lift, rotation: 8 * rnd() - 4 }; x += chips[k].offsetWidth + 10; });
      });
      if (reduce) { chips.forEach((f) => gsap.set(f, { autoAlpha: 0 })); return; }
      const order = chips.map((_, k) => k);
      for (let k = order.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [order[k], order[j]] = [order[j], order[k]]; }
      if (cap) gsap.set(cap, { autoAlpha: 0, scale: 0.92 });
      chips.forEach((f, k) => gsap.set(f, { x: spot[k].x, y: -H - 60 }));
      const tl = gsap.timeline({ paused: true });
      order.forEach((k, i) => tl.to(chips[k], { y: spot[k].y, rotation: spot[k].rotation, duration: beat * 1.5, ease: land }, (i * beat) / 2));
      const T = beat * 10;
      chips.forEach((f, k) => tl.to(f, { x: () => (stage.clientWidth - f.offsetWidth) / 2, y: () => (stage.clientHeight - f.offsetHeight) / 2, rotation: 0, scale: 0.2, autoAlpha: 0, duration: beat, ease: io }, T + (k * beat) / 4));
      if (cap) tl.to(cap, { autoAlpha: 1, scale: 1, duration: beat, ease: rel }, T + beat + ((chips.length - 1) * beat) / 4);
      tl.set({}, {}, tl.duration() + beat * 4);
      ScrollTrigger.create({ scroller, trigger: el, start: "top top", end: "bottom bottom", scrub: true, animation: tl });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
