// Shared across the whole site — door (loader) · nav · smooth scroll · scroll ticks · panel transitions · menu drawer · reel curtain · fog background WebGL.
// The original is a single-page app, so the 3D stage persists across page changes — here it is re-launched on every page, and once entered, the gate is skipped.
(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = body.dataset.page || "home";
  const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  // Unpack the skin color to rgb 0–1 to pass to the shader
  const rgb = (name) => {
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = css(name); c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  // ── Mark (our mark) — three broken rings + a center diamond. The door art, nav icon and the 3D terrain ridges all derive from this shape ──
  const MARK = {
    width: 0.085,
    rings: [
      { r: 0.4, a0: 40, a1: 320 },
      { r: 0.64, a0: 120, a1: 420 },
      { r: 0.88, a0: 215, a1: 505 },
    ],
    diamond: 0.2,
  };
  const rad = (d) => (d * Math.PI) / 180;
  const markPath = () => {
    const parts = MARK.rings.map(({ r, a0, a1 }) => {
      const x0 = Math.cos(rad(a0)) * r, y0 = -Math.sin(rad(a0)) * r, x1 = Math.cos(rad(a1)) * r, y1 = -Math.sin(rad(a1)) * r;
      return `M${x0.toFixed(4)} ${y0.toFixed(4)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 0 ${x1.toFixed(4)} ${y1.toFixed(4)}`;
    });
    const d = MARK.diamond;
    parts.push(`M0 ${-d}L${d} 0L0 ${d}L${-d} 0Z`);
    return parts.join("");
  };
  const markSvg = (cls, double) => {
    const p = markPath(), w = MARK.width;
    const lines = double
      ? `<path class="mark-out" d="${p}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path class="mark-in" d="${p}" stroke-width="${w - 0.012}" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="${p}" stroke="currentColor" stroke-width="${w * 0.9}" stroke-linecap="round" stroke-linejoin="round"/>`;
    return `<svg class="${cls}" viewBox="-1.05 -1.05 2.1 2.1" fill="none" aria-hidden="true">${lines}</svg>`;
  };

  // ── Film grain drawing ──
  {
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    const c = cv.getContext("2d"), img = c.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    c.putImageData(img, 0, 0);
    root.style.setProperty("--ow-grain", `url(${cv.toDataURL("image/png")})`);
    const g = document.createElement("div"); g.className = "ow-grain"; g.setAttribute("aria-hidden", "true");
    body.append(g);
  }

  // ── Button markup — attach the cloud border part ──
  const ARROW_L = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M9.5 5H1M4.5 1.5 1 5l3.5 3.5"/></svg>';
  const ARROW_R = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M.5 5H9M5.5 1.5 9 5 5.5 8.5"/></svg>';
  const btn = ({ text, href, icon, left, cls = "", attrs = "" }) => {
    const tag = href ? "a" : "button";
    const ic = icon ? `<span class="ow-btn__icon"><span class="ow-btn__icon-line">${icon}</span><span class="ow-btn__icon-line" aria-hidden="true">${icon}</span></span>` : "";
    const tx = text ? `<span class="ow-btn__text"><span data-fx-part="label">${text}</span></span>` : "";
    return `<${tag} class="ow-btn ts-b ${text ? "" : "ow-btn--icon"} ${left ? "ow-btn--left" : ""} ${cls}" data-fx="cloud-ring-hover" ${href ? `href="${href}"` : 'type="button"'} ${attrs}>${tx}${ic}</${tag}>`;
  };

  // ── Nav ──
  const header = document.querySelector('[data-slot="header"]');
  const LINKS = [["list.html", "Works", "works"], ["about.html", "Studio", "about"], ["contact.html", "Contact", "contact"]];
  if (header) {
    const active = (k) => (k === page || (k === "works" && (page === "detail" || page === "home")) ? " is-active" : "");
    header.className = "nav";
    header.innerHTML = `<nav class="nav-bar">
      <div class="nav-logo ow-fade" style="--fade-duration:.6s"><a class="c-logo" href="index.html" aria-label="Back to start"><span class="c-logo__icon">${markSvg("", false)}</span><span class="c-logo__text ts-b" data-label="Your brand’s English name here · the faded trailing word is the field">Brand Name <span class="c-logo__sub">Studio</span></span></a></div>
      <div class="nav-links ow-fade" style="--fade-duration:.6s"><div class="links-pos${page === "home" ? "" : " is-left"}"><div class="links ts-b">${LINKS.map(([h, t, k]) => `<a href="${h}" class="${active(k).trim()}"><span class="link-inner"><span>${t}</span><span aria-hidden="true">${t}</span></span></a>`).join("")}</div></div></div>
      <div class="nav-sound ow-fade" style="--fade-duration:.6s"><button class="sound-toggle" type="button" aria-label="Sound On" aria-pressed="false"><span class="sound-toggle__wrap ts-b"><span class="sound-toggle__inner"><span class="sound-toggle__label">Sound&nbsp;</span><span class="sound-toggle__status sound-toggle__status--off" aria-hidden="true">Blink</span><span class="sound-toggle__status sound-toggle__status--on" aria-hidden="true">On</span></span></span><svg class="sound-toggle__svg" viewBox="0 0 25 25" fill="none"><circle class="c-base" cx="12.5" cy="12.5" r="12" stroke-width=".5"/><circle class="c-hover" cx="12.5" cy="12.5" r="12" stroke="currentColor" stroke-width=".5"/><path class="wave" d="M8.5 12.5h8" stroke="currentColor" stroke-width=".75" stroke-linecap="round"/></svg></button></div>
      <div class="nav-menu ow-fade" style="--fade-duration:.6s">${btn({ text: "Menu", attrs: 'aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle' })}</div>
    </nav>
    <div class="menu-overlay" id="mobile-menu" data-slot="mobile-menu"><nav class="menu-overlay__links" data-label="Three English menu names here">${LINKS.map(([h, t, k]) => `<a href="${h}" class="${active(k).trim()}">${t}</a>`).join("")}</nav></div>`;
    const snd = header.querySelector(".sound-toggle"), wave = snd.querySelector(".wave");
    snd.addEventListener("click", () => {
      const on = snd.classList.toggle("is-active");
      snd.setAttribute("aria-pressed", String(on));
      snd.setAttribute("aria-label", on ? "Sound Off" : "Sound On");
      wave.setAttribute("d", on ? "M8.5 12.5c1-2.4 2-2.4 2.7 0s1.7 2.4 2.6 0 1.8-2.4 2.7 0" : "M8.5 12.5h8");
    });
    const menu = header.querySelector(".menu-overlay"), mt = header.querySelector("[data-menu-toggle]");
    mt.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      mt.setAttribute("aria-expanded", String(open));
      mt.querySelector('[data-fx-part="label"]').textContent = open ? "Close" : "Menu";
      const twin = mt.querySelector('[data-fx-part="label-twin"]');
      if (twin) twin.textContent = open ? "Close" : "Menu";
      open ? lenis?.stop() : lenis?.start();
    });
  }
  const showHeader = () => header?.querySelectorAll(".ow-fade").forEach((n) => n.classList.add("is-visible"));

  // ── Back button · bottom ──
  document.querySelectorAll("[data-back]").forEach((n) => { n.outerHTML = btn({ text: "Back to start", href: "index.html", icon: ARROW_L, left: true, cls: "back", attrs: 'data-slot="back"' }); });
  document.querySelectorAll("[data-ow-btn]").forEach((n) => {
    const d = n.dataset;
    n.outerHTML = btn({ text: d.text, href: d.href, icon: d.icon === "play" ? '<svg viewBox="0 0 10 10" fill="currentColor"><path d="M2 1.2v7.6L8.6 5z"/></svg>' : d.icon === "right" ? ARROW_R : d.icon === "left" ? ARROW_L : "", left: d.icon === "play" || d.icon === "left", cls: d.cls || "", attrs: d.attrs || "" });
  });

  // ── Smooth scroll (Lenis 1.3.23 · lerp .1) + scroll ticks ──
  let lenis = null;
  if (!reduce && window.Lenis && page !== "home") {
    lenis = new Lenis({ autoRaf: false });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  if (page !== "home") {
    const si = document.createElement("div");
    si.className = "scroll-indicator"; si.setAttribute("aria-hidden", "true"); si.dataset.slot = "scroll-indicator";
    si.innerHTML = '<div class="scroll-indicator__track"><div class="scroll-indicator__marker"></div></div>';
    body.append(si);
    const mk = si.querySelector(".scroll-indicator__marker");
    const upd = () => {
      const lim = root.scrollHeight - innerHeight;
      si.classList.toggle("is-visible", lim > 0 && body.classList.contains("is-ready"));
      const p = lim > 0 ? Math.min(1, Math.max(0, scrollY / lim)) : 0;
      mk.style.transform = `translateY(${p * 60}px)`;
    };
    addEventListener("scroll", upd, { passive: true });
    new ResizeObserver(upd).observe(root);
    window.addEventListener("ow:ready", upd);
  }

  // ── Page panel flip ──
  const main = document.querySelector("main.page");
  const ready = () => {
    body.classList.add("is-ready");
    main?.classList.add("page-visible");
    showHeader();
    document.querySelectorAll("[data-ow-play]").forEach((n) => n.dispatchEvent(new CustomEvent("fx:play")));
    window.dispatchEvent(new Event("ow:ready"));
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    if (reduce || !main) { location.href = href; return; }
    main.classList.add("page-hidden");
    window.dispatchEvent(new CustomEvent("ow:leave", { detail: href }));
    setTimeout(() => (location.href = href), 500);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) main?.classList.remove("page-hidden"); });

  // ── Door cover — in the original, the dark board behind the door and the mark outline are inside the 3D scene, so the screen-space cursor trail pierces both and lights the stage below.
  // Values read from the original bundle: tail buffer 1/10 of the screen (up to dpr 1.5) · thickness .05 (screen width) + frame rate×.3 · stamp .05×speed share ·
  // Persistence .8^(dt×10) · blur 1.25 · noise flow ±20×.001 · piercing strength 0→20 (2s, after the stage is set). At widths of 1280 and below the tail stops, like the original.
  // In the original, even when pierced, outside the disc around the marker (about 1.27 times the marker radius) is a dark world with no visible change — the curtain is also pierced only inside that disc
  // In the original the hole opens below the cursor (at your height the band center is 45–60px lower — read as screen shift from the compositing step). Combined with the trailing smear, tuned to 3.5% of screen height.
  const gateVeil = (gateEl, rampAt) => {
    if (reduce || innerWidth <= 1280) return;
    const cv = document.createElement("canvas");
    const gl = cv.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl || !(gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float"))) return;
    const markEl = gateEl.querySelector(".gate-mark");
    const VS = "#version 300 es\nin vec2 p;out vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
    const NOISE = `float hs(vec2 p){vec3 q=fract(p.xyx*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+1.),f.x),f.y);}`;
    const SIM = `#version 300 es
precision highp float;
uniform sampler2D prev;uniform vec2 at;uniform float aspect,radius,amount,keep,time,spread;in vec2 v;out vec4 o;
${NOISE}
float tile(vec2 p){p*=8.;return .2+(vn(p)*.55+vn(p*2.03+5.1)*.3+vn(p*4.1-2.7)*.15)*.62;}
float field(vec2 q){
  float a=tile(q*4.+vec2(time*.1,0.));
  float b=tile(q*8.+vec2(0.,time*.1)+a*.5);
  float c=tile(q*16.+vec2(-time*.05,0.)+b*.5);
  return (a+b*.5+c*.25)/1.75;}
float smear(vec2 c,vec2 k){return texture(prev,c).r*.227+(texture(prev,c+k*.0138).r+texture(prev,c-k*.0138).r)*.316+(texture(prev,c+k*.0323).r+texture(prev,c-k*.0323).r)*.0703;}
void main(){
  float n=field(v);
  vec2 dir=vec2((n-.5)*n*20.);
  float old=texture(prev,v+dir*.001).r;
  float c=old*(1.-spread)+smear(v,dir*(1.-old))*spread;
  c*=keep;
  float d=distance(vec2(v.x,v.y/aspect),vec2(at.x,at.y/aspect));
  float stamp=(1.-smoothstep(0.,radius,d))*clamp(n*2.,0.,1.);
  c=mix(c,1.,stamp*amount);
  o=vec4(clamp(c,0.,1.),0.,0.,1.);}`;
    const VEIL = `#version 300 es
precision highp float;
uniform sampler2D trail;uniform vec2 res;uniform vec3 bg,line,mk,fogc,lit;uniform float strength,markA,own,time;out vec4 o;
${NOISE}
float arc(vec2 p,float r,float a0,float a1){float a=a0+mod(degrees(atan(p.y,p.x))-a0,360.);
  if(a<=a1)return abs(length(p)-r);
  return min(length(p-r*vec2(cos(radians(a0)),sin(radians(a0)))),length(p-r*vec2(cos(radians(a1)),sin(radians(a1)))));}
float seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.));}
void main(){
  vec2 p=(gl_FragCoord.xy-mk.xy)/mk.z;float s=${MARK.diamond.toFixed(3)};
  float d=1e9;
  ${MARK.rings.map((r) => `d=min(d,arc(p,${r.r.toFixed(3)},${r.a0.toFixed(1)},${r.a1.toFixed(1)}));`).join("")}
  d=min(d,min(min(seg(p,vec2(0.,s),vec2(s,0.)),seg(p,vec2(s,0.),vec2(0.,-s))),min(seg(p,vec2(0.,-s),vec2(-s,0.)),seg(p,vec2(-s,0.),vec2(0.,s)))));
  float aa=.5/mk.z,wo=${(MARK.width / 2).toFixed(4)},wi=${((MARK.width - 0.012) / 2).toFixed(4)};
  vec3 c=mix(bg,line,.55*smoothstep(wo+aa,wo-aa,d));
  c=mix(c,bg,smoothstep(wi+aa,wi-aa,d));
  c=mix(bg,c,markA);
  float reach=1.-smoothstep(1.15,1.4,length(p));
  float a=1.-clamp(texture(trail,gl_FragCoord.xy/res+vec2(0.,.035)).r*strength,0.,1.)*reach;
  if(own<.5){o=vec4(c*a,a);return;}
  float m=vn(p*3.+vec2(time*.02,0.))*.6+vn(p*7.-vec2(0.,time*.03))*.4;
  vec3 under=fogc*(.45+.45*m);
  under=mix(under,lit,smoothstep(wo+.07,wo-.02,d)*(.35+.3*m));
  o=vec4(mix(under,c,a),1.);}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = (fs) => {
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(pr, 0, "p"); gl.linkProgram(pr);
      const u = {};
      for (let i = 0, n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS); i < n; i++) { const k = gl.getActiveUniform(pr, i).name; u[k] = gl.getUniformLocation(pr, k); }
      return gl.getProgramParameter(pr, gl.LINK_STATUS) ? { pr, u } : null;
    };
    const sim = prog(SIM), veil = prog(VEIL);
    if (!sim || !veil) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    let bufs = [], sw = 0, sh2 = 0, dpr = 1;
    const target = (w, h) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      return { t, f };
    };
    const mark = [0, 0, 1];
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
      const sd = Math.min(devicePixelRatio || 1, 1.5);
      sw = Math.max(16, Math.round((innerWidth * sd) / 10)); sh2 = Math.max(10, Math.round((innerHeight * sd) / 10));
      bufs.forEach((b) => { gl.deleteTexture(b.t); gl.deleteFramebuffer(b.f); });
      bufs = [target(sw, sh2), target(sw, sh2)];
      const r = markEl.getBoundingClientRect();
      mark[0] = (r.left + r.width / 2) * dpr; mark[1] = (innerHeight - (r.top + r.height / 2)) * dpr; mark[2] = (r.width / 2.1) * dpr;
    };
    size();
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) return;

    // Outside the hero there is no terrain behind the door — in the original the same stage sits behind the door on every page, so the curtain draws the top-down marker terrain directly and shows it under the hole
    const own = page !== "home" ? 1 : 0;
    const mixc = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
    const C = { bg: rgb("--kf-bg"), line: rgb("--kf-raised") };
    C.fogc = mixc(mixc(rgb("--kf-accent-soft"), rgb("--kf-dim"), 0.45), rgb("--kf-accent"), 0.28);
    C.lit = mixc(rgb("--kf-dim"), rgb("--kf-ink"), 0.2);
    // Original stamping is .05 per frame — the original is heavy 3D so frames drop in recordings, and with the same value the copy strip would look thicker and linger longer. Value tuned from recording
    const STAMP = 0.013;
    const st = { tx: 0.5, ty: 0.5, x: 0.5, y: 0.5, ox: 0.5, oy: 0.5, sf: 0, strength: 0 };
    const ease = window.CustomEase ? CustomEase.create("ow-theatre", "M0,0 C0.5,0 0.5,1 1,1") : "sine.inOut";
    gsap.to(st, { strength: 20, duration: 2, delay: rampAt, ease });
    const onMove = (e) => { if (e.pointerType === "touch") return; st.tx = e.clientX / innerWidth; st.ty = 1 - e.clientY / innerHeight; };
    addEventListener("pointermove", onMove, { passive: true });

    let time = 0;
    const step = (dt) => {
      time += dt;
      if (innerWidth > 1280) {
        st.x += (st.tx - st.x) * Math.min(1, dt * 7.5); st.y += (st.ty - st.y) * Math.min(1, dt * 7.5);
        const sp = Math.hypot(st.x - st.ox, st.y - st.oy);
        const s = Math.min(sp / dt / 0.3, 1);
        st.sf += (s - st.sf) * Math.min((s > st.sf ? 12 : 3) * dt, 1);
        const [a, b] = bufs;
        gl.useProgram(sim.pr);
        gl.bindFramebuffer(gl.FRAMEBUFFER, b.f); gl.viewport(0, 0, sw, sh2);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, a.t);
        gl.uniform1i(sim.u.prev, 0);
        gl.uniform2f(sim.u.at, st.ox, st.oy);
        gl.uniform1f(sim.u.aspect, innerWidth / innerHeight);
        gl.uniform1f(sim.u.radius, Math.min(1, 0.05 + Math.max(Math.round(sp * 1e4) / 1e4, 1e-4) * 0.3));
        gl.uniform1f(sim.u.amount, STAMP * st.sf);
        gl.uniform1f(sim.u.keep, Math.pow(0.8, dt * 10));
        gl.uniform1f(sim.u.time, time);
        gl.uniform1f(sim.u.spread, 1.25);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        bufs = [b, a];
        st.ox = st.x; st.oy = st.y;
      }
      gl.useProgram(veil.pr);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, cv.width, cv.height);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, bufs[0].t);
      gl.uniform1i(veil.u.trail, 0);
      gl.uniform2f(veil.u.res, cv.width, cv.height);
      gl.uniform3fv(veil.u.bg, C.bg); gl.uniform3fv(veil.u.line, C.line);
      gl.uniform3fv(veil.u.fogc, C.fogc); gl.uniform3fv(veil.u.lit, C.lit);
      gl.uniform1f(veil.u.own, own); gl.uniform1f(veil.u.time, time);
      gl.uniform3f(veil.u.mk, ...mark);
      gl.uniform1f(veil.u.strength, st.strength);
      gl.uniform1f(veil.u.markA, +getComputedStyle(markEl).opacity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    // Run the two programs once at the spot where the door stands — drawing for the first time on the first cursor move would freeze the screen
    step(1 / 60);
    cv.className = "gate-veil"; cv.setAttribute("aria-hidden", "true");
    gateEl.prepend(cv);
    gateEl.classList.add("has-veil");
    const tick = (t, ms) => {
      if (!gateEl.isConnected) {
        gsap.ticker.remove(tick); removeEventListener("pointermove", onMove); removeEventListener("resize", size);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return;
      }
      step(Math.min(0.1, Math.max(0.001, ms / 1000)));
    };
    gsap.ticker.add(tick);
    addEventListener("resize", size);
  };

  // ── Door (Loader) ──
  let entered = false;
  const enterCbs = [];
  const enter = (withSound) => {
    if (entered) return;
    entered = true;
    try { sessionStorage.setItem("ow-entered", "1"); } catch (e) {}
    if (withSound) header?.querySelector(".sound-toggle")?.click();
    enterCbs.forEach((f) => f(true));
    window.dispatchEvent(new Event("ow:enter"));
    setTimeout(ready, reduce ? 0 : 2500);
  };
  const skip = (() => { try { return sessionStorage.getItem("ow-entered") === "1"; } catch (e) { return false; } })() || /[?&]no-loader/.test(location.search);
  const gateSlot = document.querySelector('[data-slot="gate"]');
  if (skip || !gateSlot) {
    gateSlot?.remove();
    entered = true;
    requestAnimationFrame(() => { enterCbs.forEach((f) => f(false)); window.dispatchEvent(new Event("ow:enter")); ready(); });
  } else {
    gateSlot.className = "gate";
    gateSlot.innerHTML = `${markSvg("gate-mark", true)}
      <div class="gate-logo ts-b"><div class="ow-fade" style="--fade-duration:.8s" data-g="logo"><div class="gate-logo__inner" data-label="Your brand English name here · the small line below is one word for the field"><span class="gate-logo__main">Brand Name</span><span class="gate-logo__sub">Studio</span></div></div></div>
      <div class="gate-cta"><div data-fx="cloud-threshold-reveal" data-fx-cloud-threshold-reveal="on: state; dur: 2.5; delay: .3" data-g="cta">${btn({ text: "Enter with sound on", attrs: 'disabled data-enter="1"' })}</div>
        <div class="gate-progress" role="progressbar" aria-valuenow="0"><div class="ow-fade" data-g="progress"><div class="gate-progress__inner"><div class="gate-progress__track"><div class="gate-progress__fill"></div></div><span class="gate-progress__text">0%</span></div></div></div></div>
      <div class="gate-muted"><div class="ow-fade" style="--fade-duration:.8s;--fade-delay:.5s" data-g="muted"><button class="text-link text-link--small" type="button" disabled data-enter="0"><span>Enter without sound</span><span class="text-link__solid" aria-hidden="true"></span></button></div></div>`;
    const g = (k) => gateSlot.querySelector(`[data-g="${k}"]`);
    const fill = gateSlot.querySelector(".gate-progress__fill"), pct = gateSlot.querySelector(".gate-progress__text"), bar = gateSlot.querySelector(".gate-progress");
    const setP = (p) => { fill.style.transform = `scaleX(${p})`; pct.textContent = `${Math.round(p * 100)}%`; bar.setAttribute("aria-valuenow", String(Math.round(p * 100))); };
    requestAnimationFrame(() => requestAnimationFrame(() => {
      g("logo").classList.add("is-visible"); g("progress").classList.add("is-visible");
      gateSlot.querySelector(".gate-mark").classList.add("is-visible");
    }));
    // Loading imitation — the original is 3D asset progress. After filling at least 1s, rest .5s and then clear the bar
    [[120, 0.18], [420, 0.46], [760, 0.79], [1000, 1]].forEach(([t, p]) => setTimeout(() => setP(p), t));
    setTimeout(() => g("progress").classList.remove("is-visible"), 1500);
    // Once the stage is ready (original canvasReady), the button appears after 1s and becomes pressable 1.3s later
    const stageReady = 1200;
    gateVeil(gateSlot, stageReady / 1000);
    setTimeout(() => { g("cta").classList.add("is-on"); g("muted").classList.add("is-visible"); }, stageReady + 1000);
    setTimeout(() => gateSlot.querySelectorAll("[data-enter]").forEach((b) => b.removeAttribute("disabled")), stageReady + 1300);
    gateSlot.addEventListener("click", (e) => {
      const b = e.target.closest("[data-enter]");
      if (!b || b.disabled || entered) return;
      gateSlot.classList.add("is-leaving");
      setTimeout(() => gateSlot.remove(), 1100);
      enter(b.dataset.enter === "1");
    });
  }

  // ── Reel video curtain ──
  const reel = document.querySelector('[data-slot="reel-modal"]');
  if (reel) {
    const open = (e) => { const b = e.target.closest("[data-reel]"); if (!b) return; e.preventDefault(); reel.classList.add("is-open"); lenis?.stop(); };
    const close = () => { reel.classList.remove("is-open"); lenis?.start(); };
    document.addEventListener("click", open);
    reel.addEventListener("click", (e) => { if (e.target.closest("[data-reel-close]") || e.target === reel) close(); });
    addEventListener("keydown", (e) => e.key === "Escape" && close());
  }

  // ── Fog background (outside the hero) — the original keeps the same 3D stage far away and blurred. Here it is a single shader fog sheet ──
  const stage = document.getElementById("gl-canvas");
  if (stage && page !== "home") {
    const cv = document.createElement("canvas");
    stage.append(cv);
    const gl = cv.getContext("webgl", { alpha: false, antialias: false });
    if (gl) {
      const fx = parseFloat(body.dataset.mistX ?? "0.5"), fy = parseFloat(body.dataset.mistY ?? "0.5");
      const vs = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
      const fs = `precision highp float;varying vec2 v;uniform vec2 res,foc;uniform float time,scroll;uniform vec3 bg,deep,glow;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int k=0;k<6;k++){s+=n(p)*a;p=p*2.02+11.3;a*=.5;}return s;}
