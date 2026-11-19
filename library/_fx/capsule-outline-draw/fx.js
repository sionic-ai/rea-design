(() => {
  // Wrap each word of the big title in a capsule (pill) and paint the band where every point’s distance to the nearest capsule is within [reach, reach+band].
  // The band sits deep inside the capsule (reach −.75, in width units = title width) to −.25 over 1s expo.inOut, filling up into a solid pill,
  // thins out to reach 0 and band 2px with .5s expo.out, leaving only the outline — then the word grows from .85→1 in .75s expo.out and appears.
  // Street strip = (sum of capsules grown by radius + outer end) − (sum of capsules grown by radius + inner end), so it is drawn exactly with a 2D canvas.
  kfFx.register("capsule-outline-draw", (el, { options, reduce }) => {
    const words = [...el.querySelectorAll('[data-fx-part="word"]')];
    if (!words.length) return;
    const num = (k, d) => { const v = parseFloat(options[k]); return Number.isFinite(v) ? v : d; };
    const line = num("line", 2), grow = num("grow", 1), thin = num("thin", 0.5), pop = num("pop", 0.75);
    const padX = num("padx", 0.3), padY = num("pady", 0.095), start = num("from", -0.75);
    const cv = document.createElement("canvas");
    cv.className = "fx-capsule-outline-draw__gl";
    cv.setAttribute("aria-hidden", "true");
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    el.classList.add("fx-capsule-outline-draw--armed");
    el.prepend(cv);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let caps = [], W = 1, M = 0, ox = 0, oy = 0;
    const state = { reach: start, band: 0.25 };
    let shown = false, done = false, tweens = [], timer = 0;

    const measure = () => {
      const r = el.getBoundingClientRect();
      W = Math.max(r.width, 1);
      let tallest = 0;
      caps = words.map((w) => {
        const b = w.getBoundingClientRect();
        const h = b.height / (gsap.getProperty?.(w, "scaleY") || 1);
        const bw = b.width / (gsap.getProperty?.(w, "scaleX") || 1);
        const cx = b.left + b.width / 2 - r.left, cy = b.top + b.height / 2 - r.top;
        tallest = Math.max(tallest, h);
        const desc = /[qpgjy]/.test(w.closest('[data-fx-part="line"]')?.textContent || w.textContent);
        const px = h * padX, py = h * (desc ? padY + 0.01 : padY);
        const height = h + py * 2, rad = height / 2;
        const left = cx - bw / 2 - px + h * 0.025, right = cx + bw / 2 + px + h * 0.025;
        const y = cy + h * (desc ? 0.09 : 0);
        return { a: left + rad, b: Math.max(right - rad, left + rad), y, r: rad };
      });
      M = Math.ceil(tallest * 0.5 + line * 2);
      ox = -M; oy = -M;
      cv.style.left = `${ox}px`;
      cv.style.top = `${oy}px`;
      cv.style.width = `${r.width + M * 2}px`;
      cv.style.height = `${r.height + M * 2}px`;
      cv.width = Math.round((r.width + M * 2) * dpr);
      cv.height = Math.round((r.height + M * 2) * dpr);
      draw();
    };
    const union = (grow) => {
      ctx.beginPath();
      let any = false;
      caps.forEach((c) => {
        const R = c.r + grow;
        if (R <= 0) return;
        any = true;
        ctx.roundRect(c.a - R - ox, c.y - R - oy, c.b - c.a + R * 2, R * 2, R);
      });
      return any;
    };
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (!shown) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = getComputedStyle(el).color;
      const outer = (state.reach + state.band) * W, inner = state.reach * W;
      if (!union(outer)) return;
      ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      if (union(inner)) ctx.fill();
    };
    const popWords = () => words.forEach((w) => {
      if (reduce || pop <= 0) { w.style.opacity = "1"; return; }
      tweens.push(gsap.fromTo(w, { scale: 0.85 }, { scale: 1, duration: pop, ease: "expo.out", onStart: () => { w.style.opacity = "1"; } }));
    });
    const play = () => {
      shown = true;
      if (reduce) { state.reach = 0; state.band = line / W; done = true; draw(); popWords(); return; }
      tweens.push(gsap.to(state, { reach: -0.25, duration: grow, ease: "expo.inOut", onUpdate: draw }));
      timer = setTimeout(() => {
        done = true;
        tweens.push(gsap.to(state, { reach: 0, band: line / W, duration: thin, ease: "expo.out", onUpdate: draw }));
        popWords();
      }, grow * 1000);
    };
    const io = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) { io.disconnect(); play(); } });
    io.observe(el);
    const ro = new ResizeObserver(() => { measure(); if (done && !gsap.isTweening(state)) { state.band = line / W; draw(); } });
    ro.observe(el);
    measure();
    return () => {
      io.disconnect();
      ro.disconnect();
      clearTimeout(timer);
      tweens.forEach((t) => t.kill());
      gsap.killTweensOf(state);
      words.forEach((w) => { gsap.set(w, { clearProps: "transform,opacity" }); });
      el.classList.remove("fx-capsule-outline-draw--armed");
      cv.remove();
    };
  });
})();
