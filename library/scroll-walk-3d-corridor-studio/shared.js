// Motion shared by all pages — Lenis (original lerp .085, wheel .8) · entrance loader · nav hide/show and ink color over paper · menu window · page transition curtain · fluid cursor.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const site = (window.AP = { ready: [], isReady: false, lenis: null });
  const whenReady = (fn) => (site.isReady ? fn() : site.ready.push(fn));
  site.whenReady = whenReady;

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = site.lenis = new Lenis({ lerp: +(document.body.dataset.lerp || 0.085), smoothWheel: true, wheelMultiplier: 0.8, anchors: false, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const finish = () => {
    if (site.isReady) return;
    site.isReady = true;
    site.ready.splice(0).forEach((fn) => fn());
    ScrollTrigger.refresh();
  };

  // Entry loader — the table fills from below and counts 00→100, and once full it lifts in .8s (original prep time 2.65s). Skipped when moving inside from the same window
  const loader = document.querySelector(".ap-loader");
  const KEY = "ap-entered";
  const inside = sessionStorage.getItem(KEY) === "1" && document.referrer && new URL(document.referrer).origin === location.origin;
  sessionStorage.setItem(KEY, "1");
  if (loader && !reduce && !inside) {
    lenis?.stop();
    const fill = loader.querySelector(".ap-loader__fill");
    const count = loader.querySelector(".ap-loader__count");
    const bar = loader.querySelector(".ap-loader__track i");
    const s = { p: 0 };
    const done = () => {
      loader.classList.add("is-done");
      lenis?.start();
      finish();
    };
    const tw = gsap.to(s, {
      p: 100, duration: 2.65, ease: "power3.out",
      onUpdate: () => {
        const v = Math.round(s.p);
        count.textContent = String(v).padStart(2, "0");
        fill.style.clipPath = `inset(${100 - s.p}% 0 0)`;
        bar.style.transform = `scaleX(${s.p / 100})`;
      },
      onComplete: done,
    });
    loader.querySelector(".ap-loader__skip")?.addEventListener("click", () => { tw.progress(1); });
  } else {
    if (loader) { loader.style.transition = "none"; loader.classList.add("is-done"); }
    requestAnimationFrame(finish);
  }

  // Nav — hides when scrolling down (is-away) and returns when scrolling up. Over a light panel (data-paper) the text turns ink color
  const nav = document.querySelector(".ap-nav");
  if (nav) {
    let last = scrollY;
    const papers = [...document.querySelectorAll("[data-paper]")];
    const tick = () => {
      const y = scrollY, d = y - last;
      last = y;
      if (y < 80 || d < -2) nav.classList.remove("is-away");
      else if (d > 2) nav.classList.add("is-away");
      const probe = nav.getBoundingClientRect().height / 2;
      nav.classList.toggle("on-paper", papers.some((p) => { const r = p.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; }));
    };
    lenis ? lenis.on("scroll", tick) : addEventListener("scroll", tick, { passive: true });
    tick();
  }

  // Menu window
  const menu = document.querySelector(".ap-menu");
  // Opening (original timetable) — the window comes down as a bottom-rounded curtain (42%) in .65s, and text lines rise from 115% below at 5° in .64s (after .13s, .065s per line),
  // Logo shadow goes from −22° to −12° in 1s, and close, number, mail and one-line turn on in .35s after a .22s delay
  const menuLabels = [];
  menu?.querySelectorAll(".ap-menu__list a").forEach((a) => {
    const t = [...a.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (!t) return;
    const wrap = document.createElement("span"), inner = document.createElement("span");
    wrap.className = "ap-menu__label";
    inner.className = "ap-menu__label-text";
    inner.textContent = t.textContent.trim();
    wrap.append(inner);
    a.replaceChild(wrap, t);
    menuLabels.push(inner);
  });
  let menuRuns = [];
  const openMenu = () => {
    menu.showModal();
    lenis?.stop();
    menuRuns.forEach((r) => r.cancel());
    menuRuns = [];
    if (reduce) return;
    const run = (el, frames, o) => menuRuns.push(el.animate(frames, { fill: "both", ...o }));
    run(menu, [{ clipPath: "inset(0 0 100% 0 round 0 0 42% 42%)" }, { clipPath: "inset(0 0 0% 0 round 0 0 0% 0%)" }], { duration: 650, easing: "cubic-bezier(.22,.75,.2,1)" });
    menuLabels.forEach((el, i) => run(el, [{ transform: "translate3d(0,115%,0) rotate(5deg)", opacity: 0 }, { transform: "translate3d(0,0,0) rotate(0deg)", opacity: 1 }], { duration: 640, delay: 130 + i * 65, easing: "cubic-bezier(.16,1,.3,1)" }));
    run(menu, [{ transform: "translate3d(10%,8%,0) rotate(-22deg)", opacity: 0 }, { transform: "translate3d(0,0,0) rotate(-12deg)", opacity: 1 }], { duration: 1000, delay: 140, easing: "cubic-bezier(.16,1,.3,1)", pseudoElement: "::before" });
    [menu.querySelector(".ap-menu__close"), ...menu.querySelectorAll(".ap-menu__list small"), menu.querySelector(".ap-menu__mail"), menu.querySelector(".ap-menu__note")]
      .filter(Boolean).forEach((el) => run(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 350, delay: 220, easing: "ease-out" }));
  };
  document.querySelector(".ap-nav__menu")?.addEventListener("click", () => menu && openMenu());
  menu?.querySelector(".ap-menu__close")?.addEventListener("click", () => menu.close());
  menu?.addEventListener("close", () => { menuRuns.forEach((r) => r.cancel()); menuRuns = []; lenis?.start(); });
  // Current page line in sage color
  const here = location.pathname.split("/").pop() || "index.html";
  menu?.querySelectorAll(".ap-menu__list a").forEach((a) => { if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page"); });

  // Page transition veil — pressing an inner link covers the screen with a plasma veil in .45s, the word letters wobble, then on to the next page. On arrival the same veil lifts.
  const route = document.querySelector(".ap-route");
  if (route) {
    const word = route.querySelector(".ap-route__word");
    const setWord = (t) => { word.innerHTML = [...t].map((c, i) => (c === " " ? `<span style="--i:${i};width:.28em"></span>` : `<span style="--i:${i}">${c}</span>`)).join(""); };
    if (inside && !reduce) {
      route.style.transition = "none";
      route.classList.add("is-on");
      setWord(document.title.split("—")[0].trim().slice(0, 18));
      requestAnimationFrame(() => requestAnimationFrame(() => { route.style.transition = "opacity 1.9s linear, visibility 1.9s"; setTimeout(() => route.classList.remove("is-on"), 300); }));
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html(#.*)?$/.test(href) || reduce) return;
      e.preventDefault();
      setWord(a.dataset.route || a.textContent.trim().slice(0, 18) || "Loading");
      route.style.transition = "opacity 1s linear 0.1s, visibility 1s linear 0.1s"; route.classList.add("is-on");
      setTimeout(() => { location.href = href; }, 1100);
    });
    addEventListener("pageshow", (e) => { if (e.persisted) route.classList.remove("is-on"); });
  }

  // Title line — <br> Lines split this way rise from below (105%) inside the mask in .9s power3.out, with .08 between lines
  document.querySelectorAll("[data-lines]").forEach((el) => {
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((p) => `<span class="ap-line"><span>${p.trim()}</span></span>`).join("");
    if (reduce) return;
    const inner = el.querySelectorAll(".ap-line > span");
    gsap.set(inner, { yPercent: 105 });
    whenReady(() => ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: () => gsap.to(inner, { yPercent: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }),
    }));
  });

  // # links go through Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const t = a.getAttribute("href").length > 1 && document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(t) : t.scrollIntoView();
  }));

  // Fluid cursor — moving the mouse over a [data-liquid] cell smears paint in a fluid trail scaled by speed (original splat: spread .0022, force .7·min(1, speed/1.5)·dt·60/4).
  // The original renderer is not in the archive, so we rewrote it with our own shader (advection and damping across two half-float textures). Cleared when out of the cell, on scroll, or when the window changes
  const liquidTargets = document.querySelectorAll("[data-liquid]");
  const fine = matchMedia("(min-width: 761px) and (any-hover: hover)");
  if (liquidTargets.length && !reduce) {
    let L = null, host = null, last = null, raf = 0, prevT = 0, idle = 0;
    const build = () => {
      const canvas = document.createElement("canvas");
      canvas.className = "ap-liquid";
      canvas.style.clipPath = "inset(100%)";
      canvas.setAttribute("aria-hidden", "true");
      const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, alpha: true, antialias: false });
      if (!gl || !gl.getExtension("EXT_color_buffer_float")) return null;
      document.body.append(canvas);
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const prog = (fs) => {
        const p = gl.createProgram();
        gl.attachShader(p, sh(gl.VERTEX_SHADER, "#version 300 es\nin vec2 a;out vec2 uv;void main(){uv=a*.5+.5;gl_Position=vec4(a,0,1);}"));
        gl.attachShader(p, sh(gl.FRAGMENT_SHADER, "#version 300 es\nprecision highp float;in vec2 uv;out vec4 o;" + fs));
        gl.bindAttribLocation(p, 0, "a");
        gl.linkProgram(p);
        const u = {};
        const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name; u[name] = gl.getUniformLocation(p, name); }
        return { p, u };
      };
      // Advection + damping + dye injection in one pass: rg velocity, b dye
      const step = prog(`uniform sampler2D s;uniform vec2 px;uniform float dt;uniform vec4 sp;uniform vec2 f;uniform float r;uniform float asp;
        void main(){vec3 c=texture(s,uv).xyz;vec2 back=uv-dt*c.xy*px*60.;vec3 a=texture(s,back).xyz;a.xy*=.985;a.z*=.972;
        vec2 d=uv-sp.xy;d.x*=asp;float g=exp(-dot(d,d)/r)*sp.z;a.xy+=f*g;a.z+=g*sp.w;o=vec4(a,1);}`);
      // Drawing: a glass-like film that tilts its surface by the paint-height gradient to catch light
      const draw = prog(`uniform sampler2D s;uniform vec2 px;uniform vec3 tint;uniform vec3 hi;
        void main(){float h=texture(s,uv).z;float hx=texture(s,uv+vec2(px.x,0)).z-texture(s,uv-vec2(px.x,0)).z;float hy=texture(s,uv+vec2(0,px.y)).z-texture(s,uv-vec2(0,px.y)).z;
        vec3 n=normalize(vec3(-hx*6.,-hy*6.,1.));float spec=pow(max(dot(n,normalize(vec3(.4,.6,1.))),0.),40.);float edge=1.-n.z;
        float a=clamp(h*.9,0.,.55)+spec*.8+edge*1.6;vec3 col=mix(tint,hi,clamp(spec*1.4+edge*2.,0.,1.));o=vec4(col*clamp(a,0.,.9),clamp(a,0.,.9));}`);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const tex = () => {
        const t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const fb = gl.createFramebuffer();
        return { t, fb };
      };
      const A = tex(), B = tex();
      const state = { gl, canvas, step, draw, A, B, w: 0, h: 0, sw: 0, sh: 0, live: false };
      state.resize = () => {
        const dpr = Math.min(devicePixelRatio, 1.5);
        canvas.width = state.w = Math.round(innerWidth * dpr);
        canvas.height = state.h = Math.round(innerHeight * dpr);
        state.sw = 160; state.sh = Math.max(32, Math.round(160 * innerHeight / innerWidth));
        for (const T of [A, B]) {
          gl.bindTexture(gl.TEXTURE_2D, T.t);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, state.sw, state.sh, 0, gl.RGBA, gl.HALF_FLOAT, null);
          gl.bindFramebuffer(gl.FRAMEBUFFER, T.fb);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, T.t, 0);
          gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        }
      };
      state.resize();
      const css = getComputedStyle(document.documentElement);
      const rgb = (v) => { const c = document.createElement("canvas").getContext("2d"); c.fillStyle = v; c.fillRect(0, 0, 1, 1); const d = c.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255]; };
      state.tint = rgb(css.getPropertyValue("--kf-accent").trim());
      state.hi = rgb(css.getPropertyValue("--kf-contrast-ink").trim());
      state.pending = null;
      state.render = (dt) => {
        const { gl } = state;
        const src = state.A, dst = state.B;
        gl.viewport(0, 0, state.sw, state.sh);
        gl.useProgram(step.p);
        gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.t);
        gl.uniform1i(step.u.s, 0);
        gl.uniform2f(step.u.px, 1 / state.sw, 1 / state.sh);
        gl.uniform1f(step.u.dt, dt);
        gl.uniform1f(step.u.asp, innerWidth / innerHeight);
        gl.uniform1f(step.u.r, 0.0022);
        const sp = state.pending;
        if (sp) { gl.uniform4f(step.u.sp, sp[0], sp[1], 1, sp[4] * 6); gl.uniform2f(step.u.f, sp[2] * 0.02, sp[3] * 0.02); }
        else { gl.uniform4f(step.u.sp, -9, -9, 0, 0); gl.uniform2f(step.u.f, 0, 0); }
        state.pending = null;
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        state.A = dst; state.B = src;
        const S = dst;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, state.w, state.h);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(draw.p);
        gl.bindTexture(gl.TEXTURE_2D, S.t);
        gl.uniform1i(draw.u.s, 0);
        gl.uniform2f(draw.u.px, 1 / state.sw, 1 / state.sh);
        gl.uniform3f(draw.u.tint, ...state.tint);
        gl.uniform3f(draw.u.hi, ...state.hi);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.disable(gl.BLEND);
      };
      // Run both shaders once before the first draw to finish compiling — so the first motion doesn’t stall
      state.render(1 / 60);
      return state;
    };
    const reset = () => {
      cancelAnimationFrame(raf); raf = 0; prevT = 0; last = null; host = null;
      if (L) {
        L.canvas.style.clipPath = "inset(100%)";
        const { gl } = L;
        for (const T of [L.A, L.B]) { gl.bindFramebuffer(gl.FRAMEBUFFER, T.fb); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
      }
    };
    const frame = (t) => {
      raf = 0;
      if (!host || !host.isConnected) return reset();
      const r = host.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= innerHeight) return reset();
      const dt = prevT ? Math.min(0.05, Math.max(0.001, (t - prevT) / 1000)) : 1 / 60;
      prevT = t;
      L.canvas.style.clipPath = `inset(${Math.max(0, r.top)}px ${Math.max(0, document.documentElement.clientWidth - r.right)}px ${Math.max(0, innerHeight - r.bottom)}px ${Math.max(0, r.left)}px)`;
      L.render(dt);
      idle += dt;
      if (idle < 2.5) raf = requestAnimationFrame(frame);
    };
    addEventListener("pointermove", (e) => {
      const t = e.target.closest?.("[data-liquid]");
      if (e.pointerType !== "mouse" || !fine.matches || !t || document.querySelector("dialog[open]")) { last = null; return; }
      if (!L) { L = build(); if (!L) return; }
      const now = performance.now(), x = e.clientX / innerWidth, y = 1 - e.clientY / innerHeight;
      if (host !== t) { last = null; host = t; }
      if (last) {
        const dt = Math.min(0.05, Math.max(0.004, (now - last.at) / 1000));
        const vx = (x - last.x) / dt, vy = (y - last.y) / dt, sp = Math.hypot(vx, vy);
        if (sp > 0.02) {
          L.pending = [x, y, vx * 0.5, vy * 0.5, 0.7 * Math.min(1, sp / 1.5) * dt * 60 / 4];
          idle = 0;
          if (!raf) raf = requestAnimationFrame(frame);
        }
      }
      last = { x, y, at: now };
    }, { passive: true });
    addEventListener("scroll", reset, { passive: true });
    addEventListener("resize", () => { reset(); L?.resize(); });
    addEventListener("blur", reset);
  }
})();
