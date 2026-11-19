(() => {
  // Thumping on the beat chart like a speaker — in each beat of a bar (default 3.24s) it pops to scaleMax in .032s (power4.out), presses to scaleMin in .075s (power4.in), then returns to 1 at .08s.
  // Tempo marks are 「time:max/min」 separated by commas (original woofer logo, 6 beats)
  const BEATS = "0:1.036/.982, .78:1.024/.991, 1.68:1.036/.982, 1.88:1.006/.9985, 2.62:1.036/.982, 3:1.03/.989";
  kfFx.register("beat-pulse", (el, { options, reduce }) => {
    if (reduce) return;
    const bar = +options.loop || 3.24, up = +(options.up ?? 0.032), down = +(options.down ?? 0.075), back = +(options.back ?? 0.08);
    const beats = String(options.beats || BEATS).split(",").map((s) => s.trim().match(/^([\d.]+)\s*:\s*([\d.]+)\s*\/\s*([\d.]+)$/)).filter(Boolean).map((m) => m.slice(1).map(Number));
    if (!beats.length) return;
    const tl = gsap.timeline({ repeat: -1, delay: +(options.delay ?? 0) });
    beats.forEach(([t, mx, mn]) => {
      tl.to(el, { scale: mx, duration: up, ease: "power4.out" }, t)
        .to(el, { scale: mn, duration: down, ease: "power4.in" }, t + up)
        .to(el, { scale: 1, duration: back, ease: "power4.out" }, t + up + down);
    });
    if (tl.duration() < bar) tl.to({}, { duration: bar - tl.duration() });
    return () => { tl.kill(); gsap.set(el, { clearProps: "transform" }); };
  });
})();
