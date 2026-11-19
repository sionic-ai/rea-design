(() => {
  // Lab tools — instead of the original’s models, place our basic shapes in the same spot, size and silhouette (calipers, memo pad, tweezers, breadboard, wire, tape, screw)
  // Above the mat there is a blurred band reflecting two rows of ceiling fluorescent lights.
  const stage = document.querySelector(".tg-stage");
  if (!stage) return;
  const varColor = (name) => {
    const p = document.createElement("span"); p.style.cssText = `display:none;color:var(${name})`;
    stage.appendChild(p); const c = getComputedStyle(p).color; p.remove();
    const cv = document.createElement("canvas"); cv.width = cv.height = 1;
    const g = cv.getContext("2d"); g.fillStyle = c; g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  const build = () => {
    const desk = stage.kfDesk;
    if (!desk) return;
    const T = desk.THREE, scene = desk.scene;
    const col = (name) => new T.Color(...varColor(name));
    const metal = new T.MeshStandardMaterial({ color: col("--site-metal"), roughness: 0.38, metalness: 0.6 });
    const dark = new T.MeshStandardMaterial({ color: col("--site-tool"), roughness: 0.5, metalness: 0.2 });
    const white = new T.MeshStandardMaterial({ color: col("--site-plastic"), roughness: 0.7 });
    const hand = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-hand").trim() || "cursive";
    const props = new T.Group(); scene.add(props);
    const box = (w, h, d, mat) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat); m.castShadow = true; m.receiveShadow = true; return m; };

    const caliper = new T.Group();
    caliper.add(box(1.5, 0.03, 0.12, metal));
    const head = box(0.42, 0.05, 0.3, metal); head.position.set(-0.45, 0.02, 0.05); caliper.add(head);
    const screen = box(0.26, 0.06, 0.14, dark); screen.position.set(-0.45, 0.04, 0.03); caliper.add(screen);
    const jaw = box(0.08, 0.03, 0.42, metal); jaw.position.set(-0.7, 0, 0.24); caliper.add(jaw);
    const jaw2 = box(0.08, 0.03, 0.42, metal); jaw2.position.set(-0.6, 0.01, 0.24); caliper.add(jaw2);

    const noteCanvas = document.createElement("canvas"); noteCanvas.width = 400; noteCanvas.height = 400;
    const ng = noteCanvas.getContext("2d");
    const rgb = (name) => `rgb(${varColor(name).map((v) => Math.round(v * 255)).join(",")})`;
    const noteTex = new T.CanvasTexture(noteCanvas); noteTex.colorSpace = T.SRGBColorSpace;
    const ink = rgb("--kf-line"), paper = rgb("--site-note");
    const writeNote = () => {
      ng.fillStyle = paper; ng.fillRect(0, 0, 400, 400);
      ng.fillStyle = ink; ng.font = `400 46px ${hand}`;
      ["note one ?", "add a thing", "test it", "ship it!"].forEach((t, k) => ng.fillText(t, 34, 90 + k * 78));
      noteTex.needsUpdate = true;
    };
    writeNote();
    document.fonts?.load?.(`400 46px ${hand}`).then(writeNote).catch(() => {});
    const note = new T.Mesh(new T.BoxGeometry(0.62, 0.004, 0.62), [white, white, new T.MeshStandardMaterial({ map: noteTex, roughness: 0.9 }), white, white, white]);
    note.castShadow = true; note.receiveShadow = true;

    const tweezers = new T.Group();
    const arm = box(0.62, 0.025, 0.035, dark); arm.position.z = -0.02; arm.rotation.y = 0.04; tweezers.add(arm);
    const arm2 = arm.clone(); arm2.position.z = 0.02; arm2.rotation.y = -0.04; tweezers.add(arm2);

    const board = new T.Group();
    board.add(box(0.5, 0.06, 0.34, white));
    const wireColors = ["--kf-accent", "--site-wire-a", "--site-wire-b", "--site-wire-c"].map(col);
    wireColors.forEach((c, k) => {
      const curve = new T.CatmullRomCurve3([new T.Vector3(-0.2 + k * 0.05, 0.04, -0.12), new T.Vector3(-0.05 + k * 0.06, 0.12, -0.02), new T.Vector3(0.12 + k * 0.03, 0.04, 0.1 - k * 0.02)]);
      const w = new T.Mesh(new T.TubeGeometry(curve, 20, 0.009, 6), new T.MeshStandardMaterial({ color: c, roughness: 0.5 }));
      w.castShadow = true; board.add(w);
    });

    const cables = new T.Group();
    wireColors.slice(1).forEach((c, k) => {
      const pts = [0, 1, 2, 3].map((j) => new T.Vector3(j * 0.22 + k * 0.08, 0.02, -j * 0.28 - k * 0.05 + Math.sin(j + k) * 0.05));
      const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, 0.012, 6), new T.MeshStandardMaterial({ color: c, roughness: 0.5 }));
      m.castShadow = true; cables.add(m);
    });

    const tape = new T.Mesh(new T.TorusGeometry(0.28, 0.09, 12, 40), white); tape.rotation.x = -Math.PI / 2; tape.castShadow = true;
    const screws = new T.Group();
    [0, 1, 2].forEach((k) => { const s = new T.Mesh(new T.CylinderGeometry(0.018, 0.018, 0.16, 10), metal); s.rotation.z = Math.PI / 2; s.rotation.y = 0.4 + k * 0.6; s.position.set(k * 0.03, 0.02, k * 0.18); s.castShadow = true; screws.add(s); });
    const block = box(0.36, 0.08, 0.7, white);

    // Two faint bands of ceiling fluorescent light reflected on the mat
    const glowCanvas = document.createElement("canvas"); glowCanvas.width = 256; glowCanvas.height = 64;
    const gg = glowCanvas.getContext("2d"), gr = gg.createLinearGradient(0, 0, 0, 64);
    gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)"); /* Not skin: light band mask */
    gg.fillStyle = gr; gg.fillRect(0, 0, 256, 64);
    const glowMat = new T.MeshBasicMaterial({ map: new T.CanvasTexture(glowCanvas), transparent: true, opacity: 0.16, depthWrite: false, blending: T.AdditiveBlending, color: col("--kf-ink") });
    const tubes = [new T.Mesh(new T.PlaneGeometry(1, 1), glowMat), new T.Mesh(new T.PlaneGeometry(1, 1), glowMat)];
    tubes.forEach((t) => { t.rotation.x = -Math.PI / 2; props.add(t); });

    props.add(caliper, note, tweezers, board, cables, tape, screws, block);
    const place = (obj, fx, fy, rotDeg, scale = 1) => { const p = desk.toWorld(fx, fy); obj.position.x = p.x; obj.position.z = p.z; obj.rotation.y = (-rotDeg * Math.PI) / 180; obj.scale.setScalar(scale); };
    const layout = () => {
      const v = desk.view(), k = v.w / 5.87;
      if (v.mobile) {
        place(tape, 0.0, 0.0, 0, 0.5); place(board, 0.93, 0.77, -20, 0.7); place(cables, 0.8, 0.98, 0, 0.7);
        [caliper, note, tweezers, screws, block].forEach((o) => { o.visible = false; });
        tubes.forEach((t, i) => { t.visible = i === 0; place(t, 0.1, 0.19, 0); t.scale.set(v.w * 0.4, v.h * 0.03, 1); });
        return;
      }
      [caliper, note, tweezers, screws, block].forEach((o) => { o.visible = true; });
      place(caliper, 0.85, 0.18, 19, k); caliper.position.y = 0.05;
      place(note, 0.055, 0.29, -9, k); note.position.y = 0.012;
      place(tweezers, 0.928, 0.41, 42, k); tweezers.position.y = 0.03;
      place(board, 0.965, 0.73, -22, k); board.position.y = 0.04;
      place(cables, 0.86, 0.99, 0, k); cables.position.y = 0.02;
      place(tape, 0.02, 0.0, 0, k); tape.position.y = 0.09;
      place(screws, 0.043, 0.52, 0, k); screws.position.y = 0.02;
      place(block, 0.0, 0.76, 0, k); block.position.y = 0.04;
      tubes.forEach((t, i) => { t.visible = true; place(t, i ? 0.79 : 0.23, 0.2, 0); t.scale.set(v.w * (i ? 0.13 : 0.26), v.h * 0.03, 1); t.position.y = 0.003; });
    };
    layout();
    new ResizeObserver(layout).observe(stage);
    desk.renderer.compile(scene, desk.camera);
  };
  if (stage.kfDesk) build(); else stage.addEventListener("fx:desk-ready", build, { once: true });
})();
