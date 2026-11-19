// Time machine: a 3D carousel with laptops and monitors showing past editions lined up sideways (original ArchiveHardwareWall — a three scene).
// Only the center device faces front while the sides recede at an angle. Arrows and drag move one device at a time (.9s expo), and the year pill above the devices follows along.
(() => {
  const root = document.querySelector("[data-tm]");
  if (!root || !window.THREE) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (v) => getComputedStyle(root).getPropertyValue(v).trim();
  const items = [...root.querySelectorAll("[data-tm-list] li")].map((li) => ({ year: li.dataset.year, kind: li.dataset.kind, label: li.dataset.label }));
  const host = root.querySelector("[data-tm-scene]"), pills = root.querySelector("[data-tm-pills]"), caption = root.querySelector("[data-tm-caption]");
  let renderer, scene, cam, devices = [], built = false;
  const state = { i: 0, x: 0 };
  const SPACING = 3.4;

  // Device screen: old panel placeholder (skin color strip + year + what to put in)
  function screenTexture(it) {
    const c = document.createElement("canvas");
    c.width = 640; c.height = 400;
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 640, 400);
    grad.addColorStop(0, css("--kf-raised")); grad.addColorStop(1, css("--kf-accent"));
    g.fillStyle = grad; g.fillRect(0, 0, 640, 400);
    g.fillStyle = css("--kf-bg"); g.globalAlpha = 0.35; g.fillRect(40, 40, 560, 36); g.fillRect(40, 100, 260, 220); g.fillRect(320, 100, 280, 100); g.globalAlpha = 1;
    g.fillStyle = css("--kf-ink");
    g.font = `700 54px ${css("--kf-font-sans")}`;
    g.fillText(it.year, 330, 270);
    g.font = `500 18px ${css("--kf-font-mono")}`;
    g.fillText(it.label, 330, 310, 290);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function device(it) {
    const grp = new THREE.Group();
    const body = new THREE.MeshStandardMaterial({ color: new THREE.Color(css("--kf-dim")), metalness: 0.6, roughness: 0.35 });
    const glass = new THREE.MeshBasicMaterial({ map: screenTexture(it) });
    if (it.kind === "laptop") {
      const lid = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.68, 0.06), body);
      lid.position.set(0, 0.84, 0);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.42, 1.5), glass);
      scr.position.set(0, 0.84, 0.035);
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 1.7), body);
      base.position.set(0, -0.04, 0.82);
      grp.add(lid, scr, base);
      grp.rotation.x = -0.05;
    } else {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.5, 0.08), body);
      frame.position.set(0, 1.05, 0);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.18, 1.38), glass);
      scr.position.set(0, 1.05, 0.045);
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.62, 0.1), body);
      neck.position.set(0, 0.12, -0.08);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.6), body);
      foot.position.set(0, -0.18, 0);
      grp.add(frame, scr, neck, foot);
    }
    return grp;
  }
  function build() {
    if (built) return;
    built = true;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    scene.add(new THREE.AmbientLight(0xffffff, 1.6)); // Not skin: light intensity (white light)
    const key = new THREE.DirectionalLight(0xffffff, 2.4); // Not skin: light intensity (white light)
    key.position.set(2, 4, 5);
    scene.add(key);
    devices = items.map((it, i) => {
      const d = device(it);
      d.position.x = i * SPACING;
      scene.add(d);
      const pill = document.createElement("span");
      pill.className = "al-tm__pill";
      pill.textContent = it.year;
      pills.appendChild(pill);
      return { d, pill };
    });
    renderer.compile(scene, cam);
    size();
    new ResizeObserver(size).observe(host);
    requestAnimationFrame(loop);
  }
  function size() {
    const r = host.getBoundingClientRect();
    if (!r.width) return;
    renderer.setSize(r.width, r.height, false);
    renderer.domElement.style.width = "100%"; renderer.domElement.style.height = "100%";
    cam.aspect = r.width / r.height;
    // Distance at which the center device (width 2.8) enters with side margins — retreats more on narrower screens
    const half = Math.atan(Math.tan((cam.fov * Math.PI) / 360) * cam.aspect);
    cam.position.set(state.x, 0.95, Math.max(7, 2.1 / Math.tan(half)));
    cam.updateProjectionMatrix();
  }
  const v = new (window.THREE.Vector3)();
  function loop() {
    requestAnimationFrame(loop);
    if (root.closest("[hidden]")) return;
    cam.position.x = state.x;
    cam.lookAt(state.x, 0.7, 0);
    const r = host.getBoundingClientRect();
    devices.forEach(({ d, pill }, i) => {
      const off = i * SPACING - state.x;
      d.rotation.y = -Math.max(-0.6, Math.min(0.6, off * 0.16));
      d.position.z = -Math.min(2.2, Math.abs(off) * 0.35);
      v.set(d.position.x, d.position.y + (items[i].kind === "laptop" ? 1.9 : 2.05), d.position.z).project(cam);
      const px = (v.x * 0.5 + 0.5) * r.width, py = (-v.y * 0.5 + 0.5) * r.height;
      pill.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -100%)`;
      pill.style.opacity = String(Math.max(0, 1 - Math.abs(off) / (SPACING * 2.2)));
    });
    renderer.render(scene, cam);
  }
  function go(i) {
    state.i = Math.max(0, Math.min(items.length - 1, i));
    caption.textContent = items[state.i].year;
    root.querySelector('[data-tm-step="-1"]').setAttribute("aria-disabled", String(state.i === 0));
    root.querySelector('[data-tm-step="1"]').setAttribute("aria-disabled", String(state.i === items.length - 1));
    gsap.to(state, { x: state.i * SPACING, duration: reduce ? 0 : 0.9, ease: "expo.out", overwrite: true });
  }
  root.querySelectorAll("[data-tm-step]").forEach((b) => b.addEventListener("click", () => go(state.i + +b.dataset.tmStep)));
  let drag = null;
  host.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, sx: state.x }; host.setPointerCapture?.(e.pointerId); });
  host.addEventListener("pointermove", (e) => { if (!drag) return; gsap.killTweensOf(state); state.x = drag.sx - ((e.clientX - drag.x) / host.clientWidth) * SPACING * 2.4; });
  host.addEventListener("pointerup", () => { if (!drag) return; drag = null; go(Math.round(state.x / SPACING)); });
  // Set up when the screen first shows (so size isn’t measured as 0 on a hidden face)
  root.closest("[data-face]")?.addEventListener("al:shown", () => { build(); size(); go(state.i); });
  new MutationObserver(() => { if (!root.closest("[data-face]").hidden) { build(); size(); } }).observe(root.closest("[data-face]"), { attributes: true, attributeFilter: ["hidden"] });
  go(0);
})();
