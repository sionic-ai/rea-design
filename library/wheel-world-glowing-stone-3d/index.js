// Home page: wheel, drag, or arrows rotate the cylinder title to pick a project, which changes the stone pattern and scene, and clicking the stone goes to the detail page.
(() => {
  const N = GC.PROJECTS.length;
  const SLOTS = N * 2;
  const STEP = 360 / SLOTS;
  // Cylinder title: as in the original, wraps the name onto a WebGL cylinder (the original uses MSDF glyphs). Draws the art around the name (fill and outline, two sheets) on a canvas and puts it on the cylinder surface,
  // Only the one name in front (each cell ±15°) is filled by the shader, the rest are drawn as outlines. The camera sits at the same spot as CSS perspective (1400px · phone 700px)
  const cylinder = (host) => {
    const css = getComputedStyle(host), root = getComputedStyle(document.documentElement);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.domElement.className = "gc-wheel__gl";
    host.append(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 10000);
    const paint = (stroke) => {
      const c = document.createElement("canvas");
      return { c, tex: Object.assign(new THREE.CanvasTexture(c), { colorSpace: THREE.SRGBColorSpace, anisotropy: 8, wrapS: THREE.RepeatWrapping }), stroke };
    };
    const fill = paint(false), line = paint(true);
    const uniforms = { uFill: { value: fill.tex }, uLine: { value: line.tex }, uPos: { value: 0 }, uSlots: { value: SLOTS } };
    const mat = new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }",
      // One block per cell — if this piece’s cell angle (cell − position) for its name is within half a cell it is filled, otherwise outlined
      fragmentShader: "varying vec2 vUv; uniform sampler2D uFill, uLine; uniform float uPos, uSlots; void main(){ float j = floor(vUv.x * uSlots + .5); float a = mod(j - uPos + uSlots * .5, uSlots) - uSlots * .5; float f = smoothstep(.52, .48, abs(a)); vec4 c = texture2D(uFill, vUv), b = texture2D(uLine, vUv); gl_FragColor = mix(b, c, f); }",
    });
    let mesh = null, R = 1, last = NaN, dirty = true;
    const draw = (t, w, h, size) => {
      const k = Math.min(1, 8192 / w);
      t.c.width = Math.round(w * k); t.c.height = Math.round(h * k);
      const g = t.c.getContext("2d");
      g.scale(k, k);
      g.font = `900 ${size}px ${css.fontFamily}`;
      g.fontStretch = "expanded";
      g.textAlign = "center"; g.textBaseline = "top";
      const ink = root.getPropertyValue("--kf-ink").trim();
      g.fillStyle = ink;
      g.strokeStyle = `color-mix(in srgb, ${ink} 45%, transparent)`;
      g.lineWidth = 1.2;
      for (let j = 0; j < SLOTS; j++) {
        const x = (w * j) / SLOTS, lines = GC.PROJECTS[j % N].name;
        for (const dx of [0, w, -w]) lines.forEach((txt, i) => {
          const y = i * size * .86 + size * .02;
          t.stroke ? g.strokeText(txt.toUpperCase(), x + dx, y) : g.fillText(txt.toUpperCase(), x + dx, y);
        });
      }
      t.tex.needsUpdate = true;
    };
    const layout = () => {
      const W = innerWidth, H = host.clientHeight, size = parseFloat(css.fontSize), dist = parseFloat(css.perspective) || 1400;
      R = W * (W < 769 ? .82 : .75);
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.fov = (2 * Math.atan(H / 2 / dist) * 180) / Math.PI;
      camera.position.set(0, 0, dist);
      camera.updateProjectionMatrix();
      const circ = 2 * Math.PI * R;
      draw(fill, circ, H, size);
      draw(line, circ, H, size);
      mesh && (scene.remove(mesh), mesh.geometry.dispose());
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 256, 1, true), mat);
      mesh.position.z = -R;
      scene.add(mesh);
      dirty = true;
    };
    layout();
    document.fonts?.ready.then(layout);
    addEventListener("resize", layout);
    return {
      // Cell j of the picture is wrapped at cylinder angle j·30° (to the right) — rotate so it stands at (j − pos)·30°
      // If the position is unchanged, don’t redraw — the cylinder canvas is a separate WebGL, so drawing every frame at rest delays the stage drawing and interaction response
      turn: (pos) => {
        if (pos === last && !dirty) return;
        last = pos; dirty = false;
        mesh.rotation.y = (-pos * STEP * Math.PI) / 180;
        uniforms.uPos.value = pos;
        renderer.render(scene, camera);
      },
    };
  };
  const canvas = document.querySelector(".gc-gl");
  const world = GC.world({ canvas, layout: "home", project: 0 });
  const links = [...document.querySelectorAll(".gc-list a")];
  const wheel = cylinder(document.querySelector(".gc-wheel"));

  // Position is a per-project real number (original formula). The wheel adds (deltaY ÷ screen height .8) cells to the target, and the shown value follows with damp(7) (28 while dragging).
  // .35s after release the target snaps to the nearest cell with damp(2.5), and the velocity of a released drag decays as exp(−7.5t)
  const s = { pos: 0, target: 0, current: -1, idle: 0, vel: 0, locked: GC.firstVisit };
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const layoutWheel = () => {
    wheel.turn(s.pos);
    const idx = ((Math.round(s.pos) % N) + N) % N;
    if (idx !== s.current) {
      if (s.current !== -1) world.setProject(idx, 1);
      s.current = idx;
      links.forEach((l, i) => (i === idx ? l.setAttribute("aria-current", "true") : l.removeAttribute("aria-current")));
    }
  };
  const nudge = (d) => {
    if (s.locked) return;
    s.target += d;
    s.idle = 0;
  };

  addEventListener("wheel", (e) => {
    if (e.ctrlKey) return;
    e.preventDefault();
    const dy = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
    nudge(dy / Math.max(innerHeight * .8, 1));
  }, { passive: false });

  // Drag: one cell per viewport width (original dragProjectsPerViewport 1), if it barely moved it counts as a click (opens it when over a stone)
  let drag = null;
  canvas.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY, lx: e.clientX, lt: performance.now(), moved: 0 };
    s.vel = 0;
    canvas.setPointerCapture(e.pointerId);
    document.body.classList.add("is-dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag || s.locked) return;
    const now = performance.now(), d = -(e.clientX - drag.lx) / innerWidth;
    drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.x, e.clientY - drag.y));
    s.target += d;
    s.vel = d / Math.max((now - drag.lt) / 1000, 1 / 120);
    drag.lx = e.clientX; drag.lt = now;
    s.idle = 0;
  });
  canvas.addEventListener("pointerup", (e) => {
    document.body.classList.remove("is-dragging");
    if (drag && performance.now() - drag.lt > 80) s.vel = 0;
    if (drag && drag.moved < 5) {
      const r = world.stoneRect();
      if (r && e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) open();
    }
    drag = null;
  });
  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || s.locked) return;
    if (e.target.closest?.("a, button")) return;
    // Original keys: arrow up/down ±.15 cell · PageUp/Down ±1 · Space 1 (−1 with Shift)
    const k = { ArrowDown: .15, ArrowUp: -.15, PageDown: 1, PageUp: -1, " ": e.shiftKey ? -1 : 1 }[e.key];
    if (k) { e.preventDefault(); nudge(k); }
    if (e.key === "Enter") open();
  });

  // Going to About: instead of the frame curtain, the camera moves within the same scene as in the original (original moves 1.7s inside one scene — out 1083 · in 883ms).
  // Since the copy is a separate page, the move is split in two — here it covers 60% of the path in 1.08s at an even pace (starts moving as soon as pressed like the original · title and list drop out at .5s), and the About page picks up from that spot
  const GLIDE = .6;
  const goPixels = GC.go;
  GC.go = (href) => {
    if (href !== "about.html" || GC.reduced) return goPixels(href);
    s.locked = true;
    gsap.to([".gc-wheel", ".gc-list"], { autoAlpha: 0, duration: .5, ease: "power2.out" });
    world.travel(world.between("home", "about", GLIDE), 1.08, "none").then(() => {
      sessionStorage.setItem("gc:glide", String(GLIDE));
      location.href = href;
    });
  };

  // Opening a stone: the stone flinches once and brightens, gets covered by cells, then goes to the detail
  let opening = false;
  function open() {
    if (opening || s.locked) return;
    opening = true;
    const st = world.stone;
    gsap.timeline()
      .to(st.scale, { x: 1.06, y: 2.12, z: .86, duration: .16, ease: "power2.out" })
      .to(world.uniforms.uDim, { value: 1.6, duration: .16 }, 0)
      .to(st.scale, { x: .94, y: 1.98, z: .78, duration: .4, ease: "power3.in" })
      .add(() => goPixels(`detail.html?p=${s.current}`), "-=.2");
  }

  gsap.ticker.add((t, ms) => {
    const dt = Math.min(Math.max(ms, 1), 100) / 1000;
    if (!s.locked) {
      if (!drag && Math.abs(s.vel) > 1e-4) (s.target += s.vel * dt), (s.vel *= Math.exp(-7.5 * dt));
      else if (!drag) s.vel = 0;
      s.idle = drag || Math.abs(s.vel) > .05 ? 0 : s.idle + dt;
      if (s.idle > .35) s.target = damp(s.target, Math.round(s.target), 2.5, dt);
      s.pos = GC.reduced ? s.target : damp(s.pos, s.target, drag ? 28 : 7, dt);
    }
    layoutWheel();
    world.tick(t);
    world.render(world.loaderWindows ? world.loaderWindows() : null);
  });

  const start = () => { s.locked = false; s.pos = s.target = 0; };
  if (GC.firstVisit) {
    // At loader end the cylinder spins twice and lands on the first project (1.5s)
    GC.intro(world, {
      windows: document.querySelector(".gc-windows"),
      outline: document.querySelector(".gc-outline"),
      // Original: winds two turns over 1.5s with 1−(1−x)⁴, fading in with smoothstep during the first 20% (.3s)
      onWheel: () => {
        document.querySelector(".gc-wheel").classList.add("is-on");
        gsap.fromTo(s, { pos: -SLOTS * 2 }, { pos: 0, duration: GC.reduced ? .01 : 1.5, ease: "power3.out", onComplete: start });
      },
    });
  } else {
    document.querySelector(".gc-outline").remove();
    document.body.classList.add("is-ui");
    GC.pixels.reveal(.8);
  }
})();
