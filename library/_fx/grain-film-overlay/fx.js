// Covers the whole screen with a film grain layer — bakes frames sheets of transparent plates scattered with text-color dots by density, and swaps them at the fps tempo.
// The original tiles four 1000×563 GIFs (3.3% dots, 200ms) as a 600px (phone 350px) pattern at .25 opacity with difference blending — a light tint on dark backgrounds, a dark tint on light paper.
(() => {
  const colorOf = (el, name) => {
    const probe = document.createElement("i");
    probe.style.color = `var(${name})`;
    probe.hidden = true;
    el.append(probe);
    const m = getComputedStyle(probe).color.match(/[\d.]+/g) || [];
    probe.remove();
    return m.slice(0, 3).map(Number);
  };

  kfFx.register("grain-film-overlay", (el, { options, reduce }) => {
    const frames = Math.max(1, Math.round(+options.frames || 4));
    const fps = +options.fps || 5;
    const density = Math.min(1, Math.max(0, +(options.density ?? 0.033)));
    const w = Math.max(64, Math.round(+options.res || 1000));
    const h = Math.round(w * (+options.ratio || 0.563));
    const [r, g, b] = colorOf(el, options.color || "--kf-ink");
    if (r === undefined) return;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const urls = [];
    for (let f = 0; f < (reduce ? 1 : frames); f++) {
      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        if (Math.random() >= density) continue;
        d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      urls.push(`url(${canvas.toDataURL("image/png")})`);
    }
    let k = 0;
    el.style.backgroundImage = urls[0];
    el.classList.add("is-fx-grain");
    const timer = urls.length > 1 ? setInterval(() => { k = (k + 1) % urls.length; el.style.backgroundImage = urls[k]; }, 1000 / fps) : 0;
    return () => {
      clearInterval(timer);
      el.classList.remove("is-fx-grain");
      el.style.backgroundImage = "";
    };
  });
})();
