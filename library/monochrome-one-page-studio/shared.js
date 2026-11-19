// Shared: Lenis 1.3.26 (anchors), logo-overlap loader, scroll progress bar, hiding header, phone menu, local time, mouse coordinates, once-when-visible, lightbox,
// Ripple WebGL (around the cursor over photos and videos), dot-scene footer (WebGL), footer inner descent and big logo rise.
// Original values — loader: five layers z −(i+1)×2.5em · opacity .5^(i+1) (.55s power4.out, .05 apart), tilt Y −40° · X 20° · xPercent −15 (.6s power4.out),
// after .4s gathers with power4.in, then 1.05 → 1 elastic.out(1,.5) .6s, background scaleY 0 .5s expo.inOut. Progress bar scrub .5, click-to-move .725s power3.out.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const JG = (window.JG = { reduced, fine, lenis: null });

  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ anchors: true });
    JG.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Logo overlap loader ──
  const loader = document.querySelector(".jg-loader");
  const done = () => root.classList.remove("is-loading");
  JG.ready = new Promise((res) => (JG._res = res));
  if (loader && !reduced) {
    const bg = loader.querySelector(".jg-loader__bg"), stack = loader.querySelector(".jg-loader__stack"), logo = loader.querySelector(".jg-loader__logo");
    const bar = loader.querySelector(".jg-loader__bar"), track = loader.querySelector(".jg-loader__track");
    const clones = Array.from({ length: 5 }, () => { const c = logo.cloneNode(true); c.setAttribute("aria-hidden", "true"); stack.appendChild(c); return c; });
    const em = parseFloat(getComputedStyle(stack).fontSize);
    const tl = gsap.timeline({ defaults: { duration: .4, ease: "power2.out" } });
    gsap.set(clones, { opacity: 0, z: 0 });
    tl.to(stack, { autoAlpha: 1, duration: .5 })
      .addLabel("tilt", "-=0.1")
      .to(stack, { rotationY: -40, rotationX: 20, xPercent: -15, duration: .6, ease: "power4.out" }, "tilt")
      .to(clones, { z: (i) => -(i + 1) * 2.5 * em, opacity: (i) => Math.pow(.5, i + 1), duration: .55, ease: "power4.out", stagger: { each: .05, ease: "power1.out" } }, "tilt+=0.1")
      .addLabel("smash", "+=0.4")
      .to(stack, { rotationY: 0, rotationX: 0, xPercent: 0, ease: "power4.in" }, "smash")
      .to(clones, { z: 0, ease: "power4.in" }, "smash")
      .addLabel("impact")
      .set(clones, { opacity: 0 }, "impact")
      .to(stack, { scale: 1.05, duration: .1 }, "impact")
      .to(stack, { scale: 1, duration: .6, ease: "elastic.out(1, 0.5)" })
      .to(stack, { autoAlpha: 0 }, "impact+=0.5")
      .to(bg, { scaleY: 0, duration: .5, ease: "expo.inOut" }, "impact+=0.6");
    tl.to(bar, { scaleX: 1, duration: tl.labels.impact, ease: "power2.inOut" }, 0).to(track, { autoAlpha: 0 }, "impact+=0.5");
    tl.call(() => { done(); JG._res(); }, null, "impact+=0.6");
    tl.call(() => root.classList.remove("has-loader"));
  } else { root.classList.remove("has-loader"); done(); JG._res(); }

  // ── Scroll progress bar ──
  const pwrap = document.querySelector(".jg-progress");
  if (pwrap) {
    gsap.to(".jg-progress__bar", { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: .5 } });
    pwrap.addEventListener("click", (e) => {
      const y = (e.clientX / pwrap.offsetWidth) * (document.body.scrollHeight - innerHeight);
      JG.lenis ? JG.lenis.scrollTo(y, { duration: .725, easing: gsap.parseEase("power3.out") }) : scrollTo(0, y);
    });
  }

  // ── Header: hides on scroll down and returns on scroll up (past 120px) ──
  const head = document.querySelector(".jg-head");
  const mmenu = document.querySelector(".jg-mmenu"), mbtn = document.querySelector(".jg-nav__menu");
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    head?.classList.toggle("is-hidden", y > lastY && y > 120 && !mmenu?.classList.contains("is-open"));
    lastY = y;
  }, { passive: true });
  const setMenu = (on) => { mmenu?.classList.toggle("is-open", on); mbtn?.setAttribute("aria-expanded", String(on)); if (mbtn) mbtn.textContent = on ? "Close" : "Menu"; };
  mbtn?.addEventListener("click", () => setMenu(!mmenu.classList.contains("is-open")));
  mmenu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // ── Local time (every 15s) · clock hands ──
  const clock = () => {
    const d = new Date(), h = d.getHours(), m = d.getMinutes();
    document.querySelectorAll("[data-local-time]").forEach((t) => (t.textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`));
    document.querySelector(".jg-clock__h")?.setAttribute("transform", `rotate(${(h % 12) * 30 + m * .5} 9 9)`);
    document.querySelector(".jg-clock__m")?.setAttribute("transform", `rotate(${m * 6 - 90} 9 9)`);
  };
  clock();
  setInterval(clock, 15000);

  // ── Mouse coordinates ──
  const cx = document.querySelector("[data-coord-x]"), cy = document.querySelector("[data-coord-y]");
  if (cx && cy) document.addEventListener("mousemove", (e) => { cx.textContent = Math.round(e.pageX); cy.textContent = Math.round(e.pageY); });

  // ── Once when visible (12% before the screen bottom) ──
  document.querySelectorAll("[data-words]").forEach((w) => w.querySelectorAll(".jg-w").forEach((x, i) => x.style.setProperty("--i", i)));
  const reveals = document.querySelectorAll("[data-reveal], [data-words]");
  if (reduced || !("IntersectionObserver" in window)) reveals.forEach((r) => r.classList.add("is-visible"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px" });
    reveals.forEach((r) => io.observe(r));
  }

  // ── Ripple WebGL: within .45 radius around the cursor concentric ripples (28 nodes, 5 per second) · pull toward cursor .04 · color split .006, hover .8s power2.out ──
  const readColor = (v) => { const p = document.createElement("i"); p.style.color = `var(${v})`; document.body.append(p); const c = getComputedStyle(p).color.match(/[\d.]+/g).map(Number); p.remove(); return c.slice(0, 3).map((x) => x / 255); };
  JG.readColor = readColor;
  JG.ripple = (canvas, paint) => {
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false });
    if (!gl) return null;
    const vs = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
    const fs = `precision mediump float;uniform sampler2D t;uniform vec2 res,m;uniform float hov,time;varying vec2 v;
      void main(){vec2 d=v-m;d.x*=res.x/res.y;float r=length(d);vec2 n=d/(r+1e-4);float f=smoothstep(.45,0.,r)*hov;
      float w=sin(r*28.-time*5.)*.012*f;vec2 uv=v+vec2(n.x*res.y/res.x,n.y)*w;uv=mix(uv,m,.04*f);vec2 s=n*.006*f;
      gl_FragColor=vec4(texture2D(t,uv+s).r,texture2D(t,uv).g,texture2D(t,uv-s).b,1.);}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(pr, n);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Photo slot art: wraps a placeholder (diagonal board) painted in the skin color — when a real photo is added, swap that art via texImage2D
    const src = document.createElement("canvas");
    const state = { mx: .5, my: .5, hover: 0 };
    const draw = (time) => {
      const dpr = Math.min(devicePixelRatio || 1, 2), w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (!w || !h) return;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = src.width = w; canvas.height = src.height = h;
        paint(src.getContext("2d"), w, h);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u("res"), w, h); gl.uniform2f(u("m"), state.mx, state.my); gl.uniform1f(u("hov"), state.hover); gl.uniform1f(u("time"), time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    return { state, draw };
  };
  JG.paintPlaceholder = (ctx, w, h) => {
    const [a, b, c] = [readColor("--kf-raised"), readColor("--kf-line"), readColor("--kf-dim")].map((x) => `rgb(${x.map((v) => Math.round(v * 255)).join(",")})`);
    ctx.fillStyle = a; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = b; ctx.lineWidth = Math.max(1, w / 400);
    for (let x = -h; x < w; x += w / 14) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke(); }
    ctx.fillStyle = c; ctx.font = `${Math.round(h / 14)}px ${getComputedStyle(document.body).fontFamily}`; ctx.textAlign = "center"; ctx.fillText("Photo slot", w / 2, h / 2);
  };
  JG.bindRipple = (host, canvas) => {
    if (!fine || reduced || !canvas) return null;
    const r = JG.ripple(canvas, JG.paintPlaceholder);
    if (!r) return null;
    const qx = gsap.quickTo(r.state, "mx", { duration: .6, ease: "power3" }), qy = gsap.quickTo(r.state, "my", { duration: .6, ease: "power3" });
    let live = false;
    const tick = (t) => live && r.draw(t);
    gsap.ticker.add(tick);
    host.addEventListener("pointerenter", (e) => {
      const b = host.getBoundingClientRect();
      gsap.set(r.state, { mx: (e.clientX - b.left) / b.width, my: 1 - (e.clientY - b.top) / b.height });
      live = true; canvas.classList.add("is-on");
      gsap.to(r.state, { hover: 1, duration: .8, ease: "power2.out", overwrite: "auto" });
    });
    host.addEventListener("pointerleave", () => gsap.to(r.state, { hover: 0, duration: .8, ease: "power2.out", overwrite: "auto", onComplete: () => { live = false; canvas.classList.remove("is-on"); } }));
    host.addEventListener("pointermove", (e) => { const b = host.getBoundingClientRect(); qx((e.clientX - b.left) / b.width); qy(1 - (e.clientY - b.top) / b.height); });
    return r;
  };
  document.querySelectorAll("[data-ripple]").forEach((h) => { const c = h.querySelector(".jg-ripple-canvas"); if (c && !h.closest(".jg-lb")) JG.bindRipple(c.parentElement, c); });

  // ── Lightbox: opens from below with clip inset .8s power4.inOut, text follows after .35s from 24px below .06s apart, photo rotates 360° on the X axis 1.4s power3.out ──
  const lb = document.querySelector(".jg-lb");
  if (lb) {
    const panel = lb.querySelector(".jg-lb__panel"), info = lb.querySelector(".jg-lb__info"), media = lb.querySelector(".jg-lb__media");
    let opener = null, open = false;
    JG.bindRipple(media, media.querySelector(".jg-ripple-canvas"));
    const spin = () => !reduced && gsap.fromTo(media, { rotationX: 360 }, { rotationX: 0, duration: 1.4, ease: "power3.out", transformPerspective: 1400 });
    const show = (from, n) => {
      opener = from; open = true;
      lb.querySelector(".jg-lb__count").textContent = `(${String(n + 1).padStart(2, "0")} / 07)`;
      lb.hidden = false;
      JG.lenis?.stop();
      root.classList.add("lightbox-open");
      gsap.killTweensOf([lb, panel, info.children, media]);
      if (reduced) return gsap.set([lb, panel, info.children, media], { clearProps: "all" });
      gsap.fromTo(lb, { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 });
      gsap.fromTo(panel, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .8, ease: "power4.inOut" });
      gsap.fromTo(info.children, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .7, ease: "power3.out", stagger: .06, delay: .35 });
      gsap.delayedCall(.2, spin);
    };
    const hide = () => {
      if (!open) return;
      open = false;
      const fin = () => { lb.hidden = true; JG.lenis?.start(); root.classList.remove("lightbox-open"); opener?.focus({ preventScroll: true }); };
      if (reduced) return fin();
      gsap.to(panel, { clipPath: "inset(0% 0% 100% 0%)", duration: .6, ease: "power4.inOut" });
      gsap.to(lb, { autoAlpha: 0, duration: .3, delay: .4, onComplete: fin });
    };
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-project]");
      if (!t || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      show(t, +t.dataset.project || 0);
    });
    lb.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", hide));
    addEventListener("keydown", (e) => e.key === "Escape" && hide());
    media.addEventListener("click", spin);
  }

  // ── Footer: the inner part comes down from −30%, the big logo rises from (half height + bottom margin) below (scrub .6) ──
  const foot = document.querySelector(".jg-foot");
  if (foot) {
    const inner = foot.querySelector(".jg-foot__inner"), cols = foot.querySelector(".jg-foot__cols"), flogo = foot.querySelector(".jg-foot__logo");
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(cols, { yPercent: -30 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: foot, start: "top bottom", end: "bottom bottom", scrub: true } });
      gsap.fromTo(flogo, { y: () => flogo.getBoundingClientRect().height * .5 + parseFloat(getComputedStyle(inner).paddingBottom) }, { y: 0, ease: "none", scrollTrigger: { trigger: foot, start: () => `bottom bottom+=${flogo.getBoundingClientRect().height + 150}`, end: "bottom bottom", scrub: .6, invalidateOnRefresh: true } });
    });
    // Dot scene (original Unicorn Studio slot): a dot grid on a perspective floor slowly approaches, the lower right glows softly, and it tilts slightly with the mouse.
    const cv = foot.querySelector(".jg-foot__bg");
    const gl = cv?.getContext("webgl");
    if (gl && !reduced) {
      const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
      const fs = `precision mediump float;uniform vec2 res,mo;uniform float time;uniform vec3 bg,ink;
        float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
        void main(){vec2 p=(gl_FragCoord.xy-.5*res)/res.y;p+=(mo-.5)*vec2(.06,.04);
        float hz=.42;float z=1./max(.03,hz-p.y);vec2 g=vec2(p.x*z*1.4,z+time*.35);
        vec2 id=floor(g*vec2(7.,2.2));vec2 c=fract(g*vec2(7.,2.2))-.5;float r=h(id);
        float d=length(c*vec2(1.,3.));float dotv=smoothstep(.16,.02,d)*step(.45,r)*(.4+.6*h(id+3.));
        float fade=clamp(2.2/z,0.,1.)*smoothstep(1.4,.2,abs(p.x));
        float glow=.5*smoothstep(1.1,0.,length(p-vec2(.9,-.35)));
        float a=clamp(dotv*fade*.75+glow*.22,0.,1.);gl_FragColor=vec4(mix(bg,ink,a),1.);}`;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const u = (n) => gl.getUniformLocation(pr, n);
      gl.uniform3fv(u("bg"), readColor("--kf-contrast-bg")); gl.uniform3fv(u("ink"), readColor("--kf-contrast-ink"));
      const mo = { x: .5, y: .5 };
      foot.addEventListener("pointermove", (e) => { const b = foot.getBoundingClientRect(); gsap.to(mo, { x: (e.clientX - b.left) / b.width, y: 1 - (e.clientY - b.top) / b.height, duration: 1, ease: "power2.out", overwrite: "auto" }); });
      let on = false;
      new IntersectionObserver(([e]) => (on = e.isIntersecting), { rootMargin: "200px" }).observe(foot);
      gsap.ticker.add((t) => {
        if (!on) return;
        const dpr = Math.min(devicePixelRatio || 1, 1.5), w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
        if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
        gl.viewport(0, 0, w, h);
        gl.uniform2f(u("res"), w, h); gl.uniform2f(u("mo"), mo.x, mo.y); gl.uniform1f(u("time"), t);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      });
    }
  }
  addEventListener("load", () => ScrollTrigger.refresh());
})();
