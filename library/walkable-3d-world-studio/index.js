/* Home — story screen and world path, what-we-do word fill and service roll, work card parallax, award group and 3D trophy */
(() => {
  // Original entrance door loader length (from first paint until the screen settles, ms measured by motion-probe)
  Em.gateDur = 2900;
  const reduce = Em.reduce;
  const mm = gsap.matchMedia();

  // ── Story: original orbit — the camera circles once around the particle cloud (original settings) ──
  // Original: center origin, initial camera (5.44, -1.7, 35.66) → radius 36.07 · initial angle 8.7°. Angle at progress r = Starting angle + 2πr, radius shrinks by sin²(πr) down to 60% (85% on phone)
  // Height drops by 5. The look-at point is the five scene slots (r = At 0·¼·½·¾·1, chain [0,0,0]·[0,5,5]·[0,0,0]·[0,5,5]·[0,0,0], and on phone look below cloud 5.
  // Shape changes at r 0.2·0.4·0.7·0.9 : logo → cube → sphere → heart → ring, and in the heart scene the cloud turns -75°. Field of view 50.
  // The last 20% of a section (story block) is the finale — the camera pushes 1.6x toward the clouds, piercing them, and the gaze moves beyond.
  // When moving into this scene: horizontal ×1.184 (hero camera-to-cloud distance 51/43.07), look-at height ×0.7 (cloud height ratio), camera descent ×0.27 of the height above water (so it doesn’t sink into the water)
  const O = [0, 7.37, -18.7], S = 1.184, R = 36.07 * S, A0 = Math.atan2(5.44, 35.66), CLOUD = [0, 10.5, -27];
  const LOOK = [[0, 0, 0], [0, 5, 5], [0, 0, 0], [0, 5, 5], [0, 0, 0]], ROT = [0, 0, 0, -75, 0];
  const FORMS = ["o-logo", "o-cube", "o-sphere", "o-heart", "o-torus"], BREAKS = [0.2, 0.4, 0.7, 0.9];
  const orbit = (q, phone) => {
    const r = Math.min(q, 0.8) / 0.8, tail = Math.max(0, (q - 0.8) / 0.2);
    const sn = Math.sin(r * Math.PI) ** 2, a = A0 + r * Math.PI * 2, rad = R * (1 - (1 - (phone ? 0.85 : 0.6)) * sn);
    let cam = [O[0] + rad * Math.sin(a), 3.0 - 5 * 0.27 * sn, O[2] + rad * Math.cos(a)];
    const f = r * 4, i = Math.min(Math.floor(f), 3), t = f - i, L = (k) => LOOK[i][k] + (LOOK[i + 1][k] - LOOK[i][k]) * t;
    let look = phone ? [CLOUD[0], CLOUD[1] - 5 * 0.7, CLOUD[2]] : [O[0] + L(0) * S, O[1] + L(1) * 0.7, O[2] + L(2) * S];
    if (tail > 0) {
      const d = CLOUD.map((c, k) => c - cam[k]), len = Math.hypot(...d) || 1, w = tail * tail * (3 - 2 * tail);
      look = look.map((l, k) => l + (CLOUD[k] + d[k] * (200 / len) - l) * w);
      cam = cam.map((c, k) => c + d[k] * tail * 1.6);
    }
    let shape = FORMS[0];
    for (let k = BREAKS.length - 1; k >= 0; k--) if (r > BREAKS[k]) { shape = FORMS[k + 1]; break; }
    return { cam, look, at: CLOUD, shape, size: 2 * S, rotY: ((ROT[i] + (ROT[i + 1] - ROT[i]) * t) * Math.PI) / 180 };
  };
  // The article screen uses r rounded to four steps like the original (switches at r 0.125·0.375·0.625·0.875 = Section progress 0.1·0.3·0.5·0.7)
  const story = document.querySelector(".em-story");
  Em.story(story, [
    { sel: ".h1", from: 0, to: 0.1 },
    { sel: ".h2", from: 0.1, to: 0.3 },
    { sel: ".h3", from: 0.3, to: 0.5 },
    { sel: ".h4", from: 0.5, to: 0.7 },
    { sel: ".h5", from: 0.7, to: 1.01 },
  ], orbit);
  if (window.EmWorld?.ready) EmWorld.path(orbit, 50);
  // At story’s end, cover the world with the background color and move to the bright section
  Em.veil(story, "bottom bottom+=1", "bottom top+=10%", 0, 1);

  // ── What We Do: each word darkens with scroll progress ──
  const words = document.querySelector(".wwd__words");
  if (words) {
    words.innerHTML = words.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
    const ws = words.querySelectorAll(".w");
    const wwd = document.querySelector(".wwd");
    mm.add({ desk: "(min-width: 1025px)", phone: "(max-width: 1024px)" }, (c) => {
      ScrollTrigger.create({
        trigger: wwd, start: c.conditions.desk ? "top 80%" : "top 85%", end: c.conditions.desk ? "bottom bottom" : "bottom 60%", scrub: true,
        onUpdate: (st) => { const n = Math.round(st.progress * ws.length * 1.15); ws.forEach((w, i) => w.classList.toggle("is-on", i < n)); },
      });
      gsap.fromTo(".wwd__pill", { scale: 0.9, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: reduce ? 0 : 0.6, ease: "back.out(1.7)", scrollTrigger: { trigger: wwd, start: "top 70%" } });
      gsap.fromTo(".wwd__list", { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.6, ease: "power2.out", scrollTrigger: { trigger: wwd, start: c.conditions.desk ? "top top-=20%" : "top 40%" } });
    });

    // Service list: one step every 1.2s, back.out(1.7) .45s. Of the four visible rows, the bottom one is current and they get fainter going up.
    const reel = document.querySelector(".wwd__reel"), items = [...reel.children], row = 48, VIS = 4;
    items.forEach((li) => reel.appendChild(li.cloneNode(true)));
    const all = [...reel.children];
    let idx = 0, timer = null, inView = false;
    const paint = () => all.forEach((li, i) => {
      const d = idx + VIS - 1 - i;
      li.classList.toggle("is-active", d === 0);
      li.style.opacity = d < 0 || d >= VIS ? 0 : [1, 0.85, 0.6, 0.25][d];
    });
    const step = () => {
      idx++;
      gsap.to(reel, {
        y: -idx * row, duration: reduce ? 0 : 0.45, ease: "back.out(1.7)",
        onComplete: () => { if (idx >= items.length) { idx = 0; gsap.set(reel, { y: 0 }); paint(); } },
      });
      paint();
    };
    paint();
    ScrollTrigger.create({ trigger: ".wwd__list", start: "top bottom", end: "bottom top", onToggle: (st) => { inView = st.isActive; clearInterval(timer); if (inView && !reduce) timer = setInterval(step, 1200); } });
    document.querySelector(".wwd__list").style.setProperty("height", `${row * VIS}px`);
  }

  // ── Work: big title line rises, cards drift at different speeds each ──
  mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".hp__title [data-split]").forEach((el) =>
      gsap.fromTo(Em.lines(el), { yPercent: 105 }, { yPercent: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".hp__title", start: "top 85%" } }),
    );
    document.querySelectorAll(".hp__item").forEach((it) => {
      const d = parseFloat(getComputedStyle(it).getPropertyValue("--drift")) || 0;
      gsap.fromTo(it, { y: 60 * d }, { y: -60 * d, ease: "none", scrollTrigger: { trigger: it, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });

  // ── Awards: while the panel is stuck, the groups darken in turn, and the trophy comes down that line and changes shape ──
  const aw = document.querySelector(".aw");
  const groups = [...document.querySelectorAll(".aw__group")];
  const canvas = document.querySelector(".aw__model");
  let model = null;
  if (canvas && window.exports?.WebGLRenderer) model = awardModel(canvas);
  mm.add("(min-width: 1025px)", () => {
    let cur = -1;
    ScrollTrigger.create({
      trigger: aw, start: "top top", end: "bottom bottom",
      onUpdate: (st) => {
        const i = Math.min(groups.length - 1, Math.floor(st.progress * groups.length));
        if (i === cur) return;
        cur = i;
        groups.forEach((g, k) => g.classList.toggle("is-active", k === i));
        const g = groups[i];
        if (canvas) gsap.to(canvas, { y: g.offsetTop - 40, duration: reduce ? 0 : 0.8, ease: "power3.inOut" });
        model?.shape(i);
      },
    });
    document.querySelectorAll(".aw__title [data-split]").forEach((el) =>
      gsap.fromTo(Em.lines(el), { yPercent: 105 }, { yPercent: 0, duration: reduce ? 0 : 1.1, ease: "expo.out", scrollTrigger: { trigger: aw, start: "top 80%" } }),
    );
  });

  // Plaque: accent-color text (our mark) on a black plate, slowly turning and floating. Per group it becomes plate, coin, cube, ring or pill
  function awardModel(cv) {
    const THREE = window.exports;
    const r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    cam.position.set(0, 0, 9);
    const css = getComputedStyle(document.documentElement);
    const col = (n) => { const p = document.createElement("i"); p.style.color = `var(${n})`; document.body.append(p); const c = getComputedStyle(p).color; p.remove(); const cx = document.createElement("canvas").getContext("2d"); cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return new THREE.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, THREE.SRGBColorSpace); };
    const ink = col("--kf-ink"), acc = col("--kf-accent");
    const tex = (() => {
      const c = document.createElement("canvas"); c.width = 256; c.height = 512;
      const x = c.getContext("2d");
      x.fillStyle = `#${ink.getHexString()}`; /* Not skin: paints the value read from the skin as is */
      x.fillRect(0, 0, 256, 512);
      x.fillStyle = `#${acc.getHexString()}`; /* Not skin: value read from the skin */
      x.font = `200 220px ${css.getPropertyValue("--kf-font-display")}`;
      x.textAlign = "center"; x.textBaseline = "middle";
      x.save(); x.translate(128, 256); x.rotate(-Math.PI / 2); x.fillText("00", 0, 0); x.restore();
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: 0.35, metalness: 0.2 });
    const dark = new THREE.MeshStandardMaterial({ color: ink, roughness: 0.4, metalness: 0.3 });
    const geos = [
      new THREE.BoxGeometry(1.6, 3.2, 0.18),
      new THREE.CylinderGeometry(1.4, 1.4, 0.2, 48).rotateX(Math.PI / 2),
      new THREE.BoxGeometry(1.9, 1.9, 1.9),
      new THREE.TorusGeometry(1.2, 0.32, 24, 64),
      new THREE.CapsuleGeometry(0.7, 1.6, 8, 24),
    ];
    const mesh = new THREE.Mesh(geos[0], [dark, dark, dark, dark, mat, dark]);
    sc.add(mesh);
    sc.add(new THREE.HemisphereLight(acc, ink, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 4, 6); sc.add(key);
    const size = () => { const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    size();
    new ResizeObserver(size).observe(cv);
    let shown = 0;
    const tick = (t) => {
      if (cv.getBoundingClientRect().bottom > 0 && cv.getBoundingClientRect().top < innerHeight) {
        mesh.rotation.y = reduce ? 0.5 : t * 0.6;
        mesh.rotation.z = -0.25 + (reduce ? 0 : Math.sin(t * 0.8) * 0.08);
        mesh.position.y = reduce ? 0 : Math.sin(t * 1.1) * 0.15;
        r.render(sc, cam);
      }
    };
    gsap.ticker.add(tick);
    return {
      shape(i) {
        if (i === shown) return;
        shown = i;
        gsap.to(mesh.scale, {
          x: 0.01, y: 0.01, z: 0.01, duration: reduce ? 0 : 0.3, ease: "power2.in",
          onComplete: () => {
            mesh.geometry = geos[i % geos.length];
            mesh.material = i === 0 ? [dark, dark, dark, dark, mat, dark] : dark;
            gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: reduce ? 0 : 0.6, ease: "back.out(1.7)" });
          },
        });
      },
    };
  }
})();
