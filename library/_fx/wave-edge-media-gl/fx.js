// The video panel ripples from the edges according to scroll speed and touch — the center 15% stays still, growing larger toward the outside.
// Divide the panel into 32×18 cells and move the points. When scrolling stops the waves settle and the panel flattens again.
(() => {
  const RATIO = 16 / 9;
  // Placeholder video that plays when there is no video — three round lights drift slowly over a skin-color plate (what to put in is given by data-label)
  function placeholder(el) {
    const c = document.createElement("canvas");
    c.width = 640;
    c.height = 360;
    const g = c.getContext("2d");
    const css = getComputedStyle(el);
    const read = (k, d) => css.getPropertyValue(k).trim() || d;
    const label = el.getAttribute("data-label") || "";
    return {
      canvas: c,
      draw(t) {
        const bg = read("--kf-raised", "gray"), ink = read("--kf-dim", "gray");
        const dots = [read("--kf-accent", "white"), ink, read("--kf-ink-soft", "white")];
        g.fillStyle = bg;
        g.fillRect(0, 0, 640, 360);
        for (let i = 0; i < 3; i++) {
          const x = 320 + Math.sin(t * 0.3 + i * 2.1) * 200, y = 180 + Math.cos(t * 0.23 + i * 1.7) * 110;
          const r = g.createRadialGradient(x, y, 0, x, y, 150);
          r.addColorStop(0, dots[i]);
          r.addColorStop(1, bg);
          g.globalAlpha = i ? 0.22 : 0.18;
          g.fillStyle = r;
          g.fillRect(0, 0, 640, 360);
        }
        g.globalAlpha = 1;
        g.fillStyle = ink;
        g.font = `500 18px ${read("--kf-font-sans", "sans-serif")}`;
        g.textAlign = "center";
        g.fillText(label, 320, 186);
      },
    };
  }

  kfFx.register("wave-edge-media-gl", (el, { options, reduce, hover }) => {
    const THREE = window.THREE;
    if (!THREE) return;
    const num = (k, d) => (options[k] === undefined || options[k] === "" ? d : +options[k]);
    const amp = num("amp", 0.06), hoverAmp = num("hover", 0.02), grow = num("grow", 0.025), freq = num("freq", 3.2);
    const media = el.querySelector('[data-fx-part="media"]');
    let host = el.querySelector('[data-fx-part="stage"]');
    const madeHost = !host;
    if (madeHost) { host = document.createElement("div"); host.dataset.fxPart = "stage"; el.appendChild(host); }

    let hovering = 0, energy = 0, alive = true, built = null;
    const onEnter = () => { hovering = 1; };
    const onLeave = () => { hovering = 0; };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    // Scroll speed (px/ms ÷ 3, max 1) is followed by 10% each frame
    let lastY = scrollY, lastT = performance.now(), sraf = 0;
    const speed = () => {
      sraf = requestAnimationFrame(speed);
      const now = performance.now(), dt = now - lastT;
      if (dt > 0) energy += (Math.min(Math.abs(scrollY - lastY) / dt / 3, 1) - energy) * 0.1;
      lastY = scrollY;
      lastT = now;
    };
    if (!reduce) sraf = requestAnimationFrame(speed);

    const build = () => {
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); } catch (e) { return null; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      host.appendChild(renderer.domElement);
      const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera((-RATIO / 2) * 1.2, (RATIO / 2) * 1.2, 0.6, -0.6, 0.1, 10);
      camera.position.z = 1;
      const geo = new THREE.PlaneGeometry(RATIO, 1, 32, 18), rest = geo.attributes.position.array.slice();
      const mat = new THREE.MeshBasicMaterial({ transparent: true });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      let tex, ph = null;
      const cover = (w, h) => {
        const r = w / h;
        if (r > RATIO) { const k = RATIO / r; tex.repeat.set(k, 1); tex.offset.set((1 - k) / 2, 0); } else { const k = r / RATIO; tex.repeat.set(1, k); tex.offset.set(0, (1 - k) / 2); }
      };
      if (media && media.tagName === "VIDEO") {
        tex = new THREE.VideoTexture(media);
        const fit = () => media.videoWidth && cover(media.videoWidth, media.videoHeight);
        media.addEventListener("loadeddata", fit);
        fit();
        media.muted = true;
        media.play?.().catch(() => {});
      } else if (media && (media.tagName === "IMG" || media.tagName === "CANVAS")) {
        tex = media.tagName === "IMG" ? new THREE.Texture(media) : new THREE.CanvasTexture(media);
        const fit = () => { tex.needsUpdate = true; cover(media.naturalWidth || media.width, media.naturalHeight || media.height); };
        if (media.tagName === "IMG" && !media.complete) media.addEventListener("load", fit, { once: true }); else fit();
      } else {
        ph = placeholder(el);
        ph.draw(0);
        tex = new THREE.CanvasTexture(ph.canvas);
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      mat.map = tex;
      el.classList.add("is-live");
      const size = () => { const { clientWidth: w, clientHeight: h } = host; if (w && h) renderer.setSize(w, h, false); };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(host);
      let N = 0, R = 0, raf = 0, visible = true;
      const t0 = performance.now();
      const near = (a, b, k) => { const v = a + (b - a) * k; return Math.abs(v - b) < 5e-4 ? b : v; };
      const pos = geo.attributes.position;
      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        const t = (performance.now() - t0) / 1000;
        N = near(N, energy, 0.08);
        R = near(R, hover ? hovering : 0, 0.05);
        const a = amp * N + hoverAmp * R;
        mesh.scale.setScalar(1 + grow * N);
        for (let i = 0; i < pos.count; i++) {
          const x = rest[i * 3], y = rest[i * 3 + 1], u = x / RATIO;
          const edge = Math.max(0, (Math.min(Math.hypot(u, y) / 0.7071, 1) - 0.15) / 0.85) * a;
          pos.setXY(i, x + edge * Math.sin(freq * y * Math.PI + 0.6 * t), y + edge * Math.sin(freq * u * Math.PI + 0.78 * t + 1.7));
        }
        pos.needsUpdate = true;
        if (ph && !reduce) { ph.draw(t); tex.needsUpdate = true; }
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(frame);
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (media && media.tagName === "VIDEO") visible ? media.play?.().catch(() => {}) : media.pause?.();
      }, { rootMargin: "50% 0px" });
      io.observe(host);
      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        tex.dispose();
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        el.classList.remove("is-live");
      };
    };
    // Mounted when near the screen — each panel uses one WebGL context, so mounting all at the start hits the context limit.
    const lazy = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || built || !alive) return;
      built = build();
      lazy.disconnect();
    }, { rootMargin: "50% 0px" });
    lazy.observe(el);

    return () => {
      alive = false;
      lazy.disconnect();
      cancelAnimationFrame(sraf);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      built?.();
      if (madeHost) host.remove();
    };
  });
})();
