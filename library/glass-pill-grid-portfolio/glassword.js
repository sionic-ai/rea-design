// Work hero glass text: take normals from a height field drawn with blurred letter shapes, and refract the video behind (or the placeholder image) like glass, and
// Splits red, green and blue to put a color fringe on the edges, and the light follows the pointer (original GlassWord — three scene). three@0.185 is used only as a canvas.
(() => {
  const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uBack; uniform sampler2D uHeight;
uniform vec2 uRes; uniform vec2 uBackFit; uniform vec2 uLight; uniform float uTime; uniform float uIn; uniform float uNoBack; uniform float uShow;
vec3 back(vec2 uv){ return texture2D(uBack, (uv - .5) * uBackFit + .5).rgb; }
void main(){
  vec2 px = 1. / uRes;
  float h = texture2D(uHeight, vUv).r;
  float hx = texture2D(uHeight, vUv + vec2(px.x * 2., 0.)).r - texture2D(uHeight, vUv - vec2(px.x * 2., 0.)).r;
  float hy = texture2D(uHeight, vUv + vec2(0., px.y * 2.)).r - texture2D(uHeight, vUv - vec2(0., px.y * 2.)).r;
  vec3 n = normalize(vec3(-hx * 6., -hy * 6., 1.));
  float body = smoothstep(.04, .22, h) * uIn;
  vec2 off = n.xy * .045 * body;
  vec3 col = vec3(back(vUv - off * .92).r, back(vUv - off).g, back(vUv - off * 1.1).b);
  vec3 L = normalize(vec3((uLight - .5) * vec2(2., -2.), .8));
  float spec = pow(max(dot(reflect(-L, n), vec3(0., 0., 1.)), 0.), 24.);
  float rim = pow(1. - n.z, 1.6);
  vec3 glass = col * (1.06 + .12 * h) + spec * .85 + rim * .55 + vec3(.04, .03, .07) * h;
  // If the back picture can’t be read (on file:// video can’t be uploaded as a texture), lay only the glass’s light and rim on as a transparent panel
  if (uNoBack > .5) { gl_FragColor = vec4(vec3(spec * .85 + rim * .55 + .08 * h), body * (.35 + .5 * rim + .6 * spec)); return; }
  gl_FragColor = vec4(mix(back(vUv), glass, body) * uShow, 1.);
}`;
  const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;

  function heightMap(word, w, h, font) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    g.fillStyle = "black"; // Not a Skin: it is a height field (grayscale values), so not a color
    g.fillRect(0, 0, w, h);
    let size = h * 0.42;
    g.font = `700 ${size}px ${font}`;
    const fit = g.measureText(word).width;
    if (fit > w * 0.86) size *= (w * 0.86) / fit;
    g.font = `700 ${size}px ${font}`;
    g.textAlign = "center"; g.textBaseline = "middle";
    // Stack blurs to build a height that rises roundly from the edges to the center
    for (const [blur, alpha] of [[size * 0.09, 0.45], [size * 0.045, 0.35], [size * 0.015, 0.3]]) {
      g.filter = `blur(${blur}px)`;
      g.globalAlpha = alpha;
      g.fillStyle = "white"; // Not skin: height value
      g.fillText(word, w / 2, h * 0.5);
    }
    return c;
  }

  window.alGlassWord = function glassWord(host, opts) {
    if (!window.THREE) return null;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const noBack = location.protocol === "file:";
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: noBack, premultipliedAlpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.domElement.className = "al-glassword";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene(), cam = new THREE.Camera();
    const back = new THREE.Texture(opts.back);
    const heightTex = new THREE.CanvasTexture(document.createElement("canvas"));
    const u = { uBack: { value: back }, uHeight: { value: heightTex }, uRes: { value: new THREE.Vector2(1, 1) }, uBackFit: { value: new THREE.Vector2(1, 1) }, uLight: { value: new THREE.Vector2(0.35, 0.3) }, uTime: { value: 0 }, uIn: { value: reduce ? 1 : 0 }, uNoBack: { value: noBack ? 1 : 0 }, uShow: { value: reduce ? 1 : 0 } };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: u, depthTest: false, transparent: noBack });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    renderer.compile(scene, cam);
    const size = () => {
      const r = host.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      renderer.domElement.style.width = "100%"; renderer.domElement.style.height = "100%";
      const hm = heightMap(opts.word, Math.round(r.width * 0.75), Math.round(r.height * 0.75), opts.font);
      heightTex.image = hm; heightTex.needsUpdate = true;
      u.uRes.value.set(hm.width, hm.height);
      const ba = (opts.back.videoWidth || opts.back.width) / (opts.back.videoHeight || opts.back.height) || 16 / 9, sa = r.width / r.height;
      u.uBackFit.value.set(sa > ba ? 1 : sa / ba, sa > ba ? ba / sa : 1);
    };
    size();
    document.fonts?.ready.then(size);
    const ro = new ResizeObserver(size);
    ro.observe(host);
    const light = { x: 0.35, y: 0.3, tx: 0.35, ty: 0.3 };
    const onMove = (e) => { const r = host.getBoundingClientRect(); light.tx = (e.clientX - r.left) / r.width; light.ty = (e.clientY - r.top) / r.height; };
    addEventListener("pointermove", onMove, { passive: true });
    let raf = 0;
    const t0 = performance.now();
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (!noBack && (opts.back.readyState >= 2 || opts.back instanceof HTMLCanvasElement)) back.needsUpdate = true;
      light.x += (light.tx - light.x) * 0.06; light.y += (light.ty - light.y) * 0.06;
      u.uLight.value.set(light.x, light.y);
      u.uTime.value = (now - t0) / 1000;
      renderer.render(scene, cam);
    };
    raf = requestAnimationFrame(loop);
    return {
      show(dur = 1.6) { if (reduce) return; gsap.to(u.uShow, { value: 1, duration: dur, ease: "power1.inOut" }); },
      reveal(dur = 1.4) { if (reduce) return; gsap.to(u.uIn, { value: 1, duration: dur, ease: "power2.out" }); },
      destroy() { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener("pointermove", onMove); renderer.dispose(); renderer.domElement.remove(); },
    };
  };
})();
