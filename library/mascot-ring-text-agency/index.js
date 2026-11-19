// Home — Hero loader·mouse response·pin, service section brush·petals flying in·row cover·bowl circle, award disc, five strengths rotation
(() => {
  if (!window.gsap) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mm = gsap.matchMedia();
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Hero ----------
  const hero = $(".h-hero");
  const stage = $("[data-hero-stage]"), loader = $("[data-hero-loader]"), bottom = $("[data-hero-bottom]"), flash = $("[data-hero-flash]");
  let ready = false;
  const go = () => {
    if (ready) return;
    ready = true;
    dispatchEvent(new Event("q:ready"));
    mm.add({ desk: "(min-width: 992px)", mob: "(max-width: 991px)" }, (c) => {
      const { mob } = c.conditions;
      if (reduce) { gsap.set(stage, { scale: 1 }); gsap.set(loader, { display: "none" }); gsap.set(flash, { scale: 1.05 }); if (!mob) gsap.set(bottom, { y: () => -(bottom.offsetHeight + 15) }); return; }
      gsap.timeline({ defaults: { ease: "power3.out", duration: 1.2 } })
        .to(stage, { scale: 1, duration: 1, ease: "power2.out" }, 0)
        .to(loader, { scale: 3, opacity: 0, duration: 1, ease: "power2.out", display: "none" }, "<")
        .to(bottom, { y: mob ? 0 : () => -(bottom.offsetHeight + 15), duration: 1, ease: "power2.out" }, 0.8);
      if (mob) gsap.set(flash, { xPercent: -50, yPercent: -50 });
      gsap.to(flash, { scale: mob ? 1.5 : 1.05, duration: 1.2, delay: 0.35, ease: "power3.out" });
    });
  };
  // The original shows the first screen once the loader and mascot videos can play (up to 2.5s) — ours waits until fonts and the 3D board are ready
  Promise.race([document.fonts.ready.then(() => new Promise((r) => setTimeout(r, 2000))), new Promise((r) => setTimeout(r, 2500))]).then(go);

  mm.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
    // Light follows the mouse (1s power1.out), graffiti parallax (±50px · ±3° from screen center), and shine tilt
    const toX = gsap.quickTo(hero, "--x", { duration: 1, ease: "power1.out" });
    const toY = gsap.quickTo(hero, "--y", { duration: 1, ease: "power1.out" });
    const graf = $("[data-hero-graffiti]");
    // Like the original, x·y·rotateX·rotateY are set with GSAP quickSetter — layered on top of the CSS perspective(5cm) · transform .4s ease-out.
    const setGraf = gsap.quickSetter(graf, "css");
    let raf = 0;
    const move = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const b = graf.getBoundingClientRect();
        const m = (e.clientX / innerWidth - 0.5) * 100, p = (e.clientY / innerHeight - 0.5) * 100;
        const h = ((e.clientX - b.left) / b.width - 0.5) * 6, f = -(((e.clientY - b.top) / b.height - 0.5) * 6);
        gsap.set(flash, { rotate: h });
        setGraf({ x: -m, y: -p, rotateX: f, rotateY: h });
        toX(`${(e.clientX / innerWidth) * 100}%`); toY(`${(e.clientY / innerHeight) * 100}%`);
      });
    };
    addEventListener("mousemove", move);
    // The hero stays for one screen and the service section rises over it
    const pin = ScrollTrigger.create({ trigger: hero, start: "top top", end: "+=100%", pin: true, pinSpacing: false });
    return () => { removeEventListener("mousemove", move); pin.kill(); gsap.set(graf, { clearProps: "transform" }); };
  });

  // ---------- Graffiti (hero) spray — the original video is drawn once ----------
  $$(".h-hero__graffiti text, .h-hero__graffiti path").forEach((p, i) => {
    if (reduce) return;
    gsap.fromTo(p, { strokeDasharray: 4000, strokeDashoffset: 4000 }, { strokeDashoffset: 0, duration: 3, delay: 0.2 + i * 0.2, ease: "none" });
  });

  // ---------- Service section ----------
  const svc = $(".h-svc");
  const brush = $$("[data-svc-brush] path");
  const plush = $("[data-svc-plush]");
  const list = $("[data-svc-list]");
  mm.add({ desk: "(min-width: 992px)", mob: "(max-width: 991px)" }, (c) => {
    const { mob } = c.conditions;
    // List row cover — peels away on the right axis over 1.2s to reveal the wavy line
    $$("[data-svc-cover]").forEach((cv) => {
      if (reduce) return gsap.set(cv, { scaleX: 0 });
      gsap.fromTo(cv, { scaleX: 1, transformOrigin: "right" }, { scaleX: 0, duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: cv, start: "top bottom", toggleActions: "play none none none" }, onComplete: () => cv.classList.add("hidden") });
    });
    if (mob || reduce) { gsap.set(brush, { strokeDashoffset: 0 }); return; }
    brush.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    // Brush stroke — the original Lottie (.75x speed, .5x when played forward) rebuilt as five lines: painted one after another from top to bottom over 1.6s
    const paint = gsap.timeline({ paused: true })
      .to(brush, { strokeDashoffset: 0, duration: 0.7, ease: "power1.inOut", stagger: 0.22 }, 0)
      .fromTo(plush, { y: () => innerHeight * 0.9, yPercent: 30 }, { y: 0, yPercent: 0, duration: 1, ease: "expo.out" }, 0.25);
    gsap.set(plush, { y: () => innerHeight * 0.9, yPercent: 30, display: "none" });
    // Before the brush paint, the furry petal 3D isn’t drawn (it’s offscreen and invisible, and drawing it together with the hero 3D slows the interaction response)
    paint.eventCallback("onStart", () => gsap.set(plush, { display: "" }));
    paint.eventCallback("onReverseComplete", () => gsap.set(plush, { display: "none" }));
    let state = "idle";
    const fwd = () => { if (state === "fwd") return; state = "fwd"; paint.timeScale(1).play(); };
    const back = () => { if (state === "back") return; state = "back"; paint.timeScale(1.4).reverse(); };
    const st1 = ScrollTrigger.create({ trigger: svc, start: "top+=1 top", end: "bottom", onEnter: fwd, onEnterBack: fwd, onLeaveBack: back });
    // Petals stay pinned on screen from the section head to the list end (screen center −25%)
    const st2 = ScrollTrigger.create({ trigger: svc, start: "top top", endTrigger: list, end: "bottom center-=25%", pin: "[data-svc-pin]", pinSpacing: false, anticipatePin: 1 });
    const g = gsap.to("[data-svc-graffiti]", { yPercent: -60, ease: "expo.out", scrollTrigger: { trigger: svc, start: "top+=1px top", end: "bottom", scrub: true } });
    // The bowl circle rises half a screen at section end to cover the next section
    const arc = gsap.to("[data-svc-arc]", { y: () => -innerHeight * 0.5, ease: "none", scrollTrigger: { trigger: "[data-svc-arc]", start: "top top", end: "bottom center", scrub: true, invalidateOnRefresh: true } });
    return () => { st1.kill(); st2.kill(); paint.kill(); g.scrollTrigger?.kill(); arc.scrollTrigger?.kill(); };
  });

})();
