// First page motion: geometric-letter hero · timeline row stacking and flow · detail window · lens pattern panel · sentence roll · card stacking · phone accordion
(() => {
  const { reduced, desk } = UX;

  /* ── Timeline data: shared by the desktop rows · phone accordion · detail window. Edit the text and photo labels only here ── */
  const TITLES = [["Your timeline title here", "Place it in two lines"], ["Your short title here,", "Line two is this long"], ["Your one-line title and", "Add a slightly longer second line"], ["Your title here!", "Add the second line"]];
  const ICONS = ["tower", "door", "stair", "tower", "plant", "books", "cup", "laptop", "stair", "laptop", "flask", "door", "books", "flask"];
  const PHOTOS = {
    tower: ["Building exterior · clear day · tall building seen from the front below · landscape 3:2", "Entrance hall · evening indoor lighting · front view · horizontal 3:2"],
    door: ["Room divided by sliding furniture · daylight through the window · from inside the room · landscape 3:2", "Same room after moving furniture · daylight · same composition · landscape 3:2"],
    stair: ["Staircase in a duplex home · light from the upper window · looking up from below · landscape 3:2", "Upstairs bedroom · afternoon sunlight · beyond the railing · landscape 3:2"],
    plant: ["Courtyard flower bed and building · overcast day · low eye level · horizontal 3:2", "Rooftop garden · clear daytime · top-down view · landscape 3:2"],
    books: ["Built-in wall storage · indoor lighting · front view · landscape 3:2", "Shelf under the stairs · indoor lighting · angled · landscape 3:2"],
    cup: ["Shared lounge · afternoon sunlight · wide shot past the sofa · landscape 3:2", "Shared kitchen · daylight · counter front view · landscape 3:2"],
    laptop: ["Work room with a window · daylight · from behind the desk · landscape 3:2", "Living room seen through a workroom window · evening light · 3:2 landscape"],
    flask: ["Sink by the entrance · cool indoor light · front view · landscape 3:2", "Hands washing at a sink · close-up · landscape 3:2"],
  };
  const ITEMS = ICONS.map((icon, i) => ({ year: String(i + 1).padStart(4, "0"), lines: TITLES[i % TITLES.length], icon, slug: `item-${i}` }));
  const ROWS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13]];

  /* ── Object video: the original is a 500×500 · 24fps looping video baked from an object model rotating once in 5s. A placeholder video baked from our model (objects.js) at the same spec is used ── */
  const VIDEO_LABEL = "Video of a 3D object render spinning one full turn in place · plain background · square 500 · 5s loop";
  const video = (kind, cls, auto) => `<video class="${cls}" src="media/${kind}.mp4" muted ${auto ? "autoplay " : ""}loop playsinline preload="auto" aria-hidden="true" data-label="${VIDEO_LABEL}"></video>`;

  /* ── Timeline Drawing ── */
  const rot = (front, back, cls = "") => `<div class="ux-rot${cls}"><div class="ux-rot__cube">${front}${back}</div></div>`;
  const detail = (it, rev) => `<dl class="ix-item__detail ux-rot__face ${rev ? "is-back is-rev" : "is-front"}"${rev ? ' aria-hidden="true"' : ""}><dt class="ix-item__term"><span>${it.year}</span></dt><dd class="ix-item__data">${it.lines.map((l) => `<p>${l}</p>`).join("")}</dd></dl>`;
  const itemHTML = (i) => {
    const it = ITEMS[i];
    return `<div class="ix-item" role="button" tabindex="0" data-open="${i}">${rot(detail(it, false), detail(it, true))}<div class="ix-item__icon">${video(it.icon, "ix-item__video", true)}</div></div>`;
  };
  const rowsSlot = document.querySelector("[data-rows]");
  if (rowsSlot) {
    rowsSlot.outerHTML = ROWS.map((r) => `<div class="ix-stack ix-row" data-stack><div class="ix-overlay"></div><div class="ix-track" data-marquee>${r.map(itemHTML).join("")}</div></div>`).join("");
  }
  const accSlot = document.querySelector("[data-acc]");
  if (accSlot) {
    accSlot.outerHTML = ITEMS.map((it) => `<div class="ix-acc__item"><div class="ix-overlay"></div><details>
      <summary class="ix-acc__head"><p><span class="ix-acc__year">${it.year}</span><span class="ix-acc__title">${it.lines.join("<br>")}</span></p><figure class="ix-acc__model">${video(it.icon, "ix-acc__video", false)}</figure><span class="ix-acc__plus" aria-hidden="true"></span></summary>
      <div class="ix-acc__body"><p>Your one-line story of that year goes here.</p><div class="wf-img" data-label="${PHOTOS[it.icon][0]}"></div><p>Your two-to-three-line body goes here. Say what was changed and what is different for the people who buy.</p></div>
    </details></div>`).join("");
  }
  const artSlot = document.querySelector("[data-articles]");
  if (artSlot) {
    artSlot.insertAdjacentHTML("beforeend", ITEMS.map((it, i) => `<article class="ix-modal__article" data-lenis-prevent aria-hidden="${i ? "true" : "false"}"><div class="ix-modal__inner">
      <h3 class="ix-modal__title">${it.lines.join(" ")}</h3>
      <div class="ix-modal__contents"><p>$ here{it.year}Add the story of the year in one line.</p><div class="wf-img" data-label="${PHOTOS[it.icon][0]}"></div><p>Your body text goes here. The original runs about three lines: what changed and what is different for the buyer. Add one more line here.</p><div class="wf-img" data-label="${PHOTOS[it.icon][1]}"></div></div>
    </div></article>`).join(""));
  }

  /* ── Rotating box depth: half the front face height (same calculation as the original RotateAnimController) ── */
  const depth = (el) => {
    const front = el.querySelector(".is-front");
    const cube = el.querySelector(".ux-rot__cube");
    const set = () => {
      const h = front.getBoundingClientRect().height;
      if (h < 16) return;
      cube.style.setProperty("--depth", `${h / 2}px`);
      cube.style.setProperty("--hinge", `${Math.min(28, Math.max(8, h * 0.12))}px`);
    };
    set();
    new ResizeObserver(set).observe(front);
  };
  document.querySelectorAll(".ux-rot").forEach(depth);

  /* ── Geometric type: hero (two lines, swapped) · section title (lines thicken on scroll) · footer ── */
  const hero = new UX.Glyphs(document.querySelector("[data-hero]"), { rows: ["SAMPLE", "TITLE"], inks: [UX.ink("--kf-ink"), UX.ink("--kf-dim")], field: 0.22, lines: 40, seed: 11, hidden: true });
  UX.ready.then(() => hero.play());
  document.querySelectorAll("[data-glyph-title]").forEach((cv, i) => {
    const onNews = !!cv.closest(".ix-news");
    const inks = onNews ? [UX.ink("--kf-surface"), UX.ink("--site-glyph-news")] : [UX.ink("--kf-dim"), UX.ink("--site-glyph-sub")];
    const g = new UX.Glyphs(cv, { rows: [cv.dataset.glyphTitle], inks, lines: 34, fill: reduced ? 1 : 0.55, seed: 3 + i });
    if (!reduced) ScrollTrigger.create({ trigger: cv, start: "top bottom", end: "bottom 40%", scrub: true, onUpdate: (st) => g.setFill(0.55 + 0.45 * st.progress) });
  });
  const foot = document.querySelector("[data-glyph-footer]");
  if (foot) new UX.Glyphs(foot, { rows: ["SAMPLE TITLE"], inks: [UX.ink("--kf-surface"), UX.ink("--site-lav")], lines: 22, gap: 0.6, seed: 5 });

  const mm = gsap.matchMedia();

  /* ── Timeline row stacking · flow (desktop) ── */
  mm.add({ desk: "(min-width: 769px)", motion: "(prefers-reduced-motion: no-preference)" }, ({ conditions }) => {
    if (!conditions.desk) return;
    const rows = [...document.querySelectorAll(".ix-history [data-stack]")];
    rows.forEach((row, a) => {
      row.style.zIndex = a + 1;
      const isLast = a === rows.length - 1;
      if (conditions.motion) {
        if (!isLast) ScrollTrigger.create({ trigger: row, start: "top top", end: "bottom top", pin: true, pinSpacing: false });
        const next = rows[a + 1];
        if (next) gsap.fromTo(row.querySelector(".ix-overlay"), { opacity: 0 }, { opacity: 0.8, ease: "none", scrollTrigger: { trigger: next, start: "top 50%", end: "top top", scrub: true, invalidateOnRefresh: true } });
      }
      const track = row.querySelector("[data-marquee]");
      if (!track || track.dataset.doubled) return;
      track.dataset.doubled = "1";
      [...track.children].forEach((c) => {
        const copy = c.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        copy.removeAttribute("tabindex");
        copy.removeAttribute("role");
        track.append(copy);
      });
      if (!conditions.motion) return;
      // Odd and even rows flow in opposite directions (40s per loop), and each row’s start is offset by .2. Hovering a row pauses it
      const dir = a % 2 === 0 ? -1 : 1;
      const tw = gsap.fromTo(track, { xPercent: dir === 1 ? -50 : 0 }, { xPercent: dir === 1 ? 0 : -50, ease: "none", duration: 40, repeat: -1 });
      tw.progress((a * 0.2) % 1);
      row.addEventListener("mouseenter", () => tw.pause());
      row.addEventListener("mouseleave", () => tw.play());
    });
  });

  /* ── Object video playback (as in the original): plays when within 50px above or below the screen and stops when outside. Timeline row items pause on hover and resume on release ── */
  const near = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())), { rootMargin: "50px 0px" });
  document.querySelectorAll(".ix-item__video, .ix-acc__video").forEach((v) => near.observe(v));
  if (matchMedia("(any-hover: hover)").matches) document.querySelectorAll(".ix-history .ix-item").forEach((it) => {
    const v = it.querySelector("video");
    it.addEventListener("mouseenter", () => v.pause());
    it.addEventListener("mouseleave", () => v.play().catch(() => {}));
  });

  /* ── Phone accordion: a row sticks to the top, the next row covers it while a black veil goes 0→.8 ── */
  mm.add("(max-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    const items = [...document.querySelectorAll(".ix-acc__item")];
    const last = items[items.length - 1];
    const sts = [];
    const build = () => {
      sts.forEach((s) => s.kill());
      sts.length = 0;
      items.forEach((it, i) => {
        it.style.zIndex = i + 1;
        if (i === items.length - 1) return;
        const tall = it.querySelector("details").open && it.offsetHeight > innerHeight;
        const lastTall = last.querySelector("details").open && last.offsetHeight > innerHeight;
        sts.push(ScrollTrigger.create({ trigger: it, start: tall ? "bottom bottom" : "top top", endTrigger: last, end: lastTall ? "bottom bottom" : "top top", pin: true, pinSpacing: false, anticipatePin: 1 }));
        const tw = gsap.fromTo(it.querySelector(".ix-overlay"), { opacity: 0 }, { opacity: 0.8, ease: "none", scrollTrigger: { trigger: items[i + 1], start: "top 30%", end: "top top", scrub: true } });
        sts.push(tw.scrollTrigger);
      });
    };
    build();
    const onToggle = () => requestAnimationFrame(() => { build(); ScrollTrigger.refresh(); });
    items.forEach((it) => it.querySelector("details").addEventListener("toggle", onToggle));
    return () => items.forEach((it) => it.querySelector("details").removeEventListener("toggle", onToggle));
  });

  /* ── Sentence and question box roll: the sentence rolls once at 70% of the screen, question rows roll on entering and roll back on return ── */
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".ix-msg").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 70%", once: true, onEnter: () => el.classList.add("is-rotated") }));
    document.querySelectorAll(".ix-intro__row").forEach((el) => ScrollTrigger.create({
      trigger: el, start: "top 70%", end: "bottom 20%",
      onEnter: () => el.classList.add("is-rotated"), onLeaveBack: () => el.classList.remove("is-rotated"),
    }));
  });
  if (reduced) document.querySelectorAll(".ix-msg, .ix-intro__row").forEach((el) => el.classList.add("is-rotated"));

  /* ── Card Stacking ── */
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const arts = [...document.querySelectorAll(".ix-article")];
    const tall = (el) => el.offsetHeight > innerHeight;
    arts.forEach((art, r) => {
      art.style.zIndex = r + 1;
      if (r === arts.length - 1) return;
      const link = art.querySelector(".ix-article__link");
      const next = arts[r + 1];
      const origin = () => (link.style.transformOrigin = tall(art) ? "50% 90%" : "50% 10%");
      origin();
      ScrollTrigger.create({
        trigger: art, start: () => (tall(art) ? "bottom bottom" : "top 20px"), endTrigger: next, end: "top 20px",
        pin: true, pinSpacing: false, anticipatePin: 1, invalidateOnRefresh: true, onRefresh: origin,
        onLeave: () => gsap.set(link, { opacity: 0 }), onEnterBack: () => gsap.set(link, { opacity: 1 }),
      });
      gsap.fromTo(link, { rotation: 0, rotateX: 0, scale: 1 }, {
        rotation: r % 2 === 0 ? -2.67156 : 2.67156, rotateX: 40, scale: 0.7, ease: "none",
        scrollTrigger: { trigger: next, start: () => `top ${Math.min(20 + art.offsetHeight, innerHeight)}px`, end: "top 20px", scrub: true, invalidateOnRefresh: true },
      });
    });
  });

  /* Lens pattern panel: like the original, a single three.js shader. A geometric pattern drawn on a canvas serves as the texture, bulges around the mouse and covers the edges in navy */
  (function lens() {
    const cv = document.querySelector(".ix-message__canvas");
    if (!cv || !window.THREE) return;
    const tex = document.createElement("canvas");
    tex.width = 2048; tex.height = Math.round(2048 * 1084 / 3840);
    const t = tex.getContext("2d");
    const base = UX.ink("--site-lens-base"), light = UX.ink("--site-lens-light"), mid = UX.ink("--site-lens-mid");
    t.fillStyle = base; t.fillRect(0, 0, tex.width, tex.height);
    const rnd = (() => { let s = 91; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; })();
    const shapes = ["r", "e", "rl", "rr", "rt", "rb", "tu", "td"];
    let x = 0;
    while (x < tex.width) {
      const w = 50 + rnd() * 120;
      let y = 0;
      while (y < tex.height) {
        const h = 40 + rnd() * 110;
        const s = shapes[Math.floor(rnd() * shapes.length)];
        const ink = rnd() < 0.62 ? light : mid;
        const per = 3 + rnd() * 2.5, vert = rnd() < 0.25, flip = rnd() < 0.5;
        t.save();
        t.beginPath();
        if (s === "r") t.rect(x, y, w, h);
        else if (s === "e") t.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 7);
        else if (s === "rl") t.ellipse(x + w, y + h / 2, w, h / 2, 0, Math.PI / 2, Math.PI * 1.5);
        else if (s === "rr") t.ellipse(x, y + h / 2, w, h / 2, 0, -Math.PI / 2, Math.PI / 2);
        else if (s === "rt") t.ellipse(x + w / 2, y + h, w / 2, h, 0, Math.PI, Math.PI * 2);
        else if (s === "rb") t.ellipse(x + w / 2, y, w / 2, h, 0, 0, Math.PI);
        else if (s === "tu") { t.moveTo(x, y + h); t.lineTo(x + w / 2, y); t.lineTo(x + w, y + h); }
        else { t.moveTo(x, y); t.lineTo(x + w, y); t.lineTo(x + w / 2, y + h); }
        t.closePath();
        t.clip();
        t.fillStyle = ink;
        const len = vert ? w : h;
        for (let k = 0; k < len; k += per) {
          const g = flip ? k / len : 1 - k / len;
          const th = per * (0.15 + 0.7 * g);
          if (vert) t.fillRect(x + k, y, th, h); else t.fillRect(x, y + k, w, th);
        }
        t.restore();
        y += h;
      }
      x += w;
    }

    const renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0, 0);
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const texture = new THREE.CanvasTexture(tex);
    // Pattern colors were picked by the values seen on screen — the shader does no output conversion, so textures are read as-is without decoding
    texture.colorSpace = THREE.NoColorSpace;
    texture.minFilter = texture.magFilter = THREE.LinearFilter;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    const dark = UX.rgb("--kf-ink");
    // Original values: bulge strength 1.4 · radius .66 · exponent 2.5, light radius 1.18 (phone .91) · ellipse 1.65 (portrait on phone) · inside .1 outside .96 · damping 2.15, center light .34 · intensity .3 · exponent 1.4
    const U = {
      tex: { value: texture }, mouse: { value: new THREE.Vector2(0.5, 0.5) }, res: { value: new THREE.Vector2(1, 1) }, texAspect: { value: tex.width / tex.height },
      bulge: { value: 1.4 }, bulgeR: { value: 0.66 }, spotR: { value: 1.18 }, spotI: { value: 0.3 }, coreR: { value: 0.34 },
      ell: { value: new THREE.Vector2(1.65, 1) }, falloff: { value: 2.15 }, inner: { value: 0.1 }, outer: { value: 0.96 },
      prog: { value: reduced ? 1 : 0 }, dark: { value: new THREE.Vector3(dark.r / 255, dark.g / 255, dark.b / 255) },
    };
    const material = new THREE.ShaderMaterial({
      uniforms: U,
      vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.);}",
      fragmentShader: `uniform sampler2D tex;uniform vec2 mouse,res,ell;uniform float texAspect,bulge,bulgeR,spotR,spotI,coreR,falloff,inner,outer,prog;uniform vec3 dark;varying vec2 vUv;
        vec2 asp(vec2 d){return vec2(d.x*res.x/res.y,d.y);}
        void main(){
          vec2 q=vUv;
          if(prog>.001){vec2 d=asp(vUv-mouse);float r=length(d);
            if(r>1e-4){float lift=1.+bulge*prog*pow(1.-clamp(r/bulgeR,0.,1.),2.5);d/=lift;q=mouse+vec2(d.x*res.y/res.x,d.y);}}
          float va=res.x/res.y;
          if(va>texAspect)q.y=(q.y-.5)*(texAspect/va)+.5;else q.x=(q.x-.5)*(va/texAspect)+.5;
          vec3 c=texture2D(tex,q).rgb;
          if(prog>.001){
            float er=length(asp(vUv-mouse)/ell);
            float spot=pow(1.-smoothstep(inner,outer,clamp(er/spotR,0.,1.)),falloff);
            float core=pow(1.-smoothstep(0.,spotR*coreR,er),1.4);
            c=mix(dark,c,spot*prog);
            c+=vec3(.68,.74,.96)*core*spotI*prog;
            c+=vec3(.06,.07,.1)*pow(spot,1.8)*spotI*.3*prog;
          }
          gl_FragColor=vec4(c,1.);
        }`,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    // Compiling when first entering the section freezes the lens for 0.5s
    renderer.compile(scene, camera);

    const aim = new THREE.Vector2(0.5, 0.5);
    let visible = false, dirty = true;
    const size = () => {
      renderer.setSize(innerWidth, innerHeight, false);
      U.res.value.set(innerWidth, innerHeight);
      dirty = true;
    };
    const fit = () => {
      U.spotR.value = desk.matches ? 1.18 : 0.91;
      U.ell.value.set(desk.matches ? 1.65 : 1, desk.matches ? 1 : 1.65);
      if (!desk.matches) { aim.set(0.5, 0.5); U.mouse.value.set(0.5, 0.5); }
      dirty = true;
    };
    size(); fit();
    addEventListener("resize", size);
    desk.addEventListener("change", fit);
    const follow = (x, y) => {
      if (!visible || !desk.matches || reduced) return;
      aim.set(x / innerWidth, 1 - y / innerHeight);
      dirty = true;
    };
    addEventListener("pointermove", (e) => follow(e.clientX, e.clientY));
    // Like the original, touch on a wide screen (tablet landscape) also follows a scrolling finger — once scrolling starts, pointermove is cut off
    addEventListener("touchmove", (e) => { const p = e.touches[0]; if (p) follow(p.clientX, p.clientY); }, { passive: true });
    const sec = document.querySelector(".ix-message");
    ScrollTrigger.create({ trigger: sec, start: "top bottom", end: "bottom top", onToggle: (st) => { visible = st.isActive; dirty = true; } });
    if (!reduced) ScrollTrigger.create({ trigger: sec, start: "top bottom", end: "top center", scrub: true, onUpdate: (st) => { U.prog.value = st.progress; dirty = true; } });
    gsap.ticker.add(() => {
      if (!visible || document.querySelector("dialog[open]")) return;
      const moving = U.mouse.value.distanceToSquared(aim) > 2.5e-7;
      if (!moving && !dirty) return;
      U.mouse.value.lerp(aim, 0.08);
      renderer.render(scene, camera);
      dirty = false;
    });
  })();

  /* ── Detail window object: the original is a three.js model + OrbitControls (drag to rotate·pan, damping .05, no zoom). Our model (objects.js) uses the same lighting·camera fit·enter/exit ── */
  const stage = (function () {
    const host = document.querySelector("[data-model]");
    if (!host || !window.THREE || !THREE.OrbitControls || !UX.objects) return null;
    const color = (name) => { const c = UX.rgb(name); return new THREE.Color().setRGB(c.r / 255, c.g / 255, c.b / 255, THREE.SRGBColorSpace); };
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setClearColor(0, 0);
    Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%", outline: "none" });
    host.append(renderer.domElement);
    const scene = new THREE.Scene();
    const light = color("--site-light");
    [[0, 5, 2, 1.5], [5, 2, 0, 2.5], [-5, 2, 0, 2], [0, 1, 5, 2]].forEach(([x, y, z, i]) => { const l = new THREE.DirectionalLight(light, i); l.position.set(x, y, z); scene.add(l); });
    scene.add(new THREE.AmbientLight(light, 1.25));
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5);
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    Object.assign(controls, { enableDamping: true, dampingFactor: 0.05, enablePan: true, enableZoom: false, autoRotate: false });
    // Original data-*: size .8 · fit longest side to 2.6 · in-place rotation .5rad/s · float amplitude .1 speed 1.5 · down .75. Enter and exit: it rises from below 7 at .12x scale with 2.5 fewer turns over .95s power2.out and goes back down over .55s power2.in
    const SCALE = 0.8, FIT = 2.6, SPIN = 0.5, AMP = 0.1, FREQ = 1.5, Y_OFF = -0.75, DROP = 7, SMALL = 0.12, TURNS = Math.PI * 2 * 2.5;
    const cache = new Map();
    let model = null, restY = 0, base = 1, busy = false, playing = false, last = 0, clock = 0;
    const build = (kind) => {
      if (cache.has(kind)) return cache.get(kind);
      const inner = UX.objects.build(kind, { body: color("--kf-surface"), accent: color("--kf-ink") });
      const size = new THREE.Box3().setFromObject(inner).getSize(new THREE.Vector3());
      const root = new THREE.Group();
      root.add(inner);
      const k = SCALE * (FIT / Math.max(size.x, size.y, size.z));
      root.scale.setScalar(k);
      const center = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
      root.position.sub(center);
      root.position.y += Y_OFF;
      // When the same object reappears it left moving down and shrunk, so a separate in-place value is kept
      const rest = { root, y: root.position.y, s: k };
      cache.set(kind, rest);
      return rest;
    };
    // Pull the camera back so the ball around the model fits the short side of the screen with 1.05x margin
    const fitCamera = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h || !model) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const keep = { y: model.position.y, s: model.scale.x, r: model.rotation.y };
      model.position.y = restY; model.scale.setScalar(base); model.rotation.y = 0;
      const sphere = new THREE.Box3().setFromObject(model).getBoundingSphere(new THREE.Sphere());
      model.position.y = keep.y; model.scale.setScalar(keep.s); model.rotation.y = keep.r;
      const v = THREE.MathUtils.degToRad(camera.fov), hz = 2 * Math.atan(Math.tan(v / 2) * camera.aspect);
      const dist = Math.max((sphere.radius / Math.sin(Math.min(v, hz) / 2)) * 1.05, 0.25);
      camera.position.set(sphere.center.x, sphere.center.y, sphere.center.z + dist);
      camera.lookAt(sphere.center);
      camera.near = Math.max(0.01, dist - sphere.radius * 2);
      camera.far = dist + sphere.radius * 4;
      camera.updateProjectionMatrix();
      controls.target.copy(sphere.center);
      controls.update();
      controls.saveState();
    };
    new ResizeObserver(fitCamera).observe(host);
    const set = (kind) => {
      if (model) scene.remove(model);
      const rest = build(kind);
      model = rest.root;
      gsap.killTweensOf([model.position, model.scale, model.rotation]);
      restY = rest.y; base = rest.s;
      model.position.y = restY; model.scale.setScalar(base); model.rotation.y = 0;
      scene.add(model);
      controls.reset();
      fitCamera();
    };
    const tick = (now) => {
      if (!playing) return;
      const dt = Math.min(0.1, Math.max(0, (now - (last || now)) / 1000));
      last = now;
      if (model && !busy) {
        clock += dt;
        model.rotation.y += SPIN * dt;
        model.position.y = restY + Math.sin(clock * FREQ) * AMP;
      }
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };
    return {
      set,
      start() { if (playing) return; playing = true; last = 0; requestAnimationFrame(tick); },
      stop() { playing = false; },
      intro() {
        const tl = gsap.timeline({ onStart: () => (busy = true), onComplete: () => (busy = false) });
        if (!model) return tl;
        const r = model.rotation.y;
        tl.fromTo(model.position, { y: restY - DROP }, { y: restY, duration: 0.95, ease: "power2.out" }, 0)
          .fromTo(model.scale, { x: base * SMALL, y: base * SMALL, z: base * SMALL }, { x: base, y: base, z: base, duration: 0.95, ease: "power2.out" }, 0)
          .fromTo(model.rotation, { y: r - TURNS }, { y: r, duration: 0.95, ease: "power2.out" }, 0);
        return tl;
      },
      exit() {
        const tl = gsap.timeline({ onStart: () => (busy = true) });
        if (!model) return tl;
        const s = model.scale.x * SMALL;
        tl.to(model.position, { y: model.position.y - DROP, duration: 0.55, ease: "power2.in" }, 0)
          .to(model.scale, { x: s, y: s, z: s, duration: 0.55, ease: "power2.in" }, 0)
          .to(model.rotation, { y: model.rotation.y + TURNS, duration: 0.55, ease: "power2.in" }, 0);
        return tl;
      },
    };
  })();

  /* ── Detail window: open · forward/back · close (original timing as is) ── */
  (function modal() {
    const dlg = document.getElementById("ix-modal");
    if (!dlg) return;
    const D = { fade: 0.5, blur: 0.5, shutterIn: 0.4, shutterOut: 0.5, hold: 0.12, mqExit: 0.35, mqIntro: 0.45, modelExit: 0.55, modelIntro: 0.95, revealDelay: 0.3, reveal: 0.8, exit: 0.4, clip: 0.5, clipDelay: 0.05 };
    const k = reduced ? 0 : 1;
    const d = (n) => D[n] * k;
    const $ = (s) => dlg.querySelector(s);
    const box = $(".ix-modal__box"), overlay = $(".ix-modal__overlay"), shell = $(".ix-modal__shell");
    const model = $(".ix-modal__model"), mq = $(".ix-modal__mq"), shutter = $(".ix-modal__shutter"), closeShutter = $(".ix-modal__close-shutter");
    const page = [document.querySelector(".ux-main"), document.querySelector(".ux-footer")];
    const arts = [...dlg.querySelectorAll(".ix-modal__article")];
    const inner = (i) => arts[i].querySelector(".ix-modal__inner");
    let index = 0, tl = null, busy = false;

    const setActive = (i) => {
      arts.forEach((a, j) => {
        a.setAttribute("aria-hidden", j === i ? "false" : "true");
        if (j !== i) { gsap.killTweensOf(inner(j)); gsap.set(inner(j), { clearProps: "clipPath,transform" }); a.scrollTop = 0; }
      });
      index = i;
      const year = ITEMS[i].year;
      dlg.querySelectorAll("[data-chunk]").forEach((p) => (p.textContent = Array.from({ length: 32 }, () => year).join("  ") + "  "));
      stage?.set(ITEMS[i].icon);
    };
    const navDisabled = (v) => dlg.querySelectorAll("[data-prev],[data-next]").forEach((b) => (b.disabled = v));
    const play = (t) => { tl?.kill(); tl = t; t.play(0); };

    function open(i) {
      if (dlg.open) return go(i);
      dlg.showModal();
      UX.lenis?.stop();
      gsap.set(dlg, { opacity: 0 });
      gsap.set([overlay, shell], { opacity: 0 });
      gsap.set(box, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(closeShutter, { top: "0%", bottom: "100%" });
      gsap.set(shutter, { top: "0%", bottom: "0%" });
      gsap.set(model, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(mq, { yPercent: 100 });
      setActive(i);
      stage?.start();
      gsap.set(inner(i), { clipPath: "inset(0% 0% 100% 0%)", y: 50 });
      const t = gsap.timeline({ paused: true });
      t.to(dlg, { opacity: 1, duration: d("fade"), ease: "power2.out" }, 0)
        .to(overlay, { opacity: 1, duration: d("fade"), ease: "power2.out" }, 0)
        .to(shell, { opacity: 1, duration: d("fade"), ease: "power2.out" }, 0)
        .to(page, { filter: "blur(12px)", duration: d("blur"), ease: "power2.out" }, 0)
        .addLabel("reveal", `>+${d("hold")}`);
      reveal(t);
      play(t);
    }
    function reveal(t) {
      t.to(model, { clipPath: "inset(0% 0% 0% 0%)", duration: d("shutterOut"), ease: "power2.out" }, "reveal")
        .fromTo(shutter, { top: "0%", bottom: "0%" }, { top: "100%", duration: d("shutterOut"), ease: "power2.out" }, "reveal")
        .to(inner(index), { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: d("reveal"), ease: "power2.out" }, `reveal+=${d("revealDelay")}`)
        .fromTo(mq, { yPercent: 100 }, { yPercent: 0, duration: d("mqIntro"), ease: "power2.out", immediateRender: false }, `reveal+=${0.2 * k}`)
        .call(() => k && stage?.intro(), null, "reveal")
        .to({}, { duration: d("modelIntro") }, "reveal");
    }
    function go(i) {
      if (busy || i === index) return;
      busy = true;
      navDisabled(true);
      const t = gsap.timeline({ paused: true, onComplete: () => { busy = false; navDisabled(false); } });
      t.to(model, { clipPath: "inset(100% 0% 0% 0%)", duration: d("modelExit"), ease: "power2.in" }, 0)
        .call(() => k && stage?.exit(), null, 0)
        .fromTo(shutter, { top: "0%", bottom: "100%" }, { bottom: "0%", duration: d("shutterIn"), ease: "power2.in" }, 0)
        .to(mq, { yPercent: 100, duration: d("mqExit"), ease: "power2.in" }, 0)
        .addLabel("swap", `>+${d("hold")}`)
        .call(() => { setActive(i); gsap.set(inner(i), { clipPath: "inset(0% 0% 100% 0%)", y: 50 }); }, null, "swap")
        .addLabel("reveal", "swap");
      reveal(t);
      play(t);
    }
    function close() {
      if (!dlg.open) return;
      busy = false;
      const t = gsap.timeline({ paused: true });
      t.addLabel("exit", 0)
        .to(model, { clipPath: "inset(100% 0% 0% 0%)", duration: d("modelExit"), ease: "power2.in" }, "exit")
        .call(() => k && stage?.exit(), null, "exit")
        .to(mq, { yPercent: 100, duration: d("mqExit"), ease: "power2.in" }, "exit")
        .to(inner(index), { clipPath: "inset(100% 0% 0% 0%)", y: 0, duration: d("exit"), ease: "power2.in" }, "exit")
        .fromTo(closeShutter, { top: "0%", bottom: "100%" }, { bottom: "0%", duration: d("shutterIn"), ease: "power2.in", immediateRender: false }, `exit+=${d("reveal") * 0.75}`)
        .addLabel("shut", ">")
        .call(() => gsap.set(page, { filter: "blur(0px)" }), null, "shut")
        .fromTo(box, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(100% 0% 0% 0%)", duration: d("clip"), ease: "power2.in", immediateRender: false }, `shut+=${d("clipDelay")}`)
        .call(() => {
          dlg.close();
          gsap.set(dlg, { opacity: 0 });
          gsap.set(box, { clipPath: "inset(0% 0% 0% 0%)" });
          gsap.set(closeShutter, { top: "0%", bottom: "100%" });
          gsap.set(page, { clearProps: "filter" });
          stage?.stop();
          UX.lenis?.start();
        });
      play(t);
    }
    document.addEventListener("click", (e) => {
      const it = e.target.closest("[data-open]");
      if (it && desk.matches) return open(Number(it.dataset.open));
      if (!dlg.open) return;
      if (e.target.closest("[data-close]")) return close();
      if (e.target.closest("[data-prev]")) return go((index - 1 + arts.length) % arts.length);
      if (e.target.closest("[data-next]")) return go((index + 1) % arts.length);
    });
    document.addEventListener("keydown", (e) => {
      const it = e.target.closest?.("[data-open]");
      if (it && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(Number(it.dataset.open)); }
    });
    dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  })();
})();
