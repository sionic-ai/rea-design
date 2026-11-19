// Endlessly flowing vertical WebGL photo strip — photo cell height is 1/3 of the screen, and wheel and drag are followed by .085 per frame so it flows with a sticky feel.
// The cell straddling the 39% line from the top of the screen (title row) becomes the current cell and fires fx:active, and a cell with a hand over it takes precedence. Pressing fires fx:select.
// Locked cells (data-locked) get a Gaussian blur. On first load the cells rise from .9 of the screen height below, staggered .08s apart, over 1.65s.
// Photo slots draw a gray panel bearing the cell’s data-label on a 2D canvas and use it as a texture — with a real photo it reads data-src.
(() => {
  const VERT = `varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  // Crop to fill the cell aspect ratio (cover), and if uBlur is set blend the surrounding 13×13 with Gaussian weights. Darken by uDim, fade out with uOpacity
  const FRAG = `uniform sampler2D uMap;
uniform vec2 uSize;
uniform float uAspect;
uniform float uBlur;
uniform float uDim;
uniform float uOpacity;
varying vec2 vUv;
vec2 coverUv(vec2 p){
  float a = uSize.x / uSize.y;
  vec2 k = a > uAspect ? vec2(uAspect / a, 1.0) : vec2(1.0, a / uAspect);
  return (p - 0.5) * k + 0.5;
}
void main(){
  vec2 p = coverUv(vUv);
  vec4 c = vec4(0.0);
  if (uBlur > 0.0001) {
    float w = 0.0;
    vec2 stepUv = vec2(uBlur * 0.03) / 6.0;
    for (int i = -6; i <= 6; i++) {
      for (int j = -6; j <= 6; j++) {
        vec2 o = vec2(float(i), float(j));
        float g = exp(-dot(o, o) / 18.0);
        c += texture2D(uMap, p + o * stepUv) * g;
        w += g;
      }
    }
    c /= w;
  } else {
    c = texture2D(uMap, p);
  }
  c.rgb *= 1.0 - uDim;
  c.a *= uOpacity;
  gl_FragColor = c;
}`;
  const css = (el, name, fb) => getComputedStyle(el).getPropertyValue(name).trim() || fb;
  // Photo slot panel — two diagonals and a label on the base surface
  const placeholder = (el, label, i) => {
    const c = document.createElement("canvas");
    c.width = 434; c.height = 538;
    const g = c.getContext("2d");
    const fill = css(el, "--fx-strip-fill", css(el, "--kf-raised", ""));
    const line = css(el, "--fx-strip-line", css(el, "--kf-line", ""));
    const ink = css(el, "--fx-strip-ink", css(el, "--kf-dim", ""));
    g.fillStyle = fill; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = line; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(c.width, c.height); g.moveTo(c.width, 0); g.lineTo(0, c.height); g.stroke();
    g.fillStyle = ink; g.font = `500 18px ${css(el, "--kf-font-mono", "monospace")}`; g.textAlign = "center";
    const words = String(label || `Photo ${i + 1}`).split(" · ");
    words.forEach((w, k) => g.fillText(w, c.width / 2, c.height / 2 - (words.length - 1) * 14 + k * 28));
    return c;
  };
  kfFx.register("webgl-photo-strip", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const T = window.THREE;
    if (!items.length || !T) return;
    const narrow = matchMedia(`(max-width: ${+(options.min || 768)}px)`);
    if (narrow.matches) return;
    const aspect = +(options.aspect ?? 217 / 269), vh = +(options.vh ?? 1 / 3), lerp = +(options.ease ?? 0.085);
    const wheelK = +(options.wheel ?? 1), touchK = +(options.touch ?? 1.6), lockBlur = +(options["lock-blur"] ?? 0.5);
    const titleAt = +(options.title ?? 0.39), triggerAt = +(options.trigger ?? 0.3);
    const canvas = document.createElement("canvas");
    canvas.className = "fx-strip-canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    el.classList.add("is-fx-strip");
    let W = el.clientWidth || innerWidth, H = el.clientHeight || innerHeight;
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(70, W / H, 100, 2000);
    camera.position.z = 600;
    const fov = () => { camera.aspect = W / H; camera.fov = 2 * Math.atan(H / 2 / camera.position.z) * (180 / Math.PI); camera.updateProjectionMatrix(); };
    fov();
    const textures = items.map((it, i) => {
      const t = new T.CanvasTexture(placeholder(el, it.dataset.label, i));
      t.colorSpace = T.SRGBColorSpace; t.generateMipmaps = false; t.minFilter = T.LinearFilter;
      if (it.dataset.src) new T.TextureLoader().load(it.dataset.src, (img) => { img.colorSpace = T.SRGBColorSpace; mats.forEach((m) => { if (m.userData.real === i) { m.uniforms.uMap.value = img; m.uniforms.uSize.value.set(img.image.width, img.image.height); } }); });
      return t;
    });
    let itemH, itemW, spacing, stripH, count, phase, offsetX;
    const meshes = [], mats = [], groups = [];
    let geo = null;
    const center = () => {
      const ref = options.center ? document.querySelector(options.center) : null;
      if (!ref) return W / 2;
      const b = ref.getBoundingClientRect(), e = el.getBoundingClientRect();
      return b.left + b.width / 2 - e.left;
    };
    const build = (intro) => {
      meshes.forEach((m) => { scene.remove(m.userData.group); m.material.dispose(); });
      meshes.length = mats.length = groups.length = 0;
      geo?.dispose();
      itemH = H * vh; itemW = itemH * aspect; spacing = itemH;
      let n = items.length;
      while (n * spacing < H + spacing * 2) n += items.length;
      count = n; stripH = spacing * n; phase = H * (0.5 - triggerAt); offsetX = center() - W / 2;
      geo = new T.PlaneGeometry(itemW, itemH, 1, 1);
      for (let k = 0; k < n; k++) {
        const real = k % items.length;
        const m = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, uniforms: { uMap: { value: textures[real] }, uSize: { value: new T.Vector2(434, 538) }, uAspect: { value: aspect }, uBlur: { value: items[real].hasAttribute("data-locked") ? lockBlur : 0 }, uDim: { value: 0 }, uOpacity: { value: 1 } } });
        m.userData.real = real;
        const mesh = new T.Mesh(geo, m);
        mesh.frustumCulled = false;
        mesh.userData.real = real;
        const g = new T.Group();
        g.position.y = intro && !reduce ? H * -0.9 : 0;
        g.add(mesh); scene.add(g);
        mesh.userData.group = g;
        meshes.push(mesh); mats.push(m); groups.push(g);
      }
      place();
      // Precompile when setting up the shader so the first move doesn’t stall
      renderer.compile(scene, camera);
    };
    const scroll = { cur: 0, to: 0, last: 0 };
    const place = () => {
      for (let k = 0; k < meshes.length; k++) {
        let y = (scroll.cur - k * spacing + phase) % stripH;
        if (y < -H / 2 - spacing) y += stripH; else if (y > H / 2 + spacing) y -= stripH;
        meshes[k].position.set(offsetX, y, 0);
      }
    };
    let active = -1, hovered = -1, hoverOn = false, moved = false;
    const pointer = new T.Vector2(-2, -2), ray = new T.Raycaster();
    const emit = (name, i) => el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: { index: i, item: items[i] } }));
    const setActive = (i) => { if (i !== active) { active = i; emit("fx:active", i); } };
    const fromScroll = () => {
      if (hoverOn) return;
      const t = H * (0.5 - titleAt), half = itemH / 2;
      let best = Infinity, pick = active;
      meshes.forEach((m) => { const y = m.position.y + m.userData.group.position.y; if (t > y + half || t < y - half) return; const d = Math.abs(y - t); if (d < best) { best = d; pick = m.userData.real; } });
      if (pick !== active && pick >= 0) setActive(pick);
    };
    const doHover = (vel) => {
      if (!hover || Math.abs(vel) > 2 || !moved) return;
      moved = false;
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(meshes, false)[0];
      if (hit && !items[hit.object.userData.real].hasAttribute("data-locked")) {
        hovered = hit.object.userData.real; hoverOn = true; el.style.cursor = "pointer"; setActive(hovered);
      } else { hovered = -1; hoverOn = false; el.style.cursor = ""; }
    };
    let raf = 0, live = true;
    const frame = () => {
      scroll.cur += (scroll.to - scroll.cur) * lerp;
      const vel = scroll.cur - scroll.last;
      scroll.last = scroll.cur;
      if (Math.abs(vel) > 2) hoverOn = false;
      place(); doHover(vel); fromScroll();
      renderer.render(scene, camera);
      if (live) raf = requestAnimationFrame(frame);
    };
    const onWheel = (e) => { scroll.to += e.deltaY * wheelK; };
    let ty = 0;
    const onTs = (e) => { ty = e.touches[0].clientY; };
    const onTm = (e) => { const y = e.touches[0].clientY; scroll.to += (ty - y) * touchK; ty = y; };
    const onMove = (e) => { const b = el.getBoundingClientRect(); pointer.set(((e.clientX - b.left) / W) * 2 - 1, -((e.clientY - b.top) / H) * 2 + 1); moved = true; };
    // If fx:select is blocked (preventDefault) the caller handles the navigation — if not blocked, it goes straight to that cell’s address
    const onClick = (e) => {
      if (hovered < 0 || e.target.closest("a, button, [data-fx-part=nav]")) return;
      const ev = new CustomEvent("fx:select", { bubbles: true, cancelable: true, detail: { index: hovered, item: items[hovered] } });
      el.dispatchEvent(ev);
      const href = items[hovered].getAttribute("href") || items[hovered].dataset.href;
      if (href && !ev.defaultPrevented) location.href = href;
    };
    const onLeave = () => { pointer.set(-2, -2); moved = true; };
    let rt = 0;
    const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => { W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight; renderer.setSize(W, H, false); fov(); build(false); }, 150); });
    ro.observe(el);
    addEventListener("wheel", onWheel, { passive: true });
    addEventListener("touchstart", onTs, { passive: true });
    addEventListener("touchmove", onTm, { passive: true });
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("click", onClick);
    build(true);
    if (!reduce) {
      // Entrance — a cell hanging at the top edge of the screen comes from .83 height above, the others from .9 below, at .08s stagger (top cells first) for 1.65s
      const ease = kfFx.ease(options["intro-ease"] || "M0,0 C0.116,0.111 0.155,0.659 0.266,0.816 0.323,0.896 0.403,1 1,1", "expo.out");
      const sorted = [...meshes].sort((a, b) => a.position.y - b.position.y);
      const edge = H / 2 + itemH * 0.25;
      const top = [...sorted].reverse().find((m) => m.position.y <= edge) || sorted[Math.max(0, sorted.length - 2)];
      sorted.filter((m) => m.position.y > top.position.y).forEach((m) => (m.userData.group.position.y = 0));
      top.userData.group.position.y = H * 0.83;
      const rest = sorted.filter((m) => m !== top && m.position.y < top.position.y).map((m) => m.userData.group.position);
      gsap.to(rest, { y: 0, stagger: -0.08, duration: +(options["intro-dur"] ?? 1.65), delay: +(options["intro-delay"] ?? 0.28), ease });
      gsap.to(top.userData.group.position, { y: 0, duration: +(options["intro-dur"] ?? 1.65), delay: +(options["intro-delay"] ?? 0.28) + 0.08, ease });
    }
    raf = requestAnimationFrame(frame);
    return () => {
      live = false; cancelAnimationFrame(raf); ro.disconnect(); clearTimeout(rt);
      removeEventListener("wheel", onWheel); removeEventListener("touchstart", onTs); removeEventListener("touchmove", onTm);
      el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave); el.removeEventListener("click", onClick);
      gsap.killTweensOf(groups.map((g) => g.position));
      meshes.forEach((m) => m.material.dispose()); geo?.dispose(); textures.forEach((t) => t.dispose());
      renderer.dispose(); canvas.remove(); el.classList.remove("is-fx-strip"); el.style.cursor = "";
    };
  });
})();
