// Studio — ① a winged beast (griffin silhouette built from our basic shapes) lands from the top left flapping in 2.4s, and scrolling down the About section writes two declaration lines one character at a time
// ② The year section keeps 20 standing and ties only the last two digits to scroll so they roll down from above, while section cards and torn photos rise and fall in step with that year
// ③ Gold handwritten words rise at different speeds and ④ three declaration cells light up in turn
(() => {
  const body = document.body;
  const reduce = cs.reduce;
  const T = window.THREE;
  gsap.registerPlugin(ScrollTrigger);

  // ── ① Winged beast ──
  const beastBox = document.querySelector(".cs-us__beast");
  if (T && beastBox) {
    const probe = document.createElement("i");
    probe.style.display = "none";
    body.append(probe);
    const colorOf = (css) => { probe.style.color = css; const c = new T.Color(); try { c.setStyle(getComputedStyle(probe).color); } catch {} return c; };
    const bone = colorOf("color-mix(in oklab, var(--kf-ink-soft) 70%, var(--site-cold))").multiplyScalar(0.62);
    const cold = colorOf("var(--site-cold)");
    probe.remove();
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    beastBox.append(renderer.domElement);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0.2, 1.3, 10);
    camera.lookAt(0.4, 0.6, 0);
    scene.add(new T.HemisphereLight(cold, bone.clone().multiplyScalar(0.2), 1.1));
    const key = new T.DirectionalLight(cold, 2.2);
    key.position.set(4, 5, 3);
    scene.add(key);
    const rim = new T.DirectionalLight(bone, 1.2);
    rim.position.set(-4, 2, -3);
    scene.add(rim);
    const mat = new T.MeshStandardMaterial({ color: bone, roughness: 0.75, metalness: 0.05, flatShading: true });
    const beast = new T.Group();
    const part = (geo, x, y, z, rx = 0, ry = 0, rz = 0, parent = beast) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); parent.add(m); return m; };
    const torso = part(new T.SphereGeometry(1, 14, 10), 0, 0.9, 0);
    torso.scale.set(1.25, 0.62, 0.58);
    const neck = part(new T.CylinderGeometry(0.28, 0.45, 0.9, 10), 1.05, 1.35, 0, 0, 0, -0.75);
    const head = new T.Group();
    head.position.set(1.45, 1.78, 0);
    beast.add(head);
    part(new T.SphereGeometry(0.32, 12, 10), 0, 0, 0, 0, 0, 0, head);
    part(new T.ConeGeometry(0.13, 0.42, 8), 0.36, -0.08, 0, 0, 0, -1.9, head);
    part(new T.ConeGeometry(0.06, 0.3, 6), -0.12, 0.3, 0.12, 0.3, 0, 0.4, head);
    part(new T.ConeGeometry(0.06, 0.3, 6), -0.12, 0.3, -0.12, -0.3, 0, 0.4, head);
    [[0.75, 0.22], [0.75, -0.22], [-0.8, 0.24], [-0.8, -0.24]].forEach(([x, z], i) => {
      const leg = part(new T.CylinderGeometry(0.09, 0.07, 1, 8), x, 0.32, z, 0, 0, i < 2 ? 0.25 : -0.15);
      part(new T.SphereGeometry(0.11, 8, 6), 0, -0.52, 0, 0, 0, 0, leg);
    });
    const tailCurve = new T.CatmullRomCurve3([new T.Vector3(-1.15, 0.95, 0), new T.Vector3(-1.8, 0.7, 0), new T.Vector3(-2.3, 0.25, 0), new T.Vector3(-2.7, 0.1, 0)]);
    const tail = part(new T.TubeGeometry(tailCurve, 20, 0.06, 6), 0, 0, 0);
    part(new T.ConeGeometry(0.14, 0.4, 8), -2.85, 0.08, 0, 0, 0, 1.4);
    const wing = (side) => {
      const pivot = new T.Group();
      pivot.position.set(0.3, 1.3, 0.3 * side);
      beast.add(pivot);
      for (let k = 0; k < 6; k++) {
        const sh = new T.Shape();
        const len = 2.4 - k * 0.22, w = 0.34;
        sh.moveTo(0, 0); sh.quadraticCurveTo(len * 0.5, w, len, w * 0.2); sh.quadraticCurveTo(len * 0.5, -w * 0.4, 0, 0);
        const f = new T.Mesh(new T.ShapeGeometry(sh, 6), new T.MeshStandardMaterial({ color: bone, roughness: 0.8, flatShading: true, side: T.DoubleSide }));
        f.rotation.set(Math.PI / 2 * side, 0, 0.35 + k * 0.32);
        f.position.x = -k * 0.08;
        pivot.add(f);
      }
      return pivot;
    };
    const wings = [wing(1), wing(-1)];
    scene.add(beast);
    beast.rotation.y = -0.35;

    const size = () => {
      const w = beastBox.clientWidth, h = beastBox.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    };
    size();
    addEventListener("resize", size);
    renderer.compile(scene, camera);
    const ease = (p) => 1 - (1 - p) ** 3;
    let start = 0, seen = true;
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; }).observe(beastBox);
    const loop = (now) => {
      requestAnimationFrame(loop);
      if (!seen || document.hidden) return;
      const t = now / 1000;
      const fly = start ? Math.min(1, (now - start) / 2400) : 0;
      const e = reduce ? 1 : ease(fly);
      beast.position.set(-5.5 * (1 - e), 3.4 * (1 - e) + Math.sin(t * 1.5) * 0.03 * e, -2 * (1 - e));
      beast.rotation.z = 0.35 * (1 - e);
      const burst = (t % 7) < 1.1;
      const flap = reduce ? 0 : fly < 1 ? Math.sin(t * 13) * 0.9 : burst ? Math.sin(t * 9) * 0.55 : -0.25 + Math.sin(t * 1.2) * 0.06;
      wings[0].rotation.x = -flap; wings[1].rotation.x = flap;
      head.rotation.z = Math.sin(t * 0.5) * 0.12;
      head.rotation.y = Math.sin(t * 0.37) * 0.25;
      tail.rotation.y = Math.sin(t * 0.9) * 0.15;
      neck.rotation.x = Math.sin(t * 0.6) * 0.04;
      renderer.render(scene, camera);
    };
    requestAnimationFrame(loop);
    document.addEventListener("cs:in", () => { start = performance.now(); });
  }

  // ── Two declaration lines — scroll the About section down a bit and they appear one character at a time (45ms) ──
  const typed = [...document.querySelectorAll(".cs-type")].flatMap((line) => {
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.append(w); return; }
            const word = document.createElement("span");
            word.style.display = "inline-block";
            [...w].forEach((ch) => { const c = document.createElement("span"); c.className = "c"; c.textContent = ch; word.append(c); out.push(c); });
            frag.append(word);
          });
          n.replaceWith(frag);
        } else walk(n);
      });
    };
    walk(line);
    return out;
  });
  let typedOn = false;
  const typeIn = () => {
    if (typedOn) return;
    typedOn = true;
    typed.forEach((c, i) => setTimeout(() => c.classList.add("is-on"), reduce ? 0 : i * 45));
  };

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.create({ trigger: ".cs-us", start: "top top", end: "bottom bottom", scrub: true, onUpdate: (s) => {
      if (s.progress > 0.08) typeIn();
      gsap.set(".cs-us__text", { y: -s.progress * innerHeight * 0.32 });
      gsap.set(".cs-us__beast", { y: -s.progress * innerHeight * 0.22 });
    } });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { typeIn(); });

  // ── ② Year ──
  const YEARS = [
    ["16", "Chapter One", ["Three people seated around a studio table", "First set of hand-drawn sketches"]],
    ["17", "Chapter Two", ["Narrow studio door with no sign", "Two monitors on late at night"]],
    ["18", "Chapter Three", ["Potted plant and stacked books by the window", "First meeting room whiteboard"]],
    ["20", "Chapter Four", ["Team group photo gathered like a choir", "Candlelit dinner table", "Long light in the arched corridor"]],
    ["22", "Chapter Five", ["Person standing alone before a cracked stone wall", "Rainy street outside the window"]],
    ["23", "Chapter Six", ["Scattered map and compass", "Fields outside the train window"]],
    ["24", "Chapter Seven", ["A hand opening the door of the studio on return", "Old cathedral cloister"]],
    ["26", "Chapter Eight", ["Microphone recording a voice", "A beam of light on a dark stage", "Pen and letter on a desk"]],
  ];
  const SPOTS = [[200, -250, -6], [430, -170, 7], [380, 40, -4]];
  const suffix = document.querySelector(".cs-years__suffix");
  const cards = document.querySelector(".cs-years__cards");
  const photos = document.querySelector(".cs-years__photos");
  const years = YEARS.map(([yy, title, pics], i) => {
    const s = document.createElement("span");
    s.textContent = yy;
    suffix.append(s);
    const card = document.createElement("div");
    card.className = "cs-years__card";
    card.innerHTML = `<h3 data-label="English section name">${title}</h3><div class="cs-years__flourish"><i></i>✦<i></i></div><p>Write about three lines on what happened this year. Tell it like a story: who gathered and what was first made.</p><p>Your line closing out that year here.</p>`;
    cards.append(card);
    const ph = pics.map((label, k) => {
      const p = document.createElement("div");
      p.className = "cs-photo wf-img";
      p.dataset.label = `Sepia old photo · ${label} · Torn edge · 4:3`;
      const pts = [];
      for (let a = 0; a < 28; a++) {
        const side = Math.floor(a / 7), u = (a % 7) / 7, j = () => (Math.random() * 5).toFixed(1);
        pts.push(side === 0 ? `${(u * 100).toFixed(1)}% ${j()}%` : side === 1 ? `${100 - j()}% ${(u * 100).toFixed(1)}%` : side === 2 ? `${(100 - u * 100).toFixed(1)}% ${100 - j()}%` : `${j()}% ${(100 - u * 100).toFixed(1)}%`);
      }
      p.style.clipPath = `polygon(${pts.join(", ")})`;
      photos.append(p);
      const [x, y, r] = SPOTS[k];
      return { el: p, x: x + (i % 2 ? 40 : 0), y, r };
    });
    return { s, card, ph };
  });
  const N = YEARS.length;
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const drawYears = (f) => {
    years.forEach(({ s, card, ph }, i) => {
      const d = i - f, a = Math.abs(d);
      s.style.transform = `translateY(${(-d * 95).toFixed(2)}%) rotate(${(d * -7).toFixed(2)}deg)`;
      s.style.opacity = clamp(1 - Math.max(0, a - 0.5) * 2).toFixed(3);
      card.style.opacity = clamp(1 - a * 2.6).toFixed(3);
      card.style.transform = `translateY(calc(-50% + ${(d * 70).toFixed(1)}px))`;
      card.style.visibility = a > 0.6 ? "hidden" : "visible";
      ph.forEach((p) => {
        const v = clamp(1 - a * 1.6);
        p.el.style.opacity = v.toFixed(3);
        p.el.style.transform = `translate(calc(var(--year-fs) * 2.2 + ${(p.x - d * 140).toFixed(1)}px), ${(p.y + d * 90).toFixed(1)}px) rotate(${(p.r + d * 10).toFixed(1)}deg) scale(${(0.9 + 0.1 * v).toFixed(3)})`;
        p.el.style.visibility = v <= 0 ? "hidden" : "visible";
      });
    });
  };
  document.querySelector(".cs-years").style.height = `${(N + 0.6) * 100}vh`;
  drawYears(0);
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.create({ trigger: ".cs-years", start: "top top", end: "bottom bottom", scrub: 0.6, onUpdate: (s) => drawYears(Math.max(0, Math.min(N - 1, s.progress * N - 0.3))) });
  });

  // ── ③ Glowing words ──
  const WORDS = [["Frontend", 18, 30, 1.2], ["Backend", 64, 24, 0.8], ["Motion", 30, 52, 1.5], ["Sound", 72, 50, 1.1], ["Type", 12, 72, 0.9], ["Story", 50, 66, 1.3], ["Light", 82, 76, 1.6], ["Code", 40, 86, 1], ["Form", 22, 96, 1.4], ["Grid", 60, 98, 0.85], ["Ink", 8, 44, 1.7], ["Craft", 88, 36, 1.25]];
  const box = document.querySelector(".cs-craft__words");
  const words = WORDS.map(([w, x, y, k], i) => {
    const el = document.createElement("span");
    el.className = "cs-word";
    el.dataset.label = "Tech · tool name in English";
    el.textContent = w;
    el.style.left = `${x}%`;
    el.style.top = `${y}%`;
    el.style.setProperty("--d", `${(2.4 + (i % 5) * 0.5).toFixed(1)}s`);
    el.style.setProperty("--o", `${(-i * 0.37).toFixed(2)}s`);
    box.append(el);
    return { el, k };
  });
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.create({ trigger: ".cs-craft", start: "top bottom", end: "bottom top", scrub: true, onUpdate: (s) => {
      words.forEach(({ el, k }) => { el.style.translate = `0 ${((0.5 - s.progress) * k * 90).toFixed(2)}vh`; });
    } });
  });

  // ── ④ Three declarations ──
  const cols = [...document.querySelectorAll(".cs-mani__cols li")];
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.create({ trigger: ".cs-mani", start: "top top", end: "bottom bottom", onUpdate: (s) => cols.forEach((c, i) => c.classList.toggle("is-on", s.progress > 0.08 + i * 0.26)) });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { cols.forEach((c) => c.classList.add("is-on")); });

  if (location.hash) document.addEventListener("cs:in", () => document.querySelector(location.hash)?.scrollIntoView());
})();
