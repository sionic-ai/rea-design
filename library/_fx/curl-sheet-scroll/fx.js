(() => {
  // Stacked sheets are wrapped onto a cylinder and turned one by one following progress (sheet count − 1). Shaders are compiled at setup so the first scroll doesn’t stall.
  const VERT = `uniform float uCurl,uW,uH,uAng,uR;varying vec2 vUv;varying float vShade;
    void main(){vUv=uv;vec3 p=position;vec2 dir=vec2(cos(uAng),sin(uAng));
      float d=dot(p.xy,dir);float span=uW*.5*abs(dir.x)+uH*.5*abs(dir.y);float line=mix(span,-span-3.1416*uR,uCurl);
      float s=d-line;vShade=0.;
      if(s>0.){float th=s/uR;vec2 base=p.xy-dir*s;
        if(th<3.1416){p.xy=base+dir*(uR*sin(th));p.z=uR*(1.-cos(th));vShade=sin(th);}
        else{p.xy=base-dir*(s-3.1416*uR);p.z=2.*uR;}}
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
  const FRAG = `uniform sampler2D uMap;uniform vec3 uBack;varying vec2 vUv;varying float vShade;
    void main(){vec4 c=gl_FrontFacing?texture2D(uMap,vUv):vec4(uBack*.82,1.);c.rgb*=1.-vShade*.28;gl_FragColor=c;}`;
  // paper: original paper-scene type — based on a 600-wide panel, the curl line travels 790 from the right edge (300), and the distance past it wraps around a cylinder of radius 90
  // Curls up to 3.65rad then stretches straight. Each sheet alternately gets a diagonal skew of ±.13 and is pulled up and down by .6 accordingly. A sheet that has turned moves off to the upper left and fades out from .76
  const VERT_PAPER = `uniform float uCurl,uW,uDir;varying vec2 vUv;varying float vShade;
    void main(){vUv=uv;vec3 p=position;float k=uW/600.,R=90.*k;
      float d=max(0.,p.x+uDir*p.y-(300.-uCurl*790.)*k);
      float a=min(d/R,3.65),rest=max(0.,d-R*3.65);
      p.x+=-d+sin(a)*R+rest*cos(3.65);p.z+=(1.-cos(a))*R+rest*sin(3.65);p.y-=uDir*(d-sin(a)*R)*.6;
      vShade=sin(min(a,3.1416))*.5;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
  const FRAG_PAPER = `uniform sampler2D uMap;uniform vec3 uBack;uniform float uAlpha;varying vec2 vUv;varying float vShade;
    void main(){vec4 c=gl_FrontFacing?texture2D(uMap,vUv):vec4(uBack*.82,1.);c.rgb*=1.-vShade*.28;gl_FragColor=vec4(c.rgb,uAlpha);}`;

  kfFx.register("curl-sheet-scroll", (el, { options, reduce, scroller }) => {
    const T = window.THREE;
    const items = [...el.querySelectorAll(':scope > [data-fx-part="sheet"]')];
    if (!T || !T.WebGLRenderer || !items.length) return;
    gsap.registerPlugin(ScrollTrigger);
    let canvas = el.querySelector(':scope > [data-fx-part="canvas"]');
    const made = !canvas;
    if (made) { canvas = document.createElement("canvas"); canvas.dataset.fxPart = "canvas"; canvas.setAttribute("aria-hidden", "true"); el.append(canvas); }
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { if (made) canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const cs = getComputedStyle(el);
    const back = new T.Color(cs.getPropertyValue("--kf-dim").trim() || cs.color);
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(32, 1, 0.1, 50);
    const paper = options.paper === true || options.paper === "true";
    const W = 4.8, H = paper ? (4.8 * 340) / 600 : 3;
    const geo = new T.PlaneGeometry(W, H, paper ? 100 : 80, paper ? 36 : 40);
    const texOf = (it) => {
      if (it.tagName === "IMG") { const t = new T.TextureLoader().load(it.currentSrc || it.src); t.colorSpace = T.SRGBColorSpace; return t; }
      const cv = document.createElement("canvas");
      cv.width = 800; cv.height = 500;
      const g = cv.getContext("2d");
      const s = getComputedStyle(it);
      g.fillStyle = s.backgroundColor; g.fillRect(0, 0, 800, 500);
      g.fillStyle = s.color; g.font = `500 36px ${s.fontFamily}`;
      g.fillText(it.textContent.trim().slice(0, 40), 40, 460);
      const t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; return t;
    };
    const group = new T.Group();
    const sheets = items.map((it, i) => {
      const m = new T.Mesh(geo, new T.ShaderMaterial({
        side: T.DoubleSide, vertexShader: paper ? VERT_PAPER : VERT, fragmentShader: paper ? FRAG_PAPER : FRAG, transparent: paper,
        uniforms: { uMap: { value: texOf(it) }, uCurl: { value: 0 }, uW: { value: W }, uH: { value: H }, uAng: { value: +(options.angle ?? -0.32) }, uR: { value: +(options.radius ?? 0.42) }, uBack: { value: back }, uDir: { value: i % 2 ? -0.13 : 0.13 }, uAlpha: { value: 1 } },
      }));
      m.position.z = -i * 0.004;
      m.renderOrder = items.length - i;
      group.add(m);
      return m;
    });
    const tilt = +(options.tilt ?? -0.32);
    group.rotation.set(-0.08, tilt, 0.02);
    scene.add(group);
    const st = { P: 0 };
    const trackEl = (options.track && document.querySelector(options.track)) || el;
    const trig = ScrollTrigger.create({
      trigger: trackEl, ...(scroller && { scroller }), start: "top top", end: "bottom bottom",
      scrub: reduce ? false : +(options.scrub ?? 0.5),
      onUpdate: (s) => { st.P = s.progress * (sheets.length - 1); },
    });
    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.position.set(0, 0, w < 760 ? 9.5 : 8.2);
      cam.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    renderer.compile(scene, cam);
    let on = true;
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; });
    io.observe(el);
    const tick = (t) => {
      if (!on || !canvas.clientWidth) return;
      sheets.forEach((m, i) => {
        const c = Math.min(1, Math.max(0, st.P - i));
        m.material.uniforms.uCurl.value = c;
        if (!paper) { m.visible = c < 1 || i === sheets.length - 1; return; }
        const k = W / 600, f = Math.min(1, Math.max(0, (c - 0.76) / 0.24)), a = 1 - f * f * (3 - 2 * f);
        m.material.uniforms.uAlpha.value = a;
        m.visible = a > 0.001;
        m.position.set(c * -65 * k, c * 10 * k, -i * 0.004);
      });
      group.rotation.y = tilt + (reduce ? 0 : Math.sin(t * 0.3) * 0.03);
      renderer.render(scene, cam);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      trig.kill(); ro.disconnect(); io.disconnect();
      sheets.forEach((m) => { m.material.uniforms.uMap.value.dispose(); m.material.dispose(); });
      geo.dispose(); renderer.dispose();
      if (made) canvas.remove();
    };
  });
})();
