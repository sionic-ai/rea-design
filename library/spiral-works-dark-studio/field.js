// Blue light-ray background (behind the work spiral · service head) — our own shader draws the ridges of a flowing ripple pattern as light rays. While the cursor is over it, the area around the cursor ripples.
// Values read from the original: ripple radius .46 (ratio of short side) · strength .45 · folds 18 times within the radius · spreads at 5rad per second · push width .07×strength, cursor position and on state follow with 1-exp(-12dt) (83ms time constant),
// Time .86x, flow .204 (about .31·.23 Hz), grain .098, saturation 1.45, pixels up to 2 million. The four colors are --site-field-0~3 in shared.css (original dark and light panel values).
(() => {
  const els = document.querySelectorAll("[data-field]");
  if (!els.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Variables built with color-mix don’t resolve via getPropertyValue, so read the computed color by painting one
  const probe = document.createElement("i");
  probe.hidden = true;
  document.body.append(probe);
  const palette = () => [0, 1, 2, 3].flatMap((k) => {
    probe.style.color = `var(--site-field-${k})`;
    const c = getComputedStyle(probe).color, n = (c.match(/[\d.]+/g) || []).map(Number);
    return c.startsWith("color(") ? n.slice(0, 3) : n.slice(0, 3).map((v) => v / 255);
  });
  const RADIUS = 0.46, STRENGTH = 0.45, FOLDS = 18, SPEED = 5, PUSH = 0.07, FOLLOW = 12, TIME = 0.86, MAXPX = 2e6;

  const VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  const FS = `precision highp float;
uniform vec2 res;uniform float unit,t;uniform vec3 ptr;uniform vec3 pal[4];
uniform float radius,strength,folds,speed,push;
float rnd(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*f*(f*(f*6.-15.)+10.);
  return mix(mix(rnd(i),rnd(i+vec2(1.,0.)),f.x),mix(rnd(i+vec2(0.,1.)),rnd(i+1.),f.x),f.y);}
float fb(vec2 p){float s=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<4;i++){s+=a*vn(p);p=m*p;a*=.5;}return s;}
float strand(float f,float w){return w/(abs(sin(f*3.14159))+w);}
vec3 ramp(float x){x=clamp(x,0.,1.)*3.;vec3 c=mix(pal[0],pal[1],smoothstep(0.,1.,x));
  c=mix(c,pal[2],smoothstep(0.,1.,x-1.));return mix(c,pal[3],smoothstep(0.,1.,x-2.));}
void main(){
  float s=unit;
  vec2 p=(gl_FragCoord.xy-.5*res)/s;
  if(ptr.z>.001){
    vec2 c=.5*ptr.xy*res/s,d=p-c;float r=length(d);
    float m=ptr.z*(1.-smoothstep(0.,radius,r));
    p-=d/max(r,1e-4)*sin(r/radius*folds-t*speed)*m*strength*push;
  }
  p=p*1.26+.204*vec2(sin(t*.31),cos(t*.23));
  // Two slanted light beams — bent by slow noise, each streak brightening and dimming with its own noise
  vec2 w=vec2(fb(p*.45+vec2(0.,t*.04)),fb(p*.45+vec2(3.7,1.9)-t*.035))-.5;
  float f1=dot(p,vec2(.8,.6))*2.3+w.x*3.+t*.05;
  float f2=dot(p,vec2(-.6,.8))*2.+w.y*3.3-t*.04;
  float m1=smoothstep(.25,.7,fb(p*.6+vec2(9.,t*.03)));
  float m2=smoothstep(.25,.7,fb(p*.6+vec2(1.,-t*.03)));
  float g=(strand(f1,.012)+strand(f1,.12)*.2)*m1*.5+(strand(f2,.01)+strand(f2,.1)*.2)*m2*.42;
  vec3 col=ramp(1.-exp(-g*1.1));
  float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,1.45);
  col+=(rnd(gl_FragCoord.xy*.731+3.1)-.5)*.098;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`;

  els.forEach((host) => {
    const canvas = document.createElement("canvas");
    canvas.className = "v-field";
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl) return;
    const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    host.append(canvas);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    const uRes = U("res"), uUnit = U("unit"), uT = U("t"), uPtr = U("ptr"), uPal = U("pal");
    gl.uniform1f(U("radius"), RADIUS); gl.uniform1f(U("strength"), STRENGTH); gl.uniform1f(U("folds"), FOLDS);
    gl.uniform1f(U("speed"), SPEED); gl.uniform1f(U("push"), PUSH);
    const paint = () => gl.uniform3fv(uPal, new Float32Array(palette()));
    paint();
    new MutationObserver(() => { paint(); kick(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    let rect = canvas.getBoundingClientRect(), raf = 0, last = null, shown = true, t0 = performance.now();
    // Target (tx,ty,on) and following values (x,y,p) — if the cursor is off the panel, only drop on to 0
    let tx = 0, ty = 0, on = 0, x = 0, y = 0, p = 0, cx = 0, cy = 0, has = false;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      let w = Math.max(1, Math.round(rect.width * dpr)), h = Math.max(1, Math.round(rect.height * dpr));
      const k = Math.min(1, Math.sqrt(MAXPX / (w * h)));
      w = Math.max(1, Math.round(w * k)); h = Math.max(1, Math.round(h * k));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(uRes, w, h);
      // Pattern and wave size follow the screen’s short side, not the panel — the original panel fills the screen (fixed for Service), so radius .46 means .46 of the screen’s short side
      gl.uniform1f(uUnit, Math.min(innerWidth, innerHeight) * (w / Math.max(1, rect.width)));
    };
    const aim = () => {
      if (!has || !rect.width || !rect.height) return;
      if (cx < rect.left || cx > rect.right || cy < rect.top || cy > rect.bottom) { on = 0; return; }
      const nx = ((cx - rect.left) / rect.width) * 2 - 1, ny = 1 - ((cy - rect.top) / rect.height) * 2;
      if (on === 0 && p < 0.01) { x = nx; y = ny; }
      tx = nx; ty = ny; on = 1;
    };
    const frame = (now) => {
      raf = 0;
      if (!shown || document.hidden) return;
      const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;
      const k = 1 - Math.exp(-FOLLOW * dt);
      x += (tx - x) * k; y += (ty - y) * k; p += (on - p) * k;
      size();
      gl.uniform1f(uT, reduce ? 0 : ((now - t0) / 1000) * TIME);
      gl.uniform3f(uPtr, x, y, reduce ? 0 : p);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce) kick(); else last = null;
    };
    const kick = () => { if (!raf && shown && !document.hidden) raf = requestAnimationFrame(frame); };
    const refit = () => { rect = canvas.getBoundingClientRect(); aim(); kick(); };
    // Set it up once before drawing — so first compile and resizing don’t pile up on the first cursor move
    size(); gl.uniform1f(uT, 0); gl.uniform3f(uPtr, 0, 0, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!reduce) {
      addEventListener("pointermove", (e) => { has = true; cx = e.clientX; cy = e.clientY; rect = canvas.getBoundingClientRect(); aim(); kick(); }, { passive: true });
      const off = () => { has = false; on = 0; kick(); };
      addEventListener("pointercancel", off);
      addEventListener("blur", off);
      document.documentElement.addEventListener("pointerleave", off);
      addEventListener("scroll", refit, { capture: true, passive: true });
    }
    addEventListener("resize", refit);
    new ResizeObserver(refit).observe(canvas);
    new IntersectionObserver(([e]) => { shown = e.isIntersecting; if (shown) kick(); else { cancelAnimationFrame(raf); raf = 0; last = null; } }).observe(canvas);
    document.addEventListener("visibilitychange", () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; last = null; } else kick(); });
    kick();
  });
})();
