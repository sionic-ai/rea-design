// Home motion: photo sphere enters behind the loader · over 2000px of scroll (1400 on phones) the sphere moves aside to the back right while turning half a revolution · in the black section the sphere hides in .25s,
// Glass orbs float in at .3s (inner video swaps per paragraph) · number cards appear · flow lines are drawn bound to scroll · report background 1.2→1.
window.rgPages = window.rgPages || {};
window.rgPages.home = (root) => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const offs = [];
  const isPc = () => innerWidth >= 1024;
  const sideW = () => (innerWidth >= 1280 ? 292 : innerWidth >= 1024 ? 232 : 0);

  // ── Photo Sphere ──
  // The photo sphere canvas sits behind the screen, outside the content (#content) — it is rebuilt when arriving from another page
  let canvas = document.querySelector("[data-mv-canvas]");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "mv-canvas";
    canvas.setAttribute("data-mv-canvas", "");
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
  }
  const sphere = window.rgSphere(canvas, { camZ: 7, offsetX: () => sideW() / 2 });
  const endPose = () => {
    if (innerWidth < 768) return { x: 2.5, z: -1 };
    const depth = 7 + 5;
    const pxPerUnit = innerHeight / 2 / (depth * Math.tan((22.5 * Math.PI) / 180));
    const centerPx = (innerWidth + sideW()) / 2;
    return { x: (innerWidth * 0.965 - centerPx) / pxPerUnit, z: -5 };
  };
  let pose = endPose();
  const onResize = () => (pose = endPose());
  addEventListener("resize", onResize);
  offs.push(() => removeEventListener("resize", onResize));
  const ease = gsap.parseEase("power1.out");
  const follow = { p: 0 };
  const applyPose = () => {
    const e = ease(follow.p);
    sphere.state.x = pose.x * e;
    sphere.state.z = pose.z * e;
  };

  // ── Hero text splitting ──
  const big = document.querySelector("[data-mv-title]");
  big.innerHTML = big.textContent.split(" ").map((w) => `<span class="w">${[...w].map((c) => `<span class="chw"><span class="ch">${c}</span></span>`).join("")}</span>`).join(" ");
  const head = document.getElementById("site-header");

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Original homeMvIntro — letters enter from 130px left (phone 100px) · transparent over 3.2s (phone 2.8s) with expo.out, and the delay of letter i is Σ .001×(k−1)²×.6 (phone 1.4)
    // so later letters start later and run shorter. It starts .9s later if the loader ran, otherwise .7s. Subtitle and one-line promise 1.3s power2.in (.5s later after the loader),
    // Header panel only when the loader ran: .6 opacity, from the left by its own right edge + 24px, 2s power4.out (+.3s)
    const sp = innerWidth < 768;
    const T = sp ? { from: 100, dur: 2.8, scale: 1.4 } : { from: 130, dur: 3.2, scale: 0.6 };
    const withLoader = !!window.rgLoaderShown && window.rgMounts === 1;
    const p0 = withLoader ? 0.9 : 0.7;
    const chars = big.querySelectorAll(".ch");
    const lagOf = (i) => { let d = 0; for (let k = 1; k <= i; k++) d += 0.001 * Math.pow(k - 1, 2) * T.scale; return d; };
    gsap.set(chars, { autoAlpha: 0, x: -T.from });
    gsap.set(["[data-mv-sub]", "[data-mv-tag]"], { autoAlpha: 0 });
    if (withLoader) gsap.set(head, isPc() ? { opacity: 0.6, x: -(head.getBoundingClientRect().right + 24) } : { opacity: 0 });

    window.rgOnLoaded(() => {
      sphere.enter(false);
      const tl = gsap.timeline({ delay: p0, defaults: { ease: "expo.out" } });
      chars.forEach((c, i) => { const d = lagOf(i); tl.to(c, { autoAlpha: 1, x: 0, duration: Math.max(0.01, T.dur - d) }, d); });
      gsap.to(["[data-mv-sub]", "[data-mv-tag]"], { autoAlpha: 1, duration: 1.3, ease: "power2.in", delay: p0 + (withLoader ? 0.5 : 0) });
      if (withLoader) gsap.to(head, isPc() ? { opacity: 1, x: 0, duration: 2, ease: "power4.out", delay: p0 + 0.3, clearProps: "opacity,transform" } : { opacity: 1, duration: 2, ease: "power2.in", delay: p0 + 0.3, clearProps: "opacity" });
    });

    // Follows scroll position with power4.out, sliding right and back, then rotating half a turn on Y
    ScrollTrigger.create({
      start: 0,
      end: () => (innerWidth < 768 ? 1400 : 2000),
      onUpdate: (st) => {
        gsap.to(follow, { p: st.progress, duration: 0.6, ease: "power4.out", overwrite: true, onUpdate: applyPose });
        sphere.state.ry = Math.PI * st.progress * (innerWidth < 768 ? 0.85 : 1);
        sphere.kick(st.getVelocity() / 3000);
      },
    });
    // When the black section arrives the sphere hides in .25s, and returns in .3s on the way back
    ScrollTrigger.create({
      trigger: ".dark-zone",
      start: "top 65%",
      end: "max",
      onEnter: () => gsap.to(sphere.state, { opacity: 0, duration: 0.25, ease: "power2.out", overwrite: "auto" }),
      onLeaveBack: () => gsap.to(sphere.state, { opacity: 1, duration: 0.3, ease: "power2.out", overwrite: "auto" }),
    });

    // ── Glass Orb ──
    const orb = document.querySelector("[data-orb]");
    const scenes = orb.querySelectorAll("video.orb__scene");
    const texts = gsap.utils.toArray("[data-why-text]");
    let active = -1;
    const activate = (i) => {
      if (i === active) return;
      active = i;
      // Original: the lit video plays from the start, the rest pause (opacity 300ms is in css)
      scenes.forEach((s, k) => {
        s.classList.toggle("is-on", k === i);
        if (k === i) { s.currentTime = 0; s.play().catch(() => {}); } else s.pause();
      });
      texts.forEach((t, k) => t.classList.toggle("is-active", k === i));
    };
    const show = (on) => {
      if (!on) activate(-1);
      gsap.to(orb, on ? { scale: 1, opacity: 1, duration: 0.3, ease: "power1.out", overwrite: "auto" } : { scale: 0.8, opacity: 0, duration: 0.3, ease: "power1.out", overwrite: "auto" });
    };
    ScrollTrigger.create({
      trigger: ".why__body",
      start: "top 20%",
      end: "bottom 80%",
      onEnter: () => show(true),
      onEnterBack: () => show(true),
      onLeave: () => show(false),
      onLeaveBack: () => show(false),
    });
    texts.forEach((t, i) => {
      ScrollTrigger.create({ trigger: t, start: "top center", end: "bottom center", onEnter: () => activate(i), onEnterBack: () => activate(i) });
    });

    // ── Flow — original homeFlowReveal: .38s gap per cell, number y12→0 .4s · content x-16→0 .5s (+.1) · line scaleY 0→1 .55s power2.inOut (+.3),
    // The last cell draws a curved line (corner 31.5, dash twice the length) in .65s and the dot pops in over .35s back.out(2) (+.85). Tied to section top 90% → bottom 65% ──
    const items = gsap.utils.toArray("[data-flow-item]");
    const curve = document.querySelector("[data-flow-curve]");
    const path = curve.querySelector("path");
    const drawCurve = () => {
      const { width: n, height: r } = curve.getBoundingClientRect();
      if (!n || !r) return 0;
      const s = Math.min(31.5, n, r), a = 0.5, o = Math.max(n, s + a), c = Math.max(r - 0.5, s + a), u = Math.max(c - s, 0), f = Math.min(s + a, o);
      curve.setAttribute("viewBox", `0 0 ${n} ${r}`);
      path.setAttribute("d", `M${a} 0V${u}C${a} ${u + s * 0.5523} ${f - s * 0.5523} ${c} ${f} ${c}H${o}`);
      return path.getTotalLength() * 2;
    };
    let len = drawCurve();
    const tl = gsap.timeline({ paused: true });
    items.forEach((it, i) => {
      const p = i * 0.38, last = i === items.length - 1;
      const num = it.querySelector("[data-flow-num]"), line = it.querySelector("[data-flow-line]"), bodyEl = it.querySelector("[data-flow-body]");
      gsap.set(num, { opacity: 0, y: 12 });
      gsap.set(bodyEl, { opacity: 0, x: -16 });
      tl.to(num, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, p).to(bodyEl, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, p + 0.1);
      if (line && !last) { gsap.set(line, { scaleY: 0, transformOrigin: "top center" }); tl.to(line, { scaleY: 1, duration: 0.55, ease: "power2.inOut" }, p + 0.3); }
      if (last) {
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.set("[data-flow-dot]", { scale: 0 });
        tl.to(path, { strokeDashoffset: 0, duration: 0.65, ease: "power2.inOut" }, p + 0.3).to("[data-flow-dot]", { scale: 1, duration: 0.35, ease: "back.out(2)" }, p + 0.85);
      }
    });
    ScrollTrigger.create({ trigger: "[data-flow]", start: "top 90%", end: "bottom 65%", scrub: true, animation: tl });
    // When the cell size changes, redraw the curved line and fit the dash to the current progress
    const ro = new ResizeObserver(() => { len = drawCurve(); gsap.set(path, { strokeDasharray: len, strokeDashoffset: len * (1 - Math.min(1, Math.max(0, (tl.time() - (items.length - 1) * 0.38 - 0.3) / 0.65))) }); }); ro.observe(curve);
    offs.push(() => ro.disconnect());

    // ── Report ──
    gsap.fromTo("[data-insight-bg]", { scale: 1.2 }, { scale: 1, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".insight__box", start: "top 88%", once: true } });
    gsap.fromTo("[data-insight-card]", { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: "[data-insight-card]", start: "top 88%", once: true } });
  });

  mm.add("(prefers-reduced-motion: reduce)", () => {
    sphere.enter(true);
    document.querySelector("[data-orb] .orb__scene").classList.add("is-on");
    document.querySelectorAll("[data-why-text]").forEach((t) => t.classList.add("is-active"));
  });

  // On phone, instead of a fixed marble each paragraph puts its own scene’s marble above it (the original also stacks video above paragraphs on phone)
  const orbSrc = document.querySelector("[data-orb]");
  document.querySelectorAll("[data-why-text]").forEach((t, i) => {
    const c = orbSrc.cloneNode(true);
    c.removeAttribute("data-orb");
    // On phone, as in the original, each paragraph autoplays and loops its own video
    c.querySelectorAll(".orb__scene").forEach((s, k) => { if (k !== i) return s.remove(); s.classList.add("is-on"); s.autoplay = true; s.play?.().catch(() => {}); });
    c.classList.add("is-sp");
    t.prepend(c);
  });

  // ── News rows — original home-news reveal ──
  const notice = root.querySelector(".notice__in");
  if (notice && !reduce) {
    notice.classList.add("is-wait");
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; notice.classList.add("is-in"); notice.classList.remove("is-wait"); io.disconnect(); }), { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
    io.observe(notice.parentElement);
    offs.push(() => io.disconnect());
  }

  // ── Number cards — original confidenceMetricsReveal: once at 88% of the screen, each card floats up from 24px below in .5s, .16s later than the previous,
  // .35s after that the number line rises from below (the original plays a still-screen Lottie here) and .1s later the description turns on in .4s (power2.out)
  const cards = gsap.utils.toArray("[data-stat]");
  if (cards.length && !reduce) {
    const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
    cards.forEach((li, i) => {
      const o = i * 0.16, num = li.querySelector("[data-stat-num]"), label = li.querySelector("[data-stat-label]");
      gsap.set(li, { opacity: 0, y: 24 });
      gsap.set(num, { yPercent: 100 });
      if (label) gsap.set(label, { opacity: 0 });
      tl.to(li, { opacity: 1, y: 0, duration: 0.5, clearProps: "opacity,transform" }, o)
        .to(num, { yPercent: 0, duration: 0.5, clearProps: "transform" }, o + 0.5 - 0.15);
      if (label) tl.to(label, { opacity: 1, duration: 0.4, clearProps: "opacity" }, o + 0.5 - 0.15 + 0.1);
    });
    ScrollTrigger.create({ trigger: ".stats__grid", start: "top 88%", once: true, onEnter: () => tl.play(0) });
  }
  return () => {
    mm.revert();
    offs.forEach((fn) => fn());
    sphere.dispose();
    canvas.remove();
  };
};
