// Studio: during the beach stage and the lead intro pin, the fixed logo changes pose, then steps back.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s) => document.querySelector(s);
  const logo = DK.logo3d($(".st-logo"), { drag: true });
  const P = (o) => ({ x: 0, y: 0, s: 0.95, rx: 0, ry: 1.52, rz: 0, split: 0, o: 1, ...o });
  const steps = [P({}), P({ x: 0.05, y: -0.1, s: 1.0, ry: 0.45, rz: 0.18 }), P({ y: -0.12, s: 1.12, ry: -0.35, rz: -0.28 }), P({ x: 0.12, y: -0.16, s: 1.2, ry: 0.4, rz: 0.08 })];
  const founders = [P({ y: -0.45, s: 0.9, ry: 0.2, rz: 0.05 }), P({ x: -0.15, y: -0.1, s: 1.5, ry: -0.3, rz: 0.1 }), P({ x: 0.1, y: -0.1, s: 1.5, ry: 0.35, rz: -0.1 })];
  const slides = gsap.utils.toArray(".st-slide");

  gsap.matchMedia().add({ motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    const motion = ctx.conditions.motion;
    DK.whySteps($(".hx-why"), motion);
    ScrollTrigger.create({ trigger: ".hx-why", start: "top top", end: "bottom bottom", onUpdate: (st) => logo.pose(steps[Math.min(3, Math.floor(st.progress * 4))]) });
    logo.pose(steps[0], true);

    let fi = -1;
    const showSlide = (i) => {
      if (i === fi) return;
      slides.forEach((s, k) => gsap.to(s, { opacity: k === i ? 1 : 0, duration: motion ? 0.7 : 0, ease: "expo.out", overwrite: true }));
      const img = slides[i].querySelector(".wf-img"), cap = slides[i].querySelector("figcaption");
      if (motion) gsap.fromTo(img, { filter: "blur(14px)", scale: 1.04 }, { filter: "blur(0px)", scale: 1, duration: 1.1, ease: "expo.out" });
      if (motion && cap) gsap.fromTo(cap, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "expo.out", delay: 0.1 });
      fi = i;
    };
    ScrollTrigger.create({
      trigger: ".st-founders", start: "top top", end: "bottom bottom",
      onUpdate: (st) => { const i = Math.min(2, Math.floor(st.progress * 3)); showSlide(i); logo.pose(founders[i]); },
      onEnter: () => showSlide(0), onEnterBack: () => logo.pose({ o: 1 }),
      onLeave: () => logo.pose({ o: 0, s: 0.5 }),
    });
    ScrollTrigger.create({ trigger: ".st-founders", start: "top 60%", onLeaveBack: () => logo.pose(steps[3]) });

    document.querySelectorAll("[data-count]").forEach((el) => {
      const n = Number(el.dataset.count), o = { v: 0 };
      if (!motion) return;
      gsap.to(o, { v: n, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" }, onUpdate: () => (el.textContent = Math.round(o.v)) });
    });
    if (!motion) return;
    gsap.utils.toArray(".st-aw__list li").forEach((li, i) => gsap.from(li, { opacity: 0, y: 8, duration: 0.6, delay: (i % 14) * 0.03, ease: "expo.out", scrollTrigger: { trigger: li, start: "top 95%" } }));
    gsap.utils.toArray(".st-rise, .st-ex__head").forEach((el) => gsap.from(el, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
    gsap.to(".st-strip__track", { x: () => -(document.querySelector(".st-strip__track").scrollWidth - innerWidth * 0.8), ease: "none", scrollTrigger: { trigger: ".st-strip", start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
  });
})();
