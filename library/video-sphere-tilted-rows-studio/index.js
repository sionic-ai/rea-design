// First page: video-wrapped sphere (three r163 + OrbitControls), 3-second rotation of Currently Building, swapping the pinned title on the Work row.
// Original values: sphere radius 5 · 64×64 · rotateY(-π/2) · camera z 10, fov 66 (80 under width 768), near 1, far 1000 · rotation each frame x·y += .005 · distance fixed at 10 · wheel is passed on by page scroll
//            · Current work every 3000ms · the title row fires when the photo is 40% visible (IntersectionObserver threshold .4)
(() => {
  const reduced = window.LT ? LT.reduced : matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // ── Video slot: the original wraps a project video as a VideoTexture. We play a placeholder video on canvas with the same playback (loop · continuous flow) ──
  const makeFilm = () => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const g = c.getContext("2d");
    const col = { bg: css("--kf-bg"), ink: css("--kf-ink"), accent: css("--kf-accent"), raised: css("--kf-raised"), soft: css("--kf-accent-soft") };
    const font = css("--kf-font-mark") || css("--kf-font-sans");
    const LOOP = 12; // Length of one loop of the placeholder video (sec)
    const draw = (t) => {
      const p = (t % LOOP) / LOOP;
      g.fillStyle = col.soft;
      g.fillRect(0, 0, 1024, 512);
      // Flowing thick bands — the color order rotates every 4 seconds like a video with scene changes
      const scene = Math.floor(p * 3);
      const order = [col.accent, col.ink, col.raised, col.bg];
      for (let i = 0; i < 9; i++) {
        g.fillStyle = order[(i + scene) % order.length];
        const x = ((i * 140 + p * 1024 * 2) % 1260) - 140;
        g.beginPath();
        g.ellipse(x, 256 + Math.sin(p * Math.PI * 4 + i) * 120, 46, 90, p * Math.PI * 2 + i, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = col.ink;
      g.font = `700 92px ${font}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("VIDEO 0" + (scene + 1), 512 + Math.sin(p * Math.PI * 2) * 180, 256);
    };
    draw(0);
    return { canvas: c, draw };
  };

  const view = document.querySelector(".lt-hero__view");
  if (view && window.THREE) {
    const T = THREE;
    const mobile = innerWidth < 768;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(mobile ? 80 : 66, innerWidth / innerHeight, 1, 1000);
    camera.position.set(0, 0, 10);
    const renderer = new T.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(new T.Color(css("--kf-bg")));
    view.appendChild(renderer.domElement);
    const controls = new T.OrbitControls(camera, renderer.domElement);
    const film = makeFilm();
    const tex = new T.CanvasTexture(film.canvas);
    tex.colorSpace = T.SRGBColorSpace;
    const geo = new T.SphereGeometry(5, 64, 64);
    geo.rotateY(-Math.PI * 0.5);
    const ball = new T.Mesh(geo, new T.MeshBasicMaterial({ map: tex }));
    scene.add(ball);
    // Original: instead of OrbitControls blocking the wheel over the canvas, lower the window by that amount
    renderer.domElement.addEventListener("wheel", (e) => window.scrollBy(0, e.deltaY));
    renderer.compile(scene, camera);
    const start = performance.now();
    const tick = () => {
      if (!reduced) {
        requestAnimationFrame(tick);
        ball.rotation.x += 0.005;
        ball.rotation.y += 0.005;
        film.draw((performance.now() - start) / 1000);
        tex.needsUpdate = true;
      }
      controls.minDistance = 10;
      controls.maxDistance = 10;
      controls.update();
      renderer.render(scene, camera);
    };
    tick();
    addEventListener("resize", () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      if (reduced) renderer.render(scene, camera);
    });
  }

  // ── ”What we’re making now”: switches straight to the next line every 3 seconds (in the original only the text inside the same li changes, so no transition applies) ──
  const now = document.querySelector("[data-now]");
  if (now && !reduced) {
    const lines = ["Your current project here, line 1", "Your current project here, line 2", "Your current project here, line 3", "Your current project here, line 4"];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % lines.length;
      now.textContent = lines[i];
    }, 3000);
  }

  // ── Fixed title row: when the photo is 40% visible, switch to that work’s name · service · place · year ──
  const sticky = document.querySelector(".lt-spots__sticky");
  if (sticky) {
    const set = (a) => {
      sticky.querySelector("[data-spot-title]").innerHTML = a.dataset.title;
      sticky.querySelector("[data-spot-tags]").textContent = a.dataset.tags;
      sticky.querySelector("[data-spot-loc]").textContent = a.dataset.loc;
      sticky.querySelector("[data-spot-year]").textContent = a.dataset.year;
    };
    const arts = [...document.querySelectorAll(".lt-spot")];
    if (arts.length) set(arts[0]);
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && set(e.target)), { threshold: 0.4 });
    arts.forEach((a) => io.observe(a));
  }
})();
