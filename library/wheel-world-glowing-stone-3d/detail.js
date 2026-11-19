// Detail: like a stone breaking, paper pieces burst from the center and drift around, and the stone-shaped video panel ripples and flattens into a rectangle.
// Project comes from the address ?p= Is chosen with this — the tone, title and prev/next change accordingly.
(() => {
  const T = THREE;
  const idx = GC.projectFromUrl();
  const P = GC.PROJECTS[idx];
  const N = GC.PROJECTS.length;
  const world = GC.world({ canvas: document.querySelector(".gc-gl"), layout: "detail", project: idx });
  world.uniforms.uDim.value = .8;

  const title = document.querySelector(".gc-title");
  title.children[0].textContent = P.name[0];
  title.children[1].textContent = P.name[1];
  document.querySelector(".gc-step--prev").href = `detail.html?p=${(idx + N - 1) % N}`;
  document.querySelector(".gc-step--next").href = `detail.html?p=${(idx + 1) % N}`;

  // ── Video panel: builds a stone outline and a square perimeter from the same number (72) of points and morphs between them ──
  const media = document.querySelector(".gc-media");
  const PTS = 72;
  const m = { k: 0, amp: 3 };
  const stonePt = (s) => {
    const a = -Math.PI / 2 + s * Math.PI * 2;
    const c = Math.cos(a), si = Math.sin(a);
    const e = 2 / 2.3;
    const wob = 1 + .04 * Math.sin(3 * a + .7) + .03 * Math.sin(5 * a + 2);
    const rx = 20.5 * (1 + .1 * si) * wob;
    return [50 + rx * Math.sign(c) * Math.abs(c) ** e, 50 + 50 * wob * Math.sign(si) * Math.abs(si) ** e];
  };
  const rectPt = (s, el) => {
    const w = el.clientWidth, h = el.clientHeight * .92;
    const per = 2 * (w + h);
    let d = (s * per + w / 2) % per;
    let x, y;
    if (d < w) { x = d; y = 0; } else if ((d -= w) < h) { x = w; y = d; } else if ((d -= h) < w) { x = w - d; y = h; } else { d -= w; x = 0; y = h - d; }
    return [(x / w) * 100, 4 + (y / el.clientHeight) * 100];
  };
  const shape = (t) => {
    const pts = [];
    for (let i = 0; i < PTS; i++) {
      const s = i / PTS;
      const [ax, ay] = stonePt(s);
      const [bx, by] = rectPt(s, media);
      const wave = m.amp * Math.sin(s * Math.PI * 2 * 6 + t * 1.2) * (.4 + .6 * Math.sin(m.k * Math.PI) + .2);
      const x = ax + (bx - ax) * m.k;
      const y = ay + (by - ay) * m.k + wave * .5;
      pts.push(`${(x + wave * .3).toFixed(2)}% ${y.toFixed(2)}%`);
    }
    media.style.clipPath = `polygon(${pts.join(",")})`;
  };

  // ── Paper pieces: a curved sheet cut out with five edges, front in the project color, back darkened ──
  const sc = document.querySelector(".gc-shards");
  const r2 = new T.WebGLRenderer({ canvas: sc, antialias: true, alpha: true });
  r2.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  r2.setClearColor(0x000000, 0);
  const s2 = new T.Scene();
  const cam = new T.PerspectiveCamera(35, 1, .1, 100);
  cam.position.set(0, 0, 10);
  const group = new T.Group();
  s2.add(group);
  const tint = new T.Color(...P.color);
  const front = tint.clone().lerp(new T.Color(1, .86, .74), .55).multiplyScalar(.85);
  const back = tint.clone().multiplyScalar(.22).add(new T.Color(.06, .03, .02));
  const geo = new T.PlaneGeometry(1, 1, 14, 14);
  const VS = `
    uniform float uCurl, uCup, uTwist; varying vec2 vP; varying vec3 vN;
    void main(){
      vec3 p = position;
      // Piece curved concavely in two directions like a shell
      p.z += uCurl * p.x * p.x + uCup * p.y * p.y + uTwist * p.x * p.y;
      vec3 n = normalize(vec3(-(2. * uCurl * p.x + uTwist * p.y), -(2. * uCup * p.y + uTwist * p.x), 1.));
      vP = position.xy; vN = normalize(normalMatrix * n);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
    }`;
  const FS = `
    uniform vec3 uFront, uBack; uniform float uCut[5]; uniform float uAng[5]; varying vec2 vP; varying vec3 vN;
    void main(){
      for (int i = 0; i < 5; i++) { if (dot(vP, vec2(cos(uAng[i]), sin(uAng[i]))) > uCut[i]) discard; }
      vec3 n = gl_FrontFacing ? vN : -vN;
      float l = .25 + .9 * max(dot(n, normalize(vec3(-.45, .65, .6))), 0.);
      vec3 c = gl_FrontFacing ? uFront : uBack;
      c *= .75 + .5 * (vP.y + .5);
      gl_FragColor = vec4(c * l, 1.);
    }`;
  const rand = (a, b) => a + Math.random() * (b - a);
  const COUNT = 13;
  const shards = Array.from({ length: COUNT }, (_, i) => {
    const ang0 = rand(0, Math.PI * 2);
    const mat = new T.ShaderMaterial({
      uniforms: {
        uCurl: { value: rand(1.2, 2.4) * (Math.random() < .5 ? -1 : 1) }, uCup: { value: rand(.6, 1.6) }, uTwist: { value: rand(-.6, .6) },
        uFront: { value: front }, uBack: { value: back },
        uCut: { value: Array.from({ length: 5 }, () => rand(.28, .5)) },
        uAng: { value: Array.from({ length: 5 }, (_, k) => ang0 + k * 1.2566 + rand(-.3, .3)) },
      },
      vertexShader: VS, fragmentShader: FS, side: T.DoubleSide,
    });
    const mesh = new T.Mesh(geo, mat);
    const a = (i / COUNT) * Math.PI * 2 + rand(-.15, .15);
    const home = new T.Vector3(Math.cos(a) * rand(3.8, 5.8), Math.sin(a) * rand(2.2, 3.5), rand(-2, 1.5));
    mesh.scale.setScalar(rand(1.1, 2.1));
    mesh.rotation.set(rand(0, 6.3), rand(0, 6.3), rand(0, 6.3));
    group.add(mesh);
    return { mesh, home, spin: new T.Vector3(rand(-.3, .3), rand(-.3, .3), rand(-.2, .2)), bob: rand(0, 6.3) };
  });
  const burst = { k: 0 };
  const resize = () => {
    r2.setSize(innerWidth, innerHeight, false);
    cam.aspect = innerWidth / innerHeight;
    cam.fov = cam.aspect < .8 ? 35 + Math.min(10, ((.8 - cam.aspect) / .34) * 10) : 35;
    cam.updateProjectionMatrix();
  };
  addEventListener("resize", resize);
  resize();

  gsap.ticker.add((t) => {
    world.tick(t);
    world.render();
    shape(t);
    // Bursts out from the center (the stone spot) back to its place — then drifts slowly up and down while spinning
    const k = burst.k;
    shards.forEach((s) => {
      const p = s.mesh.position;
      p.set(s.home.x * k, s.home.y * k + Math.sin(t * .6 + s.bob) * .12, s.home.z * k);
      s.mesh.rotation.x += s.spin.x * .01 + (1 - k) * .04;
      s.mesh.rotation.y += s.spin.y * .01 + (1 - k) * .05;
      s.mesh.rotation.z += s.spin.z * .01;
    });
    // In the original, pieces share one scene with the landscape and so ride the camera that turns toward the cursor. Turn the piece camera by the same angle.
    cam.position.set(Math.sin(world.orbit) * 10, 0, Math.cos(world.orbit) * 10);
    cam.lookAt(0, 0, 0);
    cam.rotateZ(world.roll);
    r2.render(s2, cam);
    // The video panel is also a panel within one scene in the original, so it tilts together — rotates the panel the opposite way with the same perspective as the camera distance (35° FOV)
    if (world.orbit || world.roll) media.style.transform = `perspective(${(innerHeight / 2 / Math.tan((35 * Math.PI) / 360)).toFixed(0)}px) rotateZ(${world.roll.toFixed(4)}rad) rotateY(${(-world.orbit).toFixed(4)}rad)`;
  });

  const sheet = document.querySelector(".gc-sheet");
  const steps = document.querySelectorAll(".gc-step");
  GC.pixels.reveal(.8);
  document.body.classList.add("is-ui");
  if (GC.reduced) {
    m.k = 1; m.amp = .6; burst.k = 1;
  } else {
    gsap.timeline({ delay: .15 })
      .to(burst, { k: 1, duration: 1.6, ease: "expo.out" }, 0)
      .to(m, { k: 1, duration: 1.4, ease: "power3.inOut" }, .2)
      .to(m, { amp: .6, duration: .8, ease: "power2.out" }, 1.2);
  }
  sheet.classList.add("is-visible");
  steps.forEach((s) => s.classList.add("is-visible"));
})();
