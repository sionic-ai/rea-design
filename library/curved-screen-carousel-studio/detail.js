/* Case detail — name rise (.8s), video cell loading wipe (stops 1.2s after it becomes visible), number count-up, camera approaching the 3D screen mockup */
(() => {
  const MR = window.MR, T = window.THREE;
  const reduce = MR.reduce;
  const q = (s) => document.querySelector(s);

  MR.ready(() => { if (!reduce) gsap.fromTo("[data-load-title]", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.2 }); });
  q("[data-scroll-next]")?.addEventListener("click", () => { const y = q(".dt-lead").offsetTop - 80; MR.lenis ? MR.lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y, behavior: "smooth" }); });

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-visible");
    setTimeout(() => e.target.classList.add("is-loaded"), 1200);
    io.unobserve(e.target);
  }), { threshold: 0.1 });
  document.querySelectorAll(".dt-cell").forEach((c) => io.observe(c));

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const to = +el.dataset.count, dec = +(el.dataset.dec || 0), pre = el.dataset.pre || "", suf = el.dataset.suf || "";
      if (reduce || !window.ScrollTrigger) return;
      const o = { v: 0 };
      gsap.to(o, { v: to, duration: 1.4, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%", once: true }, onUpdate: () => (el.textContent = `${pre}${o.v.toFixed(dec)}${suf}`) });
      el.textContent = `${pre}${(0).toFixed(dec)}${suf}`;
    });
  });

  const canvas = q("[data-detail-canvas]");
  if (!T || !canvas) { MR?.progress?.(1); return; }
  const renderer = MR.renderer(canvas);
  const stage = canvas.parentElement;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(36, 1, 0.1, 300);
  const sand = MR.sand({ size: 240, seg: 220, dune: 0.9, flat: [0, -6, 9] });
  sand.position.y = -2.2;
  scene.add(sand);
  const su = sand.material.uniforms;
  su.uFogDist.value.set(15, 90);
  const tint = MR.projectColors(3)[1];
  // Screen model: thin box body + front screen (our shader placeholder video) + stand
  const monitor = new T.Group();
  const shell = new T.Mesh(new T.BoxGeometry(12, 7.4, 0.5), new T.MeshStandardMaterial({ color: new T.Color(MR.css("--kf-raised")), roughness: 0.4, metalness: 0.6 }));
  const face = new T.Mesh(new T.PlaneGeometry(11.2, 6.6), MR.screenMaterial(MR.screenTexture("Case screen video", "Product screen placeholder · 16:10 · repeating"), tint.clone()));
  face.position.z = 0.26;
  const stand = new T.Mesh(new T.BoxGeometry(1.2, 3.2, 0.4), shell.material);
  stand.position.set(0, -5, -0.2);
  monitor.add(shell, face, stand);
  monitor.position.set(0, 4.2, -6);
  monitor.rotation.y = -0.18;
  scene.add(monitor);
  scene.add(new T.AmbientLight(new T.Color(MR.css("--kf-ink")), 0.4));
  const key = new T.PointLight(tint, 60, 40);
  key.position.set(0, 5, 2);
  scene.add(key);
  su.uLampPos.value.set(0, 4, -5);
  su.uLamp.value.copy(tint).lerp(new T.Color(MR.css("--kf-ink")), 0.4);
  const resize = () => MR.fit(renderer, camera, canvas);
  addEventListener("resize", resize);
  resize();
  let first = true, p = 0;
  const post = MR.post(renderer);
  post.fade(0);
  const aim = new T.Vector3(0, 3.6, -6);
  let last = 0;
  const frame = (now) => {
    const t = now / 1000;
    const dt = last ? (now - last) / 1000 : 1 / 60;
    last = now;
    const want = Math.min(1, scrollY / innerHeight);
    p += (want - p) * (reduce ? 1 : 0.1);
    camera.position.set(-1.5 + p * 1.5, 3.2 + p * 2.5, 24 - p * 4);
    camera.lookAt(aim);
    const [yaw, pitch] = MR.leanTarget();
    MR.lean(camera, aim, yaw, pitch);
    face.material.uniforms.uTime.value = t;
    su.uTime.value = t;
    su.uLampPower.value = 1.6 * (1 - Math.min(1, scrollY / (innerHeight * 3)) * 0.6);
    // In the original the 3D stage exists only in the header and behind the body is black — past the header the stage clears away
    stage.style.opacity = String(1 - Math.min(1, Math.max(0, (scrollY - innerHeight * 0.3) / (innerHeight * 0.7))));
    post.render(scene, camera, dt);
    if (first) { first = false; MR.progress(1); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
