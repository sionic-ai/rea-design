// Careers — values exactly from the original aboutGoals·careersGrid·globeInit·careersHoverControl
(() => {
  const { color, desktop, reduce, lenis } = window.ES;
  const unlit = color("--es-unlit");

  // Header button → smooth scroll to the job list
  document.querySelector(".rc-hero__btn").addEventListener("click", (e) => {
    e.preventDefault();
    const t = document.getElementById("positions");
    lenis ? lenis.scrollTo(t, { offset: -80, duration: 1.2 }) : t.scrollIntoView({ behavior: "smooth" });
  });

  // Job row — the background spreads from the top if entered from above, from the bottom if entered from below
  if (desktop()) document.querySelectorAll(".rc-pos__row").forEach((row) => {
    const side = (e) => row.classList.toggle("is-bottom", e.offsetY > row.clientHeight * 0.5);
    row.addEventListener("mouseenter", side);
    row.addEventListener("mouseleave", side);
  });

  // Select box — click to open, closes when an item is picked or the outside is clicked
  document.querySelectorAll(".rc-pos__select").forEach((s) => {
    const label = s.querySelector("span");
    s.addEventListener("click", (e) => {
      e.stopPropagation();
      const li = e.target.closest("li");
      if (li) { label.textContent = li.textContent; s.classList.remove("is-open"); return; }
      document.querySelectorAll(".rc-pos__select.is-open").forEach((o) => o !== s && o.classList.remove("is-open"));
      s.classList.toggle("is-open");
    });
    s.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); s.click(); } });
  });
  document.addEventListener("click", () => document.querySelectorAll(".rc-pos__select.is-open").forEach((o) => o.classList.remove("is-open")));

  // Grid cells keep the screen ratio (original --aspect) — attached first because the shape must stay the same even under reduced motion
  const gridSec = document.querySelector(".rc-grid");
  const aspect = () => gridSec.style.setProperty("--aspect", innerWidth / innerHeight);
  aspect();
  addEventListener("resize", aspect);

  globe();
  if (reduce) return;

  // Goal line: number and description text turn on from the off color (scroll-bound)
  document.querySelectorAll(".rc-goals__list li").forEach((li) => {
    gsap.timeline({ scrollTrigger: { trigger: li, start: "top 90%", end: "bottom 50%", scrub: true } })
      .from(li.querySelectorAll(".rc-goals__num, .rc-goals__text"), { color: unlit, duration: 1, ease: "power1.inOut" });
  });

  // Photo grid — board 2x, center text .5x, side cells disappear, center text words from 200% below
  const sec = gridSec, track = sec.querySelector(".rc-grid__track"), sticky = sec.querySelector(".rc-grid__sticky");
  const tr = sec.querySelector(".rc-grid__translator"), pos = sec.querySelector(".rc-grid__positioner");
  const boxes = sec.querySelectorAll(".rc-grid__box:not(.rc-grid__main)"), content = sec.querySelector(".rc-grid__content");
  const nums = sec.querySelectorAll(".rc-stat__num[data-end]");
  document.fonts.ready.then(() => {
    const m = new SplitText(content.querySelector(".rc-grid__title"), { type: "lines, words", linesClass: "rc-line" });
    nums.forEach((n) => {
      const i = n.querySelector("i"), o = { v: 0 };
      n.anim = gsap.fromTo(o, { v: 0 }, { v: +n.dataset.end, ease: "power1.inOut", duration: 1, paused: true, onUpdate: () => (i.textContent = Math.floor(o.v)) });
    });
    // The original holds the plate with a ScrollTrigger pin (without spacing) rather than CSS sticky — the same pin on phones when first set up
    ScrollTrigger.create({ trigger: track, pin: sticky, pinSpacing: false, start: () => `top+=${sticky.offsetHeight * 0.5} 50%`, end: () => `bottom-=${sticky.offsetHeight * 0.5} 50%` });
    gsap.timeline({ scrollTrigger: { trigger: track, start: () => `top+=${sticky.offsetHeight * 0.5} 50%`, end: () => `bottom-=${sticky.offsetHeight * 0.5} 50%`, scrub: true } })
      .from(tr, { y: "15%", ease: "power1.out", duration: 0.1 })
      .to(tr, { y: "0%", ease: "power1.inOut", duration: 0.8 })
      .to(tr, { y: "-15%", ease: "power1.in", duration: 0.1 });
    const g = gsap.timeline({ onStart: () => nums.forEach((n) => n.anim.restart()), scrollTrigger: { trigger: track, start: "top bottom", end: "bottom top", scrub: true } });
    if (!desktop()) g.to(pos, { scale: 1, ease: "power1.inOut", duration: 0.35 });
    g.add("b0");
    g.to(pos, { scale: 2, ease: "power1.inOut", duration: 1 }, "b0");
    g.to(content, { scale: 0.5, ease: "power1.inOut", duration: 1 }, "b0");
    g.to(boxes, { opacity: 0, ease: "power1.inOut", duration: 0.25 }, "b0+=0.35");
    g.from(content, { opacity: 0, ease: "power1.inOut", duration: 0.15, onStart: () => { gsap.killTweensOf(m.words); gsap.fromTo(m.words, { y: "200%" }, { y: "0%", ease: "expo.out", duration: 1, stagger: 0.075 }); } }, "b0+=0.5");
    g.to(pos, { scale: 2.1, ease: "power1.inOut", duration: 0.5 });
    ScrollTrigger.refresh();
  });

  // Globe — dot Earth with office location markers. Cursor horizontal position turns y (-.82~3.17), vertical position turns x, with 1s power1.out.
  function globe() {
    const cv = document.querySelector(".rc-globe__canvas");
    if (!cv || !window.THREE) return;
    const T = THREE;
    const r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(35, 1, 0.1, 100);
    cam.position.z = 3.6;
    const accent = new T.Color().setStyle(color("--kf-accent")), dim = new T.Color().setStyle(color("--kf-dim")), ink = new T.Color().setStyle(color("--kf-ink"));
    const world = new T.Group(); scene.add(world);
    // Dots — on a Fibonacci sphere, continent spots picked by noise and brightened
    const n = 9000, pts = [], cols = [];
    const land = (v) => Math.sin(v.x * 3.1 + 1.3) * Math.cos(v.y * 2.7) + Math.sin(v.z * 4.2 + v.x * 1.7) * 0.6 > 0.35;
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), th = i * 2.399963;
      const v = new T.Vector3(Math.cos(th) * rad, y, Math.sin(th) * rad);
      // As in the original, land dots only — the sea is left as a dark sphere base
      if (!land(v)) continue;
      pts.push(v.x, v.y, v.z);
      const c = dim.clone().lerp(ink, 0.25);
      cols.push(c.r, c.g, c.b);
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(pts, 3));
    geo.setAttribute("color", new T.Float32BufferAttribute(cols, 3));
    world.add(new T.Points(geo, new T.PointsMaterial({ size: 0.032, vertexColors: true })));
    world.add(new T.Mesh(new T.SphereGeometry(0.995, 64, 48), new T.MeshBasicMaterial({ color: new T.Color().setStyle(color("--kf-bg")) })));
    // Seven office spots — latitude and longitude are placeholder values
    [[42, 25], [47, 2], [51, 10], [41, 15], [50, 6], [41, -88], [36, 140]].forEach(([la, lo]) => {
      const p = new T.Vector3().setFromSphericalCoords(1.01, T.MathUtils.degToRad(90 - la), T.MathUtils.degToRad(lo + 90));
      const m = new T.Mesh(new T.SphereGeometry(0.018, 12, 8), new T.MeshBasicMaterial({ color: ink }));
      m.position.copy(p); world.add(m);
    });
    world.rotation.set(-0.05, 0.82, 0);
    const size = () => { const w = cv.clientWidth, h = cv.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    addEventListener("resize", size); size();
    r.compile(scene, cam);
    let tw = null;
    if (desktop() && !reduce) addEventListener("mousemove", (e) => {
      const nx = (e.clientX / innerWidth) * 2 - 1, ny = -0.05 * (-(e.clientY / innerHeight) * 2 + 1);
      const ry = -((nx + 1) * (3.17 + 0.82) / 2 - 0.82);
      tw?.kill();
      tw = gsap.to(world.rotation, { x: ny, y: ry, ease: "power1.out", duration: 1 });
    });
    // Draw only while on screen — drawing every frame off-screen too would delay the hover-response frames of other sections
    let seen = false;
    new IntersectionObserver(([e]) => (seen = e.isIntersecting)).observe(cv);
    r.render(scene, cam);
    gsap.ticker.add(() => seen && r.render(scene, cam));
  }
})();
