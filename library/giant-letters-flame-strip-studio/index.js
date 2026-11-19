// First page: metallic device in the sales band (three.js), today’s date, spinning coordinates.
// Original 3D (three r171): camera field of view 10° (−8,−3,15) → origin, scene tilted x .1, ACES tone · exposure 1, canvas width = Window width and height = width/(16:9 · 1:1 at 991 and below · 9:16 under 480),
// Attached under the band (bottom −4%) · device size .6 (.5 under 991) · rotation −.6 + progress×60° · height −.2 + progress×.6 (from band top edge below screen+50% to band bottom edge above screen−50%)
// · the disc moves −.005 per frame + scroll speed×−.005 (follows by .1) · orange point light (intensity 50 · distance 3.5 · decay 3.6) (−2,−1.3,2)→(−.5,−.5) · metal reflection .1→3 (band top edge 20% below the screen → band bottom edge above the screen).
// Don’t use the model (GLB) or HDR alley reflections — build with our rounded-box device and a bright-panel three-reflection room.
(() => {
  const { $, $$ } = window.SF;

  window.SF.page.home = (c) => {
    const { reduce, lenis } = window.SF;
    const T = window.THREE;

    // ── Today’s date (original en-UK dd/mm/yyyy) ──
    const d = new Date();
    const today = $("[data-today]", c);
    if (today) today.textContent = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

    // ── Spinning coordinates: text shuffles through the coordinates of several cities ──
    const coords = ["51°30′53″N 00°07′25″W", "13°45′22″N 100°30′07″E", "34°03′08″N 118°14′37″W", "41°23′19″N 02°09′32″E", "36°09′44″N 86°46′51″W", "33°52′04″S 151°12′26″E"];
    const cEl = $("[data-coords]", c);
    if (cEl) {
      cEl.textContent = coords[0];
      if (!reduce) {
        let ci = 0;
        gsap.timeline({ repeat: -1, repeatDelay: 1.6 }).call(() => {
          ci = (ci + 1) % coords.length;
          gsap.to(cEl, { duration: 0.8, scrambleText: { text: coords[ci], speed: 0.5, chars: "0123456789°′″" } });
        }, null, 1.6);
      }
    }

    const canvas = $(".goods-gl", c), goods = $("#webgl_trigger", c);
    if (!T || !canvas || !goods) return;

    // ── Device: rounded box body (metal) + front disc (rotating) and ring + screen under black glass (video glows) ──
    const rounded = (w, h, r) => {
      const s = new T.Shape(), x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
      s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
      return s;
    };
    const metal = new T.MeshStandardMaterial({ color: 0xebeff4, metalness: 0.85, roughness: 0.2, envMapIntensity: 0.1 }); /* Not skin: device metal material (original #EBEFF4) */
    const black = new T.MeshStandardMaterial({ color: 0x1c1c1c, metalness: 0, roughness: 1 }); /* Not skin: black part material of the device */
    const glass = new T.MeshPhysicalMaterial({ color: 0x111111, metalness: 0, roughness: 0, transmission: 1, ior: 1.3, thickness: 0.3 }); /* Not skin: black glass */
    // Screen video: like the original Display material, the video glows as light (emissive ×200) — the content is our placeholder video
    // On file:// WebGL cannot read the video (origin blocked) — then only the same light color, faintly
    const served = /^https?:$/.test(location.protocol);
    const video = document.createElement("video");
    Object.assign(video, { muted: true, loop: true, playsInline: true });
    let vtex = null;
    if (served) {
      video.crossOrigin = "anonymous";
      video.src = "media/recent-578x360-10s.mp4";
      vtex = new T.VideoTexture(video);
      vtex.colorSpace = T.SRGBColorSpace;
    }
    const display = new T.MeshStandardMaterial({ color: 0x000000, emissive: 0x96f7ff, emissiveIntensity: served ? 200 : 0.6, emissiveMap: vtex, roughness: 0.4 }); /* Not skin: screen light color (original #96F7FF) */
    const device = new T.Group();
    const body = new T.ExtrudeGeometry(rounded(1.6, 2.1, 0.2), { depth: 0.42, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 6, curveSegments: 20 });
    body.center();
    device.add(new T.Mesh(body, metal));
    const disk = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 0.03, 64), black);
    disk.rotation.x = Math.PI / 2;
    disk.position.set(0, -0.3, 0.29);
    const ring = new T.Mesh(new T.TorusGeometry(0.52, 0.025, 16, 96), metal);
    ring.position.set(0, -0.3, 0.3);
    const knob = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 0.06, 24), black);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(0.32, -0.62, 0.31);
    const screen = new T.Mesh(new T.PlaneGeometry(0.9, 0.42), display);
    screen.position.set(0, 0.62, 0.285);
    const cover = new T.Mesh(new T.PlaneGeometry(0.96, 0.48), glass);
    cover.position.set(0, 0.62, 0.3);
    device.add(disk, ring, knob, screen, cover);
    device.traverse((o) => o.isMesh && ((o.castShadow = true), (o.receiveShadow = true)));

    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene();
    // Room for reflections: dark walls + three bright panels (the original is an HDR alley photo)
    const room = new T.Scene();
    room.add(new T.Mesh(new T.BoxGeometry(10, 10, 10), new T.MeshBasicMaterial({ color: 0x111111, side: T.BackSide }))); /* Not skin: reflection room wall */
    [[0, 4.5, 0, 6, 2, -Math.PI / 2, 0], [-4.5, 1, 1, 3, 4, 0, Math.PI / 2], [4.5, 0, -1, 2, 5, 0, -Math.PI / 2]].forEach(([x, y, z, w, h, rx, ry]) => {
      const p = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(4, 4, 3.8), side: T.DoubleSide }));
      p.position.set(x, y, z);
      p.rotation.set(rx, ry, 0);
      room.add(p);
    });
    const pmrem = new T.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(room, 0.04).texture;
    scene.rotation.set(0.1, 0, 0);
    scene.add(device);
    const camera = new T.PerspectiveCamera(10, 16 / 9, 0.1, 100);
    camera.position.set(-8, -3, 15);
    camera.lookAt(0, 0, 0);
    scene.add(camera);
    const light = new T.PointLight(0xff9c29, 50, 3.5, 3.6); /* Not skin: original orange point light */
    light.position.set(-2, -1.3, 2);
    scene.add(light);

    const size = () => {
      const w = innerWidth, ratio = w < 480 ? 9 / 16 : w <= 991 ? 1 : 16 / 9;
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(w, w / ratio);
      camera.aspect = ratio;
      camera.updateProjectionMatrix();
      device.scale.setScalar(w < 991 ? 0.5 : 0.6);
    };
    size();
    addEventListener("resize", size);

    let spin = 0, spinTo = 0, active = false;
    const rot0 = -0.6, y0 = -0.2;
    device.rotation.y = rot0;
    device.position.y = y0;
    if (!reduce) {
      ScrollTrigger.create({
        trigger: goods,
        start: "top center+=50%",
        end: "bottom center-=50%",
        scrub: true,
        onToggle: (st) => (active = st.isActive),
        onUpdate: (st) => {
          device.rotation.y = rot0 + st.progress * ((2 * Math.PI) / 6);
          device.position.y = y0 + st.progress * 0.6;
        },
      });
      const range = { trigger: goods, start: "top bottom-=20%", end: "bottom top+=0%", scrub: true };
      gsap.to(light.position, { x: -0.5, y: -0.5, ease: "none", scrollTrigger: range });
      gsap.to(metal, { envMapIntensity: 3, ease: "none", scrollTrigger: { ...range } });
    }
    const onScroll = ({ velocity }) => active && (spinTo = -velocity * 0.005);
    lenis && lenis.on("scroll", onScroll);

    // The original draws the strip only while it is on screen
    let seen = false;
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      seen && !reduce && served ? video.play().catch(() => {}) : video.pause();
    });
    io.observe(canvas);
    const tick = () => {
      if (!seen) return;
      spin += (spinTo - spin) * 0.1;
      if (!reduce) disk.rotation.y += -0.005 + spin;
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      removeEventListener("resize", size);
      lenis && lenis.off("scroll", onScroll);
      io.disconnect();
      video.pause();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  };
})();
