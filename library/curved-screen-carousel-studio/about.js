/* About — words sharpening (scrub) · card row pinned horizontal flow · logo grid cursor light · process cards widening in turn · 3D camera into a light hole in the ground beyond the hill */
(() => {
  const MR = window.MR, T = window.THREE;
  const reduce = MR.reduce;
  const q = (s) => document.querySelector(s);

  const words = q("[data-words]");
  if (words) words.innerHTML = words.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");

  const grid = q("[data-logo-grid]");
  MR.glow(grid, grid?.querySelector(".ab-partners__glow"));
  q("[data-scroll-next]")?.addEventListener("click", () => { const y = q(".ab-360").offsetTop; MR.lenis ? MR.lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: "smooth" }); });

  const keep = q("[data-keep]"), t360 = q(".ab-360");
  if (keep && t360) {
    let active = false, timer = 0;
    const show = (on) => { keep.classList.toggle("is-shown", on); keep.inert = !on; };
    const arm = () => { clearTimeout(timer); timer = setTimeout(() => show(true), 3000); };
    const nudge = () => { if (!active) return; show(false); arm(); };
    new IntersectionObserver(([e]) => { active = e.isIntersecting; if (active) arm(); else { clearTimeout(timer); show(false); } }).observe(t360);
    ["scroll", "wheel", "touchmove", "keydown"].forEach((ev) => addEventListener(ev, nudge, { passive: true }));
    keep.querySelector("button").addEventListener("click", () => { const y = t360.offsetTop + t360.offsetHeight; MR.lenis ? MR.lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: "smooth" }); });
  }

  const cards = [...document.querySelectorAll(".ab-card")];
  const quotes = [...document.querySelectorAll("[data-quotes] p")], dots = [...document.querySelectorAll(".ab-quote__dots i")];
  if (quotes.length > 1 && !reduce) {
    let qi = 0;
    setInterval(() => { qi = (qi + 1) % quotes.length; quotes.forEach((p, k) => p.classList.toggle("is-on", k === qi)); dots.forEach((d, k) => d.classList.toggle("is-on", k === qi)); }, 5000);
  }
  const line = q("[data-time-line]");
  const cam = { p: 0 };

  document.addEventListener("DOMContentLoaded", () => {
    if (reduce || !window.ScrollTrigger) { cards.forEach((c) => c.classList.add("is-on")); return; }
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(".ab-big__p .w", { opacity: 1, filter: "blur(0px)", scale: 1, ease: "none", stagger: 0.12, scrollTrigger: { trigger: ".ab-big", start: "top 70%", end: "bottom 60%", scrub: true } });
      ScrollTrigger.create({ trigger: ".ab-hero", start: "top top", endTrigger: ".ab-360", end: "bottom bottom", scrub: true, onUpdate: (s) => (cam.p = s.progress) });
    });
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const rail = q("[data-rail]");
      gsap.to(rail, { x: () => -(rail.scrollWidth - innerWidth), ease: "none", scrollTrigger: { trigger: ".ab-cards", start: "top top", end: () => "+=" + (rail.scrollWidth - innerWidth), pin: true, scrub: true, invalidateOnRefresh: true } });
      ScrollTrigger.create({
        trigger: ".ab-time", start: "top top", end: "bottom bottom", scrub: true,
        onUpdate: (s) => {
          const i = Math.min(cards.length - 1, Math.floor(s.progress * cards.length));
          cards.forEach((c, k) => c.classList.toggle("is-on", k === i));
          if (line) line.style.transform = `scaleX(${s.progress})`;
        },
      });
      cards[0]?.classList.add("is-on");
    });
  });

  const canvas = q("[data-about-canvas]");
  if (!T || !canvas) { MR?.progress?.(1); return; }
  const renderer = MR.renderer(canvas);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(40, 1, 0.1, 400);
  const sand = MR.sand({ size: 300, seg: 280, dune: 1.1, flat: [0, -18, 10] });
  sand.position.y = -2;
  scene.add(sand);
  const su = sand.material.uniforms;
  su.uLampPos.value.set(0, 1, -18);
  su.uLamp.value.set(MR.css("--kf-ink"));
  su.uFogDist.value.set(20, 120);
  const hole = MR.portal(7);
  hole.rotation.x = -Math.PI / 2;
  hole.position.set(0, -0.6, -18);
  scene.add(hole);
  const hu = hole.userData.mat.uniforms;
  const look = new T.Vector3();
  const resize = () => MR.fit(renderer, camera, canvas);
  addEventListener("resize", resize);
  resize();
  let first = true, p = 0;
  const post = MR.post(renderer);
  post.fade(0.5);
  let last = 0;
  const frame = (now) => {
    const t = now / 1000;
    const dt = last ? (now - last) / 1000 : 1 / 60;
    last = now;
    p += (cam.p - p) * (reduce ? 1 : 0.1);
    const e = p * p * (3 - 2 * p);
    // Past the hole section the camera drops into the hole, the hole clears and the background sinks to dark sand
    const end360 = q(".ab-360") ? q(".ab-360").offsetTop + q(".ab-360").offsetHeight - innerHeight : innerHeight * 2.4;
    const after = Math.min(1, Math.max(0, (scrollY - end360) / innerHeight));
    camera.position.set(0, 3 + e * 19 - after * 14, 26 - e * 30 - after * 10);
    look.set(0, 4 - e * 4.6 - after * 3, -40 + e * 22 - after * 22);
    camera.lookAt(look);
    const [yaw, pitch] = MR.leanTarget();
    MR.lean(camera, look, yaw, pitch);
    su.uLampPower.value = (0.6 + e * 1.4) * (1 - after * 0.75);
    su.uTime.value = t;
    hu.uTime.value = t;
    hu.uFade.value = (0.35 + e * 0.65) * (1 - after);
    post.render(scene, camera, dt);
    if (first) { first = false; MR.progress(1); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
