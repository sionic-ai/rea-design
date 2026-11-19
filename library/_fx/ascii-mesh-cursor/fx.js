// Draw a 3D object onto a small WebGL plane, then turn each cell’s brightness into a single character <pre> Stamped there — the letter graphic orbits around the cursor.
// The original drew objects onto a hidden canvas and read them with readPixels. Here the drawn plane is copied to a 2D canvas and read
// Keeps the browser from piling up ”GPU stall due to ReadPixels” warnings in the console.
(() => {
  const RAMP = " .',:;Il!i+?][1)(|tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

  // A single comma — the tail curves to the lower left from a rounded-square head (the shape we drew)
  function commaShape(T) {
    const s = new T.Shape();
    s.moveTo(10, 0); s.lineTo(78, 0); s.quadraticCurveTo(88, 0, 88, 10);
    s.lineTo(88, 96); s.bezierCurveTo(88, 140, 66, 170, 30, 185); s.lineTo(18, 168);
    s.bezierCurveTo(40, 152, 50, 132, 52, 112); s.lineTo(10, 112); s.quadraticCurveTo(0, 112, 0, 102);
    s.lineTo(0, 10); s.quadraticCurveTo(0, 0, 10, 0);
    return s;
  }

  function buildMesh(T, shape) {
    const geos = [];
    const extrude = (sh, dx) => {
      const g = new T.ExtrudeGeometry(sh, { depth: 46, bevelEnabled: true, bevelThickness: 6, bevelSize: 5, bevelSegments: 4, curveSegments: 18 });
      g.scale(1, -1, 1);
      g.translate(dx, 0, 0);
      geos.push(g);
    };
    if (shape === "box") geos.push(new T.BoxGeometry(120, 120, 120, 1, 1, 1));
    else if (shape === "comma") extrude(commaShape(T), 0);
    else { extrude(commaShape(T), 0); extrude(commaShape(T), 118); }
    const group = new T.Group();
    const mat = new T.MeshPhongMaterial({ color: 0xffffff, shininess: 40, specular: 0x888888, side: T.DoubleSide });
    const box = new T.Box3();
    geos.forEach((g) => { g.computeBoundingBox(); box.union(g.boundingBox); });
    const c = box.getCenter(new T.Vector3());
    geos.forEach((g) => { g.translate(-c.x, -c.y, -c.z); g.computeVertexNormals(); group.add(new T.Mesh(g, mat)); });
    return { group, radius: box.getSize(new T.Vector3()).length() / 2, dispose: () => { geos.forEach((g) => g.dispose()); mat.dispose(); } };
  }

  kfFx.register("ascii-mesh-cursor", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T) return;
    const out = el.querySelector('[data-fx-part="out"]');
    if (!out) return;
    const cols = +options.cols || 98, rows = +options.rows || 45, scale = +options.scale || 2;
    const W = cols * scale, H = rows * scale;
    const glCanvas = document.createElement("canvas");
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas: glCanvas, antialias: false, preserveDrawingBuffer: true }); } catch { return; }
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 1);
    const read = document.createElement("canvas");
    read.width = W; read.height = H;
    const ctx = read.getContext("2d", { willReadFrequently: true });

    const scene = new T.Scene();
    const { group, radius, dispose } = buildMesh(T, options.shape || "pair");
    scene.add(group);
    const aspect = (cols * 0.6) / rows, fov = 28, half = (fov * Math.PI) / 360;
    const camera = new T.PerspectiveCamera(fov, aspect, 0.1, 1e4);
    camera.position.set(0, 0, Math.max(radius / Math.tan(half), radius / (Math.tan(half) * aspect)) * 1.08);
    camera.lookAt(0, 0, 0);
    [[1, 0.6, 1.2, 1.1], [-1.2, -0.3, 0.4, 0.35], [0.2, 0.8, -1, 0.55]].forEach(([x, y, z, i]) => {
      const d = new T.DirectionalLight(0xffffff, i); d.position.set(x, y, z); scene.add(d);
    });
    scene.add(new T.AmbientLight(0xffffff, 0.12));

    const cellW = W / cols, cellH = H / rows, line = new Array(cols), lines = new Array(rows);
    function draw() {
      renderer.render(scene, camera);
      ctx.drawImage(glCanvas, 0, 0);
      const px = ctx.getImageData(0, 0, W, H).data;
      for (let r = 0; r < rows; r++) {
        const y0 = Math.floor(r * cellH), y1 = Math.floor((r + 1) * cellH);
        for (let c = 0; c < cols; c++) {
          const x0 = Math.floor(c * cellW), x1 = Math.floor((c + 1) * cellW);
          let sum = 0, n = 0;
          for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
            const i = (y * W + x) * 4;
            sum += 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]; n++;
          }
          line[c] = RAMP[Math.min(RAMP.length - 1, Math.floor(((n ? sum / n : 0) / 255) * RAMP.length))];
        }
        lines[r] = line.join("");
      }
      out.textContent = lines.join("\n");
    }
    // Shrink the text panel to fit the cell — changing font size makes the line count shake, so use transform only
    function fit() {
      out.style.transform = "scale(1)";
      const b = el.getBoundingClientRect(), p = out.getBoundingClientRect();
      if (!p.width || !p.height) return;
      out.style.transform = `scale(${Math.min(b.width / p.width, b.height / p.height)})`;
    }

    const clamp = gsap.utils.clamp(-1, 1);
    const follow = options.follow !== "drag" && hover;
    let phase = 0, tx = 0, ty = 0, aim = false, mx = innerWidth / 2, my = innerHeight / 2;
    let dragging = false, rotY = 0, rotX = 0, lx = 0, ly = 0, idle = true;
    const aimAt = () => {
      const b = el.getBoundingClientRect();
      tx = clamp((mx - (b.left + b.width / 2)) / Math.max(b.width / 2, 1)) * (+(options.yaw ?? 0.78));
      ty = clamp((my - (b.top + b.height / 2)) / Math.max(b.height / 2, 1)) * (+(options.pitch ?? 0.42));
      aim = true;
    };
    const onMove = (e) => { mx = e.clientX; my = e.clientY; aimAt(); };
    const onOut = (e) => { if (!e.relatedTarget) aim = false; };
    const onScroll = () => { if (aim) aimAt(); };
    const onDown = (e) => { dragging = true; if (idle) { rotY = group.rotation.y; rotX = group.rotation.x; } idle = false; lx = e.clientX; ly = e.clientY; };
    const onDrag = (e) => {
      if (!dragging) return;
      rotY += (e.clientX - lx) * 0.01; rotX = Math.max(-1.3, Math.min(1.3, rotX + (e.clientY - ly) * 0.01));
      lx = e.clientX; ly = e.clientY;
    };
    const onUp = () => { dragging = false; };
    if (follow) {
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("pointerout", onOut);
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("blur", onOut);
    } else if (hover) {
      el.addEventListener("pointerdown", onDown);
      addEventListener("pointermove", onDrag, { passive: true });
      addEventListener("pointerup", onUp);
    }

    let raf = 0, last = 0, seen = true;
    function tick(now) {
      const dt = last ? Math.max(1, now - last) / 1000 : 1 / 60;
      last = now;
      if (follow) {
        if (!aim) { phase += dt * 0.55; tx = Math.sin(phase) * 0.22; ty = Math.sin(phase * 0.55) * 0.08; }
        const k = 1 - Math.pow(0.001, dt);
        group.rotation.y += (tx - group.rotation.y) * k;
        group.rotation.x += (ty - group.rotation.x) * k;
      } else if (idle) {
        phase += dt * 0.8;
        group.rotation.y = Math.sin(phase) * 0.38;
        group.rotation.x = Math.sin(phase * 0.4) * 0.1;
      } else { group.rotation.y = rotY; group.rotation.x = rotX; }
      draw();
      raf = seen ? requestAnimationFrame(tick) : 0;
    }
    // Not drawn off-screen — it rewrites thousands of characters every frame
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !raf && !reduce) { last = 0; raf = requestAnimationFrame(tick); }
    });
    draw(); fit();
    if (!reduce) io.observe(el);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    document.fonts?.ready.then(fit);

    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      removeEventListener("pointermove", onMove); removeEventListener("pointerout", onOut);
      removeEventListener("scroll", onScroll); removeEventListener("blur", onOut);
      el.removeEventListener("pointerdown", onDown); removeEventListener("pointermove", onDrag); removeEventListener("pointerup", onUp);
      dispose(); renderer.dispose(); renderer.forceContextLoss?.();
      out.style.transform = ""; out.textContent = "";
    };
  });
})();
