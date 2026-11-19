// Common to all pages: the header, drawer and Footer are drawn in one place, and it hooks up smooth scroll, loader/curtain transition, letter roll, button ripple, line reveal, text fill, photo reveal, section overlap and the line-drawn room.
// Original values: line entrance 1.3s expo.out (≤.1s between lines, top 95%) · text fill 2s cubic-bezier(.16,1,.3,1) .18s per line · section overlap scales 0.6× over one screen height starting from bottom 50%
//           Menu text roll .8s at 45ms per letter · MENU button 90° .7s · curtain 1.6s cubic-bezier(.83,0,.17,1) delayed .2s
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("baIO", "M0,0 C0.87,0 0.13,1 1,1");
  CustomEase.create("baCurtain", "M0,0 C0.83,0 0.17,1 1,1");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const isPC = () => innerWidth >= 1024;
  const BA = (window.BA = { reduced, page, lenis: null, ready: null });

  const arw = '<svg viewBox="0 0 10 8" fill="none" stroke="currentColor" stroke-width="1.1"><path d="M0 4h9M5.6.6 9 4 5.6 7.4"/></svg>';
  BA.arw = arw;
  const word = "wordmark";

  const NAV = [
    ["about", "about.html", "Company info", "COMPANY"],
    ["feature", "index.html#feature", "Our Features", "OUR STRENGTH"],
    ["works", "works.html", "Sales results", "WORKS"],
    ["service", "service.html", "Business details", "SERVICE"],
    ["news", "news.html", "News", "NEWS"],
    ["recruit", "recruit.html", "Hiring Info", "RECRUIT"],
    ["partner", "#", "Collaboration Consultation", "PARTNERS"],
    ["contact", "#", "Contact Us", "CONTACT"],
  ];
  const current = page === "detail" ? "works" : page;

  // ── Header·Drawer
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.innerHTML = `
      <div class="ba-logo-box"><a class="ba-logo" href="index.html" aria-label="Home">${word}</a></div>
      <nav class="ba-nav" aria-label="Main menu"><ul>${NAV.map(([k, h, t]) => `<li class="${k === current ? "is-current" : ""}"><a href="${h}" data-roll>${t.replace(/ /g, "")}</a></li>`).join("")}</ul></nav>
      <button class="ba-menu-btn" type="button" aria-label="Open Menu" aria-expanded="false"><span class="ba-menu-btn__label"><span>MENU</span><span>MENU</span></span><span class="ba-menu-btn__x"></span></button>
      <div class="ba-glass" aria-hidden="true"></div>
      <div class="ba-drawer" data-slot="drawer-menu" aria-hidden="true">
        <div class="ba-drawer__wrap">
          <div class="ba-drawer__head">
            <div class="ba-pc"><span class="ba-word">${word}</span><a class="ba-drawer__addr ba-line is-hidden" href="#">Your company address here, one line · building name, 6F.</a></div>
            <div class="ba-drawer__links"><a class="ba-line is-hidden" href="#">Collaboration inquiry →</a><a class="ba-line is-hidden" href="#">Contact us →</a></div>
          </div>
          <nav class="ba-drawer__list">${[["index.html", 'TOP<i class="ba-pc"> PAGE</i>', "01", "First Page"], ["index.html#feature", '<i class="ba-pc">OUR </i>STRENGTH', "02", "Our Features"], ["works.html", "WORKS", "03", "Sales results"], ["about.html", "COMPANY", "04", "Company info"], ["service.html", "SERVICE", "05", "Business details"], ["recruit.html", "RECRUIT", "06", "Hiring Info"], ["news.html", "NEWS", "07", "News"]]
              .map(([h, en, n, ko], i) => `<div class="ba-drawer__item"><a class="ba-drawer__big" href="${h}" style="--i:${i}"><span>${en}</span></a><div class="ba-drawer__aside"><span>${n}</span><span>${ko}</span></div></div>`)
              .join("")}</nav>
        </div>
      </div>`;
  }

  // Original header: on wide screens at the very top, the logo sits 2rem, the menu 2.5rem and MENU 2rem below, then it rises with the scroll and sticks in place
  if (head) {
    const shift = () => {
      const on = innerWidth >= 1024, f = parseFloat(getComputedStyle(document.documentElement).fontSize), y = scrollY;
      [["--hs-logo", 2], ["--hs-nav", 2.5], ["--hs-menu", 2]].forEach(([k, r]) => head.style.setProperty(k, `${on ? Math.max(r * f - y, 0) : 0}px`));
    };
    shift();
    addEventListener("scroll", shift, { passive: true });
    addEventListener("resize", shift);
  }

  // ── Footer
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("ba-foot");
    foot.innerHTML = `
      <div class="ba-foot__cg" data-room="blue" aria-hidden="true"></div>
      <div class="ba-foot__cta">
        <div class="ba-foot__cta-item"><a class="ba-foot__cta-link" href="#"><span class="ba-track"><span class="ba-before">${arw}</span>Contact us ${arw}</span></a><p class="ba-foot__cta-text" data-lines>Your one-line quote and request guide here.<br>For detailed consultation, please use the contact form.</p><a class="ba-btn is-full ba-sp" href="#" data-btn>Contact form</a></div>
        <div class="ba-foot__cta-item"><a class="ba-foot__cta-link" href="#"><span class="ba-track"><span class="ba-before">${arw}</span>Collaboration inquiry ${arw}</span></a><p class="ba-foot__cta-text" data-lines>Your one-line note here for those considering a collaboration.<br>We have gathered information about transactions.</p><a class="ba-btn is-full ba-sp" href="#" data-btn>Learn more about collaboration</a></div>
      </div>
      <div class="ba-foot__mid">
        <nav class="ba-foot__nav"><ul>${NAV.map(([, h, t]) => `<li><a class="ba-line is-hidden" href="${h}">${t}</a></li>`).join("")}</ul></nav>
        <div class="ba-foot__info"><a class="ba-line is-hidden" href="#">Your company address · Building name, 6F</a><a class="ba-line is-hidden" href="#">TEL:00-0000-0000</a><a class="ba-line is-hidden" href="#">hello@example.com</a></div>
      </div>
      <div class="ba-foot__bottom">
        <div class="ba-foot__brand"><p class="ba-foot__logo">${word}</p><div class="ba-foot__legal"><span>© 2026 WORDMARK INC.</span><a class="ba-line is-hidden" href="#">Privacy policy</a></div></div>
        <p class="ba-foot__msg" data-fill><strong>Your company’s pledge, first line, goes here.</strong><br>Even so, the people living inside it <strong>It clearly stays with the day.</strong><br><strong>The less it shows, the more care it gets</strong> Working by hand.<br>That is how we treat the people who buy from us.</p>
      </div>`;
  }

  // ── Button: two sets of text (for rolling) · arrow — the ripple spreading from the entry point and the text roll come from the point-ripple-hover Motion part ──
  document.querySelectorAll("[data-btn]").forEach((b) => {
    const t = b.textContent.trim();
    b.classList.add("ba-btn");
    b.dataset.fx = "point-ripple-hover";
    b.innerHTML = `<span class="ba-btn__in" data-fx-part="roll"><span>${t}</span><span aria-hidden="true">${t}</span></span>${b.dataset.btn === "plain" ? "" : `<span class="ba-btn__arw">${arw}</span>`}`;
  });

  // ── Filter tags and page numbers also ripple in from where they enter and the letters roll, like the original
  document.querySelectorAll(".case-filter .ba-tag:not(.is-current), .ba-pager a:not(.is-ctrl)").forEach((a) => {
    const t = a.textContent.trim();
    a.dataset.fx = "point-ripple-hover";
    a.innerHTML = `<span data-fx-part="roll"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;
  });

  // ── Split each letter into a cube and roll it (header menu) — stays rolled while hovered, and on leave waits until the roll finishes and then reverts in one go
  document.querySelectorAll("[data-roll]").forEach((a) => {
    const t = a.textContent;
    a.innerHTML = `<span class="ba-roll">${[...t].map((c, i) => `<span class="ba-roll__c" style="--i:${i}"><span>${c}</span><span aria-hidden="true">${c}</span></span>`).join("")}</span>`;
    const full = 800 + (t.length - 1) * 45;
    let timer, at = 0;
    a.addEventListener("mouseenter", () => {
      clearTimeout(timer);
      a.classList.remove("is-rolled", "is-leaving");
      void a.offsetWidth;
      at = performance.now();
      a.classList.add("is-rolled");
    });
    a.addEventListener("mouseleave", () => {
      a.classList.add("is-leaving");
      clearTimeout(timer);
      timer = setTimeout(() => a.classList.remove("is-rolled", "is-leaving"), Math.max(0, full - (performance.now() - at)));
    });
  });

  // ── MENU button: on hover it turns 90° and its corners round, pressing opens a drawer
  const btn = document.querySelector(".ba-menu-btn");
  const drawer = document.querySelector(".ba-drawer");
  if (btn) {
    let spin = 0;
    btn.addEventListener("pointerenter", () => {
      if (spin) return;
      btn.classList.add("is-spin");
      spin = setTimeout(() => { btn.classList.remove("is-spin"); btn.classList.add("is-spun"); spin = 0; }, 780);
    });
    btn.addEventListener("pointerleave", () => {
      clearTimeout(spin);
      spin = 0;
      btn.classList.remove("is-spin", "is-spun");
    });
    const setDrawer = (open) => {
      document.documentElement.classList.toggle("is-drawer", open);
      btn.setAttribute("aria-expanded", open);
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      drawer.setAttribute("aria-hidden", !open);
      if (BA.lenis) open ? BA.lenis.stop() : BA.lenis.start();
    };
    btn.addEventListener("click", () => setDrawer(!document.documentElement.classList.contains("is-drawer")));
    addEventListener("keydown", (e) => e.key === "Escape" && setDrawer(false));
    drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setDrawer(false)));
  }

  // ── Smooth Scroll
  if (!reduced && window.Lenis) {
    const lenis = (BA.lenis = new Lenis({ lerp: 0.1 }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Line reveal: split [data-lines] into lines and raise them inside a mask
  const lineTargets = [...document.querySelectorAll("[data-lines]")];
  BA.splitLines = (el) => {
    if (el._split) return el._split;
    el._split = SplitText.create(el, { type: "lines", linesClass: "ba-ln", mask: "lines", maskClass: "ba-mask" });
    return el._split;
  };

  // ── Text fill: per line, a light layer and a dark layer overlap
  const fillTargets = [...document.querySelectorAll("[data-fill]")];
  const prepFill = (el) => {
    const split = SplitText.create(el, { type: "lines", linesClass: "ba-fill__base" });
    split.lines.forEach((ln, i) => {
      const wrap = document.createElement("span");
      wrap.className = "ba-fill__line";
      const on = ln.cloneNode(true);
      on.className = "ba-fill__on";
      on.removeAttribute("style");
      on.setAttribute("aria-hidden", "true");
      on.style.setProperty("--l", i);
      ln.before(wrap);
      wrap.append(ln, on);
    });
  };

  const mm = gsap.matchMedia();
  BA.mm = mm;

  // Attach entrance motion after the Hero ends (on Home, after the loader ends)
  const startReveals = () => {
    mm.add({ ok: "(prefers-reduced-motion: no-preference)", no: "(prefers-reduced-motion: reduce)" }, (c) => {
      if (c.conditions.no) {
        fillTargets.forEach((el) => el.classList.add("is-in"));
        document.querySelectorAll(".ba-reveal").forEach((el) => el.classList.add("is-in"));
        return;
      }
      lineTargets.forEach((el) => {
        const lines = BA.splitLines(el).lines;
        gsap.set(lines, { yPercent: 100, opacity: 0 });
        const stagger = lines.length > 1 ? Math.min(0.1, 1.2 / (lines.length - 1)) : 0;
        ScrollTrigger.create({
          trigger: el,
          start: el.dataset.start || "top 95%",
          once: true,
          onEnter: () => gsap.to(lines, { yPercent: 0, opacity: 1, duration: 1.3, ease: "expo.out", stagger, delay: +(el.dataset.delay || 0) }),
        });
      });
      fillTargets.forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => el.classList.add("is-in") }));
      document.querySelectorAll(".ba-reveal").forEach((el) => ScrollTrigger.create({ trigger: el, start: el.dataset.start || "top 85%", once: true, onEnter: () => el.classList.add("is-in") }));
      // Photo drifts slowly inside the frame
      document.querySelectorAll(".ba-scatter__track").forEach((t) =>
        gsap.fromTo(t, { xPercent: 6 }, { xPercent: -6, ease: "none", scrollTrigger: { trigger: t.parentElement, start: "top bottom", end: "bottom top", scrub: true } })
      );
      document.querySelectorAll(".ba-par > .wf-img").forEach((img) =>
        gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } })
      );
    });
    // A section is covered as it lays down 0.6x slower under the next section — wide screens only
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll("[data-sp]").forEach((el) => {
        const set = gsap.quickSetter(el, "y", "px");
        ScrollTrigger.create({
          trigger: el,
          start: "bottom 50%",
          end: () => "+=" + innerHeight,
          invalidateOnRefresh: true,
          onUpdate: (st) => set(Math.min(Math.max(0, st.scroll() - st.start), st.end - st.start) * 0.6),
          onRefreshInit: () => set(0),
        });
      });
    });
    // Contents: a single bordered pill frame glides to the cell currently being read (.5s cubic-bezier(.22,1,.36,1) — on first placement it only fades in over .2s)
    const toc = [...document.querySelectorAll(".ba-toc a")];
    toc.forEach((a) => {
      const t = a.textContent;
      a.innerHTML = `<span class="ba-toc__in"><span>${t}</span><span aria-hidden="true">${t}</span></span>`;
    });
    const tocBox = document.querySelector(".ba-toc");
    let frame = null;
    if (tocBox && toc.length) {
      frame = document.createElement("span");
      frame.className = "ba-toc__frame";
      frame.setAttribute("aria-hidden", "true");
      tocBox.append(frame);
    }
    const moveFrame = (a) => {
      if (!frame) return;
      const first = !frame.classList.contains("is-active");
      frame.classList.toggle("is-ready", first);
      frame.style.transform = `translate(${a.offsetLeft}px, ${a.offsetTop}px)`;
      frame.style.width = `${a.offsetWidth}px`;
      frame.style.height = `${a.offsetHeight}px`;
      requestAnimationFrame(() => { frame.classList.add("is-active"); frame.classList.remove("is-ready"); });
    };
    toc.forEach((a) => {
      const sec = document.querySelector(a.getAttribute("href"));
      if (!sec) return;
      ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (st) => st.isActive && (toc.forEach((x) => x.classList.toggle("is-current", x === a)), moveFrame(a)) });
      a.addEventListener("click", (e) => {
        e.preventDefault();
        BA.lenis ? BA.lenis.scrollTo(sec, { offset: -80 }) : sec.scrollIntoView();
      });
    });
    ScrollTrigger.refresh();
  };

  // ── Insulated structure room (in place of the original Insulation Structure CG): we build a room with insulation between floor joists, between wall studs and in the ceiling, out of our own box shapes.
  //    Original values: camera 33° · (0, .36, 14.2)→(0, -.05, 0) · fog 13~23 · automatic .65 rad/s (scroll speed ×.0012, up to 1.6 added, decaying as e^-3.2t)
  //              Mouse — camera orbit 12° left-right · 7° up-down (follows at 2.35/s), model tilt 15° left-right · 12° up-down (4.5/s) · drag .008 rad/px · vertical .0032 (-.23~.18)
  //              Walls facing the camera show through at .1 → .025 · the white panel lays the canvas at .5
  const ROOM_MIX = {
    // Share mixed from the base color toward white (+) or black (-) — values measured from the original two panels’ colors against the base color
    white: { structure: 0.52, pale: 0.63, panel: -0.042, wall: 0, furniture: 0.3, textile: 0.41, hardware: -0.058, seam: -0.118, glass: 0, insulation: 0.3, glow: -0.009, outline: -0.153, edge: -0.153 },
    blue: { structure: 0.27, pale: 0.41, panel: 0.16, wall: 0.85, furniture: 0.3, textile: 0.45, hardware: 0.65, seam: 0.26, glass: 0.77, insulation: 0.93, glow: 0.68, outline: 0.19, edge: 0.5 },
  };
  BA.room = (box, variant) => {
    if (!window.THREE) return null;
    const T = THREE, blue = variant === "blue";
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" }); } catch (e) { return null; }
    renderer.outputColorSpace = T.SRGBColorSpace;
    box.append(renderer.domElement);
    box.classList.add("ba-room", blue ? "is-blue" : "is-white");
    const probe = document.createElement("i");
    probe.style.color = blue ? "var(--kf-accent)" : "var(--kf-bg)";
    box.append(probe);
    // The skin may be in a form THREE can’t read, like oklch, so draw one dot and read it as rgb
    const swatch = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    swatch.fillStyle = getComputedStyle(probe).color;
    swatch.fillRect(0, 0, 1, 1);
    const [cr, cg, cb] = swatch.getImageData(0, 0, 1, 1).data;
    const base = new T.Color().setRGB(cr / 255, cg / 255, cb / 255, T.SRGBColorSpace);
    probe.remove();
    const white = new T.Color(1, 1, 1), black = new T.Color(0, 0, 0);
    const tone = (k) => { const m = ROOM_MIX[blue ? "blue" : "white"][k]; return base.clone().lerp(m >= 0 ? white : black, Math.abs(m)); };
    renderer.setClearColor(base, 1);
    const scene = new T.Scene();
    scene.fog = new T.Fog(base, 13, 23);
    const cam = new T.PerspectiveCamera(33, 1, 0.1, 60);
    const eye = new T.Vector3(0, 0.36, 14.2), aim = new T.Vector3(0, -0.05, 0);
    let dist = eye.distanceTo(aim), lift = Math.atan2(eye.y - aim.y, eye.z - aim.z);
    cam.position.copy(eye); cam.lookAt(aim);
    scene.add(new T.HemisphereLight(0xffffff, base, blue ? 2.6 : 3.05));
    const sun = new T.DirectionalLight(0xffffff, blue ? 0.54 : 0.42); sun.position.set(-5.5, 8.5, 7.5); scene.add(sun);
    const fill = new T.DirectionalLight(blue ? tone("glass") : base, blue ? 0.28 : 0.22); fill.position.set(6, -3, 6); scene.add(fill);

    const std = (k, o = {}) => new T.MeshStandardMaterial({ color: tone(k), roughness: o.r ?? 0.9, metalness: 0, transparent: !!o.op, opacity: o.op ?? 1, depthWrite: !o.op });
    const M = {
      structure: std("structure", { r: 0.84 }), pale: std("pale"), panel: std("panel", { r: 0.94 }), furniture: std("furniture", { r: 0.88 }), textile: std("textile", { r: 1 }),
      hardware: new T.MeshBasicMaterial({ color: tone("hardware") }), glass: std("glass", { r: 0.32, op: 0.11 }),
      insulation: new T.MeshStandardMaterial({ color: tone("insulation"), emissive: tone("glow"), emissiveIntensity: 0, roughness: 1, metalness: 0, transparent: true, opacity: 0.2, depthWrite: false }),
    };
    const walls = { back: std("wall", { op: 0.1 }), left: std("wall", { op: 0.1 }), right: std("wall", { op: 0.1 }) };
    const line = new T.LineBasicMaterial({ color: tone("outline") }), edge = new T.LineBasicMaterial({ color: tone("edge"), transparent: true });
    const seam = new T.MeshBasicMaterial({ color: tone("seam") });
    const unit = new T.BoxGeometry(1, 1, 1), unitEdges = new T.EdgesGeometry(unit);
    const owned = [unit, unitEdges];
    const model = new T.Group();
    const blk = (mat, [w, h, d], [x, y, z], outline = true) => {
      const m = new T.Mesh(unit, mat);
      m.scale.set(w, h, d); m.position.set(x, y, z);
      if (outline) { const e = new T.LineSegments(unitEdges, line); e.scale.setScalar(1.003); m.add(e); }
      model.add(m);
      return m;
    };
    // One block of insulation — a cotton panel made by finely subdividing a box and gently puffing the surface
    const batt = ([w, h, d], [x, y, z], seed) => {
      const g = new T.BoxGeometry(w, h, d, 4, Math.max(2, Math.round(h * 6)), Math.max(2, Math.round(d * 6)));
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i);
        const amp = Math.min(0.016, Math.min(w, h, d) * 0.06);
        pos.setXYZ(i, px + Math.sin(py * 5.7 + pz * 6.9 + seed) * amp, py + Math.sin(pz * 4.3 + px * 7.7 + seed) * amp * 0.8, pz + Math.cos(py * 5.1 + px * 8.2 + seed) * amp);
      }
      g.computeVertexNormals();
      const eg = new T.EdgesGeometry(g, 38);
      owned.push(g, eg);
      const m = new T.Mesh(g, M.insulation);
      m.position.set(x, y, z);
      m.add(new T.LineSegments(eg, edge));
      model.add(m);
    };
    const W = 6.4, D = 4.2, hw = W / 2, hd = D / 2, step = 5.72 / 8;
    // Four supports, a floor border, nine joists, eight insulation pieces between the joists
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => blk(M.structure, [0.48, 0.28, 0.5], [a * 3.16, -0.46, b * 2.06]));
    blk(M.structure, [W + 0.18, 0.26, 0.2], [0, -0.18, -hd]); blk(M.structure, [W + 0.18, 0.26, 0.2], [0, -0.18, hd]);
    blk(M.structure, [0.2, 0.26, D], [-hw, -0.18, 0]); blk(M.structure, [0.2, 0.26, D], [hw, -0.18, 0]);
    for (let i = 0; i < 9; i++) blk(M.structure, [0.22, 0.3, D - 0.16], [-2.86 + i * step, -0.12, 0]);
    const bays = Array.from({ length: 8 }, (_, i) => -2.86 + (i + 0.5) * step);
    bays.forEach((x, i) => batt([0.46, 0.17, 3.46], [x, -0.1, -0.25], 2.7 + i * 0.7));
    blk(M.pale, [W - 0.2, 0.12, D - 0.18], [0, 0.11, 0]);
    blk(M.panel, [W - 0.3, 0.055, D - 0.28], [0, 0.205, 0], false);
    for (let i = 0; i < 14; i++) blk(seam, [0.008, 0.004, D - 0.34], [-2.92 + i * 0.45, 0.237, 0], false);
    // Back wall (four boards leaving a window hole) with insulation and studs inside
    const wz = -2.02, wx = -1.15, ww = 1.65, sill = 1, head = 3.12, top = 3.34;
    blk(walls.back, [wx - ww / 2 + hw - 0.08, top - 0.28, 0.13], [(-hw + wx - ww / 2) / 2, (top + 0.28) / 2, wz]);
    blk(walls.back, [hw - wx - ww / 2 - 0.08, top - 0.28, 0.13], [(wx + ww / 2 + hw) / 2, (top + 0.28) / 2, wz]);
    blk(walls.back, [ww, sill - 0.28, 0.13], [wx, (sill + 0.28) / 2, wz]);
    blk(walls.back, [ww, top - head, 0.13], [wx, (top + head) / 2, wz]);
    [-2.72, -2.2, 0.2, 0.72, 1.3, 1.82, 2.4].forEach((x) => blk(M.structure, [0.16, 3.0, 0.16], [x, 1.8, wz - 0.02]));
    [[-2.46, 0.5], [0.46, 0.5], [1.06, 0.5], [2.1, 0.7]].forEach(([x, w], i) => batt([w, 2.9, 0.12], [x, 1.82, wz - 0.03], 4.1 + i));
    [-1.98, -0.32, 0.82, 1.93].forEach((x) => blk(seam, [0.012, 2.98, 0.016], [x, 1.8, wz + 0.075], false));
    // Two side walls — insulation between the studs, the outer panel reflects when facing the camera
    [-1, 1].forEach((side) => {
      const x = side * 3.0, mat = side < 0 ? walls.left : walls.right;
      blk(mat, [0.13, 3.06, side < 0 ? 2.18 : 2.86], [x, 1.81, side < 0 ? -0.93 : -0.59]);
      if (side < 0) blk(mat, [0.13, 0.48, 1.02], [x, 3.1, 0.7]);
      [-2.02, side < 0 ? 0.16 : 0.85, 1.24].forEach((z) => blk(M.structure, [0.18, 3.58, 0.18], [x, 1.74, z]));
      blk(M.structure, [0.22, 3.98, 0.22], [x, 1.65, 2.07]);
      batt([0.12, 2.96, side < 0 ? 1.96 : 2.65], [side * 3.18, 1.82, side < 0 ? -0.93 : -0.585], side < 0 ? 6.2 : 8.1);
      for (let z = -1.82; z <= (side < 0 ? 0.08 : 0.72); z += 0.19) blk(seam, [0.014, 2.88, 0.008], [side * 3.005, 1.81, z], false);
    });
    // Left wall door frame
    blk(M.pale, [0.07, 2.4, 0.96], [-3.0, 1.49, 0.7]);
    blk(M.structure, [0.07, 2.54, 0.09], [-2.94, 1.55, 0.18]); blk(M.structure, [0.07, 2.54, 0.09], [-2.94, 1.55, 1.22]); blk(M.structure, [0.07, 0.09, 1.12], [-2.94, 2.82, 0.7]);
    // Ceiling joists, insulation, rim, corner posts
    for (let i = 0; i < 9; i++) blk(M.structure, [0.22, 0.3, D - 0.12], [-2.86 + i * step, 3.62, 0]);
    bays.forEach((x, i) => batt([0.46, 0.17, 3.46], [x, 3.61, -0.25], 15.4 + i * 0.7));
    blk(M.structure, [W + 0.22, 0.2, 0.2], [0, 3.86, -hd]); blk(M.structure, [W + 0.22, 0.2, 0.2], [0, 3.86, hd]);
    blk(M.structure, [0.2, 0.2, D], [-hw, 3.86, 0]); blk(M.structure, [0.2, 0.2, D], [hw, 3.86, 0]);
    [[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd]].forEach(([x, z]) => blk(M.structure, [0.24, 4.34, 0.24], [x, 1.68, z]));
    // Window frame, glass, and radiator under the window
    const l = wx - ww / 2, r = wx + ww / 2;
    blk(M.structure, [1.82, 0.1, 0.13], [wx, sill, -1.91]); blk(M.structure, [1.82, 0.1, 0.13], [wx, head, -1.91]);
    blk(M.structure, [0.1, 2.2, 0.13], [l, 2.06, -1.91]); blk(M.structure, [0.1, 2.2, 0.13], [r, 2.06, -1.91]);
    blk(M.structure, [1.63, 0.08, 0.12], [wx, 2.56, -1.87]); blk(M.structure, [0.07, 1.48, 0.12], [wx, 1.78, -1.87]);
    blk(M.glass, [1.5, 0.46, 0.025], [wx, 2.82, -1.93], false); blk(M.glass, [0.69, 1.35, 0.025], [wx - 0.39, 1.8, -1.93], false); blk(M.glass, [0.69, 1.35, 0.025], [wx + 0.39, 1.8, -1.93], false);
    blk(M.furniture, [1.35, 0.07, 0.2], [wx, 0.96, -1.72]); blk(M.furniture, [1.35, 0.07, 0.2], [wx, 0.43, -1.72]);
    for (let i = 0; i < 14; i++) blk(M.pale, [0.04, 0.235, 0.04], [wx - 0.53 + i * 0.082, 0.7, -1.68], false);
    // Dresser (left), bed (back), wardrobe (front right)
    blk(M.furniture, [0.62, 1.28, 0.86], [-2.5, 0.88, 0.43]); blk(M.furniture, [0.62, 0.92, 0.72], [-2.5, 0.7, -0.42]);
    blk(M.pale, [0.64, 0.09, 0.92], [-2.48, 1.55, 0.4]); blk(M.pale, [0.64, 0.09, 0.82], [-2.48, 1.2, -0.42]);
    for (let i = 0; i < 3; i++) blk(M.panel, [0.035, 0.2, 0.6], [-2.17, 0.46 + i * 0.25, -0.42]);
    blk(M.structure, [2.62, 0.14, 0.98], [0.89, 0.43, -1.33]); blk(M.textile, [2.5, 0.17, 0.92], [0.84, 0.57, -1.33]);
    blk(M.textile, [1.58, 0.055, 0.94], [0.32, 0.69, -1.33]); blk(M.structure, [0.12, 0.84, 1.02], [2.17, 0.63, -1.33]);
    blk(M.textile, [0.39, 0.1, 0.27], [1.66, 0.72, -1.34]);
    blk(M.furniture, [1.05, 1.48, 1], [2.66, 0.98, 1.12]);
    blk(M.panel, [0.46, 1.34, 0.035], [2.4, 0.98, 1.635]); blk(M.panel, [0.46, 1.34, 0.035], [2.92, 0.98, 1.635]);

    // Group order: floor (tilt up/down) → left/right tilt → model (rotation)
    const ground = new T.Group(), sway = new T.Group(), spin = new T.Group();
    ground.position.y = -1.63;
    scene.add(ground); ground.add(sway); sway.add(spin); spin.add(model);
    const YAW0 = -0.04, PITCH0 = -0.018;
    let yaw = YAW0, yawTo = YAW0, pitch = PITCH0, pitchTo = PITCH0, boost = 0, tiltX = 0, tiltY = 0;
    let ptr = { x: 0, y: 0 }, drag = null, last = 0, vis = false, on = true;
    const auto = !reduced;
    const size = () => {
      const rc = box.getBoundingClientRect();
      if (!rc.width || !rc.height) return;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.8));
      renderer.setSize(rc.width, rc.height, false);
      const asp = rc.width / rc.height;
      cam.aspect = asp;
      eye.set(0, asp < 0.82 ? 0.26 : 0.36, Math.max(14.2, 15.3 / Math.min(1.08, Math.max(0.7, asp))));
      dist = eye.distanceTo(aim); lift = Math.atan2(eye.y - aim.y, eye.z - aim.z);
      cam.position.copy(eye); cam.lookAt(aim); cam.updateProjectionMatrix();
    };
    size();
    new ResizeObserver(size).observe(box);
    new IntersectionObserver(([e]) => (vis = e.isIntersecting), { rootMargin: "160px" }).observe(box);
    const ease = (k, dt) => 1 - Math.exp(-dt * k);
    const smooth = (t) => t * t * (3 - 2 * t);
    const fadeOf = (v) => { const t = Math.min(1, Math.max(0, (v - 0.24) / 0.62)); return 0.1 - smooth(t) * (0.1 - 0.025); };
    gsap.ticker.add((time) => {
      if (!vis || !on) { last = 0; return; }
      const dt = Math.min(0.05, Math.max(0.001, last ? time - last : 1 / 60));
      last = time;
      if (auto && !drag) yawTo += (0.65 + boost) * dt;
      boost *= Math.exp(-dt * 3.2);
      yaw += (yawTo - yaw) * ease(drag ? 15 : 6.5, dt);
      pitch += (pitchTo - pitch) * ease(drag ? 7.5 : 2.2, dt);
      const g = auto && !drag ? 1 : 0;
      const oy = ptr.x * T.MathUtils.degToRad(12) * g, ox = lift - ptr.y * T.MathUtils.degToRad(7) * g;
      const flat = dist * Math.cos(ox), k = ease(2.35, dt);
      cam.position.x += (aim.x + flat * Math.sin(oy) - cam.position.x) * k;
      cam.position.y += (aim.y + dist * Math.sin(ox) - cam.position.y) * k;
      cam.position.z += (aim.z + flat * Math.cos(oy) - cam.position.z) * k;
      cam.lookAt(aim);
      const kt = ease(4.5, dt);
      tiltY += (-ptr.x * T.MathUtils.degToRad(15) * g - tiltY) * kt;
      tiltX += (-ptr.y * T.MathUtils.degToRad(12) * g - tiltX) * kt;
      ground.rotation.x = tiltX; sway.rotation.y = tiltY;
      spin.rotation.set(pitch, yaw, 0);
      const face = yaw + tiltY - Math.atan2(cam.position.x - aim.x, cam.position.z - aim.z), kw = ease(7, dt);
      walls.left.opacity += (fadeOf(Math.max(0, Math.sin(face))) - walls.left.opacity) * kw;
      walls.right.opacity += (fadeOf(Math.max(0, -Math.sin(face))) - walls.right.opacity) * kw;
      walls.back.opacity += (fadeOf(Math.max(0, -Math.cos(face))) - walls.back.opacity) * kw;
      renderer.render(scene, cam);
    });
    // The camera turns toward the mouse position anywhere on screen, and faster when scrolling is fast
    addEventListener("pointermove", (e) => { if (e.pointerType === "mouse" && !drag) ptr = { x: Math.max(-1, Math.min(1, (e.clientX / innerWidth) * 2 - 1)), y: Math.max(-1, Math.min(1, (e.clientY / innerHeight) * 2 - 1)) }; }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => (ptr = { x: 0, y: 0 }));
    let sy = scrollY, st = performance.now();
    addEventListener("scroll", () => {
      const now = performance.now(), v = (Math.abs(scrollY - sy) * 1000) / Math.min(80, Math.max(16, now - st));
      sy = scrollY; st = now;
      boost = Math.min(1.6, v * 0.0012);
    }, { passive: true });
    box.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      try { box.setPointerCapture(e.pointerId); } catch (err) {}
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    });
    box.addEventListener("pointermove", (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      yawTo += (e.clientX - drag.x) * 0.008;
      if (e.pointerType !== "touch") pitchTo = Math.max(-0.23, Math.min(0.18, pitchTo + (e.clientY - drag.y) * 0.0032));
      drag.x = e.clientX; drag.y = e.clientY;
    });
    const up = (e) => { if (!drag || drag.id !== e.pointerId) return; drag = null; pitchTo = PITCH0; };
    box.addEventListener("pointerup", up);
    box.addEventListener("pointercancel", up);
    return {
      reset: () => { yaw = yawTo = YAW0; pitch = pitchTo = PITCH0; ptr = { x: 0, y: 0 }; },
      pause: (v) => (on = !v),
    };
  };
  document.querySelectorAll("[data-room]").forEach((b) => (b._room = BA.room(b, b.dataset.room)));

  // ── Loader (home) / curtain (only when a sub-page is refreshed)
  //    The original does not cover the screen when moving between pages. Reloading a subpage makes the logo roll in as a cube over a teal curtain (1.1s expo.out),
  //    After .45s the curtain lifts upward (1.6s cubic-bezier(.83,0,.17,1) delayed by .2s) and after .3s the logo rolls up and out (1.1s cubic-bezier(.87,0,.13,1)). .8s after that the headline rises
  const curtain = document.createElement("div");
  curtain.className = "ba-curtain";
  curtain.setAttribute("aria-hidden", "true");
  curtain.innerHTML = `<div class="ba-curtain__bg"></div><div class="ba-curtain__word"><span class="ba-curtain__cube"><span>${word}</span></span></div>`;
  document.body.append(curtain);
  const reload = performance.getEntriesByType?.("navigation")[0]?.type === "reload";

  BA.ready = new Promise((resolve) => {
    const done = () => {
      fillTargets.forEach(prepFill);
      startReveals();
      resolve();
      // The original draws the first frame, rests .1s, then raises the heading text — the heading photo (sheet-curl-in on: ba:heading) floats up with it at this moment
      setTimeout(() => dispatchEvent(new Event("ba:heading")), 100);
    };
    if (page === "home" && window.BA_HOME_LOADER) return window.BA_HOME_LOADER(done);
    if (reduced || !reload) return done();
    document.documentElement.classList.add("is-reload");
    if (BA.lenis) BA.lenis.stop();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      curtain.classList.add("is-in");
      setTimeout(() => {
        curtain.classList.add("is-out");
        document.documentElement.classList.add("is-reload-out");
        setTimeout(() => {
          curtain.classList.add("is-logo-out");
          setTimeout(() => {
            document.documentElement.classList.remove("is-reload");
            if (BA.lenis) BA.lenis.start();
            done();
          }, 800);
        }, 300);
      }, 450);
    }));
  });
})();
