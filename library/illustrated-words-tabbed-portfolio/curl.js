// Paper-turn when going to a category page via a word link — the original is a single-page app, so it captures the current screen with snapdom and covers it with a WebGL paper,
// When a new plate stands, it rolls over from the right edge as if wrapping around a cylinder in .9s (power2.inOut). Here each page is separate, so the picture taken before leaving is
// passed over via sessionStorage, the new page picks it up and walks it back. Values (radius = shorter side × .3, bend 75, center bulge 50, focal 2000, shade .25) were measured from the original and carried over.
(() => {
  const T = window.THREE;
  const VERT = `
uniform vec2 uSize;
uniform float uSide;
uniform float uPeel;
uniform float uFold;
uniform float uRadius;
uniform float uBow;
uniform float uBulge;
uniform float uFocal;
varying vec2 vUv;
varying float vShade;
varying float vEdge;
varying float vRow;
const float PI = 3.14159265;
void main() {
  vec2 g = vec2(uv.x, 1.0 - uv.y);
  vUv = g;
  vec2 p = g * uSize;
  // Distance measured from the edge where curling starts. Of the folding lines, the center line goes first so the paper bows like an arc
  float u = uSide > 0.5 ? uSize.x - p.x : p.x;
  float off = (0.5 - g.y) / 0.28;
  float fold = uFold + uBulge * uPeel * exp(-off * off);
  float x = u, z = 0.0, shade = 0.0;
  if (u < fold) {
    float a = (fold - u) / uRadius;
    if (a <= PI) { x = fold - uRadius * sin(a); z = uRadius * (1.0 - cos(a)); }
    else { x = fold + (a - PI) * uRadius; z = 2.0 * uRadius; }
    shade = sin(clamp(a, 0.0, PI));
  }
  z += uBow * uPeel * sin(PI * g.y) * clamp(z / uRadius, 0.0, 1.5);
  z = clamp(z, -uFocal * 0.2, uFocal * 0.45);
  vShade = shade * smoothstep(0.0, 0.08, uPeel);
  vEdge = u;
  vRow = p.y;
  vec2 q = vec2(uSide > 0.5 ? uSize.x - x : x, p.y);
  vec2 ndc = q / uSize * 2.0 - 1.0;
  ndc.y = -ndc.y;
  gl_Position = vec4(ndc, -z / uFocal, (uFocal - z) / uFocal);
}`;
  // The rolled side is shaded, and a thin ink line (darker in the middle) follows the curling edge
  const FRAG = `
uniform sampler2D uShot;
uniform vec2 uSize;
uniform float uPeel;
uniform float uDim;
uniform float uEdgeInk;
varying vec2 vUv;
varying float vShade;
varying float vEdge;
varying float vRow;
void main() {
  vec4 c = texture2D(uShot, vUv);
  float dark = 1.0 - uDim * 0.7 * pow(max(vShade, 0.0), 1.3);
  float d = max(vEdge, 0.0);
  float row = (vRow - uSize.y * 0.5) / (uSize.y * 0.45);
  float edge = (exp(-d / 2.5) + 0.25 * exp(-d / 18.0)) * exp(-row * row) * smoothstep(0.0, 0.08, uPeel);
  gl_FragColor = vec4(mix(c.rgb * dark, vec3(0.0), clamp(uEdgeInk * edge, 0.0, 1.0)), 1.0);
}`;

  async function capture() {
    const dpr = Math.min(devicePixelRatio, 2);
    const shot = await (await window.snapdom(document.body, { clip: "viewport", dpr })).toCanvas();
    const out = Object.assign(document.createElement("canvas"), { width: shot.width, height: shot.height });
    const ctx = out.getContext("2d");
    ctx.fillStyle = getComputedStyle(document.documentElement).backgroundColor;
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(shot, 0, 0);
    return out.toDataURL("image/jpeg", 0.86);
  }

  async function play({ src, side }, cover) {
    const img = new Image();
    img.src = src;
    await img.decode();
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:2147483647;pointer-events:none";
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    document.body.append(canvas);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    const w = canvas.clientWidth, h = canvas.clientHeight, radius = Math.min(w, h) * 0.3;
    const shot = new T.Texture(img);
    shot.flipY = false;
    shot.needsUpdate = true;
    const uniforms = {
      uShot: { value: shot }, uSize: { value: new T.Vector2(w, h) }, uSide: { value: side > 0 ? 1 : 0 }, uRadius: { value: radius },
      uBow: { value: 75 }, uBulge: { value: 50 }, uFocal: { value: 2000 }, uDim: { value: 0.25 }, uEdgeInk: { value: 1 }, uPeel: { value: 0 }, uFold: { value: 0 },
    };
    const paper = new T.Mesh(new T.PlaneGeometry(1, 1, 96, 96), new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, side: T.DoubleSide, transparent: true }));
    paper.frustumCulled = false;
    const scene = new T.Scene().add(paper), camera = new T.Camera();
    const draw = (v) => { uniforms.uPeel.value = v; uniforms.uFold.value = v * (w + radius); renderer.render(scene, camera); };
    draw(0);
    // Swap the still cover over the same picture for the WebGL paper
    cover();
    const o = { v: 0 };
    await new Promise((done) => gsap.to(o, { v: 1, duration: 0.9, ease: "power2.inOut", onUpdate: () => draw(o.v), onComplete: done }));
    canvas.remove();
    paper.geometry.dispose();
    paper.material.dispose();
    shot.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }

  window.gCurl = { capture, play };
})();
