// Home scenes: entry lock (a click moves to the philosophy center over 4.5s), pink ring tunnel and rotating text band, a gray donut rising in the philosophy section (ripples when the mouse is near),
// Hide wordmark, typed copy, set up philosophy panel, service cell flip · table of contents, service art bouncy entrance.
// 3D uses basic shapes instead of the original’s GLB, giving the same position, size and camera path (values read from the original scene).
(() => {
  const { reduce, sleep, flatten, scrollToTarget } = window.wSite;
  const hero = document.querySelector(".w-hero");
  const philo = document.querySelector(".w-philo");
  const ticker = document.querySelector(".w-ticker");
  const tap = document.querySelector(".w-tap-enter");
  // The Skin variable may be an oklch(from …) or color-mix expression that THREE can’t read — paint it as text color to compute it, then draw one pixel and convert it to rgb
  const swatch = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const token = (name) => {
    const probe = document.createElement("i");
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    swatch.clearRect(0, 0, 1, 1);
    swatch.fillStyle = getComputedStyle(probe).color;
    probe.remove();
    swatch.fillRect(0, 0, 1, 1);
    const [r, g, b] = swatch.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };
  const initialHash = location.hash;

  // ---------- Entry lock: no scrolling until the hero is clicked (if the URL has a #section, open at once and go there) ----------
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  let entered = false;
  const lock = (on) => {
    document.documentElement.style.overflow = on ? "hidden" : "";
    document.body.style.overflow = on ? "hidden" : "";
    ticker.classList.toggle("is-click", on);
    ticker.classList.toggle("is-scroll", !on);
  };
  const enter = () => {
    if (entered) return false;
    entered = true;
    lock(false);
    hero.classList.add("is-entered");
    hero.classList.add("fx-disc-entered");
    return true;
  };
  addEventListener("w:enter", enter);
  if (initialHash || reduce) enter();
  else { scrollTo(0, 0); lock(true); }
  hero.addEventListener("click", () => {
    if (!enter()) return;
    const r = philo.getBoundingClientRect();
    gsap.to(window, { scrollTo: { y: scrollY + r.top + r.height / 2 - innerHeight / 2, autoKill: false }, duration: 4.5, ease: "power3.inOut" });
  });
  addEventListener("load", () => {
    const target = initialHash && document.querySelector(initialHash);
    if (target && target !== hero) { scrollTo(0, 0); scrollToTarget(target, initialHash === "#philosophy"); }
    else scrollTo(0, 0);
    ScrollTrigger.refresh();
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());

  // The enter disc (”Click to Enter”) is the enter-disc-cursor part — from 2 seconds in it follows over the hero with a .15 lag
  ScrollTrigger.create({ trigger: hero, start: "1% 0%", once: true, onEnter: () => tap.classList.add("is-none") });

  // ---------- Hero text: copy comes in one character at a time after 1.5s (20ms for Japanese slots, English slots .8s later at 25ms) ----------
  const copies = [...hero.querySelectorAll(".w-hero__type")];
  copies.forEach((el) => { el.dataset.text = el.textContent; if (!reduce) el.textContent = ""; });
  const typeInto = async (el, text, speed) => { for (const ch of text) { el.append(ch); await sleep(speed); } };
  if (!reduce) {
    sleep(1500).then(() => Promise.all([
      typeInto(copies[0], copies[0].dataset.text, 20),
      sleep(800).then(() => typeInto(copies[1], copies[1].dataset.text, 25)),
    ]));
  }
  // Once 80% of the hero passes the 80% line of the screen, the wordmark letters drop down at 30ms intervals
  const heroBits = [...hero.querySelectorAll(".w-roll__in"), ...copies];
  let hideCalls = [];
  ScrollTrigger.create({
    trigger: hero,
    start: "80% 80%",
    onEnter: () => {
      hideCalls.forEach((c) => c.kill());
      hideCalls = heroBits.map((el, i) => gsap.delayedCall(i * 0.03, () => el.classList.add("is-none")));
    },
    onLeaveBack: () => {
      hideCalls.forEach((c) => c.kill());
      heroBits.forEach((el) => el.classList.remove("is-none"));
    },
  });

  // ---------- Philosophy ----------
  ScrollTrigger.create({ trigger: philo, start: "40% 50%", onEnter: () => philo.classList.add("is-active"), onLeaveBack: () => philo.classList.remove("is-active") });
  const philoCopy = philo.querySelector(".w-philo__copy .w-philo__type");
  const philoText = philo.querySelector(".w-philo__text .w-philo__type");
  const philoLogo = philo.querySelector(".w-philo__logo");
  const typeParts = async (el, speed) => {
    const parts = flatten(el);
    el.replaceChildren();
    el.style.visibility = "visible";
    for (const p of parts) {
      if (p.br) { el.append(p.br); continue; }
      el.append(p.ch);
      await sleep(speed);
    }
  };
  if (reduce) philoLogo.classList.add("is-active");
  else {
    philoCopy.style.visibility = "hidden";
    philoText.style.visibility = "hidden";
    const io = new IntersectionObserver(async (entries, obs) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      obs.disconnect();
      await typeParts(philoCopy, 90);
      philoLogo.classList.add("is-active");
      await sleep(500);
      await typeParts(philoText, 22);
    }, { rootMargin: "0px 0px -150px 0px" });
    io.observe(philoCopy);
  }

  // ---------- Services ----------
  const svcs = [...document.querySelectorAll(".w-svc")];
  const navItems = [...document.querySelectorAll(".w-service__nav li")];
  const setActive = (id) => navItems.forEach((li) => li.classList.toggle("is-active", li.querySelector("a").getAttribute("href") === `#${id}`));
  svcs.forEach((svc) => {
    ScrollTrigger.create({ trigger: svc, start: "top center", end: "bottom center", onEnter: () => setActive(svc.id), onEnterBack: () => setActive(svc.id) });
  });
  navItems.forEach((li) => {
    const a = li.querySelector("a");
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute("href"));
      // In the original only the header menu is 1.5s power3.inOut, and the service index uses the browser’s default smooth scroll to put the cell at screen center
      if (t) scrollTo({ top: t.getBoundingClientRect().top + scrollY - (innerHeight - t.offsetHeight) / 2, behavior: reduce ? "auto" : "smooth" });
    });
  });

  // Service art (two copies of the original Lottie — once the entrance plays through, swap in the looping copy so it runs endlessly): the entrance runs when it crosses the line 20% from the bottom of the screen.
  //   Lengths come from the original Lottie ip~op / 29.97fps — entrance cow 1.668s · media .4s · character 2.035s · person 1.969s · monogram 1.702s,
  //   Loop per cycle: cow 6.507s · media 11.478s · character 1.969s · person 8.442s · monogram 9.409s. Shaking within a loop has its count set to fit one cycle exactly
  const INTRO = { brand: 1.668, media: 0.4, act: 2.035, digital: 1.969, mark: 1.702 };
  const LOOP = { brand: 6.507, media: 11.478, act: 1.969, digital: 8.442, mark: 9.409 };
  // [target, value, half beat (s), start position (s)] → make it go back and forth a whole number of times within one loop
  const cycle = (period, parts) => {
    const tl = gsap.timeline({ repeat: -1 });
    parts.forEach(([t, vars, half, at = 0]) => {
      if (!t || (t.length === 0)) return;
      const k = Math.max(1, Math.round((period - at) / (2 * half)));
      tl.to(t, { ...vars, duration: (period - at) / (2 * k), yoyo: true, repeat: 2 * k - 1 }, at);
    });
    tl.set({}, {}, period);
    return tl;
  };
  const idle = {
    brand: (s, P) => cycle(P, [[s.querySelector(".w-art__tail"), { rotate: 14, ease: "sine.inOut" }, 0.9], [s.querySelector(".w-art__head"), { rotate: -4, ease: "sine.inOut" }, 1.6]]),
    media: (s, P) => cycle(P, [
      ...[...s.querySelectorAll(".w-art__card")].map((c, i) => [c, { y: -12, ease: "sine.inOut" }, 1.4, i * 0.25]),
      [s.querySelector(".w-art__phone"), { rotate: 6, ease: "sine.inOut" }, 1.2],
      [s.querySelector(".w-art__hand"), { y: 14, ease: "sine.inOut" }, 1],
    ]),
    act: (s, P) => cycle(P, [[s.querySelector(".w-art__blob"), { scaleY: 0.97, scaleX: 1.02, ease: "sine.inOut" }, 0.8], [s.querySelector(".w-art__heart"), { scale: 1.12, ease: "power2.out" }, 0.6], [s.querySelector(".w-art__bang"), { rotate: 10, ease: "sine.inOut" }, 0.3]]),
    digital: (s, P) => cycle(P, [...s.querySelectorAll(".w-art__walker")].map((w, i) => [w, { y: -10, x: 6, ease: "sine.inOut" }, 0.5, i * 0.2])),
    mark: (s, P) => cycle(P, [...s.querySelectorAll(".w-art__piece")].map((p, i) => [p, { y: -16, ease: "power2.out" }, 1.2, i * 0.12])),
  };
  const arts = [...document.querySelectorAll(".w-svc__art")];
  if (!reduce) {
    arts.forEach((art) => gsap.set(art.querySelectorAll(".w-art__pop > *"), { scale: 0, transformOrigin: "50% 100%" }));
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        obs.unobserve(en.target);
        const art = en.target, key = art.dataset.art, parts = art.querySelectorAll(".w-art__pop > *");
        const L = INTRO[key] ?? 1.2, each = parts.length > 1 ? Math.min(0.12, (L * 0.3) / (parts.length - 1)) : 0;
        gsap.to(parts, {
          scale: 1, duration: L - each * (parts.length - 1), ease: "back.out(2.5)", stagger: each,
          onComplete: () => idle[key]?.(art, LOOP[key] ?? 4),
        });
      });
    }, { rootMargin: "0px 0px -20% 0px", threshold: 0 });
    arts.forEach((a) => io.observe(a));
  }

  // ---------- 3D: ring tunnel · text strip · gray donut ----------
  const canvas = document.querySelector(".w-stage__canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 100);
  const CAM = { pc: { x: 0.04, y: 6.4, z: 14 }, sp: { x: 0.04, y: 6.4, z: 16.1 } };
  const start = matchMedia("(max-width: 768px)").matches ? CAM.sp : CAM.pc;
  camera.position.set(start.x, start.y, start.z);
  const world = new THREE.Group();
  scene.add(world);
  const flat = (color, extra) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color), side: THREE.DoubleSide, ...extra });

  // Four nested rings: face the screen and are placed in depth order, darker the further in. The camera passes through this tunnel
  const ringGeo = new THREE.TorusGeometry(1, 0.25, 32, 128);
  const rings = [0, -7.08, -12.77, -19.51].map((z, i) => {
    const m = new THREE.Mesh(ringGeo, flat(token(`--site-ring-${i + 1}`)));
    m.position.set(0, 6.42, z);
    m.userData.scale = new THREE.Vector3(4.62, 4.63, 4.51);
    m.scale.setScalar(reduce ? 1 : 0).multiply(m.userData.scale);
    world.add(m);
    return m;
  });
  // Original floats the rings (.3 to .9 late) and the text panel (1.2 to 1.5 late) together at the moment the model is fully received — the copy treats the moment all fonts needed to draw the text panel have arrived as that moment
  const introRings = () => rings.forEach((m, i) => gsap.to(m.scale, { ...{ x: m.userData.scale.x, y: m.userData.scale.y, z: m.userData.scale.z }, duration: 1.2, delay: [0.3, 0.5, 0.7, 0.9][i], ease: "back.out(2.5)" }));

  // Letter band: white letters stamped clockwise along a circle on a square panel. One turn in 33s, and each panel turns in a different direction
  const words = [...hero.querySelectorAll(".w-hero__words li")].map((li) => li.textContent.trim());
  const PLANES = [
    { z: 1.33, size: 7.7, dir: -1, delay: 1.5, items: [[2, 0.66, 0.052, 700, -0.6], [3, 0.66, 0.052, 700, 1.6], [4, 0.66, 0.052, 700, 3.7]] },
    { z: 1.98, size: 9.94, dir: 1, delay: 1.4, items: [[0, 0.9, 0.062, 700, -1.2], [1, 0.9, 0.062, 700, 1.9]] },
    { z: -3.79, size: 8.7, dir: 1, delay: 1.3, items: [[5, 0.75, 0.032, 600, -0.9], [6, 0.67, 0.032, 600, -0.9], [7, 0.75, 0.032, 600, 1.4], [8, 0.67, 0.032, 600, 1.4]] },
    { z: -5.53, size: 7.7, dir: -1, delay: 1.2, items: [[9, 0.8, 0.036, 600, 3.1], [10, 0.71, 0.036, 600, 3.1]] },
  ];
  const ringTexture = (items) => {
    const S = 1024;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const g = c.getContext("2d");
    g.fillStyle = token("--site-ring-text");
    g.textAlign = "center";
    g.textBaseline = "middle";
    items.forEach(([w, r, size, weight, at]) => {
      const text = words[w] || "";
      const px = size * S;
      const R = (r * S) / 2;
      g.font = `${weight} ${px}px Poppins, "Noto Sans KR", sans-serif`;
      const widths = [...text].map((ch) => g.measureText(ch).width + px * 0.01);
      let a = at - widths.reduce((s, x) => s + x, 0) / R / 2;
      [...text].forEach((ch, i) => {
        a += widths[i] / R / 2;
        g.save();
        g.translate(S / 2 + R * Math.sin(a), S / 2 - R * Math.cos(a));
        g.rotate(a);
        g.fillText(ch, 0, 0);
        g.restore();
        a += widths[i] / R / 2;
      });
    });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  const planeGeo = new THREE.PlaneGeometry(1, 1);
  const planes = [];
  document.fonts.load('700 40px Poppins').then(() => document.fonts.ready).then(() => {
    if (!reduce) introRings();
    PLANES.forEach((p) => {
      const mat = flat(new THREE.Color(1, 1, 1), { map: ringTexture(p.items), transparent: true, depthWrite: false, opacity: reduce ? 1 : 0 });
      const m = new THREE.Mesh(planeGeo, mat);
      m.position.set(0, 6.42, p.z);
      m.scale.setScalar(p.size * (reduce ? 1 : 0.8));
      m.userData = p;
      world.add(m);
      planes.push(m);
      if (!reduce) {
        gsap.to(m.scale, { x: p.size, y: p.size, z: p.size, duration: 1.4, delay: p.delay, ease: "power2.out" });
        gsap.to(mat, { opacity: 1, duration: 1, delay: p.delay, ease: "power2.out" });
      }
    });
  });

  // 13 gray donuts: each spawns at its set time at the floor (y -22), curves sideways and flips as it floats up (8.3s), then shrinks to 0 and vanishes. The original animation runs at 0.5x speed so it actually takes twice as long
  const TORI = [
    [0.04, 8.33, 1, 2.88, [0.34, -0.22, -0.49], 0.24, 0.45], [1.58, 9.88, 1, 2.88, [0.34, -0.22, -0.49], 0.21, 0.45],
    [0.88, 9.17, 0.6, 2.88, [0.11, -0.83, -0.54], 0.2, 0.95], [2.04, 10.33, 0.6, 2.88, [0.11, -0.83, -0.54], 0.24, 0.95],
    [4.21, 12.5, 1, 2.88, [0.34, -0.22, -0.49], 0.24, 0.45], [2.04, 10.33, 0.6, 2.88, [0.11, -0.83, -0.54], 0.12, 0.95],
    [3.04, 11.33, 1, 2.88, [0.34, -0.22, -0.49], 0.24, 0.45], [7.42, 15.71, 1, 2.88, [0.34, -0.22, -0.49], 0.23, 0.45],
    [5.75, 14.04, 0.6, 2.88, [0.11, -0.83, -0.54], 0.26, 0.95], [7.83, 16.13, 0.6, 2.88, [0.11, -0.83, -0.54], 0.25, 0.95],
    [1.58, 9.88, 0.5, 0.66, [-0.74, 0.47, -0.26], 0.21, 0.8], [2.71, 11, 0.5, 0.66, [0.11, -0.39, -0.88], 0.24, 0.8],
    [5.38, 13.67, 0.6, 0.4, [0.71, 0.45, 0.29], 0.26, 0.8],
  ];
  const LIFE = 8.29;
  const ghost = flat(token("--site-ring-ghost"));
  const smooth = (t) => t * t * (3 - 2 * t);
  const tori = TORI.map(([from, until, peak, swing, axis, tube, spin]) => {
    const geo = new THREE.TorusGeometry(1.04, tube, 16, 64);
    geo.rotateX(Math.PI / 2);
    const box = new THREE.Mesh(geo, ghost);
    const motion = new THREE.Group();
    const purun = new THREE.Group();
    const spinner = new THREE.Group();
    motion.add(purun);
    purun.add(spinner);
    spinner.add(box);
    world.add(motion);
    box.scale.setScalar(0);
    return {
      from, until, peak, swing, spin, box, motion, purun, spinner, cycle: -1,
      axis: new THREE.Vector3(...axis).normalize(),
      v: { rx: 0, ry: 0, rz: 0, y: 0, sx: 0, sy: 0, sz: 0, spx: 0, spy: 0, spz: 0, slide: 0 },
    };
  });
  const resetTorus = (t) => {
    t.purun.position.set(0, 0, 0);
    t.purun.rotation.set(0, 0, 0);
    t.purun.scale.set(1, 1, 1);
    t.spinner.rotation.set(0, 0, 0);
    Object.keys(t.v).forEach((k) => { t.v[k] = 0; });
  };
  const placeTorus = (t, clock) => {
    const cycle = Math.floor(clock / t.until);
    if (cycle !== t.cycle) { t.cycle = cycle; resetTorus(t); }
    const local = clock - cycle * t.until;
    const p = Math.min(1, Math.max(0, (local - t.from) / LIFE));
    const tri = 1 - Math.abs(2 * p - 1);
    t.motion.position.set(-0.33 + t.swing * smooth(tri), -22 + 20 * smooth(p), -39.77);
    t.box.scale.setScalar(local < t.from ? 0 : t.peak * tri);
    t.box.quaternion.setFromAxisAngle(t.axis, Math.PI * 2 * t.spin * smooth(p));
  };

  // Donuts within 180px of the mouse tilt and float slightly with a spring, and spin and slide by the mouse speed
  const mouse = { x: 0, y: 0, active: false, vx: 0, vy: 0, px: null, py: null };
  addEventListener("pointermove", (e) => {
    if (mouse.px === null) { mouse.px = e.clientX; mouse.py = e.clientY; }
    mouse.vx = e.clientX - mouse.px;
    mouse.vy = e.clientY - mouse.py;
    mouse.x = mouse.px = e.clientX;
    mouse.y = mouse.py = e.clientY;
    mouse.active = true;
  }, { passive: true });
  const calm = () => { mouse.active = false; mouse.vx = mouse.vy = 0; };
  document.addEventListener("mouseleave", calm);
  addEventListener("blur", calm);
  const MAG = { radius: 180, rot: THREE.MathUtils.degToRad(10), move: 0.18, scale: 0.02, spring: 0.02, damping: 0.82, spinPower: 0.0018, spinDamping: 0.94, maxSpin: 0.08, slidePower: 0.0008, maxSlide: 0.018 };
  const clamp = THREE.MathUtils.clamp;
  const tmp = new THREE.Vector3();
  const magnet = () => {
    tori.forEach((t) => {
      const v = t.v;
      const target = { rx: 0, ry: 0, rz: 0, y: 0, sx: 1, sy: 1, sz: 1 };
      if (mouse.active) {
        t.box.getWorldPosition(tmp).project(camera);
        let dx = mouse.x - (tmp.x + 1) * innerWidth / 2;
        let dy = mouse.y - (1 - tmp.y) * innerHeight / 2;
        const dist = Math.hypot(dx, dy);
        if (dist < MAG.radius) {
          const k = 1 - dist / MAG.radius;
          const s = k * k * (3 - 2 * k);
          if (dist > 0.001) { dx /= dist; dy /= dist; }
          Object.assign(target, {
            rx: dy * MAG.rot * s, ry: dx * MAG.rot * s, rz: -dx * MAG.rot * 0.35 * s, y: MAG.move * s,
            sx: 1 + MAG.scale * s, sy: 1 - MAG.scale * 0.55 * s, sz: 1 + MAG.scale * s,
          });
          v.spy = clamp(v.spy + mouse.vx * MAG.spinPower * s, -MAG.maxSpin, MAG.maxSpin);
          v.spx = clamp(v.spx + mouse.vy * MAG.spinPower * s, -MAG.maxSpin, MAG.maxSpin);
          v.spz = clamp(v.spz + (mouse.vx - mouse.vy) * MAG.spinPower * 0.15 * s, -MAG.maxSpin * 0.4, MAG.maxSpin * 0.4);
          v.slide = clamp(v.slide + mouse.vx * MAG.slidePower * s, -MAG.maxSlide, MAG.maxSlide);
        }
      }
      const P = t.purun;
      const step = (key, cur, goal) => { v[key] = (v[key] + (goal - cur) * MAG.spring) * MAG.damping; return cur + v[key]; };
      P.rotation.x = step("rx", P.rotation.x, target.rx);
      P.rotation.y = step("ry", P.rotation.y, target.ry);
      P.rotation.z = step("rz", P.rotation.z, target.rz);
      P.position.y = step("y", P.position.y, target.y);
      P.position.x += v.slide;
      P.scale.x = step("sx", P.scale.x, target.sx);
      P.scale.y = step("sy", P.scale.y, target.sy);
      P.scale.z = step("sz", P.scale.z, target.sz);
      t.spinner.rotation.x = (t.spinner.rotation.x + v.spx) % (Math.PI * 2);
      t.spinner.rotation.y = (t.spinner.rotation.y + v.spy) % (Math.PI * 2);
      t.spinner.rotation.z = (t.spinner.rotation.z + v.spz) % (Math.PI * 2);
      v.spx *= MAG.spinDamping;
      v.spy *= MAG.spinDamping;
      v.spz *= MAG.spinDamping;
    });
    mouse.vx *= 0.72;
    mouse.vy *= 0.72;
  };

  // Camera: over twice the Hero height it moves 40 forward on z (punching through the ring) → in the philosophy section it descends 28 while tilting down 20° → over the last 1/5.5 of the page the whole scene goes to .75
  const mm = gsap.matchMedia();
  mm.add({ sp: "(max-width: 768px)", pc: "(min-width: 769px)" }, (ctx) => {
    const c = ctx.conditions.sp ? CAM.sp : CAM.pc;
    camera.position.set(c.x, c.y, c.z);
    camera.rotation.set(0, 0, 0);
    gsap.fromTo(camera.position, { z: c.z }, { z: c.z - 40, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5, invalidateOnRefresh: true } });
    gsap.fromTo(camera.position, { y: c.y }, { y: c.y - 28, ease: "none", immediateRender: false, scrollTrigger: { trigger: philo, start: "top 100%", end: "100% 50%", scrub: 0.3, invalidateOnRefresh: true } });
    gsap.fromTo(camera.rotation, { x: 0 }, { x: THREE.MathUtils.degToRad(-20), ease: "none", scrollTrigger: { trigger: philo, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
  });
  gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".w-main", start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true } })
    .to(world.scale, { x: 0.75, y: 0.75, z: 0.75, duration: 1 }, 4.5);

  // Giant background title: shifts left 15% while passing through the philosophy section
  gsap.fromTo(".w-philo__bg-txt", { xPercent: 0 }, { xPercent: -15, ease: "none", scrollTrigger: { trigger: philo, start: "0 100%", end: "100% 0%", scrub: 1 } });

  // Service cell: at the 90% line of the screen it is tilted back -10° around its bottom edge and goes .85 → upright, then tips over to 20° and vanishes by the 10% line
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    svcs.forEach((svc) => {
      gsap.timeline({ scrollTrigger: { trigger: svc, start: "top 90%", end: "bottom 10%", scrub: 0.2, invalidateOnRefresh: true } })
        .fromTo(svc, { opacity: 0, scale: 0.85, rotateX: -10, transformPerspective: 800, transformOrigin: "center bottom" }, { opacity: 1, scale: 1, rotateX: 0, ease: "none" })
        .to(svc, { opacity: 0, scale: 0.9, rotateX: 20, ease: "none" });
    });
  });

  const resize = () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  };
  addEventListener("resize", resize);

  const t0 = performance.now();
  gsap.ticker.add(() => {
    const clock = ((performance.now() - t0) / 1000) * 0.5;
    if (!reduce) {
      planes.forEach((m) => { m.rotation.z = m.userData.dir * clock * (Math.PI * 2 / 16.67); });
      tori.forEach((t) => placeTorus(t, clock));
      magnet();
    }
    renderer.render(scene, camera);
  });
})();
