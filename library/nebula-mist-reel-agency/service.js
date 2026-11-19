// Services — header enter and exit, filling text, service row line drawing, white panel stages (four rounded videos, arc, flowing title, covering video).
// Original values: heading text ±175% 1s power3.out · when scrolling down it sticks with scrub .5 · filling text .3→1 (−15% 75% ~ 115% 70%, gap .05) ·
//         line .7s power3.out (.1 late) · label .9s roll · step lengths 150/150/150/150/180 dvh.
(() => {
  const { split, scrambleIn, reduce, SCR_UP } = window.PS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function filled() {
    $$("[data-filled]").forEach((el) => {
      const chars = [];
      [...el.childNodes].forEach((n) => {
        if (n.nodeType === 3 && n.textContent.trim()) { const s = document.createElement("span"); s.textContent = n.textContent; n.replaceWith(s); chars.push(...split(s)); }
        else if (n.nodeType === 1) chars.push(...split(n));
      });
      if (!reduce) gsap.to(chars, { opacity: 1, duration: 0.1, stagger: 0.05, scrollTrigger: { trigger: el, start: "-15% 75%", end: "115% 70%", scrub: true } });
    });
  }

  function hero() {
    const top = $(".s-hero__top"), web = $(".s-hero__web"), shape = $(".s-hero__shape");
    gsap.timeline({ delay: 0.3 })
      .fromTo(".s-hero__line", { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power3.out" })
      .fromTo(top, { xPercent: 175 }, { xPercent: 0, duration: 1, ease: "power3.out" }, "<")
      .fromTo([shape, web], { xPercent: -175 }, { xPercent: 0, duration: 1, ease: "power3.out", stagger: 0.05 }, "<")
      .fromTo(".s-hero__badge", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, "<+=0.5");
    gsap.timeline({ scrollTrigger: { trigger: ".s-hero", start: "top top", end: "bottom top", pin: true, pinSpacing: false, scrub: 0.5 } })
      .to(".s-hero__line", { scaleY: 0, opacity: 0, duration: 1 })
      .to(".s-hero__badge, .s-hero__label", { opacity: 0, duration: 0.25 }, 0)
      .fromTo(top, { xPercent: 0 }, { xPercent: 175, duration: 1 }, "<")
      .fromTo([shape, web], { xPercent: 0 }, { xPercent: -175, duration: 1 }, "<");
  }

  function list() {
    $$(".s-item").forEach((it) => {
      const t = split($(".s-item__t", it)), d = split($(".s-item__d", it));
      gsap.set(d, { opacity: 0 });
      gsap.timeline({ scrollTrigger: { trigger: it, start: "top 90%" } })
        .to(t, { duration: 0.9, scrambleText: { text: "{original}", chars: SCR_UP, tweenLength: false } }, 0)
        .from(t, { opacity: 0, duration: 0.01, stagger: { amount: 0.35, from: "random" } }, 0)
        .fromTo($(".s-item__line", it), { width: "0%", opacity: 0 }, { width: "100%", opacity: 1, duration: 0.7, ease: "power3.out" }, 0.1)
        .to(d, { opacity: 1, duration: 0.01, stagger: { amount: 0.6, from: "random" } }, 0.2);
    });
  }

  // Steps: while the white plate is pinned (680vh), go through the four steps in turn. On each step change, that round video opens as a circle in .8s and the description letters turn on at random
  function stepper() {
    const vids = $$(".stepper__video"), texts = $$(".stepper__text"), arcs = $$(".stepper__ring .arc--on"), titles = $$(".st"), row = $(".stepper__titles");
    const textChars = texts.map((t) => split(t));
    const marks = [50, 200, 350, 500, 680];
    let cur = -1;
    const setStep = (k) => {
      if (k === cur) return;
      const prev = cur;
      cur = k;
      vids.forEach((v, i) => {
        if (i <= k && i > prev) gsap.fromTo(v, { clipPath: "circle(0%)" }, { clipPath: "circle(50%)", duration: 0.8, ease: "power3.inOut", overwrite: true });
        if (i > k) gsap.to(v, { clipPath: "circle(0%)", duration: 0.5, ease: "power3.inOut", overwrite: true });
      });
      textChars.forEach((cs, i) => {
        if (i === k) gsap.fromTo(cs, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: { amount: 0.4, from: "random" }, overwrite: true });
        else gsap.to(cs, { opacity: 0, duration: 0.01, stagger: { amount: 0.2, from: "random" }, overwrite: true });
      });
    };
    let starts = [];
    const measure = () => { const base = titles[0].offsetLeft; starts = titles.map((t) => t.offsetLeft - base); starts.push(row.scrollWidth - innerWidth + 160); };
    measure();
    // Step titles are English (web font), so the width changes when the font arrives late — measure once more then
    document.fonts?.ready.then(measure);
    addEventListener("resize", measure);
    gsap.matchMedia().add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
      const st = ScrollTrigger.create({
        trigger: ".stepper", start: "top top", end: "bottom bottom", scrub: true,
        onUpdate: (s) => {
          const t = s.progress * 680;
          let k = -1;
          for (let i = 0; i < 4; i++) if (t >= marks[i]) k = i;
          setStep(k);
          arcs.forEach((a, i) => { const lp = gsap.utils.clamp(0, 1, (t - marks[i]) / (marks[i + 1] - marks[i])); a.style.strokeDashoffset = String(1 - lp); });
          const kk = Math.max(0, k), lp = gsap.utils.clamp(0, 1, (t - marks[kk]) / (marks[kk + 1] - marks[kk]));
          const x = k < 0 ? 0 : starts[kk] + (Math.min(starts[kk + 1] ?? starts[kk], starts[4]) - starts[kk]) * gsap.parseEase("power1.inOut")(lp);
          gsap.set(row, { x: -x });
          const c = gsap.utils.clamp(0, 1, (t - 600) / 80);
          $(".stepper__cover").style.clipPath = `circle(${(c * 75).toFixed(2)}% at 50% 50%)`;
        },
      });
      return () => st.kill();
    });
  }

  // Kaleidoscope figure in the header mist (original service Hero figure) — picks one of five shapes by which side of the screen center the cursor is on, and the farther away it is the rougher it gets, adding color and pattern.
  // Original values: strength 1 · wildMax .4 · colour .9 · web 1 · travel .55 · shape change .9s smoothstep · roughness height ratio .22~.72 smoothstep at 2.2/s ·
  // Color 2/s · grain n=2+sin(.11t)·.7+x offset·1.2, m=3.5+cos(.083t)·.8+y bias·1.2 · if the cursor stays still for 3.5s, it circles with radius height×(.13+.07 sin .19t) ·
  // Rises .7s after load in 2.2s power2.out, on scroll down fades over screen .08~.7 and turns off past .75 · over the badge it stops as a window (rounded rectangle) · none on phone.
  function figure() {
    const m = window.PS.mist;
    if (!m || matchMedia("(max-width: 768px)").matches) return;
    const SET = [{ n: 3, hue: 0.08 }, { n: 4, hue: 0.78 }, { n: 5, hue: 0.5 }, { n: 6, hue: 1 }, { n: 0, hue: 0.3 }];
    const WINDOW = { n: -3, hue: 1 };
    const ptr = { x: innerWidth / 2, y: innerHeight / 2, at: -1e9 };
    addEventListener("mousemove", (e) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.at = performance.now(); }, { passive: true });
    const F = { from: SET[0], to: SET[0], want: SET[0], mix: 1, wild: 0, turn: 0, phase: 0, hue: SET[0].hue };
    let hold = null;
    const badge = $(".s-hero__badge");
    if (badge) { badge.addEventListener("mouseenter", () => { hold = WINDOW; }); badge.addEventListener("mouseleave", () => { hold = null; }); }
    const vis = { v: 0 };
    gsap.to(vis, { v: 1, duration: 2.2, ease: "power2.out", delay: 0.7 });
    const ss = (a, b, x) => { const k = Math.min(Math.max((x - a) / (b - a), 0), 1); return k * k * (3 - 2 * k); };
    const prev = m.onFrame;
    m.onFrame = (dt) => {
      if (prev) prev(dt);
      const now = performance.now(), W = innerWidth, H = innerHeight;
      const on = scrollY > H * 0.75 ? 0 : vis.v * (1 - ss(0.08, 0.7, scrollY / H));
      m.set("uFig", on);
      if (on <= 0) return;
      let p = ptr;
      if (now - ptr.at >= 3500) { const s = now / 1000, r = H * (0.13 + 0.07 * Math.sin(s * 0.19)); p = { x: W / 2 + Math.cos(s * 0.1) * r, y: H / 2 + Math.sin(s * 0.1) * r }; }
      const u = (p.x - W / 2) / H, v = (p.y - H / 2) / H, g = Math.hypot(u, v);
      if (hold) F.want = hold;
      else if (g > 0.06) F.want = SET[Math.floor(((Math.atan2(v, u) + Math.PI * 2.5) % (Math.PI * 2)) / (Math.PI * 2) * SET.length) % SET.length];
      else if (!SET.includes(F.want)) F.want = SET[0];
      if (F.mix >= 1 && F.want !== F.to) { F.from = F.to; F.to = F.want; F.mix = 0; }
      F.mix = Math.min(F.mix + dt / 0.9, 1);
      F.wild += ((hold ? 0 : ss(0.22, 0.72, g) * 0.4) - F.wild) * (1 - Math.exp(-dt * 2.2));
      F.hue += (F.to.hue - F.hue) * (1 - Math.exp(-dt * 2));
      const screen = F.to.n < 0 || F.from.n < 0;
      F.turn = screen ? F.turn + (Math.sin(now / 4000) * 0.03 - F.turn) * (1 - Math.exp(-dt * 2)) : F.turn + dt * 0.035 * (1 + 3 * F.wild);
      F.phase += dt * (0.55 + 0.42 * F.wild);
      const s = now / 1000;
      m.get("uFigN").set(F.from.n, F.to.n);
      m.set("uFigMix", F.mix * F.mix * (3 - 2 * F.mix));
      m.set("uFigTurn", F.turn);
      m.set("uFigTwist", screen ? 0.05 * F.wild : 0.03 + 0.3 * F.wild);
      m.set("uFigPhase", F.phase);
      m.set("uFigWild", F.wild);
      m.get("uFigNote").set(2 + Math.sin(s * 0.11) * 0.7 + u * 1.2, 3.5 + Math.cos(s * 0.083) * 0.8 + v * 1.2);
      m.get("uFigHue").set(F.hue, 0.03 + 0.3 * F.wild);
      m.set("uFigColour", 0.9 * (hold ? 1 : ss(0.05, 0.7, F.wild)));
      m.set("uFigWeb", 1 - 0.45 * F.wild);
    };
  }

  document.addEventListener("ps:ready", () => {
    $$(".stepper__ring .arc--on").forEach((a) => a.setAttribute("pathLength", "1"));
    filled();
    if (reduce) return;
    figure();
    hero();
    list();
    stepper();
  });
})();
