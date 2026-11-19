// Archive: Polaroid wheel (original Rx — radius 1.8H, center .1H-radius, card tilt -1.2×angle, lerp .08), swapping the active item text,
// Wheel/list view toggle (cards stack into one spot at bottom right), cursor tag over the title, and pressing a title drops down an info panel from above.
CRL.page("list", (view, life) => {
  const { Strip, fontsReady, reduce } = CRL;
  const PHOTOS = [
    "Host upper body · headphones and mic · blue background · portrait",
    "Speaker at a lectern · denim shirt · dark stage lighting",
    "Elderly musician in studio · window daylight · waist up",
    "DJ at a turntable · cap and headphones · hands seen from above",
    "Book cover front · white background · handwritten title",
    "Craftsman at microscope · workshop shelf · front view",
    "Rapper on stage · seated on a chair gesturing · potted plant",
    "Recording studio console · equipment only, no people · low lighting",
    "Album cover front view · gray cover with a single circle",
    "Café window interview · two people in profile",
    "B&W portrait · hand holding cigarette · coarse grain",
    "Notes on the studio wall · close-up",
    "Stage seen from behind the audience seats · backlit",
    "Notebook and pencil on desk · from above",
    "Person holding a film camera · street · afternoon light",
    "Documentary scene capture · Construction site · Landscape",
    "Pianist at the piano · Hands on keys",
    "Back view of visitors before a large painting in an exhibition hall",
    "Radio booth · two microphones · red on-air light",
    "Person close-up · glasses · thoughtful expression",
  ];
  const items = PHOTOS.map((p, i) => ({
    name: `Your name $ here{String(i + 1).padStart(2, "0")}`,
    work: i % 3 === 0 ? "”Your slightly longer resource title goes here across two lines”" : "”Your document title here”",
    year: "0000",
    photo: p,
  }));
  const N = items.length;
  const STEP = (2 * Math.PI) / N;
  const wrapIdx = (v) => ((Math.round(v) % N) + N) % N;
  const wrapHalf = (v) => { const r = ((v % N) + N) % N; return r > N / 2 ? r - N : r; };

  const stage = view.querySelector(".lib__stage");
  const wheelEl = stage.querySelector("[data-wheel]");
  const listEl = stage.querySelector("[data-list]");
  const slotEl = stage.querySelector("[data-list-slot]");

  // ── Card · List Building
  const cards = items.map((it) => {
    const c = document.createElement("div");
    c.className = "lib-card";
    c.innerHTML = `<div class="wf-img" data-label="${it.photo}"></div>`;
    // So not a single frame shows while waiting for the font — turn them on one by one as the intro effect passes .85rad on the right
    if (!reduce) c.style.opacity = "0";
    wheelEl.append(c);
    return c;
  });
  listEl.innerHTML = items.map((it, i) => `<li data-i="${i}"><span class="c1">${i + 1}</span><span class="c2">${it.name}</span><span class="c3">${it.work}</span></li>`).join("");
  const rows = [...listEl.children];

  // ── Background text band: white 12%, flows on its own only
  const canvas = view.querySelector(".gl-canvas");
  const strip = new Strip({ canvas, color: "--site-white", opacity: { value: 0 }, baseSpeed: reduce ? 0 : 0.02 });
  life.add(() => strip.dispose());

  // ── Card plane (original library scene): each card puts a card-sized GL plane (32×32 cells) on the strip scene. Following the drag pull, the vertical center bends and
  //    (x −= sin(v·π)·.12pull·.3, y += sin(v·π)·.06pull·.1 — original screen units, screen height = 2·tan(22.5°) = .8284 units)
  //    spreads 10 points toward the same side (length min(|drag|, .1)). Border .1 (bottom .1) is a white frame. DOM cards only hold position · order · opacity and are hidden.
  const CARD_VERT = `
    uniform vec2 uBend;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 p = position;
      float k = sin(uv.y * 3.14159265);
      p.x -= k * uBend.y * 0.3;
      p.y += k * uBend.x * 0.1;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const CARD_FRAG = `
    uniform sampler2D uPhoto;
    uniform vec3 uFrame;
    uniform vec2 uStreak;
    uniform float uOpacity, uBorder, uBottom, uImageAspect, uCardAspect;
    varying vec2 vUv;
    void main() {
      float x0 = uBorder, x1 = 1.0 - uBorder, y0 = uBottom, y1 = 1.0 - uBorder;
      if (vUv.x < x0 || vUv.x > x1 || vUv.y < y0 || vUv.y > y1) { gl_FragColor = vec4(uFrame, uOpacity); return; }
      vec2 q = vec2((vUv.x - x0) / (x1 - x0), (vUv.y - y0) / (y1 - y0));
      float inset = uCardAspect * ((x1 - x0) / (y1 - y0));
      vec2 st = q;
      if (uImageAspect > inset) st.x = 0.5 + (q.x - 0.5) * inset / uImageAspect;
      else st.y = 0.5 + (q.y - 0.5) * uImageAspect / inset;
      float sp = length(uStreak);
      vec2 dir = sp > 1e-4 ? uStreak / sp * min(sp, 0.1) : vec2(0.0);
      vec3 c = vec3(0.0);
      for (int i = 0; i < 10; i++) c += texture2D(uPhoto, st + dir * (float(i) / 9.0 - 0.5)).rgb;
      gl_FragColor = vec4(c / 10.0, uOpacity);
    }`;
  // Photo placeholder: diagonal lines and a label over the cell color — a canvas cannot read variables, so each card resolves and receives them one value at a time
  const colorIn = (el, expr) => { const p = document.createElement("i"); p.style.cssText = `display:none;color:${expr}`; el.append(p); const c = getComputedStyle(p).color; p.remove(); return c; };
  function photoCanvas(card, label) {
    const ph = card.querySelector(".wf-img");
    const c = Object.assign(document.createElement("canvas"), { width: 400, height: 514 });
    const g = c.getContext("2d");
    g.fillStyle = colorIn(ph, "var(--wf-fill)");
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = colorIn(ph, "var(--wf-line)");
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(c.width, c.height); g.moveTo(c.width, 0); g.lineTo(0, c.height); g.stroke();
    g.fillStyle = colorIn(ph, "var(--wf-fill-ink)");
    g.font = `500 22px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-mono").trim() || "monospace"}`;
    g.textAlign = "center";
    const words = label.split(" "), lines = [];
    let line = "";
    for (const w of words) { const n = line ? `${line} ${w}` : w; if (g.measureText(n).width > c.width * 0.82 && line) { lines.push(line); line = w; } else line = n; }
    lines.push(line);
    lines.forEach((l, i) => g.fillText(l, c.width / 2, c.height / 2 + (i - (lines.length - 1) / 2) * 30));
    return c;
  }
  const UNIT = () => innerHeight / 0.8284;
  let cardGeo = null;
  const planes = cards.map((c, i) => {
    const tex = new THREE.CanvasTexture(photoCanvas(c, items[i].photo));
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    const u = {
      uPhoto: { value: tex }, uFrame: { value: CRL.glColor("--site-white") }, uStreak: { value: new THREE.Vector2() }, uBend: { value: new THREE.Vector2() },
      uOpacity: { value: 1 }, uBorder: { value: 0.1 }, uBottom: { value: 0.1 }, uImageAspect: { value: 400 / 514 }, uCardAspect: { value: 245 / 315 },
    };
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ vertexShader: CARD_VERT, fragmentShader: CARD_FRAG, uniforms: u, transparent: true, depthWrite: false, depthTest: false }));
    m.frustumCulled = false;
    strip.scene.add(m);
    life.add(() => tex.dispose());
    return { m, u };
  });
  stage.classList.add("is-gl");
  // On leave (original library _fadePlanes(0)): erase the card planes and strip in .5s
  const leaveFade = { value: 1 };
  life.leave(() => gsap.to([leaveFade, strip.opacity], { value: 0, duration: reduce ? 0 : 0.5, ease: "sine.inOut", overwrite: true }));
  const fitCards = () => {
    cardGeo?.dispose();
    cardGeo = new THREE.PlaneGeometry(cards[0].offsetWidth, cards[0].offsetHeight, 32, 32);
    planes.forEach((p) => (p.m.geometry = cardGeo));
  };

  // ── Wheel state (original Nv slider: infinite, snaps to integer positions, drag sensitivity .005, lerp .08)
  const slider = { current: 0, target: 0, paused: true };
  const morph = { value: 0 };
  let pull = 0;
  let active = -1;
  let snapT;
  const snap = () => { clearTimeout(snapT); snapT = setTimeout(() => (slider.target = Math.round(slider.target)), 180); };
  life.on(window, "wheel", (e) => {
    if (slider.paused || infoOpen) return;
    slider.target += (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * 0.004;
    snap();
  }, { passive: true });
  let drag = null;
  stage.addEventListener("pointerdown", (e) => { if (!slider.paused && !infoOpen) drag = { x: e.clientX, t: slider.target }; });
  life.on(window, "pointermove", (e) => { if (drag) slider.target = drag.t - (e.clientX - drag.x) * 0.005; });
  life.on(window, "pointerup", () => { if (drag) { drag = null; slider.target = Math.round(slider.target); } });
  life.on(window, "keydown", (e) => {
    if (slider.paused) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") slider.target = Math.round(slider.target) + 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") slider.target = Math.round(slider.target) - 1;
  });

  // ── Active article text: lines slide up and out, new lines rise from below at .0475 intervals
  const topEl = stage.querySelector(".lib__top");
  const nextEl = stage.querySelector(".lib__next");
  const linesHTML = (it) => `<span class="lib__line"><span>${it.name}</span></span><span class="lib__line"><span>${it.work}</span></span>`;
  function fill(el, i) {
    const it = items[i];
    el.querySelector('[data-info="num"], [data-next="num"]').innerHTML = `<span class="lib__line"><span>${i + 1}</span></span>`;
    el.querySelector('[data-info="title"], [data-next="title"]').innerHTML = linesHTML(it);
    el.querySelector('[data-info="year"], [data-next="year"]').innerHTML = `<span class="lib__line"><span>${it.year}</span></span>`;
  }
  let swapTl;
  function setActive(i, animate = true) {
    if (i === active) return;
    active = i;
    rows.forEach((r, k) => r.classList.toggle("is-active", k === i));
    if (!animate || reduce) { fill(topEl, i); fill(nextEl, (i + 1) % N); return; }
    swapTl?.progress(1).kill();
    const outs = [...topEl.querySelectorAll(".lib__line > span"), ...nextEl.querySelectorAll(".lib__line > span")];
    swapTl = gsap.timeline()
      .to(outs, { yPercent: -105, duration: 0.3, ease: "power2.in", stagger: 0.02 })
      .add(() => {
        fill(topEl, i);
        fill(nextEl, (i + 1) % N);
        const ins = [...topEl.querySelectorAll(".lib__line > span"), ...nextEl.querySelectorAll(".lib__line > span")];
        gsap.fromTo(ins, { yPercent: 105 }, { yPercent: 0, duration: 0.8, stagger: 0.0475, ease: "power3.out" });
      });
  }

  // ── One frame: morph blends between the wheel position and the list position
  const cardBox = { w: 0, h: 0 };
  const measure = () => { cardBox.w = cards[0].offsetWidth; cardBox.h = cards[0].offsetHeight; fitCards(); };
  measure();
  life.on(window, "resize", measure);
  let last = performance.now();
  life.tick(() => {
    const now = performance.now();
    const dt = Math.min(now - last, 50) / 1000;
    last = now;
    strip.update(dt);
    strip.draw();

    if (!slider.paused) slider.current += (slider.target - slider.current) * (1 - Math.pow(1 - 0.08, dt * 60));
    const pos = slider.current;
    const s = Math.max(-1.2, Math.min(1.2, slider.target - slider.current));
    pull += (s - pull) * 0.15;
    setActive(wrapIdx(pos));

    const W = innerWidth, H = innerHeight;
    const R = 1.8 * H;
    const sr = slotEl.getBoundingClientRect();
    const ls = sr.width / cardBox.w;
    const m = morph.value;
    cards.forEach((c, i) => {
      const t = wrapHalf(i - pos) * STEP;
      const wx = W / 2 + R * Math.sin(t);
      const wy = H / 2 - 0.1 * H + R * (1 - Math.cos(t));
      const wr = 1.2 * t;
      const n = Math.abs(wrapHalf(i - active));
      const x = wx + (sr.left + sr.width / 2 - wx) * m;
      const y = wy + (sr.top + sr.height / 2 - wy) * m;
      const rot = wr * (1 - m);
      const sc = 1 + (ls - 1) * m;
      c.style.transform = `translate(${x - cardBox.w / 2}px, ${y - cardBox.h / 2}px) rotate(${rot}rad) scale(${sc})`;
      const z = Math.round(m > 0.5 ? 200 - 5 * n : 100 + 100 * Math.cos(t));
      c.style.zIndex = String(z);
      const { m: mesh, u } = planes[i];
      mesh.position.set(x - W / 2, H / 2 - y, 0);
      mesh.rotation.z = -rot;
      mesh.scale.set(sc, sc, 1);
      mesh.renderOrder = 300 + z;
      u.uOpacity.value = (c.style.opacity === "" ? 1 : +c.style.opacity) * leaveFade.value;
      u.uStreak.value.set(0.06 * pull, 0.12 * pull);
      u.uBend.value.set(0.06 * pull * UNIT(), 0.12 * pull * UNIT());
    });
  });

  // ── View toggle: wheel ↔ list
  const switchBtns = [...stage.querySelectorAll("[data-view]")];
  let isList = false;
  function setView(list) {
    if (list === isList) return;
    isList = list;
    switchBtns.forEach((b) => b.classList.toggle("is-active", (b.dataset.view === "list") === list));
    slider.target = Math.round(slider.target);
    // Original _setView: morph 1s, card curve (CustomEase M0,0 C.6171,.109 0,.9953 1,1)
    gsap.to(morph, { value: list ? 1 : 0, duration: reduce ? 0 : 1, ease: window.CustomEase ? CustomEase.create("crl-card", "M0,0 C0.6171,0.109 0,0.9953 1,1") : "expo.inOut" });
    gsap.to(nextEl, { autoAlpha: list ? 0 : 1, duration: 0.6, ease: "sine.inOut" });
    if (list) {
      gsap.set(listEl, { autoAlpha: 1 });
      gsap.fromTo(listEl.querySelectorAll("li > *"), { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: (i, el) => (el.parentElement.classList.contains("is-active") ? 1 : 0.4), duration: 0.8, stagger: { each: 0.012 }, ease: "power3.out", delay: 0.3, clearProps: "opacity,visibility" });
    } else {
      gsap.to(listEl, { autoAlpha: 0, duration: 0.4, ease: "sine.inOut" });
    }
  }
  switchBtns.forEach((b) => b.addEventListener("click", () => setView(b.dataset.view === "list")));
  rows.forEach((r) => r.addEventListener("click", () => {
    const i = +r.dataset.i;
    slider.target = Math.round(slider.target) + wrapHalf(i - wrapIdx(slider.target));
  }));

  // ── Tag above the title (original cursorreveal): the area is the title box. It starts hidden at the title’s top left, and when the mouse enters the title it turns on over .4s power2.out, and
  //  Follows the mouse with quickTo .6s power3.out so that its center is at the cursor (the title swaps its contents when the active item changes, so the tag stays on the panel).
  // The original label spot is pointer-events:none so inside/outside is judged by the panel’s mousemove — same way here. With reduced motion, just switch on/off at the title center
  const tag = stage.querySelector(".lib__cursor");
  const title = stage.querySelector("[data-open-info]");
  const t0 = title.getBoundingClientRect();
  gsap.set(tag, { xPercent: -50, yPercent: -50, x: t0.left, y: t0.top });
  const tx = gsap.quickTo(tag, "x", { duration: 0.6, ease: "power3.out" });
  const ty = gsap.quickTo(tag, "y", { duration: 0.6, ease: "power3.out" });
  let inTitle = false;
  const showTag = (on) => gsap.to(tag, { autoAlpha: on ? 1 : 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
  stage.addEventListener("mousemove", (ev) => {
    const r = title.getBoundingClientRect();
    const now = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
    if (now !== inTitle) {
      inTitle = now;
      if (now && reduce) gsap.set(tag, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      showTag(now);
    }
    if (now && !reduce) { tx(ev.clientX); ty(ev.clientY); }
  });
  stage.addEventListener("mouseleave", () => { if (inTitle) showTag((inTitle = false)); });

  // Info panel (original InfoPanel): the backdrop (10px blur · 40% ink) turns on in .8s sine.out, and .25 later the panel comes down from above over 1.35s (CustomEase .7248,.1799,0,.9956).
  //    The photo follows .565 later from the left over 1.3s (.6208,.058,0,.994), text lines come .43 later 110%→0 over 1.2s with .045 stagger, the number and view link .5 later 125%→0 over 1s, and the close button turns on together over 1s.
  //    On close: close button .5s power2.in · panel 1s expo.inOut after .1 · cover .5s power2.out .3 after that.
  const info = view.querySelector(".lib-info");
  const panel = info.querySelector(".lib-info__panel");
  const veil = info.querySelector(".lib-info__bg");
  const closeBtn = info.querySelector(".lib-info__close");
  const ce = (name, path, alt) => (window.CustomEase ? CustomEase.create(name, path) : alt);
  const panelEase = ce("crl-panel-info", "M0,0 C0.7248,0.1799 0,0.9956 1,1", "expo.inOut");
  const visualEase = ce("crl-panel-visual", "M0,0 C0.6208,0.058 0,0.994 1,1", "expo.inOut");
  let infoOpen = false, infoTl = null, infoSplit = null;
  function openInfo(open) {
    if (open === infoOpen) return;
    infoOpen = open;
    info.setAttribute("aria-hidden", String(!open));
    infoTl?.kill();
    if (open) {
      const it = items[active];
      info.querySelector('[data-panel="num"]').textContent = `(${String(active + 1).padStart(2, "0")})`;
      info.querySelector('[data-panel="name"]').textContent = it.name;
      info.querySelector('[data-panel="work"]').textContent = it.work;
      info.querySelector(".lib-info__img .wf-img").dataset.label = it.photo;
      infoSplit?.revert();
      infoSplit = SplitText.create(info.querySelectorAll('[data-panel="name"], [data-panel="work"], .lib-info__desc'), { type: "lines", mask: "lines" });
      veil.style.pointerEvents = "auto";
      if (reduce) { gsap.set(veil, { autoAlpha: 1 }); gsap.set(panel, { clipPath: "inset(0% 0% 0% 0%)" }); gsap.set(closeBtn, { autoAlpha: 1 }); return; }
      infoTl = gsap.timeline()
        .fromTo(veil, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: "sine.out" }, 0)
        .fromTo(panel, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.35, ease: panelEase }, "<+0.25")
        .fromTo(info.querySelector(".lib-info__img"), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: visualEase }, "<+0.565")
        .fromTo(infoSplit.lines, { yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: "power3.out", stagger: 0.045 }, "<+0.43")
        .fromTo(info.querySelectorAll('[data-panel="num"], .lib-info__watch'), { yPercent: 125 }, { yPercent: 0, duration: 1, ease: "power3.out", stagger: { amount: 0.1 } }, "<+0.5")
        .fromTo(closeBtn, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "power3.out" }, "<");
    } else {
      const done = () => (veil.style.pointerEvents = "none");
      if (reduce) { gsap.set(veil, { autoAlpha: 0 }); gsap.set(panel, { clipPath: "inset(0% 0% 100% 0%)" }); done(); return; }
      infoTl = gsap.timeline({ onComplete: done })
        .to(closeBtn, { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 0)
        .to(panel, { clipPath: "inset(0% 0% 100% 0%)", duration: 1, ease: "expo.inOut" }, 0.1)
        .to(veil, { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, "<+0.3");
    }
  }
  title.addEventListener("click", () => openInfo(true));
  info.querySelector(".lib-info__close").addEventListener("click", () => openInfo(false));
  life.on(window, "keydown", (e) => { if (e.key === "Escape" && infoOpen) openInfo(false); });

  // ── First entrance: position goes from -20 → 0 in one 3s back.inOut(.54) turn, and cards switch on in .4s as they pass .85rad on the right.
  //    The band goes 0→.12 at 2.25 (1.5s sine.out), the upper text line starts at 2.5 with 1.25s and .0475 stagger, the lower text .25 later.
  // Original pS: only the corner text and the inner text of the view button rise to 2.75 (the button slot exists from the start). The lit button’s underline is removed and redrawn .5 later
  const corners = [...stage.querySelectorAll(".lib__corner, .lib__switch-btn > span")];
  // While waiting for fonts, corner text and active material text are hidden first so they don’t show early (the original starts with all panels hidden)
  if (!reduce) { gsap.set(corners, { autoAlpha: 0, y: 50 }); gsap.set([topEl, nextEl], { autoAlpha: 0 }); }
  function intro() {
    setActive(0, false);
    if (reduce) {
      strip.opacity.value = 0.12;
      slider.paused = false;
      return;
    }
    const lines = [...topEl.querySelectorAll(".lib__line > span"), ...nextEl.querySelectorAll(".lib__line > span")];
    gsap.set(lines, { yPercent: 100 });
    gsap.set([topEl, nextEl], { autoAlpha: 1 });
    const onBtn = stage.querySelector(".lib__switch-btn.is-active");
    onBtn?.classList.remove("is-active");
    gsap.set(corners, { autoAlpha: 0, y: 50 });
    cards.forEach((c) => (c.style.opacity = 0));
    const lit = new Set();
    let prev = null;
    const spin = { p: -N };
    const tl = gsap.timeline({ delay: CRL.arrived ? 0.45 : 0 });
    tl.to(spin, {
      p: 0, duration: 3, ease: "back.inOut(.54)",
      onUpdate: () => {
        slider.current = slider.target = spin.p;
        const ts = cards.map((c, i) => wrapHalf(i - spin.p) * STEP);
        if (prev) ts.forEach((t, i) => {
          if (!lit.has(i) && prev[i] > 0.85 && t <= 0.85 && prev[i] - t < 1) { lit.add(i); gsap.to(cards[i], { opacity: 1, duration: 0.4, ease: "sine.inOut" }); }
        });
        prev = ts;
      },
    }, 0)
      .add(() => gsap.to(cards.filter((c, i) => !lit.has(i)), { opacity: 1, duration: 0.4, ease: "sine.inOut" }), 3)
      .to(strip.opacity, { value: 0.12, duration: 1.5, ease: "sine.out" }, 2.25)
      .to(lines, { yPercent: 0, duration: 1.25, stagger: 0.0475, ease: "power3.out" }, 2.5)
      .to(corners, { autoAlpha: 1, y: 0, duration: 1, stagger: { amount: 0.3 }, ease: "power3.out", clearProps: "opacity,visibility,transform" }, 2.75)
      .add(() => onBtn?.classList.add("is-active"), 3.25)
      .add(() => { slider.current = slider.target = 0; slider.paused = false; }, 3.02);
  }

  fontsReady.then(life.wrap(() => { strip.resize(); measure(); intro(); }));
});
