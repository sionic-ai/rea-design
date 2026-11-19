// Several scroll-progress-bound scene images are redrawn on a single canvas. Once progress passes start, the target frame is set at speed times,
// The current section chases the target by a lerp each frame, so it glides to a stop even after scrolling halts. With no image (no src), it sends fx:frame to the element and the consumer draws it
(() => {
  kfFx.register("scrub-frames", (el, { options, reduce, scroller }) => {
    const count = Math.max(2, Math.round(+options.frames || 120));
    const start = Math.min(0.99, +(options.start ?? 0.12)), speed = +options.speed || 4, lerp = Math.min(1, +options.lerp || 0.08);
    const made = !el.querySelector('[data-fx-part="canvas"]') && el.tagName !== "CANVAS";
    const canvas = el.tagName === "CANVAS" ? el : el.querySelector('[data-fx-part="canvas"]') || el.appendChild(document.createElement("canvas"));
    const ctx = options.src ? canvas.getContext("2d") : null;
    const pad = +(options.pad ?? 0), frames = [], sized = canvas.hasAttribute("width");
    const name = (i) => options.src.replace("{i}", String(i).padStart(pad, "0"));
    let goal = 0, cur = 0, shown = -1, raf = 0, io = null;

    const paint = (f) => {
      shown = f;
      if (!ctx) return el.dispatchEvent(new CustomEvent("fx:frame", { detail: { frame: f, count } }));
      const img = frames[f];
      if (!img) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    const load = () => {
      for (let i = 0; i < count; i++) {
        const img = new Image();
        img.onload = () => {
          frames[i] = img;
          if (i === 0 && !sized) { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; }
          if (i === Math.round(cur)) paint(i);
        };
        img.src = name(i);
      }
    };
    if (ctx) {
      io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); io = null; load(); } }, { rootMargin: "300px" });
      io.observe(el);
    }
    if (reduce) { paint(0); return () => { io?.disconnect(); if (made) canvas.remove(); }; }

    const target = (p) => (p < start ? 0 : Math.min(((p - start) / (1 - start)) * speed, 1) * (count - 1));
    const tick = () => {
      cur += (goal - cur) * lerp;
      if (Math.abs(goal - cur) < 0.01) cur = goal;
      const f = Math.round(cur);
      if (f !== shown) paint(f);
      raf = cur === goal ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const trigger = options.trigger ? el.closest(options.trigger) || document.querySelector(options.trigger) || el : el;
    const st = ScrollTrigger.create({
      trigger, scroller: scroller || undefined, start: options.enter || "top top", end: options.leave || "bottom bottom",
      onUpdate: (self) => { goal = target(self.progress); wake(); },
    });
    goal = cur = target(st.progress);
    paint(Math.round(cur));
    return () => { st.kill(); cancelAnimationFrame(raf); io?.disconnect(); if (made) canvas.remove(); };
  });
})();
