// About motion: right photo sphere (floats up in 1s with no entry rotation and spins at .072rad/s, on phone moved to the cell under the title) · title words rise + subtitle gradient wipe ·
// Parallax of five small photos in the black section · value accordion (.5s power3.out).
window.rgPages = window.rgPages || {};
window.rgPages.about = (root) => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.querySelector("[data-ab-canvas]");
  const slotPc = document.querySelector("[data-sphere-slot-pc]");
  const slotSp = document.querySelector("[data-sphere-slot-sp]");
  const pc = matchMedia("(min-width: 1024px)");
  const place = () => (pc.matches ? slotPc : slotSp).append(canvas);
  place();

  // Adjust the camera distance so the sphere appears at its original size inside the cell (desktop 2/3 of screen height, phone 88% of cell width)
  const camZ = () => {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    const d = pc.matches ? Math.min(w * 1.05, h * 0.67) : Math.min(w * 0.88, h * 0.92);
    return (5 * h) / (Math.tan((22.5 * Math.PI) / 180) * d);
  };
  const sphere = window.rgSphere(canvas, { entry: false, camZ: camZ(), fogNear: 0, fogFar: 0, speed: 0.072 });
  const fit = () => {
    const z = camZ();
    sphere.camera.position.z = z;
    sphere.scene.fog.near = z - 2;
    sphere.scene.fog.far = z + 12;
    sphere.size();
  };
  fit();
  const onPc = () => { place(); fit(); };
  pc.addEventListener("change", onPc);
  addEventListener("resize", fit);
  sphere.state.opacity = 0;
  sphere.start();

  const title = document.querySelector("[data-ab-title]");
  const sub = document.querySelector(".ab-mv__sub");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.set(title.querySelectorAll("span"), { yPercent: 40, autoAlpha: 0 });
    gsap.set(sub, { autoAlpha: 0 });
    // Original aboutUsMvHeadingReveal — two chunks, the English label and the title, go from transparent over 2s power3.out, .08s apart
    const heads = [root.querySelector(".ab-mv .t-label"), root.querySelector(".ab-mv__ja")].filter(Boolean);
    gsap.set(heads, { opacity: 0 });
    window.rgOnLoaded(() => {
      gsap.to(sphere.state, { opacity: 1, duration: 1, ease: "power2.out" });
      heads.forEach((h, i) => gsap.to(h, { opacity: 1, duration: 2, delay: i * 0.08, ease: "power3.out", clearProps: "opacity" }));
      gsap.to(title.querySelectorAll("span"), { yPercent: 0, autoAlpha: 1, duration: 0.95, stagger: 0.08, ease: "cubic-bezier(0.22,1,0.36,1)" });
      gsap.timeline({ delay: 0.4 })
        .to(sub, { autoAlpha: 1, duration: 0.4 })
        .fromTo(sub, { backgroundPosition: "100% 0" }, { backgroundPosition: "0% 0", duration: 1.6, ease: "power3.out" }, 0);
    });
    // When the black section covers the whole screen, the sphere is not drawn
    ScrollTrigger.create({
      trigger: ".ab-dark",
      start: "top top",
      onEnter: () => (sphere.state.opacity = 0),
      onLeaveBack: () => (sphere.state.opacity = 1),
    });
    gsap.utils.toArray(".ab-float").forEach((el) => {
      gsap.to(el, { y: () => +el.dataset.speed * innerHeight * 1.6, ease: "none", scrollTrigger: { trigger: ".ab-dark", start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => (sphere.state.opacity = 1));

  document.querySelectorAll(".acc").forEach((acc) => {
    const btn = acc.querySelector(".acc__head");
    const body = acc.querySelector(".acc__body");
    btn.addEventListener("click", () => {
      const open = !acc.classList.contains("is-open");
      acc.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      gsap.to(body, { height: open ? "auto" : 0, duration: reduce ? 0 : 0.5, ease: "power3.out", onComplete: () => ScrollTrigger.refresh() });
    });
  });
  return () => {
    mm.revert();
    pc.removeEventListener("change", onPc);
    removeEventListener("resize", fit);
    sphere.dispose();
  };
};
