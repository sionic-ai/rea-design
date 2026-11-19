/* Work list — back curved panorama screen (switches to the hovered row’s video in .6s) · light over the row (follows the cursor, turns on in .35s) · filter */
(() => {
  const MR = window.MR, T = window.THREE;
  const rows = [...document.querySelectorAll("[data-rows] li")];
  const list = document.querySelector("[data-rows]");

  MR.glow(list, list?.querySelector(".pi__glow"), "ul > li");

  // Filtering
  const btn = document.querySelector("[data-filter-btn]"), drop = document.querySelector("[data-filter-drop]"), count = document.querySelector("[data-filter-count]");
  btn?.addEventListener("click", () => { const on = btn.getAttribute("aria-expanded") !== "true"; btn.setAttribute("aria-expanded", on ? "true" : "false"); drop.hidden = !on; });
  drop?.addEventListener("change", () => {
    const picked = [...drop.querySelectorAll("input:checked")].map((i) => i.value);
    count.hidden = !picked.length;
    btn.classList.toggle("is-picked", picked.length > 0);
    count.textContent = picked.length;
    rows.forEach((li) => { const a = li.querySelector("a"); const keys = `${a.dataset.tags} ${a.dataset.ind}`.split(" "); li.hidden = picked.length > 0 && !picked.some((p) => keys.includes(p)); });
  });

  // 3D: one wide curved screen beyond a sand dune — with the video and light color of the hovered row
  const canvas = document.querySelector("[data-list-canvas]");
  if (!T || !canvas) { MR?.progress?.(1); return; }
  const renderer = MR.renderer(canvas);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(38, 1, 0.1, 400);
  const colors = MR.projectColors(rows.length);
  const sand = MR.sand({ size: 260, seg: 220, dune: 0.8, flat: [0, 14, 6] });
  scene.add(sand);
  const su = sand.material.uniforms;
  // A small curved strip floating at the chosen row height — five screens (radius 30, .11rad each, .0125rad gap, height 3.8) rise and fall along the row like the original
  const texes = rows.map((li, i) => MR.screenTexture(`Project video ${i + 1}`, "Placeholder video · Horizontal · Loop"));
  const band = new T.Group();
  const panels = [];
  for (let k = 0; k < 5; k++) {
    const m = new T.Mesh(new T.CylinderGeometry(30, 30, 5.4, 24, 1, true, Math.PI - 0.32 + k * 0.13, 0.12), MR.screenMaterial(texes[0], colors[0].clone()));
    band.add(m);
    panels.push(m);
  }
  scene.add(band);
  sand.position.set(0, -4, 0);
  su.uLampPos.value.set(0, 0, -27);
  su.uFogDist.value.set(26, 60);
  const VIS = 2 * 30 * Math.tan(T.MathUtils.degToRad(19));
  const sm = { uFade: { value: 1 }, uTint: { value: colors[0].clone() } };
  const target = { i: 0, y: 0 };
  const setActive = (i) => {
    if (target.i === i) return;
    target.i = i;
    const swap = () => panels.forEach((m) => { m.material.uniforms.uMap.value = texes[i]; });
    if (MR.reduce) { swap(); sm.uTint.value.copy(colors[i]); return; }
    gsap.timeline()
      .to(sm.uFade, { value: 0.15, duration: 0.3, ease: "power2.in" })
      .add(swap)
      .to(sm.uTint.value, { r: colors[i].r, g: colors[i].g, b: colors[i].b, duration: 0.6, ease: "power2.out" }, "<")
      .to(sm.uFade, { value: 1, duration: 0.3, ease: "power2.out" }, "<");
  };
  rows.forEach((li, i) => li.addEventListener("mouseenter", () => setActive(i)));
  const resize = () => MR.fit(renderer, camera, canvas);
  addEventListener("resize", resize);
  resize();
  const post = MR.post(renderer);
  post.fade(0);
  const aim = new T.Vector3(0, 0, -30);
  let first = true, last = 0;
  const frame = (now) => {
    const t = now / 1000;
    const dt = last ? (now - last) / 1000 : 1 / 60;
    last = now;
    const [yaw, pitch] = MR.leanTarget();
    camera.position.set(0, 0, 0);
    camera.lookAt(aim);
    MR.lean(camera, aim, yaw, pitch);
    panels.forEach((m) => { const u = m.material.uniforms; u.uTime.value = t; u.uFade.value = sm.uFade.value; u.uTint.value.copy(sm.uTint.value); });
    su.uTime.value = t;
    su.uLamp.value.lerp(sm.uTint.value, 0.05);
    su.uLampPower.value = 0.8 * sm.uFade.value;
    const row = rows[target.i]?.getBoundingClientRect();
    if (row) target.y = (0.5 - (row.top + row.height / 2) / innerHeight) * VIS;
    band.position.y += (target.y - band.position.y) * (MR.reduce ? 1 : 0.1);
    sand.position.y = band.position.y - 4.2;
    su.uLampPos.value.y = band.position.y;
    post.render(scene, camera, dt);
    if (first) { first = false; MR.progress(1); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
