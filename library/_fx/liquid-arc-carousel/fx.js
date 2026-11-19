// A three.js carousel that wraps several panels around a 180° arc (outside of a cylinder) and spins endlessly — the panels themselves curve around the same cylinder.
// The position follows the target at .085 each frame, and with that speed (±70) the panel pinches at the waist from the center row and leans sideways while red and blue split.
// The farther from center, the smaller down to .65x and darker (.55 + .45×size), vanishing at the last 15% of the arc. The camera tilts ±50 with the mouse and a point of light follows,
// A panel with the cursor over it swells 25 forward at the cursor spot. At first the arc unfolds from a .75x flat line over 1.75s expo.out.
(() => {
  const VERT = [
    "uniform float uRadius;uniform float uWrap;uniform float uCurve;uniform float uVelocity;uniform float uPull;uniform vec2 uPullOrigin;",
    "varying vec2 vUv;varying vec3 vWorld;",
    "void main(){vec3 p=position;float a=p.x/uRadius;p.x=mix(p.x,sin(a)*uRadius,uWrap);p.z+=-(1.-cos(a))*uRadius*uWrap;",
    "p.z-=(p.x*p.x+p.y*p.y*.3)*uCurve*6e-4;float u=(uv.y-.5)*2.;float c=1.-u*u;p.x+=uVelocity*.06*c;p.y*=1.-abs(uVelocity)*.008*c;",
    "p.z+=uPull*(1.-smoothstep(0.,.9,distance(uv,uPullOrigin)));vec4 w=modelMatrix*vec4(p,1.);vWorld=w.xyz;vUv=uv;gl_Position=projectionMatrix*viewMatrix*w;}",
  ].join("\n");
  const FRAG = [
    "precision highp float;uniform sampler2D map;uniform float uVelocity;uniform float uDim;uniform float uAlpha;uniform float uLightRadius;uniform float uLight;",
    "uniform vec3 uLightPos;uniform vec3 uLightColor;uniform vec2 uSize;uniform float uCorner;varying vec2 vUv;varying vec3 vWorld;",
    "float mask(vec2 uv){vec2 s=abs(uv-.5)*uSize-(uSize*.5-uCorner);float d=length(max(s,0.))+min(max(s.x,s.y),0.)-uCorner;return 1.-smoothstep(-1.,1.,d);}",
    "void main(){float ab=clamp(uVelocity*.0022,-.018,.018);vec4 t=texture2D(map,vUv);vec3 c=t.rgb;",
    "if(abs(ab)>1e-4){c.r=texture2D(map,vUv+vec2(ab,0.)).r;c.b=texture2D(map,vUv-vec2(ab,0.)).b;}",
    "c*=uDim;float l=1.-smoothstep(0.,uLightRadius,distance(vWorld,uLightPos));c+=uLightColor*l*uLight;",
    "float d=(fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))-.5)/255.;gl_FragColor=vec4(c+d,t.a*uAlpha*mask(vUv));}",
  ].join("\n");

  const cssRgb = (el, name) => {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
    el.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const g = cv.getContext("2d", { willReadFrequently: true });
    g.fillStyle = c;
    g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  const placeholder = (el, label, ratio) => {
    const cs = getComputedStyle(el);
    const v = (n, d) => cs.getPropertyValue(n).trim() || d;
    const c = document.createElement("canvas");
    c.width = 768;
    c.height = Math.round(768 * ratio);
    const g = c.getContext("2d");
    g.fillStyle = v("--kf-raised", v("--kf-bg", "currentColor"));
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = v("--kf-line", v("--kf-dim", "currentColor"));
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(c.width, c.height); g.moveTo(c.width, 0); g.lineTo(0, c.height); g.stroke();
    if (label) {
      g.font = `500 22px ${v("--kf-font-mono", "monospace")}`;
      const w = g.measureText(label).width + 36;
      g.fillRect((c.width - w) / 2, c.height / 2 - 22, w, 44);
      g.fillStyle = v("--kf-dim", v("--kf-ink", "currentColor"));
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(label, c.width / 2, c.height / 2);
    }
    return c;
  };

  kfFx.register("liquid-arc-carousel", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!T || !slides.length) return;
    const n = slides.length;
    const LERP = +(options.lerp ?? 0.085), WHEEL = +(options.wheel ?? 0.6), DRAG = +(options.drag ?? 1.5), TDRAG = +(options["drag-touch"] ?? 3);
    const ARC = (+(options.arc ?? 180) * Math.PI) / 180, W = +(options.width ?? 0.58), WN = +(options["width-narrow"] ?? 0.8), MAXW = +(options["max-width"] ?? 1280);
    const GAP = +(options.gap ?? 50), GAPN = +(options["gap-narrow"] ?? 25), RATIO = +(options.ratio ?? 0.5625), RATIOP = +(options["ratio-phone"] ?? 1.1);
    const TILT = +(options.tilt ?? 50), LIGHT = +(options.light ?? 0.75), PULL = +(options.pull ?? 25), INTRO = +(options.intro ?? 1.75), VMAX = +(options["velocity-max"] ?? 70);
    const AXIS = options["wheel-axis"] || "both";

    let canvas = el.querySelector("canvas.fx-lac-canvas");
    if (!canvas) { canvas = document.createElement("canvas"); canvas.className = "fx-lac-canvas"; el.prepend(canvas); }
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.outputColorSpace = T.LinearSRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(45, 1, 0.1, 10000);
    const lightPos = new T.Vector3();
    const S = { w: 1, h: 1, D: 1, sw: 1, sh: 1, spacing: 1, loopW: 1, R: 1, ratio: RATIO, pos: 0, target: 0, prev: 0, vel: 0, arc: reduce ? 1 : 0, tilt: [0, 0], tiltT: [0, 0], light: [0, 0], lightT: [0, 0], ndc: new T.Vector2(), inside: false, hovered: -1, drag: null, suppress: false };
    const scale = new Array(n).fill(1), curve = new Array(n).fill(0), pull = new Array(n).fill(0), pullO = slides.map(() => [0.5, 0.5]);
    // The light is the brighter of the garment’s two base colors — on a dark garment the text color, on a light garment the background color becomes the highlight
    const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const inkC = cssRgb(el, "--kf-ink"), bgC = cssRgb(el, "--kf-bg");
    const lightColor = new T.Vector3(...(lum(inkC) > lum(bgC) ? inkC : bgC));
    let geo = new T.PlaneGeometry(1, 1);

    const items = slides.map((s, i) => {
      const media = s.querySelector("img, video, canvas");
      let tex;
      if (media instanceof HTMLVideoElement) tex = new T.VideoTexture(media);
      else if (media instanceof HTMLCanvasElement) tex = new T.CanvasTexture(media);
      else if (media instanceof HTMLImageElement) { tex = new T.Texture(media); const set = () => (tex.needsUpdate = true); media.complete ? set() : media.addEventListener("load", set, { once: true }); }
      tex && (tex.minFilter = T.LinearFilter, tex.generateMipmaps = false);
      const mat = new T.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false, depthWrite: false,
        uniforms: {
          map: { value: tex || null }, uRadius: { value: 1 }, uWrap: { value: 1 }, uCurve: { value: 0 }, uVelocity: { value: 0 }, uPull: { value: 0 }, uPullOrigin: { value: new T.Vector2(0.5, 0.5) },
          uDim: { value: 1 }, uAlpha: { value: 0 }, uLightRadius: { value: 1 }, uLight: { value: LIGHT }, uLightPos: { value: lightPos }, uLightColor: { value: lightColor },
          uSize: { value: new T.Vector2(1, 1) }, uCorner: { value: +(options.corner ?? 4.5) },
        },
      });
      const mesh = new T.Mesh(geo, mat);
      mesh.userData.i = i;
      scene.add(mesh);
      return { s, media, own: !media, mat, mesh };
    });
    const meshes = items.map((it) => it.mesh);

    const build = () => {
      const r = el.getBoundingClientRect();
      const w = Math.max(1, r.width), h = Math.max(1, r.height), narrow = w < 1024;
      S.w = w; S.h = h;
      S.D = h / (2 * Math.tan(T.MathUtils.degToRad(22.5)));
      camera.aspect = w / h;
      camera.far = S.D * 6;
      camera.position.set(0, 0, S.D);
      camera.updateProjectionMatrix();
      S.sw = Math.min(MAXW, w * (narrow ? WN : W));
      S.ratio = w < 640 ? RATIOP : RATIO;
      S.sh = S.sw * S.ratio;
      const keep = S.spacing > 1 ? S.pos / S.spacing : 0, keepT = S.spacing > 1 ? S.target / S.spacing : 0;
      S.spacing = S.sw + (narrow ? GAPN : GAP);
      S.loopW = n * S.spacing;
      S.R = S.loopW / ARC;
      S.pos = S.prev = keep * S.spacing;
      S.target = keepT * S.spacing;
      lightPos.set(0, 0, S.sw * 0.5853);
      geo.dispose();
      geo = new T.PlaneGeometry(S.sw, S.sh, 32, 16);
      items.forEach((it) => {
        it.mesh.geometry = geo;
        const u = it.mat.uniforms;
        u.uRadius.value = S.R;
        u.uSize.value.set(S.sw, S.sh);
        u.uLightRadius.value = S.sw * 0.8621;
        if (it.own) {
          const old = u.map.value;
          const t = new T.CanvasTexture(placeholder(el, it.s.dataset.label || "", S.ratio));
          t.minFilter = T.LinearFilter;
          t.generateMipmaps = false;
          u.map.value = t;
          old && old.dispose();
        }
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      scale.fill(1);
      curve.fill(0);
    };

    const place = (i, e, o) => {
      let x = (((i * S.spacing + S.pos) % S.loopW) + S.loopW) % S.loopW;
      if (x > S.loopW / 2) x -= S.loopW;
      const a = x / S.R, u = S.arc, p = Math.min(1, Math.abs(a) / (ARC / 2));
      scale[i] += (1 + (Math.max(0.65, 1 - p * 0.35) - 1) * u - scale[i]) * 0.15;
      curve[i] += (p * 0.4 * u - curve[i]) * 0.15;
      const grow = 0.75 + 0.25 * u, y = Math.min(Math.abs(e) * 0.0016, 0.045);
      const fade = Math.max(0, Math.min(1, 1 - Math.max(0, (p - 0.85) / 0.15)));
      o.position.set(x + (Math.sin(a) * S.R - x) * u, 0, (Math.cos(a) - 1) * S.R * u);
      o.rotation.y = a * u;
      o.scale.set(scale[i] * (1 + y) * grow, scale[i] * (1 - y * 0.6) * grow, 1);
      const m = o.material.uniforms;
      m.uDim.value = 0.55 + 0.45 * scale[i];
      m.uCurve.value = curve[i];
      m.uVelocity.value = e;
      m.uAlpha.value = (1 + (fade - 1) * u) * u;
      o.visible = m.uAlpha.value > 0.01;
    };

    const ray = new T.Raycaster();
    const ndcOf = (e) => { const r = el.getBoundingClientRect(); return new T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };
    const onDown = (e) => { S.drag = { x: e.clientX, y: e.clientY, start: S.target, dist: 0, axis: null, id: e.pointerId }; };
    const onMove = (e) => {
      if (hover) {
        const r = el.getBoundingClientRect(), t = ((e.clientX - r.left) / r.width) * 2 - 1, s = ((e.clientY - r.top) / r.height) * 2 - 1;
        S.tiltT = [t * TILT, -s * TILT];
        S.lightT = [-t * S.sw * 0.0808, s * S.sw * 0.0808];
        S.ndc.set(t, -s);
        S.inside = true;
      }
      const d = S.drag;
      if (!d) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      // Finger: if vertical comes first, hand off to page scroll
      if (!d.axis && Math.hypot(dx, dy) > 6) { d.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y"; if (d.axis === "x") el.setPointerCapture?.(d.id); }
      if (d.axis === "y") return;
      S.target = d.start + dx * (e.pointerType === "touch" ? TDRAG : DRAG);
      d.dist = Math.abs(dx);
    };
    const onUp = () => { if (S.drag && S.drag.dist > 6) { S.suppress = true; setTimeout(() => (S.suppress = false), 0); } S.drag = null; };
    const onLeave = () => { S.inside = false; };
    const onWheel = (e) => {
      if (!WHEEL) return;
      const d = AXIS === "x" ? e.deltaX : Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      e.preventDefault();
      S.target -= d * WHEEL;
    };
    const onClick = (e) => {
      if (S.suppress) return;
      ray.setFromCamera(ndcOf(e), camera);
      const hit = ray.intersectObjects(meshes.filter((m) => m.visible))[0];
      if (!hit) return;
      const i = hit.object.userData.i;
      const c = -S.pos / S.spacing;
      S.target = -(i + Math.round((c - i) / n) * n) * S.spacing;
      el.dispatchEvent(new CustomEvent("fx:pick", { bubbles: true, detail: { index: i, uv: { x: hit.uv.x, y: hit.uv.y } } }));
    };
    const onKey = (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      e.preventDefault();
      S.target -= (e.key === "ArrowRight" ? 1 : -1) * S.spacing;
    };
    el.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("click", onClick);
    addEventListener("keydown", onKey);

    const tick = () => {
      S.pos += (S.target - S.pos) * (reduce ? 1 : LERP);
      const d = S.pos - S.prev;
      S.prev = S.pos;
      S.vel += (d - S.vel) * LERP;
      const e = reduce ? 0 : Math.max(-VMAX, Math.min(VMAX, S.vel));
      if (hover) {
        for (let k = 0; k < 2; k++) { S.tilt[k] += (S.tiltT[k] - S.tilt[k]) * LERP; S.light[k] += (S.lightT[k] - S.light[k]) * LERP; }
        camera.position.set(S.tilt[0], S.tilt[1], S.D);
        lightPos.x = S.light[0];
        lightPos.y = S.light[1];
      }
      camera.lookAt(0, 0, 0);
      S.hovered = -1;
      if (hover && S.inside && !S.drag) {
        ray.setFromCamera(S.ndc, camera);
        const hit = ray.intersectObjects(meshes.filter((m) => m.visible))[0];
        if (hit) {
          S.hovered = hit.object.userData.i;
          const o = pullO[S.hovered];
          o[0] += (hit.uv.x - o[0]) * LERP * 2;
          o[1] += (hit.uv.y - o[1]) * LERP * 2;
        }
        el.style.cursor = hit ? "pointer" : "";
      }
      items.forEach((it, i) => {
        place(i, e, it.mesh);
        pull[i] += ((i === S.hovered ? PULL : 0) - pull[i]) * LERP * 2;
        if (Math.abs(pull[i]) < 0.05) pull[i] = 0;
        it.mat.uniforms.uPull.value = pull[i];
        it.mat.uniforms.uPullOrigin.value.set(pullO[i][0], pullO[i][1]);
        if (it.media instanceof HTMLCanvasElement) it.mat.uniforms.map.value.needsUpdate = true;
      });
      renderer.render(scene, camera);
      el.style.setProperty("--fx-index", String((((-S.pos / S.spacing) % n) + n) % n));
    };

    build();
    renderer.compile(scene, camera);
    const ro = new ResizeObserver(() => build());
    ro.observe(el);
    gsap.ticker.add(tick);
    const intro = reduce ? null : gsap.to(S, { arc: 1, duration: INTRO, ease: "expo.out", delay: +(options.delay ?? 0) });

    return () => {
      gsap.ticker.remove(tick);
      intro && intro.kill();
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("click", onClick);
      removeEventListener("keydown", onKey);
      items.forEach((it) => { scene.remove(it.mesh); it.mat.dispose(); it.mat.uniforms.map.value && it.mat.uniforms.map.value.dispose(); });
      geo.dispose();
      renderer.dispose();
      canvas.remove();
      el.style.cursor = "";
    };
  });
})();
