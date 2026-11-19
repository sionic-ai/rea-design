(() => {
  // One cursor for the whole window is shared by all panels — attaching a listener per panel makes events pile up on screens with dozens of panels (lists, FAQ)
  const pointer = { x: -1e5, y: -1e5, inside: false };
  let listening = false;
  const listen = () => {
    if (listening) return;
    listening = true;
    addEventListener("pointermove", (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.inside = true; }, { passive: true });
    document.addEventListener("pointerleave", () => { pointer.inside = false; });
    addEventListener("blur", () => { pointer.inside = false; });
  };

  // Turns skin variables (including oklch(from …) and color-mix) into the rgb triplet the canvas uses — paints the computed color on a 1×1 canvas and reads it
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (el, name) => {
    const raw = getComputedStyle(el).getPropertyValue(name).trim();
    if (!raw) return null;
    const tmp = document.createElement("i");
    tmp.style.color = raw;
    tmp.style.display = "none";
    el.append(tmp);
    const css = getComputedStyle(tmp).color;
    tmp.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = css;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return `${r}, ${g}, ${b}`;
  };

  kfFx.register("cursor-glow-border", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    listen();
    const size = +(options.size ?? 100);
    const reach = +(options.reach ?? 1000);
    const ease = +(options.ease ?? 0.1);
    const width = +(options.width ?? 1);

    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "2" });
    el.append(canvas);
    const ctx = canvas.getContext("2d");

    let w = 0, h = 0, radius = 0, color = null, tick = 0;
    const local = { x: 0, y: 0, ready: false };
    const measure = () => {
      w = Math.max(1, Math.round(el.offsetWidth));
      h = Math.max(1, Math.round(el.offsetHeight));
      canvas.width = w;
      canvas.height = h;
      radius = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, w / 2, h / 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const draw = () => {
      // Re-read every few frames so the light color follows even if the plate theme changes mid-scroll (dark section → light section)
      if (tick++ % 20 === 0) color = rgbOf(el, "--fx-glow") || rgbOf(el, "--kf-accent");
      ctx.clearRect(0, 0, w, h);
      if (!pointer.inside || !color) return;
      const r = el.getBoundingClientRect();
      const near = pointer.x > r.left - reach && pointer.x < r.right + reach && pointer.y > r.top - reach && pointer.y < r.bottom + reach;
      if (!near) return;
      const tx = pointer.x - r.left, ty = pointer.y - r.top;
      if (!local.ready) { local.x = tx; local.y = ty; local.ready = true; }
      local.x += (tx - local.x) * ease;
      local.y += (ty - local.y) * ease;
      const g = ctx.createRadialGradient(local.x, local.y, 0, local.x, local.y, size);
      g.addColorStop(0, `rgba(${color}, 1)`);
      g.addColorStop(1, `rgba(${color}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, radius);
      ctx.roundRect(width, width, w - width * 2, h - width * 2, Math.max(0, radius - width));
      ctx.fill("evenodd");
    };
    gsap.ticker.add(draw);
    return () => { gsap.ticker.remove(draw); ro.disconnect(); canvas.remove(); };
  });
})();
