// Same seed gives the same steps — the shape doesn’t jump when the window resizes and redraws
(() => {
  kfFx.register("pixel-stairs", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const o = { cell: +options.cell || 40, thick: +options.thick || 5, slope: options.slope ? +options.slope : 0.55, start: options.start ? +options.start : 0.85, seed: +options.seed || 1 };
      const draw = () => {
        const W = el.clientWidth || el.parentElement.clientWidth, H = el.clientHeight || el.parentElement.clientHeight;
        const cols = Math.ceil(W / o.cell) + 1, rows = Math.ceil(H / o.cell) + 1;
        let s = o.seed, y = Math.round(rows * o.start), acc = 0, out = "";
        const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
        for (let i = 0; i < cols; i++) {
          acc += o.slope + (rnd() - 0.5) * 0.6;
          while (acc >= 1) { y--; acc--; }
          const t = o.thick + Math.round((rnd() - 0.5) * 2);
          for (let j = 0; j < t; j++) out += `<rect x="${i * o.cell}" y="${(y + j) * o.cell}" width="${o.cell + 0.5}" height="${o.cell + 0.5}"/>`;
        }
        el.setAttribute("viewBox", `0 0 ${W} ${H}`);
        el.setAttribute("preserveAspectRatio", "none");
        el.setAttribute("fill", "currentColor");
        el.innerHTML = out;
      };
      draw();
      let t; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(draw, 200); }, { signal });
      if (reduce || options.draw === "none") return;
      const tw = gsap.from(el.querySelectorAll("rect"), { autoAlpha: 0, duration: 0.01, stagger: { amount: 1, ease: "power1.out" }, paused: options.draw === "enter" });
      if (options.draw === "enter") ScrollTrigger.create({ scroller, trigger: el.parentElement, start: "top bottom-=100", once: true, onEnter: () => tw.play() });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
