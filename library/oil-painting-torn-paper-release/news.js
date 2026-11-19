// All plates — ten covers stood leaning on two wall shelf tiers (top 5 at y .835 · bottom 5 at y −.65, 1.34 apart horizontally, z −1.19).
// Original albumConstants: cover 1.168 · thickness .013 · lift 1000ms easeOutQuart · set down 400ms easeInQuart (tilt after .6)
// · staggered entrance at 75ms (wall brightens over 1000ms, cover appears after 400ms lifted and settles down) · on press, camera moves to the front (0, −r, 6.6) in 700ms.
(() => {
  const T = window.THREE;
  const { reduce, color } = window.ED;
  const wall = document.querySelector(".n-wall");
  const canvas = document.querySelector(".n-gl");
  const listBtns = [...document.querySelectorAll(".n-list button")];
  const card = document.querySelector("[data-card]");
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;

  const C = { ink: color("--kf-ink"), surface: color("--kf-surface"), raised: color("--kf-raised"), accent: color("--kf-accent"), dark: color("--kf-contrast-bg"), light: color("--kf-contrast-ink"), sky: color("--site-sky"), violet: color("--site-violet"), leaf: color("--site-leaf"), gold: color("--site-gold"), wine: color("--site-wine"), blue: color("--site-fall-blue"), orange: color("--site-fall-orange"), green: color("--site-fall-green"), magenta: color("--site-fall-magenta") };
  const col = (c) => new T.Color().setRGB(c[0], c[1], c[2], T.SRGBColorSpace);
  const css = (c, a = 1) => `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`;

  // Cover art — background, pattern and big-text slot differ per edition (same slot and same color weight in place of the original cover art)
  const looks = [
    [C.blue, C.light, "grid"], [C.violet, C.leaf, "fog"], [C.dark, C.gold, "paint"], [C.violet, C.magenta, "neon"], [C.light, C.accent, "comic"],
    [C.dark, C.light, "orb"], [C.sky, C.light, "glass"], [C.dark, C.orange, "bars"], [C.gold, C.wine, "tiles"], [C.magenta, C.light, "boxes"],
  ];
  const cover = ([bg, fg, kind], i) => {
    const c = document.createElement("canvas"); c.width = c.height = 512;
    const g = c.getContext("2d");
    g.fillStyle = css(bg); g.fillRect(0, 0, 512, 512);
    g.strokeStyle = css(fg, .6); g.fillStyle = css(fg, .85);
    if (kind === "grid") { for (let k = 0; k < 60; k++) { g.beginPath(); g.arc(Math.random() * 512, Math.random() * 512, 1.5, 0, 7); g.fill(); } g.lineWidth = .6; for (let k = 0; k < 30; k++) { g.beginPath(); g.moveTo(Math.random() * 512, Math.random() * 512); g.lineTo(Math.random() * 512, Math.random() * 512); g.stroke(); } }
    if (kind === "fog" || kind === "paint") { for (let k = 0; k < 18; k++) { const gr = g.createRadialGradient(Math.random() * 512, 200 + Math.random() * 312, 0, 256, 300, 140); gr.addColorStop(0, css(fg, .35)); gr.addColorStop(1, css(fg, 0)); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); } }
    if (kind === "neon") { g.lineWidth = 10; g.shadowColor = css(fg); g.shadowBlur = 24; g.beginPath(); g.moveTo(80, 300); g.bezierCurveTo(160, 120, 260, 420, 430, 200); g.stroke(); g.shadowBlur = 0; }
    if (kind === "comic") { g.fillStyle = css(fg); g.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, r = k % 2 ? 110 : 200; g.lineTo(256 + Math.cos(a) * r, 280 + Math.sin(a) * r); } g.fill(); }
    if (kind === "orb") { const gr = g.createRadialGradient(330, 330, 10, 300, 300, 160); gr.addColorStop(0, css(fg, .9)); gr.addColorStop(1, css(fg, 0)); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); }
    if (kind === "glass") { for (let k = 0; k < 5; k++) { g.fillStyle = css(fg, .25 + k * .1); g.beginPath(); g.roundRect(80 + k * 50, 160 + (k % 2) * 60, 140, 140, 24); g.fill(); } }
    if (kind === "bars") { for (let k = 0; k < 9; k++) { const gr = g.createLinearGradient(0, 120, 0, 460); gr.addColorStop(0, css(fg, 0)); gr.addColorStop(1, css(fg)); g.fillStyle = gr; g.fillRect(40 + k * 50, 120, 34, 340); } }
    if (kind === "tiles") { for (let y = 120; y < 512; y += 64) for (let x = 0; x < 512; x += 64) { g.fillStyle = css((x + y) % 128 ? fg : bg, .8); g.fillRect(x + 4, y + 4, 56, 56); } }
    if (kind === "boxes") { for (let k = 0; k < 7; k++) { g.fillStyle = css(fg, .5); g.fillRect(60 + (k % 4) * 100, 180 + Math.floor(k / 4) * 140, 80, 110); } }
    g.fillStyle = css(kind === "comic" || kind === "grid" || kind === "glass" ? (kind === "grid" ? C.light : C.ink) : C.light);
    g.font = `700 64px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-display")}`;
    g.fillText(`Issue ${String(i + 1).padStart(2, "0")}`, 28, 92);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  };

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(25, 1, .1, 60);
  // Camera height fitted to the cover slots of the original screen (center x 270·495·719·946·1170 · row center y 303·555 @1440×900)
  camera.position.set(0, .11, 10);
  camera.lookAt(0, -.04, 0);
  scene.add(new T.AmbientLight(0xffffff, 1.6));
  const sun = new T.DirectionalLight(0xffffff, 1.6);
  sun.position.set(-1, 6, 5); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.radius = 6;
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 3, bottom: -3 });
  scene.add(sun);

  // Wall — a panel that only receives shadows
  const wallMesh = new T.Mesh(new T.PlaneGeometry(30, 16), new T.ShadowMaterial({ opacity: .12 }));
  wallMesh.position.z = -1.32; wallMesh.receiveShadow = true; scene.add(wallMesh);
  // Two shelf tiers
  const shelfMat = new T.MeshStandardMaterial({ color: col(C.surface), roughness: .9 });
  [.835, -.65].forEach((y) => { const s = new T.Mesh(new T.BoxGeometry(6.6, .035, .22), shelfMat); s.position.set(0, y - .584 - .02, -1.19); s.castShadow = s.receiveShadow = true; scene.add(s); });

  const SIZE = 1.168, LEAN = -.16;
  const spots = [[-2.66, .835], [-1.34, .835], [-.005, .835], [1.34, .835], [2.66, .835], [-2.66, -.65], [-1.34, -.65], [-.005, -.65], [1.34, -.65], [2.66, -.65]];
  // Lift — the anchor rises 13.9px on the original screen (.081 in the copy camera)
  const offs = [.081, .081, .081, .081, .081, .081, .065, .065, .065, .065];
  const albums = spots.map(([x, y], i) => {
    const mat = [0, 0, 0, 0, 0, 0].map(() => new T.MeshStandardMaterial({ color: col(C.surface), roughness: .6 }));
    mat[4] = new T.MeshStandardMaterial({ map: cover(looks[i], i), roughness: .55 });
    mat[5] = new T.MeshStandardMaterial({ color: col(C.raised), roughness: .7 });
    const m = new T.Mesh(new T.BoxGeometry(SIZE, SIZE, .013), mat);
    m.castShadow = true;
    const g = new T.Group(); g.add(m);
    const rest = { x, y: y - .584 + SIZE / 2 + .002, z: -1.19 + .07, rx: LEAN, ry: 0 };
    g.position.set(rest.x, rest.y, rest.z); g.rotation.x = LEAN; g.scale.setScalar(0);
    scene.add(g);
    return { g, m, i, rest, off: offs[i], hover: false, active: false };
  });

  // Original curves — easeOutQuart and easeInQuart, the press uses cubic acceleration for the first 30% + cubic deceleration for the last 70%
  const outQuart = (t) => 1 - (1 - t) ** 4, inQuart = (t) => t ** 4;
  const CM = (e) => (e < .3 ? .3 * (e / .3) ** 3 : .3 + .7 * (1 - (1 - (e - .3) / .7) ** 3));
  const tw = (a, to, ms, ease, delay = 0) => {
    if (reduce) ms = 0;
    a.tw = { from: { x: a.g.position.x, y: a.g.position.y, z: a.g.position.z, rx: a.g.rotation.x, ry: a.g.rotation.y }, to, ms, ease, t0: performance.now() + delay };
  };
  const lift = (a, ms = 1000) => tw(a, { ...a.rest, y: a.rest.y + a.off, z: a.rest.z + .06, rx: 0 }, ms, outQuart);
  const drop = (a) => { tw(a, { ...a.rest, rx: a.g.rotation.x }, 400, inQuart); a.rxDrop = performance.now() + 240; };
  let active = null;
  const open = (a, fromList = false) => {
    active = a; a.active = true; acts.classList.remove("is-on"); wall.classList.add("is-open");
    tw(a, { x: 0, y: -(.07 + a.off) - .04, z: 6.6 - 3.6, rx: 0, ry: 0 }, 700, CM, fromList ? 0 : 60);
    // The original attaches the text box right away (.02s) when pressed from the list, and one tempo later (.09s) when pressed from the pill
    card.classList.add("is-on"); setTimeout(() => { if (active) card.classList.add("is-full"); }, fromList ? 20 : 90); setTimeout(() => { if (active) card.classList.add("is-acts"); }, fromList ? 307 : 390);
    const b = listBtns[a.i]; card.querySelector("[data-card-year]").textContent = b.children[0].textContent; card.querySelector("[data-card-season]").textContent = b.children[1].textContent; card.querySelector("[data-card-name]").textContent = b.children[2].textContent;
  };
  const close = () => {
    if (!active) return;
    const a = active; active = null; a.active = false; a.flip = false; wall.classList.remove("is-open");
    tw(a, { ...a.rest, y: a.rest.y + a.off * .75 }, 700, CM);
    setTimeout(() => drop(a), 700);
    card.classList.remove("is-on"); setTimeout(() => { if (!active) card.classList.remove("is-full", "is-acts"); }, 400);
  };
  card.querySelector("[data-card-close]").addEventListener("click", close);
  card.querySelector("[data-card-flip]").addEventListener("click", () => { if (!active) return; active.flip = !active.flip; tw(active, { ...active.tw.to, ry: active.flip ? Math.PI : 0 }, 700, CM); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  // Entrance — wall 1000ms, covers appear lifted at i×75 + 400ms and settle i×75ms later
  // The original stays empty while downloading the shelf model (glb), then the wall brightens in 1s and covers sit in one by one — a download share of 550ms is set
  // The original intro (OM) holds cover i raised at 400+75i ms after start and sets it down at 150i ms — the start is set at .63s so the last cover lands 2.7s after the first art
  const LOAD = reduce ? 0 : 630;
  albums.forEach((a) => {
    a.g.position.y = a.rest.y + a.off; a.g.position.z = a.rest.z + .06; a.g.rotation.x = 0;
    setTimeout(() => { a.g.scale.setScalar(1); setTimeout(() => { if (!a.hover && !a.active) drop(a); }, reduce ? 0 : a.i * 75); }, reduce ? 0 : LOAD + a.i * 75 + 400);
  });

  // Hand — raised over a marker, lowered when it leaves. List buttons hold the same marker too
  const ray = new T.Raycaster(), mouse = new T.Vector2();
  let over = null;
  // ‹Open · Details› pill on the lifted cover
  const acts = document.createElement("div");
  acts.className = "n-acts";
  acts.innerHTML = '<div class="n-acts__in"><a class="n-act" href="article.html">Open</a><button class="n-act" type="button">In detail</button></div>';
  wall.appendChild(acts);
  const v3 = new T.Vector3();
  // The anchor is the center .14 above the cover bottom — rises when lifted, and on press comes forward with the cover. While resting it stands transparent at the first cover position (same as the original)
  let anchor = null;
  const placeActs = (a = active || over || anchor || albums[0]) => {
    anchor = a;
    a.g.localToWorld(v3.set(0, -SIZE * .36, 0)); v3.project(camera);
    acts.style.transform = `translate(${(v3.x * .5 + .5) * canvas.clientWidth}px, ${(-v3.y * .5 + .5) * canvas.clientHeight}px)`;
  };
  const setOver = (a) => {
    if (over === a) return;
    if (over && !over.active) { over.hover = false; drop(over); }
    over = a;
    if (a && !a.active) { a.hover = true; lift(a); acts.querySelector("a").href = ["article.html", "article-dark.html", "index.html"][a.i] || "index.html"; }
    acts.classList.toggle("is-on", !!a && !a.active);
    canvas.style.cursor = a ? "pointer" : "default";
  };
  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects(albums.map((a) => a.m))[0];
    setOver(hit ? albums.find((a) => a.m === hit.object) : null);
  });
  // Original keeps the chosen cover held up even when the hand moves over the list row below (down to the screen bottom) — it is put down only on leaving toward the head or off screen
  const listEl = document.querySelector(".n-list");
  const keeps = (t) => !!t && (acts.contains(t) || listEl.contains(t));
  canvas.addEventListener("pointerleave", (e) => { if (!keeps(e.relatedTarget)) setOver(null); });
  listEl.addEventListener("pointerleave", (e) => { if (e.relatedTarget !== canvas && !keeps(e.relatedTarget)) setOver(null); });
  acts.addEventListener("pointerleave", (e) => { if (e.relatedTarget !== canvas && !keeps(e.relatedTarget)) setOver(null); });
  acts.addEventListener("pointerenter", () => { if (!active) setOver(anchor || albums[0]); });
  acts.querySelector("button").addEventListener("click", () => { if (over) open(over); });
  canvas.addEventListener("click", () => { if (active) close(); else if (over) open(over); });
  listBtns.forEach((b, i) => {
    b.addEventListener("mouseenter", () => setOver(albums[i]));
    b.addEventListener("focus", () => setOver(albums[i]));
    b.addEventListener("click", () => { if (active) close(); open(albums[i], true); });
  });
  const sound = document.querySelector(".n-sound");
  sound.addEventListener("click", () => sound.setAttribute("aria-pressed", sound.getAttribute("aria-pressed") !== "true"));

  const size = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Step back so the shelf width (7.1) fits, but on wide screens move in 9% like the original (original cover spacing 225px @1440)
    const fit = 7.6 / (2 * Math.tan(T.MathUtils.degToRad(12.5)) * camera.aspect) + 1.2;
    camera.position.z = camera.aspect > 1 ? Math.max(9.2, fit / 1.09) : Math.max(10, fit);
    camera.updateProjectionMatrix();
  };
  addEventListener("resize", size); size();

  renderer.setAnimationLoop((now) => {
    now = performance.now();
    albums.forEach((a) => {
      const t = a.tw; if (!t) return;
      const k = t.ms ? Math.min(1, Math.max(0, (now - t.t0) / t.ms)) : 1;
      const e = t.ease(k);
      a.g.position.set(t.from.x + (t.to.x - t.from.x) * e, t.from.y + (t.to.y - t.from.y) * e, t.from.z + (t.to.z - t.from.z) * e);
      a.g.rotation.y = t.from.ry + (t.to.ry - t.from.ry) * e;
      if (a.rxDrop) {
        const kk = Math.min(1, Math.max(0, (now - a.rxDrop) / 400));
        a.g.rotation.x = t.from.rx + (LEAN - t.from.rx) * inQuart(kk);
        if (kk >= 1) a.rxDrop = 0;
      } else a.g.rotation.x = t.from.rx + (t.to.rx - t.from.rx) * e;
    });
    placeActs();
    renderer.render(scene, camera);
  });
})();
