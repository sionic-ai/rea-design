(() => {
  // Original Brand background: on a fixed panel behind the screen three light blobs drift slowly at positions warped by noise (time .08x),
  // Each block is weighted by its distance to the −2.2 · −2.2 · −2.4 power and mixed with the background color. The color moves exponentially over 300ms to the skin (data-glow) of the section crossing the 70% line of the screen.
  // 24fps · resolution is pixel ratio × .5. Color comes from the css variable --fx-glow-<Name>-0~3 read from it (0 background, 1~3 chunks).
  const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  const FRAG = `precision mediump float;
uniform vec2 uRes;uniform float uTime;uniform vec3 uBase;uniform vec3 uOne;uniform vec3 uTwo;uniform vec3 uThree;
float rnd(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float soft(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(rnd(i),rnd(i+vec2(1.,0.)),u.x),mix(rnd(i+vec2(0.,1.)),rnd(i+vec2(1.,1.)),u.x),u.y);}
float layered(vec2 p){float s=0.;float k=.5;for(int n=0;n<4;n++){s+=k*soft(p);p=p*2.03+vec2(1.7,9.2);k*=.5;}return s;}
float pull(vec2 q,vec2 c,float g,float e){return g/pow(distance(q,c)+.25,e);}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;float ar=uRes.x/uRes.y;vec2 p=vec2(uv.x*ar,uv.y);float t=uTime*.08;
  vec2 bend=vec2(layered(p*1.2+vec2(t,-t*.7)),layered(p*1.2+vec2(-t*.8,t)+4.3));
  vec2 q=p+(bend-.5)*1.1;
  float w1=pull(q,vec2(ar*(.2+.16*sin(t*1.7)),.3+.18*cos(t*1.3)),1.,2.2);
  float w2=pull(q,vec2(ar*(.8+.14*cos(t*1.1)),.78+.16*sin(t*1.9)),1.,2.2);
  float w3=pull(q,vec2(ar*(.55+.2*cos(t*1.4)),.12+.14*sin(t*1.2)),.8,2.4);
  float w0=1.1;
  gl_FragColor=vec4((uOne*w1+uTwo*w2+uThree*w3+uBase*w0)/(w1+w2+w3+w0),1.);
}`;
  const grainOnce = () => {
    const root = document.documentElement;
    if (getComputedStyle(root).getPropertyValue("--fx-grain").trim()) return;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    if (!g) return;
    const img = g.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 40 + Math.random() * 50;
    }
    g.putImageData(img, 0, 0);
    root.style.setProperty("--fx-grain", `url(${c.toDataURL("image/png")})`);
  };

  kfFx.register("palette-glow-gl", (el, { options, reduce }) => {
    grainOnce();
    const attr = options.attr || "data-glow";
    const line = +(options.line ?? 0.7);
    const tau = Math.max(1, +(options.ease ?? 300));
    const fps = +(options.fps || 24);
    const res = +(options.res || 0.5);
    const dark = new Set((options.dark || "").split(/\s+/).filter(Boolean));
    const style = getComputedStyle(el);
    const names = ["default", ...(options.names || "").split(/\s+/).filter((n) => n && n !== "default")]
      .filter((n) => n === "default" || style.getPropertyValue(`--fx-glow-${n}-0`).trim());

    const probe = document.createElement("i");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = "position:absolute;inline-size:0;block-size:0;overflow:hidden";
    el.append(probe);
    const pixel = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgb = (name, i) => {
      probe.style.color = `var(--fx-glow-${name}-${i})`;
      const css = getComputedStyle(probe).color;
      if (!pixel) return [1, 1, 1];
      pixel.clearRect(0, 0, 1, 1);
      pixel.fillStyle = css;
      pixel.fillRect(0, 0, 1, 1);
      const d = pixel.getImageData(0, 0, 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255];
    };
    const palettes = Object.fromEntries(names.map((n) => [n, [0, 1, 2, 3].flatMap((i) => rgb(n, i))]));
    probe.remove();

    const pick = () => {
      const y = innerHeight * line;
      for (const s of document.querySelectorAll(`[${attr}]`)) {
        const r = s.getBoundingClientRect();
        const n = s.getAttribute(attr);
        if (r.top <= y && r.bottom > y && palettes[n]) return n;
      }
      return "default";
    };
    let name = pick(), target = palettes[name], now = [...target], last = performance.now();
    const mark = () => {
      el.dataset.palette = name;
      el.dataset.tone = dark.has(name) ? "dark" : "light";
    };
    mark();

    const ac = new AbortController();
    const on = { signal: ac.signal, passive: true };
    let paint = null;
    const watch = () => {
      const n = pick();
      if (n === name) return;
      name = n;
      target = palettes[n];
      mark();
      if (reduce) paint?.(performance.now());
    };
    let queued = 0;
    addEventListener("scroll", () => { queued ||= requestAnimationFrame(() => { queued = 0; watch(); }); }, on);

    let canvas = el.querySelector("canvas");
    const own = !canvas;
    if (own) {
      canvas = document.createElement("canvas");
      el.append(canvas);
    }
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power" });
    let raf = 0;
    if (gl) {
      const shader = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
      };
      const vs = shader(gl.VERTEX_SHADER, VERT), fs = shader(gl.FRAGMENT_SHADER, FRAG);
      const prog = gl.createProgram();
      if (vs && fs) {
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
      }
      if (vs && fs && gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, "a");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const u = (n) => gl.getUniformLocation(prog, n);
        const uRes = u("uRes"), uTime = u("uTime"), cols = ["uBase", "uOne", "uTwo", "uThree"].map(u);
        const start = performance.now();
        const size = () => {
          const k = Math.min(devicePixelRatio || 1, 2) * res;
          canvas.width = Math.max(2, Math.round(innerWidth * k));
          canvas.height = Math.max(2, Math.round(innerHeight * k));
          gl.viewport(0, 0, canvas.width, canvas.height);
        };
        paint = (t) => {
          const k = reduce ? 1 : 1 - Math.exp(-(t - last) / tau);
          last = t;
          now = now.map((v, i) => v + ((target[i] ?? v) - v) * k);
          gl.uniform2f(uRes, canvas.width, canvas.height);
          gl.uniform1f(uTime, reduce ? 20 : (t - start) / 1000);
          cols.forEach((c, i) => gl.uniform3f(c, now[i * 3], now[i * 3 + 1], now[i * 3 + 2]));
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          canvas.classList.add("is-ready");
        };
        let shown = 0;
        const loop = (t) => {
          raf = 0;
          if (document.hidden) return;
          raf = requestAnimationFrame(loop);
          if (t - shown < 1000 / fps) return;
          shown = t;
          paint(t);
        };
        const wake = () => { if (!reduce && !raf && !document.hidden) raf = requestAnimationFrame(loop); };
        size();
        paint(performance.now());
        wake();
        addEventListener("resize", () => { size(); paint(performance.now()); }, { signal: ac.signal });
        document.addEventListener("visibilitychange", wake, { signal: ac.signal });
      }
    }

    return () => {
      ac.abort();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(queued);
      if (own) {
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
        canvas.remove();
      } else canvas.classList.remove("is-ready");
      delete el.dataset.palette;
      delete el.dataset.tone;
    };
  });
})();
