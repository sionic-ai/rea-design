// Home — shape-shifting hero blob (repeats) · big paragraph text darkens (scrub) · video panel opens and widens · pinned service shape change (snap) · work cards · news blob cards · client band
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mob = () => innerWidth <= 950;
  const css = (k) => getComputedStyle(document.documentElement).getPropertyValue(k).trim();

  function hero(root) {
    const stage = $("[data-hero]", root);
    if (!stage) return;
    const shape = $("[data-hero-shape]", stage), path = rpClip(shape, "dot");
    const imgs = $$(".hm-hero__img", shape), words = $$(".hm-wc", stage), [t0, t1, t2] = $$(".hm-w", stage);
    const sec = stage.closest("section");
    const tone = (el) => { const cs = getComputedStyle(el); gsap.to([sec, document.documentElement], { "--bgc": cs.getPropertyValue("--bgc"), "--fgc": cs.getPropertyValue("--fgc"), "--hfg": cs.getPropertyValue("--fgc"), "--hbg": cs.getPropertyValue("--bgc"), duration: 0.75 }); };
    const dur = 1, left0 = innerWidth <= 468 ? "95%" : "97%";
    gsap.set(words, { yPercent: 105 });
    gsap.set(imgs, { opacity: 0 });
    // Original position table (top·left·x / bottom·left·x / bottom·right·x) — per type, three corner words change seats
    const POS = [["4%", "4%", "0%", "3%", "20%", "0%", "3%", "3%", "0%"], ["4%", left0, "-100%", "42%", "5%", "3%", "3%", "48%", "0%"], ["4%", "4%", "0%", "30%", "4%", "0%", "3%", "3%", "0%"], ["4%", "4%", "0%", "58%", left0, "-100%", "3%", "25%", "0%"], ["4%", "4%", "0%", "3%", "20%", "0%", "3%", "3%", "0%"]];
    const FORMS = ["b", "c", "d", "e", "b"];
    const loop = gsap.timeline({ repeat: -1, paused: true });
    loop.call(() => tone(imgs[0]), null, dur / 2);
    const step = (a, b, form, pos) => {
      loop.add(rpMorph(path, form, { duration: dur, ease: "power4.inOut", onStart: () => tone(imgs[b]) }), "+=.1");
      loop.to(words[a], { duration: dur / 2, yPercent: -105, ease: "power3.in" }, "<");
      loop.fromTo(words[b], { yPercent: 105 }, { duration: dur / 2, yPercent: 0, delay: dur / 2, ease: "power3.out" }, "<");
      loop.to(t0, { duration: dur, top: pos[0], left: pos[1], x: pos[2], ease: "power3.inOut" }, `<-=${dur / 2}`);
      loop.to(t1, { duration: dur, bottom: pos[3], left: pos[4], x: pos[5], ease: "power3.inOut" }, "<");
      loop.to(t2, { duration: dur, bottom: pos[6], right: pos[7], x: pos[8], ease: "power3.inOut" }, "<");
      if (b !== 0) { loop.fromTo(imgs[b], { opacity: 0 }, { duration: dur, opacity: 1, ease: "power3.inOut", onComplete: () => gsap.set(imgs[a], { opacity: 0 }) }, "<"); loop.to({}, { duration: dur / 2 }); }
      else loop.fromTo(imgs[a], { opacity: 1 }, { duration: dur, opacity: 0, ease: "power3.inOut", onStart: () => gsap.set(imgs[b], { opacity: 1 }) }, "<");
    };
    for (let i = 0; i < words.length - 1; i++) step(i, i + 1, FORMS[i % 4], POS[i % 5]);
    step(words.length - 1, 0, "a", ["3%", left0, "-100%", "40%", "3%", "0%", "3%", "14%", "0%"]);
    // At first: the blob grows from .01x in 1s power2.out, goes from a dot shape to the first shape in .75s back.inOut(.75), then repeats
    const intro = gsap.timeline({ paused: true, delay: 0.25 });
    intro.set(imgs[0], { opacity: 1 }).set(words[0], { yPercent: 0 });
    intro.from(stage, { scale: 0.01, duration: 1, ease: "power2.out" });
    intro.add(rpMorph(path, "a", { duration: 0.75, ease: "back.inOut(.75)" }), "<+=.05");
    intro.from([t0, t1], { y: "100%", opacity: 0, duration: 0.3, ease: "power3.out", stagger: 0.04 });
    intro.add(() => loop.play());
    ScrollTrigger.create({ trigger: sec, start: "top 95%", end: "bottom 40%", animation: intro, toggleActions: "play pause play pause", onLeave: () => loop.pause(), onEnterBack: () => intro.progress() === 1 && loop.play() });
  }

  // Large paragraph — each letter goes from .5 to 1 while the section passes 70% of the screen (scrub .5)
  function bigText(root) {
    const p = $("[data-big-chars]", root);
    if (!p) return;
    const s = SplitText.create(p, { type: "words,chars", charsClass: "rp-char" });
    const tl = gsap.timeline({ paused: true }).from(s.chars, { opacity: 0.5, duration: 0.2, ease: "linear", stagger: 0.025 });
    ScrollTrigger.create({ trigger: p, start: "top 70%", end: "bottom 70%", scrub: 0.5, animation: tl });
  }

  // Video panel — the polygon opens from top right downward (.15 · .25 · .25 · .25), width grows to 100% with scroll, and the panel stays attached and exits upward
  function video(root) {
    const sec = $(".hm-video", root);
    if (!sec) return;
    const wrap = $("[data-video-wrap]", sec), clip = $("[data-video-clip]", sec), label = $(".hm-video__label", sec);
    const open = gsap.timeline({ paused: true });
    open.fromTo(clip, { "--clipPath": "65% 0, 100% 0, 100% 0, 0 0" }, { "--clipPath": "69% 38%, 100% 0, 100% 0, 0 0", duration: 0.15, ease: "power3.inOut" }, 0.1);
    open.to(clip, { "--clipPath": "73% 33%, 100% 100%, 100% 0, 0 0", duration: 0.25, ease: "power3.inOut" });
    open.to(clip, { "--clipPath": "24% 74%, 100% 100%, 100% 0, 0 0", duration: 0.25, ease: "power3.in" });
    open.to(clip, { "--clipPath": "0 100%, 100% 100%, 100% 0, 0 0", duration: 0.25, ease: "power3.out" });
    open.fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    ScrollTrigger.create({ trigger: sec, start: "top 90%", animation: open, toggleActions: "play none none none" });
    if (!mob()) ScrollTrigger.create({ trigger: sec, start: "top 80%", end: "bottom bottom", scrub: 0, animation: gsap.to(wrap, { width: "100%", duration: 1, ease: "power2.inOut" }) });
  }

  // Services — while the section is pinned the panel slides -100vw over 1.5s, the blob changes shape and color, and words shuffle letter by letter. Snap stop for each shape
  function services(root) {
    const sec = $(".hm-svc", root);
    if (!sec) return;
    const shape = $("[data-svc-shape]", sec), track = $("[data-svc-track]", sec), pin = $("[data-svc-pin]", sec);
    const path = rpClip(shape, "a");
    const texts = $$(".hm-svc__w", shape);
    const COL = { accent: "--kf-accent", yellow: "--site-yellow", ink: "--kf-ink", green: "--kf-accent-text", pink: "--kf-accent-soft" };
    const colors = texts.map((t) => css(COL[t.dataset.color]));
    const chars = texts.map((t) => SplitText.create(t, { type: "words,chars", mask: "words", charsClass: "rp-char" }).chars);
    chars.slice(1).forEach((c) => gsap.set(c, { y: "105%" }));
    const forms = ["a", "c", "e", "b", "d"];
    const tl = gsap.timeline({ paused: true });
    tl.addLabel("form-init");
    if (!mob()) tl.to(track, { x: "-100vw", duration: 1.5, ease: "power3.inOut" }, "+=1");
    tl.addLabel("form-form1");
    tl.to(shape, { "--shape": colors[0], duration: 0.75, ease: "power3.inOut" }, "<");
    tl.to({}, { duration: 0.5 });
    texts.forEach((_, i) => {
      const n = i + 1;
      if (n >= texts.length) return;
      tl.addLabel("form" + i);
      tl.add(rpMorph(path, forms[n], { duration: 1, ease: "power3.inOut" }));
      tl.to(shape, { "--shape": colors[n], duration: 1, ease: "power3.inOut" }, "<");
      tl.to(chars[i], { y: "-105%", duration: 0.25, ease: "power3.in", stagger: 0.025 }, "<");
      tl.fromTo(chars[n], { y: "105%" }, { y: "0%", duration: 0.25, ease: "power3.in", stagger: 0.025 }, "-=.75");
      tl.to({}, { duration: 0.5 });
    });
    if (mob()) { tl.repeat(-1).yoyo(true); ScrollTrigger.create({ trigger: sec, start: "top 50%", onEnter: () => tl.play() }); return; }
    ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom bottom", pin, pinSpacing: false, scrub: 0, animation: tl, snap: { snapTo: "labels", duration: 0.75, delay: 0, ease: "power1.inOut" } });
  }

  // Client strip — logos rise from below 100% in .75s (split at .95), then the strip repeats -100% over 7×(width/screen) seconds, and on leaving the section the whole strip slides out to the lower left (scrub 1)
  function brands(root) {
    const car = $("[data-carousel]", root);
    if (!car) return;
    const row = $("[data-car-row]", car);
    row.after(row.cloneNode(true));
    const rows = $$("[data-car-row]", car), logos = $$(".hm-logo", car);
    const tl = gsap.timeline({ paused: true });
    tl.from(logos, { y: "100%", opacity: 0, duration: 0.75, ease: "power3.out", stagger: { amount: 0.95, ease: "power1.out" } });
    tl.to(rows, { x: "-100%", duration: 7 * (row.offsetWidth / innerWidth), ease: "none", repeat: -1 }, "<+=.15");
    ScrollTrigger.create({ trigger: row, start: "top 99%", animation: tl, toggleActions: "play pause play pause" });
    const out = gsap.timeline({ paused: true }).fromTo(car, { x: "0%" }, { x: "-25vw", duration: 1.5 }).fromTo(car, { y: "0%" }, { y: "155%", duration: 1 }, "<");
    ScrollTrigger.create({ trigger: car, start: "bottom 50%", end: "+=100%", scrub: 1, animation: out });
  }

  const run = (root) => { hero(root); bigText(root); video(root); services(root); brands(root); };
  window.rpPages = window.rpPages || {};
  window.rpPages["index.js"] = run;
  rpPage(run);
})();
