(() => {
  const { reduce, hover } = window.dhSite;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mm = gsap.matchMedia();

  // Covering plates — the first plate comes up inset 2.5rem on each side with 24px rounded top corners, then fills the full width at 40% before the screen (scrub .35), the inner plate .94 → 1
  const card = $(".dh-card");
  mm.add("(prefers-reduced-motion: no-preference) and (hover: hover)", () => {
    const inset = () => getComputedStyle(card).getPropertyValue("--inset").trim() || "2.5rem";
    const st = { trigger: card, start: 0, end: () => card.getBoundingClientRect().top + scrollY - .4 * innerHeight, scrub: .35, invalidateOnRefresh: true };
    gsap.fromTo(card, { clipPath: () => `inset(0rem ${inset()} 0rem ${inset()} round 24px 24px 0rem 0rem)` }, { clipPath: "inset(0rem 0rem 0rem 0rem round 0px 0px 0px 0px)", ease: "none", scrollTrigger: st });
    gsap.fromTo(card.firstElementChild, { scale: .94 }, { scale: 1, ease: "none", scrollTrigger: st });
  });

  // Star heading — the star grows from 0 in .5s and words float up from 8px below at .1 intervals. The star turns half a turn while passing through the section
  const eb = $("[data-star-words]");
  if (eb && !reduce) {
    const star = $("[data-star]", eb), words = $$("[data-word]", eb);
    gsap.timeline({ scrollTrigger: { trigger: eb, start: "top 85%", once: true } })
      .from(star, { scale: 0, transformOrigin: "50% 50%", duration: .5, ease: "reveal-expo" })
      .from(words, { autoAlpha: 0, y: 8, duration: .4, ease: "reveal-expo", stagger: .1 }, "-=0.15");
    gsap.to(star, { rotation: 180, ease: "none", scrollTrigger: { trigger: eb, start: "top bottom", end: "bottom top", scrub: true } });
  }

  // Crosshair — follows the cursor inside the section with .3s power3.out, and returns to the center rest position when it leaves the section
  const rules = $(".dh-rules");
  mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
    if (!rules) return;
    const v = $(".dh-rules__v", rules), h = $(".dh-rules__h", rules), mk = $(".dh-rules__mark", rules), host = rules.parentElement;
    const qx = gsap.quickTo([v, mk], "x", { duration: .3, ease: "power3.out" }), qy = gsap.quickTo([h, mk], "y", { duration: .3, ease: "power3.out" });
    let px = -1, py = -1, inside = false;
    const onMove = (e) => { px = e.clientX; py = e.clientY; };
    const tick = () => {
      if (px < 0) return;
      const r = host.getBoundingClientRect();
      if (px < r.left || px > r.right || py < r.top || py > r.bottom) { if (inside) { inside = false; qx(0); qy(0); } return; }
      inside = true;
      qx(px - r.left - v.offsetLeft);
      qy(py - r.top - h.offsetTop);
    };
    addEventListener("pointermove", onMove, { passive: true });
    gsap.ticker.add(tick);
    return () => { removeEventListener("pointermove", onMove); gsap.ticker.remove(tick); };
  });

  // Three key points — when the word head passes 30% of the screen that step turns on (the number rolls over), and the photo drifts ±5% and alternates within a 16% screen-width range
  const keys = $(".dh-keys");
  if (keys) {
    const steps = $$(".dh-keys__step", keys), visuals = $$(".dh-keys__visual", keys), nums = $(".dh-keys__nums", keys), fill = $(".dh-keys__bar span", keys), wrap = $(".dh-keys__visuals", keys);
    const LINE = .3, FADE = .16;
    const top = (el) => el.getBoundingClientRect().top + scrollY;
    const at = (i) => top(steps[i]) - LINE * innerHeight;
    const update = () => {
      let a = 0;
      steps.forEach((s, i) => { if (scrollY >= at(i)) a = i; });
      steps.forEach((s, i) => { s.toggleAttribute("data-on", i === a); s.toggleAttribute("data-past", i < a); });
      nums.style.setProperty("--k", a);
      [...nums.children].forEach((n) => n.style.setProperty("--k", a));
    };
    steps.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: () => at(i), end: () => at(i) + s.offsetHeight, invalidateOnRefresh: true, onToggle: update, onRefresh: update }));
    update();
    if (!reduce) {
      const drift = () => wrap.parentElement.offsetHeight * .05;
      gsap.fromTo(wrap, { y: () => drift() }, { y: () => -drift(), ease: "none", scrollTrigger: { trigger: keys, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
      const half = () => FADE / 2 * innerHeight;
      visuals.forEach((vis, i) => { if (i) gsap.fromTo(vis, { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: keys, start: () => at(i) - half(), end: () => at(i) + half(), scrub: true, invalidateOnRefresh: true } }); });
      gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: keys, start: "top top", end: () => at(steps.length - 1) + half(), scrub: true, invalidateOnRefresh: true } });
    }
  }

  // Review stack — same table as the original: position, tilt, size and opacity are set by the number of slots away from the center (active) card (at width 767 or less, side shift is .55x).
  // Pressing a dot or dragging and dropping a card (faster than 300px/s or more than 10% of the width) changes the active one, and everything moves with .6s elastic.out(1.2, 1). While dragging, the two positions are blended by the dragged amount
  const deck = $("[data-deck]");
  if (deck) {
    const cards = $$("[data-card]", deck), dots = $$(".dh-flick__dot", deck), u = cards.length;
    const wrap = $("[data-quote]"), qText = $("[data-quote-text]"), qName = $("[data-quote-name]"), qRole = $("[data-quote-role]");
    const side = () => (innerWidth <= 767 ? .55 : 1);
    const spot = (dist, f) => {
      const s = dist < 0 ? -1 : 1, side = dist < 0 ? "before" : "after";
      switch (Math.abs(dist)) {
        case 0: return { x: 0, y: 0, rot: 0, scale: 1, z: 5, op: 1, status: "active" };
        case 1: return { x: 25 * s * f, y: 1, rot: 10 * s * f, scale: .9, z: 4, op: .75, status: `2-${side}` };
        case 2: return { x: 45 * s * f, y: 5, rot: 15 * s * f, scale: .8, z: 3, op: .5, status: `3-${side}` };
        default: return { x: 55 * s * f, y: 5, rot: 20 * s * f, scale: .6, z: 2, op: 0, status: "hidden" };
      }
    };
    const mod = (a, n) => ((a % n) + n) % n;
    const gap = (i, act) => { let r = mod(i - act, u); if (r > u / 2) r -= u; return r; };
    const mix = (a, b, t) => a + (b - a) * t;
    let active = 0;
    const lay = (act, animate) => {
      const f = side();
      cards.forEach((c, i) => {
        const o = spot(gap(i, act), f);
        c.setAttribute("data-status", o.status);
        gsap.set(c, { zIndex: o.z });
        const to = { x: 0, y: 0, xPercent: o.x, yPercent: o.y, rotation: o.rot, scale: o.scale };
        if (animate) {
          gsap.to(c, { ...to, duration: .6, ease: "elastic.out(1.2, 1)", overwrite: "auto" });
          gsap.to(c, { autoAlpha: o.op, duration: .6, ease: "power2.out", overwrite: "auto" });
        } else gsap.set(c, { ...to, autoAlpha: o.op });
      });
    };
    const pick = (i) => {
      if (i === active) return lay(active, true);
      active = i;
      dots.forEach((dt, k) => dt.classList.toggle("is-on", k === i));
      const c = cards[i];
      qText.textContent = c.dataset.text;
      qName.textContent = c.dataset.name;
      qRole.textContent = c.dataset.role;
      wrap.classList.remove("is-in");
      void wrap.offsetWidth;
      wrap.classList.add("is-in");
      lay(i, true);
    };
    dots.forEach((dt, k) => dt.addEventListener("click", () => pick(k)));
    if (reduce) lay(active, false);
    else {
      lay(active, false);
      gsap.registerPlugin(Draggable, InertiaPlugin);
      deck.setAttribute("data-drag", "grab");
      let sx = 0, sy = 0, moved = false;
      const drags = cards.map((c) => Draggable.create($("[data-dragger]", c), {
        type: "x",
        onPress() { sx = this.pointerX; sy = this.pointerY; moved = false; gsap.killTweensOf(cards); deck.setAttribute("data-drag", "grabbing"); },
        onDragStart() { moved = true; },
        onDrag() {
          const w = deck.offsetWidth || 1, t = this.x / w, cur = active, nxt = mod(cur + (t < 0 ? 1 : -1), u), k = Math.min(Math.abs(t), 1), f = side();
          cards.forEach((card, i) => {
            const a1 = spot(gap(i, cur), f), b1 = spot(gap(i, nxt), f);
            if (a1.status === "hidden" && b1.status === "hidden") return;
            gsap.set(card, { x: 0, y: 0, xPercent: mix(a1.x, b1.x, k), yPercent: mix(a1.y, b1.y, k), rotation: mix(a1.rot, b1.rot, k), scale: mix(a1.scale, b1.scale, k), autoAlpha: mix(a1.op, b1.op, k), zIndex: k > .5 ? b1.z : a1.z });
            const st = k > .5 ? b1.status : a1.status;
            if (card.getAttribute("data-status") !== st) card.setAttribute("data-status", st);
          });
        },
        onRelease() {
          deck.setAttribute("data-drag", "grab");
          const w = deck.offsetWidth || 1, t = this.x / w;
          gsap.to(this.target, { x: 0, duration: .3, ease: "power1.out" });
          if (!moved) return lay(active, true);
          if (Math.hypot(this.pointerX - sx, this.pointerY - sy) < 4) {
            const tg = this.target;
            tg.style.pointerEvents = "none";
            document.elementFromPoint(this.pointerX, this.pointerY)?.click();
            tg.style.pointerEvents = "";
            return lay(active, true);
          }
          const v = InertiaPlugin.getVelocity(this.target, "x"), fast = Math.abs(v) > 300, far = Math.abs(t) > .1;
          if (fast || far) pick(mod(active + (fast ? (v < 0 ? 1 : -1) : (t < 0 ? 1 : -1)), u));
          else lay(active, true);
        },
      })[0]);
      addEventListener("resize", () => lay(active, false), { passive: true });
      void drags;
    }
  }

  // Logo row — every 2.6s it picks one of the cells visible in the first row in random order and swaps it with a hidden logo: the outgoing logo fades 50% upward in 1.1s,
  // The incoming logo rises from 50% below after .1s (signature curve). It pauses on hover, and also pauses when off-screen or in a hidden tab
  const logoRow = $(".dh-logos"), logoTrack = $("[data-logos]");
  if (logoRow && logoTrack && !reduce) {
    const items = $$(".dh-logos__item", logoTrack), names = items.map((li) => li.textContent.trim());
    const order = names.map((_, i) => i);
    const shuffle = (n, off = 0) => { const a = Array.from({ length: Math.max(0, n) }, (_, i) => i + off); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    let shown = 0, slots = [], si = 0, pool = [], paused = false, timer = 0, onScreen = true;
    const measure = () => {
      const h = logoRow.clientHeight;
      let n = 0;
      for (const li of items) { if (li.offsetTop + li.offsetHeight > h + 1) break; n++; }
      if (n !== shown) { shown = n; slots = shuffle(n); si = 0; pool = shuffle(items.length - n, n); }
    };
    const swap = () => {
      if (paused || !shown || !pool.length) return;
      if (slots.length !== shown || si >= shown) { slots = shuffle(shown); si = 0; }
      const pos = slots[si++], spare = pool.shift();
      pool.push(spare);
      const outName = order[pos];
      [order[pos], order[spare]] = [order[spare], order[pos]];
      const li = items[pos], old = li.querySelector(".dh-logos__target:not([data-out])");
      old?.setAttribute("data-out", "");
      const nu = document.createElement("span");
      nu.className = "dh-logos__target";
      nu.setAttribute("data-in", "");
      nu.innerHTML = `<span class="t-xsmall dh-logos__name">${names[order[pos]]}</span>`;
      nu.addEventListener("animationend", () => { old?.remove(); nu.removeAttribute("data-in"); }, { once: true });
      li.append(nu);
      void outName;
    };
    const run = () => { const on = onScreen && !document.hidden; if (on && !timer) timer = setInterval(swap, 2600); else if (!on && timer) { clearInterval(timer); timer = 0; } };
    measure();
    new ResizeObserver(measure).observe(logoRow);
    new IntersectionObserver(([e]) => { onScreen = e?.isIntersecting ?? true; run(); }, { rootMargin: "20% 0px" }).observe(logoRow);
    document.addEventListener("visibilitychange", run);
    logoRow.addEventListener("pointerenter", () => (paused = true));
    logoRow.addEventListener("pointerleave", () => (paused = false));
    run();
  }

  // Map — our terrain board (three.js): noise-raised land and flat sea lit obliquely from above, and as the section passes the camera descends from high up to the first city
  const mapHost = $("[data-globe]");
  if (mapHost && window.THREE) {
    const ready = () => !document.documentElement.hasAttribute("data-loader");
    const arm = () => {
      const io = new IntersectionObserver((es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        mapHost.setAttribute("data-phase", "chargement");
        requestAnimationFrame(() => { buildMap(mapHost); requestAnimationFrame(() => mapHost.setAttribute("data-phase", "pret")); });
      }, { rootMargin: "300% 0px" });
      io.observe(mapHost);
    };
    if (ready()) arm();
    else { const mo = new MutationObserver(() => { if (ready()) { mo.disconnect(); arm(); } }); mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-loader"] }); }
  }

  function buildMap(host) {
    const THREE = window.THREE;
    const sec = host.closest(".dh-map"), stick = host.parentElement, dotsBox = $("[data-dots]", stick), out = $(".dh-map__out", stick);
    const cityName = $("[data-city-name]", stick), nextName = $("[data-next-name]", stick), count = $("[data-count]", stick), fillBar = $("[data-map-fill]", stick);
    const css = getComputedStyle(document.documentElement);
    const col = (n) => new THREE.Color(css.getPropertyValue(n).trim() || "white");
    const land = col("--kf-surface"), sea = col("--kf-line"), shadow = col("--kf-dim"), paper = col("--kf-bg");

    const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
    const noise = (x, y) => {
      const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
      const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
      const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
    const fbm = (x, y) => { let s = 0, a = .5, f = 1; for (let i = 0; i < 5; i++) { s += a * noise(x * f, y * f); a *= .5; f *= 2.03; } return s; };
    const W = 16, D = 10;
    const geo = new THREE.PlaneGeometry(W, D, 240, 150);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, colors = new Float32Array(pos.count * 3), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const mask = fbm(x * .18 + 3.1, z * .18 + 1.7) + .18 - Math.max(0, Math.abs(z) - 3.6) * .12;
      const isLand = mask > .52;
      const ridge = 1 - Math.abs(fbm(x * .55, z * .55) * 2 - 1);
      const h = isLand ? (mask - .52) * 1.2 + ridge * ridge * .55 * Math.min(1, (mask - .52) * 6) : 0;
      pos.setY(i, h);
      if (isLand) c.copy(land).lerp(shadow, Math.max(0, .35 - h) * .25);
      else c.copy(sea).lerp(paper, .25);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = paper;
    scene.fog = new THREE.Fog(paper, 14, 26);
    const cam = new THREE.PerspectiveCamera(35, 1, .1, 100);
    const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
    scene.add(mesh);
    scene.add(new THREE.HemisphereLight(land, shadow, 1.4));
    const sun = new THREE.DirectionalLight(land, 1.6);
    sun.position.set(-6, 8, 4);
    scene.add(sun);

    const NAMES = ["City One", "City Two", "City Three", "City Four", "City Five", "City Six", "City Seven", "City Eight", "City Nine", "City Ten"];
    const SPOTS = [[1.2, -.4], [-.2, .3], [2.6, .5], [.4, 1.4], [-1.6, 1.8], [-2.8, 2.6], [-4.2, .2], [-3.2, -1.6], [-1.4, -1.2], [3.6, -3.4]];
    const ray = new THREE.Raycaster();
    const cities = SPOTS.map(([x, z], i) => {
      ray.set(new THREE.Vector3(x, 10, z), new THREE.Vector3(0, -1, 0));
      const hit = ray.intersectObject(mesh)[0];
      const p = new THREE.Vector3(x, hit ? hit.point.y : .2, z);
      const dot = document.createElement("a");
      dot.className = "dh-dot";
      dot.href = "cities.html";
      dot.innerHTML = `<span class="t-over">AAA</span><i></i><span class="t-xsmall">${NAMES[i]}</span>`;
      dotsBox.append(dot);
      return { p, dot, name: NAMES[i] };
    });

    let active = 0;
    const look = new THREE.Vector3(), eye = new THREE.Vector3();
    const focus = { x: cities[0].p.x, z: cities[0].p.z };
    const wide = { pos: new THREE.Vector3(0, 15, 9), at: new THREE.Vector3(0, 0, 0) };
    let prog = 0;
    const place = () => {
      const k = gsap.parseEase("power2.inOut")(gsap.utils.clamp(0, 1, (prog - .12) / .45));
      const near = new THREE.Vector3(focus.x, 0, focus.z);
      look.copy(wide.at).lerp(near, k);
      eye.copy(wide.pos).lerp(new THREE.Vector3(focus.x + .6, 3.2, focus.z + 3.4), k);
      cam.position.copy(eye);
      cam.lookAt(look);
    };
    const size = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    size();
    new ResizeObserver(size).observe(host);
    place();
    renderer.compile(scene, cam);

    const v = new THREE.Vector3();
    const project = () => {
      const w = host.clientWidth, h = host.clientHeight, show = prog > .3;
      cities.forEach((ct, i) => {
        v.copy(ct.p).project(cam);
        ct.dot.style.transform = `translate(${(v.x * .5 + .5) * w}px, ${(-v.y * .5 + .5) * h}px) translate(-50%, -100%)`;
        ct.dot.classList.toggle("is-on", show && v.z < 1);
        ct.dot.classList.toggle("is-active", i === active);
      });
    };
    let seen = false;
    new IntersectionObserver(([e]) => (seen = !!e?.isIntersecting)).observe(stick);
    gsap.ticker.add(() => { if (!seen) return; place(); renderer.render(scene, cam); project(); });

    const titles = [$(".dh-map__l1", stick), $(".dh-map__l2", stick), $(".dh-map__l3", stick)];
    const setCity = (i) => {
      active = (i + cities.length) % cities.length;
      cityName.textContent = cities[active].name;
      nextName.textContent = cities[(active + 1) % cities.length].name;
      count.textContent = `${String(active + 1).padStart(2, "0")}/${cities.length}`;
      gsap.to(focus, { x: cities[active].p.x, z: cities[active].p.z, duration: 1.2, ease: "expo.inOut" });
    };
    $("[data-next]", stick).addEventListener("click", () => setCity(active + 1));
    $("[data-prev]", stick).addEventListener("click", () => setCity(active - 1));
    $(".dh-step__pill", stick).addEventListener("click", () => setCity(active + 1));
    setCity(0);

    if (reduce) { prog = .7; gsap.set(out, { opacity: 1, y: 0 }); return; }
    ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom bottom", scrub: true, onUpdate: (s) => (prog = s.progress) });
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: .5 } });
    tl.to(titles[0], { xPercent: -12, yPercent: -40, autoAlpha: 0, ease: "none", duration: .3 }, .05)
      .to(titles[1], { xPercent: 12, yPercent: -40, autoAlpha: 0, ease: "none", duration: .3 }, .05)
      .to(titles[2], { xPercent: -8, yPercent: -60, autoAlpha: 0, ease: "none", duration: .3 }, .08)
      .to(out, { opacity: 1, y: 0, ease: "none", duration: .15 }, .5)
      .fromTo(fillBar, { scaleX: 0 }, { scaleX: 1, ease: "none", duration: .5 }, .5);
  }
})();
