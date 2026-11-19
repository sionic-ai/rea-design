(() => {
  // rapier (2MB CJS build embedding wasm) is loaded separately when attached so it does not block the first paint. This build re-reads global exports every time a body is created, so
  // Leaves exports swapped to rapier’s and does not restore them — THREE in three-global.js holds its own exports object, so it does not break
  const here = document.currentScript && document.currentScript.src;
  const RAPIER_SRC = here ? new URL("../../_vendor/rapier3d-compat@0.14.0/rapier.cjs.js", here).href : "";
  let rapierWait = null;
  const loadRapier = () => {
    if (window.RAPIER && window.RAPIER.World) return Promise.resolve(window.RAPIER);
    if (rapierWait) return rapierWait;
    rapierWait = new Promise((done) => {
      if (!RAPIER_SRC) return done(null);
      window.exports = {};
      const tag = document.createElement("script");
      tag.src = RAPIER_SRC;
      tag.onload = () => {
        const R = window.exports;
        Promise.resolve(R.init && R.init()).then(() => { window.RAPIER = R; done(R); }, () => done(null));
      };
      tag.onerror = () => done(null);
      document.head.append(tag);
    });
    return rapierWait;
  };

  // Stand-in basic shapes with similar silhouette proportions for the 3D-scanned ceramics — a: plump doll · bowl · barrel, b: flat mask · ring
  const KINDS = {
    a: [
      (T) => new T.CapsuleGeometry(0.62, 0.5, 8, 24),
      (T) => new T.LatheGeometry([[0, -0.6], [0.55, -0.62], [0.8, -0.35], [0.9, 0.1], [0.86, 0.5], [0.74, 0.52], [0.76, 0.12], [0.68, -0.3], [0.45, -0.48], [0, -0.5]].map(([x, y]) => new T.Vector2(x, y)), 36),
      (T) => new T.SphereGeometry(1, 36, 24).scale(1, 0.82, 1),
      (T) => new T.CylinderGeometry(0.78, 0.9, 1.2, 36, 1),
      (T) => new T.SphereGeometry(1, 36, 24).scale(0.86, 1, 0.86),
    ],
    b: [
      (T) => new T.SphereGeometry(1, 36, 24, 0, Math.PI).scale(1, 1.2, 0.55),
      (T) => new T.CylinderGeometry(1, 1, 0.3, 40).rotateX(Math.PI / 2),
      (T) => new T.SphereGeometry(1, 36, 24).scale(1, 0.75, 0.5),
      (T) => new T.TorusGeometry(0.7, 0.3, 18, 44),
      (T) => new T.SphereGeometry(1, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.62).scale(1, 1, 0.6),
    ],
  };
  const fitted = (geo) => {
    geo.computeBoundingSphere();
    const s = geo.boundingSphere;
    geo.translate(-s.center.x, -s.center.y, -s.center.z);
    geo.scale(1 / s.radius, 1 / s.radius, 1 / s.radius);
    return geo;
  };

  // Glaze speckle — a canvas with drops of other colors scattered over one base color. Colors are read from skin variables
  const glaze = (T, colors, seed) => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    g.fillStyle = colors[seed % colors.length];
    g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 26; i++) {
      const x = rnd() * 128, y = rnd() * 128, r = 6 + rnd() * 24;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, colors[(seed + 1 + (i % (colors.length - 1))) % colors.length]);
      grd.addColorStop(1, "transparent");
      g.globalAlpha = 0.5 + rnd() * 0.45;
      g.fillStyle = grd;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  };

  kfFx.register("pile-gather-push", (el, { options, reduce }) => {
    const T = window.THREE;
    if (!T || !T.WebGLRenderer || !window.gsap) return () => {};
    const count = +options.count || 10;
    const radius = +(options.radius ?? 0.47);
    const pull = +(options.pull ?? 0.05);
    const damping = +(options.damping ?? 4);
    const spin = +(options.spin ?? 5);
    const friction = +(options.friction ?? 10);
    const hand = +(options.pointer ?? 0.2);
    const follow = +(options.follow ?? 0.05);
    const fade = +(options.fade ?? 1);
    const fov = +options.fov || 75;
    const dist = +options.z || 3;
    const grow = +(options.scale ?? 1.12);

    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "canvas");
    el.append(canvas);
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
      canvas.remove();
      return () => {};
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(fov, 1, 0.1, 100);
    camera.position.set(0, 0, dist);
    // Original /series has scan shadows baked into the chosen light (ambient 3) — basic shapes have no baked shadows, so a single upper-left light builds the form.
    scene.add(new T.AmbientLight(undefined, 1.5));
    const sun = new T.DirectionalLight(undefined, 2.2);
    sun.position.set(-2, 3, 4);
    scene.add(sun);

    const css = getComputedStyle(el);
    const read = (n, d) => css.getPropertyValue(n).trim() || d;
    const colors = [read("--kf-accent-soft", "currentColor"), read("--kf-dim", "currentColor"), read("--kf-raised", "currentColor"), read("--kf-ink-soft", "currentColor")];

    let R = null, world = null, handBody = null;
    const items = new Set();
    let setName = options.set === "b" ? "b" : "a";

    const spawnPos = () => {
      const v = new T.Vector3(T.MathUtils.randFloatSpread(10), T.MathUtils.randFloatSpread(10), T.MathUtils.randFloatSpread(10));
      return v.normalize().multiplyScalar(3 + 3 * Math.random());
    };
    const packed = (i, n) => {
      const y = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - y * y), a = i * 2.39996;
      return new T.Vector3(Math.cos(a) * r, y, Math.sin(a) * r).multiplyScalar(radius * 1.9);
    };

    const addBody = (item) => {
      if (!world) return;
      const p = item.mesh.position, q = item.mesh.quaternion;
      const desc = R.RigidBodyDesc.dynamic().setTranslation(p.x, p.y, p.z).setRotation({ x: q.x, y: q.y, z: q.z, w: q.w })
        .setLinearDamping(damping).setAngularDamping(spin);
      item.body = world.createRigidBody(desc);
      world.createCollider(R.ColliderDesc.ball(item.r).setMass(0.6).setFriction(friction), item.body);
    };

    const makeSet = (name, settle) => {
      const kinds = KINDS[name] || KINDS.a;
      const r = name === "b" ? radius * 0.9 : radius;
      for (let i = 0; i < count; i++) {
        const geo = fitted(kinds[i % kinds.length](T));
        const mat = new T.MeshStandardMaterial({ map: glaze(T, colors, i + (name === "b" ? 7 : 0)), roughness: 0.48, metalness: 0, transparent: !settle, opacity: settle ? 1 : 0 });
        const mesh = new T.Mesh(geo, mat);
        mesh.scale.setScalar(r * grow);
        mesh.position.copy(settle ? packed(i, count) : spawnPos());
        mesh.rotation.set(T.MathUtils.randFloatSpread(2 * Math.PI), T.MathUtils.randFloatSpread(2 * Math.PI), T.MathUtils.randFloatSpread(2 * Math.PI));
        scene.add(mesh);
        const item = { mesh, r, body: null, dying: false };
        items.add(item);
        addBody(item);
        // When fully shown, return to opaque — with a translucent material the inner faces of overlapping shapes show through
        if (!settle) gsap.to(mat, { opacity: 1, duration: fade, delay: fade, onComplete: () => { mat.transparent = false; mat.needsUpdate = true; } });
      }
    };

    const drop = (item) => {
      items.delete(item);
      if (item.body && world) world.removeRigidBody(item.body);
      scene.remove(item.mesh);
      item.mesh.geometry.dispose();
      item.mesh.material.map && item.mesh.material.map.dispose();
      item.mesh.material.dispose();
    };

    const swap = (e) => {
      const next = e.detail && e.detail.set === "b" ? "b" : "a";
      if (next === setName && !(e.detail && e.detail.force)) return;
      setName = next;
      items.forEach((item) => {
        if (item.dying) return;
        item.dying = true;
        item.mesh.material.transparent = true;
        item.mesh.material.needsUpdate = true;
        gsap.to(item.mesh.material, { opacity: 0, duration: fade, onComplete: () => drop(item) });
      });
      makeSet(next, reduce);
      if (reduce) items.forEach((item) => item.dying && (gsap.killTweensOf(item.mesh.material), drop(item)));
    };
    el.addEventListener("fx:set", swap);

    const size = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      draw();
    };
    const draw = () => renderer.render(scene, camera);
    const ro = new ResizeObserver(size);
    ro.observe(el);

    // Original uses r3f’s pointer (client coordinates of the whole window, center at first) as z=0 screen size, and drag the kinematic sphere along 5% each frame
    const aim = new T.Vector2(0, 0);
    const handPos = new T.Vector3(), handGoal = new T.Vector3();
    const move = (e) => {
      const b = el.getBoundingClientRect();
      aim.set(((e.clientX - b.left) / (b.width || 1)) * 2 - 1, -(((e.clientY - b.top) / (b.height || 1)) * 2 - 1));
    };
    if (!reduce) window.addEventListener("pointermove", move, { passive: true });

    let seen = true;
    const io = new IntersectionObserver(([en]) => { seen = en.isIntersecting; });
    io.observe(el);

    const impulse = { x: 0, y: 0, z: 0 };
    const tick = (time, ms) => {
      if (!seen) return;
      if (world) {
        const vh = 2 * Math.tan((fov * Math.PI) / 360) * dist, vw = vh * camera.aspect;
        handGoal.set((aim.x * vw) / 2, (aim.y * vh) / 2, 0);
        handPos.lerp(handGoal, follow);
        handBody.setNextKinematicTranslation(handPos);
        items.forEach((item) => {
          if (!item.body) return;
          const t = item.body.translation();
          impulse.x = -t.x * pull; impulse.y = -t.y * pull; impulse.z = -t.z * pull;
          item.body.applyImpulse(impulse, true);
        });
        world.timestep = Math.min(1 / 30, Math.max(1 / 240, ms / 1000));
        world.step();
        items.forEach((item) => {
          if (!item.body) return;
          const t = item.body.translation(), q = item.body.rotation();
          item.mesh.position.set(t.x, t.y, t.z);
          item.mesh.quaternion.set(q.x, q.y, q.z, q.w);
        });
      }
      draw();
    };

    makeSet(setName, reduce);
    size();
    let gone = false;
    if (reduce) {
      el.dispatchEvent(new CustomEvent("fx:ready"));
    } else {
      gsap.ticker.add(tick);
      loadRapier().then((got) => {
        if (gone) return;
        if (!got) {
          // If physics can’t load, it just slides into the gathered spot and stands
          let i = 0;
          items.forEach((item) => gsap.to(item.mesh.position, { ...packed(i++, count), duration: 2, ease: "power2.out" }));
        } else {
          R = got;
          const w = new R.World({ x: 0, y: 0, z: 0 });
          handBody = w.createRigidBody(R.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 0, 0));
          w.createCollider(R.ColliderDesc.ball(hand).setRestitution(0.1).setFriction(friction), handBody);
          world = w;
          items.forEach(addBody);
        }
        el.dispatchEvent(new CustomEvent("fx:ready"));
      });
    }

    return () => {
      gone = true;
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", move);
      el.removeEventListener("fx:set", swap);
      ro.disconnect();
      io.disconnect();
      [...items].forEach((item) => { gsap.killTweensOf(item.mesh.material); gsap.killTweensOf(item.mesh.position); drop(item); });
      if (world) world.free();
      renderer.dispose();
      canvas.remove();
    };
  });
})();
