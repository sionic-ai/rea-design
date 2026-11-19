// three.js stage — several translucent photo panels stand in rows on a cylinder around the camera (radius 22, depth 22~44), slowly rotating and each bobbing up and down,
// A wire globe and a disc video in front of it float at the center. Following the mouse slowly (lerp .1), the panel shifts sideways·up and the globe·disc are nudged slightly.
// Giving intro-dur makes the camera pull back from z 6 to 8 with power4.out on attach (the original in() is 3s — the original hero does not call it, so the default is 0). With fx:globe the panel and disc vanish, leaving only the globe as a white blob, and fx:all brings them back
(() => {
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  kfFx.register("panel-orbit-globe-gl", (el, { options, reduce }) => {
    if (!window.THREE || !window.gsap) return;
    const T = window.THREE;
    const n = +options.count || 72, row = +options.row || 18;
    const radius = +(options.radius ?? 22), depth = String(options.depth || "22,44").split(",").map(Number);
    const rowGap = +(options["row-gap"] ?? 6), baseY = +(options.y ?? -9), step = +(options.step ?? 20) * Math.PI / 180;
    const size = +options.size || 3, alpha = +(options.opacity ?? 0.4), bob = +(options.bob ?? 0.5);
    const spin = +(options.spin ?? 0.001), globeSpin = +(options["globe-spin"] ?? 0.002), follow = +(options.follow ?? 0.1);
    const disc = +(options.disc ?? 2.05), globeR = +(options.globe ?? 2.25), fov = +options.fov || 50, cam = +(options.cam ?? 8);
    const from = +(options["intro-from"] ?? 6), introDur = +(options["intro-dur"] ?? 0), ease = kfFx.ease(options.ease || "0.23,1,0.32,1", "power4.out");

    const css = getComputedStyle(el);
    const root = getComputedStyle(document.documentElement);
    const read = (name, fb) => (css.getPropertyValue(name) || root.getPropertyValue(name) || fb).trim() || fb;
    const bg = read("--fx-bg", "") || read("--kf-contrast-bg", "") || read("--kf-ink", "black");
    const wire = read("--fx-wire", "") || read("--kf-contrast-ink", "") || read("--kf-bg", "white");
    // Cover branches — mostly achromatic like photos with the accent color in only one branch (original album covers show through darkly at board opacity .4)
    const tones = [read("--kf-raised", "silver"), read("--kf-surface", "white"), read("--kf-ink-soft", "gray"), read("--kf-bg", "white"), read("--kf-dim", "gray"), read("--kf-accent", "gray")];
    const font = read("--kf-font-display", "sans-serif");

    const renderer = new T.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    el.append(renderer.domElement);
    const scene = new T.Scene();
    scene.background = new T.Color(bg);
    const camera = new T.PerspectiveCamera(fov, 1, 0.1, 1e4);
    camera.position.set(0, 0, reduce ? cam : from);
    scene.add(camera);
    const hemi = new T.HemisphereLight(0xffffff, 0xffffff, 0.5); /* Not skin: light is brightness, not color */
    hemi.position.set(0, -50, 10);
    scene.add(hemi);
    for (let i = 0; i < 2; i++) { const p = new T.PointLight(0xffffff, 1.1, 0, 0); /* Not Skin: light brightness */ p.position.set(10, 10, 10); scene.add(p); }

    const globeBox = new T.Group(), discBox = new T.Group(), ring = new T.Group();
    scene.add(globeBox, discBox, ring);

    // Globe slot — a bumpy icosahedron mesh like landmasses (our own shape). Same size and silhouette ratio as the original model
    const geo = new T.IcosahedronGeometry(globeR, 5);
    const pos = geo.attributes.position, v = new T.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const k = Math.sin(v.x * 1.7) * Math.cos(v.y * 2.1) + Math.sin(v.z * 1.3 + v.y);
      v.multiplyScalar(1 + Math.max(0, k) * 0.035);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    const wireMat = new T.MeshPhongMaterial({ color: new T.Color(wire), transparent: true, wireframe: true, blending: T.AdditiveBlending, depthWrite: false });
    const solidMat = new T.MeshPhongMaterial({ color: new T.Color(wire) });
    const globe = new T.Mesh(geo, wireMat);
    globe.rotation.y = -Math.PI / 2;
    globeBox.add(globe);

    // Master video — the child video if there is one, otherwise a placeholder screen flowing in the Skin color
    const media = el.querySelector('[data-fx-part="media"]');
    let tex, pad, padCtx;
    // The video on a file:// page has a different origin and can’t be uploaded as a texture (SecurityError) — then show a placeholder screen
    if (media && media.tagName === "VIDEO" && media.getAttribute("src") && location.protocol !== "file:") {
      media.muted = true; media.loop = true; media.playsInline = true; media.play?.().catch(() => {});
      tex = new T.VideoTexture(media);
    } else {
      pad = document.createElement("canvas"); pad.width = pad.height = 256; padCtx = pad.getContext("2d");
      tex = new T.CanvasTexture(pad);
    }
    tex.magFilter = tex.minFilter = T.LinearFilter;
    const discMat = new T.MeshBasicMaterial({ map: tex, transparent: true });
    const discMesh = new T.Mesh(new T.CircleGeometry(disc, 32), discMat);
    discMesh.position.set(0, 0.21, 0);
    discBox.add(discMesh);
    const drawPad = (t) => {
      if (!padCtx) return;
      const g = padCtx.createLinearGradient(0, 0, 256, 256);
      const s = (Math.sin(t / 1600) + 1) / 2;
      g.addColorStop(0, tones[4]); g.addColorStop(0.4 + s * 0.3, tones[0]); g.addColorStop(1, tones[3]);
      padCtx.fillStyle = g; padCtx.fillRect(0, 0, 256, 256);
      padCtx.globalAlpha = 0.25; padCtx.fillStyle = tones[1];
      for (let i = 0; i < 6; i++) padCtx.fillRect(0, ((t / 40 + i * 48) % 300) - 30, 256, 10);
      padCtx.globalAlpha = 1; padCtx.fillStyle = tones[2];
      padCtx.font = `500 18px ${font}`; padCtx.textAlign = "center";
      padCtx.fillText("Video slot", 128, 136);
      tex.needsUpdate = true;
    };

    // Photo panel — uses the child item’s label and tone if there is one, otherwise draws the album-cover placeholder in the skin color
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const covers = Array.from({ length: Math.min(12, Math.max(items.length, 8)) }, (_, i) => {
      const c = document.createElement("canvas"); c.width = c.height = 128;
      const x = c.getContext("2d"), it = items[i % (items.length || 1)];
      const a = tones[(i + (it ? +it.dataset.tone || 0 : 0)) % tones.length], b = tones[(i * 3 + 2) % tones.length];
      x.fillStyle = a; x.fillRect(0, 0, 128, 128);
      x.fillStyle = b;
      if (i % 3 === 0) { x.beginPath(); x.arc(64, 64, 34, 0, Math.PI * 2); x.fill(); }
      else if (i % 3 === 1) for (let k = 0; k < 5; k++) x.fillRect(0, 14 + k * 24, 128, 9);
      else { x.fillRect(16, 16, 96, 60); x.fillRect(16, 86, 56, 10); }
      const t = new T.CanvasTexture(c); t.magFilter = t.minFilter = T.LinearFilter;
      return t;
    });
    const plane = new T.PlaneGeometry(size, size);
    const panels = [];
    let e = 0;
    for (let i = 0; i < n; i++) {
      const p = new T.Vector3(radius * Math.cos(e), rowGap * Math.floor(i / row), Math.sin(e) * randInt(depth[0], depth[1] ?? depth[0]));
      const mat = new T.MeshBasicMaterial({ map: covers[randInt(0, covers.length - 1)], opacity: alpha, side: T.DoubleSide, transparent: true });
      const m = new T.Mesh(plane, mat);
      const holder = new T.Group();
      holder.position.copy(p); holder.rotation.y = -e + Math.PI / 2; holder.add(m);
      panels.push({ holder, mat, x: p.x, y: p.y, off: rand(0, 100), inv: rand(2000, 4000), coef: rand(0.5, 1) });
      ring.add(holder);
      e += step;
    }
    ring.position.y = baseY;

    let onlyGlobe = false;
    const setGlobe = (on) => {
      onlyGlobe = on;
      globe.material = on ? solidMat : wireMat;
      for (const p of panels) p.mat.opacity = on ? 0 : alpha;
      discMat.opacity = on ? 0 : 1;
    };
    const toGlobe = () => setGlobe(true), toAll = () => setGlobe(false);
    el.addEventListener("fx:globe", toGlobe);
    el.addEventListener("fx:all", toAll);

    const mouse = { x: 0, y: 0 }, target = { x: 0, y: 0 };
    const move = (ev) => { target.x = (ev.clientX / innerWidth) * 2 - 1; target.y = -(ev.clientY / innerHeight) * 2 + 1; };
    addEventListener("mousemove", move, { passive: true });

    const resize = () => {
      const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    drawPad(0);
    // Weaving the shader in on the first cursor move freezes the screen, so weave it in ahead of time during setup
    renderer.compile(scene, camera);

    const intro = reduce ? null : gsap.fromTo(camera.position, { z: from }, { z: cam, duration: introDur, ease, delay: +(options.delay ?? 0) });
    const deg = Math.PI / 180;
    const draw = (time) => {
      if (document.documentElement.classList.contains("fx-hold")) return;
      const now = time * 1000;
      mouse.x += (target.x - mouse.x) * follow;
      mouse.y += (target.y - mouse.y) * follow;
      if (!reduce) {
        for (const p of panels) {
          p.holder.position.y = p.y + bob * Math.sin(now / p.inv + p.off) + bob * mouse.y;
          p.holder.position.x = p.x + mouse.x * p.coef;
        }
        ring.rotation.y += spin;
        globeBox.rotation.y += globeSpin;
      }
      globeBox.position.set(10 * mouse.x * deg, 10 * mouse.y * deg, 0);
      discBox.position.copy(globeBox.position);
      if (!onlyGlobe) drawPad(now);
      renderer.render(scene, camera);
    };
    gsap.ticker.add(draw);
    if (reduce) draw(0);

    return () => {
      gsap.ticker.remove(draw); intro?.kill(); ro.disconnect();
      removeEventListener("mousemove", move);
      el.removeEventListener("fx:globe", toGlobe); el.removeEventListener("fx:all", toAll);
      geo.dispose(); plane.dispose(); discMesh.geometry.dispose(); wireMat.dispose(); solidMat.dispose(); discMat.dispose(); tex.dispose();
      covers.forEach((t) => t.dispose()); panels.forEach((p) => p.mat.dispose());
      renderer.dispose(); renderer.domElement.remove();
    };
  });
})();
