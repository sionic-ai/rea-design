(() => {
  // Build one ridge line (0~1) by midpoint displacement — the same seed always gives the same mountain
  const rng = (s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const line = (seed, n, rough) => {
    const r = rng(Math.max(1, Math.floor(seed)));
    const h = new Array(n + 1).fill(0);
    h[0] = r(); h[n] = r();
    let step = n, amp = 1;
    while (step > 1) {
      const half = step / 2;
      for (let i = half; i < n; i += step) h[i] = (h[i - half] + h[i + half]) / 2 + (r() - 0.5) * amp;
      step = half; amp *= rough;
    }
    const min = Math.min(...h), max = Math.max(...h);
    return h.map((v) => (v - min) / (max - min || 1));
  };
  let uid = 0;
  kfFx.register("ridge-layers", (el, { options, reduce, scroller }) => {
    const count = Math.max(1, Math.floor(+options.layers || 4));
    const seed = +(options.seed ?? 7), rough = +(options.rough ?? 0.56);
    const speeds = String(options.speeds || ".02,.05,.08,.11").split(",").map(Number);
    const w = 1440, h = 300, n = 256;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "fx-ridge");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    let defs = "", body = "";
    for (let k = 0; k < count; k++) {
      const id = `fx-ridge-${uid++}`;
      const depth = count === 1 ? 1 : k / (count - 1);
      const top = (0.04 + 0.56 * depth) * h, amp = (0.3 - 0.1 * depth) * h;
      const pts = line(seed + k * 13, n, rough).map((v, i) => `${((i / n) * (w + 40) - 20).toFixed(1)},${(top + (1 - v) * amp).toFixed(1)}`);
      const mix = Math.round(30 + 70 * depth);
      const ink = `color-mix(in oklab, var(--fx-ridge-ink, var(--kf-accent)) ${mix}%, var(--kf-bg))`;
      defs += `<linearGradient id="${id}" x1="0" y1="${top}" x2="0" y2="${h}" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:${ink}"/><stop offset="1" style="stop-color:${ink};stop-opacity:${(0.2 + 0.8 * depth).toFixed(2)}"/></linearGradient>`;
      body += `<g data-speed="${speeds[k] ?? speeds[speeds.length - 1] ?? 0}"><path d="M-20,${h + 60} L${pts.join(" L")} L${w + 20},${h + 60} Z" fill="url(#${id})"/></g>`;
    }
    svg.innerHTML = `<defs>${defs}</defs>${body}`;
    el.append(svg);
    const tweens = reduce ? [] : [...svg.querySelectorAll("g")].map((g) => {
      const s = +g.dataset.speed;
      return s ? gsap.fromTo(g, { y: () => -s * 300 }, { y: () => s * 300, ease: "none", scrollTrigger: { trigger: el, scroller, start: "top bottom", end: "bottom top", scrub: true } }) : null;
    }).filter(Boolean);
    return () => { tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); }); svg.remove(); };
  });
})();
