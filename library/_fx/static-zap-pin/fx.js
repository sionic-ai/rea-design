// Screen-fixed channel flipping: each screen of scroll moves to the next section, and noise, torn strips and flashes cover the screen during the change. When the section changes, fx:zap.
(() => {
  kfFx.register("static-zap-pin", (el, { options, reduce, scroller }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length) return;
    const media = (s) => s.firstElementChild;
    const ZAP = +(options.dur ?? 0.38), PRE = +(options.pre ?? 0.88), drift = +(options.drift ?? -28), zoom = +(options.zoom ?? 0.05);
    const clamp = (v) => Math.max(0, Math.min(1, v));
    let current = 0, zapping = false, timers = [];
    slides[0].classList.add("is-on");
    if (slides.length < 2 || !window.ScrollTrigger) return () => slides[0].classList.remove("is-on");

    // Overlay panel — not created if reduce
    let fx = { tension() {}, level() {}, flash() {}, kill() {} };
    if (!reduce) {
      const root = document.createElement("div");
      root.className = "fx-szp";
      root.innerHTML = '<canvas></canvas><div class="fx-szp-flash"></div><div class="fx-szp-scan"></div>' + '<div class="fx-szp-bar"></div>'.repeat(5);
      el.append(root);
      const canvas = root.querySelector("canvas"), ctx = canvas.getContext("2d"), flash = root.querySelector(".fx-szp-flash"), scan = root.querySelector(".fx-szp-scan"), bars = [...root.querySelectorAll(".fx-szp-bar")];
      let level = 0, tension = 0, running = false, raf = 0, buf = null, frame = 0;
      const size = () => {
        const vw = el.clientWidth || innerWidth, vh = el.clientHeight || innerHeight;
        const w = Math.max(480, Math.min(854, (vw * 0.62) | 0)), h = Math.max(270, Math.min(480, ((w * vh) / vw) | 0));
        if (buf && canvas.width === w && canvas.height === h) return;
        canvas.width = w; canvas.height = h; buf = ctx.createImageData(w, h);
      };
      const sync = () => { scan.style.opacity = Math.max(tension, level) * 0.75; };
      const loop = () => {
        if (!running) return;
        if (level > 0.03) {
          const d = buf.data, a = 25 + level * 130, chroma = 34 * level;
          for (let i = 0; i < d.length; i += 4) {
            const v = (Math.random() * 255) | 0;
            d[i] = Math.max(0, Math.min(255, v + (Math.random() - 0.5) * chroma));
            d[i + 1] = v;
            d[i + 2] = Math.max(0, Math.min(255, v - (Math.random() - 0.5) * chroma));
            d[i + 3] = Math.min(255, a * (0.28 + Math.random() * 0.72));
          }
          ctx.putImageData(buf, 0, 0);
          canvas.style.opacity = 0.28 + level * 0.55;
          if (++frame % 2 === 0 || level > 0.92) bars.forEach((b) => {
            if (Math.random() < 0.3 * level) { b.style.opacity = 0.3 + level * 0.55; b.style.top = Math.random() * 96 + "%"; b.style.transform = `translate3d(${((Math.random() - 0.5) * 44 * level) | 0}px,0,0) skewX(${((Math.random() - 0.5) * 12 * level) | 0}deg)`; }
            else b.style.opacity = 0;
          });
        }
        sync();
        raf = requestAnimationFrame(loop);
      };
      const stop = () => { level = 0; running = false; frame = 0; cancelAnimationFrame(raf); root.classList.remove("is-heavy"); canvas.style.opacity = 0; bars.forEach((b) => { b.style.opacity = 0; }); sync(); };
      fx = {
        tension(v) { tension = clamp(v); sync(); },
        level(v) { level = clamp(v); if (level > 0.03 && !running) { running = true; size(); root.classList.add("is-heavy"); loop(); } if (level <= 0.03) stop(); else sync(); },
        flash() { gsap.fromTo(flash, { opacity: 0 }, { opacity: 0.45, duration: 0.05, ease: "power4.in", yoyo: true, repeat: 1 }); },
        kill() { stop(); root.remove(); },
      };
    }
    const parallax = (s, t) => { const m = media(s); if (m) gsap.set(m, { y: clamp(t) * drift, scale: 1 + clamp(t) * zoom }); };
    const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); };
    function go(idx) {
      idx = Math.max(0, Math.min(slides.length - 1, idx));
      if (idx === current || zapping) return;
      const prev = slides[current], next = slides[idx], pm = media(prev), nm = media(next), from = current;
      zapping = true; current = idx;
      fx.level(1); fx.flash();
      parallax(prev, 0); parallax(next, 0);
      prev.classList.remove("is-on"); prev.classList.add("is-out");
      next.classList.add("is-on");
      if (reduce) { prev.classList.remove("is-out"); zapping = false; }
      else {
        if (pm) gsap.to(pm, { x: -14, skewX: 6, scale: 1.02, filter: "contrast(1.4) saturate(0.3) brightness(1.2)", duration: 0.14, ease: "power3.in" });
        if (nm) gsap.fromTo(nm, { x: 16, y: 0, skewX: -5, scale: 1.08, filter: "contrast(1.5) brightness(1.4) blur(2px)" }, { x: 0, y: 0, skewX: 0, scale: 1, filter: "none", duration: ZAP, ease: "power4.out" });
        later(() => { prev.classList.remove("is-out"); if (pm) gsap.set(pm, { clearProps: "transform,filter" }); }, 140);
        later(() => { fx.level(0); fx.tension(0); zapping = false; }, ZAP * 1000);
      }
      slides.forEach((s, i) => { if (i !== idx && s !== prev) s.classList.remove("is-on", "is-out"); });
      el.dispatchEvent(new CustomEvent("fx:zap", { bubbles: true, detail: { index: idx, prev: from } }));
    }
    const total = slides.length;
    const st = ScrollTrigger.create({
      scroller, trigger: el, start: "top top", end: () => "+=" + (total - 1) * (scroller ? scroller.clientHeight : innerHeight), pin: true, anticipatePin: 1,
      snap: reduce || options.snap === "false" ? undefined : { snapTo: (v) => { const step = 1 / (total - 1); return Math.round(v / step) * step; }, duration: { min: 0.16, max: Math.max(0.16, ZAP) }, ease: "power3.inOut" },
      onUpdate(self) {
        if (zapping) return;
        const raw = self.progress * (total - 1), seg = Math.min(total - 1, Math.floor(raw + 0.0001)), local = seg >= total - 1 ? 0 : raw - seg;
        slides.forEach((s, i) => { if (i === seg) parallax(s, local); else if (i !== current) parallax(s, 0); });
        fx.tension(local > PRE ? ((local - PRE) / (1 - PRE)) * 0.35 : 0);
        const target = Math.min(total - 1, Math.round(raw));
        if (target !== current) go(target);
      },
    });
    return () => {
      timers.forEach(clearTimeout);
      st.kill(true);
      fx.kill();
      slides.forEach((s) => { s.classList.remove("is-on", "is-out"); const m = media(s); if (m) { gsap.killTweensOf(m); gsap.set(m, { clearProps: "transform,filter" }); } });
    };
  });
})();
