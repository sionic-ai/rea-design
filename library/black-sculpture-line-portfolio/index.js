(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = "gzEase";
  const gate = document.querySelector(".gz-gate");
  const hero = document.querySelector(".gz-hero");
  // The entrance door shows only when entering the first page directly — when arriving via an inner transition the photo brightens and the band enters from the right (original)
  const seen = sessionStorage.getItem("gz-seen") === "1" || document.documentElement.classList.contains("gz-arrive");

  // Person photo slot — as in the original, draws as a silhouette the slot where a dark-background black-and-white profile photo goes (so cell misalignment is visible)
  const portrait = hero.querySelector(".gz-hero__portrait");
  if (portrait && !portrait.querySelector('[data-fx-part="image"]')) {
    const c = document.createElement("canvas"); c.width = 1536; c.height = 1024; c.setAttribute("data-fx-part", "image");
    const g = c.getContext("2d");
    const col = (n) => { const p = document.createElement("span"); p.style.cssText = `display:none;color:var(${n})`; document.body.appendChild(p); const v = getComputedStyle(p).color; p.remove(); return v; };
    const bg = col("--kf-bg"), mid = col("--site-marquee"), lit = col("--kf-dim"), ink = col("--kf-ink-soft");
    g.fillStyle = bg; g.fillRect(0, 0, 1536, 1024);
    const light = g.createRadialGradient(560, 380, 40, 600, 420, 620);
    light.addColorStop(0, lit); light.addColorStop(1, bg);
    g.fillStyle = mid;
    g.beginPath(); g.ellipse(720, 900, 520, 260, 0, Math.PI, 0); g.fill();
    g.fillStyle = light;
    g.beginPath(); g.ellipse(700, 470, 230, 290, -0.12, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(470, 470); g.lineTo(380, 600); g.lineTo(470, 640); g.lineTo(520, 760); g.lineTo(700, 760); g.fill();
    g.fillStyle = bg; g.beginPath(); g.ellipse(760, 250, 290, 130, -0.15, Math.PI * 0.95, Math.PI * 2.05); g.fill();
    g.beginPath(); g.moveTo(980, 290); g.lineTo(1120, 420); g.lineTo(1000, 360); g.fill();
    g.strokeStyle = ink; g.lineWidth = 6;
    g.beginPath(); g.ellipse(560, 430, 70, 60, 0, 0, Math.PI * 2); g.ellipse(700, 440, 70, 60, 0, 0, Math.PI * 2); g.moveTo(630, 430); g.lineTo(980, 400); g.stroke();
    g.fillStyle = ink; g.font = `500 22px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-sans")}`; g.textAlign = "center";
    g.fillText(portrait.dataset.label || "", 768, 980);
    portrait.appendChild(c);
  }

  // Entry gate — once per window (session). Scroll is locked until a choice is made.
  // Original sequence (from the press): name text line opens its clip mask at .15s and rises 24px over .55s · long sentence band starts flowing at .17s ·
  // The logo flies to the header logo spot after .15s over .95s, darkening to the logo color from .72s over .44s · at 1.18s the contact background · button vanish at once, revealing the photo
  if (gate && seen) gate.remove();
  const windows = hero.querySelectorAll(".gz-hero__info .gz-line"), heroLines = hero.querySelectorAll(".gz-hero__info .gz-line > span");
  const track = hero.querySelector(".gz-hero__track");
  let marquee = null;
  // Long sentence strip — enters from beyond the right edge (100vw + 8px) and moves left at 133px per second, two copies joined for an endless loop
  const runMarquee = () => {
    if (!track || reduce || marquee) return;
    const w = track.firstElementChild.getBoundingClientRect().width;
    let pos = innerWidth + 8;
    marquee = (_, dt) => {
      pos -= 133 * Math.min(dt, 50) / 1000;
      if (pos < -w) pos += w;
      track.style.transform = `translate3d(${pos}px,0,0)`;
    };
    gsap.ticker.add(marquee);
  };
  const heroIntro = () => {
    const tl = gsap.timeline();
    tl.fromTo(windows, { clipPath: "inset(100% -12px 0%)" }, { clipPath: "inset(0% -12px 0%)", duration: reduce ? 0 : 0.55, ease: "power2.inOut", stagger: 0.06 }, 0.15)
      .fromTo(heroLines, { y: 24, yPercent: 0 }, { y: 0, duration: reduce ? 0 : 0.55, ease: "power2.inOut", stagger: 0.06 }, 0.15)
      .set(windows, { clipPath: "none" });
    gsap.delayedCall(reduce ? 0 : 0.17, runMarquee);
  };
  if (gate && gate.isConnected) {
    document.body.classList.add("gz-locked");
    gsap.set(heroLines, { y: 24, yPercent: 0 });
    gsap.set(windows, { clipPath: "inset(100% -12px 0%)" });
    gate.addEventListener("fx:choose", () => {
      gate.querySelector('[data-fx-part="choices"]')?.classList.add("is-chosen");
      heroIntro();
      // The Contact backdrop and pick buttons vanish all at once at 1.18s (1.1s excluding the measuring delay) — only the flying logo remains
      gsap.delayedCall(reduce ? 0 : 1.1, () => gsap.set([gate.querySelector(".gz-gate__bg"), gate.querySelector('[data-fx-part="choices"]'), ...gate.querySelectorAll("[data-choice]")], { opacity: 0 }));
      gsap.to(gate.querySelector('[data-fx-part="mark"]'), { color: getComputedStyle(document.querySelector(".gz-logo")).color, duration: reduce ? 0 : 0.44, ease: "power1.inOut", delay: reduce ? 0 : 0.64 });
    }, { once: true });
    gate.addEventListener("fx:enter", () => {
      sessionStorage.setItem("gz-seen", "1");
      document.body.classList.remove("gz-locked");
      document.documentElement.classList.remove("gz-gating");
    }, { once: true });
  } else runMarquee();

  // Large headline only while on the first section
  ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom 30%", toggleClass: { targets: document.body, className: "gz-top" } });
  if (scrollY < innerHeight * 0.7) document.body.classList.add("gz-top");

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Glasses section: three lines of big text stay while the glasses approach, fade out as the lens covers the screen, then sentences 01 to 04 change in turn
    const lens = document.querySelector(".gz-lens");
    const beats = gsap.utils.toArray(".gz-beats li");
    const lt = gsap.timeline({ scrollTrigger: { trigger: lens, start: "top top", end: "bottom bottom", scrub: 0.48 } });
    // The first line stays, the second and third lines rise in turn inside the mask, then fade out as the glasses grow
    const headLines = gsap.utils.toArray(".gz-lens__head .gz-line > span");
    lt.fromTo(headLines.slice(1), { yPercent: 105 }, { yPercent: 0, duration: 0.1, ease: "power2.inOut", stagger: 0.1 }, 0.02)
      .to(".gz-lens__head", { autoAlpha: 0, filter: "blur(12px)", duration: 0.12, ease: "power2.inOut" }, 0.38);
    // Sentences resolve from a 12px blur · 16px below, and blur out again before the next sentence arrives (original optical-beat)
    beats.forEach((b, i) => {
      lt.fromTo(b, { autoAlpha: 0, y: 16, filter: "blur(12px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.05, ease: "power2.out" }, 0.55 + i * 0.11);
      if (i < beats.length - 1) lt.to(b, { autoAlpha: 0, y: -16, filter: "blur(12px)", duration: 0.05, ease: "power2.in" }, 0.55 + i * 0.11 + 0.08);
    });

    // Ring section: three words enter from the right (+30%), stand, then exit to the left (−30%), and the sentence at lower right changes along with them
    const ct = gsap.timeline({ scrollTrigger: { trigger: ".gz-clarity", start: "top top", end: "bottom bottom", scrub: 0.48 } });
    const words = gsap.utils.toArray(".gz-clarity__word span"), notes = gsap.utils.toArray(".gz-clarity__note p");
    words.forEach((w, i) => {
      const at = 0.04 + i * 0.32;
      ct.fromTo(w, { autoAlpha: 0, xPercent: 30 }, { autoAlpha: 1, xPercent: 0, duration: 0.1, ease: "power2.out" }, at)
        .fromTo(notes[i], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.08, ease: "power2.out" }, at + 0.04)
        .to(w, { autoAlpha: 0, xPercent: -30, duration: 0.1, ease: "power2.in" }, at + 0.2)
        .to(notes[i], { autoAlpha: 0, y: -24, duration: 0.06, ease: "power2.in" }, at + 0.2);
    });

    gsap.timeline({ scrollTrigger: { trigger: ".gz-outlook", start: "top top", end: "bottom bottom", scrub: 0.48 } })
      .fromTo(".gz-outlook__title .gz-line > span", { yPercent: 110 }, { yPercent: 0, duration: 0.25, ease: "power2.inOut", stagger: 0.06 }, 0.05)
      .fromTo(".gz-outlook .gz-eyebrow", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 0.05);

    // Work strip: flows horizontally three screens by section height, and a white line is drawn that long
    const rail = document.querySelector(".gz-work__rail path");
    const len = rail.getTotalLength();
    gsap.set(rail, { strokeDasharray: len, strokeDashoffset: len });
    const wt = gsap.timeline({ scrollTrigger: { trigger: ".gz-work", start: "top top", end: "bottom bottom", scrub: 0.48 } });
    wt.to(".gz-work__track", { xPercent: -75, ease: "none", duration: 1 }, 0)
      .to(".gz-work__rail", { xPercent: -75, ease: "none", duration: 1 }, 0)
      .to(rail, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0);
    gsap.utils.toArray(".gz-case__art path").forEach((p) => {
      const l = p.getTotalLength();
      gsap.set(p, { strokeDasharray: l, strokeDashoffset: l });
    });
    gsap.utils.toArray(".gz-case").forEach((c, i) => {
      wt.to(c.querySelectorAll(".gz-case__art path"), { strokeDashoffset: 0, ease: "none", duration: 0.22 }, Math.max(0, i * 0.25 - 0.08));
    });

    // System section: lines a → b → c are drawn and erased in turn, and the heading changes in turn too
    const sys = gsap.timeline({ scrollTrigger: { trigger: ".gz-systems", start: "top top", end: "bottom bottom", scrub: 0.48 } });
    ["a", "b", "c"].forEach((k, i) => {
      const p = document.querySelector(`.gz-systems__${k}`), l = p.getTotalLength(), t = document.querySelector(`.gz-systems__t${i + 1}`);
      gsap.set(p, { strokeDasharray: l, strokeDashoffset: l });
      sys.to(p, { strokeDashoffset: 0, ease: "none", duration: 0.2 }, i * 0.33)
        .fromTo(t.querySelectorAll(".gz-line > span"), { yPercent: 110 }, { yPercent: 0, duration: 0.08, ease: "power2.inOut", stagger: 0.02 }, i * 0.33 + 0.05);
      if (i < 2) sys.to(p, { strokeDashoffset: -l, ease: "none", duration: 0.12 }, i * 0.33 + 0.24).to(t, { autoAlpha: 0, duration: 0.05 }, i * 0.33 + 0.28);
    });

    // Bottom strip: turns on after the hero, shows document progress as 00~100, and changes the section name per section
    const bar = document.querySelector(".gz-bar"), num = bar.querySelector("b"), fill = bar.querySelector(".gz-bar__track i"), step = bar.querySelector(".gz-bar__step");
    ScrollTrigger.create({ trigger: ".gz-lens", start: "top 60%", endTrigger: ".gz-foot", end: "top 60%", toggleClass: { targets: bar, className: "is-on" } });
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => { num.textContent = String(Math.round(s.progress * 100)).padStart(2, "0"); gsap.set(fill, { scaleX: s.progress }); } });
    [[".gz-lens", "PERSPECTIVE"], [".gz-clarity", "CLARITY"], [".gz-outlook", "DIRECTION"], [".gz-work", "PUT TO WORK"], [".gz-systems", "STRUCTURE"]].forEach(([sel, name]) => {
      ScrollTrigger.create({ trigger: sel, start: "top 50%", end: "bottom 50%", onToggle: (s) => { if (s.isActive) step.textContent = name; } });
    });
  });
})();
