// Shared by all pages — puts the header (logo card · MENU circle) · menu board · footer into [data-shared] slots, and holds shared graphics (balloon · satellite · bird · logo) as symbols.
// Lenis 1.1.22 (lerp .13), is-view-show attached on entering the view (within 80px from the bottom) · is-anim-play, Lottie plays only when visible, wave shader.
// The page script receives it as window.mk.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.defaults({ invalidateOnRefresh: true });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSP = () => innerWidth <= 767;
  const ARROW = '<svg class="mk-btn__arrow" viewBox="0 0 12 12"><path d="M3 1l5 5-5 5"/></svg>';
  const EXT = '<svg viewBox="0 0 14 14"><path d="M5 2H2v10h10V9M8 2h4v4M12 2L6 8"/></svg>';
  const LOGO = '<span class="mk-ci__logo"><svg viewBox="0 0 34 34" aria-hidden="true"><path class="mk-diamond__o" d="M17 0l17 17-17 17L0 17z"/><path class="mk-diamond__i" d="M17 9l8 8-8 8-8-8z"/></svg>Company name</span>';

  document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
    <symbol id="mk-balloon" viewBox="0 0 80 110"><path class="mk-balloon__a" d="M40 4C18 4 4 20 4 40c0 22 22 38 36 48 14-10 36-26 36-48C76 20 62 4 40 4z"/><path class="mk-balloon__b" d="M40 4c-8 0-16 16-16 36 0 22 8 38 16 48 8-10 16-26 16-48 0-20-8-36-16-36z"/><path class="mk-balloon__line" d="M28 84l4 12M52 84l-4 12"/><rect class="mk-balloon__basket" x="30" y="96" width="20" height="12" rx="2"/></symbol>
    <symbol id="mk-sat" viewBox="0 0 120 90"><rect class="mk-sat__panel" x="2" y="30" width="38" height="24" transform="rotate(-20 21 42)"/><rect class="mk-sat__panel" x="80" y="36" width="38" height="24" transform="rotate(-20 99 48)"/><rect class="mk-sat__body" x="42" y="30" width="36" height="30" rx="4"/><path class="mk-sat__wave" d="M84 14c6 4 8 10 6 16M92 6c10 6 14 18 10 28"/></symbol>
    <symbol id="mk-bird" viewBox="0 0 80 60"><path class="mk-bird__body" d="M10 34c0-14 12-24 26-24 10 0 18 6 22 14l14 4-14 4c-2 12-12 20-24 20-14 0-24-8-24-18z"/><path class="mk-bird__wing" d="M22 30c8-2 18 2 22 10-10 4-20 2-26-4z"/><path class="mk-bird__beak" d="M58 24l14 4-14 4z"/><circle class="mk-bird__eye" cx="50" cy="22" r="2.4"/><path class="mk-balloon__line" d="M30 52l-4 8M38 52l2 8"/></symbol>
  </svg>`);

  // ---------- Header · menu panel · footer ----------
  const page = document.body.dataset.page;
  const headerSlot = document.querySelector('[data-shared="header"]');
  if (headerSlot) headerSlot.outerHTML = `
  <header class="mk-header" data-slot="header">
    <div class="mk-ci"><a href="index.html">${LOGO}<span class="mk-ci__tag">PURPOSE<br>SPECIAL SITE</span><span class="mk-ci__bg"></span></a></div>
    <div class="mk-menu-bg" aria-hidden="true"><i class="-green"></i><i class="-yellow"></i></div>
    <button class="mk-menu-btn" type="button" aria-label="Open Menu"><span class="mk-menu-btn__in"><span class="bar"></span><span class="bar"></span><span class="bar"></span><span class="mk-menu-btn__txt"><i>M</i><i>E</i><i>N</i><i>U</i></span></span></button>
    <button class="mk-close-btn" type="button" aria-label="Close Menu"><span class="mk-menu-btn__in"><span class="bar"></span><span class="bar"></span><span class="mk-close-btn__txt"><i>C</i><i>L</i><i>O</i><i>S</i><i>E</i></span></span></button>
  </header>
  <div class="mk-gnav-bg" aria-hidden="true" data-slot="menu-drawer">
    <svg class="mk-gnav-bg__area" viewBox="0 0 100 100" preserveAspectRatio="xMaxYMin slice"><rect class="mk-gnav-bg__rect" width="100" height="100"/><circle class="mk-gnav-bg__dot" cx="96" cy="4" r="0"/><circle class="mk-gnav-bg__ring" cx="96" cy="4" r="55"/><circle class="mk-gnav-bg__line" cx="96" cy="4" r="54"/></svg>
    <div class="mk-illust mk-gnav-bg__balloon"><svg viewBox="0 0 80 110" class="mk-balloon"><use href="#mk-balloon"/></svg></div>
    <div class="mk-illust mk-gnav-bg__blob -b1"><svg viewBox="0 0 90 90" class="mk-blob -a"><path d="M70 18c18 10 22 40 10 52-22 22-42 18-58 8S0 48 16 30C34 12 52 8 70 18Z"/></svg></div>
    <div class="mk-illust mk-gnav-bg__blob -b2"><svg viewBox="0 0 90 90" class="mk-blob -b"><path d="M70 18c18 10 22 40 10 52-22 22-42 18-58 8S0 48 16 30C34 12 52 8 70 18Z"/></svg></div>
    <div class="mk-illust mk-gnav-bg__blob -b3"><svg viewBox="0 0 90 90" class="mk-blob -c"><path d="M70 18c18 10 22 40 10 52-22 22-42 18-58 8S0 48 16 30C34 12 52 8 70 18Z"/></svg></div>
    <div class="mk-illust mk-gnav-bg__blob -b4"><svg viewBox="0 0 90 90" class="mk-blob -d"><path d="M70 18c18 10 22 40 10 52-22 22-42 18-58 8S0 48 16 30C34 12 52 8 70 18Z"/></svg></div>
  </div>
  <nav class="mk-gnav" aria-label="Menu">
    <ul class="mk-gnav__list">
      <li class="mk-gnav__btn"><a href="index.html"><span class="mk-gnav__en">TOP</span></a></li>
      <li class="mk-gnav__btn"><a href="purpose.html"><span class="mk-gnav__en">PURPOSE</span><span class="mk-gnav__jp">Our Pledge</span></a></li>
      <li class="mk-gnav__btn"><a href="index.html#sustainability"><span class="mk-gnav__en">FOR SUSTAINABILITY</span><span class="mk-gnav__jp">Work based on our pledge</span></a></li>
      <li class="mk-gnav__btn"><a href="index.html#embedding"><span class="mk-gnav__en">EMBEDDING THE PURPOSE</span><span class="mk-gnav__jp">Blending in with staff</span></a></li>
      <li class="mk-gnav__btn"><a href="index.html#my-purpose"><span class="mk-gnav__en">MY PURPOSE</span><span class="mk-gnav__jp">My Resolution</span></a></li>
      <li class="mk-gnav__btn"><a href="report.html"><span class="mk-gnav__en">ACTIVITY REPORTS</span><span class="mk-gnav__jp">Pledge activity report</span></a></li>
    </ul>
    <ul class="mk-gnav__opt"><li><a href="#">Company Website</a></li><li><a href="recruit.html">New hire recruiting site</a></li><li><a href="#">Experienced hiring info</a></li></ul>
  </nav>`;
  const footerSlot = document.querySelector('[data-shared="footer"]');
  if (footerSlot) footerSlot.outerHTML = `
  <footer class="mk-footer" data-slot="footer">
    <button class="mk-footer__top" type="button"><span>BACK TO TOP ↑</span></button>
    <div class="mk-footer__in">
      <a class="mk-footer__ci" href="index.html">${LOGO}<span class="mk-ci__tag">PURPOSE<br>SPECIAL SITE</span></a>
      <ul class="mk-footer__links"><li><a href="#">Company website${EXT}</a></li><li><a href="recruit.html">New hire recruiting site${EXT}</a></li><li><a href="#">Experienced hire info${EXT}</a></li></ul>
      <p class="mk-footer__copy">Copyright © Company Name Co., Ltd. All Rights Reserved.</p>
    </div>
  </footer>`;

  // ---------- Careers site header · footer — another site of the same company, so a white header bar with dropdown menu and a green apply button ----------
  const RC_NAV = [["Our DNA", ["Message · Business About", "Resolution", "History and DNA", "Company in Numbers"]], ["People at work", ["Job group 1", "Job group 2", "Job group 3", "Job group 4", "Job group 5", "Voices of young staff"]], ["Challenge tomorrow", ["Sustainable", "Create a new business", "Digital transformation"]], ["Work environment", ["Grow your career", "Welfare", "Domestic bases", "Overseas base", "Interview"]], ["New Grad Hiring", ["By job group", "By location"]], ["Experienced hiring", []]];
  const rcHead = document.querySelector('[data-shared="rc-header"]');
  if (rcHead) rcHead.outerHTML = `<header class="rc-header" data-slot="recruit-header"><a class="rc-header__logo" href="recruit.html">${LOGO}</a>
    <nav class="rc-gnav"><ul>${RC_NAV.map(([t, sub]) => `<li class="rc-gnav__item"><a href="recruit-dna.html">${t}</a>${sub.length ? `<ul class="rc-gnav__sub">${sub.map((s) => `<li><a href="recruit-dna.html">${s}</a></li>`).join("")}</ul>` : ""}</li>`).join("")}</ul></nav>
    <a class="rc-entry" href="#"><small>New Grad Hiring</small>ENTRY/MY PAGE</a>
    <button class="rc-burger" type="button" aria-label="Menu"><i></i><i></i><i></i><span>MENU</span></button></header>`;
  const rcFoot = document.querySelector('[data-shared="rc-footer"]');
  if (rcFoot) rcFoot.outerHTML = `<div class="rc-city mk-cityfoot-wrap" data-shared-city></div><footer class="rc-footer" data-slot="recruit-footer"><div class="rc-footer__in"><a class="rc-footer__logo" href="recruit.html">${LOGO}</a>
    <div class="rc-footer__map">${RC_NAV.map(([t, sub]) => `<dl><dt><a href="recruit-dna.html">${t}</a></dt>${sub.map((s) => `<dd><a href="recruit-dna.html">${s}</a></dd>`).join("")}</dl>`).join("")}</div>
    <button class="rc-footer__top" type="button" aria-label="Back to top"></button></div>
    <p class="rc-footer__copy">Copyright © Company Name Co., Ltd. All Rights Reserved.</p></footer>`;
  document.querySelectorAll("[data-shared-city]").forEach((el) => { el.removeAttribute("data-shared-city"); el.setAttribute("data-shared", "city"); });
  document.querySelector(".rc-footer__top")?.addEventListener("click", () => lenisReady(() => window.mk.lenis.scrollTo(0, { duration: 1.2 })));
  function lenisReady(fn) { if (window.mk) fn(); else setTimeout(() => lenisReady(fn), 50); }

  // ---------- City ground illustration ----------
  const citySlot = document.querySelector('[data-shared="city"]');
  if (citySlot) citySlot.outerHTML = `<div class="mk-cityfoot" aria-hidden="true" data-slot="city-footer"><svg viewBox="0 0 1300 260">
    <g class="mk-city__tree"><circle cx="150" cy="200" r="44"/><circle cx="210" cy="190" r="36"/><circle cx="1140" cy="196" r="40"/></g><g class="mk-city__trunk"><rect x="146" y="220" width="8" height="40"/><rect x="206" y="214" width="8" height="46"/><rect x="1136" y="220" width="8" height="40"/></g>
    <rect class="mk-city__b1" x="330" y="120" width="120" height="140"/><rect class="mk-city__b2" x="420" y="60" width="90" height="200"/><rect class="mk-city__b3" x="560" y="90" width="110" height="170"/><rect class="mk-city__b4" x="700" y="20" width="120" height="240"/><rect class="mk-city__b5" x="860" y="80" width="130" height="180"/><rect class="mk-city__b2" x="960" y="130" width="90" height="130"/>
    <g class="mk-city__win"><rect x="346" y="140" width="20" height="14"/><rect x="380" y="170" width="20" height="14"/><rect x="434" y="80" width="62" height="8"/><rect x="434" y="110" width="62" height="8"/><rect x="580" y="110" width="24" height="16"/><rect x="720" y="40" width="80" height="10"/><rect x="720" y="70" width="80" height="10"/><rect x="880" y="100" width="24" height="16"/><rect x="930" y="140" width="24" height="16"/></g>
    <g class="mk-city__cat"><ellipse cx="1000" cy="254" rx="26" ry="10"/><circle cx="1026" cy="242" r="10"/></g></svg></div>`;

  // ---------- Subpage header — split the English title into letters, each rising .04s later ----------
  document.querySelectorAll(".mk-head .mk-hd__en").forEach((en) => {
    const text = en.textContent;
    en.setAttribute("aria-label", text);
    en.innerHTML = text.split(" ").map((w) => `<span aria-hidden="true" style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="l">${c}</span>`).join("")}</span>`).join(" ");
    en.querySelectorAll(".l").forEach((l, i) => { l.style.transitionDelay = `${0.04 * i}s`; });
  });
  setTimeout(() => document.querySelectorAll(".mk-head").forEach((h) => h.classList.add("is-show")), reduce ? 0 : 100);

  // ---------- Smooth scroll ----------
  const lenis = new Lenis({ lerp: 0.13 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // ---------- Page transition — the original has no transition and goes straight, the new page floats up in .4 seconds ----------
  const main = document.querySelector(".mk-main");
  // The recruit site fades up in .6s (original recruit)
  gsap.to(main, { opacity: 1, duration: reduce ? 0 : document.body.dataset.site === "recruit" ? 0.6 : 0.4, ease: "none" });

  // ---------- Menu board ----------
  const root = document.documentElement;
  const openMenu = () => { root.classList.add("is-menu-open"); lenis.stop(); };
  const closeMenu = () => { root.classList.remove("is-menu-open"); lenis.start(); };
  document.querySelector(".mk-menu-btn")?.addEventListener("click", openMenu);
  document.querySelector(".mk-close-btn")?.addEventListener("click", closeMenu);
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  document.querySelectorAll(".mk-gnav a").forEach((a) => a.addEventListener("click", (e) => {
    const [file, hash] = a.getAttribute("href").split("#");
    const here = location.pathname.split("/").pop() || "index.html";
    if (file === here && hash) { e.preventDefault(); closeMenu(); const t = document.getElementById(hash); if (t) lenis.scrollTo(t, { offset: -40 }); }
  }));
  document.querySelector(".mk-footer__top")?.addEventListener("click", () => lenis.scrollTo(0, { duration: 1.2 }));

  // ---------- On entering view — original js-view-elm (80px inside from below, removed on return) ----------
  document.querySelectorAll(".js-view").forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: "top+=-80 bottom", end: "bottom+=-80 top", onEnter: () => el.classList.add("is-view-show"), onLeaveBack: () => el.classList.remove("is-view-show") });
  });

  // ---------- Lottie — original createLottieElm: loops, does not play on its own, plays when visible and stops when out of view ----------
  const lottieAt = (el, { delay = 0 } = {}) => {
    if (!window.lottie || !window.mkLottie?.[el.dataset.lottie]) return null;
    const anim = lottie.loadAnimation({ container: el, animationData: window.mkLottie[el.dataset.lottie], renderer: "svg", loop: true, autoplay: false });
    anim.setSpeed(+(el.dataset.spd || 1));
    ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => { if (reduce) return; s.isActive ? gsap.delayedCall(delay, () => anim.play()) : anim.pause(); } });
    return anim;
  };

  // ---------- Wave — a slanted floor line plus four sines make the boundary, green below it and a yellow band along the edge. Drawn once every 2~3 frames ----------
  const wave = (canvas) => {
    const gl = canvas.getContext("webgl");
    if (!gl) return null;
    const css = (v) => { const p = document.createElement("i"); p.style.color = `var(${v})`; document.body.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return c; };
    const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    px.canvas.width = px.canvas.height = 1;
    const rgb = (v) => { px.clearRect(0, 0, 1, 1); px.fillStyle = css(v); px.fillRect(0, 0, 1, 1); return [...px.getImageData(0, 0, 1, 1).data].slice(0, 3).map((n) => n / 255); };
    const vs = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
    const fs = `precision mediump float;
      uniform float uTime; uniform vec2 uRes; uniform vec3 uGreen; uniform vec3 uBand; uniform vec3 uBg;
      void main(){
        vec2 uv = gl_FragCoord.xy / uRes;
        float x = uv.x * 4.6, t = -uTime * 1.65;
        float edge = ((uv.y - 0.8) * 2.6 + (uv.x - 0.1) * 1.8) * 45.0 + sin(t);
        edge += sin(x * 1.47 + t) * 4.5 + sin(x * 1.204 + t * 1.121) * 4.0 + sin(x * 1.5547 + t * 3.437) * 4.0 + sin(x * 2.17854 + t * 4.269) * 5.0;
        float band = edge + sin(x * 0.56 + t * 3.5) * 2.2 + sin(x * 0.49 + t * 5.25) * 1.5;
        vec3 col = abs(band - uv.y) < 3.333 ? uBand : uGreen;
        gl_FragColor = vec4(edge < 0.0 ? col : uBg, 1.0);
      }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prg = gl.createProgram();
    gl.attachShader(prg, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prg, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prg);
    gl.useProgram(prg);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prg, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(prg, n);
    gl.uniform3fv(u("uGreen"), rgb("--kf-accent"));
    gl.uniform3fv(u("uBand"), rgb("--kf-accent-soft"));
    gl.uniform3fv(u("uBg"), rgb("--kf-bg"));
    const size = () => { canvas.width = innerWidth; canvas.height = canvas.offsetHeight; gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform2f(u("uRes"), canvas.width, canvas.height); };
    size();
    addEventListener("resize", size);
    const start = performance.now();
    let skip = 0, limit = 2, on = false;
    const draw = () => { gl.uniform1f(u("uTime"), (performance.now() - start) * 1e-4); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
    draw();
    gsap.ticker.add(() => { if (!on || reduce) return; if (skip++ < limit) return; skip = 0; draw(); });
    ScrollTrigger.create({ trigger: canvas, start: "top-=50px bottom", end: "bottom-=100px top", onToggle: (s) => { on = s.isActive; }, onUpdate: (s) => { limit = s.progress >= 0.9 ? 3 : 2; } });
    return { draw };
  };
  document.querySelectorAll("canvas[data-wave]").forEach(wave);

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.mk = { lenis, reduce, isSP, lottieAt, openMenu, closeMenu };
})();
