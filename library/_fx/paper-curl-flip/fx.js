// Paper turn where one card curls from its corner as if wrapped around a cylinder, revealing a new plate below (WebGL·OGL) — Brand pricing card.
// Next button ([data-fx-part="flip"]) — on press, with paper in the current background color already drawn, is-flipped is swapped on the card (new color, new text),
// Roll away the paper on top. Hover the button and only a corner lifts to peek at the next board.
(() => {
  const VERT = `attribute vec3 position; attribute vec2 uv; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
    uniform float uProg; uniform float uR; uniform vec2 uSize; uniform vec2 uFlip; varying vec2 vUv; varying float vShade; varying float vBack;
    const float PI = 3.14159265;
    void main(){
      vUv = uv;
      vec2 p = mix(uv, 1. - uv, uFlip) * uSize;
      vec2 d = normalize(vec2(1.));
      float L = uProg * (dot(uSize, d) + PI * uR * 1.2);
      float s = dot(p, d);
      vec3 pos = vec3(p, 0.);
      vBack = 0.; vShade = 1.;
      if (s < L) {
        float arc = L - s, th = arc / uR, ns, z;
        if (th < PI) { ns = L - uR * sin(th); z = uR * (1. - cos(th)); vShade = .7 + .3 * cos(th * .5); vBack = step(PI * .5, th); }
        else { ns = L + (arc - PI * uR); z = 2. * uR; vBack = 1.; vShade = .92; }
        pos.xy += d * (ns - s);
        pos.z = z;
      }
      pos.xy = mix(pos.xy, uSize - pos.xy, uFlip);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.x - uSize.x * .5, pos.y - uSize.y * .5, pos.z, 1.);
    }`;
  const FRAG = `precision highp float; uniform vec3 uFront; uniform vec3 uBackC; uniform float uAlpha; uniform vec2 uSize; uniform float uRad;
    varying vec2 vUv; varying float vShade; varying float vBack;
    void main(){
      vec2 p = vUv * uSize; vec2 q = min(p, uSize - p);
      if (q.x < uRad && q.y < uRad && distance(q, vec2(uRad)) > uRad) discard;
      vec3 c = mix(uFront, uBackC, vBack) * vShade;
      gl_FragColor = vec4(c * uAlpha, uAlpha);
    }`;
  const CORNERS = { bl: [0, 0], br: [1, 0], tl: [0, 1], tr: [1, 1] };
  const rgb = (str) => { const m = String(str).match(/[\d.]+/g) || [255, 255, 255]; return [m[0] / 255, m[1] / 255, m[2] / 255]; };
  kfFx.register("paper-curl-flip", (el, { options, reduce }) => {
    const triggers = [...el.querySelectorAll('[data-fx-part="flip"]')];
    const dur = +(options.dur ?? 1.25), peekAt = +(options.peek ?? 0.1), radius = +(options.radius ?? 0.16);
    const corner = CORNERS[options.corner] || CORNERS.bl;
    const toggle = () => el.classList.toggle("is-flipped");
    const onClick = () => flip();
    let off = () => {};
    let flip = () => toggle();
    if (window.OGL && !reduce) {
      const { Renderer, Program, Mesh, Plane, Camera, Transform } = OGL;
      const canvas = document.createElement("canvas");
      canvas.className = "fx-pcf-canvas";
      canvas.setAttribute("aria-hidden", "true");
      el.append(canvas);
      const renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 2), alpha: true, premultipliedAlpha: true });
      const gl = renderer.gl;
      const camera = new Camera(gl, { fov: 35 });
      const scene = new Transform();
      const program = new Program(gl, {
        vertex: VERT, fragment: FRAG, transparent: true, cullFace: false,
        uniforms: { uProg: { value: 0 }, uR: { value: 60 }, uSize: { value: [1, 1] }, uFlip: { value: corner }, uFront: { value: [1, 1, 1] }, uBackC: { value: [1, 1, 1] }, uAlpha: { value: 1 }, uRad: { value: 0 } },
      });
      const mesh = new Mesh(gl, { geometry: new Plane(gl, { widthSegments: 64, heightSegments: 64 }), program });
      mesh.setParent(scene);
      const size = () => {
        const r = canvas.getBoundingClientRect();
        if (!r.width || !el.offsetWidth) return;
        renderer.setSize(r.width, r.height);
        camera.perspective({ aspect: r.width / r.height });
        camera.position.z = r.height / 2 / Math.tan((35 * Math.PI) / 360);
        program.uniforms.uSize.value = [el.offsetWidth, el.offsetHeight];
        program.uniforms.uR.value = el.offsetWidth * radius;
        program.uniforms.uRad.value = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      };
      const ro = new ResizeObserver(size);
      ro.observe(el);
      size();
      renderer.render({ scene, camera });
      const st = { p: 0 };
      let tw = null, busy = false, peeking = false;
      const render = () => { program.uniforms.uProg.value = st.p; renderer.render({ scene, camera }); };
      const dress = () => {
        const c = rgb(getComputedStyle(el).backgroundColor);
        program.uniforms.uFront.value = c;
        program.uniforms.uBackC.value = c.map((v) => v * 0.85 + 0.15);
        program.uniforms.uAlpha.value = 1;
        canvas.style.visibility = "visible";
      };
      flip = () => {
        if (!peeking) dress();
        peeking = false;
        el.classList.remove("is-peek");
        toggle();
        tw?.kill();
        busy = true;
        tw = gsap.timeline({ onComplete: () => { canvas.style.visibility = "hidden"; st.p = 0; busy = false; } })
          .to(st, { p: 1, duration: dur, ease: "power2.inOut", onUpdate: render })
          .to(program.uniforms.uAlpha, { value: 0, duration: 0.2, onUpdate: render }, ">-0.2");
      };
      // Peek: paint the current paper, put is-peek on the card (the caller shows the next sheet’s color), and lift only the corner
      const peek = (on) => {
        if (busy) return;
        tw?.kill();
        if (on) { dress(); peeking = true; el.classList.add("is-peek"); }
        tw = gsap.to(st, { p: on ? peekAt : 0, duration: 0.52, ease: "power2.out", onUpdate: render, onComplete: () => { if (!on) { peeking = false; el.classList.remove("is-peek"); canvas.style.visibility = "hidden"; } } });
      };
      const enter = () => peek(true), leave = () => peek(false);
      if (matchMedia("(hover: hover) and (pointer: fine)").matches) triggers.forEach((t) => { t.addEventListener("mouseenter", enter); t.addEventListener("mouseleave", leave); });
      canvas.style.visibility = "hidden";
      off = () => {
        tw?.kill(); ro.disconnect(); canvas.remove();
        triggers.forEach((t) => { t.removeEventListener("mouseenter", enter); t.removeEventListener("mouseleave", leave); });
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    }
    triggers.forEach((t) => t.addEventListener("click", onClick));
    const onEvent = () => flip();
    el.addEventListener("fx:flip", onEvent);
    return () => {
      off();
      triggers.forEach((t) => t.removeEventListener("click", onClick));
      el.removeEventListener("fx:flip", onEvent);
      el.classList.remove("is-peek");
    };
  });
})();
