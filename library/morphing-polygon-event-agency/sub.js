// Subpage — header block entrance, principle block arc (About), service card type carry-over, photo slider (swiper), branch filtering
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mob = () => innerWidth <= 950;

  // Header: the blob grows from 0 while changing shape (original svgAnimaSimple) and the corner words rise letter by letter. Starts .25s late
  function head(root) {
    const st = $("[data-pg-head]", root);
    if (!st) return;
    const shape = $(".pg-head__shape", st), path = rpClip(shape, "dot");
    const words = $$(".pg-head__w", st).map((w) => SplitText.create(w, { type: "words,chars", mask: "words", charsClass: "rp-char" }).chars);
    const tl = gsap.timeline({ delay: 0.25 });
    tl.from(st, { scale: 0, duration: 1, ease: "power2.out" });
    tl.add(rpMorph(path, st.dataset.pgHead || "a", { duration: 0.75, ease: "back.inOut(.75)" }), "<+=.05");
    words.forEach((c) => tl.from(c, { y: "100%", duration: 0.3, ease: "power3.out", stagger: 0.04 }, "<+=.1"));
    const lead = $(".pg-head__lead", root);
    if (lead) tl.from(lead, { y: "130%", opacity: 0, duration: 0.75, ease: "power3.out" }, 0);
  }

  // Principle: nine number blobs draw an arc from off-screen left to right (5s straight x, 2.5s up then 2.5s down) and reach 1.33x at the center —
  // On each scroll step the clusters move to the next position (0, .15, .3, .5, .7, .85, 1) in .5s and the sentence changes (scrub 1, pausing at each step)
  function concepts(root) {
    const sec = $("[data-concepts]", root);
    if (!sec) return;
    const svgs = $$(".ab-concept", sec), texts = $$(".ab-concepts__txt p", sec);
    svgs.forEach((el, i) => rpClip(el, ["a", "b", "c", "d", "e"][i % 5]));
    const W = innerWidth <= 950 ? 150 : innerWidth <= 1024 ? 125 : 75, H = innerWidth <= 950 ? 95 : innerWidth <= 1024 ? 100 : 90;
    const steps = [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1];
    svgs.forEach((el) => {
      gsap.set(el, { left: "50%", top: "100%", xPercent: -50, yPercent: -50 });
      el._mv = gsap.timeline({ paused: true });
      el._mv.fromTo(el, { x: `-${W}vw` }, { x: `${W}vw`, duration: 5, ease: "linear" });
      el._mv.to(el, { y: `-${H}vh`, duration: 2.5, ease: "power1.out" }, "<");
      el._mv.to(el, { y: "0vh", duration: 2.5, ease: "power1.in" }, "<+=2.5");
      el._mv.to(el, { scale: 0.9, duration: 0 }, 0);
      el._mv.to(el, { scale: 1.33, duration: 0.33, ease: "power2.out" }, 2.2);
      el._mv.to(el, { scale: 0.9, duration: 0.33, ease: "power2.in" }, 2.8);
    });
    const tl = gsap.timeline({ paused: true });
    let g = 2;
    for (let k = 0; k < svgs.length; k++) {
      g++;
      svgs.forEach((el, i) => { const p = g - i; if (p >= 0 && p <= 6) tl.to(el._mv, { progress: steps[p], duration: 0.5, ease: "power1.inOut" }, "<"); });
      if (texts[g - 4]) tl.to(texts[g - 4], { opacity: 0, duration: 0.125, ease: "linear" }, "<");
      tl.addLabel("step" + g, "<");
      if (texts[g - 3]) tl.to(texts[g - 3], { opacity: 1, duration: 0.125, ease: "linear" }, "<+=.125");
      tl.to({}, { duration: mob() ? 2 : 0.5 });
    }
    if (mob()) { tl.repeat(-1).yoyo(true).timeScale(0.75); ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", animation: tl, toggleActions: "play pause play pause" }); return; }
    ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom bottom", scrub: 1, animation: tl, snap: { snapTo: "labels", duration: 1, delay: 0, ease: "power1.inOut" } });
  }

  // Service cards: the blob from the previous card descends into the next card (from -100vh above) and keeps changing shape — the full shape change is divided by the card count and scrubbed
  function serviceCards(root) {
    const cards = $$(".sv-card", root);
    if (!cards.length) return;
    const forms = ["a", "c", "e", "b", "d", "a"];
    const paths = cards.map((c, i) => rpClip($(".rp-shape", c), forms[i]));
    cards.forEach((el, i) => {
      const tl = gsap.timeline({ paused: true });
      const ln = $('[data-split="lines"]', el), link = $(".sv-card__link", el);
      if (ln?._tl) { ln._used = 1; tl.add(ln._tl.play()); }
      if (link) tl.from(link, { yPercent: 100, opacity: 0, duration: 0.75, ease: "power2.out" }, "<+=.5");
      ScrollTrigger.create({ trigger: el, start: "top 50%", animation: tl, toggleActions: "play none none none" });
      if (mob()) return;
      const sh = $(".rp-shape", el), chars = SplitText.create($(".rp-shape__txt", sh), { type: "words,chars", mask: "words", charsClass: "rp-char" }).chars;
      const tr = gsap.timeline({ paused: true });
      tr.from(sh, { y: "-100vh", duration: 1, ease: "none" });
      if (i > 0) tr.add(gsap.fromTo(paths[i], { morphSVG: { shape: rpShapes[forms[i - 1]], type: "linear", map: "size" } }, { morphSVG: { shape: rpShapes[forms[i]], type: "linear", map: "size" }, duration: 0.5, ease: "none" }), "<");
      else { tr.from(sh, { scale: 0, duration: 0.5, ease: "power2.out", delay: 0.35 }, "<"); tr.from(chars, { y: "105%", duration: 0.25, ease: "power3.out", stagger: 0.075, delay: 0.35 }, "<"); }
      ScrollTrigger.create({ trigger: el, start: "top bottom", end: "+=100%", scrub: 0, animation: tr });
    });
  }

  // Photo slider — original Swiper 8.4.5: endless, 1.35 slides per screen (950 and up 2.5), gap 50 (70). At 65% of the screen, each slide rises from 50% below over .75s
  function sliders(root) {
    $$("[data-slider]", root).forEach((el) => {
      const sw = new Swiper(el, { loop: true, slidesPerView: 1.35, spaceBetween: 50, breakpoints: { 950: { slidesPerView: 2.5, spaceBetween: 70 } } });
      const slides = $$(".swiper-slide", el);
      ScrollTrigger.create({ trigger: el, start: "top 65%", animation: gsap.from(slides, { opacity: 0, yPercent: 50, duration: 0.75, ease: "power3.out", stagger: { amount: 0.75, ease: "power2.inOut" } }), toggleActions: "play none none none" });
      $$(".rp-hex", el).forEach((h) => rpClip(h, "e"));
      return sw;
    });
    $$("[data-rel]", root).forEach((el) => new Swiper(el, { loop: false, slidesPerView: "auto", spaceBetween: 20, breakpoints: { 950: { spaceBetween: 24 }, 1024: { spaceBetween: 28 } } }));
  }

  // Branch button — press to keep only that branch’s cards, the rest float back up from below
  function cats(root) {
    const bar = $("[data-cats]", root);
    if (!bar) return;
    const items = $$("[data-cat]", root);
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      $$("button", bar).forEach((x) => x.classList.toggle("is-on", x === b));
      const shown = items.filter((it) => { const ok = !b.dataset.cat || it.dataset.cat === b.dataset.cat; it.hidden = !ok; return ok; });
      gsap.fromTo(shown, { yPercent: 20, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.75, ease: "power3.out", stagger: 0.08 });
      ScrollTrigger.refresh();
    });
  }

  const run = (root) => { head(root); concepts(root); serviceCards(root); sliders(root); cats(root); };
  window.rpPages = window.rpPages || {};
  window.rpPages["sub.js"] = run;
  rpPage(run);
})();
