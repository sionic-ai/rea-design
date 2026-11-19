/* Brand site shared set — header · menu panel · loader/transition curtain · cursor tag · sound button · footer · Lenis.
   Values read from the original bundle: Lenis lerp .16 · wheel .72 · touch 1.5, curves editorial(.65,.05,.36,1) · reveal(.16,1,.3,1) · ui(.4,0,.2,1). */
(() => {
  const JJ = (window.JJ = window.JJ || {});
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const page = document.body.dataset.page || "home";
  const EASE = { editorial: "0.65,0.05,0.36,1", ui: "0.4,0,0.2,1", cover: "0.85,0,0.15,1", reveal: "0.16,1,0.3,1" };
  if (window.CustomEase) gsap.registerPlugin(CustomEase);
  gsap.registerPlugin(ScrollTrigger);
  JJ.ease = (name) => {
    if (!window.CustomEase) return name === "reveal" ? "expo.out" : "power2.inOut";
    const id = "jj-" + name;
    return CustomEase.get(id) || CustomEase.create(id, "M0,0 C" + EASE[name] + " 1,1");
  };
  JJ.reduce = reduce;
  JJ.fine = fine;
  JJ.css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  // Resolve skin variables (including calc expressions like oklch(from var(...))) into rgb that canvas and Lottie can read
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  JJ.rgb = (value) => {
    const probe = document.createElement("i");
    probe.style.color = value;
    probe.style.display = "none";
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = c;
    px.fillRect(0, 0, 1, 1);
    const d = px.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  JJ.color = (name) => `rgb(${JJ.rgb(`var(${name})`).join(",")})`;

  // ── Paper grain: instead of the original paper texture, bake gray grains once onto a canvas ──
  (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 220;
    const x = c.getContext("2d"), img = x.createImageData(220, 220);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 96 + Math.random() * 64;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    document.documentElement.style.setProperty("--jj-grain-url", `url(${c.toDataURL()})`);
  })();

  const LOGO = `<svg viewBox="0 0 40 44" aria-hidden="true"><path fill="currentColor" d="M20 1 31.5 24h-6.6L20 14.2 15.1 24H8.5Z"/><path fill="currentColor" d="M6.5 27.5h12.2L12 42.5Z"/><path fill="currentColor" d="M21.3 27.5h12.2L28 42.5Z"/></svg>`;
  JJ.LOGO = LOGO;
  const SOCIAL = {
    "Social Media": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".9" fill="currentColor"/></svg>`,
    "X": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4l14 16M19 4 5 20"/></svg>`,
    "Tick-tock": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 4v11a3.5 3.5 0 1 1-3.5-3.5"/><path d="M13 4c.5 2.6 2.4 4.3 5 4.5"/></svg>`,
    "Video": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="18" height="12" rx="4"/><path d="M10.5 9.5v5l4-2.5Z" fill="currentColor"/></svg>`,
  };
  // The menu uses a Latin title typeface like the original so the placeholder text is English — page names match the large text in the about·works headers
  const LINKS = [
    ["Home", "index.html", "home"], ["Game Day", "about.html", "about"], ["Off-Duty", "works.html", "works"], ["Foundation", "index.html#foundation", ""],
    ["Partners", "index.html#partnerships", ""], ["Journal", "news.html", "news"], ["Contact", "index.html#footer", ""],
  ];
  const linkHtml = (l, i) =>
    `<a class="menu-link" href="${l[1]}" style="transition-delay:var(--d-${i})"${l[2] === page ? ' aria-current="page"' : ""}><span class="menu-link-lift"><span>${l[0]}</span>${l[2] === page ? "" : `<span class="menu-link-fill" aria-hidden="true">${l[0]}</span>`}</span></a>`;
  const socials = (cls) => Object.entries(SOCIAL).map(([k, v]) => `<li><a class="jj-social" href="#" aria-label="${k}" data-sfx>${v}</a></li>`).join("");

  // ── Header · menu panel · sound button · cursor tag ──
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("jj-head");
    head.innerHTML = `<a class="jj-logo" href="index.html" aria-label="Your name — Home here" data-nav-logo data-sfx><span>${LOGO}</span></a>
      <button class="jj-burger" type="button" aria-label="Open Menu" aria-expanded="false" aria-controls="site-navigation" data-state="closed" data-sfx>
        <svg viewBox="0 0 30 13" aria-hidden="true"><path class="bar is-top" fill="currentColor" d="M6 0h24l-5 4.2H1Z"/><path class="bar is-bot" fill="currentColor" d="M5 8.8h24L24 13H0Z"/></svg>
      </button>`;
    const menu = document.createElement("div");
    menu.id = "site-navigation";
    menu.className = "jj-menu";
    menu.dataset.slot = "menu";
    menu.setAttribute("aria-hidden", "true");
    menu.inert = true;
    menu.innerHTML = `<div class="jj-grain jj-menu__grain"></div>
      <div class="jj-menu__layout"><nav class="jj-menu__links" aria-label="Main menu" data-label="Your menu name (English) here">
        <div class="jj-menu__row">${LINKS.slice(0, 4).map(linkHtml).join("")}</div>
        <div class="jj-menu__row">${LINKS.slice(4).map((l, i) => linkHtml(l, i + 4)).join("")}</div>
      </nav><ul class="jj-menu__socials">${socials()}</ul></div>
      <div class="jj-menu__credits"><span>© Your name here · <a href="#">Your place of making here</a></span><span><a href="#">Personal information</a> · <a href="#">Terms</a></span><a href="#">Your production credit here</a></div>`;
    LINKS.forEach((l, i) => menu.style.setProperty(`--d-${i}`, `${0.1 + 0.045 * i}s`));
    head.after(menu);

    const burger = head.querySelector(".jj-burger"), top = burger.querySelector(".is-top"), bot = burger.querySelector(".is-bot");
    // Two bars gather in the center into an X — like the original, it moves the bar vertices (path d) in .45s editorial (rotating ∓38° while gathering the centroids)
    const BAR_T = [[6, 0], [30, 0], [25, 4.2], [1, 4.2]], BAR_B = [[5, 8.8], [29, 8.8], [24, 13], [0, 13]];
    const toD = (pts) => "M" + pts.map((q) => `${q[0].toFixed(3)} ${q[1].toFixed(3)}`).join(" L") + " Z";
    const turn = (pts, n, ang) => {
      const c = [pts.reduce((a, q) => a + q[0], 0) / 4, pts.reduce((a, q) => a + q[1], 0) / 4], to = [15, 6.5];
      const cx = c[0] + (to[0] - c[0]) * n, cy = c[1] + (to[1] - c[1]) * n, a = (ang * Math.PI / 180) * n, k = 1 - 0.14 * n;
      return pts.map((q) => { const dx = (q[0] - c[0]) * k, dy = (q[1] - c[1]) * k; return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)]; });
    };
    const morph = { p: 0 };
    const draw = () => { top.setAttribute("d", toD(turn(BAR_T, morph.p, 38))); bot.setAttribute("d", toD(turn(BAR_B, morph.p, -38))); };
    JJ.setMenu = (open) => {
      burger.dataset.state = open ? "open" : "closed";
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", !open);
      menu.inert = !open;
      document.body.classList.toggle("menu-open", open);
      if (JJ.lenis) open ? JJ.lenis.stop() : JJ.lenis.start();
      gsap.to(morph, { p: +open, duration: reduce ? 0 : 0.45, ease: JJ.ease("editorial"), overwrite: true, onUpdate: draw });
    };
    burger.addEventListener("click", () => JJ.setMenu(burger.dataset.state !== "open"));
    addEventListener("keydown", (e) => e.key === "Escape" && burger.dataset.state === "open" && JJ.setMenu(false));
  }

  const sound = document.createElement("button");
  sound.type = "button";
  sound.className = "jj-sound";
  sound.dataset.slot = "sound-toggle";
  sound.setAttribute("aria-pressed", "true");
  sound.setAttribute("aria-label", "Sound Off");
  sound.innerHTML = `<span class="jj-sound__bars" aria-hidden="true">${[0, 1, 2, 3].map((i) => `<span class="jj-sound__bar" style="animation-delay:${0.13 * i}s"></span>`).join("")}</span>`;
  document.body.append(sound);
  // The original makes a short sound effect on each interaction — instead of audio files, WebAudio makes a short click in the same place
  let ac = null;
  JJ.sfx = (kind) => {
    if (sound.getAttribute("aria-pressed") !== "true" || !navigator.userActivation?.hasBeenActive) return;
    try {
      ac = ac || new window.AudioContext();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.frequency.value = kind === "click" ? 520 : 880;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(kind === "click" ? 0.05 : 0.02, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === "click" ? 0.09 : 0.04));
      o.connect(g).connect(ac.destination);
      o.start(t);
      o.stop(t + 0.1);
    } catch {}
  };
  sound.addEventListener("click", () => {
    const on = sound.getAttribute("aria-pressed") !== "true";
    sound.setAttribute("aria-pressed", on);
    sound.setAttribute("aria-label", on ? "Sound Off" : "Sound On");
  });
  document.addEventListener("pointerover", (e) => { const t = e.target.closest?.("[data-sfx]"); if (t && !t.contains(e.relatedTarget)) JJ.sfx("hover"); });
  document.addEventListener("click", (e) => e.target.closest?.("[data-sfx]") && JJ.sfx("click"));

  // Cursor tag — follows over [data-cursor] with .24s power3.out and grows with a .3s reveal, on leaving shrinks to .88x in .18s
  if (fine && !reduce) {
    const tag = document.createElement("div");
    tag.className = "jj-cursor";
    tag.dataset.slot = "cursor-label";
    document.body.append(tag);
    const qx = gsap.quickTo(tag, "x", { duration: 0.24, ease: "power3.out" }), qy = gsap.quickTo(tag, "y", { duration: 0.24, ease: "power3.out" });
    let cur = null, pt = null;
    const hide = () => { if (!cur) return; cur = null; gsap.to(tag, { autoAlpha: 0, scale: 0.88, duration: 0.18, overwrite: "auto" }); };
    const check = () => {
      if (!pt) return;
      const el = document.elementFromPoint(pt.x, pt.y)?.closest("[data-cursor]");
      if (!el) return hide();
      const x = Math.min(pt.x + 18, innerWidth - tag.offsetWidth - 8), y = Math.min(pt.y + 20, innerHeight - 48);
      if (cur) qx(x), qy(y); else qx(x, x), qy(y, y);
      if (el !== cur || tag.textContent !== el.dataset.cursor) {
        cur = el;
        tag.textContent = el.dataset.cursor;
        gsap.to(tag, { autoAlpha: 1, scale: 1, duration: 0.3, ease: JJ.ease("reveal"), overwrite: "auto" });
      }
    };
    addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") { pt = { x: e.clientX, y: e.clientY }; check(); } });
    addEventListener("scroll", check, { passive: true });
    document.addEventListener("pointerleave", () => { pt = null; hide(); });
  }

  // ── Signature Lottie — instead of the original signature JSON, our own doodle line with the same timing (30fps, line drawn over frames 75→152) ──
  JJ.signature = (el, { autoplay = false } = {}) => {
    if (!el || !window.lottie) return null;
    const rgb = JJ.rgb(getComputedStyle(el).color).map((v) => v / 255);
    const pts = [[-70, -150], [-58, -20], [-64, 110], [-112, 130], [-128, 70], [-60, 20], [10, -40], [30, -120], [10, -150], [-6, -70], [30, 40], [70, -10], [96, -80], [104, 30], [150, -20], [190, -110]];
    const v = [], ii = [], oo = [];
    pts.forEach((p, k) => {
      const a = pts[Math.max(0, k - 1)], b = pts[Math.min(pts.length - 1, k + 1)];
      const t = [(b[0] - a[0]) / 6, (b[1] - a[1]) / 6];
      v.push(p); ii.push([-t[0], -t[1]]); oo.push(t);
    });
    const tr = { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } };
    const data = {
      v: "5.12.1", fr: 30, ip: 0, op: 153, w: 467, h: 393, nm: "signature", ddd: 0, assets: [],
      layers: [{
        ddd: 0, ind: 1, ty: 4, nm: "stroke", sr: 1, ao: 0, ip: 0, op: 153, st: 0, bm: 0,
        ks: { o: { a: 0, k: 100 }, r: { a: 0, k: -8 }, p: { a: 0, k: [233.5, 196.5, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
        shapes: [
          { ty: "gr", it: [{ ty: "sh", ks: { a: 0, k: { i: ii, o: oo, v, c: false } } }, { ty: "st", c: { a: 0, k: [...rgb, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 9 }, lc: 2, lj: 2 }, tr] },
          { ty: "tm", s: { a: 0, k: 0 }, e: { a: 1, k: [{ t: 75, s: [0], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } }, { t: 152, s: [100] }] }, o: { a: 0, k: 0 }, m: 1 },
        ],
      }],
    };
    const anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, animationData: data });
    if (reduce) anim.goToAndStop(152, true);
    else if (autoplay) anim.play();
    return anim;
  };

  // ── Footer ──
  const foot = document.querySelector('[data-slot="footer"]');
  // The big footer button goes to the next section — the original also cycles Home → Field inside → Field outside → Foundation in order
  const NEXT = { home: ["about.html", "Game Day"], about: ["works.html", "Off-Duty"], works: ["index.html#foundation", "Foundation"] }[page] || ["index.html", "Home"];
  if (foot) {
    foot.classList.add("jj-foot");
    foot.id = foot.id || "footer";
    const marks = [40, 38, 45, 58, 52, 81, 46, 40].map((h, i) => `<span class="jj-mark" style="height:calc(${h * 0.55}px * var(--mark-s, 1));aspect-ratio:${[1.58, 1.78, 1, 1.18, 1.89, 1, 1, 2.1][i]};border-radius:${i % 3 ? "4px" : "50%"}" data-label="Partner logo ${i + 1}"></span>`).join("");
    foot.innerHTML = `<div class="jj-foot__glow"></div><div class="jj-grain is-screen"></div>
      <div class="jj-foot__panel">
        <a class="jj-logo" href="index.html" aria-label="Home" data-sfx><span>${LOGO}</span></a>
        <nav class="jj-foot__nav" aria-label="Footer Menu">${LINKS.map((l) => `<a class="menu-link" href="${l[1]}" data-sfx><span class="menu-link-lift"><span>${l[0]}</span><span class="menu-link-fill" aria-hidden="true">${l[0]}</span></span></a>`).join("")}</nav>
        <div class="jj-foot__row">
          <div class="jj-foot__float"><a class="jj-foot__thumb" href="news.html" aria-label="Open Journal" data-sfx><span class="jj-ph" data-label="Single football boot cutout · gold · 3/4 side view" style="display:block"></span></a></div>
          <ul class="jj-foot__socials">${socials()}</ul>
        </div>
        <p class="jj-foot__credit">© Your name here<br><a href="#" data-flicker>Your maker’s name here</a> · <a href="#">Your production credit here</a></p>
      </div>
      <div class="jj-foot__mid">
        <div class="jj-foot__sig" data-signature></div>
        <h2 class="jj-display jj-foot__title" data-label="Large footer title, two lines (English)">A closing headline<br>on two lines</h2>
        <a class="jj-btn is-cta is-lg is-grow" href="${NEXT[0]}" data-sfx><span class="jj-btn__fill" aria-hidden="true"></span><span class="jj-btn__txt">${NEXT[1]}</span></a>
      </div>
      <div class="jj-foot__player"><div class="jj-ph" data-label="Cutout of helmeted player upper body · purple rim light · placed on the right, looking left"></div></div>
      <div class="jj-marks" aria-hidden="true"><div class="jj-marks__track"><div style="display:flex;align-items:center">${marks}</div><div style="display:flex;align-items:center">${marks}</div></div></div>`;
    // Credit link: on hover, a stepped blink where each letter turns off and on in turn in 33ms units, spread from 78ms to 267ms (a timeline measured from the original)
    foot.querySelectorAll("[data-flicker]").forEach((a) => {
      a.innerHTML = [...a.textContent].map((c) => `<span class="jj-fl">${c}</span>`).join("");
      const chars = [...a.children];
      a.addEventListener("pointerenter", () => {
        if (reduce) return;
        const K = [[0, 0], [0.099, 0], [0.1, 1], [0.199, 1], [0.2, 0], [0.299, 0], [0.3, 1], [0.899, 1], [0.9, 0], [0.999, 0], [1, 1]].map(([offset, opacity]) => ({ offset, opacity }));
        chars.forEach((c, i) => c.animate(K, { duration: 333, delay: 78 + (267 * i) / Math.max(1, chars.length - 1) }));
      });
    });
    const sig = foot.querySelector("[data-signature]");
    const anim = JJ.signature(sig);
    if (anim) ScrollTrigger.create({ trigger: foot, start: "top 60%", once: true, onEnter: () => anim.play() });
    // The light curtain flows toward the cursor — original footer light: follows the target (2x/W−1)·W·.045 px by .06 per frame. Stops for touch and reduced motion.
    const glow = foot.querySelector(".jj-foot__glow");
    if (fine && !reduce) {
      let tx = 0, cx = 0, raf = 0;
      addEventListener("pointermove", (e) => { tx = ((e.clientX / innerWidth) * 2 - 1) * innerWidth * 0.045; }, { passive: true });
      const step = () => { cx += (tx - cx) * 0.06; glow.style.transform = `translate3d(${cx.toFixed(2)}px, 0, 0)`; raf = requestAnimationFrame(step); };
      new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting) raf = requestAnimationFrame(step); }).observe(foot);
    }
  }

  // Looping motion of off-screen sections is paused (the original also rests it with IntersectionObserver)
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-offscreen", !e.isIntersecting)), { rootMargin: "10% 0px" });
  document.querySelectorAll("[data-loop-pause]").forEach((el) => { el.classList.add("is-offscreen"); io.observe(el); });

  // ── Lenis ──
  if (window.Lenis && !reduce && !document.body.hasAttribute("data-no-lenis")) {
    const lenis = new Lenis({ lerp: 0.16, wheelMultiplier: 0.72, touchMultiplier: 1.5, smoothWheel: true, syncTouch: false });
    JJ.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Loader · transition curtain ──
  // First entry: the logo fills from the bottom (spring) and the number follows. After 900ms passes and fonts and images are ready, it lifts away on an 18° slanted edge in .8s power2.inOut.
  // Page transition: covers in .45s with the same edge, fills 750ms on the next section, rests .14s, then lifts in .7s (original page-veil).
  const clip = (t) => `polygon(${t}% 0, 100% 0, 100% 100%, ${t - 18}% 100%)`;
  const cover = (t) => `polygon(0 0, ${t}% 0, ${t - 18}% 100%, 0 100%)`;
  const veil = document.querySelector(".jj-veil") || document.createElement("div");
  veil.className = "jj-veil";
  veil.dataset.slot = "loader";
  veil.innerHTML = `<div class="jj-veil__mark"><svg viewBox="0 0 40 44"><defs><clipPath id="jj-fill"><rect x="0" y="44" width="40" height="0"/></clipPath></defs><g opacity=".22">${LOGO.replace(/<\/?svg[^>]*>/g, "")}</g><g clip-path="url(#jj-fill)">${LOGO.replace(/<\/?svg[^>]*>/g, "")}</g></svg><span class="jj-veil__pct">0%</span></div>`;
  if (!veil.isConnected) document.body.prepend(veil);
  // The transition marker is stored with its destination and time — so an interrupted marker doesn’t make the next first entry read as a transition
  const navMark = (() => { try { return JSON.parse(sessionStorage.getItem("jj-nav") || "null"); } catch { return null; } })();
  const here = location.pathname.split("/").pop() || "index.html";
  const fromNav = !!navMark && navMark.to === here && Date.now() - navMark.t < 5000;
  sessionStorage.removeItem("jj-nav");
  const done = [];
  // Entrance that runs when the curtain starts lifting (overlapping the .8s lift) — so it continues with no gap after the lift
  JJ.onLift = (fn) => { let done = false; const go = () => { if (!done) { done = true; fn(); } }; addEventListener("jj:lift", go, { once: true }); JJ.onReveal(go); };
  JJ.onReveal = (fn) => (document.documentElement.classList.contains("is-veil-done") ? fn() : done.push(fn));
  const lift = () => {
    document.documentElement.classList.add("is-veil-done");
    veil.style.clipPath = "none";
    veil.style.visibility = "hidden";
    done.splice(0).forEach((fn) => fn());
    ScrollTrigger.refresh();
  };
  if (reduce) lift();
  else {
    const rect = veil.querySelector("rect"), pct = veil.querySelector(".jj-veil__pct");
    let shown = 0, vel = 0, last = performance.now(), fonts = 0, loaded = document.readyState === "complete";
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => (fonts = 1));
    addEventListener("load", () => (loaded = true), { once: true });
    // The home veil stays still until the hero video and 3D assets are ready (the original starts lifting after about 3.1s) — data-veil-hold holds that spot
    const hold = +(document.body.dataset.veilHold || 900);
    const start = performance.now(), minMs = fromNav ? 750 : hold, maxMs = fromNav ? 2000 : Math.max(5000, hold + 1000);
    const step = () => {
      const now = performance.now(), dt = Math.max(0.001, Math.min(0.05, (now - last) / 1000));
      last = now;
      const target = Math.min(1, 0.3 * fonts + 0.7 * (loaded ? 1 : 0.5));
      // Same critically damped spring as the original (ω 4.44) — numbers don’t jump and just follow the target
      const w = 4.444, L = w * dt, k = 1 / (1 + L + 0.48 * L * L + 0.235 * L * L * L), d = shown - target, c = (vel + w * d) * dt;
      vel = (vel - w * c) * k;
      shown = target + (d + c) * k;
      rect.setAttribute("y", 44 - 44 * shown);
      rect.setAttribute("height", 44 * shown);
      pct.textContent = Math.round(100 * shown) + "%";
      if ((target >= 0.999 && shown >= 0.99 && now - start >= minMs) || now - start >= maxMs) {
        rect.setAttribute("y", 0); rect.setAttribute("height", 44); pct.textContent = "100%";
        const s = { t: 0 };
        gsap.delayedCall(fromNav ? 0.14 : 0, () => dispatchEvent(new Event("jj:lift")));
        gsap.to(s, { t: 118, duration: fromNav ? 0.7 : 0.8, delay: fromNav ? 0.14 : 0, ease: "power2.inOut", onUpdate: () => (veil.style.clipPath = clip(s.t)), onComplete: lift });
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  JJ.go = (href) => {
    if (reduce) return (location.href = href);
    veil.style.visibility = "visible";
    document.documentElement.classList.remove("is-veil-done");
    veil.querySelector(".jj-veil__pct").textContent = "";
    const s = { t: 0 };
    gsap.fromTo(s, { t: 0 }, { t: 118, duration: 0.45, ease: "power2.inOut", onUpdate: () => (veil.style.clipPath = cover(s.t)), onComplete: () => { sessionStorage.setItem("jj-nav", JSON.stringify({ to: href.split("#")[0], t: Date.now() })); location.href = href; } });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    const [file, hash] = href.split("#");
    e.preventDefault();
    if (document.body.classList.contains("menu-open")) JJ.setMenu(false);
    if (file === here && hash) {
      const t = document.getElementById(hash);
      if (t) JJ.lenis ? JJ.lenis.scrollTo(t, { duration: 1.2 }) : t.scrollIntoView({ behavior: "smooth" });
      return;
    }
    JJ.go(href);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) lift(); });
})();
