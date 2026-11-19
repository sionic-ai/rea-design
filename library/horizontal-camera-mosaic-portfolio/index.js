// First page — hero background shader (rough bright panel + rippling ink blots), horizontal camera, donation section photo strip and logo
(() => {
  const { reduce, SIGN } = window.RC;
  document.querySelectorAll("[data-sign]").forEach((n) => (n.innerHTML = `<svg viewBox="0 0 640 140" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"><path d="${SIGN}"/></svg>`));

  // Hero — replacing the original shader scene and ink blot video with our shader: fine grain over the whole panel, and an ink blot whose edges ripple with fbm as it follows the cursor
  const cv = document.querySelector(".rc-hero__gl");
  const gl = cv?.getContext("webgl", { premultipliedAlpha: false });
  if (gl) {
    // Even if a computed color arrives as an oklab or color() string, painting it on a canvas and reading it back gives sRGB
    const c2d = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgb = (v) => { c2d.clearRect(0, 0, 1, 1); c2d.fillStyle = v; c2d.fillRect(0, 0, 1, 1); return [...c2d.getImageData(0, 0, 1, 1).data].slice(0, 3).map((x) => x / 255); };
    const ink = rgb(getComputedStyle(document.documentElement).getPropertyValue("--kf-bg").trim()), paper = rgb(getComputedStyle(document.querySelector(".rc-hero")).backgroundColor);
    const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    const fs = `precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;uniform vec3 ink,paper;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
      void main(){vec2 uv=gl_FragCoord.xy/r;vec2 q=uv;q.x*=r.x/r.y;
        vec2 c=vec2((.6+m.x)*r.x/r.y,.6+m.y);
        float d=length((q-c)*vec2(1.,.82))+.22*(fbm(q*2.6+vec2(t*.16,-t*.12))-.5)+.06*(fbm(q*9.+t*.3)-.5);
        float blob=1.-smoothstep(.26,.262,d);
        float g=(h(gl_FragCoord.xy+fract(t)*91.7)-.5)*.07;
        vec3 col=mix(paper,ink,blob)+g;
        gl_FragColor=vec4(col,1.);}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (k) => gl.getUniformLocation(pr, k);
    gl.uniform3fv(U("ink"), ink); gl.uniform3fv(U("paper"), paper);
    // Original scene: an ink blot (circle mask) follows the cursor by 87% of the panel — 1/8 of the remaining distance per frame at 60fps (half in 85ms, nearly all in 700ms),
    // 150ms after the scene appears, the follow share goes 0→.87 over 2s (easeInOutQuart). The noise pattern is fixed to the screen so blotches shift and change shape. Phones follow by touch
    const mouse = [0, 0], want = [0, 0], TRACK = 0.87;
    const aim = (x, y) => { const b = cv.getBoundingClientRect(); want[0] = (x - b.left) / b.width - 0.5; want[1] = 0.5 - (y - b.top) / b.height; };
    if (!reduce) {
      addEventListener("mousemove", (e) => aim(e.clientX, e.clientY));
      addEventListener("touchmove", (e) => e.touches[0] && aim(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    }
    const quart = (x) => (x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2);
    const fit = () => { const dpr = Math.min(devicePixelRatio, 1.5); cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U("r"), cv.width, cv.height); };
    fit(); addEventListener("resize", fit);
    let seen = true;
    new IntersectionObserver(([e]) => (seen = e.isIntersecting)).observe(cv);
    const t0 = performance.now();
    let last = t0;
    const frame = (now) => {
      requestAnimationFrame(frame);
      const dt = Math.min(now - last, 64);
      last = now;
      if (!seen) return;
      const k = 1 - (7 / 8) ** (dt * 0.06);
      mouse[0] += (want[0] - mouse[0]) * k; mouse[1] += (want[1] - mouse[1]) * k;
      const track = TRACK * quart(Math.min(Math.max((now - t0 - 150) / 2000, 0), 1));
      gl.uniform1f(U("t"), reduce ? 0 : (now - t0) / 1000);
      gl.uniform2f(U("m"), mouse[0] * track, mouse[1] * track);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    requestAnimationFrame(frame);
  }

  // GSAP reads the layer slider title’s CSS translate −50% as px, and when the width is an odd px the half-width and rounding mismatch, so it drops −50% and the part’s x overwrites it
  // Only that title overlaps the neighboring title (visible at English title width) — fix its share before the part writes x
  if (window.gsap) gsap.set(".rc-slider__title", { xPercent: -50, yPercent: -50, x: 0, y: 0 });

  if (!window.gsap || reduce) return;
  // Webflow’s easeInOut is the same curve as CSS ease-in-out
  const io = window.CustomEase ? CustomEase.create("rc-wf-io", "0.42,0,0.58,1") : "power1.inOut";
  const mm = gsap.matchMedia();
  mm.add("(min-width: 768px)", () => {
    // Original Webflow ”horizontal scroll”: from when the section enters the screen until it fully leaves, panel −100% (easeInOut) during progress 10%→90%, smooth follow 50
    const sec = document.querySelector(".rc-hscroll");
    gsap.timeline({ scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 0.5 } })
      .set(".rc-hscroll__frame", { xPercent: 0 }, 0)
      .to(".rc-hscroll__frame", { xPercent: -100, ease: io, duration: 0.8 }, 0.1)
      .to({}, { duration: 0.1 });
    // Original ”philanthropy”: while passing the section, photo row 0→−72%, logo 0→360° (easeInOut)
    const phil = document.querySelector(".rc-phil");
    gsap.timeline({ scrollTrigger: { trigger: phil, start: "top bottom", end: "bottom top", scrub: 0.5 } })
      .to(".rc-phil__photos", { xPercent: -72, ease: io }, 0)
      .to(".rc-phil__logo", { rotate: 360, ease: io }, 0);
  });
  mm.add("(max-width: 767px)", () => {
    const phil = document.querySelector(".rc-phil");
    gsap.timeline({ scrollTrigger: { trigger: phil, start: "top bottom", end: "bottom top", scrub: 0.5 } })
      .to(".rc-phil__photos", { xPercent: -280, ease: io }, 0)
      .to(".rc-phil__logo", { rotate: 360, ease: io }, 0);
  });
})();
