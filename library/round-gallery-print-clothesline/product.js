// Shop clothesline — panel height is based on the screen height (vh) seen by a 42° FOV camera (z 10) = min(.42vh, .54vw/(5/7)), gap between panels .36×width, the line is a parabola sagging .075vh across the screen width.
// The panel hangs from the rope by a .03vh clip string, and tilt a swings by (target − a)×(30/weight) − 4.4×angular velocity (target = −2.4×line speed×weight + wind .045·sin(1.1t), ±.42 rad).
// The center panel (distance .85 cell gaussian) has its shaking settle and comes forward by .2 while brightness goes .66 → 1. Walking: 1/210 rad/px · follow .09 · throw 8 · sticks after .24s.
(() => {
  const SB = window.SB;
  const R = 5 / 7;
  const RATIOS = [5 / 7, 4 / 5, 1.25, 3 / 4, 1, 1.4, 2 / 3, 4 / 3];
  const SUBJECTS = ["Crowd of people · bright daytime", "Person, half-length · Red outfit", "Street view · blue sky", "People dancing · pink background", "Playground · green grass", "Inside the kitchen · warm light", "Portrait face · Profile", "Market · busy evening"];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const hash = (n) => { const t = 43758.5453 * Math.sin(127.1 * n); return t - Math.floor(t); };
  const around = (v, span) => v - Math.round(v / span) * span;
  const fontOf = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || "serif";

  function sheetTexture(n, ratio, subject) {
    const cv = document.createElement("canvas");
    const w = ratio >= 1 ? 360 : Math.round(360 * ratio), h = ratio >= 1 ? Math.round(360 / ratio) : 360;
    cv.width = w; cv.height = h;
    const c = cv.getContext("2d");
    c.fillStyle = SB.css(`color-mix(in srgb, var(--kf-ink) ${10 + (n % 5) * 4}%, var(--kf-surface))`);
    c.fillRect(0, 0, w, h);
    c.strokeStyle = SB.css("color-mix(in srgb, var(--kf-ink) 24%, var(--kf-surface))");
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(w, h); c.moveTo(w, 0); c.lineTo(0, h); c.stroke();
    c.fillStyle = SB.css("var(--kf-surface)");
    c.fillRect(w / 2 - 125, h / 2 - 32, 250, 64);
    c.fillStyle = SB.css("var(--kf-dim)");
    c.textAlign = "center"; c.textBaseline = "middle";
    c.font = `500 21px ${fontOf("--kf-font-mono")}`;
    c.fillText(`Collection cover ${String(n + 1).padStart(2, "0")}`, w / 2, h / 2 - 11);
    c.font = `400 16px ${fontOf("--kf-font-mono")}`;
    c.fillText(subject, w / 2, h / 2 + 13);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  function line(stageEl) {
    const scene = stageEl.closest(".scene");
    const titles = [...scene.querySelectorAll(".scene-index a")].map((a) => a.textContent.replace(/ — .*$/, "").trim());
    const M = Math.max(1, titles.length);
    const items = titles.map((t, i) => ({ title: t, ratio: RATIOS[(i * 3) % RATIOS.length], subject: SUBJECTS[i % SUBJECTS.length] }));
    const shape = items.map(({ ratio: r }) => (r > 1 ? { w: 1, h: 1 / r } : { w: r, h: 1 }));
    const minW = Math.min(...shape.map((s) => s.w)), tallest = Math.max(...shape.map((s) => s.h + 0.2 * s.w));

    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); } catch { return () => {}; }
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.toneMapping = THREE.NoToneMapping;
    stageEl.append(renderer.domElement);
    const three = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    cam.position.set(0, 0, 10);

    let view = { w: 1, h: 1, px: 1 }, E = null;
    const layout = () => {
      const vh = 2 * 10 * Math.tan(THREE.MathUtils.degToRad(21)), vw = vh * (innerWidth / innerHeight);
      view = { w: vw, h: vh, px: vh / innerHeight };
      const h = Math.min(0.42 * vh, (0.54 * vw) / R), w = h * R, sp = w * 1.36, drop = 0.03 * vh;
      const count = Math.max(M, Math.ceil((Math.ceil(vw / (h * (minW + 0.36 * R) * 0.55)) + 3) / M) * M);
      E = { count, drop, h, halfW: vw / 2, sag: 0.075 * vh, top: h / 2 + drop + 0.05 * vh, w, sp };
    };
    layout();

    const inkMat = new THREE.MeshBasicMaterial({ toneMapped: false });
    const lineMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.45 });
    let wire = null;
    const buildWire = () => {
      if (wire) { three.remove(wire); wire.geometry.dispose(); }
      const pts = [];
      for (let i = 0; i <= 60; i++) { const x = -E.halfW + (2 * E.halfW * i) / 60, s = x / E.halfW; pts.push(new THREE.Vector3(x, -E.sag * (1 - s * s), 0)); }
      wire = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
      three.add(wire);
    };
    const tex = items.map((it, i) => sheetTexture(i, it.ratio, it.subject));
    let pegs = [], ang, angVel, xs, widths, heights, starts;
    const plane = new THREE.PlaneGeometry(1, 1);
    const buildPegs = () => {
      pegs.forEach((g) => { three.remove(g); g.userData.mat.dispose(); });
      pegs = Array.from({ length: E.count }, (_, r) => {
        const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: tex[r % M] });
        const sheet = new THREE.Mesh(plane, mat), string = new THREE.Mesh(plane, inkMat);
        g.add(sheet, string);
        g.userData = { mat, fade: 0 };
        three.add(g);
        return g;
      });
      ang = new Float32Array(E.count); angVel = new Float32Array(E.count); xs = new Float32Array(E.count);
      widths = new Float32Array(E.count); heights = new Float32Array(E.count); starts = new Float32Array(E.count + 1);
    };
    const recolor = () => {
      const [r, g, b] = SB.rgb("var(--kf-ink)");
      inkMat.color.setRGB(r, g, b, THREE.SRGBColorSpace);
      lineMat.color.setRGB(r, g, b, THREE.SRGBColorSpace);
    };
    recolor();
    addEventListener("theme-change", recolor);
    buildWire(); buildPegs();
    const fit = () => {
      renderer.setSize(innerWidth, innerHeight);
      cam.aspect = innerWidth / innerHeight;
      cam.updateProjectionMatrix();
      const was = E.count;
      layout();
      buildWire();
      if (E.count !== was) buildPegs();
    };
    fit();
    addEventListener("resize", fit);

    let lineY = null, sheetH = E.h, active = -1;
    const nameEl = scene.querySelector(".scene__name > div"), countEl = scene.querySelector(".scene__count b"), meter = scene.querySelector(".sway-meter > span");
    const say = (i) => {
      if (!nameEl) return;
      nameEl.querySelector("h2").textContent = items[i].title;
      if (countEl) countEl.textContent = String(i + 1).padStart(2, "0");
      gsap.fromTo(nameEl, { opacity: 0, y: 12 }, { duration: 0.45, ease: "power2.out", opacity: 1, overwrite: true, y: 0 });
    };
    // How many slots the plate at the pressed spot (screen −1~1) is from the center — 0 means the center plate
    const under = (ndc) => {
      const x = ndc * E.halfW;
      for (let e = 0; e < E.count; e++) {
        if (Math.abs(xs[e] - x) > (widths[e] || E.w) / 2) continue;
        const k = e - (((Math.round(w.run.pos) % E.count) + E.count) % E.count);
        return k - Math.round(k / E.count) * E.count;
      }
      return null;
    };
    const w = SB.walk(stageEl, { perPx: 1 / 210, fling: 8, ease: 0.09, snap: 0.24, under, onOpen: () => {} });
    stageEl.addEventListener("pointermove", (e) => stageEl.classList.toggle("opens", under((e.clientX / innerWidth) * 2 - 1) === 0));

    let last = performance.now(), raf = 0, swaySum = 0;
    const frame = (now) => {
      const dt = Math.min(Math.max(0, (now - last) / 1000), 1 / 30);
      last = now;
      const t = SB.reduce() ? 0 : now / 1000;
      const { count, halfW, top, sag, drop } = E;
      const floorY = -view.h / 2 + 150 * view.px;
      const goalH = clamp(Math.min(E.h, (top - drop - floorY) / tallest), 0.55 * E.h, E.h);
      if (lineY === null) { lineY = top; sheetH = goalH; }
      const q = Math.min(1, 6 * dt);
      lineY += (top - lineY) * q;
      sheetH += (goalH - sheetH) * q;
      const gap = sheetH * R * 0.36;
      for (let e = 0; e < count; e++) { const s = shape[e % M]; widths[e] = sheetH * s.w; heights[e] = sheetH * s.h; }
      let span = 0;
      for (let e = 0; e < count; e++) { starts[e] = span; span += (widths[e] + widths[(e + 1) % count]) / 2 + gap; }
      starts[count] = span;
      const fl = Math.floor(w.run.pos), at = ((fl % count) + count) % count;
      const here = starts[at] + (w.run.pos - fl) * (starts[at + 1] - starts[at]);
      wire.position.y = lineY;
      let best = Infinity, pick = 0;
      swaySum = 0;
      pegs.forEach((g, r) => {
        const sw = widths[r], sh = heights[r], cell = sw + gap;
        const x = around(starts[r] - here, span);
        xs[r] = x;
        const m = clamp(x / halfW, -1, 1);
        g.position.set(x, lineY - sag * (1 - m * m), 0);
        const weight = 0.75 + 0.5 * hash(r);
        const wind = 0.045 * Math.sin(1.1 * t + 6.28 * hash(r));
        const acc = (clamp(-2.4 * w.run.vel * weight, -0.42, 0.42) + wind - ang[r]) * (30 / weight) - 4.4 * angVel[r];
        angVel[r] += acc * dt;
        ang[r] += angVel[r] * dt;
        if (Math.abs(ang[r]) > 0.42) { ang[r] = clamp(ang[r], -0.42, 0.42); angVel[r] *= 0.4; }
        g.rotation.z = ang[r];
        const centre = Math.exp(-((x / (0.85 * cell)) ** 2));
        if (centre > 0.02) { ang[r] -= ang[r] * Math.min(1, 6 * dt * centre); angVel[r] -= angVel[r] * Math.min(1, 6 * dt * centre); }
        const [sheet, string] = g.children;
        g.userData.fade += (1 - g.userData.fade) * Math.min(1, 5 * dt);
        const op = g.userData.fade;
        sheet.scale.set(sw, sh, 1);
        sheet.position.set(0, -(drop + sh / 2), 0.2 * centre);
        g.userData.mat.color.setScalar(0.66 + 0.34 * centre);
        g.userData.mat.opacity = op;
        string.scale.set((0.022 / 0.36) * gap, drop * op, 1);
        string.position.set(0, (-drop * op) / 2, 0);
        swaySum += Math.abs(ang[r]);
        if (op > 0.5 && Math.abs(x) < best) { best = Math.abs(x); pick = r % M; }
      });
      if (pick !== active) { active = pick; say(pick); }
      if (meter) meter.style.transform = `scaleX(${Math.min(1, (6 * swaySum) / count)})`;
      renderer.render(three, cam);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); w.stop(); removeEventListener("resize", fit); removeEventListener("theme-change", recolor); renderer.dispose(); renderer.domElement.remove(); };
  }

  function views() {
    const sw = document.querySelector(".switch"), list = document.querySelector(".list-view"), sc = document.querySelector(".scene");
    if (!sw || !list) return;
    sw.addEventListener("click", (e) => {
      const b = e.target.closest("[data-view]");
      if (!b) return;
      const isList = b.dataset.view === "list";
      sw.querySelectorAll("[data-view]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      list.hidden = !isList;
      if (sc) sc.hidden = isList;
      document.documentElement.toggleAttribute("data-scene", !isList);
      document.documentElement.dataset.view = isList ? "list" : "gallery";
    });
  }

  const boot = () => {
    views();
    const stage = document.querySelector(".scene--line .scene__stage");
    if (stage && window.THREE) line(stage);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
