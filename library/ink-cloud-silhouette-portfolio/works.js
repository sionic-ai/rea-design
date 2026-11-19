/* Work: a slanted band of work screens (three.js) and the title · info · page-number roll when the work changes.
   Card shader (ours): the card first sweeps across as a black panel (.9s expo.inOut, .08s per card), and 1.2s later the picture sweeps out from bottom to top (1.1s circ.inOut).
   Red and blue split sideways by scroll speed (.35 × speed/width), out-of-focus cards blur (mipmap 1.6) and contrast drops to .92 (.55s). */
(() => {
  const css = (name) => { const p = document.createElement("i"); p.style.color = `var(${name})`; document.body.append(p); const c = getComputedStyle(p).color; p.remove(); return c; };
  const font = (name) => { const p = document.createElement("i"); p.style.fontFamily = `var(${name})`; document.body.append(p); const f = getComputedStyle(p).fontFamily; p.remove(); return f; };

  // Card image: slot for a tall web screen capture (light / dark panel) + a label saying which screen it is
  const cardTexture = (el) => {
    const c = Object.assign(document.createElement("canvas"), { width: 600, height: 900 }), g = c.getContext("2d");
    const dark = el.dataset.tone === "dark";
    g.fillStyle = css(dark ? "--kf-contrast-bg" : "--kf-bg"); g.fillRect(0, 0, 600, 900);
    g.fillStyle = css(dark ? "--kf-contrast-ink" : "--kf-ink");
    g.globalAlpha = 0.9; g.font = `500 96px ${font("--kf-font-display")}`; g.textBaseline = "top";
    el.textContent.trim().split(/\s+/).forEach((w, i) => g.fillText(w, 40, 60 + i * 92));
    g.globalAlpha = 0.14; for (let i = 0; i < 9; i++) g.fillRect(40, 420 + i * 34, 520 - (i % 3) * 120, 10);
    // Photo slot: needs fine grain (thin lines and dots) so the out-of-focus blur looks like a real photo
    g.globalAlpha = 0.22;
    for (let y = 230; y < 400; y += 3) for (let x = 40; x < 560; x += 3) if ((x * 7 + y * 13) % 11 < 4) g.fillRect(x, y, 1.5, 1.5);
    for (let i = 0; i < 40; i++) g.fillRect(40, 560 + i * 4, 260 + (i * 37) % 240, 1);
    g.globalAlpha = 0.6; g.font = `500 24px ${font("--kf-font-sans")}`;
    const words = el.dataset.label.split(" "); let line = "", y = 760;
    words.forEach((w) => { const t = line ? `${line} ${w}` : w; if (g.measureText(t).width > 520) { g.fillText(line, 40, y); line = w; y += 32; } else line = t; });
    g.fillText(line, 40, y); g.globalAlpha = 1;
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 4;
    return t;
  };

  const VERT = `
    uniform float uShift; uniform vec2 uSize; varying vec2 vUv;
    void main(){ vUv = uv; vec3 p = position; p.x += sin(uv.y * 3.14159) * uShift * 0.06; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`;
  const FRAG = `
    precision highp float;
    uniform sampler2D tMap; uniform float uShift, uFocus, uCardReveal, uMediaReveal; uniform vec2 uSize; uniform vec3 uBlank;
    varying vec2 vUv;
    float sweep(float r, float x){ if (r >= 1.0) return 1.0; float fw = fwidth(x); return 1.0 - smoothstep(r - fw, r + fw, x); }
    void main(){
      if (uCardReveal <= 0.0) discard;
      float card = sweep(uCardReveal, vUv.x);
      if (card <= 0.0) discard;
      float media = sweep(uMediaReveal, 1.0 - vUv.y);
      float bias = (1.0 - uFocus) * 1.6;
      vec2 split = vec2(uShift / uSize.x * 0.35, 0.0);
      vec3 img = vec3(texture2D(tMap, vUv + split, bias).r, texture2D(tMap, vUv, bias).g, texture2D(tMap, vUv - split, bias).b);
      img = (img - 0.5) * mix(0.92, 1.0, uFocus) + 0.5;
      gl_FragColor = vec4(mix(uBlank, img, media), card);
    }`;

  DG.page("work", {
    mount(root, { initial = true } = {}) {
      const hero = root.querySelector("[data-work-hero]"), range = root.querySelector("#work-sticky-range"), host = root.querySelector(".work-hero__rail");
      const items = [...root.querySelectorAll(".work-hero__data > li")];
      const cv = host.querySelector("canvas");
      const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
      const rail = new THREE.Group(); scene.add(rail);
      const blank = new THREE.Vector3(...css("--kf-contrast-bg").match(/[\d.]+/g).slice(0, 3).map((v) => v / 255));
      const shift = { value: 0 };
      const cards = [];
      items.forEach((li, pi) => [...li.querySelectorAll("[data-card]")].forEach((el) => {
        const mat = new THREE.ShaderMaterial({
          vertexShader: VERT, fragmentShader: FRAG, transparent: true,
          uniforms: { tMap: { value: cardTexture(el) }, uShift: shift, uSize: { value: new THREE.Vector2(1, 1) }, uFocus: { value: 1 }, uCardReveal: { value: DG.reduce ? 1 : 0 }, uMediaReveal: { value: DG.reduce ? 1 : 0 }, uBlank: { value: blank } },
        });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 24), mat); m.userData = { project: pi }; rail.add(m); cards.push(m);
      }));
      // Band: tilts the vertical stack of cards by 37° so they flow from upper right to lower left
      let W = 1, H = 1, cw = 1, ch = 1, gap = 8, total = 1;
      const layout = () => {
        W = host.clientWidth; H = host.clientHeight;
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(W, H, false);
        cam.left = -W / 2; cam.right = W / 2; cam.top = H / 2; cam.bottom = -H / 2; cam.updateProjectionMatrix();
        const compact = W <= 1024;
        cw = compact ? W * 0.9 : Math.min(W * 0.46, H * 0.95); ch = compact ? cw * 0.7 : cw * 1.5; gap = compact ? 4 : Math.max(4, Math.min(8, W * 0.0046));
        cards.forEach((m, i) => { m.scale.set(cw, ch, 1); m.material.uniforms.uSize.value.set(cw, ch); m.position.set(0, -i * (ch + gap), 0); });
        total = cards.length * (ch + gap);
        rail.rotation.z = compact ? 0 : -THREE.MathUtils.degToRad(37);
        rail.position.set(compact ? 0 : W * 0.2, compact ? H * 0.5 - ch * 0.85 : 0, 0);
      };
      layout(); const ro = new ResizeObserver(layout); ro.observe(host);

      // First appearance: when opened directly by URL, the card image (DOM) shows right away like the original, then after WebGL warms up (about 4 seconds measured) the band takes over and out-of-focus cards blur.
      // On arriving from another page, cards sweep out as a black panel, then the image sweeps out (.9s expo.inOut .08s per card, image 1.1s circ.inOut after 1.2s)
      let live = DG.reduce || !initial;
      const U = (k) => cards.map((m) => m.material.uniforms[k]);
      const intro = DG.reduce ? null : initial
        ? gsap.timeline({ delay: 0.2 }).to([...U("uCardReveal"), ...U("uMediaReveal")], { value: 1, duration: 0.35, ease: "power2.out" }, 0).call(() => (live = true), null, 4.1)
        : gsap.timeline({ delay: 0.3 }).to(U("uCardReveal"), { value: 1, duration: 0.9, stagger: 0.08, ease: "expo.inOut" }, 0).to(U("uMediaReveal"), { value: 1, duration: 1.1, stagger: 0.08, ease: "circ.inOut" }, 1.2);
      DG.reveal(hero);

      // Switch work
      const titleEl = root.querySelector(".work-hero__title"), tracks = [...titleEl.querySelectorAll(".work-hero__title-track")];
      const details = root.querySelector("[data-work-details]"), counter = root.querySelector("[data-work-counter]");
      const desc = [...root.querySelectorAll("[data-work-description]")], services = root.querySelector("[data-work-services]");
      root.querySelector("[data-work-total]").textContent = items.length;
      counter.innerHTML = items.map((_, i) => `<span>${i + 1}</span>`).join("");
      const fill = (i) => {
        const li = items[i], t = li.dataset.title.split("|"), d = li.dataset.desc.split("|"), meta = li.dataset.meta.split(";").map((x) => x.split("="));
        desc.forEach((el, k) => (el.textContent = d[k] || ""));
        services.textContent = li.dataset.services;
        meta.forEach(([l, v], k) => { const dt = details.querySelector(`[data-work-label="${k}"]`), dd = details.querySelector(`[data-work-value="${k}"]`); if (dt) dt.textContent = l; if (dd) dd.innerHTML = v; });
        return t;
      };
      const rich = (s) => `<span class="font-rox">${s.slice(0, 1)}</span>${s.slice(1)}`;
      let cur = 0;
      const go = (i) => {
        if (i === cur) return; cur = i;
        const t = items[i].dataset.title.split("|");
        tracks.forEach((tr, k) => { tr.querySelector(".work-hero__title-copy--next").innerHTML = rich(t[k] || ""); });
        titleEl.classList.add("is-swap");
        setTimeout(() => { tracks.forEach((tr, k) => { tr.querySelector("[data-work-title]").innerHTML = rich(t[k] || ""); }); titleEl.classList.remove("is-swap"); tracks.forEach((tr) => { tr.style.transition = "none"; tr.offsetWidth; tr.style.transition = ""; }); }, DG.reduce ? 0 : 720);
        counter.style.translate = `0 ${-i * 0.9}em`;
        details.classList.add("is-swap-out");
        setTimeout(() => { fill(i); details.classList.remove("is-swap-out"); details.classList.add("is-swap-from"); details.offsetWidth; details.classList.remove("is-swap-from"); details.classList.add("is-swap-in"); setTimeout(() => details.classList.remove("is-swap-in"), 700); }, DG.reduce ? 0 : 520);
      };
      fill(0);

      // Scroll → band position, speed → RGB split, focus card
      let raf = 0, off = 0, lastOff = 0, vel = 0, sig = "";
      const tick = () => {
        raf = requestAnimationFrame(tick);
        const top = DG.top(range), len = Math.max(1, range.offsetHeight - innerHeight);
        const p = Math.min(1, Math.max(0, (DG.y() - top) / len));
        const target = p * (total - ch - gap);
        off += (target - off) * 0.12;
        vel += ((off - lastOff) - vel) * 0.2; lastOff = off;
        shift.value = DG.reduce ? 0 : Math.max(-70, Math.min(70, vel * 1.4));
        rail.children.forEach((m, i) => { m.position.y = -i * (ch + gap) + off + ch * 0.35; });
        const focus = Math.round(off / (ch + gap));
        cards.forEach((m, i) => { const u = m.material.uniforms.uFocus; const want = !live || i === focus ? 1 : 0; u.value += (want - u.value) * 0.05; if (Math.abs(want - u.value) < 0.002) u.value = want; });
        const proj = cards[Math.min(cards.length - 1, Math.max(0, focus))].userData.project;
        go(proj);
        // Draw only when something changed — drawing constantly makes press response lag a frame or two on heavy pages
        const now = `${off.toFixed(1)}|${shift.value.toFixed(2)}|${W}x${H}|` + cards.map((m) => { const u = m.material.uniforms; return `${u.uFocus.value.toFixed(3)},${u.uCardReveal.value.toFixed(3)},${u.uMediaReveal.value.toFixed(3)}`; }).join(";");
        if (now !== sig) { sig = now; renderer.render(scene, cam); }
      };
      raf = requestAnimationFrame(tick);
      return () => { cancelAnimationFrame(raf); intro?.kill(); ro.disconnect(); cards.forEach((m) => { m.material.uniforms.tMap.value.dispose(); m.material.dispose(); m.geometry.dispose(); }); renderer.dispose(); };
    },
  });
})();
