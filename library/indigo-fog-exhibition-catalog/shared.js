// Common to all pages: draws the phone menu, left table-of-contents column, ticket pill and footer in one place, and attaches shader mist, smooth scroll, TOC slide, reveal and collapsible text.
// Original values: Lenis lerp .08 · TOC jump 1s power2.out (header offset 6rem at 1100 or more, 8rem below) · reveal .6s power2.out stagger .16 top 85% ·
// accordion .4s power2.out · subpage open body fade .6s power1.out · fog 30fps, time ×.308, phone vertical .68 · spread 2 (desktop 1 · 1.5).
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const YT = (window.YT = { reduced, page, lenis: null });

  // ---------- Icons (redrawn at the same size instead of the original image files) ----------
  const arrowSvg = '<svg viewBox="0 0 9 8" fill="none"><path d="M0 4h8M4.6 0.7 7.9 4 4.6 7.3" stroke="currentColor" stroke-width="1"/></svg>';
  const arrow = (color = "var(--kf-ink)") => `<span class="y-arrow" aria-hidden="true" style="color:${color}">${arrowSvg}${arrowSvg}</span>`;
  const menuIcon = (lines) =>
    `<svg viewBox="0 0 40 20" fill="none"><rect width="40" height="20" rx="2" style="fill:var(--kf-accent)"/>${lines
      .map((y) => `<line x1="10" x2="30" y1="${y}" y2="${y}" style="stroke:var(--kf-ink)"/>`)
      .join("")}</svg>`;
  const snsIcons = [
    ["SNS 1", '<svg viewBox="0 0 17 17" fill="none" style="stroke:var(--kf-ink)" stroke-width="1.3"><path d="M2 2l13 13M15 2 2 15"/></svg>'],
    ["SNS 2", '<svg viewBox="0 0 17 17" fill="none" style="stroke:var(--kf-ink)" stroke-width="1.3"><rect x="1.5" y="1.5" width="14" height="14" rx="4"/><circle cx="8.5" cy="8.5" r="3.3"/><circle cx="12.8" cy="4.2" r=".6" style="fill:var(--kf-ink)"/></svg>'],
  ];
  const sns = () => snsIcons.map(([label, svg]) => `<a class="y-sns" href="#" aria-label="${label}">${svg}</a>`).join("");
  // Text link arrows follow the text color (orange on hover), while arrows inside boxes and buttons stay grayish white
  document.querySelectorAll("[data-arrow]").forEach((el) => {
    if (el.dataset.arrow === "more") el.outerHTML = arrow("currentColor");
    else el.innerHTML = arrow();
  });

  // ---------- Title logo: fills placeholder text into the piece cells of the original 1160×519 panel (top line · three big letters · two English lines below) ----------
  const VB = { w: 1160, h: 519 };
  // Latin pieces are drawn with broken LED lines (4×8 cells). Redrawn fresh with the same feel instead of the original Latin typeface.
  const seg = {
    top: "M0.3 0H3.7", bot: "M0.3 8H3.7", mid: "M0.3 4H3.7", midS: "M0.3 4H3",
    lu: "M0 0.3V3.7", ll: "M0 4.3V7.7", ru: "M4 0.3V3.7", rl: "M4 4.3V7.7", cv: "M2 0.3V7.7",
  };
  const glyph = {
    S: ["top", "lu", "mid", "rl", "bot"],
    A: ["top", "lu", "ru", "mid", "ll", "rl"],
    M: ["lu", "ll", "ru", "rl", "M0.3 0.4L2 3.4L3.7 0.4"],
    P: ["top", "lu", "ru", "mid", "ll"],
    L: ["lu", "ll", "bot"],
    E: ["top", "lu", "midS", "ll", "bot"],
    T: ["top", "cv"],
    I: ["M1 0H3", "cv", "M1 8H3"],
  };
  const pct = (v) => +v.toFixed(3);
  // Per piece: [character, slot (logo ratio %), original entrance delay]
  const topLine = { x: 23.95, y: 0, w: 53.54, h: 22.62 };
  const parts = [];
  const topChars = ["Woman", "Flag", "At", "Work", "Go", "Name"];
  const topDelays = [1, 1.44, 2.24, 1.58, 1.5, 1.78];
  const kanaW = (topLine.w * 0.88) / 6;
  topChars.forEach((c, i) =>
    parts.push({ kind: "ja", c, x: topLine.x + kanaW * i, y: topLine.y, w: kanaW, h: topLine.h, d: topDelays[i] })
  );
  parts.push({ kind: "ja", c: "Before", x: topLine.x + kanaW * 6, y: topLine.y + topLine.h * 0.42, w: topLine.w * 0.12, h: topLine.h * 0.58, d: 1.16 });
  const big = (x, y, w, h, chars, delays, extra = {}) =>
    chars.forEach((c, i) => parts.push({ kind: "ja", c, x: x + (w / chars.length) * i, y, w: w / chars.length, h, d: delays[i], ...extra }));
  big(0, 27.14, 40.01, 38.22, ["Woman", "Flag"], [1.94, 1.4]);
  parts.push({ kind: "ja", thin: true, c: "At", x: 39.08, y: 34.23, w: 21.92, h: 27.35, d: 1.08 });
  big(60.7, 27.13, 39.3, 38.14, ["My", "Neck"], [2.8, 1.12]);
  parts[parts.length - 2].cross = true; // Original cross-glyph slot: rises first, on its own
  [
    [75.02, 9.78, 2.36, "SAMPLE", [11.52, 26.46, 41.35, 56.29, 71.17, 86.09], [1.48, 1.12, 1.4, 1.16, 1.32, 1.24]],
    [90.21, 9.79, 2.4, "TITLE", [19.56, 34.44, 49.36, 64.27, 79.18], [1.2, 1.28, 1.36, 1.52, 1.44]],
  ].forEach(([y, h, w, word, xs, ds]) => [...word].forEach((c, i) => parts.push({ kind: "en", c, x: xs[i], y, w, h, d: ds[i] })));

  const partSvg = (p) => {
    const pw = (p.w / 100) * VB.w;
    const ph = (p.h / 100) * VB.h;
    if (p.kind === "en") {
      const d = glyph[p.c].map((s) => seg[s] || s).join("");
      return `<svg viewBox="-0.3 -0.3 4.6 8.6" preserveAspectRatio="none"><path d="${d}"/></svg>`;
    }
    // Bold text stretches the glyph box to fill the piece cell (each cell filled with a letter like the original logo), while thin text keeps its ratio at the cell height
    if (!p.thin)
      return `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-size="112">${p.c}</text></svg>`;
    return `<svg viewBox="0 0 ${pct(pw)} ${pct(ph)}"><text x="${pct(pw / 2)}" y="${pct(ph / 2)}" text-anchor="middle" dominant-baseline="central" font-size="${pct(ph * 1.15)}">${p.c}</text></svg>`;
  };
  YT.logo = (cls = "") =>
    `<div class="y-logo ${cls}" aria-hidden="true">${parts
      .map(
        (p) =>
          `<span class="y-logo__p --${p.kind}${p.thin ? " --thin" : ""}" data-logo-kind="${p.kind}" data-logo-delay="${p.d}"${p.cross ? " data-logo-cross" : ""} style="left:${pct(p.x)}%;top:${pct(p.y)}%;width:${pct(p.w)}%;height:${pct(p.h)}%">${partSvg(p)}</span>`
      )
      .join("")}</div>`;

  // ---------- Menu items: cells inside the first page are same-page anchors, the rest are our subpages ----------
  const home = page === "home";
  const nav = [
    ["HOME", home ? "#top" : "index.html", "home"],
    ["OUTLINE", home ? "#outline" : "index.html#outline"],
    ["NEWS", "news.html", "news"],
    ["HIGHLIGHTS", home ? "#highlights" : "index.html#highlights"],
    ["ARTIST", "artist.html", "artist"],
    ["TICKET", "ticket.html", "ticket"],
    ["ACCESS", home ? "#access" : "index.html#access"],
  ];
  const act = (key) => (key === page ? " --active" : "");
  const cur = (key) => (key === page ? ' aria-current="page"' : "");
  const lang = '<a href="#">KO</a><a href="#">EN</a>';
  document.querySelectorAll("[data-logo-sp]").forEach((el) => (el.innerHTML = YT.logo()));

  const sp = document.querySelector('[data-slot="menu-sp"]');
  if (sp) {
    sp.classList.add("y-spnav");
    sp.innerHTML = `
      <button class="y-spnav__trigger" type="button" aria-label="Open Menu" aria-controls="y-menu" aria-expanded="false">
        <span class="y-spnav__icon" aria-hidden="true">${menuIcon([8.5, 12.5])}</span>
        <span class="y-spnav__icon --close" aria-hidden="true">${menuIcon([10.5])}</span>
      </button>
      <div class="y-spnav__panel" id="y-menu" aria-hidden="true" inert data-lenis-prevent>
        <div class="y-spnav__scroll y-simplebar" data-simplebar-aria-label="Menu">
          <div class="y-spnav__content">
            <div class="y-spnav__body">
              <nav class="y-spnav__links" aria-label="Menu">
                ${nav.map(([t, h, k]) => `<a class="y-spnav__link${act(k)}" href="${h}" data-nav${cur(k)}>${t}</a>`).join("")}
              </nav>
              <div class="y-spnav__lang" role="group" aria-label="Language">${lang}</div>
              <div class="y-spnav__sns">${sns()}</div>
            </div>
            <div class="y-spnav__logo">${YT.logo()}</div>
          </div>
        </div>
      </div>`;
  }

  const side = document.querySelector('[data-slot="side-nav"]');
  if (side) {
    side.classList.add("y-links");
    side.innerHTML = `
      <div class="y-links__inner y-simplebar" data-lenis-prevent data-simplebar-aria-label="Main menu">
        <div class="y-links__content">
          <nav class="y-links__nav" aria-label="Main menu">
            <ul class="y-links__list">
              ${nav.map(([t, h, k]) => `<li><a class="y-links__link${act(k)}" href="${h}" data-nav${cur(k)}>${t}<span class="y-links__dot" aria-hidden="true"></span></a></li>`).join("")}
            </ul>
          </nav>
          <div class="y-links__lang" role="group" aria-label="Language">${lang}</div>
          <div class="y-links__title">${YT.logo()}</div>
        </div>
      </div>
      ${page === "ticket" ? "" : `<a class="y-ticket" href="ticket.html"><span class="y-ticket__text">Your button text here</span>${arrow()}</a>`}`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("y-foot");
    foot.innerHTML = `
      <div class="y-foot__inner">
        <nav class="y-foot__nav" aria-label="Footer Menu">
          <ul class="y-foot__list">${nav.map(([t, h]) => `<li><a class="y-foot__link" href="${h}" data-nav>${t}</a></li>`).join("")}</ul>
        </nav>
        <dl class="y-foot__contact">
          <div><dt>Contact 1</dt><dd>Your information desk name here (00:00 - 00:00)<br>00-0000-0000<br>info@example.com</dd></div>
          <div><dt>Contact 2</dt><dd>Your PR office here (weekdays 00:00 - 00:00)<br>press@example.com</dd></div>
        </dl>
        <div class="y-foot__aside">
          <div class="y-foot__brand">
            <p class="y-foot__brand-title">Your artist name exhibition, your title here<br>SAMPLE TITLE</p>
            <div class="y-foot__sns">${sns()}</div>
          </div>
          <a class="y-foot__mark" href="#" aria-label="Operating body">L O G O</a>
          <small class="y-foot__copy">&copy; Copyright Your organizer name here<br>Your committee name here<br>All rights reserved.</small>
        </div>
        <div class="y-foot__logo">${YT.logo()}</div>
      </div>`;
  }

  // ---------- Background shader fog: three navy light blobs drift over flowing noise, and two overlap now and then ----------
  const haze = document.querySelector(".y-haze canvas");
  if (haze) startHaze(haze);

  function startHaze(canvas) {
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
    if (!gl) return canvas.classList.add("is-fallback");
    const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    // Rewritten with the same formulas after measuring the original shader — flow grain from gradient noise (hash 2127.1·81.17 / 1269.5·283.37), three light blobs whose centers · radii wobble at different tempos,
    // The third attaches beside the second (−.12, −.07) when cos(t·.62) is .72~.96. On phones (spread ≥ 1.75) the center is spread 1.4x and the second is raised by .34
    const fs = `precision highp float;
      uniform vec2 uRes; uniform float uTime, uSquash, uSpread;
      vec2 grad(vec2 p){ return fract(sin(vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p), f = fract(p), w = f * f * (3. - 2. * f);
        float a = dot(grad(i) * 2. - 1., f);
        float b = dot(grad(i + vec2(1., 0.)) * 2. - 1., f - vec2(1., 0.));
        float c = dot(grad(i + vec2(0., 1.)) * 2. - 1., f - vec2(0., 1.));
        float d = dot(grad(i + vec2(1., 1.)) * 2. - 1., f - vec2(1., 1.));
        return .5 + .5 * mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
      }
      float speck(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float glow(vec2 p, vec2 c, vec2 r, float a){
        vec2 d = mat2(cos(a), -sin(a), sin(a), cos(a)) * (p - c) / r;
        d.x += sin(d.y * 2.2 + a * 1.7) * .14;
        d.y += sin(d.x * 1.8 - a * 1.3) * .1;
        return exp(-1.9 * dot(d, d));
      }
      void main(){
        vec2 uv = gl_FragCoord.xy / uRes;
        float t = uTime * .308;
        float wide = step(1.75, uSpread);
        float n = noise(uv * 1.65 + vec2(t * .08, -t * .06));
        vec2 q = uv + vec2(sin(uv.y * 4.4 + t * .72) * .025, cos(uv.x * 4. - t * .55) * .022) + (n - .5) * vec2(.1, .07);
        vec2 a = vec2(.28 + sin(t * .56) * .25 + sin(t * .19 + 1.4) * .08, .34 + cos(t * .43) * .22 + sin(t * .24) * .07);
        vec2 b = vec2(.69 + cos(t * .48 + .8) * .24 + sin(t * .17) * .07, .57 + sin(t * .39 + 1.1) * .23 + cos(t * .21) * .07);
        float k = mix(1., 1.4, wide);
        a = .5 + (a - .5) * k; b = .5 + (b - .5) * k;
        a.x -= .12 * wide; b.x += .12 * wide; b.y += mix(.24, .34, wide);
        float merge = smoothstep(.72, .96, .5 + .5 * cos(t * .62));
        float sx = sin(t * .34 + 2.2), cy = cos(t * .29 + .5);
        vec2 c = mix(mix(vec2(.48 + sx * .18, .43 + cy * .17), vec2(.5 + sx * .34, .5 + cy * .5), wide), b + vec2(-.12, -.07), merge);
        vec2 ra = vec2(.27 + sin(t * .21) * .018, (.4 + cos(t * .18) * .025) * uSquash) * uSpread;
        vec2 rb = vec2(.31 + cos(t * .17) * .022, (.4 + sin(t * .2) * .03) * uSquash) * uSpread;
        vec2 rc = vec2(.18 + sin(t * .24) * .018, (.27 + cos(t * .22) * .025) * uSquash) * uSpread;
        float L = glow(q, a, ra, -.38 + sin(t * .16) * .3) * .84
                + glow(q, b, rb, .48 + cos(t * .15) * .32)
                + glow(q, c, rc, -.72 + sin(t * .2) * .42) * mix(.88, .64, merge);
        L = 1. - exp(-L);
        vec3 col = mix(vec3(.001, .001, .006), vec3(0., .006, .13), smoothstep(.055, .5, L) * .7);
        col = mix(col, vec3(.003, .035, .5), smoothstep(.22, .78, L) * .74);
        col += (speck(floor(gl_FragCoord.xy / 1.35)) - .5) * .02 * smoothstep(.03, .35, L);
        gl_FragColor = vec4(clamp(col, 0., 1.), 1.);
      }`;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const v = sh(gl.VERTEX_SHADER, vs);
    const f = sh(gl.FRAGMENT_SHADER, fs);
    const prog = gl.createProgram();
    if (!v || !f) return canvas.classList.add("is-fallback");
    gl.attachShader(prog, v);
    gl.attachShader(prog, f);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return canvas.classList.add("is-fallback");
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(prog, n);
    const uRes = u("uRes"), uTime = u("uTime"), uSquash = u("uSquash"), uSpread = u("uSpread");
    const fit = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(innerWidth * dpr));
      const h = Math.max(1, Math.round(innerHeight * dpr));
      if (canvas.width === w && canvas.height === h) return false;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
      const phone = matchMedia("(max-width: 768px)").matches;
      gl.uniform1f(uSquash, phone ? 0.68 : 1);
      gl.uniform1f(uSpread, phone ? 2 : 1.5);
      return true;
    };
    let raf = 0, last = 0;
    const draw = (now) => {
      if (fit() || now - last >= 1000 / 30) {
        gl.uniform1f(uTime, reduced ? 12 : now * 0.001);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        last = now;
      }
      raf = reduced ? 0 : requestAnimationFrame(draw);
    };
    const start = () => { cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(draw); };
    document.addEventListener("visibilitychange", () => (document.hidden ? cancelAnimationFrame(raf) : start()));
    if (reduced) addEventListener("resize", start);
    start();
  }

  // ---------- Pillar · phone menu scroll: like the original, simplebar 6 (thin orange bar that hides when still) ----------
  if (window.SimpleBar) document.querySelectorAll(".y-simplebar").forEach((el) => new SimpleBar(el, { ariaLabel: el.dataset.simplebarAriaLabel, autoHide: true }));

  // ---------- Smooth scroll ----------
  if (!reduced && window.Lenis) {
    const lenis = (YT.lenis = new Lenis({ lerp: 0.08, smoothWheel: true, respectReducedMotion: false, allowNestedScroll: true }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
  const offset = () => rem() * (matchMedia("(min-width: 1100px)").matches ? 6 : 8);
  const scrollToEl = (el, immediate = false) => {
    const y = el.id === "top" ? 0 : el.getBoundingClientRect().top + scrollY - offset();
    if (YT.lenis) YT.lenis.scrollTo(y, { duration: 1, lerp: 0, easing: gsap.parseEase("power2.out"), immediate, force: true });
    else scrollTo(0, y);
  };
  YT.scrollToEl = scrollToEl;
  const sameTarget = (a) => {
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return null;
    return document.getElementById(decodeURIComponent(url.hash.slice(1)));
  };

  // ---------- Phone menu open and close: while open the background scroll stops, and for a same-page cell it waits two frames after closing and then slides ----------
  const trigger = document.querySelector(".y-spnav__trigger");
  const panel = document.querySelector(".y-spnav__panel");
  let open = false;
  const setMenu = (v) => {
    if (!trigger || open === v) return;
    open = v;
    panel.classList.toggle("is-open", v);
    panel.setAttribute("aria-hidden", String(!v));
    panel.inert = !v;
    trigger.setAttribute("aria-expanded", String(v));
    trigger.setAttribute("aria-label", v ? "Close Menu" : "Open Menu");
    if (YT.lenis) v ? YT.lenis.stop() : YT.lenis.start();
    document.documentElement.style.overflow = v ? "hidden" : "";
  };
  trigger?.addEventListener("click", () => setMenu(!open));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  matchMedia("(min-width: 1100px)").addEventListener("change", (e) => e.matches && setMenu(false));

  document.querySelectorAll("[data-nav]").forEach((a) =>
    a.addEventListener("click", (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = sameTarget(a);
      if (!target) return setMenu(false);
      e.preventDefault();
      if (location.hash !== a.hash) history.pushState(null, "", a.hash);
      if (open) {
        setMenu(false);
        requestAnimationFrame(() => requestAnimationFrame(() => scrollToEl(target)));
      } else scrollToEl(target);
    })
  );

  // ---------- Collapsible text: text clipped to two lines opens with READ MORE and folds with CLOSE (height .4s power2.out) ----------
  document.querySelectorAll("[data-accordion]").forEach((root) => {
    const btn = root.querySelector("[data-accordion-trigger]");
    const body = root.querySelector("[data-accordion-content]");
    if (!btn || !body) return;
    btn.addEventListener("click", () => {
      const willOpen = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(willOpen));
      btn.textContent = willOpen ? "CLOSE" : "READ MORE";
      const from = body.offsetHeight;
      body.classList.toggle("--expanded", willOpen);
      const to = body.offsetHeight;
      if (!willOpen) body.classList.add("--expanded");
      gsap.fromTo(body, { height: from }, {
        height: to, duration: reduced ? 0 : 0.4, ease: "power2.out", overwrite: true,
        onComplete: () => { body.classList.toggle("--expanded", willOpen); gsap.set(body, { height: "auto" }); ScrollTrigger.refresh(); },
      });
    });
  });

  // ---------- Reveal: when a group ([data-inview]) reaches 85% of the screen, its pieces rise in turn from 3rem below (photos 4rem) ----------
  const inviewRoot = document.querySelector("[data-inview-root]");
  if (inviewRoot && !reduced) {
    inviewRoot.classList.add("is-inview-ready");
    inviewRoot.querySelectorAll("[data-inview]").forEach((group) => {
      const tl = gsap.timeline({ defaults: { duration: 0.6, ease: "power2.out" }, scrollTrigger: { trigger: group, start: "top 85%", toggleActions: "play none none none" } });
      const items = group.matches("[data-inview-item]")
        ? [group]
        : [...group.querySelectorAll("[data-inview-item]")].filter((el) => !el.matches("[data-inview]") && el.parentElement.closest("[data-inview]") === group);
      items.forEach((el, i) => tl.to(el, { opacity: 1, y: 0 }, i * 0.16));
    });
  }

  // ---------- Subpage open: show the menu button immediately and light the body over .6s (on the first page it is the opening scene in index.js) ----------
  if (!home) {
    if (trigger) gsap.set(trigger, { opacity: 1 });
    gsap.fromTo(document.body, { opacity: 0 }, {
      opacity: 1, duration: reduced ? 0 : 0.6, ease: "power1.out",
      onComplete: () => gsap.set(document.body, { clearProps: "opacity" }),
    });
    document.body.classList.remove("is-page-loading");
  }

  const settle = () => {
    ScrollTrigger.refresh();
    const id = location.hash.slice(1);
    const el = id && id !== "top" && document.getElementById(decodeURIComponent(id));
    if (el) gsap.delayedCall(0.05, () => scrollToEl(el, true));
  };
  document.readyState === "complete" ? settle() : addEventListener("load", settle, { once: true });
})();
