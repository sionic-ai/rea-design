// Contact record — a sleeve (square panel) and a white disc sticking out halfway to the right. Tilts slightly toward the cursor and the disc spins slowly.
// On press the whole panel flies off screen to the lower left (original launch).
(() => {
  const A = (window.PG ||= {});
  A.recordGate = (host) => {
    if (!window.THREE) return null;
    const col = (v) => new THREE.Color(A.css(v) || A.css("--kf-ink"));
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(1.5, devicePixelRatio || 1));
    r.outputColorSpace = THREE.SRGBColorSpace;
    host.prepend(r.domElement);
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    cam.position.set(0, 0, 9);
    scene.add(new THREE.AmbientLight(col("--kf-ink"), 0.9));
    const key = new THREE.DirectionalLight(col("--kf-ink"), 1.4); key.position.set(2, 3, 5); scene.add(key);
    // Sleeve front placeholder — big title on a dark panel, glowing door, stair rows, photo caption
    const cv = document.createElement("canvas"); cv.width = cv.height = 1024;
    const g = cv.getContext("2d");
    g.fillStyle = A.css("--kf-surface"); g.fillRect(0, 0, 1024, 1024);
    const glow = g.createRadialGradient(512, 560, 20, 512, 560, 420); glow.addColorStop(0, A.css("--kf-ink-soft")); glow.addColorStop(1, A.css("--kf-surface"));
    g.fillStyle = glow; g.fillRect(0, 0, 1024, 1024);
    g.fillStyle = A.css("--kf-ink"); g.fillRect(452, 420, 120, 230);
    for (let i = 0; i < 7; i++) { g.globalAlpha = 0.5 - i * 0.06; g.fillRect(380 - i * 10, 670 + i * 30, 264 + i * 20, 10); }
    g.globalAlpha = 1; g.textAlign = "center";
    g.font = `700 120px ${A.css("--kf-font-display")}`; g.fillText("ALBUM NAME", 512, 300);
    g.font = `600 26px ${A.css("--kf-font-sans")}`; g.fillStyle = A.css("--kf-ink-soft");
    ["Album cover art", "Person at the door at the end of the stairs · strong backlight", "Square 1:1"].forEach((t, i) => g.fillText(t, 512, 880 + i * 36));
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const dark = new THREE.MeshStandardMaterial({ color: col("--kf-surface"), roughness: 0.8 });
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.03), [dark, dark, dark, dark, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }), dark]);
    const vinyl = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.012, 96), new THREE.MeshStandardMaterial({ color: col("--kf-ink"), roughness: 0.35, metalness: 0.05 }));
    disc.rotation.x = Math.PI / 2;
    const lab = new THREE.Mesh(new THREE.CircleGeometry(0.33, 64), new THREE.MeshStandardMaterial({ color: col("--kf-bg"), roughness: 0.6 }));
    lab.position.z = 0.007;
    vinyl.add(disc, lab);
    vinyl.position.set(0.62, 0, -0.03);
    const rig = new THREE.Group(); rig.add(vinyl, sleeve); scene.add(rig);
    // The sleeve settles in CSS at .85s, then approaches from .85x scale over .75s — loader measured in the original at 1.38s
    const grow = { k: A.reduce ? 1 : 0.85 };
    if (!A.reduce) gsap.to(grow, { k: 1, duration: 0.75, delay: 0.85, ease: "power2.out" });
    const size = () => { const w = innerWidth, h = innerHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); rig.userData.base = w < 650 ? 0.62 : 1; };
    size(); addEventListener("resize", size);
    // When the cursor comes within panel width × 2.5 of the sleeve center, the panel slides out further and the whole door approaches up to 1.4x and tilts -6°
    // (Ye in the original bundle Choz-AjC: target .25×smoothstep, 1.2Hz · damping .85 spring — measured center 21.1px · 1.411x, side at 195px 12.1px · 1.307x).
    // The original applies this value to translate · scale of the DOM slot (div.w-240) and the WebGL plate follows that slot — the copy applies the same value to the same slot box
    const slot = document.createElement("div");
    slot.className = "p-gate__slot";
    slot.setAttribute("aria-hidden", "true");
    host.append(slot);
    const pull = { value: 0, velocity: 0, target: 0 };
    let mx = 0, my = 0, px = null, py = null;
    const mv = (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; px = e.clientX; py = e.clientY; };
    addEventListener("pointermove", mv);
    const tick = (t) => {
      const d = slot.offsetWidth;
      if (px !== null && d && !rig.userData.entering) {
        const n = 1 - Math.min(1, Math.hypot(px - innerWidth / 2, py - innerHeight / 2) / (2.5 * d));
        pull.target = 0.25 * n * n * (3 - 2 * n);
      }
      if (A.reduce) { pull.value = pull.target; pull.velocity = 0; } else {
        const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 1 / 30), w = 2 * Math.PI * 1.2;
        pull.velocity += (-2 * 0.85 * w * pull.velocity - w * w * (pull.value - pull.target)) * dt;
        pull.value += pull.velocity * dt;
      }
      const v = Math.min(1, Math.max(0, pull.value / 0.25)), out = v ** 1.68;
      slot.style.translate = `${d * 0.0629 * out * (1 + 0.4 * v)}px`;
      slot.style.scale = `${1 + 0.411 * v}`;
      if (!rig.userData.entering) { rig.scale.setScalar(rig.userData.base * grow.k * (1 + 0.4 * v)); vinyl.position.x = 0.62 + 0.126 * out; }
      rig.rotation.y += (mx * 0.5 - (6 * Math.PI / 180) * v - rig.rotation.y) * 0.06;
      rig.rotation.x += (my * 0.35 - rig.rotation.x) * 0.06;
      vinyl.rotation.z -= A.reduce ? 0 : 0.004;
      r.render(scene, cam);
    };
    gsap.ticker.add(tick);
    return {
      // Matches the original bundle (launch: after .1s, .6s power2.in, off-screen by window width/2 + panel width × approach scale, down by panel width×.35×scale) and
      // Original continuous shot of the door opening (sleeve on the left, the white plate turns sideways, flattens and splits off to the right). 1 screen px is world unit 2·9·tan(15°)/window height
      launch: () => {
        rig.userData.entering = true;
        const k = (2 * 9 * Math.tan(Math.PI / 12)) / innerHeight / rig.scale.x, d = slot.offsetWidth * (1 + 0.4 * Math.min(1, Math.max(0, pull.value / 0.25)));
        const far = (innerWidth / 2 + d) * k, drop = -0.35 * d * k, fly = { duration: A.reduce ? 0 : 0.6, ease: "power2.in" }, at = A.reduce ? 0 : 0.1;
        return gsap.timeline()
          .to(sleeve.position, { x: -far, y: drop, ...fly }, at)
          .to(vinyl.position, { x: far, y: drop, ...fly }, at)
          .to(vinyl.rotation, { y: Math.PI / 2, ...fly }, at);
      },
      destroy: () => { gsap.ticker.remove(tick); removeEventListener("resize", size); removeEventListener("pointermove", mv); tex.dispose(); r.dispose(); r.domElement.remove(); slot.remove(); },
    };
  };
})();
