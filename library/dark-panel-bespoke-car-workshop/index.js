// First page scene — hero track (About 2 screens + approach .4 screen, snaps to two spots with Lenis Snap 2s) · three pillars · statement · services · and the ordinary are.
// Original constants: INTRO 2 · HERO_TEXT .6 · APPROACH .4 screens, title words .8s at .15 intervals, blur 8 → 0 (.75s late), intro lines .9s at .14 intervals (1s late)
(() => {
  const { words, setGrow, reduce, lenis } = window.fg;
  const intro = document.querySelector(".fg-intro");
  const panel = intro.querySelector(".fg-intro__panel");
  const title = intro.querySelector(".fg-intro__title");
  const growEl = intro.querySelector(".fg-intro__grow");
  const desc = intro.querySelector(".fg-intro__desc");
  const trail = intro.querySelector(".fg-trail");
  const approach = document.querySelector(".fg-approach");
  const canvas = intro.querySelector(".fg-intro__video");
  const INTRO = 2, ENTRY = 0.4, TRACK = INTRO + ENTRY;
  const clamp = (v) => Math.min(1, Math.max(0, v));

  const titleWords = words(title);
  const growWords = words(growEl);
  const lines = [...desc.querySelectorAll(".fg-line")].map((l) => { const s = document.createElement("span"); s.textContent = l.textContent; l.replaceChildren(s); return s; });

  // On first entry — big title words grow from 0 scale and blur 8 at .8s with .15 stagger, and the intro line rises from below
  if (reduce) {
    gsap.set([...titleWords, ...lines], { autoAlpha: 1 });
    setGrow(growWords, 1);
  } else {
    gsap.set(titleWords, { autoAlpha: 0, scale: 0, filter: "blur(8px)" });
    gsap.set(lines, { autoAlpha: 0, yPercent: 100 });
    setGrow(growWords, 0);
  }
  // Placeholder video panel — the original hero video fades up over .3s once the loader clears and playback is ready (measured around 3.3–3.7s after selection)
  if (!reduce) gsap.set(canvas, { opacity: 0 });
  window.fg.onEnter(() => {
    if (reduce) return;
    gsap.to(canvas, { opacity: 1, duration: 0.3, delay: 2.2, ease: "none" });
    // The original constant is .75s late, but measured from the moment of selection (motion-probe) the original’s first word grows at 1.96s — the copy’s gate has no redraw, so .6s matches that moment
    // The original also sets will-change on words the moment they enter
    gsap.set(titleWords, { willChange: "opacity, transform, filter" });
    gsap.to(titleWords, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.8, stagger: 0.15, ease: "power2.out", delay: 0.6, onComplete: () => gsap.set(titleWords, { willChange: "auto" }) });
    // The original constant is 1s late, but measured from the moment of choosing, the second line rises at 2.86s — matched to that
    gsap.to(lines, { autoAlpha: 1, yPercent: 0, duration: 0.9, stagger: 0.14, ease: "power3.out", delay: 1.5 });
  });

  // Placeholder video — the original draws video frames decoded with WebCodecs onto a canvas and steps through them with scroll. Here the same spot draws the frame number and an approaching light.
  const ctx = canvas.getContext("2d");
  let frame = 0;
  const draw = () => {
    const r = panel.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(r.width * dpr)) { canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); }
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--kf-ink").trim() || "white";
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w / 2, h * 0.62, 0, w / 2, h * 0.62, Math.max(w, h) * (0.15 + frame * 0.35));
    ctx.globalAlpha = 0.03 + frame * 0.05;
    glow.addColorStop(0, ink);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = ink;
    ctx.font = `${11 * dpr}px ui-monospace, monospace`;
    ctx.fillText(`Placeholder video · car approaching head-on · frame ${String(Math.round(frame * 120)).padStart(3, "0")}/120`, 24 * dpr, h - 48 * dpr);
    ctx.globalAlpha = 1;
  };

  // Hero track — the panel sticks, and progress splits up the title exit, sentence growth, tail and approach
  let trailOn = false;
  const setTrail = (on) => {
    if (on === trailOn) return;
    trailOn = on;
    on ? trail.setAttribute("data-fx", "stamp-photo-trail") : trail.removeAttribute("data-fx");
  };
  // Video panel cursor tilt — original IntroductionBackground: after the video finishes and the frame is set, on wide screens with a mouse, the cursor (screen ratio −1 to 1)
  // Follows with .7s power3.out, tilting by xPercent·yPercent .6 · rotationY −.5° · rotationX .5° (perspective 1200) and scaling to 1.025x.
  // Intensity fades out via smoothstep until the About range passes .12, and goes to 0 when the menu opens or the mouse leaves the window.
  // The original shifts the video frame an extra .003 using a depth map, but the placeholder video has no depth (the original also has 0 shift without depth), so only the panel tilts
  let introP = 0, heroLean = null;
  if (!reduce && matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches) {
    const f = { x: 0, y: 0, strength: 0 };
    let hand = false, played = false;
    const lean = () => { const e = f.x * f.strength, t = f.y * f.strength; gsap.set(canvas, { xPercent: 0.6 * e, yPercent: 0.6 * t, rotationY: -0.5 * e, rotationX: 0.5 * t, scale: 1 + 0.025 * f.strength }); };
    gsap.set(canvas, { transformPerspective: 1200, transformOrigin: "50% 50%" });
    const qx = gsap.quickTo(f, "x", { duration: 0.7, ease: "power3.out", onUpdate: lean });
    const qy = gsap.quickTo(f, "y", { duration: 0.7, ease: "power3.out", onUpdate: lean });
    const qs = gsap.quickTo(f, "strength", { duration: 0.7, ease: "power3.out", onUpdate: lean });
    heroLean = () => { const k = clamp(introP / 0.12); qs(played && hand && !document.documentElement.classList.contains("fg-menu-open") ? 1 - k * k * (3 - 2 * k) : 0); };
    const clampU = gsap.utils.clamp(-1, 1);
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      qx(clampU(e.clientX / innerWidth * 2 - 1));
      qy(clampU(e.clientY / innerHeight * 2 - 1));
      hand = true;
      heroLean();
    }, { passive: true });
    const away = () => { hand = false; heroLean(); };
    addEventListener("blur", away);
    document.documentElement.addEventListener("pointerleave", away);
    // The original turns it on after the first video ends and the frame is still, and tilts from the first movement after turning on — the copy’s video panel finishes rising (2.2s after entering + .3s)
    window.fg.onEnter(() => gsap.delayedCall(2.5, () => { played = true; hand = false; heroLean(); }));
  }

  const track = (p) => {
    const t = p * TRACK;
    const ip = clamp(t / INTRO);
    introP = ip;
    heroLean?.();
    // The title blurs out to blur 12 during the first 1/4 of About and drops away
    const out = clamp(ip / 0.25);
    gsap.set([title, desc], { autoAlpha: 1 - out, filter: `blur(${12 * out}px)` });
    // The second sentence grows word by word from .25 → .55
    setGrow(growWords, clamp((ip - 0.25) / 0.3));
    frame = ip;
    draw();
    // Original getIntroOutroSegmentProgress (second half) ≥ .95 turns on the photo tail
    const outro = ip <= 0.5 ? 0 : (ip - 0.5) / 0.5;
    setTrail(outro >= 0.95 && t <= INTRO + 0.02 && matchMedia("(min-width: 1024px) and (hover: hover)").matches);
    // Approach: while r goes 1 → 0, it unfolds from the center with clip-path, 1.2x → 1x, rising from where it is attached
    const r = 1 - clamp((t - INTRO) / ENTRY);
    if (r >= 0.9995) gsap.set(approach, { clipPath: "inset(50% 50%)", y: -innerHeight * ENTRY, scale: 1.2 });
    else if (r <= 0.0005) gsap.set(approach, { clearProps: "clipPath,transform" });
    else gsap.set(approach, { clipPath: `inset(${50 * r}% ${50 * r}%)`, y: -r * innerHeight * ENTRY, scale: 1 + 0.2 * r });
  };

  const mm = gsap.matchMedia();
  window.fg.scene(() => {
    if (reduce) { setGrow(growWords, 1); draw(); return; }
    ScrollTrigger.create({ trigger: intro, start: "top top", end: "bottom bottom", onUpdate: (s) => track(s.progress), onRefresh: (s) => track(s.progress) });
    track(0);

    // Lenis Snap — stopping near the two spots, end of intro and end of track, snaps in with 2s (wide screens · mouse only)
    mm.add("(min-width: 1024px) and (pointer: fine)", () => {
      if (!lenis || !window.Snap) return;
      const snap = new Snap(lenis, { type: "proximity", debounce: 500, duration: 2 });
      const top = () => intro.offsetTop;
      const offs = [snap.add(Math.ceil(top() + innerHeight * INTRO)), snap.add(Math.ceil(top() + innerHeight * TRACK))];
      return () => { offs.forEach((f) => f?.()); snap.destroy?.(); };
    });

    // The approaching section photo drifts 0 → 25% while passing the track
    gsap.fromTo(approach.querySelector(".fg-approach__bg .fg-ph"), { yPercent: 0 }, { yPercent: 25, ease: "none", scrollTrigger: { trigger: ".fg-approach-wrap", start: "top bottom", end: "bottom top", scrub: true } });

    mm.add("(min-width: 1024px)", () => {
      // Three pillars — from when the 2nd and 3rd stages touch the bottom of the screen until they touch the top, a square photo unfolds from center and the blurred back panel changes
      const steps = gsap.utils.toArray(".fg-step");
      const frames = gsap.utils.toArray(".fg-pillars__frame .fg-ph");
      const bgs = gsap.utils.toArray(".fg-pillars__bgstick .fg-ph");
      steps.forEach((step, i) => {
        if (!i) return;
        const st = { trigger: step, start: "top bottom", end: "top top", scrub: true };
        frames[i] && gsap.fromTo(frames[i], { clipPath: "inset(50%)" }, { clipPath: "inset(0%)", ease: "none", scrollTrigger: st });
        bgs[i] && gsap.fromTo(bgs[i], { autoAlpha: 0 }, { autoAlpha: 0.4, ease: "none", scrollTrigger: { ...st } });
      });

      // Statement — the portrait photo frame runs 50 → −50% and the inner photo −50 → 50%, flowing in opposite directions
      const sec = document.querySelector(".fg-statement");
      const frame = sec.querySelector(".fg-statement__img");
      const pic = sec.querySelector(".fg-statement__pic");
      gsap.fromTo(frame, { yPercent: 50 }, { yPercent: -50, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo(pic, { yPercent: -50 }, { yPercent: 50, ease: "none", force3D: true, scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true } });

      // Services — from the second on, while the text cell goes from the screen bottom to touching the top, the right photo covers from bottom to top (inset 100% → 0) at 1.2x → 1x
      const svcs = gsap.utils.toArray(".fg-svc");
      const pics = gsap.utils.toArray(".fg-svc-pic");
      svcs.forEach((svc, i) => {
        const pic = pics[i];
        if (!pic) return;
        if (i) gsap.fromTo(pic, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: svc, start: "top bottom", end: "top top", scrub: true } });
        gsap.fromTo(pic.firstElementChild, { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: svc, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    // Service text column blurs out once its center passes 30% of the screen (same on phone)
    gsap.utils.toArray(".fg-svc").forEach((svc) => gsap.to(svc, { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: svc, start: "center 30%", end: "bottom 0%", scrub: true } }));

    // Ordinary — the attached big word shrinks to .75x and fades from when the section top touches the screen top until its center does,
    // Closing title moves from −50 above the screen at .75x scale into place, and the side fills follow later, rising at −55% and −50% (scrub .2)
    const ord = document.querySelector(".fg-ordinary");
    gsap.to(ord.querySelector(".fg-ordinary__wordbox"), { scale: 0.75, autoAlpha: 0, ease: "none", scrollTrigger: { trigger: ord, start: "top top", end: "center top", scrub: true } });
    gsap.from(ord.querySelector(".fg-ordinary__endbox"), { y: () => -innerHeight * 0.5, scale: 0.75, ease: "none", scrollTrigger: { trigger: ord.querySelector(".fg-ordinary__end"), start: "top-=50% 100%", end: "center 60%", scrub: true, invalidateOnRefresh: true } });
    const [left, , right] = ord.querySelectorAll(".fg-car");
    const cars = ord.querySelector(".fg-ordinary__cars");
    gsap.to(left, { yPercent: -55, ease: "none", scrollTrigger: { trigger: cars, start: "top bottom", end: "center top", scrub: 0.2 } });
    gsap.to(right, { yPercent: -50, ease: "none", scrollTrigger: { trigger: cars, start: "top bottom", end: "bottom top", scrub: 0.2 } });
  });
  addEventListener("resize", draw);
})();
