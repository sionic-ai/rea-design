// History: per-section background color (.8s) · current section at bottom right, oval frame opens to the screen edge on scroll, section-opening panel — title y 20 2s power2.inOut · photo 1.02 → 1 ·
// Word x ±10 blur 1px 2s (.1s apart), photo entrance y 10 · .98× 2s power1.out, fact switch (exit .5s · entrance .75s power2.out),
// Polaroid bounce (rotation ±1~4° → opposite, xPercent 10 → −10, .5s power4.out), torn edges, mosaic pieces lighting up (scrub)
(() => {
  const body = document.body;
  const reduced = window.DC.reduced;

  // Torn paper edge: top and bottom edges jagged by 2~7px — set by index so it looks the same every time it opens
  const torn = (el, seed) => {
    const pts = [], n = 60, r = (i) => { const v = Math.sin((i + seed) * 91.7) * 43758.5; return v - Math.floor(v); };
    for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${(r(i) * 7).toFixed(1)}px`);
    for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% calc(100% - ${(r(i + 99) * 7).toFixed(1)}px)`);
    el.style.clipPath = `polygon(${pts.join(",")})`;
  };
  document.querySelectorAll(".ab-paper__sheet, .ab-torn .wf-img").forEach((el, i) => torn(el, i * 13 + 1));

  // Per-section background color and current-section indicator
  const chapLabel = document.querySelector(".ab-chap__n");
  const sections = [...document.querySelectorAll("main [data-bg]")];
  const setChapter = (sec) => {
    body.dataset.bg = sec.dataset.bg;
    const c = sec.dataset.chapter;
    chapLabel.innerHTML = c && c !== "0" ? `${c}Section<br>/0000 — 0000` : "";
  };
  sections.forEach((sec) => ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (s) => s.isActive && setChapter(sec) }));
  setChapter(sections[0]);

  // Contents
  const toc = document.querySelector(".ab-toc");
  const tocBtn = toc.querySelector(".ab-toc__btn");
  tocBtn.addEventListener("click", () => { const on = toc.classList.toggle("is-open"); tocBtn.setAttribute("aria-expanded", String(on)); });
  toc.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toc.classList.remove("is-open")));

  // Year ticks
  const marks = [...document.querySelectorAll(".ab-ruler li")];
  document.querySelectorAll(".ab-entry").forEach((en) => ScrollTrigger.create({
    trigger: en, start: "top 55%", end: "bottom 55%",
    onToggle: (s) => s.isActive && marks.forEach((m) => m.classList.toggle("is-on", m.dataset.y === en.dataset.y)),
  }));
  marks[0]?.classList.add("is-on");

  // Facts flip
  const fImgs = [...document.querySelectorAll(".ab-fact__img")];
  const fTxts = [...document.querySelectorAll(".ab-fact__txt")];
  const fN = document.querySelector(".ab-fact__n");
  let fAt = 0;
  document.querySelector(".ab-fact__tab").addEventListener("click", () => {
    const prev = fAt;
    fAt = (fAt + 1) % fImgs.length;
    fN.textContent = fAt + 1;
    [fImgs, fTxts].forEach((g) => g.forEach((el, i) => el.classList.toggle("is-on", i === fAt)));
    if (reduced) return;
    const H = (Math.random() * 6 + 2) * (prev % 2 ? 1 : -1), V = -H * 1.5;
    gsap.timeline()
      .fromTo(fImgs[prev], { zIndex: 1, autoAlpha: 1 }, { autoAlpha: 0, scale: .8, yPercent: -25, rotation: H, duration: .5, ease: "power2.out" })
      .fromTo(fImgs[fAt], { scale: .8, autoAlpha: 0, rotation: V, yPercent: 75, zIndex: 2 }, { autoAlpha: 1, scale: 1, yPercent: 0, rotation: 0, duration: .75, ease: "power2.out" }, 0)
      .fromTo(fTxts[prev], { autoAlpha: 1 }, { autoAlpha: 0, y: -20, duration: .5, ease: "power2.out" }, 0)
      .fromTo(fTxts[fAt], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .75, ease: "power2.out" }, .1);
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Hero words: alternate x ±10 and blur 1px over 2s, .1s stagger
    window.DC.ready.then(() => {
      gsap.fromTo(".ab-hero__t span, .ab-hero__note, .ab-hero__yr", { x: (i) => (i % 2 ? 10 : -10), opacity: 0, filter: "blur(1px)" }, { x: 0, opacity: 1, filter: "blur(0px)", duration: 2, stagger: .1, ease: "power2.inOut", clearProps: "filter" });
      gsap.fromTo(".ab-hero__bg", { scale: 1.02 }, { scale: 1, duration: 2, ease: "power2.out" });
      gsap.fromTo(".ab-hero__ph", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 2, ease: "power2.inOut" });
    });

    // Ellipse open
    const oval = document.querySelector(".ab-oval");
    gsap.timeline({ scrollTrigger: { trigger: oval, start: "top top", end: "bottom bottom", scrub: true } })
      .fromTo(".ab-oval__clip", { clipPath: "ellipse(14% 30% at 50% 50%)" }, { clipPath: "ellipse(75% 80% at 50% 50%)", ease: "power2.inOut", duration: .7 })
      .to(".ab-oval__cap", { opacity: 1, duration: .2 }, .75);

    // Section opener panel
    document.querySelectorAll(".ab-open").forEach((op) => {
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, scrollTrigger: { trigger: op, start: "top 75%", once: true } });
      tl.fromTo(op.querySelector(".ab-open__t"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 2 }, 0);
      op.querySelectorAll(".ab-years > span").forEach((s, i) => tl.fromTo(s, { x: 10 * (i % 2 ? 1 : -1), opacity: 0, filter: "blur(1px)" }, { x: 0, opacity: 1, filter: "blur(0px)", duration: 2, clearProps: "filter" }, i * .1));
    });

    // Photo enters
    document.querySelectorAll(".ab-enter, .ab-entry__ph, .ab-fact__imgs").forEach((im) => gsap.fromTo(im, { y: 10, scale: .98, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 2, ease: "power1.out", scrollTrigger: { trigger: im, start: "top bottom" } }));

    // Polaroid bounce
    document.querySelectorAll(".ab-pol").forEach((p, i) => {
      const et = (Math.random() * 3 + 1) * (i % 2 ? -1 : 1);
      gsap.fromTo(p, { rotation: et, xPercent: 10 }, { rotation: -et, xPercent: -10, duration: .5, ease: "power4.out", scrollTrigger: { trigger: p, start: "top 85%", toggleActions: "play none none reverse" } });
    });

    // Mosaic: pieces light up in random order, then the face photo fills in behind them
    const tiles = gsap.utils.shuffle([...document.querySelectorAll(".ab-mosaic__grid i")]);
    gsap.timeline({ scrollTrigger: { trigger: ".ab-mosaic", start: "top 70%", end: "bottom 60%", scrub: true } })
      .to(tiles, { opacity: () => .35 + Math.random() * .5, stagger: { each: .02 }, duration: .2, ease: "none" }, 0)
      .to(".ab-mosaic__face", { opacity: .9, duration: 1, ease: "none" }, .8)
      .to(tiles, { opacity: 0, stagger: { each: .01 }, duration: .2, ease: "none" }, 1.2);
  });
})();
