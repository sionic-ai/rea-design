// Motion shared by all pages — skin button and motion button, loader (dot tunnel + counter), signal line, cursor brackets, text decoding and section heading drop-in,
// And the page transition. The original is a single-page app, so on transition it lifts a copy of the old page and the new page together onto a three.js CSS3D stage and moves them.
// To do the same, the copy also fetches the next html on link click and swaps only .page-plane (like barba), putting both on the same stage.
// What each page does lives in LQ.pages[name] = (main, { first }) => Register it with detach — it re-attaches even after being passed.
(() => {
  const root = document.documentElement;
  const LQ = (window.LQ = window.LQ || { pages: {} });
  const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
  const paused = () => root.dataset.motion === "paused";
  const still = () => paused() || reduceMQ.matches;
  const EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
  const MS = { fast: 160, base: 360, slow: 620, slower: 900 };
  const varOf = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  if (window.gsap && window.CustomEase) {
    gsap.registerPlugin(CustomEase);
    CustomEase.create("lqExpo", "0.16,1,0.3,1");
  }
  const smoother = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * t * (t * (6 * t - 15) + 10); };

  const PAGES = {
    home: { file: "index.html", order: 0, label: "First" },
    works: { file: "works.html", order: 1, label: "Work collection" },
    about: { file: "about.html", order: 2, label: "About" },
    news: { file: "news.html", order: 3, label: "Field notes" },
    article: { file: "article.html", order: 3.5, label: "Field notes" },
  };
  const fileOf = (u) => u.pathname.split("/").pop() || "index.html";
  const pageOf = (u) => Object.keys(PAGES).find((k) => PAGES[k].file === fileOf(u));
  const dirOf = (u) => u.pathname.slice(0, u.pathname.lastIndexOf("/") + 1);
  LQ.PAGES = PAGES;
  LQ.still = still;
  LQ.EXPO = EXPO;
  LQ.MS = MS;
  LQ.stream = { speed: 0 };

  try { if (localStorage.getItem("lq-motion") === "paused") root.dataset.motion = "paused"; } catch {}

  // ── Skin button: the original wipes open the new screen from the left over .9s with a view transition ──
  const setTheme = (t, save) => {
    root.dataset.theme = t;
    if (save) try { localStorage.setItem("lq-theme", t); } catch {}
    dispatchEvent(new Event("theme-change"));
  };
  const switchTheme = (t, save) => {
    if (!document.startViewTransition || reduceMQ.matches) return setTheme(t, save);
    root.setAttribute("data-theme-switching", "");
    document.startViewTransition(() => setTheme(t, save)).finished.finally(() => root.removeAttribute("data-theme-switching"));
  };
  matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
    let saved = null;
    try { saved = localStorage.getItem("lq-theme"); } catch {}
    if (!saved) switchTheme(e.matches ? "light" : "dark", false);
  });

  const syncMotionButtons = () => document.querySelectorAll(".motion-toggle").forEach((b) => {
    b.setAttribute("aria-pressed", paused() ? "true" : "false");
    const s = b.querySelector("[data-motion-state]");
    if (s) s.textContent = paused() ? "Pause" : "On";
  });

  // ── Text decode: characters lock into the original from the left while the rest swap to other symbols every 40ms (650ms) ──
  const POOL = "ABCDEFGHJKLMNPRSTUVXYZ0123456789#%&/<>+=";
  const KEEP = /[\s—·/.,:→←↗]/;
  function scramble(el, delay = 0, dur = 650) {
    const node = el.childNodes.length === 1 ? el.firstChild : null;
    if (!node || node.nodeType !== Node.TEXT_NODE) return () => {};
    const text = node.nodeValue || "";
    const noise = (k) => text.slice(0, k) + [...text.slice(k)].map((c) => (KEEP.test(c) ? c : POOL[Math.floor(Math.random() * POOL.length)])).join("");
    const t0 = performance.now() + delay;
    let raf = 0, tick = -1;
    const step = (now) => {
      const p = Math.min(1, Math.max(0, (now - t0) / dur)), f = Math.floor(now / 40);
      if (f !== tick || p === 1) { tick = f; node.nodeValue = p === 1 ? text : noise(Math.floor(p * text.length)); }
      if (p < 1) raf = requestAnimationFrame(step);
    };
    node.nodeValue = noise(0);
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); node.nodeValue = text; };
  }
  LQ.scramble = scramble;

  // ── Loader and handoff ──
  let handedOver = false;
  LQ.heroReady = new Promise((r) => (LQ.markHeroReady = r));
  const onHandover = (fn) => {
    if (handedOver || !document.querySelector(".preloader")) { fn(); return () => {}; }
    addEventListener("preloader-handover", fn, { once: true });
    return () => removeEventListener("preloader-handover", fn);
  };
  LQ.onHandover = onHandover;

  function startTunnel(host, get) {
    if (!window.THREE || !host) return () => {};
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); } catch { return () => {}; }
    const small = host.clientWidth < 768;
    renderer.setPixelRatio(Math.min(small ? 1.5 : 2, devicePixelRatio));
    host.append(renderer.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const N = small ? 1400 : 3600, DEPTH = 40;
    let seed = 20261031 >>> 0;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const pos = new Float32Array(N * 9), trail = new Float32Array(N * 3), size = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = rnd() * Math.PI * 2, r = 0.25 + rnd() ** 0.8 * 1.9;
      const p = [Math.cos(a) * r, Math.sin(a) * r * 0.75, rnd() * DEPTH], s = rnd() ** 3;
      for (let k = 0; k < 3; k++) { pos.set(p, (i * 3 + k) * 3); trail[i * 3 + k] = k; size[i * 3 + k] = s; }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aTrail", new THREE.BufferAttribute(trail, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -DEPTH / 2), DEPTH);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTravel: { value: 0 }, uStretch: { value: 0 }, uTime: { value: 0 }, uPx: { value: 1 }, uOpacity: { value: 1 }, uInk: { value: new THREE.Color() } },
      vertexShader: `
        uniform float uTravel, uStretch, uTime, uPx;
        attribute float aTrail, aSize;
        varying float vAlpha;
        void main() {
          float z = 1.5 - mod(position.z - uTravel + aTrail * uStretch + 40.0, 40.0);
          vec2 sway = vec2(sin(uTime * 0.3 + position.z), cos(uTime * 0.25 + position.z)) * 0.12;
          vec4 mv = modelViewMatrix * vec4(position.xy + sway, z, 1.0);
          float dist = max(0.2, -mv.z);
          float tail = aTrail < 0.5 ? 1.0 : (1.0 - aTrail * 0.38) * 0.7 * step(0.02, uStretch);
          float fade = clamp(1.3 - dist / 34.0, 0.0, 1.0) * smoothstep(1.5, 0.3, z);
          vAlpha = (0.75 + 0.25 * aSize) * tail * fade;
          gl_PointSize = max(1.3 * uPx, (1.1 + aSize * 1.5) * uPx * (5.5 / dist));
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform float uOpacity;
        uniform vec3 uInk;
        varying float vAlpha;
        void main() {
          float e = smoothstep(0.5, 0.3, length(gl_PointCoord - 0.5));
          if (e <= 0.0) discard;
          gl_FragColor = vec4(uInk, vAlpha * e * uOpacity);
        }`,
    });
    // Dark skin (white dots) is added so it brightens as it overlaps, while light skin lays dark dots straight on, as the original shows a flipped canvas
    const paintInk = () => {
      mat.uniforms.uInk.value.set(varOf("--kf-ink"));
      const c = mat.uniforms.uInk.value;
      mat.blending = c.r + c.g + c.b > 1.5 ? THREE.AdditiveBlending : THREE.NormalBlending;
      mat.needsUpdate = true;
    };
    paintInk();
    addEventListener("theme-change", paintInk);
    scene.add(new THREE.Points(geo, mat));
    const fit = () => {
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      cam.aspect = host.clientWidth / Math.max(1, host.clientHeight);
      cam.updateProjectionMatrix();
    };
    fit();
    addEventListener("resize", fit);
    const u = mat.uniforms;
    let raf = 0, last = performance.now(), v = 0;
    const loop = (now) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const st = get();
      v += (st.speed - v) * (1 - Math.exp(-4 * dt));
      u.uTravel.value += (0.6 + v * v * 30) * dt;
      u.uStretch.value = v * 0.22;
      u.uTime.value = now / 1000;
      u.uPx.value = renderer.getPixelRatio();
      u.uOpacity.value = st.opacity;
      cam.rotation.z = now / 12000;
      renderer.render(scene, cam);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", fit);
      removeEventListener("theme-change", paintInk);
      geo.dispose(); mat.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }

  function preloader() {
    const el = document.querySelector(".preloader");
    const hand = () => {
      el?.setAttribute("data-handover", "");
      if (!handedOver) { handedOver = true; dispatchEvent(new Event("preloader-handover")); }
    };
    if (!el) { hand(); return; }
    const page = root.dataset.page;
    const slate = el.querySelector(".preloader-slate");
    if (slate) slate.textContent = `00 — Collection · ${PAGES[page]?.label ?? "Signal"}`;
    const header = document.querySelector(".site-header");
    if (header) el.style.setProperty("--hud-top", `${header.getBoundingClientRect().bottom}px`);
    const d = still(), film = root.hasAttribute("data-cinematic") && !d;
    const st = { speed: 0, opacity: 1 };
    const stopTunnel = !d && !film ? startTunnel(el.querySelector(".preloader-tunnel"), () => st) : () => {};
    const waits = [
      document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true })),
      document.fonts?.ready ?? Promise.resolve(),
    ];
    if (page === "home") waits.push(LQ.heroReady);
    let got = 0, heroOk = false;
    waits.forEach((p) => p.catch(() => {}).then(() => got++));
    LQ.heroReady.then(() => (heroOk = true));
    const count = el.querySelector("[data-count]"), rate = el.querySelector("[data-rate]");
    const rateText = (b) => `${String(Math.round(120 + b * b * 4800)).padStart(4, "0")} ev/s`;
    const t0 = performance.now(), timers = [];
    let b = 0, doneAt = 0, raf = 0;
    const speed = (x) => { st.speed = x; LQ.stream.speed = x; };
    const stop = () => { stopTunnel(); cancelAnimationFrame(raf); timers.forEach(clearTimeout); speed(0); };
    const finish = () => { hand(); stop(); el.remove(); dispatchEvent(new Event("preloader-done")); };
    const complete = (now) => {
      doneAt = now;
      if (count) count.textContent = "100";
      el.setAttribute("data-done", "");
      if (d) { hand(); timers.push(setTimeout(finish, 200)); return; }
      timers.push(setTimeout(() => speed(0), 120), setTimeout(hand, 500), setTimeout(finish, 1100));
    };
    const loop = (now) => {
      if (doneAt) {
        st.opacity = 1 - Math.min(1, Math.max(0, (now - doneAt - 500) / 600));
        raf = requestAnimationFrame(loop);
        return;
      }
      const n = got / waits.length;
      b = Math.min(b + (n - b) * 0.12 + 0.002, n, (now - t0) / 1200);
      speed(b);
      if (count) count.textContent = String(Math.round(b * 100)).padStart(3, "0");
      if (rate) rate.textContent = rateText(b);
      if (b >= 1) complete(now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    timers.push(setTimeout(() => {
      if (doneAt) return;
      if (film && !heroOk) {
        root.removeAttribute("data-cinematic");
        dispatchEvent(new Event("cinematic-reveal"));
        try { sessionStorage.removeItem("lq-cinematic-seen"); } catch {}
      }
      document.hidden ? finish() : complete(performance.now());
    }, 6000));
  }

  // ── Signal line ──
  function signalLine() {
    const wrap = document.querySelector(".signal-line");
    if (!wrap) return;
    const track = wrap.querySelector(".signal-line-track"), packet = wrap.querySelector(".signal-line-packet"), readout = wrap.querySelector(".signal-line-readout");
    let marks = [], h = 0, raf = 0;
    const measure = () => {
      const H = root.scrollHeight;
      marks = [...document.querySelectorAll(".page-stage > .page-plane main :is(h1, h2)")].map((el) => (el.getBoundingClientRect().top + scrollY) / H);
      h = track.clientHeight;
      track.querySelectorAll(".signal-line-tick").forEach((t) => t.remove());
      marks.forEach((m) => {
        const t = document.createElement("span");
        t.className = "signal-line-tick";
        t.style.top = `${m * 100}%`;
        track.insertBefore(t, packet);
      });
    };
    const paint = () => {
      raf = 0;
      const room = root.scrollHeight - innerHeight;
      const p = room > 0 ? Math.min(1, Math.max(0, scrollY / room)) : 0;
      packet.style.transform = `translate3d(0, ${p * h}px, 0)`;
      readout.textContent = String(Math.round(p * 100)).padStart(3, "0");
      track.querySelectorAll(".signal-line-tick").forEach((t, i) => t.toggleAttribute("data-passed", (marks[i] ?? 1) <= p));
    };
    const ask = () => { raf ||= requestAnimationFrame(paint); };
    const refresh = () => { measure(); ask(); };
    refresh();
    new ResizeObserver(refresh).observe(document.body);
    addEventListener("scroll", ask, { passive: true });
    addEventListener("page-settled", refresh);
  }

  // ── Cursor brackets: attach 6px off links · buttons · list rows (.36s), otherwise follow around the cursor (.16s) ──
  function brackets() {
    const box = document.querySelector(".cursor-brackets");
    if (!box || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const marks = ["tl", "tr", "bl", "br"].map((k) => box.querySelector(`.cursor-bracket-${k}`));
    if (marks.some((m) => !m)) return;
    const TARGETS = [".work-row", ".contact-row", ".note-row", "a", 'button:not([aria-disabled="true"])'];
    const GAP = 6, SIZE = 10;
    let x = -100, y = -100, raf = 0, target = null, inside = false;
    const paint = () => {
      raf = 0;
      const r = target?.getBoundingClientRect();
      marks.forEach((m, i) => {
        const [v, hz] = ["tl", "tr", "bl", "br"][i];
        const left = hz === "l", top = v === "t";
        const px = r ? (left ? r.left - GAP : r.right + GAP - SIZE) : x + (left ? -12 : 2);
        const py = r ? (top ? r.top - GAP : r.bottom + GAP - SIZE) : y + (top ? -12 : 2);
        m.style.transform = `translate3d(${px}px, ${py}px, 0)`;
        m.dataset.state = inside ? (r ? "snap" : "idle") : "";
      });
    };
    const ask = () => { raf ||= requestAnimationFrame(paint); };
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY; inside = true;
      const t = e.target instanceof Element ? e.target : null;
      target = null;
      for (const s of TARGETS) { const hit = t?.closest(s); if (hit) { target = hit; break; } }
      ask();
    }, { passive: true });
    addEventListener("scroll", ask, { passive: true });
    root.addEventListener("pointerleave", () => { inside = false; target = null; ask(); });
  }

  // ── Lower blocks and section header entrance ──
  const SEL = [
    "main > section:not(.hero) > :is(div, p, dl):not(.work-index):not(:has(.group))",
    "main > :is(section, article) > :is(ul, ol) > li",
    ".work-row",
    "#expertise .group",
  ].join(", ");
  function reveal(first) {
    if (still() || typeof Element.prototype.animate !== "function") { root.removeAttribute("data-arriving"); return () => {}; }
    const anims = new Set(), undo = new Set();
    const play = (el, kf, dur, delay = 0) => {
      const a = el.animate(kf, { duration: dur, delay, easing: EXPO, fill: "backwards" });
      anims.add(a);
      a.onfinish = () => anims.delete(a);
    };
    const chapter = (el, d = 0) => el.querySelectorAll("[data-chapter-line]").forEach((l, n) => {
      l.style.removeProperty("transform");
      play(l, [{ transform: "translateY(-105%)" }, { transform: "translateY(0)" }], MS.slower, d + n * 130);
    });
    const decode = (el, d = 0) => { el.style.removeProperty("opacity"); undo.add(scramble(el, d)); };
    let io = null, raf = 0;
    const run = () => {
      if (first && root.hasAttribute("data-cinematic")) { addEventListener("cinematic-reveal", run, { once: true }); return; }
      const main = document.querySelector(".page-stage > .page-plane main");
      if (!main) return;
      if (first && root.dataset.page === "home" && scrollY <= 80 && !location.hash) {
        main.querySelectorAll("[data-intro-line]").forEach((l, i) => play(l, [{ transform: "translateY(-105%)" }, { transform: "translateY(0)" }], MS.slower, 90 + i * 130));
        main.querySelectorAll("[data-intro-support]").forEach((l, i) => play(l, [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }], MS.slow, 300 + i * 90));
      }
      io = new IntersectionObserver((list) => {
        for (const e of list) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          if (e.target.hasAttribute("data-chapter")) { chapter(e.target); continue; }
          if (e.target.hasAttribute("data-decode")) { decode(e.target); continue; }
          const ruled = parseFloat(getComputedStyle(e.target).borderTopWidth) > 0;
          play(e.target, ruled
            ? [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }]
            : [{ opacity: 0.35, transform: "translateY(14px)" }, { opacity: 1, transform: "translateY(0)" }], MS.slow);
        }
      }, { threshold: 0, rootMargin: "0px 0px -36px 0px" });
      const below = (el) => el.getBoundingClientRect().top >= innerHeight;
      main.querySelectorAll("[data-chapter]").forEach((el) => {
        if (!below(el)) return chapter(el, 60);
        el.querySelectorAll("[data-chapter-line]").forEach((l) => (l.style.transform = "translateY(-105%)"));
        io.observe(el);
      });
      main.querySelectorAll("[data-decode]").forEach((el) => {
        if (!below(el)) return decode(el, 120);
        el.style.opacity = "0";
        io.observe(el);
      });
      root.removeAttribute("data-arriving");
      main.parentElement.querySelectorAll(SEL).forEach((el) => { if (el.classList.contains("work-row") || below(el)) io.observe(el); });
    };
    let off = () => {};
    if (first) off = onHandover(() => (raf = requestAnimationFrame(run)));
    else addEventListener("page-settled", run, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("page-settled", run);
      removeEventListener("cinematic-reveal", run);
      off();
      io?.disconnect();
      anims.forEach((a) => a.cancel());
      undo.forEach((f) => f());
      document.querySelectorAll("[data-chapter-line]").forEach((l) => l.style.removeProperty("transform"));
      document.querySelectorAll("[data-decode]").forEach((l) => l.style.removeProperty("opacity"));
    };
  }

  // ── Award badge: move the corner badge aside when the footer shows ──
  let badgeIO = null;
  function badgeAway() {
    badgeIO?.disconnect();
    const badge = document.querySelector(".award-badge-corner"), foot = document.querySelector(".page-stage > .page-plane .site-footer");
    if (!badge || !foot) return;
    badgeIO = new IntersectionObserver(([e]) => badge.toggleAttribute("data-away", e?.isIntersecting ?? false));
    badgeIO.observe(foot);
  }

  // ── Phone menu ──
  function openMenu(btn) {
    if (document.querySelector(".mobile-menu")) return;
    const here = root.dataset.page === "article" ? "news" : root.dataset.page;
    const items = [["home", "Home"], ["works", "Work"], ["about", "About"], ["news", "Notes"]];
    const m = document.createElement("div");
    m.className = "mobile-menu page-gutter";
    m.id = "mobile-menu";
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    m.setAttribute("aria-label", "Menu");
    m.innerHTML = `
      <div class="mobile-menu-bar"><span class="eyebrow muted">Contents · Chapter 00</span>
        <button type="button" class="menu-button eyebrow" aria-expanded="true" aria-controls="mobile-menu" data-close>Close <span class="menu-glyph menu-glyph-close" aria-hidden="true"></span></button></div>
      <nav class="mobile-menu-nav" aria-label="Main menu"><ol>${items.map(([k, t], i) => `
        <li style="--i:${i}"><a class="mobile-menu-link" href="${PAGES[k].file}"${k === here ? ' aria-current="page"' : ""}>
          <span class="eyebrow mobile-menu-n">${String(i).padStart(2, "0")}</span>
          <span class="mobile-menu-mask"><span class="mobile-menu-label">${t}.</span></span></a></li>`).join("")}</ol></nav>
      <div class="mobile-menu-foot"><span class="mobile-menu-socials" style="display:flex;gap:24px">
        <a class="eyebrow editorial-link" href="#">Link 1 ↗</a><a class="eyebrow editorial-link" href="#">Link 2 ↗</a></span>
        <button type="button" class="theme-toggle eyebrow"><span class="theme-toggle-glyph" aria-hidden="true"></span><span class="theme-toggle-dark">Darken</span><span class="theme-toggle-light">Brighter</span></button></div>`;
    document.body.append(m);
    btn?.setAttribute("aria-expanded", "true");
    const close = () => { m.remove(); btn?.setAttribute("aria-expanded", "false"); removeEventListener("keydown", esc); };
    const esc = (e) => e.key === "Escape" && close();
    addEventListener("keydown", esc);
    m.addEventListener("click", (e) => { if (e.target.closest("[data-close], .mobile-menu-link")) close(); });
    m.querySelector("[data-close]").focus();
  }

  // ── Page-turn stage (three.js CSS3D + line and dot overlay) ──
  const DEPTH_T = { outgoing: 0.22, departureStart: 0.22, departure: 0.22, outgoingFadeDelay: 0.08, outgoingFade: 0.14, arrivalStart: 0.44, incomingArrival: 0.2, approachStart: 0.64, incoming: 0.24 };
  const CUT_LABELS = ["01 — Start", "02 — Work collection", "03 — About", "04 — Field notes", "05 — Contact", "06 — Menu 6"];
  function createDepth(host) {
    const scene = new THREE.Scene(), overlay = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 1, 20000);
    const css3d = new THREE.CSS3DRenderer();
    host.append(css3d.domElement);
    const DIST = 1100;
    let gl = null, objs = [], ticks = [], disposers = [], restore = null;
    const size = () => {
      camera.aspect = innerWidth / innerHeight;
      camera.fov = (2 * Math.atan(innerHeight / (2 * DIST)) * 180) / Math.PI;
      camera.position.set(0, 0, DIST);
      camera.rotation.set(0, 0, 0);
      camera.updateProjectionMatrix();
      css3d.setSize(innerWidth, innerHeight);
      gl?.setSize(innerWidth, innerHeight);
      objs.forEach((o) => { if (o.element.classList.contains("scene-page-frame")) { o.element.style.width = `${innerWidth}px`; o.element.style.height = `${innerHeight}px`; } });
      css3d.render(scene, camera);
    };
    const reset = () => {
      restore?.(); restore = null;
      objs.forEach((o) => { o.parent?.remove(o); o.element.remove(); });
      objs = []; ticks = [];
      disposers.forEach((f) => f()); disposers = [];
      overlay.clear(); scene.clear();
      if (gl) { gl.clear(); gl.domElement.hidden = true; }
      camera.position.set(0, 0, DIST); camera.rotation.set(0, 0, 0);
      host.hidden = true;
      host.removeAttribute("data-depth-phase"); host.removeAttribute("data-cut");
    };
    const wrap = (plane, ghost) => {
      reset();
      const parent = plane.parentNode, next = plane.nextSibling;
      const inF = document.createElement("div"), outF = document.createElement("div");
      inF.className = outF.className = "scene-page-frame";
      ghost.classList.remove("outgoing-page");
      ghost.style.position = "absolute"; ghost.style.left = "0";
      outF.append(ghost); inF.append(plane);
      plane.style.removeProperty("transform"); plane.style.opacity = "1";
      restore = () => { parent.insertBefore(plane, next?.parentNode === parent ? next : null); plane.style.removeProperty("opacity"); };
      const previous = new THREE.CSS3DObject(outF), incoming = new THREE.CSS3DObject(inF);
      scene.add(previous, incoming);
      objs = [previous, incoming];
      host.hidden = false;
      size();
      return { previous, incoming, outgoingFrame: outF, incomingFrame: inF };
    };
    const render = () => { css3d.render(scene, camera); if (gl && !gl.domElement.hidden) gl.render(overlay, camera); };
    addEventListener("resize", size);
    host.hidden = true;

    // Layer tools — line bundles, moving dots, four corners of a rectangle
    const inkColor = () => new THREE.Color(varOf("--kf-ink"));
    const lines = (ctx, pts, opacity = 0.4, loop = false) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
      const m = new THREE.LineBasicMaterial({ color: ctx.ink, transparent: true, opacity });
      ctx.dispose(() => { g.dispose(); m.dispose(); });
      return { object: loop ? new THREE.LineLoop(g, m) : new THREE.LineSegments(g, m), material: m, geometry: g };
    };
    const dots = (ctx, n, px = 5, opacity = 1) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
      const m = new THREE.PointsMaterial({ color: ctx.ink, size: px * ctx.pixelRatio, sizeAttenuation: false, transparent: true, opacity });
      ctx.dispose(() => { g.dispose(); m.dispose(); });
      const a = g.getAttribute("position");
      return { object: new THREE.Points(g, m), material: m, set: (i, x, y, z) => a.setXYZ(i, x, y, z), commit: () => (a.needsUpdate = true) };
    };
    const rect = (w, h, z) => [-w / 2, -h / 2, z, w / 2, -h / 2, z, w / 2, h / 2, z, -w / 2, h / 2, z];
    const corners = (w, h, z, len) => {
      const out = [];
      for (const [sx, sy] of [[-1, 1], [1, 1], [1, -1], [-1, -1]]) {
        const x = (sx * w) / 2, y = (sy * h) / 2;
        out.push(x, y, z, x - sx * len, y, z, x, y, z, x, y - sy * len, z);
      }
      return out;
    };
    const fade = (ctx, el, to, at, dur) => ctx.timeline.to(el, { autoAlpha: to, duration: dur, ease: "power1.inOut" }, at);
    const hinge = (o, h, floor, z, a) => { o.rotation.x = -a; o.position.y = floor + (h / 2) * Math.cos(a); o.position.z = z - (h / 2) * Math.sin(a); };

    // To the Work collection: the old section tips over onto the floor and the camera flies along six rows above the floor to stand before the new section rising far away
    const toWorks = (c) => {
      const { timeline: tl, w, h, previous, incoming, incomingFrame, outgoingFrame } = c;
      const floor = -h / 2, far = -4600, ang = { out: 0, in: Math.PI / 2 };
      hinge(previous, h, floor, 0, 0); hinge(incoming, h, floor, far, ang.in);
      incomingFrame.style.opacity = "0"; incomingFrame.style.visibility = "hidden";
      const lanes = [-0.46, -0.3, -0.14, 0.14, 0.3, 0.46].map((k) => k * w);
      const seg = [];
      lanes.forEach((x) => seg.push(x, floor, 900, x, floor, -7600));
      const ln = lines(c, seg, 0), pk = dots(c, lanes.length * 6, 5, 0);
      c.overlay.add(ln.object, pk.object);
      tl.to(ang, { out: Math.PI / 2, duration: 0.6, ease: "power2.in" }, 0);
      fade(c, outgoingFrame, 0, 0.42, 0.22);
      tl.to(ln.material, { opacity: 0.35, duration: 0.3 }, 0.38);
      tl.to(pk.material, { opacity: 1, duration: 0.2 }, 0.45);
      tl.to(camera.position, { z: far + DIST, duration: 1.25, ease: "power3.inOut" }, 0.35);
      fade(c, incomingFrame, 1, 0.95, 0.2);
      tl.to(ang, { in: 0, duration: 0.6, ease: "power3.out" }, 1);
      tl.to([ln.material, pk.material], { opacity: 0, duration: 0.2 }, 0.85);
      tl.to({}, { duration: 0.01 }, 1.6);
      c.tick((t) => {
        hinge(previous, h, floor, 0, ang.out); hinge(incoming, h, floor, far, ang.in);
        lanes.forEach((x, r) => { for (let i = 0; i < 6; i++) pk.set(r * 6 + i, x, floor, 600 - ((t * 5200 + i * 900 + r * 310) % 5400) + camera.position.z - DIST); });
        pk.commit();
      });
    };
    // To About: the camera pulls back and steps aside, and two sections flip half a turn like a back-to-back card
    const toAbout = (c) => {
      const { timeline: tl, w, h, previous, incoming } = c;
      const card = new THREE.Group();
      scene.remove(previous, incoming); card.add(previous, incoming); scene.add(card);
      incoming.rotation.y = Math.PI; incoming.position.z = -1;
      const frame = new THREE.Group();
      const ticksL = lines(c, corners(w + 56, h + 56, 0, Math.min(w, h) * 0.08), 0);
      const scan = lines(c, [-w / 2 - 28, 0, 1, w / 2 + 28, 0, 1], 0);
      const box = lines(c, rect(w, h, 0.5), 0, true);
      frame.add(ticksL.object, scan.object, box.object);
      c.overlay.add(frame);
      tl.to(camera.position, { z: DIST * 2.7, duration: 0.6, ease: "power2.inOut" }, 0);
      tl.to(camera.position, { x: -w * 0.18, duration: 0.6, ease: "power2.inOut" }, 0);
      tl.to(ticksL.material, { opacity: 0.9, duration: 0.25 }, 0.25);
      tl.to(box.material, { opacity: 0.35, duration: 0.25 }, 0.2);
      tl.to(scan.material, { opacity: 0.8, duration: 0.1 }, 0.3);
      tl.fromTo(scan.object.position, { y: h / 2 }, { y: -h / 2, duration: 0.45, ease: "power1.inOut" }, 0.3);
      tl.to(scan.material, { opacity: 0, duration: 0.1 }, 0.7);
      tl.to(card.rotation, { y: Math.PI, duration: 0.8, ease: "power3.inOut" }, 0.55);
      tl.to(card.rotation, { x: 0.14, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0.55);
      tl.to(camera.position, { z: DIST, x: 0, duration: 0.6, ease: "power3.inOut" }, 1.05);
      tl.to([ticksL.material, box.material], { opacity: 0, duration: 0.25 }, 1.2);
      c.tick(() => frame.rotation.copy(card.rotation));
    };
    // To Field Notes: the old section is cut into eight strips that fly off to the back right in turn, and the new section enters diagonally from deep on the left.
    const toNews = (c) => {
      const { timeline: tl, w, h, previous, incoming, incomingFrame, outgoingFrame } = c;
      const band = h / 8;
      scene.remove(previous);
      const strips = Array.from({ length: 8 }, (_, n) => {
        const copy = outgoingFrame.cloneNode(true), top = (n * 100) / 8;
        copy.style.clipPath = `inset(${top}% 0 ${100 - top - 100 / 8}% 0)`;
        const s = c.add(new THREE.CSS3DObject(copy));
        scene.add(s);
        return { strip: s, copy };
      });
      incoming.position.set(-w * 1.15, 0, -900); incoming.rotation.y = 0.35;
      incomingFrame.style.opacity = "0"; incomingFrame.style.visibility = "hidden";
      const rows = Array.from({ length: 7 }, (_, t) => h / 2 - band * (t + 1));
      const ln = lines(c, rows.flatMap((y) => [-w / 2, y, 1, w * 1.6, y, 1]), 0), pk = dots(c, rows.length * 4, 5, 0);
      c.overlay.add(ln.object, pk.object);
      tl.to(ln.material, { opacity: 0.3, duration: 0.15 }, 0);
      tl.to(pk.material, { opacity: 1, duration: 0.15 }, 0.05);
      strips.forEach(({ strip, copy }, i) => {
        const at = 0.08 + i * 0.045;
        tl.to(strip.position, { x: w * 1.3, z: -350 - (i % 3) * 140, duration: 0.6, ease: "power3.in" }, at);
        tl.to(strip.rotation, { y: -0.28, duration: 0.6, ease: "power2.in" }, at);
        tl.to(copy, { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, at + 0.42);
      });
      tl.to([ln.material, pk.material], { opacity: 0, duration: 0.2 }, 0.62);
      fade(c, incomingFrame, 1, 0.6, 0.25);
      tl.to(incoming.position, { x: 0, z: 0, duration: 0.85, ease: "power3.out" }, 0.62);
      tl.to(incoming.rotation, { y: 0, duration: 0.85, ease: "power3.out" }, 0.62);
      c.tick((t) => {
        rows.forEach((y, r) => { for (let i = 0; i < 4; i++) pk.set(r * 4 + i, -w / 2 + ((t * 3400 + (w / 2) * i + r * 230) % (w * 2.1)), y, 1); });
        pk.commit();
      });
    };
    // Back to start: the camera flies through five section frames (labeled with section names) and stops in front of the first page at the very back
    const toHome = (c) => {
      const { timeline: tl, w, h, incoming, outgoingFrame } = c;
      const step = 1100, far = -6 * step;
      incoming.position.z = far;
      const boxes = lines(c, Array.from({ length: 5 }, (_, t) => rect(w, h, -(t + 1) * step)).flat(), 0);
      boxes.geometry.setIndex(Array.from({ length: 5 }, (_, t) => { const n = t * 4; return [n, n + 1, n + 1, n + 2, n + 2, n + 3, n + 3, n]; }).flat());
      const ticksL = lines(c, Array.from({ length: 5 }, (_, t) => corners(w + 40, h + 40, -(t + 1) * step, 36)).flat(), 0);
      c.overlay.add(boxes.object, ticksL.object);
      const labels = Array.from({ length: 5 }, (_, i) => {
        const el = document.createElement("div");
        el.className = "cut-label";
        el.textContent = CUT_LABELS[5 - i];
        const o = c.add(new THREE.CSS3DObject(el));
        o.position.set(-w / 2 + 120, h / 2 + 34, -(i + 1) * step);
        scene.add(o);
        el.style.opacity = "0";
        return { o, el };
      });
      fade(c, outgoingFrame, 0, 0.05, 0.25);
      tl.to([boxes.material, ticksL.material], { opacity: 0.5, duration: 0.25 }, 0.1);
      tl.to(labels.map((l) => l.el), { opacity: 1, duration: 0.25 }, 0.15);
      tl.to(camera.position, { z: far + DIST, duration: 1.55, ease: "power3.inOut" }, 0.1);
      tl.to([boxes.material, ticksL.material], { opacity: 0, duration: 0.25 }, 1.4);
      c.tick(() => labels.forEach(({ o, el }) => (el.style.visibility = camera.position.z - o.position.z < 260 ? "hidden" : "")));
    };
    const CUTS = { works: toWorks, about: toAbout, news: toNews, home: toHome };

    return {
      reset,
      start(plane, ghost, dir, done) {
        const { previous, incoming, incomingFrame, outgoingFrame } = wrap(plane, ghost);
        const w = innerWidth, Z = -950, S = 0.82, T = DEPTH_T;
        incoming.position.set(w * dir * 1.5, 0, Z);
        incoming.scale.setScalar(S);
        incomingFrame.style.opacity = "0"; incomingFrame.style.visibility = "hidden";
        render();
        const tl = gsap.timeline({ onUpdate: render, onComplete: done });
        const phase = (p) => () => host.setAttribute("data-depth-phase", p);
        host.setAttribute("data-depth-phase", "retreat");
        tl.to(previous.position, { x: 0, z: Z, duration: T.outgoing, ease: smoother }, 0)
          .to(previous.scale, { x: S, y: S, z: S, duration: T.outgoing, ease: smoother }, 0)
          .call(phase("hold"), [], T.outgoing)
          .call(phase("depart"), [], T.departureStart)
          .to(previous.position, { x: -w * dir * 1.5, duration: T.departure, ease: "power3.in" }, T.departureStart)
          .to(outgoingFrame, { autoAlpha: 0, duration: T.outgoingFade, ease: "power1.in" }, T.departureStart + T.outgoingFadeDelay)
          .call(phase("arrive"), [], T.arrivalStart)
          .to(incomingFrame, { autoAlpha: 1, duration: T.incomingArrival * 0.7, ease: "power2.out" }, T.arrivalStart)
          .to(incoming.position, { x: 0, duration: T.incomingArrival, ease: "power3.out" }, T.arrivalStart)
          .call(phase("hold-incoming"), [], T.arrivalStart + T.incomingArrival)
          .call(phase("approach"), [], T.approachStart)
          .to(incoming.position, { z: 0, duration: T.incoming, ease: smoother }, T.approachStart)
          .to(incoming.scale, { x: 1, y: 1, z: 1, duration: T.incoming, ease: smoother }, T.approachStart);
        return tl;
      },
      hasCut: (name) => name in CUTS,
      cut(name, plane, ghost, done) {
        const parts = wrap(plane, ghost);
        if (!gl) {
          gl = new THREE.WebGLRenderer({ alpha: true, antialias: true });
          gl.setPixelRatio(Math.min(2, devicePixelRatio || 1));
          gl.setSize(innerWidth, innerHeight);
          gl.domElement.className = "depth-scene-gl";
          host.append(gl.domElement);
        }
        gl.domElement.hidden = false;
        host.setAttribute("data-cut", name);
        const tl = gsap.timeline({ onUpdate: () => { const t = tl.time(); ticks.forEach((f) => f(t)); render(); }, onComplete: done });
        CUTS[name]({ ...parts, timeline: tl, w: innerWidth, h: innerHeight, overlay, ink: inkColor(), pixelRatio: gl.getPixelRatio(),
          add: (o) => (objs.push(o), o), tick: (f) => ticks.push(f), dispose: (f) => disposers.push(f) });
        ticks.forEach((f) => f(0));
        render();
        return tl;
      },
    };
  }

  // ── Page swap ──
  let current = null, busy = null, depth = null, token = 0, cutNext = false, historyIndex = 0;
  const stage = () => document.querySelector(".page-stage");
  const plane = () => document.querySelector(".page-stage > .page-plane");
  function mount(first) {
    const name = root.dataset.page;
    const main = plane()?.querySelector("main");
    const stops = [reveal(first)];
    const fn = LQ.pages[name];
    if (fn && main) stops.push(fn(main, { first }) || (() => {}));
    current = { name, stop: () => stops.forEach((f) => f()) };
    badgeAway();
    syncMotionButtons();
  }
  const settled = () => {
    dispatchEvent(new Event("page-settled"));
    const h1 = plane()?.querySelector("main h1");
    if (h1) {
      h1.setAttribute("tabindex", "-1");
      h1.focus({ preventScroll: true });
      h1.addEventListener("blur", () => h1.removeAttribute("tabindex"), { once: true });
    }
  };
  const loadCss = (href) => new Promise((ok) => {
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.href = href;
    l.onload = l.onerror = () => ok();
    document.head.append(l);
  });
  const loadJs = (src) => new Promise((ok) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = s.onerror = () => ok();
    document.body.append(s);
  });
  async function bringAssets(doc, base) {
    const have = new Set([...document.querySelectorAll("link[rel=stylesheet]")].map((l) => l.href));
    await Promise.all([...doc.querySelectorAll("link[rel=stylesheet]")].map((l) => new URL(l.getAttribute("href"), base).href).filter((h) => !have.has(h)).map(loadCss));
    const ran = new Set([...document.querySelectorAll("script[src]")].map((s) => s.src));
    for (const s of doc.querySelectorAll("script[src]")) {
      const src = new URL(s.getAttribute("src"), base).href;
      if (!ran.has(src)) await loadJs(src);
    }
  }
  const cache = new Map();
  const fetchPage = (url) => {
    const key = url.href.split("#")[0];
    if (!cache.has(key)) cache.set(key, fetch(key).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); }));
    return cache.get(key);
  };
  const cleanStage = () => {
    cancelAnimationFrame(cleanStage.raf);
    busy?.kill(); busy = null;
    depth?.reset();
    const gh = document.querySelector(".ghost-host");
    gh?.replaceChildren(); gh?.style.removeProperty("z-index");
    const p = plane();
    if (p) { p.style.removeProperty("transform"); p.style.removeProperty("opacity"); p.inert = false; }
    stage()?.removeAttribute("data-page-transition");
  };
  async function go(url, { cut = false, direction, push = true } = {}) {
    const to = pageOf(url), from = root.dataset.page;
    const my = ++token;
    if (busy) busy.progress(1);
    let html;
    try { html = await fetchPage(url); } catch { location.href = url.href; return; }
    if (my !== token) return;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const next = doc.querySelector(".page-plane");
    if (!next) { location.href = url.href; return; }
    await bringAssets(doc, url);
    if (my !== token) return;
    cleanStage();
    const dir = direction ?? (PAGES[to].order < PAGES[from].order ? -1 : 1);
    const p = plane(), ghostHost = document.querySelector(".ghost-host");
    const moving = !still() && !!window.gsap && !!window.THREE?.CSS3DRenderer;
    if (moving) {
      document.getAnimations().forEach((a) => { const t = a.effect?.target; if (t && p.contains(t)) a.cancel(); });
      dispatchEvent(new Event("canvas-snapshot"));
      const ghost = p.cloneNode(true);
      ghost.removeAttribute("id");
      ghost.querySelectorAll("[id]").forEach((e) => e.removeAttribute("id"));
      ghost.setAttribute("aria-hidden", "true");
      ghost.inert = true;
      ghost.classList.add("outgoing-page");
      ghost.style.top = `${-scrollY}px`;
      const live = p.querySelectorAll("canvas");
      ghost.querySelectorAll("canvas").forEach((c, i) => {
        const src = live[i];
        if (!src) return;
        const img = document.createElement("img");
        try { img.src = src.toDataURL(); } catch {}
        img.style.cssText = src.style.cssText;
        img.className = src.className;
        img.width = src.clientWidth; img.height = src.clientHeight;
        c.replaceWith(img);
      });
      ghostHost.append(ghost);
      ghostHost.style.zIndex = "3";
      root.setAttribute("data-arriving", "");
    }
    current?.stop();
    p.replaceChildren(...[...next.childNodes].map((n) => document.importNode(n, true)));
    root.dataset.page = to;
    document.title = doc.title;
    if (push) history.pushState({ lqIndex: ++historyIndex }, "", url.href);
    scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (moving) gsap.set(p, { opacity: 0 });
    mount(false);
    if (!moving) { settled(); return; }
    cleanStage.raf = requestAnimationFrame(() => {
      if (my !== token) return;
      depth ||= createDepth(document.querySelector(".depth-scene"));
      const ghost = ghostHost.firstElementChild;
      if (!ghost) { cleanStage(); settled(); return; }
      stage().setAttribute("data-page-transition", dir > 0 ? "forward" : "backward");
      p.inert = true;
      const done = () => { busy = null; cleanStage(); settled(); };
      busy = cut && depth.hasCut(to) ? depth.cut(to, p, ghost, done) : depth.start(p, ghost, dir, done);
    });
  }

  document.addEventListener("click", (e) => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    if (t.closest(".theme-toggle")) { switchTheme(root.dataset.theme === "light" ? "dark" : "light", true); return; }
    if (t.closest(".motion-toggle")) {
      if (paused()) delete root.dataset.motion; else root.dataset.motion = "paused";
      try { localStorage.setItem("lq-motion", paused() ? "paused" : "live"); } catch {}
      syncMotionButtons();
      dispatchEvent(new Event("motion-change"));
      return;
    }
    if (t.closest(".site-header .menu-button")) { openMenu(t.closest(".menu-button")); return; }
    if (t.closest(".back-top")) { scrollTo({ top: 0, behavior: still() ? "auto" : "smooth" }); return; }
    const a = t.closest("a[href]");
    if (!a || a.target || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const url = new URL(a.getAttribute("href"), location.href);
    if (url.origin !== location.origin || dirOf(url) !== dirOf(location) || !pageOf(url)) return;
    if (pageOf(url) === root.dataset.page && url.hash) return;
    e.preventDefault();
    if (pageOf(url) === root.dataset.page) { scrollTo({ top: 0, behavior: "smooth" }); return; }
    go(url, { cut: a.classList.contains("next-chapter-link") || cutNext });
    cutNext = false;
  });
  addEventListener("popstate", (e) => {
    const url = new URL(location.href);
    if (!pageOf(url) || pageOf(url) === root.dataset.page) return;
    const idx = e.state?.lqIndex ?? 0;
    const dir = idx < historyIndex ? -1 : 1;
    historyIndex = idx;
    go(url, { push: false, direction: dir });
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && busy) busy.progress(1); });
  addEventListener("pointerdown", () => busy?.progress(1), true);
  // When a person lingers on a link, prefetch the next page
  document.addEventListener("pointerover", (e) => {
    const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
    if (!a || a.target) return;
    const url = new URL(a.getAttribute("href"), location.href);
    // The original prefetches route code so it switches the instant you click — the copy also fetches the next section’s css and js on hover
    if (url.origin === location.origin && dirOf(url) === dirOf(location) && pageOf(url) && pageOf(url) !== root.dataset.page)
      fetchPage(url).then((html) => bringAssets(new DOMParser().parseFromString(html, "text/html"), url)).catch(() => {});
  });

  const boot = () => {
    history.replaceState({ lqIndex: 0 }, "");
    syncMotionButtons();
    preloader();
    signalLine();
    brackets();
    mount(true);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else setTimeout(boot);
})();
