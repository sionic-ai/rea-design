(() => {
  // Dozens of cards (magazine pages) lined up in one row and viewed obliquely with an orthographic camera — one wheel tick turns one page, and the center page pushes its neighbors aside and rotates to face the camera.
  // Sections bend like waves according to flip speed, and the section under the hand lifts slightly. Shader and layout calculations are ours, the values (camera position, rotation, spacing, damping) are measured from the original.
  const VERT = `attribute float aIndex;attribute vec4 aTile;attribute float aAspect;
uniform float uCount,uScroll,uSpeed,uSpacing,uGap,uCurve,uW,uH,uHover,uLift,uHoverOut,uLiftOut;uniform vec3 uFocus;
varying vec2 vUv;varying vec4 vTile;varying float vAspect,vFocus,vIndex;
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
void main(){
  float mid=(uCount-1.)*.5,half_=uCount*(uSpacing+.01)*.5;
  float home=-(aIndex-mid)*uSpacing;
  float c=mod(home-uScroll+half_,2.*half_)-half_;
  float d=abs(c),dir=c<0.?-1.:1.;
  float lane=c+dir*smoothstep(.1,uSpacing*.9,d)*uGap*uSpacing;
  float yn=(position.y+uH*.5)/uH;
  lane-=sin(yn*2.)*.4*clamp(uSpeed*2.,-2.,2.)*uCurve;
  vec3 p=vec3(lane,position.y,-1.-(position.x+uW*.5));
  float f=smoothstep(0.,1.,1.-smoothstep(0.,uSpacing*.8,d));
  vec3 piv=vec3(uW*.5,0.,0.);
  p=rz(uFocus.z*f)*ry(-uFocus.y*f)*rx(-uFocus.x*f)*(p-piv)+piv;
  float lift=abs(aIndex-uHover)<.5?uLift:0.;
  if(abs(aIndex-uHoverOut)<.5)lift=max(lift,uLiftOut);
  p.y+=lift*smoothstep(.05,.4,1.-f)*.25;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
  vUv=uv;vTile=aTile;vAspect=aAspect;vFocus=f;vIndex=aIndex;
}`;
  const FRAG = `uniform sampler2D uAtlas;uniform float uW,uH,uPick,uHover,uLift,uHoverOut,uLiftOut;
varying vec2 vUv;varying vec4 vTile;varying float vAspect,vFocus,vIndex;
void main(){
  if(uPick>.5){gl_FragColor=vec4((vIndex+1.)/255.,0.,0.,1.);return;}
  vec2 uv=vec2(1.-vUv.x,vUv.y);float pa=uW/uH;
  if(pa<vAspect)uv.x=(uv.x-.5)*(pa/vAspect)+.5;else uv.y=(uv.y-.5)*(vAspect/pa)+.5;
  float zoom=abs(vIndex-uHover)<.5?uLift:0.;if(abs(vIndex-uHoverOut)<.5)zoom=max(zoom,uLiftOut);
  zoom*=smoothstep(.65,.95,vFocus);
  uv=(uv-.5)*(1.-zoom*.156)+.5;
  gl_FragColor=texture2D(uAtlas,vec2(mix(vTile.x,vTile.y,uv.x),mix(vTile.z,vTile.w,1.-uv.y)));
}`;
  const css = (el, n) => getComputedStyle(el).getPropertyValue(n).trim();
  const num3 = (s, d) => (s ? String(s).split(",").map(Number) : d);

  // Sections without a photo bake a placeholder image in the skin color — with a label saying what photo it is in the center
  function paint(card, i, W, H) {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const c = cv.getContext("2d");
    const pal = [css(card, "--kf-raised"), css(card, "--kf-ink-soft"), css(card, "--kf-dim"), css(card, "--kf-surface"), css(card, "--kf-accent")];
    const a = i % 5 === 4 ? pal[4] : pal[i % 3], b = pal[(i + 1) % 4];
    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, a); g.addColorStop(1, b);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.globalAlpha = 0.14; c.fillStyle = pal[3];
    for (let k = 0; k < 5; k++) c.fillRect(((k * 97 + i * 53) % W) * 0.9, 0, 2 + (k % 3) * 2, H);
    c.globalAlpha = 1;
    const label = card.getAttribute("data-label") || "";
    if (label) {
      c.font = `500 ${Math.round(W / 26)}px ${css(card, "--kf-font-sans") || "sans-serif"}`;
      c.textAlign = "center"; c.textBaseline = "middle";
      c.globalAlpha = 0.72; c.fillStyle = pal[3]; c.fillRect(0, H / 2 - W / 34, W, W / 17);
      c.globalAlpha = 1; c.fillStyle = pal[0];
      c.fillText(label, W / 2, H / 2, W * 0.9);
    }
    return cv;
  }

  kfFx.register("magazine-ribbon", (el, { options, reduce, hover }) => {
    const THREE = window.THREE;
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!THREE || !cards.length) return;
    const n = cards.length;
    const N = n * Math.max(1, Math.ceil((+options.min || 30) / n));
    const [W, H] = num3(options.size, [4.4, 3.5]);
    const spacing = +(options.spacing ?? 1);
    const gapTo = +(options.gap ?? 4);
    const focusTo = num3(options.focus, [0.06681, -0.36331, -0.51318]);
    const curve = +(options.curve ?? 1);
    const follow = +(options.follow ?? 0.047);
    const decay = +(options.decay ?? 0.829);
    const zoomH = +(options.zoom ?? 10.8);
    const [gx, gy, gz] = num3(options.pos, [0, 0, 0]);
    const [rx, ry, rz] = num3(options.rot, [-0.0215, 2.2884, 0.2884]);
    const intro = options.intro !== "off" && !reduce;

    // Image sheet — one sheet stacking a 1024×? slot per section vertically
    const TW = 640, TH = Math.round(640 * (H / W));
    const atlas = document.createElement("canvas"); atlas.width = TW; atlas.height = TH * n;
    const actx = atlas.getContext("2d");
    const tex = new THREE.CanvasTexture(atlas);
    tex.colorSpace = THREE.SRGBColorSpace; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
    const draw = (k) => {
      const img = cards[k].querySelector("img");
      if (img && img.complete && img.naturalWidth) {
        const s = Math.max(TW / img.naturalWidth, TH / img.naturalHeight), dw = img.naturalWidth * s, dh = img.naturalHeight * s;
        actx.drawImage(img, (TW - dw) / 2, k * TH + (TH - dh) / 2, dw, dh);
      } else actx.drawImage(paint(cards[k], k, TW, TH), 0, k * TH);
      tex.needsUpdate = true;
    };
    cards.forEach((c, k) => { draw(k); c.querySelector("img")?.addEventListener("load", () => draw(k)); });

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const cv = renderer.domElement;
    cv.setAttribute("data-fx-part", "canvas");
    el.append(cv);
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    cam.position.set(20, 12.1, 16.6);
    cam.lookAt(-7, -2.1, 1.3);
    const geo = new THREE.PlaneGeometry(W, H, 1, 32);
    const inst = new THREE.InstancedBufferGeometry().copy(geo);
    inst.instanceCount = N;
    const idx = new Float32Array(N), tile = new Float32Array(N * 4), asp = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const k = i % n;
      idx[i] = i; asp[i] = W / H;
      tile.set([0, 1, 1 - (k * TH) / atlas.height, 1 - ((k + 1) * TH) / atlas.height], i * 4);
    }
    inst.setAttribute("aIndex", new THREE.InstancedBufferAttribute(idx, 1));
    inst.setAttribute("aTile", new THREE.InstancedBufferAttribute(tile, 4));
    inst.setAttribute("aAspect", new THREE.InstancedBufferAttribute(asp, 1));
    const U = {
      uAtlas: { value: tex }, uCount: { value: N }, uScroll: { value: 0 }, uSpeed: { value: 0 }, uSpacing: { value: spacing },
      uGap: { value: intro ? 0 : gapTo }, uFocus: { value: new THREE.Vector3(...(intro ? [0, 0, 0] : focusTo)) }, uCurve: { value: curve },
      uW: { value: W }, uH: { value: H }, uHover: { value: -1 }, uLift: { value: 0 }, uHoverOut: { value: -1 }, uLiftOut: { value: 0 }, uPick: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U, side: THREE.DoubleSide, transparent: true });
    const mesh = new THREE.Mesh(inst, mat);
    mesh.frustumCulled = false;
    const group = new THREE.Group();
    group.position.set(gx, gy, gz);
    mesh.rotation.set(rx, ry, rz);
    group.add(mesh);
    scene.add(group);

    const size = () => {
      const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight), a = w / h;
      cam.left = (-zoomH * a) / 2; cam.right = (zoomH * a) / 2; cam.top = zoomH / 2; cam.bottom = -zoomH / 2;
      cam.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      cv.style.width = "100%"; cv.style.height = "100%";
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(el);

    // Paging — one section per wheel gesture (mouse), touch drag and trackpad move freely
    // Section position is -(i - center) times spacing, so with an even number of sections it is off by half a cell, so align by section position
    const off = ((((N - 1) / 2) * spacing) % spacing + spacing) % spacing;
    const snap = (v) => Math.round((v - off) / spacing) * spacing + off;
    const S = { target: off, current: off, impulse: 0, anchor: 0, dir: 0, lastWheel: 0, idle: 0, dragging: false, lastX: 0, lastY: 0 };
    const wrapTo = (i) => { const mid = (N - 1) / 2, half = N * spacing * 1.01 * 0.5, home = -(i - mid) * spacing; const r = ((home - S.target + half) % (2 * half) + 2 * half) % (2 * half) - half; return S.target + r; };
    const centerIdx = (v = S.current) => { let best = 0, bd = Infinity; for (let i = 0; i < N; i++) { const mid = (N - 1) / 2, half = N * (spacing + 0.01) * 0.5, home = -(i - mid) * spacing; const c = ((home - v + half) % (2 * half) + 2 * half) % (2 * half) - half; if (Math.abs(c) < bd) { bd = Math.abs(c); best = i; } } return best; };
    let lastCenter = -1, lastProg = NaN;
    const emit = () => {
      const mid = (N - 1) / 2, prog = (((mid - S.current) % n) + n) % n;
      if (!(Math.abs(prog - lastProg) < 0.0005)) { lastProg = prog; el.dispatchEvent(new CustomEvent("fx:progress", { detail: { value: prog, count: n } })); }
      const i = centerIdx();
      if (i === lastCenter) return;
      lastCenter = i;
      el.dispatchEvent(new CustomEvent("fx:center", { bubbles: true, detail: { index: i % n, instance: i, count: n } }));
    };
    let busy = intro;
    const onWheel = (e) => {
      if (busy) return;
      e.preventDefault();
      const now = performance.now(), trackpad = e.deltaMode === 0 && (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) < 24);
      const dy = e.deltaY;
      if (now - S.lastWheel > 240) { S.anchor = snap(S.target); S.dir = Math.sign(dy); S.mode = trackpad ? "free" : "step"; }
      S.lastWheel = now;
      S.impulse += dy * (trackpad ? 0.006 : 0.004);
      clearTimeout(S.idle);
      S.idle = setTimeout(() => { S.target = S.mode === "step" && S.dir ? S.anchor + S.dir * spacing : snap(S.target); }, 150);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    const onDown = (e) => { if (busy) return; S.dragging = true; S.lastX = e.clientX; S.lastY = e.clientY; S.moved = 0; };
    const onMove = (e) => {
      mouse.x = (e.clientX / innerWidth) * 2 - 1;
      if (S.dragging) {
        const d = (e.clientY - S.lastY + (e.clientX - S.lastX) * 0.4) * 0.012;
        S.moved += Math.abs(d); S.target -= d; U.uSpeed.value -= d; S.lastX = e.clientX; S.lastY = e.clientY;
      } else if (hover) pickSoon(e);
    };
    const onUp = (e) => {
      if (!S.dragging) return;
      S.dragging = false;
      if (S.moved < 0.05) click(e); else S.target = snap(S.target);
    };
    el.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);

    // Picking — draw a small panel with section numbers painted in red values and read one point under the cursor
    const pickRT = new THREE.WebGLRenderTarget(1, 1);
    const px = new Uint8Array(4);
    const pickAt = (cx, cy) => {
      const r = el.getBoundingClientRect();
      if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return -1;
      const w = renderer.domElement.width, h = renderer.domElement.height, dpr = w / r.width;
      cam.setViewOffset(w, h, Math.round((cx - r.left) * dpr), Math.round((cy - r.top) * dpr), 1, 1);
      U.uPick.value = 1; renderer.setRenderTarget(pickRT); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, cam);
      renderer.readRenderTargetPixels(pickRT, 0, 0, 1, 1, px);
      renderer.setRenderTarget(null); U.uPick.value = 0; cam.clearViewOffset();
      return px[3] ? px[0] - 1 : -1;
    };
    let hoverIdx = -1, pickT = 0;
    const pickSoon = (e) => {
      if (busy || pickT) return;
      pickT = setTimeout(() => {
        pickT = 0;
        const i = pickAt(e.clientX, e.clientY);
        if (i === hoverIdx) return;
        if (hoverIdx >= 0) { U.uHoverOut.value = hoverIdx; U.uLiftOut.value = U.uLift.value; gsap.to(U.uLiftOut, { value: 0, duration: 1, ease: "power4.out", overwrite: "auto" }); }
        hoverIdx = i; U.uHover.value = i; U.uLift.value = 0;
        if (i >= 0) gsap.to(U.uLift, { value: 1, duration: 1, ease: "power4.out", overwrite: "auto" });
        el.style.cursor = i >= 0 ? "pointer" : "";
      }, 50);
    };
    const click = (e) => {
      const i = pickAt(e.clientX, e.clientY);
      if (i < 0) return;
      if (i === centerIdx(S.target)) el.dispatchEvent(new CustomEvent("fx:pick", { bubbles: true, detail: { index: i % n, instance: i } }));
      else S.target = wrapTo(i);
    };

    const mouse = { x: 0, s: 0 };
    const frame = () => {
      if (S.impulse) {
        const e = S.impulse * 0.075;
        S.impulse -= e;
        if (Math.abs(S.impulse) < 0.001) S.impulse = 0;
        S.target = S.mode === "step" ? Math.min(S.anchor + spacing, Math.max(S.anchor - spacing, S.target + e)) : S.target + e;
        U.uSpeed.value += e;
      }
      S.current += (S.target - S.current) * (S.dragging ? 0.12 : follow);
      if (!busy && !S.dragging && Math.abs(S.target - S.current) < 0.01) S.current = S.target;
      U.uScroll.value = S.current;
      U.uSpeed.value *= S.dragging ? 0.72 : decay;
      mouse.s += (mouse.x - mouse.s) * 0.05;
      group.rotation.y = reduce ? 0 : mouse.s * 0.05;
      emit();
      renderer.render(scene, cam);
    };
    gsap.ticker.add(frame);

    // On entry — 24 cards flow by over 2s with a 4th-power ease-out while bending, and 1.06s later the center card spreads open and spins (1.1s power2.out)
    const play = () => {
      const run = { k: 0 }, start = S.target, dist = 24;
      let prev = 0;
      gsap.to(run, { k: 1, duration: 2, ease: "none", onUpdate: () => { const a = 1 - (1 - run.k) ** 4, d = (a - prev) * dist; prev = a; S.target = start + a * dist; U.uSpeed.value += d; }, onComplete: () => { busy = false; U.uSpeed.value = 0; S.target = snap(S.target); el.dispatchEvent(new CustomEvent("fx:ready", { bubbles: true })); } });
      gsap.to(U.uGap, { value: gapTo, duration: 1.1, delay: 1.06, ease: "power2.out" });
      gsap.to(U.uFocus.value, { x: focusTo[0], y: focusTo[1], z: focusTo[2], duration: 1.1, delay: 1.06, ease: "power2.out" });
    };
    const startIntro = () => (intro ? play() : el.dispatchEvent(new CustomEvent("fx:ready", { bubbles: true })));
    // on: if manual, it plays when the caller sends fx:play (after the loader)
    if (options.on === "manual") el.addEventListener("fx:play", startIntro, { once: true });
    else requestAnimationFrame(startIntro);
    const step = (e) => { if (!busy) S.target = snap(S.target) + (e.detail || 1) * spacing; };
    el.addEventListener("fx:step", step);

    return () => {
      gsap.ticker.remove(frame);
      gsap.killTweensOf([U.uGap, U.uFocus.value, U.uLift, U.uLiftOut]);
      clearTimeout(S.idle); clearTimeout(pickT);
      ro.disconnect();
      el.removeEventListener("wheel", onWheel); el.removeEventListener("pointerdown", onDown); el.removeEventListener("fx:step", step);
      removeEventListener("pointermove", onMove); removeEventListener("pointerup", onUp);
      el.removeEventListener("fx:play", startIntro);
      inst.dispose(); geo.dispose(); mat.dispose(); tex.dispose(); pickRT.dispose(); renderer.dispose();
      cv.remove();
      el.style.cursor = "";
    };
  });
})();
