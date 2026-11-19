// First page — hero text flying away·main video state, case interaction·following name, logo card, contribution rows, moss rock (three), testimonials horizontal flow
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const css = (v) => { const p = document.createElement("i"); p.style.color = `var(${v})`; document.body.append(p); const c = getComputedStyle(p).color; p.remove(); return c; };
  const mm = gsap.matchMedia();

  // Once all pieces stick and the panel widens, the featured video is Playing, and it pauses when scrolled back up
  const frame = document.querySelector(".hero-frame"), state = document.querySelector("[data-feature-state]");
  document.querySelector(".hero-pin")?.addEventListener("fx:gathered", (e) => {
    const on = e.detail?.dir !== -1;
    frame.classList.toggle("is-wide", on);
    if (state) state.textContent = on ? "Playing reel" : "Play reel";
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Once pieces start gathering, title words and paragraph lines fly upward (.04 stagger, power3.in)
    const out = { y: "-110%", rotateZ: "-2deg", duration: 1.2, stagger: 0.04, ease: "power3.in", immediateRender: false, scrollTrigger: { trigger: ".hero-pin", start: "top -10%", end: "+=60%", scrub: 1 } };
    gsap.to(".hero-title .w-rise", out);
    gsap.to(".hero-copy .l-rise", out);
    gsap.to(".hero-mark", { yPercent: -60, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero-pin", start: "top top", end: "+=45%", scrub: 1 } });
    gsap.to(".hero-scroll", { opacity: 0, scrollTrigger: { trigger: ".hero-pin", start: "top top", end: "+=20%", scrub: 1 } });

    gsap.utils.toArray(".p-row").forEach((row) => gsap.fromTo(row.children, { y: 20, opacity: 0, rotateZ: 2, filter: "blur(4px)" }, { y: 0, opacity: 1, rotateZ: 0, filter: "blur(0px)", duration: 0.65, stagger: 0.05, ease: "premiumGlide", scrollTrigger: { trigger: row, start: "top 95%", toggleActions: "play none none none" } }));
    gsap.fromTo(".lc", { opacity: 0, y: 30, rotation: 6, filter: "blur(6px)" }, { opacity: 1, y: 0, rotation: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out", stagger: { each: 0.04, from: "center" }, scrollTrigger: { trigger: ".logo-cards", start: "top 85%", toggleActions: "play none none none" } });
    gsap.to(".c-div", { scaleX: 1, duration: 1.2, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: ".c-list", start: "top 80%", toggleActions: "play none none none" } });
  });

  // The [SCROLL DOWN] text is big in the Hero and follows 75px below the cursor (.35s power3.out) — centered when there is no cursor
  const cue = document.querySelector(".hero-scroll"), stageEl = document.querySelector(".hero-stage");
  if (cue && stageEl) {
    const place = (x, y) => { cx(x - cue.offsetWidth / 2); cy(y + 75); };
    const cx = gsap.quickTo(cue, "x", { duration: reduce ? 0 : 0.35, ease: "power3.out" }), cy = gsap.quickTo(cue, "y", { duration: reduce ? 0 : 0.35, ease: "power3.out" });
    gsap.set(cue, { x: innerWidth / 2 - cue.offsetWidth / 2, y: innerHeight * 0.54 });
    if (fine) addEventListener("pointermove", (e) => { if (stageEl.getBoundingClientRect().top <= 1 || scrollY < innerHeight) place(e.clientX, e.clientY); }, { passive: true });
  }

  // On hover the rest recede to 4px blur · .4 brightness · .5 opacity while the hovered one goes 1.02× (.6s power2.out), and the background darkens one step
  const dim = (items, hovered, dur) => items.forEach((it) => {
    const other = hovered && it !== hovered;
    gsap.to(it, { opacity: other ? 0.5 : 1, filter: other ? "blur(4px) brightness(0.4)" : "blur(0px) brightness(1)", scale: it === hovered ? 1.02 : other ? 0.98 : 1, duration: dur, ease: "power2.out", overwrite: true });
  });
  const projects = [...document.querySelectorAll(".p-item")], follow = document.querySelector("[data-follow]");
  const deep = getComputedStyle(document.documentElement).getPropertyValue("--site-deeper").trim();
  if (fine && !reduce) {
    projects.forEach((p) => {
      p.addEventListener("mouseenter", () => { dim(projects, p, 0.6); gsap.to(document.body, { backgroundColor: deep, duration: 0.6, ease: "power2.out", overwrite: true }); follow.textContent = p.dataset.name; gsap.to(follow, { opacity: 1, duration: 0.3 }); });
      p.addEventListener("mouseleave", () => { dim(projects, null, 0.6); gsap.to(document.body, { backgroundColor: "", duration: 0.6, ease: "power2.out", overwrite: true, clearProps: "backgroundColor" }); gsap.to(follow, { opacity: 0, duration: 0.3 }); });
    });
    const fx = gsap.quickTo(follow, "x", { duration: 0.5, ease: "power3.out" }), fy = gsap.quickTo(follow, "y", { duration: 0.5, ease: "power3.out" });
    addEventListener("pointermove", (e) => { fx(e.clientX + 18); fy(e.clientY + 18); }, { passive: true });

    const rows = [...document.querySelectorAll(".c-list li")], prev = document.querySelector("[data-preview]");
    rows.forEach((r) => {
      r.addEventListener("mouseenter", () => { dim(rows, r, 0.7); gsap.to(prev, { width: "40%", duration: 1.2, ease: "power3.out", overwrite: "auto" }); });
      r.addEventListener("mouseleave", () => { dim(rows, null, 0.7); gsap.to(prev, { width: "15%", duration: 1.2, ease: "power3.out", overwrite: "auto" }); });
    });
    const cards = [...document.querySelectorAll(".v-card")];
    cards.forEach((c) => { c.addEventListener("mouseenter", () => dim(cards, c, 0.7)); c.addEventListener("mouseleave", () => dim(cards, null, 0.7)); });
  }

  // Reviews — pinned in place while the card row flows horizontally
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const track = document.querySelector(".v-track");
    if (!track) return;
    gsap.to(track, { x: () => -Math.max(0, track.scrollWidth - innerWidth), ease: "none", scrollTrigger: { trigger: "[data-voices]", start: "top 18%", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true } });
  });

  // ── Moss rock — the original flips through 270 rock photos along with scroll. Here our own shape (a lumpy icosahedron + moss paint) is rotated with the same progress
  const stage = document.querySelector("[data-rock]"), T = window.THREE;
  if (!stage || !T) return;
  const pin = stage.parentElement, glCanvas = stage.querySelector(".rock-gl"), dustCanvas = stage.querySelector(".rock-dust");
  const moss = new T.Color().setStyle(css("--kf-accent-soft")), dark = new T.Color().setStyle(css("--kf-bg"));
  let rock, dust, rr, dr, cam, dcam, scene, dscene, target = 0, shown = 0, mouse = { x: 0, y: 0 }, raf = 0, live = false;
  const noise = (x, y, z) => Math.sin(x * 2.1 + Math.sin(y * 1.7)) * 0.5 + Math.sin(y * 3.3 + z * 1.3) * 0.3 + Math.sin(z * 4.7 + x * 2.9) * 0.2;
  const build = () => {
    rr = new T.WebGLRenderer({ canvas: glCanvas, alpha: true, antialias: true });
    rr.setPixelRatio(Math.min(devicePixelRatio, 2));
    scene = new T.Scene(); cam = new T.PerspectiveCamera(35, 1, 0.1, 50); cam.position.z = 6;
    const geo = new T.IcosahedronGeometry(1.5, 20), pos = geo.attributes.position, col = [];
    const v = new T.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = v.clone().normalize(), k = noise(n.x * 1.6, n.y * 1.6, n.z * 1.6);
      v.copy(n.multiplyScalar(1.5 * (1 + 0.22 * k + 0.05 * noise(n.x * 7, n.y * 7, n.z * 7)))); v.y *= 0.72;
      pos.setXYZ(i, v.x, v.y, v.z);
      const m = Math.min(1, Math.max(0, 0.55 + 0.9 * noise(v.x * 3, v.y * 3, v.z * 3)));
      const c = dark.clone().lerp(moss.clone().multiplyScalar(0.62), m * m); col.push(c.r, c.g, c.b);
    }
    geo.setAttribute("color", new T.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals();
    rock = new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, flatShading: true }));
    rock.rotation.z = (108 * Math.PI) / 180 / 6;
    scene.add(rock, new T.AmbientLight(0xffffff, 0.9));
    const sun = new T.DirectionalLight(0xffffff, 2.2); sun.position.set(2.9, 2.1, 0.7); scene.add(sun);

    // 100 particles — size .02 · fall .05/frame · opacity .55, camera moves toward the cursor by .15 (follow .05)
    dr = new T.WebGLRenderer({ canvas: dustCanvas, alpha: true, antialias: false });
    dr.setPixelRatio(1);
    dscene = new T.Scene(); dcam = new T.PerspectiveCamera(75, 1, 0.1, 1000); dcam.position.z = 5;
    const pg = new T.BufferGeometry(), arr = new Float32Array(300);
    for (let i = 0; i < 300; i++) arr[i] = (Math.random() - 0.5) * 40;
    pg.setAttribute("position", new T.BufferAttribute(arr, 3));
    dust = new T.Points(pg, new T.PointsMaterial({ color: moss, size: 0.02 * 4, transparent: true, opacity: 0.55 }));
    dscene.add(dust);
    size();
    rr.compile(scene, cam); dr.compile(dscene, dcam);
  };
  const size = () => {
    if (!rr) return;
    const w = glCanvas.clientWidth, h = glCanvas.clientHeight;
    rr.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    dr.setSize(innerWidth, innerHeight, false); dcam.aspect = innerWidth / innerHeight; dcam.updateProjectionMatrix();
  };
  const loop = () => {
    raf = requestAnimationFrame(loop);
    dcam.position.x += (mouse.x * 0.15 - dcam.position.x) * 0.05;
    dcam.position.y += (mouse.y * 0.15 - dcam.position.y) * 0.05;
    dcam.lookAt(dscene.position);
    if (!reduce) { const a = dust.geometry.attributes.position.array; for (let i = 1; i < a.length; i += 3) { a[i] -= 0.05; if (a[i] < -20) a[i] = 20; } dust.geometry.attributes.position.needsUpdate = true; }
    shown += (target - shown) * 0.1;
    rock.rotation.y = (shown / 270) * Math.PI * 2;
    rock.rotation.x = 0.25 + (shown / 270) * 0.6;
    rr.render(scene, cam); dr.render(dscene, dcam);
  };
  const words = [...stage.querySelectorAll("[data-rock-words] > span")].flatMap((line, li) => {
    const parts = line.textContent.split(" ");
    line.textContent = "";
    return parts.map((t, i) => { const m = document.createElement("span"); m.className = "w-mask"; const w = document.createElement("span"); w.className = "rw"; w.style.backgroundPosition = `0% ${li * 33}%`; w.textContent = t; m.append(w); line.append(m); if (i < parts.length - 1) line.append(" "); return w; });
  });
  if (!reduce) gsap.set(words, { yPercent: 110, rotate: -5, opacity: 0, filter: "blur(4px)" });
  let wordsIn = false;
  const callouts = [...stage.querySelectorAll(".co")];
  const onScroll = () => {
    const r = pin.getBoundingClientRect(), span = pin.offsetHeight - innerHeight;
    const p = Math.max(0, Math.min(1, -r.top / span));
    target = Math.floor(269 * p) + 1;
    const enter = Math.max(0, Math.min(1, 1 - r.top / innerHeight));
    stage.style.setProperty("--bg-progress", (r.top > 0 ? -150 + 160 * enter : 10 + 35 * p).toFixed(1) + "%");
    callouts.forEach((c) => c.classList.toggle("on", p >= +c.dataset.at));
    if (!wordsIn && p > 0.04 && !reduce) { wordsIn = true; gsap.to(words, { yPercent: 0, rotate: 0, opacity: 1, filter: "blur(0px)", duration: 1.4, stagger: 0.07, ease: "natureSway" }); }
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  addEventListener("mousemove", (e) => { mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = -(e.clientY / innerHeight) * 2 + 1; }, { passive: true });
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !live) { live = true; if (!rr) build(); loop(); }
    else if (!e.isIntersecting && live) { live = false; cancelAnimationFrame(raf); }
  }, { rootMargin: "500px 0px" }).observe(pin);
  addEventListener("resize", size);
})();
