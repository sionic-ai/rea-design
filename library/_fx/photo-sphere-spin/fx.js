// Hundreds of photo plates curved onto a sphere surface and spun (three) — uses the child img photo if there is one, otherwise a color field drawn from the skin color as the atlas
(() => {
  kfFx.register("photo-sphere-spin", (el, { options, reduce }) => {
    const THREE = window.THREE;
    if (!THREE) return;
    const o = { count: +(options.count || 200), radius: +(options.radius || 5), speed: +(options.speed ?? 0.1), cam: +(options.cam || 7), near: +(options["fog-near"] ?? 4), far: +(options["fog-far"] ?? 14) };
    const entry = options.entry !== "off" && !reduce, kickOn = options.kick !== "off" && !reduce;
    const canvas = document.createElement("canvas");
    canvas.className = "fx-sphere-canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    // The canvas can’t read var(), so the skin color is resolved using a briefly attached element
    const probe = document.createElement("i");
    probe.style.display = "none";
    el.append(probe);
    const css = (expr) => { probe.style.color = expr; return getComputedStyle(probe).color; };
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(new THREE.Color(css("var(--kf-bg)")), entry ? 0.5 : o.near, entry ? 3 : o.far);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, o.cam);
    const group = new THREE.Group();
    scene.add(group);

    const T = 8, R = 4, S = 128;
    const atlas = document.createElement("canvas");
    atlas.width = T * S; atlas.height = R * S;
    const g = atlas.getContext("2d");
    const tints = ["var(--kf-accent)", "var(--kf-accent-soft)", "var(--kf-ink)", "var(--kf-dim)"];
    for (let k = 0; k < T * R; k++) {
      const x = (k % T) * S, y = Math.floor(k / T) * S, tint = tints[k % tints.length];
      const grad = g.createLinearGradient(x, y, x, y + S);
      grad.addColorStop(0, css(`color-mix(in oklab, ${tint} ${20 + (k % 5) * 8}%, var(--kf-bg))`));
      grad.addColorStop(1, css(`color-mix(in oklab, ${tint} ${40 + (k % 3) * 10}%, var(--kf-ink))`));
      g.fillStyle = grad;
      g.fillRect(x, y, S, S);
    }
    probe.remove();
    const tex = new THREE.CanvasTexture(atlas);
    tex.colorSpace = THREE.SRGBColorSpace;
    // When photos are given, fills each cell with one (cover crop)
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    photos.slice(0, T * R).forEach((img, k) => {
      const put = () => {
        if (!img.naturalWidth) return;
        const sc = Math.max(S / img.naturalWidth, S / img.naturalHeight), w = img.naturalWidth * sc, h = img.naturalHeight * sc;
        g.save(); g.beginPath(); g.rect((k % T) * S, Math.floor(k / T) * S, S, S); g.clip();
        g.drawImage(img, (k % T) * S + (S - w) / 2, Math.floor(k / T) * S + (S - h) / 2, w, h);
        g.restore(); tex.needsUpdate = true;
      };
      img.complete ? put() : img.addEventListener("load", put, { once: true });
    });
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, fog: true, transparent: true, opacity: 1 });
    // When spinning fast, panel vertices are rotated further around the sphere’s vertical axis so the leading edge bends as if dragged (original velocityDeformation values)
    const uVel = { value: 0 }, bend = +(options.bend ?? -0.6);
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uVel = uVel;
      sh.vertexShader = "attribute vec3 aOrigin;\nattribute float aU;\nattribute float aYF;\nattribute float aAspect;\nuniform float uVel;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
        {
          float push = smoothstep(0.08, 1.0, 1.0 - aU) * 0.4 * (0.45 + (1.0 - smoothstep(0.0, 1.0, abs(aYF))) * 2.4) * aAspect;
          vec3 sp = aOrigin + transformed;
          float hr = length(sp.xz);
          if (hr > 0.001) {
            float a = ${bend.toFixed(3)} * uVel * push / hr;
            float c = cos(a), sn = sin(a);
            sp = vec3(sp.x * c + sp.z * sn, sp.y, -sp.x * sn + sp.z * c);
            transformed = sp - aOrigin;
          }
        }`);
    };

    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const planes = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < o.count; i++) {
      const yv = 1 - ((i + 0.5) / o.count) * 2, r = Math.sqrt(1 - yv * yv), th = i * golden + (rnd() - 0.5) * 0.06;
      const dir = new THREE.Vector3(Math.cos(th) * r, yv + (rnd() - 0.5) * 0.03, Math.sin(th) * r).normalize();
      const h = 0.4 * (0.8 + rnd() * 0.3), w = h * (rnd() < 0.5 ? 1.33 : rnd() < 0.5 ? 0.75 : 1);
      const geo = new THREE.PlaneGeometry(w, h, 12, 6);
      const up = Math.abs(dir.y) > 0.98 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      const t = new THREE.Vector3().crossVectors(up, dir).normalize(), b = new THREE.Vector3().crossVectors(dir, t).normalize();
      const pos = geo.attributes.position, p = new THREE.Vector3();
      for (let v = 0; v < pos.count; v++) {
        p.copy(dir).multiplyScalar(o.radius).addScaledVector(t, pos.getX(v)).addScaledVector(b, pos.getY(v)).normalize().multiplyScalar(o.radius).addScaledVector(dir, -o.radius);
        pos.setXYZ(v, p.x, p.y, p.z);
      }
      const n = pos.count, aOrigin = new Float32Array(n * 3), aU = new Float32Array(n), aYF = new Float32Array(n), aAspect = new Float32Array(n).fill(w / h);
      for (let v = 0; v < n; v++) { aOrigin.set([dir.x * o.radius, dir.y * o.radius, dir.z * o.radius], v * 3); aU[v] = geo.attributes.uv.getX(v); aYF[v] = (dir.y * o.radius + pos.getY(v)) / o.radius; }
      geo.setAttribute("aOrigin", new THREE.BufferAttribute(aOrigin, 3));
      geo.setAttribute("aU", new THREE.BufferAttribute(aU, 1));
      geo.setAttribute("aYF", new THREE.BufferAttribute(aYF, 1));
      geo.setAttribute("aAspect", new THREE.BufferAttribute(aAspect, 1));
      const uv = geo.attributes.uv, cell = Math.floor(rnd() * T * R), cu = (cell % T) / T, cv = 1 - (Math.floor(cell / T) + 1) / R;
      for (let v = 0; v < uv.count; v++) uv.setXY(v, cu + uv.getX(v) / T, cv + uv.getY(v) / R);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(dir).multiplyScalar(o.radius);
      mesh.scale.setScalar(entry ? 0.72 : 1);
      mesh.visible = !entry;
      mesh.userData.az = (Math.atan2(dir.x, dir.z) + Math.PI) / (Math.PI * 2);
      group.add(mesh);
      planes.push(mesh);
    }

    const state = { spin: 0, extra: 0, entryRot: 0, opacity: entry ? 0 : 1 };
    const size = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    let lastRot = 0;
    const tick = (time, dtMs) => {
      if (!visible) return;
      const dt = Math.min(Math.max(1, dtMs) / 1000, 0.05);
      if (!reduce) state.spin += (o.speed + state.extra) * dt;
      const rot = state.spin + state.entryRot, speed = Math.abs(rot - lastRot) / dt;
      lastRot = rot;
      // Intensity = The share of the intro spin that exceeds the usual spinning speed (up to the first speed 1.2) or the scroll acceleration share, whichever is larger
      uVel.value = Math.max(Math.min(Math.max((speed - o.speed) / Math.max(1.2 - o.speed, 0.001), 0), 1), Math.min(state.extra / 1.6, 1));
      group.rotation.y = rot;
      mat.opacity = state.opacity;
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);
    const tweens = [];
    if (entry) {
      // Intro — rotates in 280° over 4.7s power3.out while panels light up from .72 → 1 in azimuth order (within 2.6s), and the fog clears at 3.2s
      const amount = Math.PI * (+(options.turn ?? 280) / 180), rot = { v: 0 };
      tweens.push(gsap.to(state, { opacity: 1, duration: 1, ease: "power2.out" }));
      tweens.push(gsap.to(rot, { v: amount, duration: +(options.dur ?? 4.7), ease: "power3.out", onUpdate: () => (state.entryRot = rot.v - amount) }));
      tweens.push(gsap.to(scene.fog, { near: o.near, far: o.far, duration: 3.2, ease: "power2.inOut" }));
      planes.forEach((m) => tweens.push(gsap.delayedCall(Math.max(0, (m.userData.az - 0.25 + 1) % 1) * 2.6, () => { m.visible = true; gsap.to(m.scale, { x: 1, y: 1, z: 1, duration: 0.28, ease: "power2.out" }); })));
    }
    // When scrolling fast, add that much rotation in .2s, then after .35s release it over 1.9s
    let lastY = scrollY, lastT = performance.now();
    const onScroll = () => {
      const now = performance.now(), v = Math.abs(scrollY - lastY) / Math.max(1, now - lastT) * 1000;
      lastY = scrollY; lastT = now;
      const k = Math.min(v / 3000, 1) * 1.6;
      if (k < state.extra) return;
      gsap.killTweensOf(state, "extra");
      gsap.to(state, { extra: k, duration: 0.2, ease: "power3.out" });
      gsap.to(state, { extra: 0, duration: 1.9, delay: 0.35, ease: "power3.out" });
    };
    if (kickOn) addEventListener("scroll", onScroll, { passive: true });
    return () => {
      gsap.ticker.remove(tick);
      removeEventListener("scroll", onScroll);
      ro.disconnect(); io.disconnect();
      tweens.forEach((t) => t.kill());
      gsap.killTweensOf(state);
      planes.forEach((m) => m.geometry.dispose());
      mat.dispose(); tex.dispose(); renderer.dispose();
      canvas.remove();
    };
  });
})();
