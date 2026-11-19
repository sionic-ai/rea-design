// Home — owned-item Ferris wheel (three.js) and business section. Original values as is, photos are our own placeholder plates drawn on canvas.
// The hero cylinder band is spun by the photo-cylinder-spin part (the options in index.html are the original values).
// Owned-items Ferris wheel (1025px and up): 32 panels of 1.6×1 · radius 5.6 · one turn on the X axis in 66s · base Y 24°·Z -15° · panel Y -10° · camera z 8.6 · base x -.6 (-1.1 at 1280 and below)
// Business section: on mouse devices a centered 25vw square photo widens over 200vh to fill the whole screen (screen ratio) and scales 1→1.18 (scrub .7), and at progress .2 · .4 · .6 the next photo comes in (.25s).
//   On touch devices a 50vw square widens over 140vh and scales 1→1.1, tied directly to the scroll position.
// Owned-items Ferris wheel (1024px and below): 20 panels loop around a Y-axis ring (radius 5.6) once per 66s · front tilt X 12° · base Z 12° · base (-.8, .28) · camera z 6.2+3.4/3.6/3.9 (767·575 and below).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  // Builds the Ferris wheel after the three module is attached to window.THREE (three:ready)
  const start = (T) => {

  // Photo slot panel: labels what the photo is over a sky-blue and ink-black gradient
  function photo(label, w = 700, h = 440, i = 0) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const g = c.getContext("2d"), grad = g.createLinearGradient(0, 0, w, h);
    const a = css("--kf-accent"), ink = css("--kf-ink"), bg = css("--kf-surface");
    grad.addColorStop(0, i % 2 ? bg : a); grad.addColorStop(1, ink);
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    g.globalAlpha = 0.18; g.fillStyle = bg;
    for (let k = 0; k < 5; k++) g.fillRect((k * w) / 5 + 10, h * 0.25, w / 5 - 20, h * 0.75);
    g.globalAlpha = 1; g.fillStyle = bg; g.font = `500 ${Math.round(h / 16)}px ${css("--kf-font-sans")}`;
    g.fillText(label, 24, h - 28);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8;
    return t;
  }

  // ── Owned items Ferris wheel ──
  const propEl = document.querySelector(".js-ring-property");
  if (T && propEl && innerWidth > 1024) {
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.domElement.className = "jf-ring__canvas"; propEl.appendChild(renderer.domElement);
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2 + 2.4); scene.add(camera);
    const rig = new T.Group(); rig.position.x = innerWidth <= 1280 ? -1.1 : -0.6;
    rig.rotation.y = T.MathUtils.degToRad(24); rig.rotation.z = T.MathUtils.degToRad(-15); scene.add(rig);
    const ring = new T.Group(); rig.add(ring);
    const cardW = 1.6, cardH = 1, radius = 5.6, count = (() => { let s = Math.max(32, Math.floor((2 * Math.PI * radius) / (cardW * 0.7))); return s % 2 ? s + 1 : s; })();
    const LABELS = ["Managed property exterior · Clear day", "Entrance hall · Warm lighting", "Living room · Window natural light", "Kitchen · Bright interior", "Rooftop · Sky", "Hallway · Evening"];
    const tex = LABELS.map((l, i) => photo(l, 640, 400, i));
    const backC = document.createElement("canvas"); backC.width = backC.height = 8; const bg = backC.getContext("2d"); bg.fillStyle = css("--kf-raised"); bg.fillRect(0, 0, 8, 8);
    const backMat = new T.MeshBasicMaterial({ map: new T.CanvasTexture(backC), side: T.BackSide, transparent: true });
    const geo = new T.PlaneGeometry(cardW, cardH), comp = new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), T.MathUtils.degToRad(-10));
    for (let i = 0; i < count; i++) {
      const f = (i / count) * Math.PI * 2, y = Math.cos(f) * radius, zz = Math.sin(f) * radius;
      const node = new T.Object3D(); node.position.set(0, y, zz);
      const nrm = new T.Vector3(0, y, zz).normalize(), right = Math.abs(nrm.dot(new T.Vector3(1, 0, 0))) < 0.98 ? new T.Vector3(1, 0, 0) : new T.Vector3(0, 1, 0);
      const xAxis = right.clone().sub(nrm.clone().multiplyScalar(right.dot(nrm))).normalize(), yAxis = new T.Vector3().crossVectors(nrm, xAxis).normalize();
      const q = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(xAxis, yAxis, nrm)).multiply(comp);
      const front = new T.Mesh(geo, new T.MeshBasicMaterial({ map: tex[i % tex.length], side: T.FrontSide })), rear = new T.Mesh(geo, backMat);
      front.quaternion.copy(q); rear.quaternion.copy(q); node.add(front, rear); ring.add(node);
    }
    const fit = () => { const r = propEl.getBoundingClientRect(), w = Math.max(1, Math.floor(r.width)), h = Math.max(1, Math.floor(r.height)); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    fit(); addEventListener("resize", fit);
    if (!reduce) gsap.to(ring.rotation, { x: "+=" + Math.PI * 2, duration: 66, repeat: -1, ease: "none" });
    const loop = () => { requestAnimationFrame(loop); renderer.render(scene, camera); };
    loop();
  } else if (T && propEl) {
    // On narrow screens, like the original phone version, stand the ring upright and rotate it around the Y axis — panels face outward, count is circumference / (panel width × 1.12) panels (min 20, even).
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.domElement.className = "jf-ring__canvas"; propEl.appendChild(renderer.domElement);
    const pull = () => (innerWidth <= 575 ? 3.9 : innerWidth <= 767 ? 3.6 : 3.4);
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2 + pull()); scene.add(camera);
    const tilt = new T.Group(); tilt.rotation.x = T.MathUtils.degToRad(12); scene.add(tilt);
    const rig = new T.Group(); rig.position.set(-0.8, 0.28, 0); rig.rotation.z = T.MathUtils.degToRad(12); tilt.add(rig);
    const ring = new T.Group(); rig.add(ring);
    const cardW = 1.6, cardH = 1, radius = 5.6;
    let count = Math.max(20, Math.floor((2 * Math.PI * radius) / (cardW * 1.12))); if (count % 2) count++;
    const LABELS = ["Managed property exterior · Clear day", "Entrance hall · Warm lighting", "Living room · Window natural light", "Kitchen · Bright interior", "Rooftop · Sky"];
    const tex = LABELS.map((l, i) => photo(l, 640, 400, i));
    const backC = document.createElement("canvas"); backC.width = backC.height = 8; const bg = backC.getContext("2d"); bg.fillStyle = css("--kf-raised"); bg.fillRect(0, 0, 8, 8);
    const backMat = new T.MeshBasicMaterial({ map: new T.CanvasTexture(backC), side: T.BackSide, transparent: true });
    const geo = new T.PlaneGeometry(cardW, cardH), up = new T.Vector3(0, 1, 0);
    for (let i = 0; i < count; i++) {
      const f = (i / count) * Math.PI * 2, x = Math.cos(f) * radius, z = Math.sin(f) * radius;
      const node = new T.Object3D(); node.position.set(x, 0, z);
      const n = new T.Vector3(x, 0, z).normalize(), side = new T.Vector3().crossVectors(up, n).normalize(), top = new T.Vector3().crossVectors(n, side).normalize();
      const q = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(side, top, n));
      const front = new T.Mesh(geo, new T.MeshBasicMaterial({ map: tex[i % tex.length], side: T.FrontSide })), rear = new T.Mesh(geo, backMat);
      front.quaternion.copy(q); rear.quaternion.copy(q); node.add(front, rear); ring.add(node);
    }
    const fit = () => { const r = propEl.getBoundingClientRect(), w = Math.max(1, Math.floor(r.width)), h = Math.max(1, Math.floor(r.height)); renderer.setSize(w, h, false); camera.aspect = w / h; camera.position.z = 6.2 + pull(); camera.updateProjectionMatrix(); };
    fit(); addEventListener("resize", fit);
    if (!reduce) gsap.to(ring.rotation, { y: "-=" + Math.PI * 2, duration: 66, repeat: -1, ease: "none" });
    const loop = () => { requestAnimationFrame(loop); renderer.render(scene, camera); };
    loop();
  }

  };
  window.THREE ? start(window.THREE) : addEventListener("three:ready", () => start(window.THREE), { once: true });

  // ── Business Section ──
  // As in the original, touch devices (userAgentData.mobile, else coarse pointer · long side 1024 or less) get the phone version drawn directly from scroll position, otherwise the wide ScrollTrigger version
  const sec = document.querySelector(".jf-business"), wrap = sec?.querySelector(".jf-business__bgwrap"), bgbox = sec?.querySelector(".jf-business__bgbox");
  const mobileLike = () => {
    const d = navigator.userAgentData;
    if (d && typeof d.mobile == "boolean") return d.mobile;
    return matchMedia("(pointer: coarse)").matches || Math.max(innerWidth, innerHeight) <= 1024;
  };
  if (sec && wrap && bgbox && mobileLike()) {
    // Phone panel: after the section top reaches the screen top, over 140vh a 50vw square → 100vw × screen ratio, inner 1 → 1.1x, and the photo swaps instantly at progress .2 · .4 · .6 (no tween)
    const bgs = [...bgbox.querySelectorAll(".jf-business__bg")];
    const EXPAND = 140, START = 50, SCALE = 1.1, viewAR = innerWidth / Math.max(1, innerHeight);
    sec.classList.add("is-physical");
    const spacer = document.createElement("div");
    spacer.className = "jf-business__spacer"; spacer.setAttribute("aria-hidden", "true");
    wrap.after(spacer);
    let startY = 0, endY = 1, vw = innerWidth, raf = 0;
    const expandPx = () => Math.round(innerHeight * (EXPAND / 100));
    const pageY = (el) => { let y = 0; for (; el; el = el.offsetParent) y += el.offsetTop || 0; return y; };
    const render = () => {
      const y = scrollY, e = reduce ? 1 : y <= startY ? 0 : y >= endY ? 1 : (y - startY) / Math.max(1, endY - startY);
      bgbox.style.width = START + (100 - START) * e + "vw";
      bgbox.style.aspectRatio = String(1 + (viewAR - 1) * e);
      const k = e >= 0.6 ? 3 : e >= 0.4 ? 2 : e >= 0.2 ? 1 : 0;
      bgs.forEach((b, i) => { b.style.transform = `scale(${1 + (SCALE - 1) * e})`; b.style.opacity = i === k ? "1" : "0"; });
    };
    const measure = () => { spacer.style.height = expandPx() + "px"; startY = pageY(sec); endY = startY + expandPx(); render(); };
    measure();
    addEventListener("load", measure, { once: true });
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); }, { passive: true });
    addEventListener("resize", () => { if (innerWidth !== vw) { vw = innerWidth; measure(); } }, { passive: true });
    addEventListener("orientationchange", () => setTimeout(measure, 350), { passive: true });
  } else if (sec && wrap && bgbox) {
    const bgs = [...bgbox.querySelectorAll(".jf-business__bg")];
    const ratio = () => innerWidth / Math.max(1, innerHeight);
    sec.classList.add("is-expand");
    gsap.set(bgs, { opacity: 0, scale: 1 }); gsap.set(bgs[0], { opacity: 1 });
    if (reduce) { bgbox.style.width = "100vw"; bgbox.style.aspectRatio = String(ratio()); gsap.set(bgs, { opacity: 0, scale: 1.18 }); gsap.set(bgs[bgs.length - 1], { opacity: 1 }); }
    else {
      // The hero rises in place after 200vh (yPercent 0 → -50 while going from top center → center center) and once it reaches the center it stays pinned until the section ends
      const head = sec.querySelector(".jf-business__heading");
      gsap.set(head, { yPercent: 0 });
      gsap.to(head, { yPercent: -50, ease: "none", scrollTrigger: { trigger: head, start: "top center", end: "center center", scrub: 0.7, invalidateOnRefresh: true } });
      ScrollTrigger.create({ trigger: head, start: "center center", endTrigger: sec, end: "bottom bottom", pin: true, pinSpacing: false, pinType: "transform", anticipatePin: 1, invalidateOnRefresh: true });
      const len = () => "+=" + Math.round(innerHeight * 2);
      ScrollTrigger.create({ trigger: wrap, start: "center center", end: len, scrub: 0.7, invalidateOnRefresh: true, onUpdate: (s) => { bgbox.style.width = 25 + 75 * s.progress + "vw"; bgbox.style.aspectRatio = String(1 + (ratio() - 1) * s.progress); } });
      ScrollTrigger.create({ trigger: wrap, start: "center center", end: len, scrub: 0.7, invalidateOnRefresh: true, onUpdate: (s) => gsap.set(bgs, { scale: 1 + 0.18 * s.progress }) });
      ScrollTrigger.create({ trigger: wrap, start: "center center", end: len, scrub: 0.7, invalidateOnRefresh: true, onUpdate: (s) => { const p = s.progress, k = p >= 0.6 ? 3 : p >= 0.4 ? 2 : p >= 0.2 ? 1 : 0; bgs.forEach((b, i) => gsap.to(b, { opacity: i === k ? 1 : 0, duration: 0.25, overwrite: "auto" })); } });
    }
  }
})();
