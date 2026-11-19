// Work page: number loader → three.js depth flight (over 2000lvh of scroll the camera goes z 0 → −645) → project list (hover photo · press to open).
// Original values (Scene/script.js · helpers.js): FOV 75 · camera z 5 · text 1px = .066 · photo 1px = .1 · fades from distance 50 to 60 (sea panel 180→200, 75→70 nearer)
// · follows scroll .05 (phone .1) · cursor parallax ±.5 follow .1 · z −464~−528 is the black stage · loader 0→99 time constant 2.2s, final run at least 2s, number .65s·curtain .85s power2.inOut.
(() => {
  const { reduced } = T7;
  const THREE = window.THREE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const rgb = (n) => T7.rgb(n).replace("rgba", "rgb").replace(/,\s*[\d.]+\)$/, ")");

  // Number loader — constantly moves and creeps up from 0 to 99, then runs evenly to 100 when loading finishes and lifts away
  const pre = $(".wk-pre"), num = $(".wk-pre__n");
  const loaded = new Promise((done) => {
    if (reduced) { pre.remove(); return done(); }
    T7.lock();
    const t0 = performance.now(), TAU = 2200, MIN = 2000;
    let last = t0, shown = 0, finished = false, fStart = 0, fFrom = 0, fDur = 0, lastInt = -1;
    const paint = () => { const r = Math.floor(shown); if (r !== lastInt) { lastInt = r; num.textContent = r; } };
    const exit = () => {
      gsap.timeline()
        .to(num, { opacity: 0, filter: "blur(5px)", duration: 0.65, ease: "power2.inOut" }, 0)
        .to(pre, { opacity: 0, duration: 0.85, ease: "power2.inOut", onStart: () => (pre.style.pointerEvents = "none"), onComplete: () => { pre.remove(); T7.unlock(); } }, "-=0.2");
      done();
    };
    const tick = (now) => {
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.25) dt = 0.05; else if (dt > 0.1) dt = 0.1;
      if (!finished) {
        const creep = Math.min(99, 100 * (1 - Math.exp(-(now - t0) / TAU)));
        shown = Math.min(creep, Math.min(shown + (creep - shown) * (1 - Math.pow(0.85, dt * 60)), shown + dt * 60));
        paint();
        return requestAnimationFrame(tick);
      }
      if (!fStart) { fStart = now; fFrom = shown; fDur = Math.max(300, (100 - fFrom) * 20, MIN - (now - t0)); }
      const t = Math.min(1, (now - fStart) / fDur), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      shown = Math.min(fFrom + (100 - fFrom) * e, shown + dt * 60);
      paint();
      if (t >= 1) { num.textContent = "100"; setTimeout(exit, 40); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const finish = () => (finished = true);
    if (document.readyState === "complete") finish(); else addEventListener("load", finish);
    setTimeout(finish, 12000);
  });

  // 3D depth flight ------------------------------------------------------------
  const stage = $(".wk-3d__stage"), canvas = $(".wk-3d__canvas"), track = $(".wk-3d__track");
  const hint = $(".wk-3d__hint"), skip = $(".wk-3d__skip"), skipBtn = $(".wk-3d__skipbtn");
  const mobile = innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, stage.clientHeight, false);
  const scene = new THREE.Scene();
  const light = new THREE.Color(rgb("--kf-bg")), dark = new THREE.Color(rgb("--kf-contrast-bg"));
  scene.background = light.clone();
  const camera = new THREE.PerspectiveCamera(75, innerWidth / stage.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  const PPU = 48;
  const fontOf = (li) => `${li.dataset.weight || 300} ${(+li.dataset.size || 18) * 0.066 * PPU}px ${css("--kf-font-display") || "sans-serif"}`;
  const textTexture = (li) => {
    const lines = li.innerHTML.split(/<br\s*\/?>/i).map((s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim()).filter(Boolean);
    const lh = (+li.dataset.lh || 27) * 0.066 * PPU, c = document.createElement("canvas"), g = c.getContext("2d");
    g.font = fontOf(li);
    const w = Math.ceil(Math.max(...lines.map((l) => g.measureText(l).width))) + 8, h = Math.ceil(lh * lines.length) + 8;
    c.width = w; c.height = h;
    g.font = fontOf(li);
    g.fillStyle = li.dataset.tone === "contrast" ? css("--kf-contrast-ink") : css("--kf-ink");
    g.textBaseline = "middle";
    const align = li.dataset.align || "center";
    g.textAlign = align === "left" ? "left" : "center";
    lines.forEach((l, i) => g.fillText(l, align === "left" ? 4 : w / 2, 4 + lh * (i + 0.5)));
    return { c, w: w / PPU, h: h / PPU, align };
  };
  // Image slot — gray panel with two diagonals and a ”what photo is this” label (same as .wf-img in wire.css)
  const photoTexture = (li, live) => {
    const r = +li.dataset.r || 1, W = 512, H = Math.round(W * r), c = document.createElement("canvas"), g = c.getContext("2d");
    c.width = W; c.height = H;
    const fill = css("--wf-fill"), ink = css("--wf-fill-ink"), line = css("--wf-line");
    const draw = (t = 0) => {
      g.fillStyle = fill; g.fillRect(0, 0, W, H);
      if (live) {
        const x = W * (0.5 + 0.3 * Math.sin(t * 0.0009)), y = H * (0.5 + 0.3 * Math.cos(t * 0.0011));
        const gr = g.createRadialGradient(x, y, 0, x, y, W * 0.6);
        gr.addColorStop(0, ink); gr.addColorStop(1, fill);
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
      }
      g.strokeStyle = line; g.lineWidth = 2;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(W, H); g.moveTo(W, 0); g.lineTo(0, H); g.stroke();
      const fs = li.dataset.k === "bg" ? 6 : 22;
      g.font = `500 ${fs}px ${css("--wf-mono") || "monospace"}`;
      const label = li.dataset.label || "", tw = g.measureText(label).width + fs;
      g.fillStyle = fill; g.fillRect((W - tw) / 2, H / 2 - fs * 0.8, tw, fs * 1.6);
      g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, W / 2, H / 2);
    };
    draw();
    return { c, draw };
  };
  const sigTexture = (li) => {
    const holder = document.createElement("div");
    holder.innerHTML = T7.icons.sig;
    const svg = holder.firstElementChild;
    svg.setAttribute("width", "1000"); svg.setAttribute("height", "264");
    svg.querySelectorAll("path").forEach((p) => { p.setAttribute("fill", "none"); p.setAttribute("stroke", css("--kf-contrast-ink")); p.setAttribute("stroke-width", "2.2"); p.setAttribute("stroke-linecap", "round"); });
    const img = new Image(), c = document.createElement("canvas");
    c.width = 1000; c.height = 264;
    const tex = new THREE.CanvasTexture(c);
    img.onload = () => { c.getContext("2d").drawImage(img, 0, 0, 1000, 264); tex.needsUpdate = true; };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
    return tex;
  };

  const meshes = [], videos = [];
  let endCam = 20;
  const tanHalf = Math.tan((75 * Math.PI) / 360);
  $$(".wk-els > li").forEach((li) => {
    const k = li.dataset.k, z = +li.dataset.z || 0;
    let x = +(mobile && li.dataset.mx != null ? li.dataset.mx : li.dataset.x) || 0;
    const y = +(mobile && li.dataset.my != null ? li.dataset.my : li.dataset.y) || 0;
    if (mobile && Math.abs((x * innerWidth) / 1000) < Math.abs(x)) x = (x * innerWidth) / 1000;
    let mesh, mat;
    if (k === "h" || k === "p") {
      const t = textTexture(li), tex = new THREE.CanvasTexture(t.c);
      tex.colorSpace = THREE.SRGBColorSpace;
      mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false });
      mesh = new THREE.Mesh(new THREE.PlaneGeometry(t.w, t.h), mat);
      mesh.position.set(t.align === "left" ? x + t.w / 2 : x, y, -z);
    } else if (k === "img" || k === "video") {
      const px = +li.dataset.w * (mobile ? 0.5 : 1), w = px / 10, h = w * (+li.dataset.r || 1), p = photoTexture(li, k === "video"), tex = new THREE.CanvasTexture(p.c);
      tex.colorSpace = THREE.SRGBColorSpace;
      mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, side: THREE.DoubleSide });
      mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      mesh.position.set(x, y, -z);
      if (k === "video") videos.push({ p, tex });
    } else if (k === "bg") {
      const sa = innerWidth / stage.clientHeight, ia = 1 / (+li.dataset.r || 0.62);
      let w, h;
      if (ia > sa) { w = 2 * tanHalf * 700 * sa; h = w / ia; } else { h = 2 * tanHalf * 300; w = h * ia; }
      const p = photoTexture(li), tex = new THREE.CanvasTexture(p.c);
      tex.colorSpace = THREE.SRGBColorSpace;
      mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0 });
      mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      mesh.position.set(x, y, -z);
      mesh.name = "background";
    } else if (k === "logo") {
      const w = (+li.dataset.w || 140) / 10;
      mat = new THREE.MeshBasicMaterial({ map: sigTexture(li), transparent: true, opacity: 0, depthWrite: false });
      mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.264), mat);
      mesh.position.set(x, y, -z);
      if (li.dataset.zone === "dark") mesh.name = "zone";
    } else if (k === "dot") {
      mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(rgb("--kf-contrast-ink")), transparent: true, opacity: 0 });
      mesh = new THREE.Mesh(new THREE.CircleGeometry(0.3, 64), mat);
      mesh.position.set(x, y, -z);
    }
    if (!mesh) return;
    scene.add(mesh);
    meshes.push(mesh);
    if (k === "h" || k === "p" || k === "img") endCam = z - 35;
  });

  const opacityAt = (m) => {
    const d = m.position.distanceTo(camera.position);
    let max = 60, start = 50;
    if (m.name === "background") { max = 200; start = 180; }
    let o = d > start ? Math.max(0, Math.min(1, 1 - (d - start) / (max - start))) : 1;
    if (m.name === "background" && d < 75) o = Math.max(0, Math.min(1, 1 - (75 - d) / 5));
    return o;
  };
  renderer.compile(scene, camera);

  let live = false, inZone = false;
  const pointer = new THREE.Vector2(0, 0);
  if (!mobile) addEventListener("mousemove", (e) => { pointer.x = (e.clientX / innerWidth) * 2 - 1; pointer.y = -(e.clientY / stage.clientHeight) * 2 + 1; });
  let target = 0, prog = 0;
  const SCRUB = mobile ? 0.1 : 0.05;
  const span = () => track.getBoundingClientRect().height - innerHeight;
  const onScroll = () => (target = Math.max(0, Math.min(1, scrollY / Math.max(1, span()))));
  addEventListener("scroll", onScroll, { passive: true });
  const show = (el, on, display = "block") => {
    if (on && getComputedStyle(el).display === "none") { el.style.display = display; gsap.to(el, { opacity: 1, duration: 0.5 }); }
    if (!on && getComputedStyle(el).display !== "none") gsap.to(el, { opacity: 0, duration: 0.5, onComplete: () => (el.style.display = "none") });
  };
  const frame = () => {
    prog += (target - prog) * (reduced ? 1 : SCRUB);
    camera.position.z = 5 - prog * endCam;
    const z = camera.position.z;
    const zone = z < -464 && z > -528;
    if (zone) { camera.position.x = 0; camera.position.y = 0; }
    else { camera.position.x += (pointer.x * 0.5 - camera.position.x) * 0.1; camera.position.y += (pointer.y * 0.5 - camera.position.y) * 0.1; }
    if (zone !== inZone) {
      inZone = zone;
      scene.background.copy(zone ? dark : light);
      document.body.classList.toggle("wk-dark", zone);
      meshes.forEach((m) => { if (m.name === "zone") m.material.opacity = zone ? 1 : 0; });
    }
    if (live) {
      if (z < -10) show(hint, false), show(skipBtn, false);
      else if (z > -10 && z < 0) show(hint, true), show(skipBtn, true, "flex");
      show(skip, z < -40 && prog < 0.999);
      meshes.forEach((m) => { if (m.name === "zone") return; const o = opacityAt(m); m.material.opacity = o; m.visible = o > 0; });
    }
    const now = performance.now();
    videos.forEach((v) => { v.p.draw(now); v.tex.needsUpdate = true; });
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  loaded.then(() => {
    hint.style.display = "block";
    skipBtn.style.display = "flex";
    gsap.to(skipBtn, { opacity: 1, duration: 0.5 });
    const first = meshes.filter((m) => m.name !== "zone" && opacityAt(m) === 1);
    if (!first.length) live = true;
    first.forEach((m, i) => gsap.to(m.material, { opacity: 1, duration: 1, ease: "power1.out", onComplete: () => { if (i === first.length - 1) live = true; } }));
  });

  const toList = (e) => {
    e.preventDefault();
    const y = $(".wk-content").getBoundingClientRect().top + scrollY;
    scrollTo({ top: y, behavior: "smooth" });
  };
  [skip, skipBtn].forEach((a) => a.addEventListener("click", toList));
  addEventListener("resize", () => {
    camera.aspect = innerWidth / stage.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, stage.clientHeight, false);
  });

  // When the list rises from below, the 3D panel blurs and the header line comes down from above and attaches
  const head = $(".t7-head");
  gsap.to(canvas, { opacity: 0, scrollTrigger: { trigger: ".wk-content", start: "top bottom", end: "+=100%", scrub: 1,
    onEnter: () => head?.classList.add("is-fixed"), onLeaveBack: () => { if (!document.body.classList.contains("menu-open")) head?.classList.remove("is-fixed"); } } });

  // Project list — hover reveals a photo that shifts ±25% by the cursor’s horizontal position, and clicking opens only that row
  const rows = $$(".wk-row");
  rows.forEach((row) => {
    const img = $(".wk-row__img", row);
    row.addEventListener("mousemove", (e) => {
      if (innerWidth < 992) return;
      const r = row.getBoundingClientRect();
      img.style.transform = `translateX(${((e.clientX - r.left) / r.width - 0.5) * 50}%)`;
    });
    row.addEventListener("mouseleave", () => (img.style.transform = "translateX(0)"));
    row.addEventListener("click", (e) => {
      if (e.target.closest(".wk-row__pill")) return;
      const open = row.classList.contains("is-open");
      rows.forEach((r) => r.classList.remove("is-open"));
      if (!open) row.classList.add("is-open");
    });
  });
})();
