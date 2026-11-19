// Motion shared by all pages: menu pill position shift·drawer open·two dots·face head turn·bottom pill.
// The original uses a framer-motion spring (stiffness 500 · damping 50, face 100 · 50), so we port the same formula integrated in 1ms steps.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isHome = document.body.dataset.page === "home";

  // Mass 1 spring — when the target changes it carries over the current velocity and goes again (framer’s retarget)
  function spring({ value = 0, stiffness = 500, damping = 50, restDelta = 0.5, restSpeed = 2, onUpdate }) {
    let x = value, v = 0, target = value, raf = 0, last = 0, done = null;
    const tick = (now) => {
      const dt = last ? Math.min(64, now - last) : 16.7;
      last = now;
      for (let i = 0; i < dt; i++) {
        const a = -stiffness * (x - target) - damping * v;
        v += a / 1000; x += v / 1000;
      }
      if (Math.abs(target - x) < restDelta && Math.abs(v) < restSpeed) { x = target; v = 0; onUpdate(x); raf = 0; last = 0; done && done(); return; }
      onUpdate(x);
      raf = requestAnimationFrame(tick);
    };
    return {
      to(t, cb) {
        target = t; done = cb || null;
        if (reduce) { x = t; v = 0; onUpdate(x); cb && cb(); return; }
        if (!raf) raf = requestAnimationFrame(tick);
      },
      set(t) { cancelAnimationFrame(raf); raf = 0; last = 0; x = target = t; v = 0; onUpdate(x); },
      set damping(d) { damping = d; },
      get value() { return x; },
    };
  }

  // Height 0 ↔ auto with a spring — once fully open it is left as auto so it follows when the inner content changes
  function heightSpring(el, startOpen = false) {
    const s = spring({ value: 0, onUpdate: (h) => { el.style.height = `${h}px`; } });
    let open = startOpen;
    if (startOpen) el.style.height = "auto";
    return {
      get open() { return open; },
      toggle(want = !open) {
        open = want;
        const from = el.getBoundingClientRect().height;
        s.set(from);
        s.to(open ? el.scrollHeight : 0, () => { if (open) el.style.height = "auto"; });
      },
    };
  }

  // On entry, content outside the pill appears in .3s
  if (!reduce) {
    document.body.classList.add("is-entering");
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove("is-entering")));
  }

  // ── Menu Pill ──
  const pill = document.querySelector(".tm-pill");
  if (pill) {
    const menuBtn = pill.querySelector(".tm-pill__menu");
    const brand = pill.querySelector(".tm-pill__brand");
    const plus = pill.querySelector(".tm-pill__plus");
    const panel = heightSpring(pill.querySelector(".tm-menu"));
    const dots = [...pill.querySelectorAll(".tm-pill__dots i")];
    let hover = false;

    // 0 = Screen center (Home — even when the drawer opens it stays centered, so the pill grows and rises up to 31px) · 1 = Top 2rem
    const targetP = () => (isHome ? 0 : 1);
    const ps = spring({ value: 0, restDelta: 0.001, restSpeed: 0.01, onUpdate: (p) => pill.style.setProperty("--tm-p", p.toFixed(4)) });
    const from = sessionStorage.getItem("tm-pill-p");
    sessionStorage.removeItem("tm-pill-p");
    pill.classList.remove("tm-pill--center");
    ps.set(from === null ? targetP() : Number(from));
    ps.to(targetP());
    // On hover (when the menu is closed) a + line pops out below from 0 → 16px — framer default spring (500 · 25), so it overshoots slightly
    // Overshoots slightly on the way out (500 · 29) and does not overshoot on the way in (500 · 45) — curve measured from the original
    const plusS = plus && spring({ value: 0, stiffness: 500, damping: 29, restDelta: 0.1, onUpdate: (h) => { plus.style.height = `${Math.max(0, h)}px`; } });
    const paintPlus = () => { if (!plusS) return; const on = hover && !panel.open; plusS.damping = on ? 29 : 45; plusS.to(on ? 16 : 0); };

    const dotSprings = dots.map((d) => spring({ value: 0, restDelta: 0.01, restSpeed: 0.1, onUpdate: (y) => { d.style.transform = `translateY(${y}px)`; } }));
    const paintDots = () => {
      const [a, b] = panel.open ? [4, -3] : hover ? [-2, 2] : [0, 0];
      dotSprings[0] && dotSprings[0].to(a); dotSprings[1] && dotSprings[1].to(b);
    };
    const setHover = (on) => { hover = on; pill.classList.toggle("is-hover", on); paintDots(); paintPlus(); };
    const toggle = (want) => {
      panel.toggle(want);
      document.body.classList.toggle("is-menu-open", panel.open);
      paintDots(); paintPlus();
      ps.to(targetP());
    };
    if (fine) {
      menuBtn.addEventListener("pointerenter", () => setHover(true));
      if (isHome) brand.addEventListener("pointerenter", () => setHover(true));
      plus && plus.addEventListener("pointerenter", () => setHover(true));
      pill.addEventListener("pointerleave", () => setHover(false));
    }
    menuBtn.addEventListener("click", () => toggle());
    brand.addEventListener("click", (e) => { if (isHome) { e.preventDefault(); toggle(); } });
    plus && plus.addEventListener("click", () => toggle(true));
    document.querySelector(".tm-veil")?.addEventListener("click", () => toggle(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.open) toggle(false); });

    // Inside the menu drawer: collapse work list · to top · view buttons
    const list = pill.querySelector(".tm-list");
    const listSpring = list && heightSpring(list);
    pill.querySelector(".tm-workbar")?.addEventListener("click", () => listSpring && listSpring.toggle());
    pill.querySelector(".tm-listbar > button")?.addEventListener("click", () => pill.querySelector(".tm-menu").scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
    pill.querySelectorAll(".tm-listbar__views button").forEach((b, i, all) => b.addEventListener("click", () => all.forEach((o) => o.classList.toggle("is-on", o === b))));

    // Featured work strip — number buttons pick the cell, and the number and title follow when it changes
    const feature = pill.querySelector(".tm-feature__slides");
    const nums = [...pill.querySelectorAll(".tm-feature__nums button[data-i]")];
    const title = pill.querySelector(".tm-feature__title h3");
    nums.forEach((b) => b.addEventListener("click", () => feature.dispatchEvent(new CustomEvent("fx:goto", { detail: { index: Number(b.dataset.i) } }))));
    feature?.addEventListener("fx:select", (e) => {
      nums.forEach((b) => b.classList.toggle("is-on", Number(b.dataset.i) === e.detail.index));
      const slide = feature.querySelectorAll("[data-title]")[e.detail.index];
      if (slide && title) title.textContent = slide.dataset.title;
    });

    // When going to another page: hand over the pill position so the next page springs over from there, and the current page fades out in .3s before moving on (the original is a transition inside a single app)
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || e.defaultPrevented || e.metaKey || e.ctrlKey || !a.getAttribute("href").endsWith(".html")) return;
      sessionStorage.setItem("tm-pill-p", String(ps.value));
      if (reduce) return;
      e.preventDefault();
      document.body.classList.add("is-leaving");
      setTimeout(() => { location.href = a.href; }, 300);
    });
    addEventListener("pageshow", (e) => { if (e.persisted) document.body.classList.remove("is-leaving"); });

    views(pill.querySelector(".tm-views__gl"), () => panel.open);
  }

  // ── Two faces: every 2 seconds half look anywhere (±30°), half look at the cursor — spring 100 · 50 ──
  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.querySelectorAll(".tm-face").forEach((face) => {
    const turn = face.querySelector(".tm-face__turn");
    let rx = 0, ry = 0, follow = false;
    const sx = spring({ value: 0, stiffness: 100, damping: 50, restDelta: 0.01, restSpeed: 0.01, onUpdate: (v) => { rx = v; paint(); } });
    const sy = spring({ value: 0, stiffness: 100, damping: 50, restDelta: 0.01, restSpeed: 0.01, onUpdate: (v) => { ry = v; paint(); } });
    const paint = () => { turn.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; };
    if (reduce) return;
    setInterval(() => {
      if (!follow) { sx.to(60 * Math.sin(Math.random() * Math.PI) - 30); sy.to(60 * Math.sin(Math.random() * Math.PI) - 30); }
      follow = Math.random() > 0.5;
    }, 2000);
    let px = -1, py = -1;
    const look = () => {
      requestAnimationFrame(look);
      if (!follow || (px === mouse.x && py === mouse.y)) return;
      px = mouse.x; py = mouse.y;
      const r = face.getBoundingClientRect();
      const a = Math.atan2(-mouse.y + (r.top + r.height / 2), mouse.x - (r.left + r.width / 2));
      sx.to(30 * Math.sin(a)); sy.to(30 * Math.cos(a));
    };
    requestAnimationFrame(look);
  });

  // ── Bottom pill (work detail): scroll to the end to open the next three works, click for the full work list ──
  const dock = document.querySelector(".tm-dock");
  if (dock) {
    const next = dock.querySelector(".tm-dock__panel--next");
    const all = dock.querySelector(".tm-dock__panel--all");
    const nextS = next && heightSpring(next), allS = all && heightSpring(all);
    dock.querySelector(".tm-dock__bar")?.addEventListener("click", () => {
      if (!allS) return;
      allS.toggle();
      document.body.style.overflow = allS.open ? "hidden" : "";
      if (allS.open && nextS && nextS.open) nextS.toggle(false);
    });
    const onScroll = () => {
      if (!nextS || (allS && allS.open)) return;
      const max = document.documentElement.scrollHeight - innerHeight;
      const end = max > 0 && (scrollY / max) * 100 > 99.5;
      if (end !== nextS.open) nextS.toggle(end);
    };
    addEventListener("scroll", onScroll, { passive: true });
  }

  // Menu’s “Views” panel — a white ball slowly turns and one marker dot passes over it (original 150px three.js panel)
  function views(host, isOpen) {
    if (!host || !window.THREE) return;
    const probe = document.createElement("i");
    probe.style.cssText = "display:none;color:var(--kf-surface);background-color:var(--kf-accent)";
    host.appendChild(probe);
    const cs = getComputedStyle(probe);
    const surface = new THREE.Color(cs.color), mark = new THREE.Color(cs.backgroundColor);
    probe.remove();
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    r.setSize(150, 150, false);
    host.appendChild(r.domElement);
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
    cam.position.z = 4.2;
    scene.add(new THREE.AmbientLight(undefined, 0.6));
    const key = new THREE.DirectionalLight(undefined, 0.6); key.position.set(2, 3, 4); scene.add(key);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshStandardMaterial({ color: surface, roughness: 0.6 }));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshBasicMaterial({ color: mark }));
    dot.position.set(0, 0.35, 0.95);
    ball.add(dot);
    scene.add(ball);
    r.compile(scene, cam);
    const loop = (t) => {
      requestAnimationFrame(loop);
      if (!isOpen() && ball.userData.drawn) return;
      ball.rotation.y = reduce ? 0.6 : t / 4000;
      ball.rotation.x = 0.3;
      r.render(scene, cam);
      ball.userData.drawn = true;
    };
    requestAnimationFrame(loop);
  }

  window.TM = { spring, heightSpring };
})();
