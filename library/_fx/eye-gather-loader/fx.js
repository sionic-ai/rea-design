(() => {
  // Floating dots gather into an eye shape (outer ellipse at 62% + pupil ring), then the eyelids close and open, light spreads from the center, and the panel disappears
  kfFx.register("eye-gather-loader", (el, { options, reduce }) => {
    const cv = el.querySelector('[data-fx-part="canvas"]') || el.appendChild(Object.assign(document.createElement("canvas"), { className: "fx-egl-canvas" }));
    const made = [];
    const part = (k) => el.querySelector(`[data-fx-part="${k}"]`) || (() => { const d = document.createElement("div"); d.dataset.fxPart = k; el.append(d); made.push(d); return d; })();
    const top = part("lid-top"), bottom = part("lid-bottom"), flash = part("flash");
    if (cv.className === "fx-egl-canvas") made.push(cv);
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const speed = +(options.speed || 1.65), drift = +(options.drift ?? 0.55), gather = +(options.gather ?? 1.15);
    const W = () => el.clientWidth || innerWidth, H = () => el.clientHeight || innerHeight;
    const N = +(options.count || (innerWidth < 768 ? 900 : 2200));
    // Dot colors come from the skin — cycling accent, light accent and text color
    const cs = getComputedStyle(el);
    const tones = ["--kf-accent", "--kf-accent-soft", "--kf-accent-text", "--kf-ink"].map((v) => cs.getPropertyValue(v).trim()).filter(Boolean);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const shape = () => {
      const cx = W() / 2, cy = H() / 2, rx = Math.min(W() * 0.22, 260), ry = rx * 0.42, out = [], rim = Math.floor(N * 0.62);
      for (let k = 0; k < rim; k++) { const a = (k / rim) * Math.PI * 2; out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry * (0.72 + 0.28 * Math.abs(Math.cos(a)))]); }
      for (let k = 0; k < N - rim; k++) { const a = (k / (N - rim)) * Math.PI * 2; out.push([cx + Math.cos(a) * rx * 0.07, cy + Math.sin(a) * ry * 0.62]); }
      return out;
    };
    const size = () => { cv.width = W() * dpr; cv.height = H() * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    let goal = shape();
    const dots = Array.from({ length: N }, (_, i) => ({ x: Math.random() * W(), y: Math.random() * H(), vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: 0.4 + Math.random() * 1.5, c: tones[(Math.random() * tones.length) | 0], a: 0.25 + Math.random() * 0.65, t: goal[i], pull: 0 }));
    let mode = "drift", raf = 0, last = performance.now();
    const draw = () => {
      const now = performance.now(), k = Math.min(3, Math.max(0.1, (now - last) * 0.06)) * speed; last = now;
      ctx.clearRect(0, 0, W(), H());
      for (const d of dots) {
        if (mode === "drift") {
          d.x += (d.vx + Math.sin(d.y * 0.01 + now * 4e-4) * 0.18) * k; d.y += (d.vy - 0.08) * k;
          if (d.y < -4) d.y = H() + 4; if (d.x < -4) d.x = W() + 4; if (d.x > W() + 4) d.x = -4;
        } else {
          d.pull += (1 - d.pull) * (1 - Math.pow(0.945, k));
          const m = 1 - Math.pow(1 - 0.075 * d.pull, k);
          d.x += (d.t[0] - d.x) * m + (Math.random() - 0.5) * 0.5 * d.pull; d.y += (d.t[1] - d.y) * m + (Math.random() - 0.5) * 0.5 * d.pull;
        }
        ctx.globalAlpha = d.a; ctx.fillStyle = d.c; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    const ro = new ResizeObserver(() => { size(); goal = shape(); dots.forEach((d, i) => (d.t = goal[i])); });
    ro.observe(el);
    const done = () => { el.classList.add("is-done"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    let tl = null;
    if (reduce) { el.dispatchEvent(new CustomEvent("fx:reveal", { bubbles: true })); done(); }
    else {
      draw();
      tl = gsap.timeline({ onComplete: () => { cancelAnimationFrame(raf); done(); } });
      tl.timeScale(speed);
      gsap.set([top, bottom], { scaleY: 0 });
      gsap.set(flash, { xPercent: -50, yPercent: -50, scale: 0.08, opacity: 0 });
      tl.call(() => { mode = "gather"; }, null, drift)
        .to({}, { duration: gather })
        .call(() => el.dispatchEvent(new CustomEvent("fx:reveal", { bubbles: true })), null, "blink")
        .to([top, bottom], { scaleY: 1, duration: 0.12 }, "blink")
        .to(flash, { opacity: 0.95, scale: 1.5, duration: 0.55, ease: "power2.out" }, "blink+=0.3")
        .to(flash, { opacity: 0, duration: 0.7, ease: "power2.in" }, "blink+=0.85")
        .fromTo([top, bottom], { scaleY: 1 }, { scaleY: 0, duration: 0.85, ease: "power3.inOut" }, "blink+=0.16")
        .to(el, { opacity: 0, duration: 0.7, ease: "power2.inOut" }, "blink+=0.45");
    }
    return () => {
      tl?.kill(); cancelAnimationFrame(raf); ro.disconnect();
      made.forEach((d) => d.remove());
      el.classList.remove("is-done");
      gsap.set(el, { clearProps: "opacity" });
    };
  });
})();
