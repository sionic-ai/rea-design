(() => {
  // Work screen strip — screens reflected on a desk line up in a curved strip that shrinks the farther they are from screen center, flowing endlessly by wheel and drag.
  // On phone the strip stands vertically. Bend and edge blur use our shader.
  const stage = document.querySelector(".tg-stage");
  const strip = document.querySelector(".tg-screens");
  if (!stage || !strip) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const VERT = `
uniform vec2 uCenter; uniform vec2 uSize; uniform float uY; uniform float uHalf; uniform float uMid; uniform float uBend; uniform float uAxis;
varying vec2 vUv; varying float vFade;
void main(){
  vUv = uv;
  float lx = position.x * uSize.x, lz = -position.y * uSize.y;
  vec2 w = uCenter + vec2(lx, lz);
  float t = ((uAxis < .5 ? w.x : w.y) - uMid) / uHalf;
  float s = 1. - uBend * t * t;
  if (uAxis < .5) w.y = uCenter.y + lz * s; else w.x = uCenter.x + lx * s;
  vFade = 1. - smoothstep(.8, 1.04, abs(t));
  gl_Position = projectionMatrix * viewMatrix * vec4(w.x, uY, w.y, 1.);
}`;
  const FRAG = `
uniform sampler2D uMap; uniform float uOpacity;
varying vec2 vUv; varying float vFade;
void main(){
  vec4 c = texture2D(uMap, vUv);
  gl_FragColor = vec4(c.rgb, c.a * vFade * uOpacity * .94);
}`;

  const color = (name) => {
    const p = document.createElement("span"); p.style.cssText = `display:none;color:var(${name})`;
    document.body.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return c;
  };
  const sans = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-sans").trim() || "sans-serif";
  const draw = (span, i) => {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 640;
    const g = c.getContext("2d");
    const bg = color("--site-screen"), ink = color("--site-screen-ink"), mid = color("--site-photo"), soft = color("--site-screen-soft");
    g.fillStyle = bg; g.fillRect(0, 0, 1024, 640);
    g.fillStyle = ink; g.globalAlpha = 0.7; g.font = `500 13px ${sans}`;
    g.fillText("LOGO", 28, 30);
    ["Menu 1", "Menu 2", "Menu 3", "Menu 4"].forEach((m, k) => g.fillText(m, 600 + k * 90, 30));
    g.globalAlpha = 1;
    g.fillStyle = soft;
    const cx = [620, 300, 760, 520, 512][i % 5], cy = [300, 360, 330, 320, 340][i % 5], r = [180, 230, 140, 210, 120][i % 5];
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = mid; g.globalAlpha = 0.25;
    for (let k = 0; k < 7; k++) g.fillRect(cx - r * 0.6 + ((k * 53) % (r * 1.2)), cy - r * 0.4 + ((k * 71) % (r * 0.8)), 10, 10);
    g.globalAlpha = 1;
    g.fillStyle = ink; g.font = `500 54px ${sans}`;
    g.fillText(span.dataset.head || "", 28, 120);
    if (span.dataset.head2) g.fillText(span.dataset.head2, 28, 182);
    g.globalAlpha = 0.45;
    for (let k = 0; k < 3; k++) g.fillRect(28, 520 + k * 22, 380 - k * 60, 12);
    g.fillRect(890, 580, 106, 22);
    g.globalAlpha = 0.6; g.font = `500 16px ${sans}`; g.fillText(span.dataset.label || "", 28, 470, 560);
    g.globalAlpha = 1;
    return c;
  };

  const build = () => {
    const desk = stage.kfDesk;
    if (!desk || stage.dataset.screens) return;
    stage.dataset.screens = "1";
    const T = desk.THREE, spans = [...strip.querySelectorAll("[data-screen]")];
    const mats = spans.map((s, i) => {
      const tex = new T.CanvasTexture(draw(s, i)); tex.anisotropy = 8;
      return new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
        uniforms: { uMap: { value: tex }, uCenter: { value: new T.Vector2() }, uSize: { value: new T.Vector2(1, 1) }, uY: { value: 0.012 }, uHalf: { value: 1 }, uMid: { value: 0 }, uBend: { value: 0.2 }, uAxis: { value: 0 }, uOpacity: { value: reduce ? 1 : 0 } } });
    });
    const geo = new T.PlaneGeometry(1, 1, 32, 32);
    const meshes = mats.map((m) => { const mesh = new T.Mesh(geo, m); mesh.frustumCulled = false; mesh.renderOrder = 2; desk.scene.add(mesh); return mesh; });
    desk.renderer.compile(desk.scene, desk.camera);
    let offset = 0, target = 0;
    const dims = () => {
      const v = desk.view();
      // Window where the strip is visible: on wide screens about 1235px wide at the panel center, on phones .09~.64 height at the top
      if (v.mobile) {
        const w = v.w * 0.84, h = w / 1.61, gap = v.h * 0.033, mid = desk.toWorld(0.5, 0.33);
        return { axis: 1, w, h, step: h + gap, center: mid, mid: desk.toWorld(0.5, 0.365).z, half: v.h * 0.29 };
      }
      const w = v.w * 0.442, h = v.h * 0.44, gap = v.w * 0.026, mid = desk.toWorld(0.577, 0.367);
      return { axis: 0, w, h, step: w + gap, center: mid, mid: 0, half: v.w / 2 - desk.px(80) };
    };
    desk.onFrame((dt) => {
      offset += (target - offset) * (1 - Math.exp(-8 * dt));
      const d = dims(), L = d.step * meshes.length;
      meshes.forEach((m, i) => {
        let p = (i * d.step + offset) % L; if (p < 0) p += L; if (p > L / 2) p -= L;
        const u = m.material.uniforms;
        u.uAxis.value = d.axis; u.uHalf.value = d.half; u.uMid.value = d.mid; u.uSize.value.set(d.w, d.h);
        if (d.axis === 0) u.uCenter.value.set(d.center.x + p, d.center.z);
        else u.uCenter.value.set(d.center.x, d.center.z + p);
      });
    });
    const fadeIn = () => gsap.to(mats.map((m) => m.uniforms.uOpacity), { value: 1, duration: reduce ? 0 : 1.05, ease: "thomas-screens", stagger: 0.1 });
    if (window.CustomEase) CustomEase.create("thomas-screens", "0.625,0.05,0,1");
    stage.addEventListener("fx:intro-start", (e) => { if (e.detail?.hold) stage.addEventListener("fx:reveal", fadeIn, { once: true }); else fadeIn(); });
    if (!document.querySelector(".tg-loader")) fadeIn();
    stage.addEventListener("fx:leave", () => gsap.to(mats.map((m) => m.uniforms.uOpacity), { value: 0, duration: 0.55, ease: "power2.in" }));

    const unit = () => { const v = desk.view(); return v.mobile ? v.h / v.H : v.w / v.W; };
    addEventListener("wheel", (e) => { target -= (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * unit() * 0.9; }, { passive: true });
    let drag = null;
    strip.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, t: target, moved: false }; strip.setPointerCapture(e.pointerId); });
    strip.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const v = desk.view();
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 4) drag.moved = true;
      target = drag.t + (v.mobile ? e.clientY - drag.y : e.clientX - drag.x) * unit();
    });
    const up = (e) => { if (drag && !drag.moved && e.type === "pointerup") openViewer(); drag = null; };
    strip.addEventListener("pointerup", up); strip.addEventListener("pointercancel", up);
  };

  // Video enlarge — opens by pressing without dragging the strip or by pressing the hidden button, closes with X or Esc
  const viewer = document.querySelector(".tg-viewer");
  const openViewer = () => {
    if (!viewer || !viewer.hidden) return;
    viewer.hidden = false;
    requestAnimationFrame(() => viewer.setAttribute("data-open", ""));
    viewer.querySelector(".tg-viewer__close")?.focus();
  };
  const closeViewer = () => {
    if (!viewer || viewer.hidden) return;
    viewer.removeAttribute("data-open");
    setTimeout(() => { viewer.hidden = true; }, reduce ? 0 : 90);
  };
  document.querySelector(".tg-view")?.addEventListener("click", openViewer);
  viewer?.querySelector(".tg-viewer__close")?.addEventListener("click", closeViewer);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && viewer && !viewer.hidden) { e.stopImmediatePropagation(); closeViewer(); } }, true);
  if (stage.kfDesk) build(); else stage.addEventListener("fx:desk-ready", build, { once: true });
})();
