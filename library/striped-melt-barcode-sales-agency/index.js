// Home page: hero strip stretching (load .15, during the 400% pin .15 + .83p), showreel window widening, brand preview, card stacking.
(() => {
  const { ES } = window;

  function hero(c) {
    const sec = c.querySelector("#hero");
    const canvas = sec?.querySelector("[data-hero-gl]");
    if (!canvas) return () => {};
    const src = document.createElement("canvas");
    src.width = 900; src.height = 1600;
    ES.drawBud(src, 0);
    const fx = ES.stripe({ canvas, source: src, fit: "cover", animate: (cv, t) => ES.drawBud(cv, t) });
    if (!fx) return () => {};
    const u = fx.uniforms.uZoneEnd;
    if (ES.reduce) { u.value = 0.15; return () => fx.destroy(); }
    gsap.fromTo(u, { value: 0 }, { value: 0.15, duration: 1.2, ease: "power2.out" });
    if (ES.touch || innerWidth < 991) gsap.delayedCall(1, () => gsap.to(u, { value: 0.6, duration: 2.5, ease: "power2.out" }));
    else ScrollTrigger.create({ trigger: sec, start: "top top", end: "+=400%", pin: true, scrub: true, anticipatePin: 1, onUpdate: (s) => (u.value = 0.15 + 0.83 * s.progress) });
    return () => fx.destroy();
  }

  // Showreel — during 150% of pinned screen the center window grows to fill the screen (power1.out), and the video inside goes .8 → 1 after .2
  function reel(c) {
    const sec = c.querySelector("#showreel");
    if (!sec || ES.reduce) return;
    const stage = sec.querySelector(".es-reel__stage"), clip = sec.querySelector("[data-reel-clip]"), vid = sec.querySelector("[data-reel-video]");
    const mm = gsap.matchMedia();
    mm.add({ d: "(min-width: 992px)", m: "(max-width: 991px)" }, (ctx) => {
      if (ctx.conditions.d) {
        gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "+=150%", pin: stage, scrub: true, anticipatePin: 1 } })
          .to(clip, { width: "100%", height: "100%", ease: "power1.out" }, 0)
          .to(vid, { scale: 1, ease: "power1.out" }, 0.2);
      } else {
        gsap.timeline({ scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom bottom", scrub: true } })
          .to(clip, { width: "100%", height: "100%", ease: "none" }, 0)
          .to(vid, { scale: 1, ease: "power1.out" }, 0.2)
          .to(stage, { y: -50, ease: "none" }, 0);
      }
    });
    ES.onLeave(() => mm.revert());
  }

  // Brand — on wide screens a 200×300 preview that follows the cursor by .15 (+120px), on narrow screens the row crossing the 60% screen line turns blue
  function brands(c) {
    const list = c.querySelector("[data-brands]");
    if (!list) return;
    const items = [...list.querySelectorAll(".es-brand")];
    if (ES.touch || innerWidth <= 991) {
      items.forEach((it, i) => {
        const first = i === 0, last = i === items.length - 1;
        if (first) it.classList.add("highlight");
        ScrollTrigger.create({ trigger: it, start: "top 60%", end: "bottom 60%", onEnter: () => it.classList.add("highlight"), onEnterBack: () => it.classList.add("highlight"), onLeave: () => !last && it.classList.remove("highlight"), onLeaveBack: () => !first && it.classList.remove("highlight") });
      });
      return;
    }
    const pv = document.createElement("div");
    pv.className = "brand-hover-preview";
    document.body.append(pv);
    const imgs = [];
    items.forEach((it) => { const im = it.querySelector(".es-brand__img"); if (!im) return; const cl = im.cloneNode(true); cl.classList.remove("es-brand__img"); pv.append(cl); imgs[+it.dataset.index] = cl; });
    let mx = 0, my = 0, x = 0, y = 0, cur = null, raf = 0;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    addEventListener("mousemove", onMove);
    const tick = () => { x += 0.15 * (mx - x); y += 0.15 * (my - y); pv.style.transform = `translate(${x + 120}px, ${y}px) translate(-50%, -50%)`; raf = requestAnimationFrame(tick); };
    tick();
    list.addEventListener("mouseenter", () => gsap.to(pv, { opacity: 1, duration: 0.2, ease: "power2.out" }));
    list.addEventListener("mouseleave", () => gsap.to(pv, { opacity: 0, duration: 0.25, ease: "power2.in" }));
    items.forEach((it) => it.addEventListener("mouseenter", () => {
      const im = imgs[+it.dataset.index];
      if (!im || im === cur) return;
      if (cur) { const prev = cur; gsap.to(prev, { y: "-100%", duration: 0.3, ease: "power2.out", onComplete: () => gsap.set(prev, { y: "100%" }) }); }
      gsap.set(im, { y: "100%", opacity: 1 });
      gsap.to(im, { y: "0%", duration: 0.3, ease: "power2.out" });
      cur = im;
    }));
    ES.onLeave(() => { cancelAnimationFrame(raf); removeEventListener("mousemove", onMove); pv.remove(); });
  }

  // Card stacking — pins the card wrapper at the top (no pinSpacing) through the end of the list, earlier cards at .9 + .025n scale · rotationX −10° · veil .8
  function cards(c) {
    const list = c.querySelector("[data-cards]");
    if (!list || ES.reduce) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 992px)", () => {
      const all = gsap.utils.toArray(list.querySelectorAll(".es-card"));
      const last = all[all.length - 1];
      all.forEach((card, n) => {
        const w = card.closest(".es-card-w");
        if (card === last) {
          gsap.set(card, { "--overlay-opacity": 0, scale: 1, rotationX: 0 });
          ScrollTrigger.create({ trigger: w, start: "top top", end: "bottom bottom", endTrigger: list, scrub: true, pin: w, pinSpacing: false, invalidateOnRefresh: true });
        } else {
          gsap.fromTo(card, { scale: 1, rotationX: 0, "--overlay-opacity": 0 }, { scale: 0.9 + 0.025 * n, rotationX: -10, "--overlay-opacity": 0.8, transformOrigin: "top center", ease: "none", scrollTrigger: { trigger: w, start: "top top", end: "bottom bottom", endTrigger: list, scrub: true, pin: w, pinSpacing: false, invalidateOnRefresh: true } });
        }
        const img = card.querySelector(".es-card__img");
        if (img) gsap.to(img, { scale: 1, ease: "none", scrollTrigger: { trigger: w, start: "top bottom", end: "bottom bottom", endTrigger: list, scrub: true } });
      });
    });
    ES.onLeave(() => mm.revert());
  }

  ES.page("home", (c) => {
    const off = hero(c);
    reel(c);
    brands(c);
    cards(c);
    return off;
  });
})();
