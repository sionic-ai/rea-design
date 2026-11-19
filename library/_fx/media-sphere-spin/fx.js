// Wraps the video (or a skin-color placeholder video) around one sphere floating at the panel center and rolls it slightly by x·y every frame (three). Dragging rotates it with OrbitControls.
(() => {
  kfFx.register("media-sphere-spin", (el, { options, reduce, hover }) => {
    const THREE = window.THREE;
    if (!THREE) return;
    const radius = +(options.radius || 5), cam = +(options.cam || 10), step = +(options.step ?? 0.005);
    const fov = +(options.fov || 66), fovNarrow = +(options["fov-narrow"] || 80);
    const canvas = document.createElement("canvas");
    canvas.className = "fx-media-sphere";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const probe = document.createElement("i");
    probe.style.display = "none";
    el.append(probe);
    const css = (expr) => { probe.style.color = expr; return getComputedStyle(probe).color; };
    const font = getComputedStyle(el).getPropertyValue("--kf-font-sans").trim() || "sans-serif";

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov, 1, 1, 1000);
    camera.position.set(0, 0, cam);

    // If there is a video child, wrap that video, otherwise wrap a 12-second looping placeholder video drawn in skin colors.
    const video = el.querySelector('video[data-fx-part="video"]');
    let film = null, tex;
    if (video) {
      video.muted = true; video.loop = true; video.playsInline = true;
      video.play?.().catch(() => {});
      tex = new THREE.VideoTexture(video);
    } else {
      const c = document.createElement("canvas");
      c.width = 1024; c.height = 512;
      const g = c.getContext("2d");
      const col = ["var(--kf-accent)", "var(--kf-ink)", "var(--kf-raised)", "var(--kf-bg)"].map(css);
      const soft = css("var(--kf-accent-soft)"), ink = css("var(--kf-ink)");
      const draw = (t) => {
        const p = (t % 12) / 12, sceneNo = Math.floor(p * 3);
        g.fillStyle = soft;
        g.fillRect(0, 0, 1024, 512);
        for (let i = 0; i < 9; i++) {
          g.fillStyle = col[(i + sceneNo) % col.length];
          g.beginPath();
          g.ellipse(((i * 140 + p * 2048) % 1260) - 140, 256 + Math.sin(p * Math.PI * 4 + i) * 120, 46, 90, p * Math.PI * 2 + i, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = ink;
        g.font = `700 92px ${font}`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText("VIDEO 0" + (sceneNo + 1), 512 + Math.sin(p * Math.PI * 2) * 180, 256);
      };
      draw(0);
      film = draw;
      tex = new THREE.CanvasTexture(c);
    }
    probe.remove();
    tex.colorSpace = THREE.SRGBColorSpace;
    const geo = new THREE.SphereGeometry(radius, 64, 64);
    geo.rotateY(-Math.PI * 0.5);
    const mat = new THREE.MeshBasicMaterial({ map: tex });
    const ball = new THREE.Mesh(geo, mat);
    scene.add(ball);

    // Drag-to-rotate only when OrbitControls is loaded. Distance is fixed, so the wheel scrolls the page instead of the plate (as in the original)
    let controls = null;
    const wheel = (e) => window.scrollBy(0, e.deltaY);
    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, canvas);
      controls.minDistance = controls.maxDistance = cam;
      canvas.addEventListener("wheel", wheel);
      // On phone, the page must still scroll when the panel is pushed
      if (!hover) canvas.style.touchAction = "auto";
    }

    const size = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      camera.fov = innerWidth < 768 ? fovNarrow : fov;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    size();
    const ro = new ResizeObserver(() => { size(); if (reduce) renderer.render(scene, camera); });
    ro.observe(el);
    renderer.compile(scene, camera);

    let raf = 0;
    const start = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      ball.rotation.x += step;
      ball.rotation.y += step;
      if (film) { film((performance.now() - start) / 1000); tex.needsUpdate = true; }
      controls?.update();
      renderer.render(scene, camera);
    };
    if (reduce) renderer.render(scene, camera);
    else tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("wheel", wheel);
      controls?.dispose();
      geo.dispose(); mat.dispose(); tex.dispose();
      renderer.dispose();
      canvas.remove();
    };
  });
})();
