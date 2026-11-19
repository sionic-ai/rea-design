/* Home — original order kept: while the wheel rolls one screen height (cameraMove), the camera passes the eclipse disc and heads to the center of the carousel,
   When all have arrived (carouselRotate), wheel ×0.4 turns the 10 screens. The screen’s light color tints the sand dunes. */
(() => {
  const MR = window.MR, T = window.THREE;
  const canvas = document.querySelector("[data-home-canvas]");
  const root = document.querySelector(".mh");
  if (!T || !canvas || !root) { MR?.progress?.(1); return; }
  const reduce = MR.reduce;
  const N = 10, R = 26, STEP = (Math.PI * 2) / N, SCREEN_Y = 6.2, PX_PER_SLIDE = 120;
  const names = [...document.querySelectorAll("[data-projects] a")].map((a) => a.textContent.trim());

  const renderer = MR.renderer(canvas);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(35, 1, 0.1, 400);
  const colors = MR.projectColors(N);

  const sand = MR.sand({ size: 300, seg: 280, dune: 1, flat: [0, 0, 9] });
  sand.position.y = -2.2;
  scene.add(sand);
  const su = sand.material.uniforms;
  su.uFogDist.value.set(20, 120);

  const carousel = new T.Group();
  const screens = [];
  for (let i = 0; i < N; i++) {
    const geo = new T.CylinderGeometry(R, R, 19, 48, 1, true, -0.3, 0.6);
    const mat = MR.screenMaterial(MR.screenTexture(`Project video ${i + 1}`), colors[i].clone());
    const m = new T.Mesh(geo, mat);
    m.position.y = SCREEN_Y;
    m.rotation.y = Math.PI - i * STEP;
    carousel.add(m);
    screens.push(m);
  }
  scene.add(carousel);

  const portal = MR.portal(9);
  portal.position.set(0, 6, 34);
  scene.add(portal);
  const glowU = portal.userData.mat.uniforms;

  const white = new T.Color(MR.css("--kf-ink"));
  const lampFrom = new T.Vector3(0, 7.5, 31), lampTo = new T.Vector3(0, SCREEN_Y, -R + 2);
  const lampCol = new T.Color();
  const look = new T.Vector3();

  const st = { phase: "intro", vy: 0, p: 0, slide: 0, rot: 0, front: 0, t: 0 };
  // When loading ends the scene is revealed over 3.6s power2.out — the camera approaches from 20 behind while the light and portal fill in (the original’s long post-loading entrance curve)
  const reveal = { v: reduce || MR.inner ? 0 : 1 };
  MR.ready(() => { if (!reduce) gsap.to(reveal, { v: 0, duration: 3.6, ease: "power2.out" }); });
  const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

  // ── Title: the old title vanishes in .3s → the new one enters .3s later in .3s, prev/next come in from ∓200px ──
  const titleEl = document.querySelector("[data-title]"), prevEl = document.querySelector("[data-prev-title]"), nextEl = document.querySelector("[data-next-title]");
  const setTitles = (i, animate) => {
    const prev = names[(i - 1 + N) % N], next = names[(i + 1) % N];
    if (!animate || reduce) { titleEl.textContent = names[i]; prevEl.textContent = prev; nextEl.textContent = next; return; }
    const ease3 = "cubic-bezier(0.16,1,0.3,1)";
    gsap.timeline()
      .to(titleEl, { opacity: 0, duration: 0.3, ease: "none" }, 0)
      .to(prevEl.parentElement, { x: -200, opacity: 0, duration: 0.3, ease: "none" }, 0)
      .to(nextEl.parentElement, { x: 200, opacity: 0, duration: 0.3, ease: "none" }, 0)
      .add(() => { titleEl.textContent = names[i]; prevEl.textContent = prev; nextEl.textContent = next; }, 0.3)
      .to(titleEl, { opacity: 1, duration: 0.3, ease: "none" }, 0.3)
      .fromTo(prevEl.parentElement, { x: -200 }, { x: 0, opacity: 1, duration: 0.3, ease: ease3 }, 0.3)
      .fromTo(nextEl.parentElement, { x: 200 }, { x: 0, opacity: 1, duration: 0.3, ease: ease3 }, 0.3);
  };
  setTitles(0, false);

  const setPhase = (ph) => {
    if (st.phase === ph) return;
    st.phase = ph;
    root.dataset.state = ph === "intro" ? "intro" : "carousel";
    if (ph !== "intro" && !reduce) {
      // Intro letter board shrinks to .7x and fades evenly in .48s, with 5px blur applied over .24s. Prev/next are pushed outward 200px from the center and appear .3s apart (original svelte fly)
      gsap.timeline()
        .to(".mh-intro", { opacity: 0, duration: 0.48, ease: "none" }, 0)
        .to(".mh-intro", { scale: 0.7, duration: 0.6, ease: "power1.out" }, 0)
        .to(".mh-intro", { filter: "blur(5px)", duration: 0.24, ease: "sine.inOut" }, 0.08)
        .fromTo(".mh-side.is-prev", { x: 200, opacity: 0 }, { x: 0, opacity: 1, duration: 0.26, ease: "power2.out" }, 0.03)
        .fromTo(".mh-side.is-next", { x: -200, opacity: 0 }, { x: 0, opacity: 1, duration: 0.26, ease: "power2.out" }, 0.33)
        .fromTo("[data-title]", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, 0.38)
        .fromTo("[data-visit]", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, 0.38);
    }
  };

  // ── Wheel · touch · keys: two stages of the original virtual-scroll ──
  let snapT = 0;
  const snap = () => { clearTimeout(snapT); snapT = setTimeout(() => { st.slide = Math.round(st.slide); }, 250); };
  const feed = (dy, touch) => {
    if (st.phase === "intro") {
      st.vy = Math.max(0, Math.min(st.vy + dy, innerHeight));
      if (st.vy >= innerHeight) setPhase("carousel");
    } else {
      st.slide += (dy * (touch ? 1 : 0.4)) / PX_PER_SLIDE;
      snap();
    }
  };
  addEventListener("wheel", (e) => { e.preventDefault(); feed(e.deltaY); }, { passive: false });
  let ty = null;
  addEventListener("touchstart", (e) => { ty = e.touches[0].clientY; }, { passive: true });
  addEventListener("touchmove", (e) => { if (ty == null) return; const y = e.touches[0].clientY; feed(ty - y, true); ty = y; }, { passive: true });
  addEventListener("keydown", (e) => {
    if (st.phase === "intro" && ["ArrowDown", " ", "PageDown"].includes(e.key)) { e.preventDefault(); go(); }
    else if (st.phase !== "intro" && e.key === "ArrowRight") step(1);
    else if (st.phase !== "intro" && e.key === "ArrowLeft") step(-1);
  });
  // The original goes straight to the carousel step on pressing the guide button, and only the camera follows late
  const go = () => { st.vy = innerHeight; setPhase("carousel"); };
  const step = (d) => { st.slide = Math.round(st.slide) + d; };
  document.querySelector("[data-go]")?.addEventListener("click", go);
  document.querySelector("[data-prev]")?.addEventListener("click", () => step(-1));
  document.querySelector("[data-next]")?.addEventListener("click", () => step(1));

  const resize = () => MR.fit(renderer, camera, canvas);
  addEventListener("resize", resize);
  resize();
  const post = MR.post(renderer);

  // The original disc is a carousel seen from above, so until the camera has fully descended the carousel turns at horizontal slot × .2π (.1 per frame) —
  // The copy is a plate drawn separately from the original, so the plate is rotated by the same amount along the gaze axis (cursor right = counterclockwise). Camera tilt also follows by .1 per frame
  const lean = { spin: 0, yaw: 0, pitch: 0 };
  let first = true, last = 0;
  const frame = (now) => {
    st.t = now / 1000;
    const dt = last ? (now - last) / 1000 : 1 / 60;
    last = now;
    const k = reduce ? 1 : 0.1;
    st.p += (st.vy / innerHeight - st.p) * k;
    st.rot += (st.slide - st.rot) * (reduce ? 1 : 0.08);
    const e = ease(Math.min(1, Math.max(0, st.p)));

    const [yaw, pitch, mx] = MR.leanTarget();
    const spin = st.vy < innerHeight ? mx * 0.2 * Math.PI : 0;
    lean.spin += (spin - lean.spin) * k;
    lean.yaw += (yaw - lean.yaw) * k;
    lean.pitch += (pitch - lean.pitch) * k;

    camera.position.set(0, 4.6 - e * 1.4 + reveal.v * 2, 70 - e * 64 + reveal.v * 20);
    look.set(0, 6 - e * 1.2, -e * 30);
    camera.lookAt(look);
    MR.lean(camera, look, lean.yaw, lean.pitch);
    portal.rotation.z = lean.spin;

    carousel.rotation.y = st.rot * STEP + lean.spin;
    const front = ((Math.round(st.rot) % N) + N) % N;
    if (front !== st.front) { st.front = front; setTitles(front, true); }

    const pass = 1 - Math.min(1, Math.max(0, (e - 0.55) / 0.2));
    glowU.uFade.value = pass * (1 - reveal.v * 0.85);
    glowU.uTime.value = st.t;
    const show = Math.min(1, Math.max(0, (e - 0.35) / 0.55));
    screens.forEach((m) => { m.material.uniforms.uTime.value = st.t; m.material.uniforms.uFade.value = show; });

    lampCol.copy(white).lerp(colors[front], e);
    su.uLamp.value.lerp(lampCol, 0.06);
    su.uLampPos.value.lerpVectors(lampFrom, lampTo, e);
    su.uLampPower.value = (1.6 + e * 0.8) * (1 - reveal.v * 0.9);
    su.uTime.value = st.t;

    post.fade(reveal.v);
    post.render(scene, camera, dt);
    if (first) { first = false; MR.progress(1); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
