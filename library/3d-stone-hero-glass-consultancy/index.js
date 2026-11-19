/* Home motion — original values: stone 1s .9→1 (.62s, power1.out) · title words .4s at .06 intervals (1.04s) · eyebrow (1.09s) · stone scroll 51~90% (rotates 8° · downward) · 
   Logo band 16s · work panel entrance 0~19% .9→1 · result cards .9s power1.inOut repeating every 7.8s · flowchart nodes light up over 1s starting at .39s · team orbit mouse ±4em (smoothing 95) */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const rgbOf = (c) => { const p = document.createElement("span"); p.style.color = c; document.body.appendChild(p); const m = getComputedStyle(p).color.match(/[\d.]+/g) || [128, 128, 128]; p.remove(); return m.slice(0, 3).map(Number); };

  /* ── Hero 3D rock: an icosahedron pushed bumpy with noise, light from the top left ── */
  const host = document.querySelector("[data-rock]");
  let rock = null, renderer, scene, camera;
  if (host && window.THREE) {
    const T = THREE;
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    host.appendChild(renderer.domElement);
    scene = new T.Scene();
    camera = new T.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0, 7.2);
    const hash = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
    const noise = (x, y, z) => {
      const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z), fx = x - ix, fy = y - iy, fz = z - iz;
      const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
      const L = (a, b, t) => a + (b - a) * t;
      return L(L(L(hash(ix, iy, iz), hash(ix + 1, iy, iz), u), L(hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), u), v),
               L(L(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), u), L(hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), u), v), w);
    };
    const geo = new T.IcosahedronGeometry(1, 72);
    const ridge = (x, y, z) => 1 - Math.abs(noise(x, y, z) * 2 - 1);
    const pos = geo.attributes.position, vtx = new T.Vector3();
    for (let i = 0; i < pos.count; i++) {
      vtx.fromBufferAttribute(pos, i);
      const n = noise(vtx.x * 1.3, vtx.y * 1.3, vtx.z * 1.3) * 0.34 + ridge(vtx.x * 3.2, vtx.y * 3.2, vtx.z * 3.2) * 0.12 + noise(vtx.x * 9, vtx.y * 9, vtx.z * 9) * 0.06 + ridge(vtx.x * 22, vtx.y * 22, vtx.z * 22) * 0.025;
      vtx.multiplyScalar(0.7 + n);
      vtx.y *= 1.3; vtx.x *= 0.88;
      pos.setXYZ(i, vtx.x, vtx.y, vtx.z);
    }
    geo.computeVertexNormals();
    const [r, g, b] = rgbOf(css("--kf-contrast-ink") || "gray");
    const mat = new T.MeshStandardMaterial({ color: new T.Color(r / 255, g / 255, b / 255).multiplyScalar(0.32), roughness: 1, metalness: 0, flatShading: true });
    rock = new T.Mesh(geo, mat);
    rock.scale.setScalar(0.72);
    rock.rotation.set(0.25, 0.4, -0.35);
    const group = new T.Group(); group.add(rock); scene.add(group);
    scene.add(new T.AmbientLight(0xffffff, 0.03)); // Not skin: white light that only uses light intensity
    const key = new T.DirectionalLight(0xffffff, 4.2); key.position.set(-2, 3, 2.2); scene.add(key); // Not skin: white light that only uses light intensity
    const rim = new T.DirectionalLight(0xffffff, 0.6); rim.position.set(3, -2, -2); scene.add(rim); // Not skin: white light that only uses light intensity
    const fit = () => {
      const w = host.clientWidth, h = host.clientHeight;
      renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix();
      group.position.x = 0;
      rock.scale.setScalar(w < 768 ? 0.5 : 0.72);
    };
    new ResizeObserver(fit).observe(host); fit();
    const state = { p: 0, s: 0 };
    let vis = true;
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(host);
    /* Cursor look-back — original Spline camera hoverRotate mode 1 (strength 11 → (11/100)² = .0121, damping .125, returns to place when leaving the canvas).
       The camera orbits the stone by how far the cursor moves (not its position): each movement adds 2π·dx·.0121/height, decaying by .875 every frame, 8x in total */
    const orbit = { th: 0, ph: 0, dth: 0, dph: 0 };
    const RADIUS = camera.position.z, HOVER = 0.0121, DAMP = 0.125;
    const heroEl = host.closest(".hero") || host;
    if (!reduce) {
      let last = null;
      heroEl.addEventListener("pointerenter", (e) => { last = [e.clientX, e.clientY]; });
      heroEl.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const prev = last; last = [e.clientX, e.clientY];
        if (!prev) return;
        const k = (2 * Math.PI * HOVER) / Math.max(1, host.clientHeight);
        orbit.dth -= (e.clientX - prev[0]) * k;
        orbit.dph -= (e.clientY - prev[1]) * k;
      });
      heroEl.addEventListener("pointerleave", () => { last = null; orbit.dth = -orbit.th * DAMP; orbit.dph = -orbit.ph * DAMP; });
    }
    const draw = (t) => {
      state.s += (state.p - state.s) * 0.11;
      rock.rotation.y = 0.4 + t * 0.12 + state.s * (8 * Math.PI / 180);
      group.position.y = -state.s * 2.6;
      orbit.th += orbit.dth; orbit.ph += orbit.dph;
      orbit.dth *= 1 - DAMP; orbit.dph *= 1 - DAMP;
      const phi = Math.min(Math.PI - 0.05, Math.max(0.05, Math.PI / 2 + orbit.ph));
      camera.position.set(RADIUS * Math.sin(phi) * Math.sin(orbit.th), RADIUS * Math.cos(phi), RADIUS * Math.sin(phi) * Math.cos(orbit.th));
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    window.pnRock = { group, state };
    if (reduce) draw(0); else gsap.ticker.add((t) => { if (vis) draw(t); });
    if (!reduce) {
      ScrollTrigger.create({
        trigger: ".hero", start: "top bottom", end: "bottom top",
        onUpdate: (st) => { state.p = gsap.utils.clamp(0, 1, (st.progress - 0.51) / (0.9 - 0.51)); },
      });
    }
  }

  /* ── Hero entrance ── */
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const title = document.querySelector("[data-hero-title]");
    const brow = document.querySelector("[data-hero-eyebrow]");
    const sT = new SplitText(title, { type: "words", mask: "words", wordsClass: "pn-word" });
    const sB = new SplitText(brow, { type: "words", mask: "words", wordsClass: "pn-word" });
    const tl = gsap.timeline({ delay: window.pnIntro || 0 });
    if (host) tl.fromTo(host, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1, ease: "power1.out" }, 0.62);
    tl.from(sT.words, { opacity: 0, y: "1em", duration: 0.4, stagger: 0.06, ease: "power1.out" }, 1.04)
      .from(sB.words, { opacity: 0, y: "1em", duration: 0.4, stagger: 0.06, ease: "power1.out" }, 1.09);

    /* Work panel: once the section starts entering, .9→1 over 19% of the path (original smooth 80 → scrub .8) */
    const list = document.querySelector("[data-grow]");
    if (list) {
      const tiles = list.querySelectorAll(".tile");
      gsap.fromTo(tiles, { scale: 0.9 }, { scale: 1, ease: "none", scrollTrigger: { trigger: list, start: "top bottom", end: () => `+=${(list.offsetHeight + innerHeight) * 0.19}`, scrub: 0.8 } });
    }

    /* Flow chart: when visible, nodes light up in turn over 1s and the line draws from the left */
    const flow = document.querySelector("[data-flow]");
    if (flow) {
      const ftl = gsap.timeline({ scrollTrigger: { trigger: flow, start: "top bottom", once: true } });
      ftl.from(flow.querySelectorAll("[data-step]"), { opacity: 0, duration: 0.5, stagger: { amount: 1 }, ease: "power1.out" }, 0.39)
        .from(flow.querySelector("[data-stroke]"), { scaleX: 0, duration: 0.3, ease: "power2.out" }, 0.58)
        .from(flow.querySelectorAll("[data-curve]")[0], { scaleX: 0, duration: 0.35, ease: "power1.out" }, 0.76)
        .from(flow.querySelectorAll("[data-curve]")[1], { scaleX: 0, duration: 0.35, ease: "power1.out" }, 0.99);
    }
  });

  /* ── Logo strip: one set attached end to end, -100% over 16s ── */
  const track = document.querySelector("[data-logos]");
  if (track) {
    const set = track.querySelector(".logos__set");
    track.appendChild(set.cloneNode(true)).setAttribute("aria-hidden", "true");
    if (!reduce) gsap.to(track.children, { xPercent: -100, duration: 16, repeat: -1, ease: "none" });
  }

  /* ── Last work panel: hover plays the video, release returns to the start after .2s ── */
  document.querySelectorAll("[data-hover-video]").forEach((t) => {
    t.addEventListener("mouseenter", () => { t.dataset.videoOnHover = "active"; });
    t.addEventListener("mouseleave", () => { t.dataset.videoOnHover = "not-active"; });
  });

  /* ── Vertical carousel of achievement cards (in the original timeline spot) ── */
  const met = document.querySelector("[data-metrics]");
  if (met) {
    const b = (n) => met.querySelector(`[data-n="${n}"]`);
    const OUT = { opacity: 0, y: "-4em", scale: 1.05 }, TOP = { y: "-3em", scale: 1 }, MID = { y: "-1em", scale: 0.95 }, LOW = { y: "1em", scale: 0.9 };
    gsap.set(b(1), { y: "-3em", scale: 1, opacity: 1 });
    gsap.set(b(2), { y: "-1em", scale: 0.95, opacity: 1 });
    gsap.set(b(3), { y: "1em", scale: 0.9, opacity: 1 });
    gsap.set([b(4), b(5), b(6), b(7)], { y: "3em", scale: 0.85, opacity: 0 });
    if (!reduce) {
      const e = { duration: 0.9, ease: "power1.inOut" };
      const tl = gsap.timeline({ repeat: -1, delay: 1 });
      const step = (out, top, mid, low, t) => {
        tl.fromTo(b(out), { opacity: 1, y: "-3em", scale: 1 }, { ...OUT, ...e }, t[0])
          .fromTo(b(top), { y: "-1em", scale: 0.95 }, { ...TOP, ...e }, t[1])
          .fromTo(b(mid), { y: "1em", scale: 0.9, opacity: 1 }, { ...MID, ...e }, t[2])
          .fromTo(b(low), { y: "3em", scale: 0.85, opacity: 0 }, { ...LOW, opacity: 1, ...e }, t[3]);
      };
      step(1, 2, 3, 4, [0.79, 0.89, 0.99, 1.09]);
      step(2, 3, 4, 5, [2.69, 2.78, 2.92, 3.0]);
      step(3, 4, 5, 6, [4.72, 4.85, 4.94, 5.04]);
      step(4, 5, 6, 7, [6.67, 6.73, 6.8, 6.9]);
    }
  }

  /* ── Team orbit: on a black plate six people circles orbit on a ring in the center, and the whole ring shifts ±4em with mouse left/right ── */
  const team = document.querySelector("[data-team]");
  const cv = document.querySelector("[data-orbit]");
  if (team && cv) {
    const ctx = cv.getContext("2d");
    const ink = rgbOf(css("--kf-contrast-ink"));
    const col = (a) => `rgba(${ink[0]},${ink[1]},${ink[2]},${a})`;
    let W = 0, H = 0, dpr = 1, shift = 0, want = 0, vis = false;
    const fit = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = team.clientWidth; H = team.clientHeight; cv.width = W * dpr; cv.height = H * dpr; };
    new ResizeObserver(fit).observe(team); fit();
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(team);
    const em = 16 * 4;
    team.addEventListener("mousemove", (e) => { const r = team.getBoundingClientRect(); want = ((e.clientX - r.left) / r.width - 0.5) * -2 * em; });
    team.addEventListener("mouseleave", () => { want = 0; });
    const people = [0, 1, 2, 3, 4, 5].map((i) => ({ a: (i / 6) * Math.PI * 2 + (i % 2 ? 0.25 : 0), r: 15 + (i % 3) * 4 }));
    const draw = (t) => {
      shift += (want - shift) * 0.05;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2 + shift, cy = H / 2, R = Math.min(W, H) * 0.36;
      ctx.strokeStyle = col(0.18); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.62, 0, Math.PI * 2); ctx.strokeStyle = col(0.08); ctx.stroke();
      people.forEach((p, i) => {
        const a = p.a + t * 0.08 * (i % 2 ? 1 : 0.85);
        const rr = i % 2 ? R : R * 0.62 + (i === 2 ? R * 0.2 : 0);
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        ctx.fillStyle = col(0.92); ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col(0.35);
        ctx.beginPath(); ctx.arc(x, y - p.r * 0.22, p.r * 0.32, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x, y + p.r * 0.55, p.r * 0.55, p.r * 0.38, 0, Math.PI, 0); ctx.fill();
      });
    };
    if (reduce) draw(0); else gsap.ticker.add((t) => { if (vis) draw(t); });
  }
})();
