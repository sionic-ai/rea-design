// Solutions — six fixed screen boards, and at each section turn they curl diagonally (±.13) from the right edge as if wrapped on a radius-90 cylinder (our vertex shader),
// In the last ”Together” section six sheets gather on one spine to become an open book. The final section has light points rising in a conical spiral.
(() => {
  if (!window.THREE) return;
  const T = THREE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const font = css("--kf-font-sans");
  const C = { night: css("--kf-contrast-bg"), paper: css("--kf-contrast-ink"), ink: css("--kf-ink"), dim: css("--kf-dim"), accent: css("--kf-accent"), soft: css("--kf-accent-soft"), bg: css("--kf-bg") };
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const smooth3 = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };

  // Panel art — on a 1200×680 panel, draw a metal rim (diagonal gradient) and a 5px inset 16:9 case screen area (header strip · large image slot · text lines) in the skin color.
  const sheetTexture = (el, i, small) => {
    const cv = document.createElement("canvas");
    cv.width = small ? 900 : 1200; cv.height = small ? 510 : 680;
    const g = cv.getContext("2d");
    g.setTransform(cv.width / 1200, 0, 0, cv.height / 680, 0, 0);
    const rim = g.createLinearGradient(0, 0, 1200, 680);
    rim.addColorStop(0, C.dim); rim.addColorStop(0.12, C.night); rim.addColorStop(0.72, C.night); rim.addColorStop(1, C.dim);
    g.fillStyle = rim; g.fillRect(0, 0, 1200, 680);
    g.save();
    g.beginPath(); g.roundRect(5, 5, 1190, 669.375, 9); g.clip();
    g.translate(5, 5); g.scale(1190 / 1600, 669.375 / 900);
    const dark = i % 2 === 0;
    g.fillStyle = dark ? C.night : C.bg; g.fillRect(0, 0, 1600, 900);
    g.fillStyle = dark ? C.ink : C.paper; g.fillRect(70, 130, 1460, 580);
    g.strokeStyle = C.dim; g.lineWidth = 2;
    g.beginPath(); g.moveTo(70, 130); g.lineTo(1530, 710); g.moveTo(1530, 130); g.lineTo(70, 710); g.stroke();
    g.fillStyle = dark ? C.paper : C.ink;
    g.font = `500 34px ${font}`;
    g.fillText(el.querySelector(".ap-sol__sheet-head").textContent, 70, 90);
    g.font = `500 64px ${font}`;
    g.fillText(el.querySelector("b").textContent, 70, 800);
    g.font = `400 28px ${font}`;
    g.fillStyle = C.dim;
    g.fillText(el.querySelector("small").textContent, 70, 850);
    g.fillText(el.dataset.label, 110, 430);
    for (let k = 0; k < 4; k++) { g.fillStyle = dark ? C.soft : C.accent; g.fillRect(1180 + k * 80, 60, 56, 18); }
    g.restore();
    const t = new T.CanvasTexture(cv);
    t.colorSpace = T.SRGBColorSpace;
    t.generateMipmaps = false;
    t.minFilter = T.LinearFilter;
    return t;
  };

  const story = document.querySelector(".ap-sol__story");
  const stage = story?.querySelector(".ap-sol__stage");
  const canvas = story?.querySelector(".ap-sol__canvas");
  if (story && stage && canvas) {
    const small = innerWidth <= 760 || matchMedia("(any-pointer:coarse)").matches;
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0, 0);
    const scene = new T.Scene();
    // Screen 1px = Scene 1 — set the camera to the viewport height and reset fov to the stage height
    const cam = new T.PerspectiveCamera(32, 1, 1, 12000);
    const book = new T.Group();
    scene.add(book);
    const els = [...story.querySelectorAll(".ap-sol__sheet")];
    const last = els.length - 1;
    const sheetGeo = new T.PlaneGeometry(600, 340, small ? 60 : 100, small ? 24 : 36);
    const shadowGeo = new T.PlaneGeometry(650, 390);
    const back = new T.Color(C.night), edge = new T.Color(C.dim), shade = new T.Color(C.ink);
    // Angle at which each section opens from the spine when it becomes an open book
    const LEAF = [3.105, 2.93, 2.13, 1.03, 0.22, 0.035];
    const shadowMat = new T.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uAlpha: { value: 1 }, uInk: { value: shade } },
      vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: "varying vec2 vUv;uniform float uAlpha;uniform vec3 uInk;void main(){vec2 q=abs(vUv-.5)-vec2(.42,.39);float e=1.-smoothstep(0.,.09,length(max(q,0.)));gl_FragColor=vec4(uInk,e*.12*uAlpha);}",
    });
    const sheets = els.map((el, i) => {
      const mat = new T.ShaderMaterial({
        side: T.DoubleSide, transparent: true,
        uniforms: { uMap: { value: sheetTexture(el, i, small) }, uCurl: { value: 0 }, uDir: { value: i % 2 ? -0.13 : 0.13 }, uAlpha: { value: 1 }, uBook: { value: 0 }, uLeaf: { value: 0 }, uBack: { value: back }, uEdge: { value: edge } },
        // Curl line is x=Travels 790 to the left from 300 (right end) — by the distance d past the line it wraps onto a radius-90 cylinder up to 3.65rad, and the rest stays straight.
        // Pulled up and down too by the diagonal (uDir). If uBook, all sections x=0 Attached to the spine and spread at the uLeaf angle (the center swells by 26)
        vertexShader: `uniform float uCurl,uDir,uBook,uLeaf;varying vec2 vUv;varying vec3 vView;
          void main(){vUv=uv;vec3 p=position;
            float d=max(0.,p.x+uDir*p.y-(300.-uCurl*790.));
            float a=min(d/90.,3.65),rest=max(0.,d-90.*3.65);
            p.x+=-d+sin(a)*90.+rest*cos(3.65);
            p.z+=(1.-cos(a))*90.+rest*sin(3.65);
            p.y-=uDir*(d-sin(a)*90.)*.6;
            float reach=uv.x*600.,bow=sin(uv.x*3.141593)*26.;
            p=mix(p,vec3(cos(uLeaf)*reach,position.y,sin(uLeaf)*reach+bow),uBook);
            vec4 v=modelViewMatrix*vec4(p,1.);vView=v.xyz;gl_Position=projectionMatrix*v;}`,
        // Rounded glass corners (14px) · grain light on the bending face (.72~1) · the back side is dark grainy paper, and when it becomes a book the flipped picture shows through · thin light on the edges
        fragmentShader: `uniform sampler2D uMap;uniform float uAlpha,uBook;uniform vec3 uBack,uEdge;varying vec2 vUv;varying vec3 vView;
          void main(){
            vec2 q=abs((vUv-.5)*vec2(1200.,680.))-vec2(586.,326.);
            float corner=length(max(q,0.))+min(max(q.x,q.y),0.)-14.;
            float mask=1.-smoothstep(-.8,.8,corner);
            if(mask<.01)discard;
            vec3 col=texture2D(uMap,vUv).rgb;
            vec3 nrm=normalize(cross(dFdx(vView),dFdy(vView)));
            float lit=.72+.28*abs(dot(nrm,normalize(vec3(-.35,.5,1.))));
            if(!gl_FrontFacing){
              float grain=fract(sin(dot(vUv*1200.,vec2(12.9898,78.233)))*43758.5453);
              col=mix(uBack*(1.-grain*.025),texture2D(uMap,vec2(1.-vUv.x,vUv.y)).rgb,uBook*.94);
              col*=1.-.18*uBook*exp(-vUv.x*14.);
            }
            float rim=min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y));
            col=mix(col,uEdge,(1.-smoothstep(0.,.001,rim))*.3);
            gl_FragColor=vec4(col*lit,uAlpha*mask);
            #include <colorspace_fragment>
          }`,
      });
      const m = new T.Mesh(sheetGeo, mat);
      m.frustumCulled = false;
      book.add(m);
      const s = new T.Mesh(shadowGeo, shadowMat.clone());
      s.renderOrder = -10 + i;
      book.add(s);
      return { m, s, mat };
    });

    const capId = story.querySelector(".ap-sol__cap-id"), capName = story.querySelector(".ap-sol__cap-name"), meter = story.querySelector(".ap-sol__meter");
    const chapters = [...story.querySelectorAll(".ap-sol__chapter")];
    const labels = [...els.map((el) => el.querySelector(".ap-sol__sheet-head").textContent), chapters[chapters.length - 1]?.querySelector(".ap-label")?.textContent || ""];
    const names = [...els.map((el) => el.querySelector("b").textContent), "One complete experience"];
    const end = document.querySelector(".ap-sol__end");
    const phone = () => innerWidth <= 760;

    // While a section h2 rises from .9 height to .43 height of the screen, sections turn one by one (phones: to 52px below the stage). After the last section, .6 more over .8 screens — the share that gathers into a book
    let cuts = [];
    const measure = () => {
      const R = innerHeight;
      const e = phone() ? parseFloat(getComputedStyle(stage).top) + stage.clientHeight + 52 : R * 0.43;
      const t = Math.max(e + 80, R * 0.9);
      cuts = chapters.slice(1).map((ch) => { const top = ch.querySelector("h2").getBoundingClientRect().top + scrollY; return [top - t, top - e]; });
    };
    const targetOf = () => {
      let B = 0;
      cuts.forEach(([a, b], k) => { if (scrollY >= a) B = k + clamp01((scrollY - a) / (b - a)); });
      if (cuts.length && B >= els.length) B += clamp01((scrollY - cuts[last][1]) / (innerHeight * 0.8)) * 0.6;
      return B;
    };
    measure();
    ScrollTrigger.addEventListener("refresh", measure);
    addEventListener("resize", measure);

    let w0 = 0, h0 = 0, lastIdx = -1;
    const draw = (P, enter, ptr, leave) => {
      const r = stage.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= innerHeight) { canvas.hidden = true; return; }
      canvas.hidden = false;
      const cw = stage.clientWidth, ch = stage.clientHeight;
      if (cw !== w0 || ch !== h0) {
        w0 = cw; h0 = ch;
        renderer.setSize(cw, ch, false);
        cam.aspect = cw / ch;
        cam.position.z = (innerHeight * 0.5) / Math.tan((16 * Math.PI) / 180);
        cam.fov = (2 * Math.atan((ch * 0.5) / cam.position.z) * 180) / Math.PI;
        cam.updateProjectionMatrix();
      }
      const ph = phone();
      const k = Math.min((r.width * (ph ? 0.84 : 0.78)) / 600, Math.max(130, ch - (ph ? 56 : 100)) / 450);
      const asm = smooth3((P - last) / 0.95), turn = smooth3(leave);
      book.scale.setScalar(k * (1 - asm * 0.46));
      book.position.set(0, (ph ? 22 : 0) - (1 - enter) * 80 - asm * (ph ? 0 : 20), 0);
      book.rotation.set(0.06 + asm * 0.46 + ptr.y * 0.05, -0.13 + asm * 0.07 + ptr.x * 0.06 + turn * 0.12, -0.025 - asm * 0.08);
      sheets.forEach(({ m, s, mat }, n) => {
        const rel = n - Math.min(P, last), gone = clamp01(-rel);
        const alpha = (1 - smooth3((gone - 0.76) / 0.24)) * (1 - asm) + asm;
        const u = mat.uniforms;
        u.uAlpha.value = alpha;
        u.uCurl.value = gone * (1 - asm);
        u.uBook.value = asm;
        u.uLeaf.value = LEAF[n % LEAF.length] + (n === 2 ? turn * 0.62 : 0);
        m.visible = alpha > 0.001;
        const x = rel > 0 ? rel * 3.5 : gone * -65, y = rel > 0 ? -rel * 3.5 : gone * 10;
        m.position.set(x * (1 - asm), y * (1 - asm), -Math.max(rel, 0) * 5 * (1 - asm));
        s.position.set(m.position.x, m.position.y - 12, m.position.z - 18);
        s.visible = m.visible && rel < 1.2 && asm < 0.99;
        s.material.uniforms.uAlpha.value = alpha * (1 - gone * (1 - asm) * 0.85) * (1 - asm);
      });
      renderer.render(scene, cam);
      const idx = Math.min(els.length, Math.round(P));
      if (idx !== lastIdx) {
        lastIdx = idx;
        capId.textContent = labels[idx];
        capName.textContent = names[idx];
      }
      meter.style.setProperty("--m", Math.min(1, (P + 1) / labels.length).toFixed(3));
    };

    renderer.setSize(96, 96, false);
    renderer.compile(scene, cam);
    let P = targetOf(), on = true, last0 = 0;
    const aim = { x: 0, y: 0 }, ptr = { x: 0, y: 0 };
    stage.addEventListener("pointermove", (e) => { if (e.pointerType === "touch") return; const r = stage.getBoundingClientRect(); aim.x = (e.clientX - r.left) / r.width - 0.5; aim.y = (e.clientY - r.top) / r.height - 0.5; });
    stage.addEventListener("pointerleave", () => { aim.x = aim.y = 0; });
    new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(stage);
    gsap.ticker.add(() => {
      const now = performance.now(), dt = last0 ? now - last0 : 16.67;
      last0 = now;
      if (!on) return;
      const B = targetOf();
      // Section transitions and cursor tilt follow with 140ms damping
      const f = reduce ? 1 : 1 - Math.exp(-Math.min(dt, 64) / 140);
      P += (B - P) * f;
      ptr.x += (aim.x - ptr.x) * f;
      ptr.y += (aim.y - ptr.y) * f;
      const enter = clamp01((innerHeight - stage.getBoundingClientRect().top) / (innerHeight * 0.8));
      const leave = end ? clamp01((innerHeight * 0.92 - end.getBoundingClientRect().top) / (innerHeight * 0.94)) : 0;
      draw(P, enter, ptr, leave);
    });
  }

  // Final section — light-dot cone spiral (our dot shader)
  const coneCv = document.querySelector(".ap-sol__cone");
  if (coneCv) {
    const renderer = new T.WebGLRenderer({ canvas: coneCv, antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(40, 1, 0.1, 100);
    cam.position.set(0, 2.2, 11);
    cam.lookAt(0, 2.4, 0);
    const N = 5200, pos = new Float32Array(N * 3), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const h = Math.random(), r = (1 - h) * 2.6 * (0.75 + Math.random() * 0.35), a = h * 40 + Math.random() * 6.28;
      pos.set([Math.cos(a) * r, h * 6, Math.sin(a) * r], i * 3);
      seed[i] = Math.random();
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new T.BufferAttribute(seed, 1));
    const pts = new T.Points(geo, new T.ShaderMaterial({
      transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uColor: { value: new T.Color(C.soft) }, uPx: { value: renderer.getPixelRatio() } },
      vertexShader: `uniform float uTime,uPx;attribute float aSeed;varying float vA;
        void main(){vec3 p=position;float a=uTime*.15+p.y*.08;p.xz=mat2(cos(a),-sin(a),sin(a),cos(a))*p.xz;p.y+=sin(uTime*.6+aSeed*20.)*.04;
        vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(1.4+aSeed*2.2)*uPx*(9./-mv.z);vA=.35+.65*fract(aSeed*7.+uTime*.2);}`,
      fragmentShader: `uniform vec3 uColor;varying float vA;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(uColor,(1.-d*2.)*vA);}`,
    }));
    scene.add(pts);
    const resize = () => { renderer.setSize(coneCv.clientWidth, coneCv.clientHeight, false); cam.aspect = coneCv.clientWidth / Math.max(1, coneCv.clientHeight); cam.updateProjectionMatrix(); };
    new ResizeObserver(resize).observe(coneCv);
    resize();
    renderer.compile(scene, cam);
    let on = false;
    new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(coneCv);
    gsap.ticker.add((t) => { if (!on) return; pts.material.uniforms.uTime.value = reduce ? 0 : t; renderer.render(scene, cam); });
  }
})();
