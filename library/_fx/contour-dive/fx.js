// Contour staircase dive: cut a noise height map into many thin slabs (layers) and stack them — each slab keeps only the area higher than its height, forming a contour staircase.
// The camera follows a 13-second keyframe path, and the position on the path is a value that follows the scroll (between the start and end markers) by .075 each step.
// The layers are the same gray, and the rainbow bands come from color noise tied to layer height and chromatic aberration that widens toward the screen edges.
(() => {
  // Keyframes [sequence seconds, value]. Between them, the Theatre default curve (.5,0,.5,1)
  const TRACK = {
    px: [[0.5, -0.665], [2, -0.685], [6.73, -0.268], [10, -0.195], [11, 0.08], [13, -0.06]],
    py: [[0.5, -1.078], [2, -1.388], [6.73, -0.828], [10, -0.688], [11, -2.521], [13, -3.121]],
    pz: [[0.5, 1.402], [2, 1.182], [10, 0.412], [11, 2.31], [13, 2.57]],
    rx: [[0.5, 0.622], [2, 0.698], [6.73, 0.283], [10, 0.283], [11, 0.64]],
    ry: [[0.5, -0.343], [2, -0.268], [6.73, -0.14], [10, -0.14], [11, 0]],
    rz: [[0.5, -0.448], [2, -0.362], [6.73, -0.297], [10, -0.297], [11, 0]],
    fov: [[0, 70.714], [2, 70.714], [5.67, 124.08], [11, 35.714], [13, 38.91]],
    look: [[2, 0.032], [7, 0.024], [8.57, 0], [10, 0], [11, 0.01]],
    height: [[0.5, 0.266], [2, 0.426], [6.33, 0.426], [10, 0.647]],
    cycle: [[0.5, 0], [2.17, 0], [6.73, 0.381]],
    shadow: [[0.5, 0.528], [2, 0.787]],
    tint: [[0, 0], [2, 0], [3.93, 1.03], [7.63, 2.48]],
    tintScale: [[2, 1.128], [3.6, 0.888], [7.93, 1.042]],
    light: [[3.37, 0.437], [5.67, 0]],
    shadowOff: [[3.37, 0.0075], [5.67, 0]],
    wobble: [[2.7, 0.024], [6.33, 0.053]],
    wobbleScale: [[2.7, 0.16], [6.33, 0.219]],
    grain: [[2, 0.1], [7.73, 0.054], [8.87, 0], [11, 0.054]],
    bend: [[3.93, -0.152], [6.73, -0.542], [8.87, -0.542], [11, -0.25]],
    fHeight: [[11, 0.659], [13, 0.403]],
    fDepth: [[11, 0.734], [13, 1]],
  };
  const bez = (t) => { let a = 0, b = 1, x = t; for (let i = 0; i < 18; i++) { x = (a + b) / 2; const v = 3 * x * (1 - x) * (1 - x) * 0.5 + 3 * x * x * (1 - x) * 0.5 + x * x * x; if (v < t) a = x; else b = x; } return 3 * x * x * (1 - x) + x * x * x; };
  const at = (k, s) => {
    if (s <= k[0][0]) return k[0][1];
    for (let i = 1; i < k.length; i++) if (s <= k[i][0]) { const [s0, v0] = k[i - 1], [s1, v1] = k[i]; return v0 + (v1 - v0) * bez((s - s0) / (s1 - s0)); }
    return k[k.length - 1][1];
  };

  const VERT_FILL = "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}";
  // Height map: two layers of low-frequency value noise — ratio .727 so one big mass forms near the screen center
  const FRAG_HEIGHT = `varying vec2 vUv;uniform float uTime;uniform float uScale;uniform float uSeed;uniform vec2 uShift;
    float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
    float vn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      float a=mix(mix(h21(i.xy+i.z*17.),h21(i.xy+vec2(1,0)+i.z*17.),f.x),mix(h21(i.xy+vec2(0,1)+i.z*17.),h21(i.xy+vec2(1,1)+i.z*17.),f.x),f.y);
      float b=mix(mix(h21(i.xy+(i.z+1.)*17.),h21(i.xy+vec2(1,0)+(i.z+1.)*17.),f.x),mix(h21(i.xy+vec2(0,1)+(i.z+1.)*17.),h21(i.xy+vec2(1,1)+(i.z+1.)*17.),f.x),f.y);
      return mix(a,b,f.z);}
    void main(){vec2 p=(vUv+uShift)*uScale*2.2;float t=uSeed+uTime;
      float n=vn(vec3(p,t))*.62+vn(vec3(p*2.,t*1.3+3.))*.28+vn(vec3(p*4.,t+7.))*.1;
      float d=length((vUv-vec2(.36,.33))*vec2(1.,1.2));n=n*.3+(.44+d*.5)*.7;
      gl_FragColor=vec4(n,n,n,1.);}`;
  const VERT_LAYER = `attribute float aLayer;varying vec2 vUv;varying float vLayer;varying float vZ;uniform float uCycle;
    void main(){vUv=uv;float l=mod(aLayer+uCycle,1.);vLayer=l;vec4 p=instanceMatrix*vec4(position,1.);p.z+=l;vZ=p.z;gl_Position=projectionMatrix*modelViewMatrix*p;}`;
  // Cursor fluid (x+y of tV): jiggles layer edges by .004 (mouse devices only), and pushes shadow by .1·brightness by 5·color fringe by 2 — multiplied by the intensity uFluid
  const FRAG_LAYER = `varying vec2 vUv;varying float vLayer;varying float vZ;uniform sampler2D tH;uniform sampler2D tV;uniform float uHeight;uniform float uDepth;uniform float uShadow;
    uniform float uShadowOff;uniform float uLight;uniform float uTint;uniform float uTintScale;uniform float uWobble;uniform float uWobbleScale;uniform float uTime;uniform float uFoot;uniform vec3 uBase;uniform vec3 uDark;uniform vec3 uGlow;uniform vec2 uRes;
    uniform float uFluid;uniform float uEdge;
    vec3 spec(float h){return .5+.5*cos(6.2832*(h+vec3(0.,.33,.67)));}
    float edge(float v,float th){float w=fwidth(v);return smoothstep(th-w,th+w,v);}
    void main(){float lo=uFoot>.5?vLayer*abs(uDepth*((vLayer+.3)*2.-1.))*.25:vLayer*uDepth;
      vec2 wob=vec2(sin(vUv.y*6.2832/uWobbleScale+uTime*.007),cos(vUv.x*6.2832/uWobbleScale-uTime*.005))*uWobble;
      vec2 fv=texture2D(tV,gl_FragCoord.xy/uRes).xy;float fl=fv.x+fv.y,lift=fl*.004*uEdge,f=fl*uFluid;
      vec2 uv=vUv+wob;float h=texture2D(tH,uv).r-lo+lift;
      if(vLayer<.94&&edge(texture2D(tH,uv).r-lo-.05+lift,uHeight+.1)>.01)discard;
      float n=edge(h,uHeight);if(uFoot>.5&&vLayer<.06)n=1.;if(n<.001)discard;
      float sh=smoothstep(uHeight+.0063,uHeight+.0143,texture2D(tH,uv-uShadowOff*vec2(.96,-.28)).r-lo+f*.1)*uShadow;
      float hi=smoothstep(uHeight+.046,uHeight+.106,texture2D(tH,uv+.068*vec2(.96,-.28)).r-lo);
      if(vLayer>.94){sh=0.;hi=0.;}
      vec3 rb=spec(vLayer*uTintScale*2.4+h*1.5+f*2.)*.6+.4;vec3 c=mix(uBase,rb*uBase.g*1.2,clamp(uTint*.55*vLayer,0.,.9));
      c+=abs(f)*5.;c+=uGlow*pow(hi,1.04)*uLight;c=mix(c,uDark,sh);
      gl_FragColor=vec4(c,n);}`;
  // Cursor fluid panel (same 0~1 coordinates as the screen, 128 cells): advects velocity back along its own flow, adds cursor movement around the cursor segment from the previous frame → this frame (radius uRad), and damps it.
  // Spread is divergence → one pressure pass (continuing from the last pressure) → subtract the pressure gradient
  const FRAG_VEL = `varying vec2 vUv;uniform sampler2D tV;uniform vec2 uA;uniform vec2 uB;uniform vec2 uPush;uniform float uRad;uniform float uKeep;uniform float uTexel;
    void main(){vec2 v=texture2D(tV,vUv-texture2D(tV,vUv).xy*uTexel).xy;
      vec2 ab=uB-uA;float t=clamp(dot(vUv-uA,ab)/max(dot(ab,ab),1e-9),0.,1.);
      float k=1.-smoothstep(0.,uRad,distance(vUv,uA+ab*t));
      gl_FragColor=vec4(clamp((v+uPush*k)*uKeep,-1.,1.),0.,1.);}`;
  const FRAG_DIV = `varying vec2 vUv;uniform sampler2D tV;uniform float uTexel;uniform float uVisc;
    void main(){vec2 e=vec2(uTexel,0.);gl_FragColor=vec4((texture2D(tV,vUv+e).x-texture2D(tV,vUv-e).x+texture2D(tV,vUv+e.yx).y-texture2D(tV,vUv-e.yx).y)*uVisc);}`;
  const FRAG_PRES = `varying vec2 vUv;uniform sampler2D tP;uniform sampler2D tD;uniform float uTexel;
    void main(){vec2 e=vec2(uTexel,0.);gl_FragColor=vec4((texture2D(tP,vUv+e).r+texture2D(tP,vUv-e).r+texture2D(tP,vUv+e.yx).r+texture2D(tP,vUv-e.yx).r-texture2D(tD,vUv).r)*.25);}`;
  const FRAG_PROJ = `varying vec2 vUv;uniform sampler2D tV;uniform sampler2D tP;uniform float uTexel;
    void main(){vec2 e=vec2(uTexel,0.);vec2 g=vec2(texture2D(tP,vUv+e).r-texture2D(tP,vUv-e).r,texture2D(tP,vUv+e.yx).r-texture2D(tP,vUv-e.yx).r);
      gl_FragColor=vec4(texture2D(tV,vUv).xy-g*.5,0.,1.);}`;
  // Original Home scene values. Fluid: brush radius .035 of the screen, motion ×4.23, in one frame the velocity field is run twice around the projection and multiplied by .9324 twice (half-life about 83ms), intensity .057 in Hero and .07 in Footer.
  // Camera: pivots toward the cursor around a point 1.196 in front of the screen — of the two values chasing the cursor each tick at .032·.025, the first is the turn (the angle is the path’s look), and the difference of the two ×.1 is the tilt
  const FLUID = { size: 128, rad: 0.035, push: 4.23, keep: 0.9324, visc: 0.9603, hero: 0.057, foot: 0.07 };
  const CAM = { pivot: 1.196, roll: 0.1, lerp1: 0.032, lerp2: 0.025 };
  // Finish: chromatic aberration where R·B spread toward the edges, darker bottom, grain
  const FRAG_POST = `varying vec2 vUv;uniform sampler2D tScene;uniform float uBend;uniform float uDistort;uniform float uGrain;uniform float uFade;uniform float uFadeStart;uniform float uTime;
    float rnd(vec2 p){vec3 q=fract(vec3(p.xyx)*443.897);q+=dot(q,q.yzx+19.19);return fract((q.x+q.y)*q.z);}
    void main(){vec2 d=vUv-.5;float r=dot(d,d);vec2 o=d*r*uBend*uDistort*.18;
      vec4 g=texture2D(tScene,vUv);float R=texture2D(tScene,vUv+o).r;float B=texture2D(tScene,vUv-o).b;
      vec3 c=vec3(R,g.g,B);c*=mix(1.-uFade,1.,smoothstep(0.,uFadeStart,vUv.y));
      c+=(rnd(vUv+fract(uTime))-.5)*uGrain;gl_FragColor=vec4(c,1.);}`;

  // Convert variable colors to 0~1 RGB — color-mix and oklch computed values are not rgb(), so paint them onto a 1px panel and read them back
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const css = (el, v) => {
    const p = document.createElement("i");
    p.style.cssText = `position:absolute;visibility:hidden;color:var(${v})`;
    el.append(p);
    const c = getComputedStyle(p).color;
    p.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  kfFx.register("contour-dive", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T || !window.gsap) return;
    const startEl = options.start ? document.querySelector(options.start) : null;
    const endEl = options.end ? document.querySelector(options.end) : null;
    const footEl = options.footer ? document.querySelector(options.footer) : null;
    const follow = +(options.lerp ?? 0.075);
    const intro = +(options.intro ?? 3);
    const LAYERS = Math.max(8, +options.layers || 24);

    const canvas = document.createElement("canvas");
    canvas.className = "fx-contour-dive__canvas";
    el.append(canvas);
    const renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const bg = css(el, "--fx-contour-bg");
    renderer.setClearColor(new T.Color(...bg), 1);

    const fill = new T.PlaneGeometry(2, 2);
    const hRT = new T.WebGLRenderTarget(512, 512, { type: T.HalfFloatType });
    const hMat = new T.ShaderMaterial({ vertexShader: VERT_FILL, fragmentShader: FRAG_HEIGHT, uniforms: { uTime: { value: 0 }, uScale: { value: 0.727 }, uSeed: { value: 3 }, uShift: { value: new T.Vector2() } } });
    const hScene = new T.Scene(); hScene.add(new T.Mesh(fill, hMat));
    const fRT = new T.WebGLRenderTarget(512, 512, { type: T.HalfFloatType });
    const fMat = hMat.clone(); fMat.uniforms.uScale.value = 0.87; fMat.uniforms.uSeed.value = 100; fMat.uniforms.uShift.value.set(-0.434, -0.236);
    const fScene = new T.Scene(); fScene.add(new T.Mesh(fill, fMat));
    const cam2 = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const fluidRT = () => new T.WebGLRenderTarget(FLUID.size, FLUID.size, { type: T.HalfFloatType, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false });
    // Speed has two values, vA (frame end value) and vB (before projection), pressure alternates between two to continue from the previous value
    const fl = { vA: fluidRT(), vB: fluidRT(), vQ: fluidRT(), d: fluidRT(), p0: fluidRT(), p1: fluidRT(), live: 0 };
    const texel = { value: 1 / FLUID.size };
    const fmat = (frag, u) => new T.ShaderMaterial({ vertexShader: VERT_FILL, fragmentShader: frag, uniforms: { uTexel: texel, ...u }, depthTest: false });
    const velMat = fmat(FRAG_VEL, { tV: { value: null }, uA: { value: new T.Vector2() }, uB: { value: new T.Vector2() }, uPush: { value: new T.Vector2() }, uRad: { value: FLUID.rad }, uKeep: { value: FLUID.keep } });
    const divMat = fmat(FRAG_DIV, { tV: { value: fl.vB.texture }, uVisc: { value: FLUID.visc } });
    const presMat = fmat(FRAG_PRES, { tP: { value: null }, tD: { value: fl.d.texture } });
    const projMat = fmat(FRAG_PROJ, { tV: { value: fl.vB.texture }, tP: { value: null } });
    const fQuad = new T.Mesh(fill, velMat);
    const flScene = new T.Scene(); flScene.add(fQuad);

    const glow = css(el, "--fx-contour-glow");
    const mk = (foot) => new T.ShaderMaterial({
      vertexShader: VERT_LAYER, fragmentShader: FRAG_LAYER, transparent: true,
      uniforms: {
        tH: { value: foot ? fRT.texture : hRT.texture }, tV: { value: fl.vA.texture }, uFluid: { value: foot ? FLUID.foot : FLUID.hero }, uEdge: { value: hover ? 1 : 0 },
        uHeight: { value: 0.426 }, uDepth: { value: foot ? 0.298 : 0.175 },
        uShadow: { value: foot ? 0.642 : 0.858 }, uShadowOff: { value: foot ? 0.001 : 0.0075 }, uLight: { value: foot ? 0 : 0.437 }, uTint: { value: 0 }, uTintScale: { value: 1 },
        uWobble: { value: foot ? 0.026 : 0.024 }, uWobbleScale: { value: foot ? 0.23 : 0.16 }, uTime: { value: 0 }, uFoot: { value: foot ? 1 : 0 }, uCycle: { value: 0 },
        uBase: { value: new T.Vector3(...css(el, foot ? "--fx-contour-base-2" : "--fx-contour-base")) }, uDark: { value: new T.Vector3(...css(el, "--fx-contour-shade")) },
        uGlow: { value: new T.Vector3(...glow) }, uRes: { value: new T.Vector2(1, 1) },
      },
    });
    const layers = (foot) => {
      const g = new T.PlaneGeometry(4, 4);
      g.setAttribute("aLayer", new T.InstancedBufferAttribute(new Float32Array(Array.from({ length: LAYERS }, (_, i) => i / LAYERS)), 1));
      const m = new T.InstancedMesh(g, mk(foot), LAYERS);
      const id = new T.Matrix4();
      for (let i = 0; i < LAYERS; i++) m.setMatrixAt(i, id);
      m.frustumCulled = false;
      return m;
    };
    const scene = new T.Scene();
    const hero = layers(false), foot = layers(true);
    scene.add(hero, foot);
    const cam = new T.PerspectiveCamera(70.7, 1, 0.01, 50);
    cam.rotation.order = "XYZ";
    const sRT = new T.WebGLRenderTarget(4, 4);
    const pMat = new T.ShaderMaterial({ vertexShader: VERT_FILL, fragmentShader: FRAG_POST, uniforms: { tScene: { value: sRT.texture }, uBend: { value: -0.152 }, uDistort: { value: 2.016 }, uGrain: { value: 0.1 }, uFade: { value: 0.5 }, uFadeStart: { value: 0.45 }, uTime: { value: 0 } } });
    const pScene = new T.Scene(); pScene.add(new T.Mesh(fill, pMat));

    const size = () => {
      const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight;
      renderer.setSize(w, h, false);
      const pr = renderer.getPixelRatio();
      sRT.setSize(w * pr, h * pr);
      cam.aspect = w / h; cam.updateProjectionMatrix();
      pMat.uniforms.uFadeStart.value = w / h < 1 ? 0.65 : 0.45;
      [hero, foot].forEach((m) => m.material.uniforms.uRes.value.set(w * pr, h * pr));
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(el);
    // Shaders are all compiled at setup — compiling in the frame that first uses the footer or fluid panel (first cursor move) freezes the screen for .5s
    hero.visible = foot.visible = true;
    [[scene, cam], [hScene, cam2], [fScene, cam2], [pScene, cam2]].forEach(([sc, c]) => renderer.compile(sc, c));
    [velMat, divMat, presMat, projMat].forEach((m) => { fQuad.material = m; renderer.compile(flScene, cam2); });

    // Road position: during the first intro seconds 0→2 (first spot), then with scroll progress p it goes 2→8.9, and in the footer 11→13
    const st = { pos: reduce ? 2 : 0, target: 0, lerped: 0, fTarget: 0, fLerped: 0, footer: false, ready: reduce };
    const introTw = reduce ? null : gsap.to(st, { pos: 2, duration: intro, ease: "none", paused: true, onComplete: () => { st.ready = true; } });
    const triggers = [];
    if (window.ScrollTrigger && startEl && endEl) triggers.push(ScrollTrigger.create({ trigger: startEl, endTrigger: endEl, start: "top top", end: "bottom top", scrub: true, onUpdate: (s) => { st.target = s.progress; } }));
    if (window.ScrollTrigger && footEl) triggers.push(ScrollTrigger.create({ trigger: footEl, start: "top bottom", end: "top top", scrub: true, onUpdate: (s) => { st.fTarget = s.progress; }, onToggle: (s) => { st.footer = s.isActive || s.progress > 0; } }));

    // Cursor position is screen 0~1 (y up). On the first move, put the previous position in the same spot so no line is drawn from the corner to the cursor.
    // Phone, like the original, uses only finger-drag fluid color — layer-end jiggle and camera orbit are for mouse devices only
    const ptr = { x: 0, y: 0, px: 0, py: 0, seen: false };
    const s0 = new T.Vector2(), s1 = new T.Vector2(), aim = new T.Vector2();
    const qa = new T.Quaternion(), ea = new T.Euler();
    const onMove = (e) => {
      const p = e.touches ? e.touches[0] : e;
      if (!p) return;
      ptr.x = p.clientX / innerWidth; ptr.y = 1 - p.clientY / innerHeight;
      if (!ptr.seen) { ptr.px = ptr.x; ptr.py = ptr.y; ptr.seen = true; }
      aim.set(ptr.x * 2 - 1, ptr.y * 2 - 1);
      fl.live = 150;
    };
    const moveEvent = hover ? "pointermove" : "touchmove";
    if (!reduce) addEventListener(moveEvent, onMove, { passive: true });
    const pass = (mat, out) => { fQuad.material = mat; renderer.setRenderTarget(out); renderer.render(flScene, cam2); };
    const fluidStep = () => {
      const v = velMat.uniforms;
      v.uA.value.set(ptr.px, ptr.py); v.uB.value.set(ptr.x, ptr.y);
      v.uPush.value.set((ptr.x - ptr.px) * FLUID.push, (ptr.y - ptr.py) * FLUID.push);
      ptr.px = ptr.x; ptr.py = ptr.y;
      v.tV.value = fl.vA.texture; pass(velMat, fl.vB);
      pass(divMat, fl.d);
      presMat.uniforms.tP.value = fl.p0.texture; pass(presMat, fl.p1);
      [fl.p0, fl.p1] = [fl.p1, fl.p0];
      projMat.uniforms.tP.value = fl.p0.texture; pass(projMat, fl.vQ);
      v.tV.value = fl.vQ.texture; pass(velMat, fl.vA);
    };

    const go = () => introTw?.play();
    el.addEventListener("fx:go", go);
    if (options.wait !== "true") go();

    let time = 0, last = 0, lastPos = -1;
    const tick = (t) => {
      const now = t * 1000;
      const dt = Math.max(1, now - (last || now)); last = now;
      time += dt / 1000;
      if (st.ready && !st.footer) {
        st.lerped += (st.target - st.lerped) * follow;
        st.pos = 2 + (13 - 4.1 - 2) * st.lerped;
        pMat.uniforms.uFade.value = 0.5 * (1 - Math.min(1, st.lerped / 0.15));
      } else if (st.footer) {
        st.fLerped += (st.fTarget - st.fLerped) * follow;
        st.pos = 11 + 2 * st.fLerped;
      }
      const s = st.pos;
      if (Math.abs(s - lastPos) > 1e-4) { lastPos = s; el.dispatchEvent(new CustomEvent("fx:seq", { detail: { pos: s } })); }
      cam.position.set(at(TRACK.px, s), at(TRACK.py, s), at(TRACK.pz, s));
      cam.rotation.set(at(TRACK.rx, s), at(TRACK.ry, s), at(TRACK.rz, s));
      if (hover && !reduce) {
        const k = dt / 16;
        s0.lerp(aim, Math.min(1, CAM.lerp1 * k)); s1.lerp(aim, Math.min(1, CAM.lerp2 * k));
        const lk = at(TRACK.look, s);
        cam.translateZ(-CAM.pivot);
        cam.quaternion.multiply(qa.setFromEuler(ea.set(s0.y * lk, -s0.x * lk, 0)));
        cam.quaternion.multiply(qa.setFromEuler(ea.set(0, 0, (s0.x - s1.x) * -CAM.roll)));
        cam.translateZ(CAM.pivot);
      }
      cam.fov = at(TRACK.fov, s); cam.updateProjectionMatrix();
      hero.visible = s < 10.27; foot.visible = s >= 11;
      const u = hero.material.uniforms;
      u.uHeight.value = at(TRACK.height, s); u.uCycle.value = at(TRACK.cycle, s); u.uShadow.value = at(TRACK.shadow, s);
      u.uTint.value = at(TRACK.tint, s); u.uTintScale.value = at(TRACK.tintScale, s); u.uLight.value = at(TRACK.light, s);
      u.uShadowOff.value = at(TRACK.shadowOff, s); u.uWobble.value = at(TRACK.wobble, s); u.uWobbleScale.value = at(TRACK.wobbleScale, s); u.uTime.value = time;
      const f = foot.material.uniforms;
      f.uHeight.value = at(TRACK.fHeight, s); f.uDepth.value = at(TRACK.fDepth, s); f.uTime.value = time;
      pMat.uniforms.uBend.value = at(TRACK.bend, s); pMat.uniforms.uGrain.value = at(TRACK.grain, s); pMat.uniforms.uTime.value = time;
      // Run only up to 150 frames after the last movement (.8694^150 ≈ 0)
      if (fl.live > 0) { fl.live--; fluidStep(); }
      hMat.uniforms.uTime.value = time * 0.00111 * 6; fMat.uniforms.uTime.value = time * 0.0553;
      renderer.setRenderTarget(hero.visible ? hRT : fRT);
      renderer.render(hero.visible ? hScene : fScene, cam2);
      renderer.setRenderTarget(sRT); renderer.clear(); renderer.render(scene, cam);
      renderer.setRenderTarget(null); renderer.render(pScene, cam2);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      introTw?.kill();
      triggers.forEach((t) => t.kill());
      removeEventListener(moveEvent, onMove);
      el.removeEventListener("fx:go", go);
      ro.disconnect();
      [hRT, fRT, sRT, fl.vA, fl.vB, fl.vQ, fl.d, fl.p0, fl.p1].forEach((r) => r.dispose());
      [hMat, fMat, pMat, hero.material, foot.material, velMat, divMat, presMat, projMat].forEach((m) => m.dispose());
      [hero.geometry, foot.geometry, fill].forEach((g) => g.dispose());
      renderer.dispose();
      canvas.remove();
    };
  });
})();
