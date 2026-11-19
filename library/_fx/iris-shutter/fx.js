(() => {
  // Aperture shutter — six blades turn and tighten closed, leaving a hexagonal hole (hole radius 190 → 28.5, panel 1.15 → .7x)
  const R = 200;
  const blade = (i, s, count) => {
    const step = (Math.PI * 2) / count;
    const a = step * i - Math.PI / 2 + s * step * 0.5;
    const nx = Math.cos(a), ny = Math.sin(a), dx = -ny, dy = nx;
    const c = Math.max(R * 0.95 * s, 1);
    const tx = R + nx * c, ty = R + ny * c, L = R * 2;
    const p = [[tx - dx * L, ty - dy * L], [tx + dx * L, ty + dy * L], [tx + dx * L + nx * L, ty + dy * L + ny * L], [tx - dx * L + nx * L, ty - dy * L + ny * L]];
    return `M${p.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L")}Z`;
  };
  kfFx.register("iris-shutter", (el, { options, reduce }) => {
    const group = el.querySelector('[data-fx-part="blades"]');
    if (!group) return;
    const svg = group.ownerSVGElement;
    const count = Math.max(3, +(options.blades || 6));
    const open = +(options.from ?? 1), shut = +(options.to ?? 0.15), rate = +(options.rate ?? 0.075);
    const big = +(options["scale-from"] ?? 1.15), small = +(options["scale-to"] ?? 0.7);
    const hold = +(options.hold ?? 100);
    group.textContent = "";
    const paths = Array.from({ length: count }, () => group.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "path")));
    const draw = (s) => paths.forEach((p, i) => p.setAttribute("d", blade(i, s, count)));
    let raf = 0, timer = 0, s = open;
    draw(open);
    const close = () => {
      cancelAnimationFrame(raf); clearTimeout(timer);
      el.classList.add("is-active");
      const done = () => { draw(shut); if (svg) svg.style.transform = `scale(${small})`; timer = setTimeout(() => el.dispatchEvent(new CustomEvent("fx:closed", { bubbles: true })), hold); };
      if (reduce) return done();
      s = open;
      if (svg) { svg.style.transition = "none"; svg.style.transform = `scale(${big})`; }
      // Each frame closes 7.5% of the remaining distance — fast at first, slowly settling at the end
      const step = () => {
        const left = shut - s;
        if (Math.abs(left) <= 0.001) return done();
        s += left * rate;
        draw(s);
        const k = 1 - (s - shut) / (open - shut);
        if (svg) svg.style.transform = `scale(${big + (small - big) * k})`;
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const reset = () => { cancelAnimationFrame(raf); clearTimeout(timer); el.classList.remove("is-active"); s = open; draw(open); if (svg) svg.style.transform = ""; };
    el.addEventListener("fx:close", close);
    el.addEventListener("fx:reset", reset);
    return () => { reset(); el.removeEventListener("fx:close", close); el.removeEventListener("fx:reset", reset); group.textContent = ""; };
  });
})();
