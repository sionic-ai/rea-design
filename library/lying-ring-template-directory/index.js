// Home only — cost tool (letter roll scrub · platform name alternation · calculator tilt), magnetic button, question head (giant text flowing along a line · wave on wheel)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);

  const calc = document.querySelector(".bw-calc");
  if (calc) {
    // Letter roll — while the section’s top edge passes from 80% → 30% of the screen, letters roll down one cell in random order (.04) and the same letter above settles into place
    const letters = calc.querySelectorAll("[data-roll]");
    gsap.set(letters, { yPercent: 0, force3D: true });
    gsap.to(letters, { yPercent: 100, ease: "power1.inOut", stagger: { each: 0.04, from: "random" }, scrollTrigger: { trigger: calc, start: "top 80%", end: "top 30%", scrub: 1, invalidateOnRefresh: true } });

    // Platform name rotation — stays 1.2s and switches in .8s: icons cross-switch, name letters drop down in random order while new letters come down from above and the cell width adjusts
    const icons = [...calc.querySelectorAll("[data-pi] > *")], words = [...calc.querySelectorAll("[data-pw]")], slot = calc.querySelector("[data-ps]");
    const lettersOf = words.map((w) => [...w.children]);
    const widthOf = (i) => Math.ceil(words[i].getBoundingClientRect().width) + 2;
    let cur = 0, wait = null, run = null;
    const rest = (i) => {
      icons.forEach((ic, k) => gsap.set(ic, { autoAlpha: +(k === i), zIndex: k === i ? 2 : 1 }));
      words.forEach((w, k) => { gsap.set(w, { autoAlpha: +(k === i), zIndex: k === i ? 2 : 1 }); gsap.set(lettersOf[k], { yPercent: k === i ? 0 : -200 }); });
      gsap.set(slot, { width: widthOf(i) });
    };
    const next = () => { wait = gsap.delayedCall(1.2, () => swapTo((cur + 1) % words.length)); };
    const swapTo = (to) => {
      const from = cur, fade = 0.8, lag = Math.min(0.35 * fade, 0.28);
      run = gsap.timeline({ onComplete: () => { cur = to; rest(to); next(); } })
        .set(icons[to], { zIndex: 2 }, 0).set(icons[from], { zIndex: 1 }, 0)
        .to(icons[to], { autoAlpha: 1, duration: fade, ease: "power2.inOut" }, 0)
        .to(icons[from], { autoAlpha: 0, duration: fade, ease: "power2.inOut" }, lag)
        .set(lettersOf[from], { yPercent: 0 }, 0).set(lettersOf[to], { yPercent: -200 }, 0)
        .set(words[to], { autoAlpha: 1, zIndex: 1 }, 0).set(words[from], { autoAlpha: 1, zIndex: 2 }, 0)
        .to(slot, { width: widthOf(to), duration: fade, ease: "power3.inOut" }, 0)
        .to(lettersOf[from], { yPercent: 200, duration: fade, ease: "power1.inOut", stagger: { each: 0.04, from: "random" } }, 0)
        .to(lettersOf[to], { yPercent: 0, duration: fade, ease: "power1.inOut", stagger: { each: 0.04, from: "random" } }, 0);
    };
    if (words.length > 1) {
      (document.fonts?.ready || Promise.resolve()).then(() => { rest(0); next(); });
      ScrollTrigger.create({ trigger: calc, start: "top bottom", end: "bottom top", onToggle: (s) => { if (s.isActive) { wait?.resume(); run?.resume(); } else { wait?.pause(); run?.pause(); } } });
    }

    // Calculator tilt — Y ±22° · X ±16° toward the cursor position in the section (.6s power2), and Z rotation .08× the fast horizontal movement (1s power2, back to 0 after 66ms of stillness)
    const media = calc.querySelector("[data-tilt]");
    if (media && matchMedia("(min-width: 1024px) and (pointer: fine)").matches) {
      const rx = gsap.quickTo(media, "rotationX", { duration: 0.6, ease: "power2" }), ry = gsap.quickTo(media, "rotationY", { duration: 0.6, ease: "power2" }), rz = gsap.quickTo(media, "rotation", { duration: 1, ease: "power2" });
      let last = 0, calm = 0;
      calc.addEventListener("mousemove", (e) => {
        const x = gsap.utils.clamp(0, innerWidth, e.clientX), y = gsap.utils.clamp(0, innerHeight, e.clientY);
        ry((x / innerWidth * 2 - 1) * 22); rx(-(y / innerHeight * 2 - 1) * 16); rz((x - last) * 0.08);
        last = x; clearTimeout(calm); calm = setTimeout(() => rz(0), 66);
      });
    }
  }

  // Magnet button — while the cursor is inside the hit circle at the button center (200px diameter for Hero·compare, 96px for team, 80px for view all), by the amount the cursor strays from the center
  // The button pulls .4×, and the text on it pulls .24× more (.4s power2.out). Outside the circle it returns to place with .7s elastic.out(1, .4).
  // The judging circle doesn’t move: it is measured from the fixed center, not from where the dragged button is
  if (matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)").matches) {
    const magnets = [...document.querySelectorAll(".bw-btn--hero, .bw-seeall")].map((btn) => {
      const solid = btn.classList.contains("bw-btn");
      return { btn, label: solid ? [btn.querySelector(".bw-swap")] : [...btn.children], r: (solid ? 200 : btn.closest(".bw-team__cta") ? 96 : 80) / 2, on: false };
    });
    const pull = (m, dx, dy) => {
      gsap.to(m.btn, { x: dx * 0.4, y: dy * 0.4, duration: 0.4, ease: "power2.out", overwrite: true });
      gsap.to(m.label, { x: dx * 0.24, y: dy * 0.24, duration: 0.4, ease: "power2.out", overwrite: true });
    };
    const home = (m) => gsap.to([m.btn, ...m.label], { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)", overwrite: true });
    addEventListener("mousemove", (e) => {
      for (const m of magnets) {
        const b = m.btn.getBoundingClientRect();
        const dx = e.clientX - (b.left + b.width / 2 - gsap.getProperty(m.btn, "x")), dy = e.clientY - (b.top + b.height / 2 - gsap.getProperty(m.btn, "y"));
        if (dx * dx + dy * dy <= m.r * m.r) { m.on = true; pull(m, dx, dy); } else if (m.on) { m.on = false; home(m); }
      }
    }, { passive: true });
  }

  // Question head — while passing the pinned panel, letters enter from the right end of the line and exit off to the left (the first 18% moves only 4% — slow entry),
  // Follows wheel strength (|deltaY|) over 1s power2 and the line bends in waves (50 is all the way), and straightens after 66ms of stillness
  const q = document.querySelector(".bw-ques");
  if (q && matchMedia("(any-pointer: fine)").matches) {
    const line = q.querySelector(".bw-ques__line"), wave = q.querySelector(".bw-ques__wave"), tp = q.querySelector("textPath"), text = q.querySelector(".bw-ques__text");
    const bend = gsap.timeline({ paused: true }).to(line, { morphSVG: wave, duration: 1, ease: "none" });
    let len = line.getTotalLength(), size = text.getComputedTextLength(), prog = 0;
    const place = () => {
      const a = prog <= 0.18 ? gsap.utils.mapRange(0, 0.18, 0, 0.04, prog) : gsap.utils.mapRange(0.18, 1, 0.04, 1, prog);
      const n = 0.03 * len, l = len + size - n, start = len + size - n - a * l - size;
      tp.setAttribute("startOffset", `${(start / len) * 100}%`);
    };
    const pull = { v: 0 };
    let lastStep = -1, calm = 0;
    const toV = gsap.quickTo(pull, "v", { duration: 1, ease: "power2", onUpdate: () => { const t = Math.round(200 * gsap.utils.clamp(0, 1, pull.v / 50)) / 200; if (t !== lastStep) { lastStep = t; bend.progress(t); len = line.getTotalLength(); place(); } } });
    ScrollTrigger.create({ trigger: q.querySelector(".bw-ques__pin"), start: "top top", end: "bottom bottom", onUpdate: (s) => { prog = s.progress; place(); }, onRefresh: () => { size = text.getComputedTextLength(); place(); } });
    addEventListener("wheel", (e) => { const r = q.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; toV(Math.abs(e.deltaY)); clearTimeout(calm); calm = setTimeout(() => toV(0), 66); }, { passive: true });
    (document.fonts?.ready || Promise.resolve()).then(() => { size = text.getComputedTextLength(); place(); });
    place();
  }
})();
