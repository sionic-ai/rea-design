// Line-art stage + raw window: with three.js draws weightless floating objects (basic shapes like a keycap, hand, headphones, balloon dog) twice — one raw, one by face direction.
// Window when compositing (data-fx-part="window") outside is ”paper drawn with pencil lines only where the face direction bends”, inside the window is the raw black stage. Window edges are pixel-rounded rectangles.
// Objects are pulled very weakly toward the center (0.0003×distance, capped at 5), and when within radius 7 of a moving mouse they’re pushed by 100.8×(1−distance/7) (force clamped to ±0.5, mass .025, damping .1).
// Hovering the window scales it 1.2x (.5s power2.out), and with fx:open the window opens to the full board in 1.15s power4.inOut, leaving only the raw state (Studio hero → About).
(() => {
  const T = () => window.THREE;
  function colorOf(el, name, THREE) {
    const i = document.createElement("i");
    i.style.cssText = `display:none;color:var(${name})`;
    el.appendChild(i);
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.fillStyle = getComputedStyle(i).color;
    x.fillRect(0, 0, 1, 1);
    i.remove();
    const d = x.getImageData(0, 0, 1, 1).data;
    return new THREE.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, THREE.SRGBColorSpace);
  }
  function rsq(THREE, w, h, r) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  }
  function build(THREE, kind, mat) {
    const g = new THREE.Group();
    const add = (geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); g.add(m); };
    const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 14);
    if (kind === 0) {
      const a = new THREE.ExtrudeGeometry(rsq(THREE, 2.3, 2.3, 0.45), { depth: 1, bevelThickness: 0.18, bevelSize: 0.16, bevelSegments: 4 }); a.center(); add(a);
      const b = new THREE.ExtrudeGeometry(rsq(THREE, 1.7, 1.7, 0.35), { depth: 0.35, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 3 }); b.center(); add(b, 0, 0, 0.75);
    } else if (kind === 1) {
      const p = new THREE.ExtrudeGeometry(rsq(THREE, 1.5, 1.7, 0.5), { depth: 0.45, bevelThickness: 0.15, bevelSize: 0.12, bevelSegments: 3 }); p.center(); add(p);
      [[-0.55, 1.35, 0.95, 0.12], [-0.18, 1.5, 1.2, 0.03], [0.2, 1.45, 1.1, -0.05], [0.56, 1.25, 0.85, -0.16]].forEach(([x, y, l, r]) => add(cap(0.2, l), x, y, 0, 0, 0, r));
      add(cap(0.22, 0.8), -0.95, 0.05, 0.1, 0, 0, 0.95);
      add(new THREE.CylinderGeometry(0.62, 0.66, 0.7, 18), 0, -1.15);
    } else if (kind === 2) {
      add(new THREE.TorusGeometry(1.45, 0.17, 12, 40, Math.PI), 0, 0.2);
      [-1, 1].forEach((s) => { add(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 24), s * 1.45, -0.25, 0, 0, 0, Math.PI / 2); add(new THREE.TorusGeometry(0.5, 0.17, 10, 24), s * 1.15, -0.25, 0, 0, Math.PI / 2); });
    } else {
      add(cap(0.32, 1.1), 0, 0, 0, 0, 0, Math.PI / 2); add(cap(0.32, 0.7), 0.75, 0.55, 0, 0, 0, -0.3); add(cap(0.32, 0.5), 1.15, 1, 0, 0, 0, Math.PI / 2 - 0.2);
      add(cap(0.32, 0.35), 0.95, 1.4, 0, 0, 0, 0.2); add(cap(0.32, 0.5), -0.95, 0.4, 0, 0, 0, 0.7);
      [-0.55, 0.55].forEach((x) => { add(cap(0.32, 0.75), x, -0.7, 0, 0, 0, 0.12); add(cap(0.32, 0.75), x, -0.7, 0.55, 0, 0, -0.12); });
    }
    return g;
  }

  kfFx.register("sketch-portal-gl", (el, { options, reduce, hover }) => {
    const THREE = T();
    if (!THREE || !el.clientWidth) return;
    const win = el.querySelector('[data-fx-part="window"]');
    const narrow = el.clientWidth < 820;
    const count = Math.max(1, Math.round(+(narrow ? options["count-narrow"] ?? 10 : options.count ?? 23)));
    const scale = +(options.scale ?? 1.55) || 1.55, push = +(options.repel ?? 100.8), reach = +(options.reach ?? 7) || 7;
    const grow = +(options.grow ?? 1.2), openDur = +(options.open ?? 1.15);

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.dataset.fxPart = "canvas";
    el.prepend(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const stage = colorOf(el, "--kf-contrast-bg", THREE), paper = colorOf(el, "--kf-bg", THREE), line = colorOf(el, "--kf-line", THREE);
    const gridC = colorOf(el, "--kf-contrast-ink", THREE), accent = colorOf(el, "--kf-accent", THREE), ink = colorOf(el, "--kf-ink", THREE);
    // The four objects’ colors rotate from the accent color — blue (as is)·yellow (hue −172°)·ink·purple (+40°)
    const hsl = accent.getHSL({});
    const tint = (dh, dl) => new THREE.Color().setHSL((hsl.h + dh / 360 + 1) % 1, hsl.s * 0.75, Math.min(0.6, hsl.l + dl));
    const colors = [accent, tint(-172, 0.05), ink.clone().lerp(stage, 0.7), tint(40, 0.03)];

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(stage, 35, 85);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 25);
    scene.add(new THREE.AmbientLight(0xffffff, 0.85), new THREE.HemisphereLight(0xffffff, 0x181818, 0.95));
    [[-12, 14, 18, 2.2], [14, 2, 12, 0.95], [4, 10, -16, 1.15]].forEach(([x, y, z, i]) => { const d = new THREE.DirectionalLight(0xffffff, i); d.position.set(x, y, z); scene.add(d); });
    const grid = new THREE.Mesh(new THREE.PlaneGeometry(180, 100), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { c: { value: gridC } },
      vertexShader: "varying vec2 p; void main(){ p = uv * vec2(180.0, 100.0); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "uniform vec3 c; varying vec2 p; void main(){ vec2 g = abs(fract(p / 4.0 - 0.5) - 0.5) * 4.0; vec2 w = fwidth(p) * 1.1; float l = 1.0 - min(min(g.x / w.x, g.y / w.y), 1.0); gl_FragColor = vec4(c * 0.46, l * 0.16);\n#include <colorspace_fragment>\n}",
    }));
    grid.position.z = -45;
    scene.add(grid);

    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const items = [];
    for (let i = 0; i < count; i++) {
      const kind = i % 4;
      const mat = new THREE.MeshStandardMaterial({ color: colors[kind], roughness: kind === 3 || i % 3 === 0 ? 0.2 : 0.5 });
      const g = build(THREE, kind, mat);
      g.scale.setScalar(scale);
      scene.add(g);
      g.position.set((rnd() * 2 - 1) * 12, (rnd() * 2 - 1) * 6.5, (rnd() * 2 - 1) * 2.5);
      g.rotation.set(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28);
      items.push({ g, mat, v: new THREE.Vector3(), w: new THREE.Vector3((rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.3), r: 1.4 * scale });
    }

    const rt = () => new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    const rawRT = rt(), normRT = rt();
    const normalMat = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
    const comp = new THREE.ShaderMaterial({
      uniforms: { tRaw: { value: rawRT.texture }, tN: { value: normRT.texture }, res: { value: new THREE.Vector2(1, 1) }, win: { value: new THREE.Vector4() }, rad: { value: 30 }, paper: { value: paper }, ink: { value: line }, full: { value: 0 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `uniform sampler2D tRaw; uniform sampler2D tN; uniform vec2 res; uniform vec4 win; uniform float rad; uniform vec3 paper; uniform vec3 ink; uniform float full; varying vec2 vUv;
        vec3 N(vec2 u){ return texture2D(tN, u).rgb; }
        float edge(vec2 u){ vec2 o = 0.48 / res; vec3 c = N(u); float e = 0.0;
          e = max(e, distance(c, N(u + vec2(o.x, 0.0)))); e = max(e, distance(c, N(u - vec2(o.x, 0.0))));
          e = max(e, distance(c, N(u + vec2(0.0, o.y)))); e = max(e, distance(c, N(u - vec2(0.0, o.y))));
          e = max(e, distance(c, N(u + o)) * 0.75); e = max(e, distance(c, N(u - o)) * 0.75);
          return smoothstep(0.075, 0.17, e); }
        float rbox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
        void main(){ vec4 raw = texture2D(tRaw, vUv);
          vec2 hs = max(win.zw * 0.5, vec2(0.001));
          float m = full > 0.5 ? 1.0 : (win.z < 0.5 ? 0.0 : 1.0 - smoothstep(-0.75, 0.75, rbox(vUv * res - win.xy - hs, hs, min(rad, min(hs.x, hs.y)))));
          gl_FragColor = vec4(mix(mix(paper, ink, edge(vUv)), raw.rgb, m), 1.0);
          #include <colorspace_fragment>
        }`,
    });
    const quadScene = new THREE.Scene();
    quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), comp));
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const st = { s: 1, open: 0 };
    let W = 1, H = 1;
    const resize = () => {
      W = Math.max(1, el.clientWidth); H = Math.max(1, el.clientHeight);
      const pr = renderer.getPixelRatio();
      renderer.setSize(W, H, false);
      rawRT.setSize(W * pr, H * pr); normRT.setSize(W * pr, H * pr);
      comp.uniforms.res.value.set(W * pr, H * pr);
      camera.aspect = W / H; camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    // Window position — pixels relative to the board. Hover scale from the window center, opening interpolates from window → whole board
    const pushWindow = () => {
      const pr = renderer.getPixelRatio();
      if (!win) { comp.uniforms.win.value.set(0, 0, 0, 0); return; }
      const e = el.getBoundingClientRect(), r = win.getBoundingClientRect(), s = st.s, o = st.open;
      let x = r.left - e.left + (r.width - r.width * s) / 2, y = r.top - e.top + (r.height - r.height * s) / 2, w = r.width * s, h = r.height * s;
      const rr = (parseFloat(getComputedStyle(win).borderRadius) || 0) * s;
      x += (0 - x) * o; y += (0 - y) * o; w += (W - w) * o; h += (H - h) * o;
      comp.uniforms.win.value.set(x * pr, (H - y - h) * pr, w * pr, h * pr);
      comp.uniforms.rad.value = rr * (1 - o) * pr;
    };

    const mouse = new THREE.Vector2(), target = new THREE.Vector3(), prev = new THREE.Vector3(), ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      ray.setFromCamera(mouse, camera);
      ray.ray.intersectPlane(plane, target);
    };
    const onLeave = () => target.set(0, 0, 0);
    if (hover) { el.addEventListener("pointermove", onMove, { passive: true }); el.addEventListener("pointerleave", onLeave); }
    const enter = () => gsap.to(st, { s: grow, duration: 0.5, ease: "power2.out", overwrite: "auto" });
    const leave = () => gsap.to(st, { s: 1, duration: 0.5, ease: "power2.out", overwrite: "auto" });
    if (win && hover) { win.addEventListener("pointerenter", enter); win.addEventListener("pointerleave", leave); }
    const open = () => gsap.to(st, { open: 1, s: 1, duration: reduce ? 0 : openDur, ease: "power4.inOut", overwrite: "auto", onComplete: () => el.dispatchEvent(new CustomEvent("fx:opened", { bubbles: true })) });
    const close = () => gsap.to(st, { open: 0, duration: reduce ? 0 : openDur, ease: "power4.inOut", overwrite: "auto" });
    el.addEventListener("fx:open", open);
    el.addEventListener("fx:close", close);

    const B = { x: 13, y: 7, z: 3 }, tmpQ = new THREE.Quaternion(), tmpV = new THREE.Vector3();
    const step = () => {
      const moving = target.distanceTo(prev) > 0.0002;
      prev.copy(target);
      const dt = 1 / 60, damp = Math.pow(0.9, dt);
      items.forEach((it) => {
        const p = it.g.position, f = tmpV.set(0, 0, 0), d = p.length();
        if (d > 0.001) f.addScaledVector(p, -0.0003 * Math.min(d, 5) / d);
        if (moving) {
          const m = p.clone().sub(target), dm = m.length();
          if (dm > 0.001 && dm < reach) { f.addScaledVector(m, (push * (1 - dm / reach)) / dm); it.w.x += (Math.random() - 0.5) * 0.4; it.w.y += (Math.random() - 0.5) * 0.4; }
        }
        f.clampScalar(-0.5, 0.5);
        it.v.addScaledVector(f, dt / 0.025).multiplyScalar(damp);
        it.w.multiplyScalar(damp);
      });
      // Overlap resolving — if closer than the sum of the two radii, push each apart by half and bounce, keeping only 0.3 of the approaching speed
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j], dv = a.g.position.clone().sub(b.g.position), d = dv.length(), min = (a.r + b.r) * 0.62;
        if (d > 0.0001 && d < min) {
          dv.multiplyScalar(1 / d);
          a.g.position.addScaledVector(dv, (min - d) / 2); b.g.position.addScaledVector(dv, -(min - d) / 2);
          const rel = a.v.clone().sub(b.v).dot(dv);
          if (rel < 0) { a.v.addScaledVector(dv, -rel * 0.65); b.v.addScaledVector(dv, rel * 0.65); }
        }
      }
      items.forEach((it) => {
        const p = it.g.position;
        p.addScaledVector(it.v, dt);
        for (const ax of ["x", "y", "z"]) {
          if (p[ax] < -B[ax]) { p[ax] = -B[ax]; if (it.v[ax] < 0) it.v[ax] *= -0.5; }
          else if (p[ax] > B[ax]) { p[ax] = B[ax]; if (it.v[ax] > 0) it.v[ax] *= -0.5; }
        }
        const wl = it.w.length();
        if (wl > 1e-5) it.g.quaternion.premultiply(tmpQ.setFromAxisAngle(it.w.clone().multiplyScalar(1 / wl), wl * dt));
      });
    };

    let raf = 0, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); });
    io.observe(el);
    function frame() {
      raf = 0;
      if (!visible) return;
      if (!reduce) step();
      pushWindow();
      comp.uniforms.full.value = st.open >= 0.999 ? 1 : 0;
      scene.background = stage;
      renderer.setRenderTarget(rawRT); renderer.render(scene, camera);
      scene.background = null; scene.overrideMaterial = normalMat; grid.visible = false;
      renderer.setClearColor(0x8080ff, 1);
      renderer.setRenderTarget(normRT); renderer.clear(); renderer.render(scene, camera);
      scene.overrideMaterial = null; grid.visible = true;
      renderer.setRenderTarget(null); renderer.render(quadScene, quadCam);
      if (!reduce || !frame.once) raf = requestAnimationFrame(frame);
      frame.once = true;
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("fx:open", open); el.removeEventListener("fx:close", close);
      if (win) { win.removeEventListener("pointerenter", enter); win.removeEventListener("pointerleave", leave); }
      gsap.killTweensOf(st);
      scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); });
      [rawRT, normRT].forEach((r) => r.dispose());
      comp.dispose(); normalMat.dispose();
      renderer.dispose();
      canvas.remove();
    };
  });
})();
