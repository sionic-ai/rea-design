/* About company — header panel, year ring (digits roll over in 1s each year, the wavy ring breathes, surrounding dots light up), team stage, helper card stack */
TB.page("about", (S, root) => {
  const { T, renderer, environment, lights, board, fit, loop, css } = window.TB3D || {};
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ss = (t) => t * t * (3 - 2 * t);
  const YEARS = ["2007", "2012", "2015", "2018", "2020", "2023"];

  S.ready(() => root.querySelectorAll(".tb-in").forEach((el) => gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 1.2, delay: reduce ? 0 : +(el.dataset.delay || 0), ease: "power2.out" })));

  const mouse = { x: 0, tx: 0, y: 0, ty: 0 };
  if (fine && !reduce) S.on(window, "pointermove", (e) => { mouse.tx = (e.clientX / innerWidth) * 2 - 1; mouse.ty = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });

  // ── Header — sections stacked at 260dvh, while the folded ironing board flies in, spins and drops out, four number panels rise from below and the light fills in ──
  const hero = root.querySelector(".ta-hero"), hstage = hero.querySelector(".ta-hero__stage"), hsettle = hero.querySelector(".ta-hero__settle"), hp = { p: reduce ? 0.7 : 0 };
  if (!reduce) ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom bottom", scrub: true, onUpdate: (s) => {
    hp.p = s.progress; hstage.style.setProperty("--fx-reveal", (0.08 + 0.92 * ss(cl((s.progress - 0.15) / 0.5))).toFixed(3)); hstage.style.setProperty("--fx-exit", (0.4 * ss(cl((s.progress - 0.45) / 0.4))).toFixed(3)); hsettle.style.opacity = ss(cl((s.progress - 0.4) / 0.4)).toFixed(3);
  } });
  else hstage.style.setProperty("--fx-reveal", "0.8");
  // Same stage as the original About Board — the camera goes (0,1.4,7.8)→(0,-.2,0) (farther and wider on narrow screens), the folded ironing board flies in from bottom left spinning once over 1.8s and lands,
  // Spins 1.25 turns along the long axis throughout the scroll, then exits to the upper right from .3 to 1 (position on the path is progress cubed). The four number panels are panels attached to the camera,
  // In the screen center 2×2 (phone 1×4, 24·12px gaps) they rise from 14 below with .06 offsets, rotating X 1.15π · Z ±.5 (.06~.8, cubic ease-out)
  const ASPECT = 16 / 9;
  const near = () => (innerWidth >= 768 ? 1 : 1 + 0.2 * Math.min(1, (768 - innerWidth) / 288));
  const fovOf = () => { const a = innerWidth / innerHeight; return a >= ASPECT ? 36 : 36 + 10 * Math.min(1, (ASPECT - a) / ASPECT); };
  const reach = () => { const a = innerWidth / innerHeight; return a >= ASPECT ? 1 : Math.pow(ASPECT / a, innerWidth >= 768 ? 0.3 : 0.3 + 0.1 * Math.min(1, (768 - innerWidth) / 288)) / near(); };
  if (T) {
    const cv = root.querySelector(".ta-hero__canvas"), r = renderer(cv), scene = new T.Scene(), cam = new T.PerspectiveCamera(36, 1, 0.1, 60);
    environment(r, scene); const Lg = lights(scene); Lg.glow.position.set(-0.29, -2.5, -1.21);
    const b = board(); b.fold(1);
    const pose = new T.Group(); pose.add(b.group); pose.rotation.set(13.49, -2.662, 0); pose.scale.setScalar(1.15); scene.add(pose);
    const exitPath = new T.CatmullRomCurve3([[0, 0], [4.564, 2.52], [7.335, 4.05], [10.106, 5.58], [16.3, 9]].map(([x, y]) => new T.Vector3(x, y, 0)), false, "centripetal");
    const eyeBase = new T.Vector3(0, 1.4, 7.8), aim = new T.Vector3(0, -0.2, 0), eye = new T.Vector3(), off = new T.Vector3();
    scene.add(cam);
    const deck = new T.Group(); cam.add(deck);
    const STATS = [["00+", ["Your figure explained here", "Note it in two lines"], true], ["00yrs", ["Your figure explained here", "Note it in two lines"], false], ["000+", ["Your figure explained here", "Note it in two lines"], false], ["A.B.", ["Your figure explained here", "Note it in two lines"], false]];
    const cardAspect = () => {
      if (innerWidth >= 768) return (326 / 534) * (1.01 / 1.02);
      if (innerWidth >= 640) return 0.52;
      const tall = innerHeight / innerWidth < 2;
      return Math.min(0.52, Math.max(0.34, (Math.min(innerHeight * (tall ? 0.86 : 0.92), innerHeight - 144) - 36) / 4 / (0.98 * innerWidth - 48)));
    };
    // Panel face — big number (5rem, phone 3rem) at top left, two lines of explanation (1.5rem, thin weight, phone 1.25rem) at bottom right. The on-screen text size stays the same whatever the panel width
    const paint = (c, [num, cap, green], px) => {
      const w = c.width, h = c.height, x = c.getContext("2d"), k = w / 534, o = 534 / (px || 534), wide = innerWidth >= 768, rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const big = (wide ? 5 : 3) * rem * o * k, small = (wide ? 1.5 : 1.25) * rem * o * k, pad = Math.round(40 * k), rad = 8 * (w / (px || 534));
      x.clearRect(0, 0, w, h); x.save(); x.beginPath(); x.roundRect(0, 0, w, h, rad); x.clip();
      if (green) {
        const a = (105 * Math.PI) / 180, sx = Math.sin(a), sy = -Math.cos(a), len = Math.abs(w * sx) + Math.abs(h * sy);
        const g = x.createLinearGradient(w / 2 - (sx * len) / 2, h / 2 - (sy * len) / 2, w / 2 + (sx * len) / 2, h / 2 + (sy * len) / 2);
        g.addColorStop(0.1177, css("--kf-accent-soft", "green")); g.addColorStop(0.8869, css("--kf-accent", "green")); x.fillStyle = g;
      } else x.fillStyle = css("--kf-contrast-bg", "white");
      x.fillRect(0, 0, w, h);
      const face = css("--kf-font-display", "sans-serif");
      x.fillStyle = css("--kf-contrast-ink", "black"); x.textAlign = "left"; x.textBaseline = "alphabetic";
      x.font = `400 ${big}px ${face}`; x.letterSpacing = `${-0.06 * big}px`;
      x.fillText(num, pad, pad + big * 0.75 + (big * (wide ? 1.05 : 1) - big) * 0.5);
      x.textAlign = "right"; x.textBaseline = "bottom"; x.font = `300 ${small}px ${face}`; x.letterSpacing = `${-0.04 * small}px`;
      cap.forEach((line, i) => x.fillText(line, w - pad, h - pad - (cap.length - 1 - i) * small * 1.25));
      x.restore(); x.letterSpacing = "0px";
    };
    const cards = STATS.map((stat, i) => {
      const c = document.createElement("canvas"), tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = T.LinearFilter;
      const m = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: tex, transparent: true, side: T.DoubleSide, toneMapped: false, depthTest: false }));
      m.renderOrder = 10 + i; deck.add(m); return { m, c, tex, stat, home: new T.Vector3() };
    });
    const DIST = 5.2;
    let cardPx = 0;
    const layout = () => {
      const halfH = Math.tan((cam.fov * Math.PI) / 360) * DIST, halfW = halfH * cam.aspect, perPx = innerHeight / (2 * halfH), toU = (px) => px / perPx;
      const phone = innerWidth < 768, tablet = innerWidth >= 768 && innerWidth < 1200, cols = phone ? 1 : 2, rows = phone ? 4 : 2, gap = toU(phone ? 12 : 24), k = cardAspect();
      const side = phone ? toU(24) : tablet ? 1.5 * gap : 0, fw = phone || tablet ? 0.98 : innerWidth >= 1440 ? 0.97 : 0.98, fh = phone ? (innerHeight / innerWidth < 2 ? 0.86 : 0.92) : tablet ? 0.92 : 0.97;
      const byW = (2 * halfW * fw - 2 * side - (cols - 1) * gap) / cols, byH = (2 * halfH * fh - (rows - 1) * gap) / rows / k, cap = phone ? Infinity : toU((tablet ? 0.4743 : 0.5825) * innerHeight);
      const cw = 1.02 * Math.min(byW, byH, cap), ch = cw * k, gw = cols * cw + (cols - 1) * gap, gh = rows * ch + (rows - 1) * gap;
      cardPx = cw * perPx;
      cards.forEach((card, i) => {
        card.m.scale.set(cw, ch, 1);
        card.home.set(-0.5 * gw + 0.5 * cw + (i % cols) * (cw + gap), 0.5 * gh - 0.5 * ch - Math.floor(i / cols) * (ch + gap), -DIST);
        const W = 1024, H = Math.round(1024 * k);
        if (card.c.width !== W || card.c.height !== H || card.px !== Math.round(cardPx)) { card.c.width = W; card.c.height = H; card.px = Math.round(cardPx); paint(card.c, card.stat, cardPx); card.tex.needsUpdate = true; }
      });
    };
    let far = reach();
    const size = () => { fit(r, cam, cv); far = reach(); cam.fov = fovOf(); eye.subVectors(eyeBase, aim).multiplyScalar(far).add(aim); cam.position.copy(eye); cam.lookAt(aim); cam.updateProjectionMatrix(); layout(); };
    size(); S.on(window, "resize", size);
    document.fonts?.ready.then(() => S.alive && cards.forEach((card) => { paint(card.c, card.stat, cardPx); card.tex.needsUpdate = true; }));
    let born = -1;
    S.ready(() => (born = performance.now() / 1000));
    const io3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), out3 = (t) => 1 - Math.pow(1 - t, 3);
    const spot = new T.Vector3(), orbit = { x: 0, y: 0 };
    loop(cv, (dt, t) => {
      const p = hp.p, o = born < 0 ? 0 : t - born, m = reduce ? 1 : born < 0 ? 0 : io3(Math.min(1, o / 1.8)), f = reduce ? 0 : cl((p - 0.3) / 0.7);
      exitPath.getPointAt(f * f * f, spot).multiplyScalar(far);
      pose.position.set(lerp(-8.5 * far, -0.15, m) + spot.x + 0.28 * m, lerp(-4.15 * far, -0.6, m) + (reduce ? 0 : 0.022 * Math.sin(0.65 * o)) * (1 - f) + spot.y, spot.z);
      b.group.rotation.x = -(1 - m) * Math.PI * 2 + p * 1.25 * Math.PI * 2;
      pose.visible = f < 1;
      // The camera turns toward the cursor — .16 horizontal, .1rad vertical, following by .06 each step. It is 0 on the first screen and grows over the first 18% of scroll (cubic ease-in).
      const lean = 1 - Math.pow(1 - cl(p / 0.18), 3);
      orbit.x += (0.16 * mouse.tx * lean - orbit.x) * 0.06; orbit.y += (-0.1 * mouse.ty * lean - orbit.y) * 0.06;
      off.subVectors(eye, aim); const len = off.length(), yaw = Math.atan2(off.x, off.z) + orbit.x, pitch = Math.max(-1.3, Math.min(1.3, Math.asin(off.y / len) + orbit.y));
      cam.position.set(aim.x + len * Math.cos(pitch) * Math.sin(yaw), aim.y + len * Math.sin(pitch), aim.z + len * Math.cos(pitch) * Math.cos(yaw)); cam.lookAt(aim);
      deck.visible = p > 0.03;
      cards.forEach((card, i) => {
        const from = 0.06 + i * 0.06, q = reduce ? 1 : cl((p - from) / Math.max(0.001, 0.8 - from)), e = out3(q);
        card.m.position.set(card.home.x, card.home.y - (1 - e) * 14, card.home.z);
        card.m.rotation.set((1 - e) * 1.15 * Math.PI, 0, (1 - e) * 0.5 * (i % 2 ? -1 : 1));
        card.m.material.opacity = cl(3 * q);
      });
      r.render(scene, cam);
    });
  }
  gsap.to(".ta-hero__in", { autoAlpha: 0, y: -40, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "20% top", scrub: true } });

  // ── Year Ring ──
  const time = root.querySelector(".ta-time"), circ = time.querySelector(".ta-orbit circle");
  const dots = [...time.querySelectorAll(".ta-orbit__dot")], miles = [...time.querySelectorAll(".ta-mile")];
  dots.forEach((d, i) => { const a = -Math.PI / 2 + (i / dots.length) * Math.PI * 2; d.style.left = `${50 + 48 * Math.cos(a)}%`; d.style.top = `${50 + 48 * Math.sin(a)}%`; });
  const setYear = (y) => time.querySelectorAll(".ta-year").forEach((yr) => yr.querySelectorAll(".ta-dig__col").forEach((c, k) => (c.style.transform = `translateY(${-+y[k]}em)`)));
  let cur = -1;
  const step = (i) => {
    if (i === cur) return; const prev = cur; cur = i;
    setYear(YEARS[i]);
    dots.forEach((d, k) => { d.classList.toggle("is-on", k === i); d.classList.toggle("is-past", k < i); });
    if (prev >= 0) gsap.to(miles[prev], { autoAlpha: 0, y: -12, duration: reduce ? 0 : 0.35, ease: "power2.in", overwrite: true });
    gsap.fromTo(miles[i], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.6, delay: reduce || prev < 0 ? 0 : 0.25, ease: "power3.out", overwrite: true });
  };
  step(0);
  ScrollTrigger.create({ trigger: time, start: "top top", end: "bottom bottom", onUpdate: (s) => { step(Math.min(YEARS.length - 1, Math.floor(s.progress * YEARS.length))); circ.style.strokeDashoffset = String(604 * (1 - s.progress)); } });
  // Wave ring — a striped tube ring enters the section lying down (small), stands up to face front, and its surrounding grain changes each year
  const tp2 = { p: 0 };
  ScrollTrigger.create({ trigger: time, start: "top 40%", end: () => `+=${innerHeight * 1.6}`, scrub: true, onUpdate: (s) => (tp2.p = s.progress) });
  if (T) {
    const rc = time.querySelector(".ta-ring"), r = renderer(rc), scene = new T.Scene(), cam = new T.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.set(0, 0, 10.5); cam.lookAt(0, 0, 0);
    const { mesh, uniforms } = TB3D.stripeRing({ scale: 2.05, pipe: 1.1, flat: 0.3, bands: 34 }); scene.add(mesh);
    uniforms.uWob.value = 0.04;
    const size = () => fit(r, cam, rc); size(); S.on(window, "resize", size);
    let seed = 0;
    loop(rc, (dt, t) => {
      const k = reduce ? 1 : ss(tp2.p);
      seed += (Math.max(0, cur) * 1.7 - seed) * 0.05;
      uniforms.uSeed.value = seed; uniforms.uTime.value = reduce ? 0 : t;
      mesh.rotation.set(lerp(Math.PI / 2 * 0.94, 0, k), lerp(0.5, 0, k), reduce ? 0 : t * 0.05);
      mesh.scale.setScalar(lerp(0.32, 1, k) * (innerWidth < 768 ? 0.62 : 1));
      r.render(scene, cam);
    });
  }
  // Year strip — top row flows right, bottom row flows left
  time.querySelectorAll(".ta-yrow").forEach((row) => {
    if (reduce) return;
    const dir = row.classList.contains("ta-yrow--lr") ? 1 : -1, unit = () => row.firstElementChild.offsetWidth;
    gsap.fromTo(row, { x: dir > 0 ? -unit() : 0 }, { x: dir > 0 ? 0 : -unit(), duration: 40, ease: "none", repeat: -1 });
  });

  // ── Team (original About Team Board) — the section is laid out as 4 screens and pinned over the first 2 screens of progress (followed with 1-exp(-8dt)):
  // The ironing board flies in from the bottom left (0~.5, whichever is larger with the previous 1 screen of progress) spinning twice, turns its nose to aim at .5~.85, and flies 11 toward its nose at .62~1.
  // Six role cards slide in from off-screen, alternating left and right by row (half a screen + min(500, .4 screen)), at .45~.88 with a .1 stagger (unchanged on phone) ──
  // The backstage light fills from below over progress .15~.85 (follows by .12 each step)
  const team = root.querySelector(".ta-team"), roles = [...team.querySelectorAll(".ta-role")], tglow = team.querySelector(".ta-team__sticky");
  const tp = { raw: 0, rawIn: 0, p: reduce ? 1 : 0, pin: reduce ? 1 : 0, glow: reduce ? 0.8 : 0, hover: fine && !reduce ? 1 : 0, look: 0 };
  if (!reduce) {
    ScrollTrigger.create({ trigger: team, start: "top top", end: () => `+=${2 * innerHeight}`, invalidateOnRefresh: true, onUpdate: (s) => (tp.raw = s.progress) });
    ScrollTrigger.create({ trigger: team, start: "top top", end: () => `+=${innerHeight}`, invalidateOnRefresh: true, onUpdate: (s) => (tp.rawIn = s.progress) });
  }
  if (fine && !reduce) { team.addEventListener("mouseenter", () => (tp.look = 1)); team.addEventListener("mouseleave", () => (tp.look = 0)); }
  const slide = () => {
    const per = innerWidth >= 1024 ? 3 : innerWidth >= 640 ? 2 : 1, far = Math.min(500, 0.4 * innerWidth);
    roles.forEach((el, i) => {
      if (per === 1) { el.style.transform = el.style.opacity = ""; return; }
      const row = Math.floor(i / per), col = i % per, even = row % 2 === 0, order = even ? per - 1 - col : col;
      const from = 0.45 + order * 0.1, k = cl((tp.p - from) / Math.max(0.001, 0.88 - from));
      el.style.transform = `translate3d(${lerp(even ? -(0.5 * innerWidth + far) : 0.5 * innerWidth + far, 0, k)}px,0,0)`;
      el.style.opacity = String(cl(3 * k));
    });
  };
  S.add(() => roles.forEach((el) => (el.style.transform = el.style.opacity = "")));
  slide();
  if (T) {
    const cv = team.querySelector(".ta-team__canvas"), r = renderer(cv), scene = new T.Scene(), cam = new T.PerspectiveCamera(36, 1, 0.1, 60);
    environment(r, scene); const Lg = lights(scene); Lg.glow.position.set(-0.29, -2.5, -1.21);
    const b = board(); b.fold(1);
    const pose = new T.Group(); pose.add(b.group); scene.add(pose);
    const REST = { rx: 13.49, ry: -2.662, x: 0.1, y: -0.8 }, AIM = { ry: -0.501592653589793, x: 0.7 };
    const far = () => { const a = innerWidth / innerHeight; return ((a >= ASPECT ? 1 : Math.pow(ASPECT / a, 0.3)) * (innerWidth < 1024 ? 1.28 : 1)) / near(); };
    const eyeBase = new T.Vector3(0, 1.4, 7.8), aim = new T.Vector3(0, -0.2, 0), eye = new T.Vector3(), off = new T.Vector3(), nose = new T.Vector3(), turn = new T.Euler();
    let F = far();
    const size = () => { fit(r, cam, cv); F = far(); cam.fov = fovOf(); eye.subVectors(eyeBase, aim).multiplyScalar(F).add(aim); cam.position.copy(eye); cam.lookAt(aim); cam.updateProjectionMatrix(); };
    size(); S.on(window, "resize", size);
    const io3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), orbit = { x: 0, y: 0 };
    loop(cv, (dt, t) => {
      if (!reduce) { const k = 1 - Math.exp(-8 * dt); tp.p += (tp.raw - tp.p) * k; tp.pin += (tp.rawIn - tp.pin) * k; }
      slide();
      tp.glow += ((reduce ? 0.8 : cl((tp.p - 0.15) / 0.7)) - tp.glow) * 0.12; tglow.style.setProperty("--fx-reveal", (tp.glow * tp.glow * (3 - 2 * tp.glow)).toFixed(3));
      const p = tp.p, h = 1 - Math.pow(1 - Math.max(tp.pin, cl(p / 0.5)), 2), f = io3(cl((p - 0.5) / 0.35)), g = Math.pow(cl((p - 0.62) / 0.38), 2);
      const ry = lerp(REST.ry, AIM.ry, f);
      nose.set(-1, 0, 0).applyEuler(turn.set(REST.rx, ry, 0)); const nl = Math.hypot(nose.x, nose.y) || 1;
      pose.rotation.set(REST.rx, ry, 0); pose.scale.setScalar(1.3);
      pose.position.set(lerp(REST.x - 7 * F, lerp(REST.x, AIM.x, f) + (nose.x / nl) * 11 * F * g, h), lerp(REST.y - 4 * F, REST.y + (nose.y / nl) * 11 * F * g, h) + (reduce ? 0 : 0.022 * Math.sin(0.65 * t)) * h * (1 - f), 0);
      b.group.rotation.x = -(1 - h) * Math.PI * 2 + p * 2 * Math.PI * 2;
      // The camera turns toward the cursor — original values: .14 horizontal, .1rad vertical, following by .025 each, only when the pointer is over the section (rising and falling by .05)
      tp.hover += (tp.look - tp.hover) * 0.05;
      orbit.x += (0.14 * mouse.tx * tp.hover - orbit.x) * 0.025; orbit.y += (-0.1 * mouse.ty * tp.hover - orbit.y) * 0.025;
      off.subVectors(eye, aim); const len = off.length(), yaw = Math.atan2(off.x, off.z) + orbit.x, pitch = Math.max(-1.3, Math.min(1.3, Math.asin(off.y / len) + orbit.y));
      cam.position.set(aim.x + len * Math.cos(pitch) * Math.sin(yaw), aim.y + len * Math.sin(pitch), aim.z + len * Math.cos(pitch) * Math.cos(yaw)); cam.lookAt(aim);
      r.render(scene, cam);
    });
  } else slide();

  // ── Helper card stack — every 3.2s the front card flips up to the back and the rest move forward one slot ──
  const deck = [...document.querySelectorAll(".ta-card")];
  const place = (order, instant) => order.forEach((c, k) => gsap.to(c, { y: k * -14, z: k * -60, scale: 1 - k * 0.04, rotationX: 0, opacity: k < 3 ? 1 : 0, zIndex: deck.length - k, duration: instant ? 0 : 0.8, ease: "expo.out", overwrite: "auto" }));
  let order = [...deck];
  place(order, true);
  if (!reduce && deck.length > 1) {
    let timer = 0;
    const next = () => {
      const top = order[0];
      gsap.timeline().to(top, { y: -260, rotationX: 55, opacity: 0, duration: 0.6, ease: "power2.in" }).add(() => { order = [...order.slice(1), top]; gsap.set(top, { y: 80, rotationX: -20 }); place(order); });
    };
    ScrollTrigger.create({ trigger: ".ta-agents", start: "top 60%", end: "bottom top", onToggle: (s) => { clearInterval(timer); if (s.isActive) timer = setInterval(next, 3200); } });
  }
});
