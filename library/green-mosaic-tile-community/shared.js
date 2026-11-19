/* Brand site — things spanning several pages: loader → header row, clock and scroll progress strip, menu panel, Barba ‹stacked cards› transition, Lenis,
   Mosaic field (one WebGL pass rendered and shifted into each cell, starlight at the cursor), butterfly (three), pill band pause, text decode hover.
   Each page’s motion is CB.page("<namespace>", { mount(root), unmount() }) is registered, and attached and detached here when sliding. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hover = matchMedia("(hover: hover)").matches;
  const desk = () => innerWidth >= 900;
  const root = document.documentElement;
  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const E = {
    io: CustomEase.create("cb-io", "0.76,0,0.24,1"),
    reveal: CustomEase.create("cb-rv", "0.86,0,0.07,1"),
    tr: CustomEase.create("cb-tr", "0.625,0.05,0,1"),
    out: CustomEase.create("cb-out", "0.16,1,0.3,1"),
    eye: CustomEase.create("cb-eye", "0.3,0.7,0.3,1"),
    soft: CustomEase.create("cb-soft", "0.65,0,0.35,1"),
  };
  const CB = (window.CB = { reduce, hover, E, pages: {}, lenis: null, current: null });
  CB.page = (ns, mod) => { CB.pages[ns] = mod; if (CB.ready && CB.ns === ns && !CB.current) mountPage(document.querySelector('[data-barba="container"]')); };

  /* ---------- Read color from the Skin (for canvas) ---------- */
  const probe = document.createElement("i");
  probe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  document.body.appendChild(probe);
  CB.rgb = (v) => {
    probe.style.color = "";
    probe.style.color = v.startsWith("--") ? `var(${v})` : v;
    const m = getComputedStyle(probe).color.match(/[\d.]+/g) || [0, 0, 0];
    if (/oklab|oklch/.test(getComputedStyle(probe).color)) {
      const c = document.createElement("canvas").getContext("2d");
      c.fillStyle = getComputedStyle(probe).color; c.fillRect(0, 0, 1, 1);
      const d = c.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
    }
    return [m[0] / 255, m[1] / 255, m[2] / 255];
  };

  /* ---------- Lenis ---------- */
  if (!reduce) {
    CB.lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    CB.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => CB.lenis && CB.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Loader → Header row ---------- */
  const LOGO = '<svg viewBox="0 0 46.4 32" aria-hidden="true"><path fill="currentColor" d="M10.76 32H0V21.33h10.76V32Zm35.64 0H35.64V21.33H46.4V32ZM21.52 10.67v4c0 3.68-3.01 6.66-6.73 6.66h-4.03V10.67H0V0h10.76l10.76 10.67Zm24.88 0H35.64v10.66h-4.03c-3.72 0-6.73-2.98-6.73-6.66v-4L35.64 0H46.4v10.67Z"/></svg>';
  // Four dots: normally 2×2, they spread to the four corners on hover, and gather to the center into an X when the menu opens (.4s bounce)
  const DOTS = [[4, 4], [16, 4], [4, 16], [16, 16]];
  const dotsSvg = () => '<span class="cl__dots" aria-hidden="true">' + DOTS.map(([x, y]) => { const sx = x < 10 ? -1 : 1, sy = y < 10 ? -1 : 1; return `<i style="left:${(x / 20) * 100}%;top:${(y / 20) * 100}%;--hx:${sx * 2.5}px;--hy:${sy * 2.5}px;"></i>`; }).join("") + '<i class="cl__dot-mid" style="left:50%;top:50%"></i></span>';
  const words = (s) => s.split(" ").map((w) => `<span class="cl__w"><span class="cl__wt">${w}</span><i class="cl__wb"></i></span>`).join(" ");
  const NAV = [
    { num: "01", during: "Company", after: "Gallery", href: "lookbook.html" },
    { num: "02", during: "Chill & Fun", after: "About", href: "about.html" },
  ];
  const cl = document.createElement("div");
  cl.className = "cl";
  cl.setAttribute("data-slot", "header");
  cl.innerHTML = `
    <div class="cl__backdrop"><canvas class="cl__dither"></canvas></div>
    <div class="cl__bar">
      <div class="cl__cell cl__cell--brand"><div class="cl__row">
        <a class="cl__brand" href="index.html" aria-label="Go home"><span class="cl__logo">${LOGO}</span><span class="cl__t" data-label="Event name in English, two lines"><span>${words("Event")}</span><span>${words("Bootcamp")}</span></span></a>
        <div class="cl__flip cl__flip--right"><div class="cl__flip-in">
          <div class="cl__flip-face cl__t"><span>${words("Loading")}</span><span class="cl__pct">0%</span></div>
          <div class="cl__flip-face cl__t" data-label="City name · Local time"><span>City</span><span class="cl__clock">00:00 GMT+9</span></div>
        </div></div>
      </div></div>
      <div class="cl__cell cl__cell--track"><div class="cl__fill"></div><span class="cl__eye" aria-hidden="true"><span class="cl__lid"><svg viewBox="0 0 70 42"><defs><clipPath id="cb-eye-clip"><path d="M5.3 21.1 Q34.2 -9.5 63.1 21.1 Q34.2 51.7 5.3 21.1Z"/></clipPath></defs><path class="eye__white" d="M5.3 21.1 Q34.2 -9.5 63.1 21.1 Q34.2 51.7 5.3 21.1Z"/><g class="eye__ball" clip-path="url(#cb-eye-clip)"><circle cx="34.2" cy="21.1" r="12.4"/></g></svg></span></span></div>
      ${NAV.map((n, i) => `<div class="cl__cell cl__cell--nav cl__cell--nav${i + 1}" data-href="${n.href}"><a class="cl__navlink" href="${n.href}">
        <span class="cl__num">${n.num}</span>
        <span class="cl__flip"><span class="cl__flip-in"><span class="cl__flip-face cl__t">${words(n.during)}</span><span class="cl__flip-face cl__t">${n.after}</span></span></span>
      </a></div>`).join("")}
      <button class="cl__menu" type="button" aria-label="Open Menu" aria-expanded="false">${dotsSvg()}</button>
    </div>`;
  document.body.prepend(cl);
  root.classList.add("cb-ready");
  const $ = (s, r = cl) => r.querySelector(s);
  cl.querySelectorAll(".cl__cell--nav").forEach((c) => c.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    c.querySelector("a").click();
  }));

  // Clock — local time of a placeholder city (the original uses the event city)
  const clock = $(".cl__clock");
  const tick = () => {
    const t = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/City" }).format(new Date());
    clock.textContent = `${t} GMT+9`;
  };
  tick(); setInterval(tick, 15000);

  // Dither background — a fine pattern that shaves the background color into 8 levels with Bayer 16×16
  function dither(cv) {
    const w = (cv.width = Math.ceil(innerWidth / 2)), h = (cv.height = Math.ceil(innerHeight / 2));
    const g = cv.getContext("2d"), img = g.createImageData(w, h);
    const [r, gg, b] = CB.rgb("--site-panel");
    const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const th = B[(y & 3) * 4 + (x & 3)] / 16 - 0.5;
      const q = (v) => Math.round(Math.min(1, Math.max(0, v + th / 8)) * 8) / 8;
      const i = (y * w + x) * 4;
      img.data[i] = q(r + 0.012) * 255; img.data[i + 1] = q(gg + 0.012) * 255; img.data[i + 2] = q(b + 0.012) * 255; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }

  // Original timeline (ms): enter 120+560, fill 3200 (hesitating curve), rest 340 at 100%, then over 900 it sticks to the top while the color changes
  const T = { enterDelay: 0.12, enter: 0.56, load: 3.2, hold: 0.34, dock: 0.9, reveal: 0.82, swap: 0.18, revealAt: 0.35, menuAt: 0.45, wipe: 0.7 };
  const CURVE = [[0, 0], [0.14, 0.15], [0.3, 0.16], [0.46, 0.5], [0.6, 0.53], [0.8, 0.88], [0.92, 0.93], [1, 1]];
  const curve = (t) => { for (let i = 1; i < CURVE.length; i++) if (t <= CURVE[i][0]) { const [ta, pa] = CURVE[i - 1], [tb, pb] = CURVE[i]; const u = (t - ta) / (tb - ta); return pa + (pb - pa) * (u * u * (3 - 2 * u)); } return 1; };

  function finishHeader() {
    cl.classList.add("is-done");
    root.classList.remove("cb-loading");
    CB.lenis?.start();
    document.dispatchEvent(new CustomEvent("cb:loaded"));
    CB.loaded = true;
    ScrollTrigger.refresh();
  }
  function setDone() {
    gsap.set($(".cl__bar"), { y: 0, clipPath: "inset(0 0% 0 0%)" });
    gsap.set($(".cl__cell--brand"), { backgroundColor: css("--kf-bg"), color: css("--kf-ink"), borderColor: "transparent" });
    gsap.set($(".cl__cell--track"), { backgroundColor: css("--kf-contrast-bg") });
    gsap.set($(".cl__cell--nav1"), { backgroundColor: css("--site-track"), borderColor: "transparent" });
    gsap.set($(".cl__cell--nav2"), { backgroundColor: css("--kf-accent-text"), borderColor: "transparent" });
    gsap.set($(".cl__fill"), { xPercent: 101 });
    gsap.set(cl.querySelectorAll(".cl__flip-in"), { yPercent: -50, y: (i, el) => -2 * parseFloat(getComputedStyle(el).gap) / 2 });
    gsap.set($(".cl__menu"), { clipPath: "inset(0 0 0 0%)" });
    gsap.set(cl.querySelectorAll(".cl__wt"), { opacity: 1 });
    gsap.set($(".cl__backdrop"), { clipPath: "inset(100% 0 0 0)" });
  }
  function runLoader() {
    root.classList.add("cb-loading");
    CB.lenis?.stop();
    dither($(".cl__dither"));
    gsap.set(cl.querySelectorAll(".cl__wt"), { opacity: 0 });
    if (reduce) { setDone(); finishHeader(); return; }
    const tl = gsap.timeline({ onComplete: finishHeader });
    const enterEnd = T.enterDelay + T.enter, loadStart = T.enterDelay + T.enter * 0.5;
    const dockStart = loadStart + T.load + T.hold;
    tl.to($(".cl__bar"), { clipPath: "inset(0 0% 0 0%)", duration: T.enter, ease: E.io }, T.enterDelay);
    // Per word, a lime block covers from the left (320), holds briefly (90), then exits to the right (380) — 55ms apart
    cl.querySelectorAll(".cl__w").forEach((w, i) => {
      const at = enterEnd + 0.12 + i * 0.055, b = w.querySelector(".cl__wb"), t = w.querySelector(".cl__wt");
      tl.fromTo(b, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.32, ease: E.reveal }, at)
        .set(t, { opacity: 1 }, at + 0.32)
        .set(b, { transformOrigin: "right center" }, at + 0.41)
        .to(b, { scaleX: 0, duration: 0.38, ease: E.reveal }, at + 0.41);
    });
    const fill = $(".cl__fill"), pct = $(".cl__pct"), p = { v: 0 };
    tl.to(p, { v: 1, duration: T.load, ease: "none", onUpdate: () => { const k = curve(p.v); fill.style.width = `${(k * 100).toFixed(2)}%`; pct.textContent = `${Math.round(k * 100)}%`; } }, loadStart);
    tl.to($(".cl__bar"), { y: 0, duration: T.dock, ease: E.io }, dockStart);
    tl.to($(".cl__cell--brand"), { backgroundColor: css("--kf-bg"), color: css("--kf-ink"), borderColor: "transparent", duration: T.dock, ease: E.io }, dockStart);
    tl.to($(".cl__cell--track"), { backgroundColor: css("--kf-contrast-bg"), borderColor: "transparent", duration: T.dock, ease: E.io }, dockStart);
    tl.to(fill, { xPercent: 101, duration: T.dock * T.wipe, ease: E.io }, dockStart);
    tl.to($(".cl__cell--nav1"), { backgroundColor: css("--site-track"), borderColor: "transparent", duration: T.dock, ease: E.io }, dockStart);
    tl.to($(".cl__cell--nav2"), { backgroundColor: css("--kf-accent-text"), borderColor: "transparent", duration: T.dock, ease: E.io }, dockStart);
    cl.querySelectorAll(".cl__flip-in").forEach((f) => {
      const face = f.firstElementChild, gap = parseFloat(getComputedStyle(f).gap) || 0;
      tl.to(f, { y: () => -(face.offsetHeight + gap), duration: T.dock - T.swap, ease: E.io }, dockStart + T.swap);
    });
    tl.to($(".cl__menu"), { clipPath: "inset(0 0 0 0%)", duration: T.dock * 0.6, ease: E.io }, dockStart + T.dock * T.menuAt);
    tl.to($(".cl__backdrop"), { clipPath: "inset(100% 0 0 0)", duration: T.reveal, ease: E.io }, dockStart + T.dock * T.revealAt);
    tl.call(() => document.dispatchEvent(new CustomEvent("cb:reveal")), null, dockStart + T.dock * T.revealAt);
    CB.loaderTl = tl;
  }

  // Scroll progress — the second cell of the header row fills with lime
  const track = $(".cl__cell--track");
  const prog = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    track.style.setProperty("--sp", max > 0 ? (scrollY / max).toFixed(4) : 0);
  };
  addEventListener("scroll", prog, { passive: true });

  /* ---------- Menu Panel ---------- */
  const menu = document.createElement("div");
  menu.className = "cmenu";
  menu.setAttribute("data-slot", "menu");
  menu.setAttribute("aria-hidden", "true");
  const MEMBERS = Array.from({ length: 21 }, (_, i) => `Name ${String(i + 1).padStart(2, "0")}`);
  // 12 columns×6 rows: rows 1~3 are name cells, rows 4~5 left half is two big links, right half is name cells, row 6 is contact·social·credits
  menu.innerHTML = `
    <div class="cmenu__lines">${Array.from({ length: 72 }, (_, i) => `<i style="--ld:${(0.1 + ((i % 12) + Math.floor(i / 12)) / 16 * 0.64).toFixed(3)}s"></i>`).join("")}</div>
    <div class="cmenu__grid">
      ${MEMBERS.slice(0, 18).map((n, i) => `<div class="cmenu__member" style="grid-column:${(i % 6) * 2 + 1}/span 2;grid-row:${Math.floor(i / 6) + 1}"><div class="cmenu__fx"><i></i><i></i><i></i><i></i><i></i><div class="ph" data-label="Participant upper body · bright daylight · portrait"></div></div><span data-label="Participant name">${n}</span></div>`).join("")}
      <a class="cmenu__big" href="index.html" style="grid-column:1/span 6;grid-row:4;--d:.34s"><span class="cmenu__num">01</span><b data-label="Menu large link">Home</b></a>
      <a class="cmenu__big" href="lookbook.html" style="grid-column:1/span 3;grid-row:5;--d:.42s"><span class="cmenu__num">02</span><b>Gallery</b></a>
      <a class="cmenu__big" href="about.html" style="grid-column:4/span 3;grid-row:5;--d:.51s"><span class="cmenu__num">03</span><b>About</b></a>
      ${MEMBERS.slice(18, 21).map((n, i) => `<div class="cmenu__member" style="grid-column:${7 + i * 2}/span 2;grid-row:4/span 2"><div class="cmenu__fx"><i></i><i></i><i></i><i></i><i></i><div class="ph" data-label="Participant upper body · bright daylight · portrait"></div></div><span>${n}</span></div>`).join("")}
      <a class="cmenu__social" href="#" style="grid-column:1/span 2;grid-row:6"><span>Social 01</span><span>↗</span></a>
      <a class="cmenu__social" href="#" style="grid-column:3/span 2;grid-row:6"><span>Social 02</span><span>↗</span></a>
      <p class="cmenu__credit" style="grid-column:5/span 4;grid-row:6;margin:0">Your creator and copyright line here</p>
      <a class="cmenu__big cmenu__big--contact" href="#" style="grid-column:9/span 4;grid-row:6;--d:.59s"><span class="cmenu__num">04</span><b>Contact</b></a>
    </div>
    <div class="cmenu__m">
      <nav><a class="big" href="index.html">Home</a><a class="big" href="lookbook.html">Gallery</a><a class="big" href="about.html">About</a><a class="big" href="#">Partner</a></nav>
      <div class="cmenu__mgrid"><ul><li>Social 01</li><li>Social 02</li><li>Social 03</li></ul><ul><li>Register</li><li>Your short notice here</li></ul></div>
    </div>`;
  document.body.appendChild(menu);
  const menuBtn = $(".cl__menu");
  // On opening the menu, name · number · social text decode in seat order (250 + 260 left + 320ms up), and an eye opens in the header row cell
  const menuCode = () => {
    menu.querySelectorAll(".cmenu__member > span, .cmenu__num").forEach((el) => {
      const r = el.getBoundingClientRect();
      const d = 250 + (r.left / innerWidth) * 260 + (r.top / innerHeight) * 320;
      const m = el.closest(".cmenu__member"); if (m) m.style.setProperty("--od", `${((d - 250) / 1000 * 0.4 + 0.117).toFixed(3)}s`);
      CB.code(el, d, 30);
    });
  };
  // The eyelid shrinks an HTML cell vertically — shrinking an SVG group with GSAP bakes the center alignment into translate values, which adds an extra movement
  const lid = cl.querySelector(".cl__lid"), ball = cl.querySelector(".cl__eye .eye__ball");
  const eyeOpen = () => {
    if (reduce) return;
    gsap.killTweensOf([lid, ball.firstElementChild]);
    // Original eyes: on one curve (.3,.7,.3,1) closed 0→12%, 1.08 at 70%, 1 at the end — .65s, rests .25s, then blinks
    gsap.timeline({ delay: 0.03 })
      .fromTo(lid, { scaleY: 0.04 }, { keyframes: { "0%": { scaleY: 0.04 }, "12%": { scaleY: 0.04 }, "70%": { scaleY: 1.08 }, "100%": { scaleY: 1 }, easeEach: "none" }, duration: 0.65, ease: E.eye })
      .to(lid, { keyframes: [{ scaleY: 0.06, duration: 0.12, ease: "power2.in" }, { scaleY: 1, duration: 0.16, ease: "power2.out" }] }, "+=0.25")
      .to(ball.firstElementChild, { attr: { cx: 46 }, duration: 0.35, ease: "power2.out" }, "+=0.2").to(ball.firstElementChild, { attr: { cx: 22 }, duration: 0.45, ease: "power2.inOut" }).to(ball.firstElementChild, { attr: { cx: 34.2 }, duration: 0.35, ease: "power2.out" });
  };
  const setMenu = (on) => {
    if (on && !root.classList.contains("menu-open")) { menuCode(); eyeOpen(); }
    root.classList.toggle("menu-open", on);
    menuBtn.setAttribute("aria-expanded", on);
    menuBtn.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
    menu.setAttribute("aria-hidden", !on);
    on ? CB.lenis?.stop() : CB.lenis?.start();
  };
  menuBtn.addEventListener("click", () => setMenu(!root.classList.contains("menu-open")));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  menu.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
  menu.querySelectorAll(".cmenu__member").forEach((m) => {
    m.addEventListener("pointerenter", () => m.classList.add("is-on"));
    m.addEventListener("pointerleave", () => m.classList.remove("is-on"));
  });
  // Cells the mouse passed over briefly brighten, then darken over 2.8s
  const lines = [...menu.querySelectorAll(".cmenu__lines i")];
  menu.addEventListener("pointermove", (e) => {
    const r = menu.getBoundingClientRect();
    const c = Math.floor(((e.clientX - r.left) / r.width) * 12), rr = Math.floor(((e.clientY - r.top) / r.height) * 6);
    const el = lines[rr * 12 + c];
    if (!el || el.classList.contains("is-lit")) return;
    el.classList.add("is-lit");
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove("is-lit")));
  });
  CB.closeMenu = () => setMenu(false);

  /* ---------- Mosaic field — one WebGL pass draws each cell, then copies to a 2D canvas ---------- */
  const FIELD = { tile: 24, columns: 4, loop: 3, radius: 7, ease: 0.15, fade: 0.05, shrink: 0 };
  const fields = new Set();
  let gl, prog2, glcv, uni = {};
  function glInit() {
    glcv = document.createElement("canvas");
    gl = glcv.getContext("webgl", { premultipliedAlpha: false, antialias: false });
    if (!gl) return false;
    const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    // Each tile reads its center color from the ramp and paints it as a rounded square plus bevel light. The ramp bounces once every 3s per slat and returns to place —
    // Original slatPluck (curve measured from the clip) delayed by .06 each, from the center strip outward. A uniform flow loses the original’s rest-then-snap tempo.
    const fs = `precision mediump float;
uniform vec2 uRes;uniform float uTile,uPhase,uFlip,uCols,uRad,uShrink;uniform vec2 uMouse;uniform float uHot;
uniform vec3 c0,c1,c2,c3,c4,c5,gap;
float pluck(float t){t*=6.2831853;return -.2132+.2610*cos(t+1.242)+.0920*cos(2.*t+.114)+.0384*cos(3.*t-.549)+.0202*cos(4.*t-1.081)+.0106*cos(5.*t-1.681)+.0046*cos(6.*t-2.294);}
vec3 ramp(float v){v=fract(v)*6.;
 if(v<1.)return mix(c0,c1,smoothstep(0.,1.,v));if(v<2.)return mix(c1,c2,smoothstep(0.,1.,v-1.));
 if(v<3.)return mix(c2,c3,smoothstep(0.,1.,v-2.));if(v<4.)return mix(c3,c4,smoothstep(0.,1.,v-3.));
 if(v<5.)return mix(c4,c5,smoothstep(0.,1.,v-4.));return mix(c5,c0,smoothstep(0.,1.,v-5.));}
void main(){
 vec2 fc=gl_FragCoord.xy; fc.y=uRes.y-fc.y; if(uFlip>.5)fc.y=uRes.y-fc.y;
 vec2 cell=floor(fc/uTile); vec2 ctr=(cell+.5)*uTile;
 float slat=min(uCols-1.,floor(ctr.x/uRes.x*uCols)); float cen=(uCols-1.)*.5; float queue=abs(slat-cen)/max(cen,1.);
 vec2 m=uMouse; float d=length(ctr-m)/(uRad*uTile); float k=uHot*(1.-smoothstep(0.,1.,d));
 vec2 dir=normalize(ctr-m+.0001);
 vec2 lp=(fc-ctr)/uTile + dir*k*.35;
 float s=.465*(1.-k*uShrink);
 vec2 q=abs(lp)-vec2(s-.09); float sd=length(max(q,0.))+min(max(q.x,q.y),0.)-.09;
 float v=(ctr.y/uRes.y)*.9 - pluck(uPhase - queue*.06);
 vec3 col=ramp(v);
 float edge=smoothstep(0.,.06,-sd);
 float e=clamp(-sd/.1,0.,1.); vec2 nd=normalize(lp+.0001); float bev=dot(nd,vec2(-.7071,-.7071))*(1.-e);
 col=col*(1.+bev*.55)*(1.-.12*length(lp)) + vec3(.05)*(1.-e);
 col=mix(gap,col,edge);
 vec2 sd2=(fc-m)/uTile; float r2=length(sd2);
 float star=.8*exp(-r2*2.5)+.35*exp(-abs(sd2.x)*9.-abs(sd2.y)*1.2)+.35*exp(-abs(sd2.y)*9.-abs(sd2.x)*1.2);
 col+=vec3(1.)*star*uHot;
 gl_FragColor=vec4(col,1.);}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    prog2 = gl.createProgram();
    gl.attachShader(prog2, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog2, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog2);
    if (!gl.getProgramParameter(prog2, gl.LINK_STATUS)) return false;
    gl.useProgram(prog2);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog2, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    "uRes uTile uPhase uFlip uCols uRad uShrink uMouse uHot c0 c1 c2 c3 c4 c5 gap".split(" ").forEach((n) => (uni[n] = gl.getUniformLocation(prog2, n)));
    paintColors();
    return true;
  }
  function paintColors() {
    if (!gl) return;
    const set = (n, v) => gl.uniform3fv(uni[n], CB.rgb(v));
    set("c0", "--site-paper"); set("c1", "--kf-accent-soft"); set("c2", "--kf-accent"); set("c3", "--kf-accent-text"); set("c4", "--site-deep"); set("c5", "--kf-contrast-bg"); set("gap", "--kf-contrast-bg");
  }
  CB.paintColors = paintColors;
  const fio = new IntersectionObserver((es) => es.forEach((e) => (e.target._f.on = e.isIntersecting)), { rootMargin: "100px" });
  CB.fields = (scope) => {
    if (!gl && !glInit()) return;
    scope.querySelectorAll(".field").forEach((el) => {
      if (el._f) return;
      const cv = document.createElement("canvas"); cv.className = "field__cv"; el.prepend(cv);
      const f = { el, cv, g: cv.getContext("2d"), on: false, shift: +(el.dataset.fieldShift ?? 0), flip: el.dataset.fieldFlip === "y" || (!desk() && el.dataset.fieldFlipNarrow === "y"), mx: -1e4, my: -1e4, tx: -1e4, ty: -1e4, hot: 0, th: 0, w: 0, h: 0 };
      el._f = f; fields.add(f); fio.observe(el);
      if (hover) {
        el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); f.tx = e.clientX - r.left; f.ty = e.clientY - r.top; if (f.mx < -1e3) { f.mx = f.tx; f.my = f.ty; } f.th = 1; });
        el.addEventListener("pointerleave", () => (f.th = 0));
      }
    });
  };
  CB.unfields = (scope) => scope.querySelectorAll(".field").forEach((el) => { if (el._f) { fio.unobserve(el); fields.delete(el._f); el._f = null; } });
  let t0 = performance.now();
  gsap.ticker.add(() => {
    if (!gl || !fields.size) return;
    const time = reduce ? 0 : (performance.now() - t0) / 1000;
    const dpr = Math.min(devicePixelRatio, 1.5);
    for (const f of fields) {
      if (!f.on) continue;
      const w = Math.max(1, Math.round(f.el.clientWidth * dpr)), h = Math.max(1, Math.round(f.el.clientHeight * dpr));
      if (f.w !== w || f.h !== h) { f.cv.width = w; f.cv.height = h; f.w = w; f.h = h; }
      if (glcv.width < w) glcv.width = w;
      if (glcv.height < h) glcv.height = h;
      f.mx += (f.tx - f.mx) * FIELD.ease; f.my += (f.ty - f.my) * FIELD.ease; f.hot += (f.th - f.hot) * (f.th > f.hot ? FIELD.ease : FIELD.fade);
      gl.viewport(0, glcv.height - h, w, h);
      gl.uniform2f(uni.uRes, w, h);
      gl.uniform1f(uni.uTile, (desk() ? FIELD.tile * Math.min(1920, Math.max(1440, innerWidth)) / 1920 : 14) * dpr);
      gl.uniform1f(uni.uPhase, (time / FIELD.loop + f.shift) % 1); gl.uniform1f(uni.uFlip, f.flip ? 1 : 0);
      gl.uniform1f(uni.uCols, FIELD.columns); gl.uniform1f(uni.uRad, FIELD.radius); gl.uniform1f(uni.uShrink, FIELD.shrink);
      gl.uniform2f(uni.uMouse, f.mx * dpr, f.my * dpr); gl.uniform1f(uni.uHot, f.hot);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      f.g.drawImage(glcv, 0, 0, w, h, 0, 0, w, h);
    }
  });

  /* ---------- Pill · dot strip — pauses when off screen ---------- */
  const mio = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-off", !e.isIntersecting)));
  CB.marquees = (scope) => scope.querySelectorAll(".pillrun, .dotrun").forEach((m) => mio.observe(m));

  /* ---------- Text decode hover — turns into symbols, then returns to the real letters from the left ---------- */
  const GLY = "!<>-_\\/[]{}=+*^?#%&$01";
  CB.code = (el, delay = 0, first = 0) => {
    if (reduce || !el) return;
    const text = el._code ?? (el._code = el.textContent);
    if (!text.trim()) return;
    cancelAnimationFrame(el._codeRaf); clearTimeout(el._codeRaf);
    if (getComputedStyle(el).display === "inline") el.style.display = "inline-block";
    el.style.minWidth = `${el.getBoundingClientRect().width}px`;
    const t0 = performance.now() + delay, dur = 260 + text.length * 18;
    const tick = (now) => {
      const k = Math.max(0, (now - t0) / dur), n = k * text.length;
      el.textContent = [...text].map((ch, i) => (ch === " " || i < n ? ch : GLY[(Math.random() * GLY.length) | 0])).join("");
      if (k < 1) el._codeRaf = requestAnimationFrame(tick); else { el.textContent = text; el.style.minWidth = ""; }
    };
    if (delay <= 0) return tick(performance.now());
    el._codeRaf = setTimeout(() => (el._codeRaf = requestAnimationFrame(tick)), first);
  };
  CB.scramble = (scope) => scope.querySelectorAll("[data-scramble]").forEach((el) => {
    if (el._sc) return; el._sc = 1;
    const text = el.textContent; let raf;
    el.addEventListener("pointerenter", () => {
      if (reduce) return;
      el.style.width = el.offsetWidth + "px";
      const t0 = performance.now(), dur = 420;
      cancelAnimationFrame(raf);
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur), n = Math.floor(p * text.length);
        el.textContent = text.slice(0, n) + [...text.slice(n)].map((c) => (c === " " ? " " : GLY[(Math.random() * GLY.length) | 0])).join("");
        if (p < 1) raf = requestAnimationFrame(step); else { el.textContent = text; el.style.width = ""; }
      };
      raf = requestAnimationFrame(step);
    });
  });

  /* ---------- Butterfly — folds and unfolds two wings with three, perches at a set spot per section then flies to the next spot ---------- */
  function flyer() {
    if (!window.THREE || reduce) return;
    const T3 = THREE;
    const cv = document.createElement("canvas"); cv.className = "cb-flyer"; cv.setAttribute("aria-hidden", "true"); document.body.appendChild(cv);
    const r = new T3.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new T3.Scene(), cam = new T3.PerspectiveCamera(30, 1, 1, 5000);
    cam.position.z = 1000;
    scene.add(new T3.HemisphereLight(0xffffff, 0x445544, 2.2));
    const sun = new T3.DirectionalLight(0xffffff, 1.6); sun.position.set(-1, 2, 3); scene.add(sun);
    // Wing pattern — drawn on a canvas in the skin’s green (forewing · hindwing · veins)
    const tx = document.createElement("canvas"); tx.width = 256; tx.height = 256;
    const c = tx.getContext("2d");
    const col = (v, a = 1) => { const [rr, gg, bb] = CB.rgb(v); return `rgba(${rr * 255 | 0},${gg * 255 | 0},${bb * 255 | 0},${a})`; };
    const grad = c.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, col("--site-sage")); grad.addColorStop(0.6, col("--kf-accent-text")); grad.addColorStop(1, col("--site-moss"));
    c.fillStyle = grad;
    c.beginPath(); c.moveTo(10, 128); c.bezierCurveTo(40, 10, 200, -10, 246, 40); c.bezierCurveTo(250, 100, 190, 128, 140, 132); c.bezierCurveTo(220, 150, 230, 230, 170, 248); c.bezierCurveTo(110, 256, 40, 200, 10, 140); c.closePath(); c.fill();
    c.strokeStyle = col("--site-moss", 0.6); c.lineWidth = 2;
    for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(12, 130); c.quadraticCurveTo(120, 130 - i * 30 + 60, 240 - i * 10, 40 + i * 38); c.stroke(); }
    c.fillStyle = col("--site-moss", 0.8); c.beginPath(); c.arc(200, 70, 9, 0, 7); c.fill();
    const tex = new T3.CanvasTexture(tx); tex.colorSpace = T3.SRGBColorSpace;
    const mat = new T3.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.4, side: T3.DoubleSide, roughness: 0.7 });
    const geo = new T3.PlaneGeometry(1, 1); geo.translate(0.5, 0, 0);
    const bfly = new T3.Group(), L = new T3.Mesh(geo, mat), R = new T3.Mesh(geo, mat);
    R.scale.x = -1; bfly.add(L, R);
    const body = new T3.Mesh(new T3.CapsuleGeometry(0.035, 0.7, 4, 8), new T3.MeshStandardMaterial({ color: new T3.Color().setRGB(...CB.rgb("--site-moss")) }));
    body.rotation.z = Math.PI / 2; body.rotation.y = Math.PI / 2; bfly.add(body);
    const holder = new T3.Group(); holder.add(bfly); bfly.rotation.x = -0.9; scene.add(holder);
    // Shadow — blurred circle
    const sc = document.createElement("canvas"); sc.width = sc.height = 64; const sg = sc.getContext("2d");
    const rg = sg.createRadialGradient(32, 32, 0, 32, 32, 32); rg.addColorStop(0, col("--kf-contrast-bg", 0.22)); rg.addColorStop(1, col("--kf-contrast-bg", 0)); sg.fillStyle = rg; sg.fillRect(0, 0, 64, 64);
    const shadow = new T3.Mesh(new T3.PlaneGeometry(1, 1), new T3.MeshBasicMaterial({ map: new T3.CanvasTexture(sc), transparent: true, depthWrite: false }));
    scene.add(shadow);
    const size = () => { r.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.fov = 2 * Math.atan(innerHeight / 2 / 1000) * 180 / Math.PI; cam.updateProjectionMatrix(); };
    size(); addEventListener("resize", size);
    r.compile(scene, cam);
    const st = { x: innerWidth * 0.8, y: innerHeight * 0.3, vx: 0, vy: 0, flap: 0, rot: 0 };
    CB.perches = [];
    let last = performance.now();
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.min(64, Math.max(1, now - last)) / 1000; last = now;
      if (root.classList.contains("cb-loading")) { cv.style.opacity = 0; return; }
      cv.style.opacity = 1;
      // Resting position of the section passing the screen center (original: a set point above the screen per section)
      let tx = innerWidth * 0.82, ty = innerHeight * 0.32;
      for (const p of CB.perches) {
        const b = p.el.getBoundingClientRect();
        if (b.top < innerHeight * 0.55 && b.bottom > innerHeight * 0.45) { tx = innerWidth * p.x; ty = innerHeight * p.y; break; }
      }
      const ax = (tx - st.x) * 2.2 - st.vx * 2.4, ay = (ty - st.y) * 2.2 - st.vy * 2.4;
      st.vx += ax * dt; st.vy += ay * dt; st.x += st.vx * dt; st.y += st.vy * dt;
      const sp = Math.hypot(st.vx, st.vy);
      st.flap += dt * (sp > 30 ? 22 : 5 + Math.sin(now / 900) * 3);
      const wing = sp > 30 ? Math.sin(st.flap) * 1.1 : (Math.sin(st.flap) * 0.5 + 0.55);
      L.rotation.y = -wing; R.rotation.y = wing;
      const s = Math.min(innerWidth, 1920) * 0.07;
      bfly.scale.setScalar(s);
      st.rot += ((sp > 30 ? Math.atan2(st.vy, st.vx) + Math.PI / 2 : -0.5) - st.rot) * 0.06;
      holder.rotation.z = -st.rot * 0.6;
      holder.position.set(st.x - innerWidth / 2, innerHeight / 2 - st.y, sp > 30 ? 40 : 0);
      shadow.position.set(holder.position.x + s * 0.25, holder.position.y - s * 0.35, -60);
      shadow.scale.setScalar(s * 1.3);
      r.render(scene, cam);
    });
  }

  /* ---------- Page attach and detach ---------- */
  function mountPage(container) {
    CB.ns = container.dataset.barbaNamespace;
    CB.fields(container); CB.marquees(container); CB.scramble(container);
    const mod = CB.pages[CB.ns];
    CB.perches = [];
    if (mod) { CB.current = mod; CB.mm = gsap.matchMedia(); mod.mount(container, CB.mm); }
    ScrollTrigger.refresh();
    prog();
  }
  function unmountPage(container) {
    CB.current?.unmount?.(); CB.current = null;
    CB.mm?.revert(); CB.mm = null;
    CB.unfields(container);
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }

  /* ---------- Barba stacked-card transition ---------- */
  const tw = document.createElement("div"); tw.className = "tr-wrap"; tw.innerHTML = '<div class="tr-mid"><span class="tr-label">Page</span><span class="tr-num">001</span></div>'; document.body.appendChild(tw);
  const ORDER = { home: "001", lookbook: "002", about: "003" };
  const S = { clip: 0.8, shrink: 1.2, exit: 1.2, exitAt: 0.9, lag: 0.15, wS: 0.95, wY: 20, mS: 0.875, mY: 10, nS: 0.8, wEY: 130, mEY: 120 };
  const loadCss = (doc) => Promise.all([...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => {
    const href = l.getAttribute("href");
    if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return null;
    const n = document.createElement("link"); n.rel = "stylesheet"; n.href = href; document.head.appendChild(n);
    return new Promise((ok) => { n.onload = n.onerror = ok; });
  }));
  const loadJs = (doc, ns) => {
    if (CB.pages[ns]) return Promise.resolve();
    const own = [...doc.querySelectorAll("script[src]")].map((s) => s.getAttribute("src")).filter((s) => !/\.\.\//.test(s) && !/shared\.js/.test(s));
    return own.reduce((p, src) => p.then(() => new Promise((ok) => { const s = document.createElement("script"); s.src = src; s.onload = s.onerror = ok; document.body.appendChild(s); })), Promise.resolve());
  };
  // Hovering a link preloads that page’s css and js — so the transition doesn’t start late from recalculating styles at the moment of click
  // (The original loads all the css from the start on every page)
  const warmed = new Set();
  const warm = (a) => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.target === "_blank" || warmed.has(href)) return;
    let u; try { u = new URL(href, location.href); } catch (e) { return; }
    if (u.origin !== location.origin || !/\.html$/.test(u.pathname)) return;
    warmed.add(href);
    fetch(u.href).then((r) => r.text()).then((t) => { const d = new DOMParser().parseFromString(t, "text/html"); const ns = d.querySelector("[data-barba-namespace]")?.dataset.barbaNamespace; return Promise.all([loadCss(d), loadJs(d, ns)]); }).catch(() => warmed.delete(href));
  };
  document.addEventListener("pointerover", (e) => { const a = e.target.closest?.("a[href]"); if (a) warm(a); }, { passive: true });
  function startBarba() {
    if (!window.barba) return;
    barba.init({
      timeout: 7000,
      preventRunning: true,
      prevent: ({ el }) => el && (el.target === "_blank" || el.hasAttribute("data-barba-prevent") || (el.getAttribute("href") || "").startsWith("#")),
      // Same order as the original — in sync mode lay the new page below at .8, in one timeline:
      // 0s corners round off (.8s) · previous page .95/20% · center panel .875/10% (1.2s expo.inOut), at .9s the previous page exits to 130% (1.2s),
      // 1.05s center panel exits at 120%, 1.2s new page .8→1 (1.2s expo.inOut), 1.6s corners unfold. The header row hides at 0s and returns at 1.2s
      transitions: [{
        name: "stack",
        sync: true,
        async leave({ current, next }) {
          CB.navAt = performance.now();
          CB.closeMenu();
          const doc = new DOMParser().parseFromString(next.html || "", "text/html");
          CB.nextDoc = doc;
          // The next page’s css and js are fetched along with the transition: all arrive before the new page grows in 1.2s
          const ready = Promise.all([loadCss(doc), loadJs(doc, next.namespace)]);
          const ns = next.namespace || "home";
          const bar = cl.querySelector(".cl__bar");
          if (reduce) { await ready; unmountPage(current.container); current.container.remove(); document.title = doc.title || document.title; mountPage(next.container); return; }
          const y = scrollY;
          document.body.classList.add("is-transitioning");
          current.container.firstElementChild && gsap.set(current.container.firstElementChild, { y: -y });
          next.container.classList.add("is-next");
          tw.classList.add("is-on");
          const mid = tw.querySelector(".tr-mid");
          tw.querySelector(".tr-label").textContent = { home: "Home", lookbook: "Gallery", about: "About" }[ns] || "Page";
          tw.querySelector(".tr-num").textContent = ORDER[ns] || "000";
          scrollTo(0, 0); CB.lenis?.scrollTo(0, { immediate: true });
          const all = [current.container, mid, next.container];
          gsap.set(all, { borderRadius: 0, yPercent: 0, scale: 1 });
          gsap.set(next.container, { scale: S.nS });
          const tExit = S.exitAt, tMid = tExit + S.lag, tNext = tExit + S.lag * 2;
          const tl = gsap.timeline();
          tl.to(all, { borderRadius: "1em", duration: S.clip }, 0)
            .to(current.container, { scale: S.wS, yPercent: S.wY, duration: S.shrink, ease: "expo.inOut" }, 0)
            .to(mid, { scale: S.mS, yPercent: S.mY, duration: S.shrink, ease: "expo.inOut" }, 0)
            .to(current.container, { yPercent: S.wEY, duration: S.exit }, tExit)
            .to(mid, { yPercent: S.mEY, duration: S.exit }, tMid)
            .to(next.container, { scale: 1, yPercent: 0, duration: S.exit, ease: "expo.inOut" }, tNext)
            .to(all, { borderRadius: 0, duration: S.clip }, tNext + S.exit - S.clip)
            .to(bar, { yPercent: -100, duration: 0.5, ease: "expo.inOut" }, 0)
            .to(bar, { yPercent: 0, duration: 0.7, ease: "expo.inOut" }, tNext);
          let mounted = false;
          if (ns === "lookbook") tl.call(() => ready.then(() => { unmountPage(current.container); mountPage(next.container); mounted = true; }), null, tNext);
          await tl;
          await ready;
          if (!mounted) unmountPage(current.container);
          current.container.remove();
          tw.classList.remove("is-on");
          document.body.classList.remove("is-transitioning");
          next.container.classList.remove("is-next");
          gsap.set(next.container, { clearProps: "transform,borderRadius,scale" });
          document.title = doc.title || document.title;
          if (!mounted) mountPage(next.container);
          ScrollTrigger.refresh();
        },
        async enter() {},
      }],
    });
  }

  /* ---------- Start ---------- */
  function start() {
    runLoader();
    flyer();
    const c = document.querySelector('[data-barba="container"]');
    CB.ready = true;
    mountPage(c);
    startBarba();
    addEventListener("resize", () => ScrollTrigger.refresh());
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
