/* About page motion — heading line rise, eyeballs, group photo parallax, color steps, a pinned photo that turns into a lower-left circle at each scroll stop,
   Core member ring (a full turn brings the next person), face above the name. */
(() => {
  const { E } = CB;
  const off = [];
  const on = (el, ev, fn) => { el.addEventListener(ev, fn); off.push(() => el.removeEventListener(ev, fn)); };

  function hero(root) {
    const t = root.querySelector(".ab-hero__title");
    t.querySelectorAll(":scope > span").forEach((s) => (s.innerHTML = `<b>${s.innerHTML}</b>`));
    if (CB.reduce || CB.loaded) return;
    const lines = t.querySelectorAll("b"), parts = root.querySelectorAll(".ab-hero__photo, .ab-hero__dark, .ab-hero__field");
    gsap.set(lines, { yPercent: 110 });
    gsap.set(parts, { clipPath: "inset(100% 0 0 0)" });
    const play = () => {
      gsap.to(parts, { clipPath: "inset(0% 0 0 0)", duration: 0.9, ease: E.io, stagger: 0.08 });
      gsap.to(lines, { yPercent: 0, duration: 1.1, ease: E.out, stagger: 0.1, delay: 0.25 });
    };
    const f = () => { play(); document.removeEventListener("cb:reveal", f); };
    document.addEventListener("cb:reveal", f); off.push(() => document.removeEventListener("cb:reveal", f));
  }

  function eye(root) {
    const ball = root.querySelector(".ab-eye .eye__ball");
    if (!ball || CB.reduce) return;
    const look = () => gsap.to(ball, { x: gsap.utils.random(-12, 12), y: gsap.utils.random(-5, 5), duration: 0.35, ease: "power2.out", delay: gsap.utils.random(0.6, 1.8), onComplete: look });
    look();
    off.push(() => gsap.killTweensOf(ball));
  }

  // A large group photo stays framed while the picture inside drifts slowly at 0.2x
  function parallax(root) {
    root.querySelectorAll("[data-parallax]").forEach((el) => {
      gsap.fromTo(el, { backgroundPosition: "50% 0%" }, { backgroundPosition: "50% 100%", ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo(el, { "--py": 0 }, { "--py": 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }

  function scheme(root) {
    root.querySelectorAll("[data-flip3d]").forEach((s) => gsap.fromTo(s.children, { rotationX: -90, transformOrigin: "50% 0%" }, { rotationX: 0, ease: "none", stagger: 0.12, scrollTrigger: { trigger: s, start: "top bottom", end: "bottom 60%", scrub: true } }));
  }

  // Divide the length of the pinned photo phase by the number of photos, and at each step change a new photo spreads as a circle from bottom left (.8s)
  function steps(root) {
    const pin = root.querySelector("[data-steps]"), media = pin.querySelector("[data-steps-media]"), items = [...media.children], yr = pin.querySelector(".ab-events__yr");
    let cur = 0;
    ScrollTrigger.create({ trigger: pin, start: "top center", end: "bottom center", onUpdate: (st) => {
      const n = Math.min(items.length - 1, Math.floor(st.progress * items.length));
      if (n === cur) return;
      items.forEach((it, i) => it.classList.toggle("is-prev", i === cur));
      items.forEach((it, i) => it.classList.toggle("is-on", i === n));
      yr.textContent = String(2025 - n);
      cur = n;
    } });
  }

  // When the ring fills one full turn in 6s the face changes — a color band spreads in a circle from the center, then the new face appears
  function members(root) {
    const arc = root.querySelector(".ab-member__arc circle"), face = root.querySelector(".ab-member__face .ph"), name = root.querySelector(".ab-member__name");
    if (CB.reduce) { gsap.set(arc, { strokeDashoffset: 0 }); return; }
    let i = 1;
    const tl = gsap.timeline({ repeat: -1 });
    tl.fromTo(arc, { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 6, ease: "none" })
      .to(face, { clipPath: "circle(0% at 50% 50%)", duration: 0.35, ease: E.soft })
      .call(() => { name.textContent = `[ Name ${String(++i).padStart(2, "0")} ]`; })
      .to(face, { clipPath: "circle(70% at 50% 50%)", duration: 0.6, ease: E.out });
    off.push(() => tl.kill());
  }

  function foot(root) {
    const face = root.querySelector(".foot__face");
    root.querySelectorAll(".foot .names span").forEach((s) => { on(s, "pointerenter", () => face.classList.add("is-on")); on(s, "pointerleave", () => face.classList.remove("is-on")); });
    root.querySelectorAll("[data-back-top]").forEach((a) => on(a, "click", (e) => { e.preventDefault(); CB.lenis ? CB.lenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" }); }));
  }

  CB.page("about", {
    mount(root) {
      hero(root); eye(root); parallax(root); scheme(root); steps(root); members(root); foot(root);
      const P = [[".ab-hero", 0.82, 0.28], [".ab-story", 0.86, 0.22], [".ab-events", 0.4, 0.3], [".ab-comm", 0.5, 0.2], [".foot", 0.48, 0.5]];
      CB.perches = P.map(([s, x, y]) => ({ el: root.querySelector(s), x, y })).filter((p) => p.el);
    },
    unmount() { off.splice(0).forEach((f) => f()); },
  });
})();
