(() => {
  // Stands N cards on a ring of radius 2 and draws them with three.js. All cards face the camera (only the ring rotates), on entry it picks one card, starts half a turn behind, and rotates to that card in 1.2s.
  // Dragging with the mouse gives .02rad per 1px (max .2 at once), on release snaps to the nearest section in .6s easeOutQuint. Horizontal wheel .01rad per 1px, touch .024rad per 1px, on release .9 damped inertia.
  // Hovering a card gathers 18 sparkles around it, pressing bursts 16 sparkles sideways as that card moves to the center and the DOM card flips and grows in place then fades (after .75s, 1s) and counts as the card being pressed.
  // Card face is [data-fx-part=card] The DOM redrawn onto a canvas at the board’s size (background color · vertical gradient · border · corners · text · placeholder photo) — or the photo if there is an img.
  const three = () => (window.THREE ? Promise.resolve(window.THREE) : new Promise((r) => addEventListener("three:ready", () => r(window.THREE), { once: true })));
  const quint = (x) => 1 - Math.pow(1 - x, 5);
  const quad = (t) => t * (2 - t);
  const inOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const TAU = Math.PI * 2;

  kfFx.register("card-ring-3d", (el, ctx) => {
    let off = null, gone = false;
    const go = () => three().then((T) => { if (!gone && el.isConnected) off = build(el, ctx, T); });
    (document.fonts?.ready || Promise.resolve()).then(go);
    return () => { gone = true; off?.(); };
  });

  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r[0], y);
    g.arcTo(x + w, y, x + w, y + h, r[1]);
    g.arcTo(x + w, y + h, x, y + h, r[2]);
    g.arcTo(x, y + h, x, y, r[3]);
    g.arcTo(x, y, x + w, y, r[0]);
    g.closePath();
  }
  const clear = (c) => !c || c === "transparent" || /rgba\([^)]*,\s*0\)$/.test(c) || /\/\s*0\)$/.test(c);
  // Gradient color stops: "rgb(…) 10%" — Kept as one chunk, including parentheses inside color functions
  const stopsOf = (s) => [...s.matchAll(/((?:rgba?|oklch|oklab|lab|lch|color|hsla?)\([^()]*\)|#[0-9a-f]{3,8}|transparent)\s*([\d.]+%)?/gi)].map((m) => [m[1], m[2] ? parseFloat(m[2]) / 100 : null]);

  // Draws one DOM card onto the canvas — so the 3D face keeps the same look even if the user styles the card with their own skin
  function paint(card, W) {
    const box = card.getBoundingClientRect();
    const k = W / Math.max(1, box.width);
    const H = Math.round(box.height * k);
    const c = document.createElement("canvas");
    c.width = W; c.height = Math.max(2, H);
    const g = c.getContext("2d");
    const draw = (node) => {
      const cs = getComputedStyle(node);
      // Back side (data-fx-part=back) is DOM that is only visible when flipped, so it is not drawn on the 3D face
      if (cs.display === "none" || cs.visibility === "hidden" || node.matches('[data-fx-part="back"]')) return;
      const r = node.getBoundingClientRect();
      const x = (r.left - box.left) * k, y = (r.top - box.top) * k, w = r.width * k, h = r.height * k;
      const rad = ["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map((p) => {
        const v = cs[`border${p}Radius`].split(" ")[0];
        return Math.min(v.endsWith("%") ? (parseFloat(v) / 100) * Math.min(w, h) : parseFloat(v) * k || 0, w / 2, h / 2);
      });
      g.save();
      roundRect(g, x, y, w, h, rad);
      if (!clear(cs.backgroundColor)) { g.fillStyle = cs.backgroundColor; g.fill(); }
      const lin = cs.backgroundImage.match(/^linear-gradient\((.*)\)$/);
      if (lin && !node.classList.contains("wf-img")) {
        const ang = (lin[1].match(/^(-?[\d.]+)deg/) || [0, 180])[1] * (Math.PI / 180);
        const half = (Math.abs(w * Math.sin(ang)) + Math.abs(h * Math.cos(ang))) / 2;
        const cx = x + w / 2, cy = y + h / 2, dx = Math.sin(ang) * half, dy = -Math.cos(ang) * half;
        const grad = g.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
        const st = stopsOf(lin[1]);
        st.forEach(([col, at], i) => { try { grad.addColorStop(Math.min(1, Math.max(0, at ?? i / Math.max(1, st.length - 1))), col); } catch {} });
        g.fillStyle = grad; g.fill();
      }
      if (cs.overflow !== "visible") g.clip();
      if (node.classList.contains("wf-img")) {
        g.strokeStyle = cs.getPropertyValue("--wf-line").trim() || cs.borderTopColor;
        g.lineWidth = Math.max(1, k);
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y + h); g.moveTo(x + w, y); g.lineTo(x, y + h); g.stroke();
      }
      for (const kid of node.children) draw(kid);
      for (const t of node.childNodes) {
        if (t.nodeType !== 3 || !t.textContent.trim()) continue;
        const range = document.createRange(); range.selectNodeContents(t);
        const rect = range.getBoundingClientRect();
        g.fillStyle = cs.color;
        g.font = `${cs.fontStyle} ${cs.fontWeight} ${parseFloat(cs.fontSize) * k}px ${cs.fontFamily}`;
        g.textBaseline = "middle";
        g.textAlign = "left";
        const lines = range.getClientRects().length > 1 ? wrap(g, t.textContent.trim(), rect.width * k) : [t.textContent.trim()];
        const lh = (rect.height * k) / lines.length;
        lines.forEach((s, i) => g.fillText(s, (rect.left - box.left) * k + ((rect.width * k) - g.measureText(s).width) / 2, (rect.top - box.top) * k + lh * (i + 0.5)));
      }
      if (node.dataset.label) {
        const a = getComputedStyle(node, "::after");
        const fs = parseFloat(a.fontSize) * k;
        g.font = `${a.fontWeight} ${fs}px ${a.fontFamily}`;
        const tw = Math.min(g.measureText(node.dataset.label).width, w * 0.92);
        g.fillStyle = clear(a.backgroundColor) ? cs.backgroundColor : a.backgroundColor;
        g.fillRect(x + w / 2 - tw / 2 - fs * 0.7, y + h / 2 - fs, tw + fs * 1.4, fs * 2);
        g.fillStyle = a.color; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(node.dataset.label, x + w / 2, y + h / 2, w * 0.92);
      }
      g.restore();
      const bw = parseFloat(cs.borderTopWidth) * k;
      if (bw > 0 && !clear(cs.borderTopColor) && cs.borderTopStyle !== "none") {
        g.save();
        roundRect(g, x + bw / 2, y + bw / 2, w - bw, h - bw, rad.map((v) => Math.max(0, v - bw / 2)));
        g.lineWidth = bw; g.strokeStyle = cs.borderTopColor; g.stroke();
        g.restore();
      }
    };
    draw(card);
    return c;
  }
  function wrap(g, s, max) {
    const out = [];
    let line = "";
    for (const w of s.split(/\s+/)) {
      const t = line ? `${line} ${w}` : w;
      if (g.measureText(t).width > max && line) { out.push(line); line = w; } else line = t;
    }
    if (line) out.push(line);
    return out;
  }

  function starTexture(T, color) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const glow = g.createRadialGradient(64, 64, 0, 64, 64, 40);
    glow.addColorStop(0, color); glow.addColorStop(1, "transparent");
    g.fillStyle = glow; g.fillRect(0, 0, 128, 128);
    g.fillStyle = color;
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU - Math.PI / 2, r = i % 2 ? 9 : 62;
      g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r);
    }
    g.closePath(); g.fill();
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  }

  function build(el, { options, reduce, hover }, T) {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!T || !cards.length) return null;
    const count = cards.length;
    const baseR = +(options.radius ?? 2) || 2;
    const fov = +(options.fov ?? 60) || 60;
    const sp = () => innerWidth <= (+(options.sp ?? 768) || 768);
    const drag = +(options.drag ?? 0.02), wheel = +(options.wheel ?? 0.01), swipe = +(options.swipe ?? 0.024);
    const snapDur = +(options.snap ?? 0.6), introDur = +(options.intro ?? 1.2);
    const openAt = +(options["open-at"] ?? 0.35), openDelay = +(options["open-delay"] ?? 1.2), backAt = +(options["back-at"] ?? 0.5);
    const startAt = options.start ?? "random";
    const root = document.documentElement;
    const probe = document.createElement("i");
    probe.style.display = "none";
    el.append(probe);
    const color = (v) => { probe.style.color = v; return getComputedStyle(probe).color; };

    const gl = document.createElement("canvas");
    gl.className = "fx-cr3-gl";
    el.prepend(gl);
    const kc = document.createElement("canvas");
    kc.className = "fx-cr3-kira";
    el.append(kc);

    const renderer = new T.WebGLRenderer({ canvas: gl, antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    const kr = new T.WebGLRenderer({ canvas: kc, antialias: false, alpha: true });
    kr.setPixelRatio(Math.min(devicePixelRatio, 2));
    kr.setClearColor(0x000000, 0);

    const scene = new T.Scene(), kscene = new T.Scene();
    const camera = new T.PerspectiveCamera(fov, 1, 0.1, 100), kcam = new T.PerspectiveCamera(60, 1, 0.1, 100);
    kcam.position.set(0, 0, 4);
    // Original lighting as is — ambient 1 + 1.2, directional 1.5 (5,8,5) · 1.2 (−5,8,−5) · back .8 (0,0,−10)
    scene.add(new T.AmbientLight(0xffffff, 1), new T.AmbientLight(0xffffff, 1.2));
    const d1 = new T.DirectionalLight(0xffffff, 1.5); d1.position.set(5, 8, 5);
    const d2 = new T.DirectionalLight(0xffffff, 1.2); d2.position.set(-5, 8, -5);
    const d3 = new T.DirectionalLight(0xffffff, 0.8); d3.position.set(0, 0, -10);
    scene.add(d1, d2, d3);
    kscene.add(new T.AmbientLight(0xffffff, 1));

    const group = new T.Group();
    scene.add(group);
    const disposables = [];
    let radius = baseR, aspect = 566 / 326;
    let geo = null;
    const makeGeo = () => {
      const w = 1, h = w * aspect, x = -w / 2, y = -h / 2, cr = 0.05;
      const s = new T.Shape();
      s.moveTo(x + cr, y); s.lineTo(x + w - cr, y); s.quadraticCurveTo(x + w, y, x + w, y + cr);
      s.lineTo(x + w, y + h - cr); s.quadraticCurveTo(x + w, y + h, x + w - cr, y + h);
      s.lineTo(x + cr, y + h); s.quadraticCurveTo(x, y + h, x, y + h - cr);
      s.lineTo(x, y + cr); s.quadraticCurveTo(x, y, x + cr, y);
      const gm = new T.ShapeGeometry(s);
      const uv = gm.getAttribute("uv");
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) - x) / w, (uv.getY(i) - y) / h);
      uv.needsUpdate = true;
      return gm;
    };
    const mats = [];
    const holders = cards.map((card, i) => {
      const holder = new T.Group();
      holder.userData.index = i;
      const mat = new T.MeshStandardMaterial({ side: T.FrontSide, transparent: true, metalness: 0, roughness: 1, envMapIntensity: 0, toneMapped: true, color: new T.Color(1.1, 1.1, 1.1) });
      mats.push(mat);
      holder.add(new T.Mesh(undefined, mat), new T.Mesh(undefined, mat));
      group.add(holder);
      return holder;
    });
    const place = () => {
      radius = sp() ? baseR * 0.9 : baseR;
      const z = sp() ? 0.01 : 0.02;
      holders.forEach((h, i) => {
        const a = (i / count) * TAU;
        h.position.set(Math.sin(a) * radius, 0, Math.cos(a) * radius + z);
      });
      const s = sp() ? 0.94 : 0.95;
      group.scale.set(s, s, s);
      camera.position.set(0, 0, sp() ? radius * 1.8 : radius * 2);
      camera.lookAt(0, 0, 0);
    };

    // DOM card size that the chosen section overwrites — the height at which the front section is drawn on screen
    const frontH = () => {
      const s = group.scale.x, d = camera.position.z - (radius + (sp() ? 0.01 : 0.02)) * s;
      return ((aspect * s) / (2 * Math.tan((fov * Math.PI) / 360) * d)) * el.clientHeight;
    };
    const paintAll = () => {
      // Card ratio comes from aspect-ratio in the consuming CSS — it stays the same when the height changes, so read it first and then set the height.
      const r0 = cards[0].getBoundingClientRect();
      if (r0.width > 0) aspect = r0.height / r0.width;
      el.style.setProperty("--fx-card-h", `${frontH().toFixed(1)}px`);
      geo?.dispose();
      geo = makeGeo();
      holders.forEach((h, i) => {
        h.children[0].geometry = geo;
        h.children[1].geometry = geo;
        h.children[0].position.z = 0.01;
        h.children[1].position.z = -0.01;
        h.children[1].rotation.y = Math.PI;
        const img = cards[i].querySelector("img");
        const src = img && img.complete && img.naturalWidth ? img : paint(cards[i], 512);
        const tex = img && src === img ? new T.Texture(img) : new T.CanvasTexture(src);
        tex.colorSpace = T.SRGBColorSpace;
        tex.anisotropy = 16;
        tex.needsUpdate = true;
        mats[i].map?.dispose();
        mats[i].map = tex;
        mats[i].needsUpdate = true;
      });
    };

    // Sparkles — 18 around the card (hover), 16 on the horizontal band (press)
    const star = starTexture(T, color("var(--fx-kira, var(--kf-surface))"));
    disposables.push(star);
    const sGeo = new T.PlaneGeometry(0.1, 0.1), kGeo = new T.PlaneGeometry(0.4, 0.4);
    disposables.push(sGeo, kGeo);
    const sparkles = [];
    for (let ci = 0; ci < count && hover && !reduce; ci++) {
      for (let i = 0; i < 18; i++) {
        const m = new T.Mesh(sGeo, new T.MeshBasicMaterial({ map: star, transparent: true, opacity: 0.8, side: T.DoubleSide, depthWrite: false }));
        m.visible = false;
        const a = Math.random() * TAU, va = (Math.random() - 0.5) * Math.PI * 0.8, sd = 0.4 + Math.random() * 0.2, ed = 0.08 + Math.random() * 0.08;
        const ca = (ci / count) * TAU;
        m.userData = { ci, a, va, sd, tx: Math.cos(a) * ed, ty: (Math.random() - 0.5) * 0.15, tz: Math.sin(a) * ed, ts: 0.3 + Math.random() * 0.3, tp: Math.random() * TAU,
          fin: Math.random() * 0.4, life: 0.6 + Math.random() * 0.3, sc: 0.6 + Math.random() * 0.4, ca, on: false, t0: 0 };
        m.scale.setScalar(m.userData.sc);
        sparkles.push(m);
        group.add(m);
      }
    }
    const kiras = [];
    for (let i = 0; i < 16 && !reduce; i++) {
      const m = new T.Mesh(kGeo, new T.MeshBasicMaterial({ map: star, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false }));
      m.visible = false;
      m.userData = { on: false };
      kiras.push(m);
      kscene.add(m);
    }
    const kiraStart = () => {
      const t = performance.now() + 300;
      const hh = 2 * Math.tan(Math.PI / 6) * kcam.position.z, ww = hh * kcam.aspect;
      kiras.forEach((m, i) => {
        const u = m.userData;
        m.position.set((i / 15 - 0.5) * ww * 0.6, (Math.random() - 0.5) * hh * 0.3, (Math.random() - 0.5) * 0.5);
        m.rotation.z = Math.random() * Math.PI;
        Object.assign(u, { on: true, t0: t, delay: i * 0.03, x0: m.position.x, y0: m.position.y, z0: m.position.z,
          x1: m.position.x + (Math.random() - 0.5) * ww * 0.1, y1: m.position.y + (Math.random() - 0.5) * hh * 0.3, z1: m.position.z + (Math.random() - 0.5) * 0.3,
          rs: 0.02 + Math.random() * 0.02, max: 0.4 + Math.random() * 0.4 });
        const sc = 0.8 + Math.random() * 0.8;
        m.scale.setScalar(sc);
        m.material.opacity = 0;
        m.visible = true;
      });
      kiraLive = true;
    };
    let kiraLive = false;

    let rot = 0, vel = 0, dragging = false, anim = null, hovered = null, last = 0, visible = false, raf = 0, frozen = false;
    const norm = () => { rot = ((rot + Math.PI) % TAU) - Math.PI; };
    const snapTo = (target, dur = snapDur) => { anim = { from: rot, to: target, t0: performance.now(), dur: reduce ? 0 : dur }; vel = 0; };
    const snapNearest = () => {
      if (anim) return;
      const apc = TAU / count;
      let n = Math.round(rot / apc) * apc;
      if (Math.abs(n - rot) > Math.PI) n += n > rot ? -TAU : TAU;
      snapTo(n);
    };
    const intro = () => {
      const apc = TAU / count;
      const pick = startAt === "random" ? Math.floor(Math.random() * count) : Math.min(count - 1, Math.max(0, +startAt || 0));
      const target = pick * apc;
      rot = target + Math.PI;
      snapTo(target, introDur);
    };
    const stepAnim = (now) => {
      if (!anim) return;
      const p = anim.dur ? Math.min((now - anim.t0) / 1000 / anim.dur, 1) : 1;
      rot = anim.from + (anim.to - anim.from) * quint(p);
      if (p >= 1) { rot = anim.to; anim = null; norm(); }
    };
    const hoverOn = (ci) => {
      const now = performance.now();
      sparkles.forEach((m) => {
        if (m.userData.ci !== ci) return;
        m.visible = true;
        m.userData.on = true;
        m.userData.t0 = now;
      });
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      // Like the original, locked to 60fps and damped by frame count
      if (now - last < 1000 / 60 - 0.5) return;
      last = now;
      if (!visible) return;
      frozen = !!document.querySelector(options.pause || ".is-open[role='dialog'], dialog[open]");
      if (!frozen) {
        for (const m of sparkles) {
          const u = m.userData;
          if (!u.on) continue;
          const e = (now - u.t0) / 1000;
          const fi = quad(Math.max(0, Math.min((e - u.fin) / 0.5, 1)));
          const fo0 = u.life * 0.6;
          const fo = quad(Math.max(0, Math.min((e - fo0) / 0.5, 1)));
          const mv = inOut(quad(Math.max(0, Math.min((e - u.fin) / 0.5, 1))));
          const cx = Math.sin(u.ca) * radius, cz = Math.cos(u.ca) * radius;
          m.position.set(cx + Math.cos(u.a) * Math.cos(u.va) * u.sd + u.tx * mv, u.ty * mv, cz + Math.sin(u.a) * Math.cos(u.va) * u.sd + u.tz * mv);
          m.scale.setScalar(u.sc * (Math.sin(e * u.ts + u.tp) * 0.15 + 1));
          m.material.opacity = e < fo0 ? 0.8 * fi : 0.8 * (1 - fo);
          m.lookAt(camera.position);
          if (e > fo0 + 0.5) { m.visible = false; u.on = false; }
        }
        if (!dragging) {
          vel *= 0.9;
          if (Math.abs(vel) < 0.001) { vel = 0; if (!anim) snapNearest(); } else { rot += vel; norm(); }
        }
        stepAnim(now);
        group.rotation.y = rot;
        const cam = camera.position.clone();
        for (const h of holders) { const p = h.position.clone(); h.position.set(0, 0, 0); h.lookAt(cam); h.position.copy(p); }
        renderer.render(scene, camera);
      }
      if (kiraLive) {
        let any = false;
        for (const m of kiras) {
          const u = m.userData;
          if (!u.on) continue;
          any = true;
          const p = Math.min(((now - u.t0) / 1000 - u.delay) / 0.5, 1);
          if (p < 0) continue;
          const q = quad(p);
          m.position.set(u.x0 + (u.x1 - u.x0) * q, u.y0 + (u.y1 - u.y0) * q, u.z0 + (u.z1 - u.z0) * q);
          m.rotation.z += u.rs;
          m.material.opacity = p < 0.2 ? u.max * (p / 0.2) : u.max * (1 - (p - 0.2) / 0.8);
          if (p >= 1) { m.visible = false; u.on = false; m.material.opacity = 0; }
        }
        kr.render(kscene, kcam);
        if (!any) kiraLive = false;
      }
    };

    const ray = new T.Raycaster(), ndc = new T.Vector2();
    const hit = (x, y) => {
      const r = gl.getBoundingClientRect();
      ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const h = ray.intersectObjects(holders, true)[0];
      return h ? h.object.parent.userData.index : null;
    };
    const timers = [];
    const pick = (i, burst) => {
      if (burst) kiraStart();
      const apc = TAU / count;
      let target = -i * apc;
      const cur = ((rot + Math.PI) % TAU) - Math.PI;
      let diff = target - cur;
      if (diff > Math.PI) diff -= TAU; else if (diff < -Math.PI) diff += TAU;
      rot = cur;
      snapTo(cur + diff);
      const card = cards[i];
      timers.push(setTimeout(() => {
        card.classList.add("is-picked");
        holders[i].visible = false;
        timers.push(setTimeout(() => {
          el.dispatchEvent(new CustomEvent("fx:card-ring-3d", { detail: { index: i, card } }));
          card.click();
          timers.push(setTimeout(() => { card.classList.remove("is-picked"); holders[i].visible = true; }, backAt * 1000));
        }, openDelay * 1000));
      }, reduce ? 0 : openAt * 1000));
    };

    let down = null, prevX = 0, moved = false;
    const onDown = (e) => {
      if (e.button) return;
      down = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, type: e.pointerType, idx: hit(e.clientX, e.clientY) };
      prevX = e.clientX;
      moved = false;
      vel = 0;
      if (e.pointerType === "mouse") gl.style.cursor = "grabbing";
    };
    const onMove = (e) => {
      if (down && e.pointerId === down.id) {
        const dx = e.clientX - prevX;
        if (down.type === "mouse") {
          if (!moved) { moved = true; dragging = true; prevX = e.clientX; return; }
          vel = Math.max(-0.2, Math.min(0.2, dx * drag));
          rot += vel;
          prevX = e.clientX;
        } else {
          const tx = e.clientX - down.x, ty = e.clientY - down.y;
          if (!moved && Math.abs(tx) > Math.abs(ty) && Math.abs(tx) > 3) { moved = true; dragging = true; prevX = e.clientX; }
          if (moved) { vel = Math.max(-0.2, Math.min(0.2, (e.clientX - prevX) * swipe)); rot += vel; prevX = e.clientX; }
        }
        return;
      }
      if (e.pointerType !== "mouse" || !hover || reduce) return;
      const i = hit(e.clientX, e.clientY);
      if (i !== hovered) { hovered = i; if (i !== null) hoverOn(i); }
      gl.style.cursor = i !== null ? "pointer" : "";
    };
    const onUp = (e) => {
      if (!down || e.pointerId !== down.id) return;
      const dt = performance.now() - down.t, dist = Math.abs(e.clientX - down.x), distY = Math.abs(e.clientY - down.y);
      const mouse = down.type === "mouse";
      const tap = mouse ? dist <= 2 && dt < 200 : !moved && dist < 3 && distY < 3 && dt < 300;
      if (tap && down.idx !== null) pick(down.idx, mouse);
      if (mouse) {
        // In the original, the window mousemove runs first, so the last movement is 0 — after a drag it settles on the nearest section at once with no inertia
        vel = 0;
        dragging = false;
        if (!anim) snapNearest();
        gl.style.cursor = hovered !== null ? "pointer" : "";
      } else {
        dragging = false;
        if (Math.abs(vel) < 0.005 && !anim) snapNearest();
      }
      down = null;
      moved = false;
    };
    let wheelT = 0;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const d = -e.deltaX * wheel;
      rot += d;
      vel = d;
      clearTimeout(wheelT);
      wheelT = setTimeout(() => { anim = null; snapNearest(); }, 100);
    };
    const onLeave = () => { hovered = null; gl.style.cursor = ""; };
    gl.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    gl.addEventListener("pointerleave", onLeave);
    gl.addEventListener("wheel", onWheel, { passive: false });

    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      place();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      const kw = kc.clientWidth, kh = kc.clientHeight;
      if (kw && kh) { kcam.aspect = kw / kh; kcam.updateProjectionMatrix(); kr.setSize(kw, kh, false); }
      paintAll();
      if (reduce) { group.rotation.y = rot; renderer.render(scene, camera); }
    };
    place();
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && !reduce) intro();
      if (visible && reduce) { group.rotation.y = rot; renderer.render(scene, camera); }
    }, { threshold: 0.1 });
    io.observe(gl);
    if (!reduce) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      clearTimeout(wheelT);
      ro.disconnect();
      io.disconnect();
      gl.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      gl.removeEventListener("pointerleave", onLeave);
      gl.removeEventListener("wheel", onWheel);
      cards.forEach((c) => c.classList.remove("is-picked"));
      el.style.removeProperty("--fx-card-h");
      geo?.dispose();
      mats.forEach((m) => { m.map?.dispose(); m.dispose(); });
      [...sparkles, ...kiras].forEach((m) => m.material.dispose());
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
      kr.dispose();
      gl.remove();
      kc.remove();
      probe.remove();
    };
  }
})();
