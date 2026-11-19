(() => {
  // Scatters count soft bokeh dots (50px · blur 40px · opacity .5) at random spots inside the panel, with scroll parallax of size (.3~1) squared × 500% —
  // Bigger blobs pass faster, which creates depth. Each blob bobs up and down in place over 2~3s (±50~100% of its height) (framer easeInOut, reversing repeat)
  kfFx.register("glow-dot-drift", (el, { options, reduce, scroller }) => {
    const count = Math.max(0, Math.round(+options.count || 30));
    const depth = +(options.depth ?? 500);
    const ease = kfFx.ease(options.ease || "0.42,0,0.58,1", "power1.inOut");
    const rnd = (a, b) => a + (b - a) * Math.random();
    const dots = [], tweens = [];
    for (let i = 0; i < count; i++) {
      const s = rnd(0.3, 1);
      const dot = document.createElement("span");
      dot.className = "fx-gdd-dot";
      dot.style.cssText = `top:${(Math.random() * 100).toFixed(2)}%;left:${(Math.random() * 100).toFixed(2)}%;transform:scale(${s.toFixed(3)})`;
      dot.innerHTML = '<span class="fx-gdd-par"><span class="fx-gdd-glow"></span></span>';
      el.append(dot);
      dots.push(dot);
      if (reduce) continue;
      const par = dot.firstElementChild, glow = par.firstElementChild;
      const r = (Math.random() > 0.5 ? 1 : -1) * Math.floor(rnd(50, 101));
      tweens.push(gsap.fromTo(glow, { yPercent: -r }, { yPercent: r, duration: rnd(2, 3), ease, repeat: -1, yoyo: true }));
      const d = depth * s * s;
      tweens.push(gsap.fromTo(par, { yPercent: d }, { yPercent: -d, ease: "none", scrollTrigger: { trigger: dot, scroller: scroller || undefined, start: "top bottom", end: "bottom top", scrub: true } }));
    }
    return () => {
      tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
      dots.forEach((d) => d.remove());
    };
  });
})();
