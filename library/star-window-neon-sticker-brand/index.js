// First page: opening → two-board alternating hero (mouse tilt) → pulled by scroll into the world inside a star window. The product card ring is _fx/card-ring-3d
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const op = document.querySelector(".op");
  const mv = document.querySelector(".mv");
  const themes = [...document.querySelectorAll(".mv__theme")];
  const worlds = [...document.querySelectorAll(".concept-bg__ph")];

  // Swap two panels (moist · smooth) every 4.5s. Background, bottle and the world behind slide together
  let idx = Math.max(0, themes.findIndex((t) => t.classList.contains("is-show")));
  let timer = null;
  const show = (i) => {
    themes.forEach((t, k) => t.classList.toggle("is-show", k === i));
    worlds.forEach((w, k) => w.classList.toggle("is-show", k === i));
  };
  const startRotation = () => {
    clearInterval(timer);
    show(idx);
    timer = setInterval(() => { idx = (idx + 1) % themes.length; show(idx); }, 4500);
  };
  const stopRotation = () => { clearInterval(timer); timer = null; };

  // Store box: press to open, press again to fold (original Openner — is-opened on the box and the wrapping plate)
  document.querySelectorAll(".shop__box").forEach((box) => {
    const toggle = () => {
      const open = box.classList.toggle("is-opened");
      box.closest(".shop__boxWrap")?.classList.toggle("is-opened", open);
      box.setAttribute("aria-expanded", open);
    };
    box.addEventListener("click", (e) => { if (!e.target.closest("a")) toggle(); });
    box.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });

  // Featured video: muted autoplay, loop, starting from 2 seconds only the first time (original YouTube start: 2)
  document.querySelectorAll("video[data-start]").forEach((v) => {
    const seek = () => { v.currentTime = +v.dataset.start; };
    if (v.readyState >= 1) seek(); else v.addEventListener("loadedmetadata", seek, { once: true });
    if (reduce) v.pause();
  });

  if (reduce) {
    op.style.display = "none";
    mv.classList.add("fade-in");
    return;
  }

  // UFO: starting .1s after the opening lifts, it goes once around the ring path in 16s (sine.inOut), and for 30~70% of the path it sits behind the bottle bundle (z −1)
  const flyUfo = () => {
    const ufo = document.querySelector(".mv__ufo"), wrap = document.querySelector(".mv__ufoWrap"), path = document.querySelector(".mv__ufoPath");
    if (!ufo || !path || !window.MotionPathPlugin) return;
    gsap.registerPlugin(MotionPathPlugin);
    gsap.to(ufo, {
      motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: false }, duration: 16, ease: "sine.inOut", repeat: -1,
      onUpdate() { const p = this.progress(); gsap.set(wrap, { zIndex: p >= 0.3 && p <= 0.7 ? -1 : 1 }); },
    });
  };

  // Original order: logo at 0.3s, curtain lifts and the alternation starts at 1.3s, hero at 2.3s, curtain removed at 3.3s
  setTimeout(() => {
    op.classList.add("fade-in");
    setTimeout(() => {
      op.classList.add("fade-out");
      startRotation();
      setTimeout(() => mv.classList.add("fade-in"), 1000);
      setTimeout(() => { op.style.display = "none"; setTimeout(flyUfo, 100); }, 2000);
    }, 1000);
  }, 300);

  const prods = [...document.querySelectorAll(".mv__products")];
  // Original tilts the plate inside the bottle bundle ±3.5° toward the mouse and shifts it ±25px (.3s power2.out, perspective 1000)
  if (matchMedia("(pointer: fine)").matches) {
    addEventListener("mousemove", (e) => {
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      gsap.to(prods, { rotationY: x * 7, rotationX: y * -7, x: x * 50, y: y * 50, duration: 0.3, ease: "power2.out", transformPerspective: 1000, force3D: true });
    });
  }

  gsap.matchMedia().add({ sp: "(max-width: 768px)", pc: "(min-width: 769px)" }, (ctx) => {
    const { sp } = ctx.conditions;
    const bgs = document.querySelectorAll(".mv__bg");
    const frame = document.querySelector(".mv__frame");
    const world = document.querySelector(".concept-bg");
    const fly = [...prods, ...document.querySelectorAll(".mv__deco")];
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".intro",
        start: "top top",
        end: "+=110%",
        scrub: sp ? 0.05 : true,
        onUpdate: (st) => {
          if (st.progress > 0 && timer) stopRotation();
          else if (st.progress === 0 && !timer && op.style.display === "none") startRotation();
        },
      },
    });
    // Same as the original MvScrub — PC gives no lengths so all are .5 (default), phone rests for 1+1, is sucked in during 3, then the back world goes to 1.1 during 4
    if (sp) {
      tl.to(bgs, { scale: 1, duration: 1, ease: "none", force3D: true })
        .to(bgs, { scale: 1, duration: 1, ease: "none", force3D: true })
        .to(bgs, { scale: 8, opacity: 0, duration: 3, ease: "none", force3D: true })
        .to(frame, { scale: 5, filter: "blur(50px)", opacity: 0, duration: 3, ease: "none", force3D: true }, "<")
        .to(fly, { scale: 3, filter: "blur(15px)", opacity: 0, duration: 3, ease: "none", force3D: true }, "<")
        .to(world, { scale: 1.1, duration: 4, ease: "none", force3D: true });
    } else {
      tl.to(bgs, { scale: 8, ease: "none", force3D: true })
        .to(frame, { scale: 5, filter: "blur(50px)", opacity: 0, ease: "none", force3D: true }, "<")
        .to(fly, { scale: 3, filter: "blur(15px)", opacity: 0, ease: "none", force3D: true }, "<")
        .to(world, { scale: 1.05, ease: "none", force3D: true })
        .to(world, { scale: 1.1, ease: "none", force3D: true });
    }
  });
})();
