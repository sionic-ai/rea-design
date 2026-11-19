// Thin-line cubes float scattered on a dark panel with a word attached to each cube’s front face, and the camera passes forward among them as you scroll across the panel — Studio cube space
(() => {
  kfFx.register("cube-word-space", (el, { options, reduce, scroller }) => {
    const T = window.THREE;
    if (!T) return;
    const words = [...el.querySelectorAll('[data-fx-part="word"]')].map((w) => w.textContent.trim()).filter(Boolean);
    const count = +options.count || 56, depth = +(options.depth ?? 66), turn = +(options.turn ?? 1.2), fade = +(options.line ?? 0.35);
    const canvas = document.createElement("canvas");
    canvas.className = "fx-cws";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    let r;
    try { r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { canvas.remove(); return; }
    r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(50, 1, 0.1, 200);
    const ink = new T.Color(getComputedStyle(el).color);
    const lineMat = new T.LineBasicMaterial({ color: ink, transparent: true, opacity: fade });
    const tex = (word) => {
      const c = document.createElement("canvas"); c.width = 512; c.height = 256;
      const g = c.getContext("2d");
      g.fillStyle = `#${ink.getHexString()}`; g.font = `500 120px ${getComputedStyle(el).fontFamily}`;
      g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(word, 256, 128);
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
    };
    const mats = words.map((w) => new T.MeshBasicMaterial({ map: tex(w), transparent: true, opacity: 0.4, side: T.DoubleSide, depthWrite: false }));
    const edges = new T.EdgesGeometry(new T.BoxGeometry(1, 1, 1)), plane = new T.PlaneGeometry(1, 0.5);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      const s = 2 + rnd() * 5, box = new T.LineSegments(edges, lineMat);
      box.scale.setScalar(s);
      box.position.set((rnd() - 0.5) * 26, (rnd() - 0.5) * 16, -rnd() * (depth + 4) + 6);
      box.rotation.set(rnd() * Math.PI, rnd() * Math.PI, 0);
      if (mats.length && i % 3 === 0) { const w = new T.Mesh(plane, mats[i % mats.length]); w.scale.set(s * 0.7, s * 0.7, 1); w.position.z = 0.501; box.add(w); }
      scene.add(box);
    }
    const st = { z: 8, turn: 0 };
    const size = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); draw(); };
    const draw = () => { cam.position.set(Math.sin(st.turn) * 2, 0, st.z); cam.rotation.set(0, st.turn * 0.4, st.turn * 0.15); r.render(scene, cam); };
    const ro = new ResizeObserver(size); ro.observe(canvas);
    size();
    const mm = gsap.matchMedia();
    if (!reduce) mm.add("(min-width: 0px)", () => {
      gsap.to(st, { z: 8 - depth, turn, ease: "none", onUpdate: draw, scrollTrigger: { trigger: el, scroller, start: "top top", end: "bottom bottom", scrub: true } });
    });
    return () => {
      mm.revert(); ro.disconnect();
      mats.forEach((m) => { m.map?.dispose(); m.dispose(); }); lineMat.dispose(); edges.dispose(); plane.dispose(); r.dispose();
      canvas.remove();
    };
  });
})();
