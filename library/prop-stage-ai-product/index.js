(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

  // Text splitting — words are inline-block chunks, spaces between them stay as they are
  const splitChars = (el) => {
    const words = el.textContent.split(/(\s+)/);
    el.textContent = "";
    const chars = [];
    for (const w of words) {
      if (/^\s+$/.test(w)) { el.append(w); continue; }
      const box = document.createElement("span");
      box.style.display = "inline-block";
      for (const c of w) {
        const s = document.createElement("span");
        s.className = "ch";
        s.textContent = c;
        box.append(s);
        chars.push(s);
      }
      el.append(box);
    }
    return chars;
  };
  const splitWords = (el) => {
    const out = [];
    const walk = (node) => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const part of n.textContent.split(/(\s+)/)) {
            if (!part) continue;
            if (/^\s+$/.test(part)) { frag.append(part); continue; }
            const s = document.createElement("span");
            s.className = "w";
            s.textContent = part;
            frag.append(s);
            out.push(s);
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      }
    };
    walk(el);
    return out;
  };

  // ── Hero: the last word of line two swaps letter by letter ──
  const swap = $(".tw-swap");
  if (swap && !reduce) {
    const words = swap.dataset.words.split("|");
    let i = 0;
    let cur = $(".tw-swap__word", swap);
    splitChars(cur);
    const next = () => {
      i = (i + 1) % words.length;
      const nw = document.createElement("span");
      nw.className = "tw-swap__word";
      nw.textContent = words[i];
      nw.style.cssText = "position:absolute;left:0;top:0";
      swap.append(nw);
      const inC = splitChars(nw);
      const outC = $$(".ch", cur);
      const tl = gsap.timeline({ onComplete: () => { cur.remove(); nw.style.cssText = ""; cur = nw; } });
      tl.to(outC, { yPercent: -60, opacity: 0, duration: 0.3, ease: "power2.in", stagger: 0.03 })
        .fromTo(inC, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.03 }, 0.15);
    };
    setInterval(next, 3200);
  }

  // ── Making 3D props ──
  const planeGeo = () => {
    // Folded paper plane: nose (+x), two wing tips, keel below
    const v = [
      1, 0, 0, -1, 0.02, 0, -1, 0.14, -0.78,
      1, 0, 0, -1, 0.14, 0.78, -1, 0.02, 0,
      1, 0, 0, -1, -0.32, 0, -1, 0.02, 0,
      1, 0, 0, -1, 0.02, 0, -1, -0.32, 0,
    ];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  };
  const planeMesh = (scale) => {
    const m = new THREE.Mesh(planeGeo(), new THREE.MeshStandardMaterial({ color: twThreeColor("--kf-accent"), roughness: 0.45, metalness: 0.05, flatShading: true, side: THREE.DoubleSide }));
    m.scale.setScalar(scale);
    return m;
  };
  const roundedRect = (w, h, r) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  };

  // ── Hero glass panel stack: six sheets layered, only the middle one blue. They tilt and shift following the cursor directly ──
  const heroHost = $(".tw-hero__scene");
  const hero = window.innerWidth > 900 ? twStage(heroHost, { fov: 26, camera: [0, 0, 22] }) : null;
  if (hero) {
    hero.light();
    const group = new THREE.Group();
    hero.scene.add(group);
    const geo = new THREE.ExtrudeGeometry(roundedRect(7.4, 2.6, 0.45), { depth: 0.08, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.1, bevelSegments: 4 });
    geo.center();
    const glass = new THREE.MeshPhysicalMaterial({ color: twThreeColor("--kf-raised"), roughness: 0.25, transparent: true, opacity: 0.4, clearcoat: 1, emissive: twThreeColor("--kf-accent-soft"), emissiveIntensity: 0.5, depthWrite: false });
    const blue = new THREE.MeshPhysicalMaterial({ color: twThreeColor("--kf-accent"), roughness: 0.3, transparent: true, opacity: 0.32, emissive: twThreeColor("--kf-accent"), emissiveIntensity: 0.45, depthWrite: false });
    const slabs = [];
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(geo, i === 2 || i === 5 ? blue : glass);
      m.rotation.x = -Math.PI / 2 + 0.32;
      m.position.y = 3.2 - i * 1.25;
      group.add(m);
      slabs.push(m);
    }
    group.rotation.y = -0.18;
    const ptr = { tx: 0, ty: 0 };
    addEventListener("pointermove", (e) => { ptr.tx = e.clientX / innerWidth - 0.5; ptr.ty = e.clientY / innerHeight - 0.5; }, { passive: true });
    // The original follows the cursor immediately (within one frame) tilting the plate so the light inside changes — the plate stays in place and doesn’t move by itself
    hero.tick = () => {
      slabs.forEach((m, i) => {
        m.rotation.x = -Math.PI / 2 + 0.32 + ptr.ty * 0.5 * (i % 2 ? 1 : -1);
        m.rotation.y = ptr.tx * 0.45;
      });
    };
    hero.ready();
  }

  // ── Hero paper plane: circles around the title ──
  const heroPlane = !reduce && window.innerWidth > 900 ? twStage($(".tw-hero__plane"), { ortho: true, pixel: true, camera: [0, 0, 1000] }) : null;
  if (heroPlane) {
    heroPlane.light();
    const p = planeMesh(34);
    heroPlane.scene.add(p);
    const title = $(".tw-hero__title");
    const prev = new THREE.Vector3();
    heroPlane.tick = (t) => {
      const r = title.getBoundingClientRect();
      const host = heroPlane.host.getBoundingClientRect();
      const cx = r.left + r.width * 0.42 - host.left - heroPlane.w / 2;
      const cy = -(r.top + r.height * 0.55 - host.top - heroPlane.h / 2);
      const a = t * 0.55;
      const x = cx + Math.cos(a) * r.width * 0.55;
      const y = cy + Math.sin(a * 2) * r.height * 0.32;
      const z = Math.sin(a) * 200;
      p.position.set(x, y, z);
      const dx = x - prev.x, dy = y - prev.y;
      p.rotation.set(Math.sin(a) * 0.6, Math.cos(a) > 0 ? Math.PI : 0, Math.atan2(dy, Math.abs(dx) + 0.001) * (Math.cos(a) > 0 ? -1 : 1));
      prev.set(x, y, z);
    };
    heroPlane.ready();
  }

  // ── Linked accordion + marble stage ──
  const intItems = $$(".tw-int__item");
  let intTurn = null;
  intItems.forEach((it, i) => $(".tw-int__title", it).addEventListener("click", () => {
    intItems.forEach((o) => o.classList.toggle("is-open", o === it));
    intTurn && intTurn(i);
  }));
  const ints = twStage($(".tw-int__scene"), { fov: 30, camera: [0, 4.5, 20] });
  if (ints) {
    ints.light();
    const g = new THREE.Group();
    ints.scene.add(g);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.8, 0.7, 64), new THREE.MeshStandardMaterial({ color: twThreeColor("--kf-raised"), roughness: 0.6 }));
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.08, 64), new THREE.MeshStandardMaterial({ color: twThreeColor("--kf-contrast-bg"), roughness: 0.3 }));
    top.position.y = 0.38;
    const lamp = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 12, 48), new THREE.MeshStandardMaterial({ color: twThreeColor("--kf-accent"), emissive: twThreeColor("--kf-accent"), emissiveIntensity: 0.8 }));
    lamp.rotation.x = Math.PI / 2; lamp.position.y = 0.44;
    g.add(base, top, lamp);
    const cols = ["--kf-accent", "--kf-success", "--kf-warning", "--kf-danger", "--kf-contrast-bg", "--kf-raised", "--kf-accent", "--kf-danger", "--kf-raised"];
    const balls = cols.map((c, i) => {
      const r = 0.38 + (i % 3) * 0.16;
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 24), new THREE.MeshPhysicalMaterial({ color: twThreeColor(c), roughness: 0.25, clearcoat: 0.8 }));
      const a = (i / cols.length) * Math.PI * 2;
      m.userData = { a, rad: 3 + (i % 2) * 0.9, y: -0.6 + (i % 4) * 0.55, ph: i * 1.3 };
      g.add(m);
      return m;
    });
    const turn = { a: 0 };
    intTurn = (i) => gsap.to(turn, { a: (i * Math.PI * 2) / 3, duration: 1, ease: "power3.inOut" });
    ints.tick = (t) => {
      g.rotation.y = turn.a + t * 0.08;
      balls.forEach((b) => {
        const u = b.userData;
        b.position.set(Math.cos(u.a) * u.rad, u.y + Math.sin(t * 1.1 + u.ph) * 0.25, Math.sin(u.a) * u.rad);
      });
    };
    ints.ready();
  }

  // ── Automation: four buttons on an isometric grid, light flows along the lines ──
  const autoSt = twStage($(".tw-auto__scene"), { ortho: true, zoom: 15, camera: [30, 26, 30] });
  let autoGroup = null;
  if (autoSt) {
    autoSt.light();
    autoGroup = new THREE.Group();
    autoSt.scene.add(autoGroup);
    const grid = new THREE.GridHelper(80, 40, twThreeColor("--kf-line"), twThreeColor("--kf-line"));
    grid.material.transparent = true; grid.material.opacity = 0.2;
    autoGroup.add(grid);
    const btnGeo = new THREE.ExtrudeGeometry(roundedRect(3, 3, 0.8), { depth: 0.9, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.15, bevelSegments: 4 });
    btnGeo.rotateX(-Math.PI / 2);
    const white = new THREE.MeshStandardMaterial({ color: twThreeColor("--kf-raised"), roughness: 0.55 });
    const dark = new THREE.MeshStandardMaterial({ color: twThreeColor("--kf-contrast-bg"), roughness: 0.35 });
    const glow = new THREE.MeshStandardMaterial({ color: twThreeColor("--kf-success"), emissive: twThreeColor("--kf-success"), emissiveIntensity: 0.6 });
    const spots = [[0, 2.6, -8], [-8, 0, 4], [0, 0, 4], [8, 0, 4]];
    spots.forEach(([x, y, z], i) => {
      const b = new THREE.Mesh(btnGeo, white);
      b.position.set(x, y, z);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.12, 40), dark);
      cap.position.set(x, y + 1.1, z);
      const led = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 8, 32), glow);
      led.rotation.x = Math.PI / 2; led.position.set(x, y + 1.18, z);
      autoGroup.add(b, cap, led);
    });
    const lineMat = new THREE.LineBasicMaterial({ color: twThreeColor("--kf-dim"), transparent: true, opacity: 0.55 });
    const paths = [
      [[0, 0.05, -8], [0, 0.05, -1], [-8, 0.05, -1], [-8, 0.05, 4]],
      [[0, 0.05, -8], [0, 0.05, 4]],
      [[0, 0.05, -8], [0, 0.05, -1], [8, 0.05, -1], [8, 0.05, 4]],
    ].map((pts) => pts.map((p) => new THREE.Vector3(...p)));
    paths.forEach((pts) => autoGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat)));
    const curves = paths.map((pts) => {
      const c = new THREE.CurvePath();
      for (let i = 1; i < pts.length; i++) c.add(new THREE.LineCurve3(pts[i - 1], pts[i]));
      return c;
    });
    const pulses = curves.map(() => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshBasicMaterial({ color: twThreeColor("--kf-accent") }));
      autoGroup.add(m);
      return m;
    });
    const plane = planeMesh(1.1);
    autoGroup.add(plane);
    autoSt.tick = (t) => {
      pulses.forEach((m, i) => m.position.copy(curves[i].getPointAt(((t * 0.35 + i * 0.27) % 1))));
      plane.position.set(1.6, 4.4 + Math.sin(t * 1.6) * 0.25, -8.4);
      plane.rotation.set(0.2, -0.8 + Math.sin(t) * 0.1, 0.15);
    };
    autoSt.ready();
  }

  // ── Pain story stage: paper plane + crumpled paper trash can ──
  const painSt = window.innerWidth > 900 ? twStage($(".tw-pain__scene"), { ortho: true, pixel: true, camera: [0, 0, 1000] }) : null;
  let pPlane = null, can = null;
  if (painSt) {
    painSt.light();
    pPlane = planeMesh(58);
    painSt.scene.add(pPlane);
    const prof = [];
    for (let i = 0; i <= 12; i++) { const k = i / 12; prof.push(new THREE.Vector2(104 + 24 * k, -130 + 260 * k)); }
    const lg = new THREE.LatheGeometry(prof, 96);
    const pos = lg.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), y = pos.getY(i);
      const a = Math.atan2(z, x), r = Math.hypot(x, z);
      const fold = 1 + 0.03 * Math.abs(Math.sin(a * 12 + (y + 130) * 0.006));
      pos.setXYZ(i, Math.cos(a) * r * fold, y, Math.sin(a) * r * fold);
    }
    lg.computeVertexNormals();
    const paper = new THREE.MeshStandardMaterial({ color: twThreeColor("--kf-raised"), roughness: 0.85, flatShading: true, side: THREE.DoubleSide });
    can = new THREE.Group();
    const body = new THREE.Mesh(lg, paper);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(130, 3.2, 8, 96), paper);
    rim.rotation.x = Math.PI / 2; rim.position.y = 130;
    const foot = new THREE.Mesh(new THREE.TorusGeometry(105, 3, 8, 96), paper);
    foot.rotation.x = Math.PI / 2; foot.position.y = -122;
    const floor = new THREE.Mesh(new THREE.CircleGeometry(104, 64), paper);
    floor.rotation.x = -Math.PI / 2; floor.position.y = -129;
    can.add(body, rim, foot, floor);
    can.rotation.x = 0.16;
    painSt.scene.add(can);
    pPlane.visible = false; can.visible = false;
    painSt.ready();
  }

  const mm = gsap.matchMedia();
  mm.add({ desk: "(min-width: 901px)", motion: "(prefers-reduced-motion: no-preference)" }, (c) => {
    const { desk, motion } = c.conditions;
    if (!motion) {
      $$(".tw-pain__text .w").forEach((w) => (w.style.color = "inherit"));
      return;
    }

    // Testimonial card loop — on phone, horizontal swipe dots
    const row = $(".tw-cards:not(.tw-cards--back) .tw-cards__row");
    if (!desk && row) {
      const dots = $$(".tw-cards__dots i");
      const onRow = () => {
        const i = Math.round(row.scrollLeft / (row.scrollWidth / dots.length));
        dots.forEach((d, j) => d.classList.toggle("is-on", j === i));
      };
      row.addEventListener("scroll", onRow, { passive: true });
    }

    // Pain story: words go from faded gray to ink black
    const words = $$(".tw-pain__text .w");
    const unread = getComputedStyle(document.documentElement).getPropertyValue("--site-unread");
    const fill = (p) => {
      const n = words.length * p;
      words.forEach((w, i) => (w.style.color = i < n - 1 ? "var(--kf-ink)" : i < n + 1 ? "color-mix(in oklab, var(--kf-ink) 50%, var(--site-unread))" : ""));
    };
    fill(0);

    if (!desk) {
      ScrollTrigger.create({ trigger: ".tw-pain__text", start: "top 75%", end: "bottom 50%", scrub: true, onUpdate: (s) => fill(s.progress) });
      feature(false);
      return;
    }

    // ── Testimonial card tilts back and drops out behind the panel’s top edge ──
    const front = $$(".tw-cards:not(.tw-cards--back) .tw-card");
    const fall = gsap.timeline({ scrollTrigger: { trigger: ".tw-pain", start: "top bottom", end: "top 20%", scrub: true } });
    front.forEach((card, i) => {
      fall.to(card, { y: 520 + i * 40, x: [260, 60, -140][i], rotation: [8, -4, 5][i], ease: "power2.in", duration: 1 }, i * 0.12);
    });

    // ── Title: three pieces scattered on one line gather into three lines on the left ──
    const lines = $$(".tw-pain__line");
    const titleChars = lines.flatMap((l) => splitChars(l));
    const lineH = lines[1].offsetTop - lines[0].offsetTop;
    gsap.timeline({ scrollTrigger: { trigger: ".tw-pain", start: "top bottom", end: "top top", scrub: true } })
      .fromTo(lines, {
        x: (i) => lines.slice(0, i).reduce((a, l) => a + l.offsetWidth + 22, 0),
        y: (i) => -i * lineH + i * 12,
      }, { x: (i) => [0, 60, 110][i], y: 0, ease: "none", duration: 0.75 })
      .to(lines, { x: 0, ease: "none", duration: 0.25 });

    // ── Pinned: words fill up, a plane crosses the title scattering letters and flies into the trash ──
    const scatter = titleChars.map(() => ({ x: rand(-50, 50), y: rand(60, 220), r: rand(-80, 80) }));
    const charX = () => titleChars.map((ch) => { const r = ch.getBoundingClientRect(); return r.left + r.width / 2; });
    let cx = null;
    const pin = ScrollTrigger.create({
      trigger: ".tw-pain__pin", start: "top top", end: "+=220%", pin: true, scrub: true,
      onRefresh: () => { cx = null; },
      onUpdate: (s) => paint(s.progress),
    });
    const mark = $(".tw-pain__mark");
    function paint(p) {
      fill(seg(p, 0.02, 0.6));
      if (mark) mark.style.setProperty("--mk", `${ease(seg(p, 0.84, 0.94)) * 100 + 3}%`);
      if (!painSt) return;
      const host = painSt.host.getBoundingClientRect();
      const W = painSt.w, H = painSt.h;
      const toX = (vx) => vx - host.left - W / 2;
      const toY = (vy) => -(vy - host.top - H / 2);
      // Airplane path: from outside the top left → across above the title → turns at the right → nose dips at the left → into the trash can
      const fly = seg(p, 0.04, 0.38), turn = seg(p, 0.38, 0.6), drop = seg(p, 0.62, 0.8);
      const t0 = $(".tw-pain__title").getBoundingClientRect();
      const canX = t0.left + 230, canY = host.top + H * 0.74;
      let x, y, rz, ry = 0, rx = 0;
      if (p < 0.38) {
        const e = ease(fly);
        x = t0.left - 120 + (t0.right + 90 - (t0.left - 120)) * e;
        y = t0.top - 60 + (t0.height * 0.75) * Math.sin(e * Math.PI * 0.85);
        rz = -0.35 + e * 0.5; rx = Math.sin(e * Math.PI) * 0.6;
      } else if (p < 0.6) {
        const e = ease(turn);
        x = t0.right + 90 - (t0.right + 90 - (t0.left + 90)) * e;
        y = t0.top + t0.height * 0.75 + Math.sin(e * Math.PI) * -80;
        ry = Math.PI * e; rz = 0.15 - e * 1.3; rx = e * 0.4;
      } else {
        const e = drop * drop;
        x = t0.left + 90 + (canX - (t0.left + 90)) * e;
        y = t0.top + t0.height * 0.75 + (canY - 80 - (t0.top + t0.height * 0.75)) * e;
        ry = Math.PI; rz = -1.15 - e * 0.4; rx = 0.4 + e * 0.6;
      }
      pPlane.visible = p > 0.03 && p < 0.86;
      pPlane.position.set(toX(x), toY(y), 120);
      pPlane.rotation.set(rx, ry, rz);
      // Trash can rises from below
      const rise = ease(seg(p, 0.44, 0.62));
      can.visible = rise > 0;
      can.position.set(toX(canX), toY(canY + (1 - rise) * 520), 0);
      // Letters the plane passed scatter and fall
      if (!cx) cx = charX();
      const passX = p < 0.38 ? x : Infinity;
      titleChars.forEach((ch, i) => {
        const k = clamp01((passX - cx[i] + 10) / 140);
        const sc = scatter[i];
        ch.style.transform = k ? `translate(${sc.x * k}px, ${sc.y * k * k}px) rotate(${sc.r * k}deg)` : "";
        ch.style.opacity = String(1 - clamp01(k * 1.15 - 0.15));
      });
    }
    paint(0);

    // ── From beneath the board a card stack emerges, flips, and spreads into three slots ──
    const back = $$(".tw-cards--back .tw-card");
    const inner = back.map((c) => $(".tw-card__inner", c));
    gsap.set(back, { x: (i) => [352, 0, -352][i], y: (i) => 420 + i * 70, scale: 0.5, rotation: (i) => [-6, 4, -3][i] });
    const flip = gsap.timeline({ scrollTrigger: { trigger: ".tw-cards--back", start: "top top", end: "+=180%", pin: true, scrub: true } });
    flip.to(back, { y: (i) => [-12, 0, 14][i], scale: 1, rotation: (i) => [-5, -2, 4][i], x: (i) => [352 - 30, 0, -352 + 40][i], ease: "power2.out", duration: 1 })
      .to(back, { x: 0, rotation: 0, y: 0, ease: "power2.inOut", duration: 1 })
      .to(inner, { rotationY: 180, ease: "power2.inOut", duration: 0.9, stagger: 0.08 }, "<0.05")
      .to({}, { duration: 0.35 });
    // Highlighter and underline are drawn on the quote on the back side
    $$(".tw-cards--back .tw-card__back").forEach((face) => {
      const marks = $$("mark, u", face);
      gsap.fromTo(marks, { "--hl": "0%" }, { "--hl": "100%", duration: 0.6, ease: "power2.out", stagger: 0.12, scrollTrigger: { trigger: ".tw-cards--back", start: () => `top+=${innerHeight * 1.5} top`, toggleActions: "play none none reverse" } });
    });

    // ── Feature stage ──
    feature(desk);

    // ── Automation: camera approaches as you scroll ──
    if (autoSt) {
      const cam = { z: 17 };
      gsap.to(cam, { z: 13, ease: "none", scrollTrigger: { trigger: ".tw-auto", start: "top bottom", end: "bottom top", scrub: true }, onUpdate: () => { autoSt.zoom = cam.z; autoSt.renderer.domElement && window.dispatchEvent(new Event("tw-auto-zoom")); } });
      addEventListener("tw-auto-zoom", () => {
        const a = autoSt.w / autoSt.h, z = autoSt.zoom;
        Object.assign(autoSt.camera, { left: -z * a, right: z * a, top: z, bottom: -z });
        autoSt.camera.updateProjectionMatrix();
      });
      gsap.from(".tw-auto__copy > *", { y: 40, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: ".tw-auto", start: "top 40%" } });
    }
  });

  // ── Feature stage: coin ring → dots → net sphere → row of people → filtered list (pink) → written text (blue) ──
  function feature(desk) {
    const host = $(".tw-feature__gl");
    const st = twStage(host, { fov: 30, camera: [0, 0, 22] });
    const chapters = $$(".tw-feature__chapter");
    const people = $$(".tw-people__row");
    const leads = $(".tw-leads"), mail = $(".tw-mail"), orbit = $(".tw-orbit");
    gsap.set([leads, mail, orbit], { autoAlpha: 0 });
    gsap.set(people, { autoAlpha: 0, x: -20 });
    gsap.set(chapters, { autoAlpha: 0 }); gsap.set(chapters[0], { autoAlpha: 1 });
    if (!st) return;
    st.light();
    const N = 12, P = 96;
    // Coin front: a simple mark on a colored disc (source logo slot)
    const faceTex = (i) => {
      const cv = document.createElement("canvas");
      cv.width = cv.height = 256;
      const g = cv.getContext("2d");
      const cols = ["--kf-accent", "--kf-danger", "--kf-contrast-bg", "--kf-success", "--kf-warning", "--kf-raised"];
      const [r, gg, b] = twColor(cols[i % cols.length]);
      const [ir, ig, ib] = twColor(i % cols.length === 5 ? "--kf-dim" : "--kf-raised");
      const [wr, wg, wb] = twColor("--kf-raised");
      g.fillStyle = `rgb(${wr * 255},${wg * 255},${wb * 255})`; /* Not skin: value read from skin variables */
      g.fillRect(0, 0, 256, 256);
      g.fillStyle = `rgb(${r * 255},${gg * 255},${b * 255})`; /* Not skin: value read from skin variables */
      g.beginPath(); g.arc(128, 128, 96, 0, Math.PI * 2); g.fill();
      g.strokeStyle = `rgb(${ir * 255},${ig * 255},${ib * 255})`; /* Not skin: value read from skin variables */
      g.lineWidth = 16; g.lineCap = "round";
      g.beginPath();
      [() => { g.moveTo(90, 90); g.lineTo(166, 166); g.moveTo(166, 90); g.lineTo(90, 166); },
       () => { g.arc(128, 128, 38, 0.4, Math.PI * 1.8); },
       () => { g.moveTo(100, 84); g.lineTo(170, 128); g.lineTo(100, 172); g.closePath(); },
       () => { g.arc(110, 110, 22, 0, Math.PI * 2); g.moveTo(140, 140); g.lineTo(170, 170); },
       () => { for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; g.moveTo(128, 128); g.lineTo(128 + Math.cos(a) * 46, 128 + Math.sin(a) * 46); } },
       () => { g.moveTo(84, 150); g.quadraticCurveTo(128, 60, 172, 150); }][i % 6]();
      g.stroke();
      const t = new THREE.CanvasTexture(cv);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    const rimMat = new THREE.MeshStandardMaterial({ color: twThreeColor("--kf-raised"), roughness: 0.4, metalness: 0.2, transparent: true });
    const coinGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.15, 48);
    const coins = [];
    for (let i = 0; i < N; i++) {
      const top = new THREE.MeshStandardMaterial({ map: faceTex(i), roughness: 0.5, transparent: true });
      const m = new THREE.Mesh(coinGeo, [rimMat, top, rimMat]);
      st.scene.add(m);
      coins.push(m);
    }
    // Mesh sphere: Fibonacci points + lines between nearby points
    const pts = [];
    for (let i = 0; i < P; i++) {
      const y = 1 - (i / (P - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996;
      pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r).multiplyScalar(4.2 + rand(-0.15, 0.15)));
    }
    const scatterPos = pts.map(() => new THREE.Vector3(rand(-2.6, 2.6), rand(-2.4, 2.4), rand(-1.5, 1.5)));
    const pGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const dotMat = new THREE.PointsMaterial({ color: twThreeColor("--kf-dim"), size: 0.09, transparent: true, opacity: 0 });
    const dots = new THREE.Points(pGeo, dotMat);
    const seg2 = [];
    for (let i = 0; i < P; i++) for (let j = i + 1; j < P; j++) if (pts[i].distanceTo(pts[j]) < 1.75) seg2.push(pts[i], pts[j]);
    const lineMat = new THREE.LineBasicMaterial({ color: twThreeColor("--kf-dim"), transparent: true, opacity: 0 });
    const net = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(seg2), lineMat);
    const sphere = new THREE.Group();
    sphere.add(dots, net);
    st.scene.add(sphere);
    // Blue revision in the Writing section
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshPhysicalMaterial({ color: twThreeColor("--kf-accent"), roughness: 0.15, clearcoat: 1, flatShading: true, transparent: true, opacity: 0 }));
    crystal.scale.set(0.9, 1.6, 0.5);
    crystal.position.set(-4.4, 1.2, 1);
    st.scene.add(crystal);
    const state = { tilt: 0, scat: 0, net: 0, out: 0, cry: 0 };
    st.tick = (t) => {
      const ringA = t * 0.25;
      coins.forEach((m, i) => {
        const a = (i / N) * Math.PI * 2 + ringA;
        const ring = new THREE.Vector3(Math.cos(a) * 3.2, Math.sin(a) * 3.2, 0);
        const s = ease(state.scat);
        m.position.lerpVectors(ring, scatterPos[i], s);
        m.rotation.set(Math.PI / 2 - state.tilt * (0.9 + 0.6 * Math.cos(a * 2)), state.tilt * Math.sin(a) * 1.1, a * state.tilt * 0.3);
        m.scale.setScalar(1 - s * 0.82);
        m.material[1].opacity = rimMat.opacity = 1 - seg(state.scat, 0.7, 1);
        m.visible = state.scat < 1;
      });
      const n = ease(state.net), o = state.out;
      const arr = pGeo.attributes.position;
      for (let i = 0; i < P; i++) {
        const v = scatterPos[i].clone().lerp(pts[i], n);
        arr.setXYZ(i, v.x, v.y, v.z);
      }
      arr.needsUpdate = true;
      dotMat.opacity = Math.min(1, state.scat * 1.2) * (1 - o);
      lineMat.opacity = n * 0.5 * (1 - o);
      sphere.rotation.y = t * 0.12;
      sphere.scale.setScalar(1 - o * 0.6);
      sphere.visible = dotMat.opacity > 0.01;
      crystal.material.opacity = state.cry;
      crystal.visible = state.cry > 0.01;
      crystal.rotation.y = t * 0.6;
      crystal.position.y = 1.2 + Math.sin(t * 1.2) * 0.2;
    };
    st.ready();
    if (!desk) return;
    const surf = $(".tw-feature__surface");
    const tint = { pink: 0, blue: 0 };
    const paintTint = () => {
      const v = `color-mix(in oklab, color-mix(in oklab, var(--site-panel), var(--kf-danger) ${tint.pink * 18}%), var(--kf-accent) ${tint.blue * 10}%)`;
      surf.style.setProperty("--tw-feature-bg", v);
      document.documentElement.style.setProperty("--site-feature-now", v);
    };
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".tw-feature__pin", start: "top top", end: "+=600%", pin: true, scrub: true } });
    tl.to(state, { tilt: 1, duration: 0.1, ease: "power2.inOut" }, 0)
      .to(state, { scat: 1, duration: 0.1, ease: "none" }, 0.09)
      .to(state, { net: 1, duration: 0.12, ease: "none" }, 0.17)
      .to(state, { out: 1, duration: 0.07, ease: "power2.in" }, 0.31)
      .to(people, { autoAlpha: 1, x: 0, duration: 0.05, stagger: 0.012, ease: "power2.out" }, 0.33)
      .to(people, { autoAlpha: 0, scaleX: 2.2, duration: 0.05, ease: "power2.inOut" }, 0.41)
      .to(leads, { autoAlpha: 1, duration: 0.05 }, 0.42)
      .fromTo($$("li", leads), { y: 20 }, { y: 0, duration: 0.05, stagger: 0.01 }, 0.42)
      .to(tint, { pink: 1, duration: 0.06, onUpdate: paintTint }, 0.41)
      .to(chapters[0], { autoAlpha: 0, duration: 0.03 }, 0.41)
      .to(chapters[1], { autoAlpha: 1, duration: 0.03 }, 0.425)
      .to(leads, { autoAlpha: 0, y: -30, duration: 0.05 }, 0.66)
      .to(tint, { pink: 0, blue: 1, duration: 0.06, onUpdate: paintTint }, 0.66)
      .to(chapters[1], { autoAlpha: 0, duration: 0.03 }, 0.67)
      .to(chapters[2], { autoAlpha: 1, duration: 0.03 }, 0.685)
      .fromTo(mail, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.06, ease: "power3.out" }, 0.7)
      .to(orbit, { autoAlpha: 1, duration: 0.06 }, 0.72)
      .to(state, { cry: 1, duration: 0.06 }, 0.72)
      .to({}, { duration: 0.2 });
    if (!reduce) gsap.to(".tw-orbit svg", { rotation: 360, duration: 40, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
  }
})();
