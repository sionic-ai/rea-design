// Mosaic develop — shrinks the photo to 18 columns wide, then raises the cell count by (progress)^2.5 to ‹develop› it back to full resolution. Meanwhile it settles from 1.1x to 1x.
// Photo (<img data-fx-part="img">) lays a same-size canvas on top and draws, then leaves the canvas as it is when done (same picture as the photo)
// If steps is given, it redraws at the given widths (px), jumping at each every interval (seconds), and when done removes the canvas to show the photo (Brand first photo)
(() => {
  kfFx.register("pixel-develop", (el, { options, reduce, scroller }) => {
    const img = el.querySelector('[data-fx-part="img"]');
    if (reduce || !img || !window.ScrollTrigger) return;
    const from = +(options.from ?? 18) || 18, power = +(options.power ?? 2.5) || 2.5, dur = +(options.dur ?? 1.5), zoom = +(options.scale ?? 1.1);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const steps = options.steps ? String(options.steps).split(",").map(Number).filter((n) => n > 0) : null;
    const blocks = !steps && options.blocks ? String(options.blocks).split(",").map(Number).filter((n) => n > 0) : null;
    const every = +(options.every ?? 0.1), wait = +(options.wait ?? 0);
    let fixed = null;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "fx-pixel-develop__canvas";
    el.appendChild(canvas);
    const ctx = canvas.getContext("2d"), small = document.createElement("canvas"), sctx = small.getContext("2d");
    const st = { p: 0 };
    let ok = false;
    const draw = () => {
      if (!ok) return;
      const W = img.naturalWidth, H = img.naturalHeight;
      if (canvas.width !== W) { canvas.width = W; canvas.height = H; }
      const l = fixed ?? Math.max(1, Math.round(from + (W - from) * st.p ** power)), u = Math.max(1, Math.round((H / W) * l));
      small.width = l; small.height = u;
      sctx.drawImage(img, 0, 0, l, u);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(small, 0, 0, l, u, 0, 0, W, H);
    };
    const ready = () => { ok = !!img.naturalWidth; el.classList.toggle("fx-pixel-develop--on", ok); draw(); };
    if (img.complete) ready(); else img.addEventListener("load", ready, { once: true });
    gsap.set(canvas, { scale: zoom });
    const trigger = options.on === "load" ? {} : { scrollTrigger: { trigger: el, scroller, start: options.start || "top center", toggleActions: "play none none none" } };
    const tl = gsap.timeline({ delay: wait, ...trigger });
    // blocks is the cell size — the panel width (max 720) is divided by it to set the drawing width, so the mosaic keeps the same grain whether the panel is large or small (Brand)
    const list = steps || blocks;
    if (list) {
      const widthOf = (w) => (steps ? w : Math.max(2, Math.round(Math.min(el.clientWidth || 720, 720) / w)));
      list.forEach((w, i) => tl.call(() => ((fixed = widthOf(w)), draw()), null, i * every));
      tl.to(canvas, { scale: 1, duration: list.length * every, ease }, 0).set(canvas, { opacity: 0 }, list.length * every);
    } else {
      tl.to(st, { p: 1, duration: dur, ease, onUpdate: draw }).to(canvas, { scale: 1, duration: dur, ease }, 0);
    }
    return () => {
      img.removeEventListener("load", ready);
      tl.scrollTrigger?.kill();
      tl.kill();
      canvas.remove();
      el.classList.remove("fx-pixel-develop--on");
    };
  });
})();
