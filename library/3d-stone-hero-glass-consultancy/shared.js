/* Shared by two pages — glass cell nav (City clock)·mobile menu·page transition curtain·footer and 3D mark·Lenis·split-text reveal. 
   Original figures: Lenis lerp .12 · transition 1.2s (covered .4s after the curtain’s .5s, marker -90°→0 .5s) · word entrance 1em .1 interval power1.inOut (top 80%) ·
   Text entrance opacity .9s with .03 stagger · menu height .28s power1.out · cells .12 stagger .75em */
(() => {
  const PAGES = [
    { href: "index.html", label: "Home" },
    { href: "index.html#work", label: "Work" },
    { href: "about.html", label: "About" },
    { href: "about.html#team", label: "Inquiry" },
  ];
  const here = document.body.dataset.page === "about" ? "about.html" : "index.html";
  const MARK = '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="2" y="2" width="28" height="28" rx="9" stroke="currentColor" stroke-width="2"/><path d="M16 6.5 25.5 16 16 25.5 6.5 16Z" fill="currentColor"/></svg>';

  /* ── Nav: same cells doubled in the glass layer and the text layer ── */
  const navHost = document.querySelector('[data-slot="nav"]');
  if (navHost) {
    const cells = (glass) => PAGES.map((p, i) => glass
      ? `<span class="pn-nav__cell" data-i="${i}"></span>`
      : `<a class="pn-nav__cell" data-i="${i}" href="${p.href}"${p.href === here ? ' aria-current="page"' : ""}>${p.label}</a>`).join("");
    navHost.className = "pn-nav";
    navHost.innerHTML = `
      <div class="pn-nav__layer is-glass" aria-hidden="true"><div class="pn-nav__head"></div><div class="pn-nav__menu">${cells(true)}<div class="pn-nav__social"><span>Link 1</span></div></div></div>
      <nav class="pn-nav__layer is-text" aria-label="Main menu">
        <div class="pn-nav__head">
          <a class="pn-nav__logo" href="index.html" aria-label="Back to start">${MARK}</a>
          <div class="pn-nav__time" data-clock="Europe/City"><span class="pn-nav__clock"><span data-h>00</span>:<span data-m>00</span>:<span data-s>00</span></span><span data-tz>GMT</span></div>
          <button class="pn-nav__burger" type="button" aria-expanded="false" aria-label="Open Menu"><i></i><i></i><i></i></button>
        </div>
        <div class="pn-nav__menu">${cells(false)}<div class="pn-nav__social"><a href="#">Link 1</a><a href="#">Link 2</a><a href="#">Link 3</a><a href="#">Link 4</a></div></div>
      </nav>`;

    const clock = navHost.querySelector("[data-clock]");
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: clock.dataset.clock, timeZoneName: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const tick = () => {
      const m = fmt.format(new Date()).match(/(\d+):(\d+):(\d+)\s*([A-Za-z0-9+]+)/);
      if (!m) return;
      clock.querySelector("[data-h]").textContent = m[1];
      clock.querySelector("[data-m]").textContent = m[2];
      clock.querySelector("[data-s]").textContent = m[3];
      clock.querySelector("[data-tz]").textContent = m[4];
    };
    tick(); setInterval(tick, 1000);

    const burger = navHost.querySelector(".pn-nav__burger");
    const menus = navHost.querySelectorAll(".pn-nav__menu");
    let open = false, tl = null;
    burger.addEventListener("click", () => {
      open = !open;
      navHost.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      tl && tl.kill();
      const items = navHost.querySelectorAll(".pn-nav__cell, .pn-nav__social");
      tl = gsap.timeline();
      if (open) {
        tl.fromTo(menus, { height: 0 }, { height: "auto", duration: 0.28, ease: "power1.out" }, 0)
          .fromTo(items, { y: "0.75em", opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.12, ease: "power1.out" }, 0);
      } else {
        tl.to(items, { y: "0.75em", opacity: 0, duration: 0.5, stagger: { each: 0.12, from: "end" }, ease: "power1.out" }, 0)
          .to(menus, { height: 0, duration: 0.28, ease: "power1.out" }, ">-0.28");
      }
    });
  }

  /* ── Page turn curtain ── */
  const veil = document.createElement("div");
  veil.className = "pn-veil";
  veil.innerHTML = `<div class="pn-veil__bg"></div><div class="pn-veil__logo">${MARK}</div>`;
  document.body.appendChild(veil);
  const veilLogo = veil.querySelector(".pn-veil__logo");
  // On open: starts with the curtain covering, the mark disappears over .3s after .5s, then after .8s the curtain lifts over .8s while the mark rotates -90° (original Move Transition Out)
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(veil, { display: "block", opacity: 1 });
    gsap.timeline({ onComplete: () => gsap.set(veil, { display: "none" }) })
      .to(veilLogo, { opacity: 0, duration: 0.3, ease: "none" }, 0.5)
      .to(veil, { opacity: 0, duration: 0.8, ease: "power1.inOut" }, 0.8)
      .to(veilLogo, { rotation: -90, duration: 0.5, ease: "power1.out" }, 0.8);
  }
  const leave = (url) => {
    document.body.classList.add("is-leaving");
    gsap.set(veil, { display: "block", opacity: 0 });
    gsap.set(veilLogo, { rotation: -90, opacity: 0 });
    gsap.timeline()
      .to(veil, { opacity: 1, duration: 0.4, ease: "power1.inOut" }, 0.5)
      .to(veilLogo, { rotation: 0, duration: 0.5, ease: "power1.in" }, 0.5)
      .to(veilLogo, { opacity: 1, duration: 0.3, ease: "none" }, 0.8);
    setTimeout(() => { location.href = url; }, 1200);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || /^https?:/.test(href)) return;
    const [file, hash] = href.split("#");
    if (hash && (file === "" || file === here)) return;
    e.preventDefault();
    leave(href);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

  /* ── Cursor tag: like the original, it stays at opacity 0 and only follows the cursor with power3 (the original is also invisible — confirmed by measuring).
        To make it visible, give .pn-cursor opacity: 1 and it switches to the [data-cursor] text and follows ── */
  const tag = document.createElement("div");
  tag.className = "pn-cursor";
  tag.setAttribute("aria-hidden", "true");
  tag.innerHTML = "<p>View case details</p>";
  document.body.appendChild(tag);
  if (document.querySelector("[data-cursor]") && matchMedia("(hover: hover)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const X0 = 6, Y0 = 140;
    let lx = X0, ly = Y0;
    gsap.set(tag, { xPercent: X0, yPercent: Y0 });
    const xTo = gsap.quickTo(tag, "x", { ease: "power3" });
    const yTo = gsap.quickTo(tag, "y", { ease: "power3" });
    addEventListener("mousemove", (e) => {
      const xp = e.clientX > innerWidth - (tag.offsetWidth + 16) ? -100 : X0;
      const yp = e.clientY > innerHeight * 0.9 ? -120 : Y0;
      if (xp !== lx || yp !== ly) { lx = xp; ly = yp; gsap.to(tag, { xPercent: xp, yPercent: yp, duration: 0.9, ease: "power3", overwrite: "auto" }); }
      xTo(e.clientX); yTo(e.clientY);
    }, { passive: true });
    document.querySelectorAll("[data-cursor]").forEach((t) => t.addEventListener("mouseenter", () => { tag.firstChild.textContent = t.dataset.cursor; }));
  }

  /* ── Footer ── */
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("pn-foot");
    foot.innerHTML = `
      <div class="pn-foot__in">
        <div class="pn-foot__gl" data-foot-gl></div>
        <div class="pn-foot__mark" data-label="Your brand English wordmark here">Studio</div>
        <div class="pn-foot__grid">
          <div class="pn-foot__col"><div class="pn-dim">Sitemap</div>${PAGES.map((p) => `<a href="${p.href}" data-scramble${p.href === here ? ' aria-current="page"' : ""}>${p.label}</a>`).join("")}</div>
          <div class="pn-foot__col"><div class="pn-dim">Follow</div><a href="#" data-scramble>Link 1</a></div>
          <div></div><div></div>
          <div class="pn-foot__legal"><a href="#">Terms of service</a><a href="#">Privacy policy</a></div>
        </div>
      </div>`;
  }

  /* ── Draw the body once the font arrives (2s at most) ── */
  const show = () => document.documentElement.classList.remove("pn-wait");
  (document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2000))]) : Promise.resolve()).then(show);

  /* ── Lenis + ScrollTrigger ── */
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
    window.pnLenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Text entrance (original Webflow interaction values) ── */
  const split = (el, type) => {
    if (el._pnSplit) return el._pnSplit;
    const s = new SplitText(el, { type: type === "chars" ? "words,chars" : type, mask: type === "chars" ? undefined : type, wordsClass: "pn-word" });
    el._pnSplit = s;
    return s;
  };
  window.pnSplit = split;
  // The original’s first entrance starts after Webflow interactions (IX3) are ready — measured at about .7s after the page appears, so we delay by the same amount
  window.pnIntro = 0.7;
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll('[data-split="word"]').forEach((el) => {
      const s = split(el, "words");
      gsap.from(s.words, { y: "1em", duration: 0.5, stagger: 0.1, ease: "power1.inOut", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
    });
    document.querySelectorAll('[data-split="letter"]').forEach((el) => {
      const s = split(el, "chars");
      gsap.from(s.chars, { opacity: 0, duration: 0.9, stagger: 0.03, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
    });
    document.querySelectorAll('[data-split="lines"]').forEach((el) => {
      const s = split(el, "lines");
      gsap.from(s.lines, { opacity: 0, y: "1em", duration: 0.5, stagger: 0.06, ease: "power1.out", scrollTrigger: { trigger: el, start: "top 60%", once: true } });
    });
  });

  /* ── Name that scrambles then resolves when visible (data-scramble) ── */
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=?";
  const scramble = (el, dur) => {
    const final = el.textContent;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / (dur * 1000));
      const n = Math.floor(p * final.length);
      el.textContent = final.slice(0, n) + [...final.slice(n)].map((c) => (c === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
      if (p < 1) requestAnimationFrame(step); else el.textContent = final;
    };
    requestAnimationFrame(step);
  };
  if (!reduce) {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      scramble(en.target, parseFloat(en.target.dataset.scramble) || 0.5);
    }), { threshold: 0.6 });
    document.querySelectorAll("[data-scramble]").forEach((el) => io.observe(el));
  }

  /* ── Footer 3D mark: a rounded-square ring turns slowly and light spreads (the original 3D studio scene rebuilt with our own shader) ──
     The original cursor response (Unicorn trackMouse) has three layers, so it is drawn in the same order: ① the inner mark tilts toward the cursor (trackMouse .32 → ±.64·(m-.5) rad)
     .22 behind ② an outer glass marker that doesn’t follow the cursor refracts ① (silhouette unchanged, only the inner light moves) ③ the spot at cursor height .93
     Fades gradually below a line tilted -7.2° (twice each horizontally and vertically, strength 6·11). The cursor closes 1/4 of the distance each frame (mouseMomentum .3·.27 both).
     m is measured from the center of our mark using the ratio of the original canvas (right half of the footer, mark at center) — our copy canvas spans the whole footer, so the width is counted as half */
  const glHost = document.querySelector("[data-foot-gl]");
  if (glHost) {
    const cv = document.createElement("canvas");
    glHost.appendChild(cv);
    const gl = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true });
    if (gl) {
      /* Original canvas is the right half of the footer from 480px (mark at the 75% position), below that the full footer (50%) — SX is a ratio of that canvas width */
      const CY = 0.55;
      let CX = 0.75, SX = 0.5;
      const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
      const markFs = `precision highp float;uniform vec2 r;uniform float t;uniform vec3 ink;uniform float soft;
        uniform vec2 c;uniform vec2 tilt;uniform sampler2D inner;uniform float refr;
        mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
        float sdRound(vec3 p,vec3 b,float rr){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-rr;}
        float map(vec3 p){p.xz*=rot(tilt.x);p.yz*=rot(tilt.y);p.xz*=rot(t*.35);p.xy*=rot(.6+sin(t*.2)*.25);
          float outer=sdRound(p,vec3(.62,.62,.16),.22);float inner=sdRound(p,vec3(.36,.36,.5),.12);
          vec3 q=p;q.xy*=rot(.785398);float gem=sdRound(q,vec3(.22,.22,.1),.04);
          return min(max(outer,-inner),gem);}
        vec3 nor(vec3 p){vec2 e=vec2(.002,0.);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
        void main(){vec2 uv=(gl_FragCoord.xy-r*c)/r.y*2.2;
          vec3 ro=vec3(0.,0.,3.2),rd=normalize(vec3(uv,-2.4));float d=0.,hit=0.,glow=0.;
          for(int i=0;i<80;i++){vec3 p=ro+rd*d;float h=map(p);glow+=exp(-h*6.)*.018;if(h<.001){hit=1.;break;}d+=h;if(d>8.)break;}
          float a=0.;vec3 col=vec3(0.);vec3 n=vec3(0.,0.,1.);
          if(hit>.5){vec3 p=ro+rd*d;n=nor(p);float fr=pow(1.-max(dot(n,-rd),0.),2.);float l=max(dot(n,normalize(vec3(.4,.8,.6))),0.);
            float rim=fr*1.2+l*.55+.08;col=ink*rim;a=clamp(rim,0.,1.);}
          col+=ink*glow*soft;a=max(a,clamp(glow*soft,0.,1.));
          vec4 o=vec4(col*a,a);
          if(hit>.5&&refr>0.){vec3 rr=refract(rd,n,.889);vec4 s=texture2D(inner,(gl_FragCoord.xy-rr.xy*refr*r.y)/r);
            o=vec4(min(o.rgb+s.rgb*.85,vec3(1.)),max(o.a,s.a*.85));}
          gl_FragColor=o;}`;
      const blurFs = `precision highp float;uniform sampler2D src;uniform vec2 r;uniform vec2 S;uniform vec2 pos;uniform vec2 dir;uniform float amt;
        float ease(float t){return t<.5?2.*t*t:-1.+(4.-2.*t)*t;}
        void main(){vec2 f=gl_FragCoord.xy;float h=dot((pos-f)/S,vec2(-.1253,.9921));
          if(h<=0.){gl_FragColor=texture2D(src,f/r);return;}
          float stp=.42*amt*ease(h)*.001*S.x*1.5;vec4 acc=vec4(0.);float ws=0.;
          for(int i=-12;i<=12;i++){float k=float(i);float w=exp(-k*k/34.1);acc+=texture2D(src,(f+dir*k*stp)/r)*w;ws+=w;}
          gl_FragColor=acc/ws;}`;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const prog = (fs) => {
        const pr = gl.createProgram();
        gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
        const u = {}, n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(pr, i).name; u[name] = gl.getUniformLocation(pr, name); }
        return { pr, u, loc: gl.getAttribLocation(pr, "p") };
      };
      const mark = prog(markFs), blur = prog(blurFs);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const use = (P) => { gl.useProgram(P.pr); gl.enableVertexAttribArray(P.loc); gl.vertexAttribPointer(P.loc, 2, gl.FLOAT, false, 0, 0); };
      const readInk = () => {
        const c = getComputedStyle(document.documentElement).getPropertyValue("--kf-contrast-ink").trim();
        const probe = document.createElement("span"); probe.style.color = c; document.body.appendChild(probe);
        const m = getComputedStyle(probe).color.match(/[\d.]+/g) || [230, 230, 230]; probe.remove();
        return m.slice(0, 3).map((v) => v / 255);
      };
      const ink = readInk();
      const soft = parseFloat(glHost.dataset.soft || (document.body.dataset.page === "about" ? "0.6" : "2.4"));
      const targets = [0, 1].map(() => ({ tex: gl.createTexture(), fb: gl.createFramebuffer() }));
      const fit = () => {
        const dpr = Math.min(devicePixelRatio || 1, 1.5);
        cv.width = Math.max(1, glHost.clientWidth * dpr); cv.height = Math.max(1, glHost.clientHeight * dpr);
        [CX, SX] = glHost.clientWidth >= 480 ? [0.75, 0.5] : [0.5, 1];
        for (const T of targets) {
          gl.bindTexture(gl.TEXTURE_2D, T.tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cv.width, cv.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
          for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
          gl.bindFramebuffer(gl.FRAMEBUFFER, T.fb);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, T.tex, 0);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      };
      new ResizeObserver(fit).observe(glHost); fit();
      let vis = false;
      new IntersectionObserver(([en]) => { vis = en.isIntersecting; }).observe(glHost);
      /* The original only receives cursor moves while in view (isInView), remembers them as a page position, and leaves them as is when you only scroll. Phone also accepts drag (touchmove) */
      const page = { x: 0, y: 0, has: false }, m = { x: 0.5, y: 0.5 };
      const track = (e) => {
        if (!vis) return;
        const p = e.touches ? e.touches[0] : e;
        if (!p) return;
        page.x = p.clientX + scrollX; page.y = p.clientY + scrollY; page.has = true;
      };
      if (!reduce) { addEventListener("mousemove", track, { passive: true }); addEventListener("touchmove", track, { passive: true }); }
      const pass = (P, to, set) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, to ? to.fb : null);
        gl.viewport(0, 0, cv.width, cv.height);
        use(P); gl.uniform2f(P.u.r, cv.width, cv.height); set(P.u);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      const [A, B] = targets;
      const draw = (t) => {
        if (page.has) {
          const b = glHost.getBoundingClientRect();
          const tx = 0.5 + (page.x - (b.left + scrollX + b.width * CX)) / (b.width * SX);
          const ty = 0.5 + (b.top + scrollY + b.height * (1 - CY) - page.y) / b.height;
          m.x += (tx - m.x) * 0.25; m.y += (ty - m.y) * 0.25;
        }
        const W = cv.width, H = cv.height, S = [W * SX, H];
        const markU = (u, c, tilt, sf, refr) => {
          gl.uniform1f(u.t, t); gl.uniform3f(u.ink, ink[0], ink[1], ink[2]); gl.uniform1f(u.soft, sf);
          gl.uniform2f(u.c, c[0], c[1]); gl.uniform2f(u.tilt, tilt[0], tilt[1]); gl.uniform1f(u.refr, refr);
          gl.uniform1i(u.inner, 0);
        };
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, null);
        pass(mark, A, (u) => markU(u, [CX + 0.22 * (m.x - 0.5) * SX, CY + 0.22 * (m.y - 0.5)], [0.64 * (m.x - 0.5), 0.64 * (m.y - 0.5)], 0, 0));
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.tex);
        pass(mark, B, (u) => markU(u, [CX, CY], [0, 0], soft, 0.25));
        const pos = [W * CX + 0.93 * (m.x - 0.5) * S[0], H * CY + 0.93 * (m.y - 0.5) * S[1]];
        [[B, A, [1, 0], 6], [A, B, [0, 1], 6], [B, A, [1, 0], 11], [A, null, [0, 1], 11]].forEach(([src, to, dir, amt]) => {
          gl.bindTexture(gl.TEXTURE_2D, src.tex);
          pass(blur, to, (u) => { gl.uniform1i(u.src, 0); gl.uniform2f(u.S, S[0], S[1]); gl.uniform2f(u.pos, pos[0], pos[1]); gl.uniform2f(u.dir, dir[0], dir[1]); gl.uniform1f(u.amt, amt); });
        });
      };
      if (reduce) draw(1.2);
      else gsap.ticker.add((time) => { if (vis) draw(time); });
    }
  }
})();