void main(){vec2 a=vec2(res.x/res.y,1.);vec2 uv=v*a;
float q=fbm(uv*2.2+vec2(time*.012,-time*.008)+vec2(0.,scroll*.15));
float m=fbm(uv*1.4+q*1.8-vec2(time*.01,0.));
float d=length((v-foc)*a*vec2(.8,1.1));
float lit=smoothstep(1.1,.05,d);
float c=smoothstep(.38,.85,m)*lit;
vec3 col=mix(bg,deep,c*.95)+glow*pow(c,2.6)*.22;
col*=1.-smoothstep(.55,1.25,length((v-.5)*a))*.55;
gl_FragColor=vec4(col,1.);}`;
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
      const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const l = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
      const U = (k) => gl.getUniformLocation(pr, k);
      gl.uniform3fv(U("bg"), rgb("--kf-bg")); gl.uniform3fv(U("deep"), rgb("--kf-accent-soft")); gl.uniform3fv(U("glow"), rgb("--kf-accent"));
      gl.uniform2f(U("foc"), fx, 1 - fy);
      const scale = 0.5;
      const size = () => { cv.width = Math.round(innerWidth * scale); cv.height = Math.round(innerHeight * scale); gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U("res"), cv.width, cv.height); };
      size(); addEventListener("resize", size);
      const t0 = performance.now();
      const draw = () => {
        gl.uniform1f(U("time"), reduce ? 0 : (performance.now() - t0) / 1000);
        gl.uniform1f(U("scroll"), scrollY / Math.max(1, innerHeight));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      if (reduce) draw(); else gsap.ticker.add(draw);
      requestAnimationFrame(() => stage.classList.add("is-on"));
    }
  }

  window.OW = { MARK, markSvg, rgb, css, onEnter: (f) => (entered ? f(false) : enterCbs.push(f)), get lenis() { return lenis; } };
})();
