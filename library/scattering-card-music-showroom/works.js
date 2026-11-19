// Recommended list — the slot (DOM) sets position and size, the card (3D) is drawn following that slot every frame. Background is a three-depth star stage (mouse .05·scroll .25 parallax).
(() => {
  const KT = window.KT, T = window.THREE, GL = KT.GL;
  const { clamp, easeOutCubic: eoc, rh } = KT;
  const reduce = KT.reduce;
  const grid = document.querySelector(".kw-grid__in");
  document.querySelector("[data-total]").textContent = KT.brand.length;
  const cells = KT.brand.map((t, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "kw-cell";
    b.dataset.i = i;
    b.setAttribute("aria-label", `${t.no} ${t.title}`);
    grid.appendChild(b);
    return b;
  });
  let insp = -1;
  KT.onInspectClose = () => (insp = -1);
  cells.forEach((c, i) => c.addEventListener("click", (e) => { e.stopPropagation(); insp = insp === i ? -1 : i; KT.inspect(insp); }));
  addEventListener("click", (e) => { if (insp >= 0 && !e.target.closest("[data-inspect-panel], .kw-cell")) KT.inspect(-1); });

  const build = () => {
    const stage = GL.stage(document.querySelector(".kt-gl"));
    const { scene, view, camera } = stage;
    // Star stage: a panel covering the screen 1.35 times at -2.5 depth from the camera
    const stars = GL.starMaterial({ density: 17 });
    const back = new T.Mesh(new T.PlaneGeometry(1, 1), stars);
    back.position.z = -2.5;
    back.renderOrder = -10;
    scene.add(back);
    const par = new T.Vector2();
    const items = KT.brand.map((t, i) => {
      const holder = new T.Group(), tilt = new T.Group();
      const mesh = new T.Mesh(GL.cardGeometry, GL.cardMaterial({ ...t, corner: t.corner }));
      mesh.userData.i = i;
      tilt.add(mesh); holder.add(tilt); scene.add(holder);
      return { holder, tilt, mesh, hov: 0, rx: 0, ry: 0, inA: reduce ? 1 : 0, lift: 0 };
    });
    // Entrance — once the loading screen lifts, each cell comes .07 later, from back to front (the original reel’s entrance formula)
    const enter = { t: reduce ? 1 : 0 };
    KT.booted.then(() => gsap.to(enter, { t: 1, duration: reduce ? 0 : 1.4, ease: "none" }));
    let hovered = -1;
    stage.onFrame((dt, time) => {
      const h = 2 * (camera.position.z + 2.5) * Math.tan((camera.fov * Math.PI) / 360) * 1.35, w = h * camera.aspect;
      back.scale.set(w, h, 1);
      const su = stars.uniforms;
      su.uTime.value = time;
      su.uAspect.value = camera.aspect;
      su.uDensity.value = 17 * (h / 0.975) * 0.5;
      const doc = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const k = rh(0.06, dt), pt = stage.pointer;
      const pp = reduce ? 0 : 0.05;
      par.x += (pt.x * pp - par.x) * k;
      par.y += (pt.y * pp + (scrollY / doc) * 0.25 - par.y) * k;
      su.uPar.value.copy(par);

      const hit = stage.hasPointer ? stage.pick(items.map((it) => it.mesh)) : null;
      hovered = hit ? hit.object.userData.i : -1;
      if (insp >= 0 && hovered !== insp) hovered = -1;
      const uv = hit && hit.uv;
      KT.cursor.hot(hovered >= 0);
      items.forEach((it, i) => {
        const r = cells[i].getBoundingClientRect();
        const wp = stage.world(r.left + r.width / 2, r.top + r.height / 2);
        const sc = ((r.width / view.W) * view.w) / 0.78;
        const a = eoc(clamp((enter.t - 0.07 * i) / 0.3, 0, 1));
        it.hov += ((hovered === i ? 1 : 0) - it.hov) * rh(0.12, dt);
        // Only the hovered card tilts toward the cursor position on its face (uv) — 0 at center, ±.3rad at the edges, back to 0 when the cursor leaves
        const aim = hovered === i && uv && !reduce;
        it.rx += ((aim ? (0.5 - uv.y) * 0.6 : 0) - it.rx) * rh(0.15, dt);
        it.ry += ((aim ? (uv.x - 0.5) * 0.6 : 0) - it.ry) * rh(0.15, dt);
        const me = insp === i, dim = insp >= 0 && !me;
        it.lift += ((me ? 1 : 0) - it.lift) * rh(0.12, dt);
        const x = wp.x + (-view.w * 0.17 - wp.x) * it.lift, y = wp.y + (0 - wp.y) * it.lift;
        it.holder.position.set(x, y, (1 - a) * -6 + 0.45 * it.hov + 1.1 * it.lift);
        it.holder.rotation.set(0, (1 - a) * Math.PI, 0);
        it.holder.scale.setScalar(sc * clamp(a / 0.15, 0, 1) * (1 + 0.06 * it.hov) * (1 + 0.25 * it.lift));
        it.tilt.rotation.set(it.rx, it.ry, 0);
        const u = it.mesh.material.uniforms;
        u.uTime.value = time;
        u.uOpacity.value += ((dim ? 0.18 : 1) - u.uOpacity.value) * rh(0.12, dt);
        it.mesh.renderOrder = me ? 200 : Math.round(100 + 10 * it.hov);
      });
    });
    stage.warm();
  };
  KT.bootTask(GL.fontsReady().then(build));
})();
