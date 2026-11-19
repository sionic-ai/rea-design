/* About motion — original values: big-text words .25→1 scrub 2 (top center → bottom center, phone top 35% → bottom 90%) ·
   Typewriter 75/50ms, rewind 800ms, start 500ms · Card stack at .2/.4/.6/.8s delays, .8s ease · Ring draws in 3s after .5s and rewinds in 3s ·
   Customer cards 50px .8s power3.out, .8s total · value panels brighten at .5s ease · cards pinned for 300vh, pass upward at ±10° (power3) */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const rgbOf = (c) => { const p = document.createElement("span"); p.style.color = c; document.body.appendChild(p); const m = getComputedStyle(p).color.match(/[\d.]+/g) || [128, 128, 128]; p.remove(); return m.slice(0, 3).map(Number); };
  gsap.registerPlugin(ScrollTrigger, CustomEase);

  /* Sixteen customer cards */
  const sectors = ["Venture", "Corporate Venture", "Private fund", "Venture", "Startup", "Fintech", "Fund", "Venture", "Venture", "Venture", "Fintech", "Private fund", "Venture", "Talent platform", "Talent platform", "AI Startup"];
  const grid = document.querySelector("[data-clients]");
  if (grid) grid.innerHTML = sectors.map((s, i) => `<div class="ab-client"><div class="ab-client__top"><i class="dot"></i><span class="ab-client__sector">${s}</span></div>${i % 3 === 1 ? "" : '<span class="ab-client__logo" aria-label="Customer logo slot"></span>'}</div>`).join("");

  /* Typewriter */
  if (window.Typed && document.querySelector("[data-typed]")) {
    const strings = ["Key customers", "Market Size", "Competitor analysis"];
    if (reduce) document.querySelector("[data-typed]").textContent = strings[1];
    else new Typed("[data-typed]", { strings, typeSpeed: 75, backSpeed: 50, backDelay: 800, startDelay: 500, loop: true, showCursor: false });
  }

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const lead = document.querySelector("[data-lead]");
    if (lead) {
      const s = new SplitText(lead, { type: "words", wordsClass: "pn-word" });
      const narrow = innerWidth <= 767;
      gsap.from(s.words, { opacity: 0.25, stagger: 0.1, scrollTrigger: { trigger: lead, start: narrow ? "top 35%" : "top center", end: narrow ? "bottom 90%" : "bottom center", scrub: 2 } });
    }
    const deck = document.querySelector("[data-deck]");
    if (deck) {
      const cards = deck.querySelectorAll(".ab-deck__c");
      gsap.set(cards, { opacity: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: deck, start: "top bottom", once: true } });
      cards.forEach((c, i) => tl.to(c, { opacity: 1, duration: 0.8, ease: "power1.inOut" }, 0.2 * (i + 1)));
    }
    const ring = document.querySelector("[data-ring]");
    if (ring) {
      const circles = ring.querySelectorAll("circle");
      gsap.set(circles, { strokeDashoffset: 1 });
      gsap.timeline({ repeat: -1, repeatDelay: 0, scrollTrigger: { trigger: ring, start: "top bottom", toggleActions: "play pause resume pause" } })
        .to(circles, { strokeDashoffset: 0.01, duration: 3, stagger: 0, ease: "none" }, 0.5)
        .to(circles, { strokeDashoffset: 1, duration: 3, ease: "none" }, 4);
    }
    if (grid) {
      gsap.from(grid.children, { opacity: 0, y: 50, duration: 0.8, stagger: { amount: 0.8, from: "start" }, ease: "power3.out", scrollTrigger: { trigger: grid, start: "top 80%", once: true } });
    }
  });

  /* Values: panel brightens + cards pass upward on a fixed stage (wide screens only) */
  const ab = document.querySelector("[data-ab-bg]");
  const values = document.querySelector(".ab-values");
  if (ab && values) {
    ScrollTrigger.create({ trigger: values, start: "top 60%", end: "bottom top", onEnter: () => ab.classList.add("is-light"), onLeaveBack: () => ab.classList.remove("is-light") });
  }
  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    const pin = document.querySelector("[data-pin]");
    const stage = document.querySelector("[data-pin-stage]");
    const cards = [...document.querySelectorAll("[data-card]")];
    if (!pin || !stage || !cards.length) return;
    ScrollTrigger.create({ trigger: pin, start: "top top", end: "bottom bottom", pin: stage, pinSpacing: false });
    gsap.set(cards, { yPercent: 50, y: () => 0.5 * innerHeight });
    const tl = gsap.timeline({ scrollTrigger: { trigger: values, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
    tl.to(cards, { yPercent: -50, y: () => -0.5 * innerHeight, duration: 1, stagger: 0.12, ease: CustomEase.create("pn-pass", "M0,0 C0,0 0.098,0.613 0.5,0.5 0.899,0.386 1,1 1,1") }, "step")
      .to(cards, { rotation: () => (Math.random() - 0.5) * 20, stagger: 0.12, duration: 0.5, ease: "power3.out" }, "step")
      .to(cards, { rotation: 0, stagger: 0.12, duration: 0.5, ease: "power3.in" }, "step+=0.5");
  });

  /* 3D mark next to numbers: a smooth pebble turns slowly (the original Spline scene rebuilt with three basic shapes) */
  const host = document.querySelector("[data-blob]");
  if (host && window.THREE) {
    const T = THREE;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    host.appendChild(renderer.domElement);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 6);
    const geo = new T.SphereGeometry(1, 96, 64);
    const p = geo.attributes.position, v = new T.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const k = 1 + 0.12 * Math.sin(v.x * 3.1 + v.y * 1.7) + 0.08 * Math.sin(v.z * 4.3 - v.y * 2.2);
      v.multiplyScalar(k); v.y *= 0.82;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    const [r, g, b] = rgbOf(css("--kf-contrast-bg") || "gray");
    const mesh = new T.Mesh(geo, new T.MeshStandardMaterial({ color: new T.Color(r / 255, g / 255, b / 255).lerp(new T.Color(0.5, 0.5, 0.5), 0.15), roughness: 0.3, metalness: 0.2 }));
    scene.add(mesh);
    scene.add(new T.HemisphereLight(0xffffff, 0x000000, 0.35)); // Not skin: sky and ground lighting that use only light intensity
    const key = new T.DirectionalLight(0xffffff, 2.4); key.position.set(-2, 3, 3); scene.add(key); // Not skin: white light that only uses light intensity
    const fit = () => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); };
    new ResizeObserver(fit).observe(host); fit();
    let vis = false;
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(host);
    const draw = (t) => { mesh.rotation.y = t * 0.3; mesh.rotation.x = Math.sin(t * 0.2) * 0.3; renderer.render(scene, camera); };
    if (reduce) draw(0); else gsap.ticker.add((t) => { if (vis) draw(t); });
  }
})();
