(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;

  // Phone drawer — two lines bend ±15° into an X and the drawer slides out from the left in .6s (original is-nav-active)
  const trigger = document.querySelector(".kx-trigger");
  const close = () => { body.classList.remove("is-nav-open"); trigger && trigger.setAttribute("aria-expanded", "false"); };
  if (trigger) {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const open = !body.classList.contains("is-nav-open");
      body.classList.toggle("is-nav-open", open);
      trigger.setAttribute("aria-expanded", String(open));
    });
  }
  document.querySelectorAll(".kx-overlay").forEach((o) => o.addEventListener("click", close));
  addEventListener("keydown", (e) => e.key === "Escape" && close());

  // Photos turn on when they straddle the screen (original lozad threshold 0), groups turn on when their top passes the 80% line (original inview enter_threshold .8)
  // Original turns on the first-screen bundle after jQuery ready and image loading finish (measured about .34s) — turning it on at open would brighten the first screen earlier than the original
  const t0 = performance.now();
  const show = (el) => (performance.now() - t0 < 300 ? setTimeout(() => el.classList.add("is-in"), 340) : el.classList.add("is-in"));
  if (reduce || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".kx-fade, .kx-inview").forEach(show);
  } else {
    const lazy = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { show(en.target); lazy.unobserve(en.target); } }));
    document.querySelectorAll(".kx-fade").forEach((el) => lazy.observe(el));
    const near = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { show(en.target); near.unobserve(en.target); } }), { rootMargin: "0px 0px -20% 0px" });
    document.querySelectorAll(".kx-inview").forEach((el) => near.observe(el));
  }

  // Big wordmark loop (original 5.6s logo video, 10fps): empty board → scattered dots → denser dots → halftone letters → solid letters held for 5.2s
  document.querySelectorAll(".kx-bigmark").forEach((box) => {
    const solid = box.querySelector(".kx-bigmark__solid");
    const dots = box.querySelector(".kx-bigmark__dots");
    const cv = box.querySelector("canvas");
    if (!solid || !dots || !cv || !window.gsap || reduce) return;
    const ctx = cv.getContext("2d");
    const ink = () => getComputedStyle(document.documentElement).getPropertyValue("--kf-ink").trim() || "currentColor";
    const scatter = (n) => {
      const r = box.getBoundingClientRect();
      const dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, r.width, r.height);
      ctx.fillStyle = ink();
      const rad = Math.max(1.2, r.height * 0.012);
      for (let i = 0; i < n; i++) {
        const x = Math.random() * r.width;
        const y = r.height * (0.05 + Math.random() * 0.55);
        ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
      }
    };
    const tl = gsap.timeline({ repeat: -1 });
    tl.set([solid, dots, cv], { autoAlpha: 0 }, 0)
      .call(() => scatter(160), null, 0.1).set(cv, { autoAlpha: 1 }, 0.1)
      .call(() => scatter(320), null, 0.2)
      .set(cv, { autoAlpha: 0 }, 0.3).set(dots, { autoAlpha: 1 }, 0.3)
      .set(dots, { autoAlpha: 0 }, 0.4).set(solid, { autoAlpha: 1 }, 0.4)
      .set({}, {}, 5.6);
    const io = new IntersectionObserver(([en]) => (en.isIntersecting ? tl.play() : tl.pause()));
    io.observe(box);
  });
})();
