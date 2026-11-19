// Home only — hero photo tilt and word roll, work wall polaroids, statement steps (pinned), question scene (pinned · words floating up · dark overlay)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Work wall — original ProjectsWall. Soft cursor: while hovering a name, that work’s polaroid turns on and the panel follows the cursor by .18 of the remaining distance each frame
  // (within 380px of the right edge it flips to the cursor’s left, within 440px of the top it flips below the cursor, offset by 60·40px). Touch: a press pins it at center + backdrop + button — as in the original, even under reduced motion
  const wall = document.querySelector(".ow-wall"), follow = wall?.querySelector(".ow-wall__follow");
  if (follow) {
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const pols = new Map([...follow.querySelectorAll(".ow-wall__pol")].map((p) => [p.dataset.key, p]));
    const keyOf = (w) => w.querySelector("span")?.textContent.trim();
    let on = null;
    const show = (k) => {
      if (k === on) return;
      pols.get(on)?.classList.remove("is-on");
      on = pols.has(k) ? k : null;
      pols.get(on)?.classList.add("is-on");
      wall.classList.toggle("is-preview", !fine && !!on);
    };
    if (fine && !reduce) {
      // Delegate over/out instead of enter/leave so both synthetic and real events arrive — crossing to the neighboring name turns off and on in the same frame so it doesn’t flicker
      wall.addEventListener("mouseover", (e) => { const w = e.target.closest(".ow-wall__word"); if (w) show(keyOf(w)); });
      wall.addEventListener("mouseout", (e) => { const w = e.target.closest(".ow-wall__word"); if (w && !w.contains(e.relatedTarget)) show(null); });
      let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, raf = 0;
      addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
      const tick = () => {
        x += (tx - x) * 0.18; y += (ty - y) * 0.18;
        const left = x > innerWidth - 380, below = y < 440;
        follow.style.transform = `translate3d(${left ? x - 60 : x + 60}px, ${below ? y + 40 : y - 40}px, 0) translate(${left ? "-100%" : "0"}, ${below ? "0" : "-100%"})`;
        raf = requestAnimationFrame(tick);
      };
      // The original always runs — it pauses outside the section, and on re-entry snaps the board to the cursor position so it doesn’t fly in from far away
      new IntersectionObserver(([en]) => {
        if (en.isIntersecting) { if (!raf) { x = tx; y = ty; raf = requestAnimationFrame(tick); } }
        else { cancelAnimationFrame(raf); raf = 0; }
      }).observe(wall);
    } else if (!fine) {
      wall.classList.add("is-static");
      wall.addEventListener("click", (e) => {
        const w = e.target.closest(".ow-wall__word");
        if (w) { e.preventDefault(); const k = keyOf(w); show(k === on ? null : k); }
        else if (e.target.closest(".ow-wall__scrim")) show(null);
      });
    }
  }

  if (reduce) return;
  gsap.registerPlugin(ScrollTrigger);

  // Cream first section — + on screen=/  While pinned at 100% (scrub .5) the logo exits upward by −170% and the tag group downward by 170% (.2 power2.in), the star grows to cover the screen, and from .72 a dark veil covers it
  const intro = document.querySelector(".ow-intro");
  if (intro) {
    gsap.timeline({ scrollTrigger: { trigger: intro, start: "top top", end: "+=100%", scrub: 0.5, pin: ".ow-intro__pin" } })
      .to(".ow-intro__logo", { yPercent: -170, opacity: 0, ease: "power2.in", duration: 0.2 }, 0)
      .to(".ow-intro__below", { yPercent: 170, opacity: 0, ease: "power2.in", duration: 0.2 }, 0)
      .to(".ow-intro__hint", { opacity: 0, ease: "power2.in", duration: 0.15 }, 0)
      .to(".ow-intro__ast", { scale: 40, ease: "power2.in", duration: 0.7 }, 0.2)
      .to(".ow-intro__veil", { opacity: 1, ease: "none", duration: 0.28 }, 0.72);
  }

  // Hero — original heroSection: anywhere in the window, the photo panel’s target changes to X·Y ±4° (perspective 1200px) toward the cursor, and while the section is visible each frame closes .06 of the remaining distance.
  // Scrolling down pushes the plate up 15%
  const hero = document.querySelector(".ow-hero");
  if (hero) {
    const tilt = hero.querySelector("[data-tilt]");
    let tx = 0, ty = 0, rx = 0, ry = 0, raf = 0;
    gsap.set(tilt, { transformPerspective: 1200 });
    addEventListener("mousemove", (e) => { ty = (e.clientX / innerWidth - 0.5) * 8; tx = -(e.clientY / innerHeight - 0.5) * 8; }, { passive: true });
    const tick = () => {
      if (!document.hidden) { rx += (tx - rx) * 0.06; ry += (ty - ry) * 0.06; gsap.set(tilt, { rotationX: rx, rotationY: ry }); }
      raf = requestAnimationFrame(tick);
    };
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting) raf ||= requestAnimationFrame(tick);
      else { cancelAnimationFrame(raf); raf = 0; }
    }).observe(hero);
    gsap.to(tilt, { yPercent: 15, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    // Agency + word — every 2.4s the word rolls up one step to change (.6s cubic-bezier(.65,0,.35,1)), and at the last slot (copy of the first word) it resets to the start
    const t = hero.querySelector(".ow-rot__t"), n = t ? t.children.length : 0;
    if (t && n > 1) {
      let i = 0;
      setInterval(() => {
        if (document.hidden) return;
        i += 1;
        gsap.to(t, { yPercent: (-100 / n) * i, duration: 0.6, ease: "power2.inOut", onComplete: () => { if (i === n - 1) { i = 0; gsap.set(t, { yPercent: 0 }); } } });
      }, 2400);
    }
  }

  // Statement — pin the section for steps × 100% (scrub 1), at each step the panel lights at .12 and words rise from 24% below and transparent at .12 to .4 power3.out (.04 stagger), then give way to the next step
  const mani = document.querySelector(".ow-mani");
  if (mani) {
    const steps = [...mani.querySelectorAll(".ow-mani__step")], n = mani.querySelector("[data-mani-n]");
    steps.forEach((st) => st.querySelectorAll("p").forEach((p) => { p.innerHTML = p.innerHTML.split(/(\s+)/).map((w) => (w.trim() ? `<span class="ow-mani__w">${w}</span>` : w)).join(""); }));
    gsap.set(steps, { autoAlpha: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: mani, start: "top top", end: `+=${steps.length * 100}%`, pin: ".ow-mani__pin", scrub: 1, anticipatePin: 1, onUpdate: (s) => { if (n) n.textContent = String(Math.min(steps.length, Math.floor(s.progress * steps.length) + 1)).padStart(2, "0"); } } });
    steps.forEach((st, i) => {
      tl.fromTo(st, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, ease: "none" }, i);
      tl.fromTo(st.querySelectorAll(".ow-mani__w"), { opacity: 0.12, yPercent: 24 }, { opacity: 1, yPercent: 0, ease: "power3.out", duration: 0.4, stagger: 0.04 }, i);
      if (i < steps.length - 1) tl.to(st, { autoAlpha: 0, duration: 0.12, ease: "none" }, i + 0.88);
    });
  }

  // Dictionary definition — while the section comes in, the background shifts from dark to cream (.42 power3.inOut), and the brackets on both sides gather in from ∓260% in .82 power2.out
  const def = document.querySelector(".ow-def");
  if (def) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: def, start: "top 80%", end: "top 20%", scrub: 0.6 } });
    tl.fromTo(def, { backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--kf-bg").trim() }, { backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--kf-contrast-bg").trim(), ease: "power3.inOut", duration: 0.42 }, 0);
    const pr = def.querySelectorAll(".ow-def__kick .ow-paren");
    if (pr.length === 2) { tl.fromTo(pr[0], { xPercent: -260, opacity: 0 }, { xPercent: 0, opacity: 1, ease: "power2.out", duration: 0.82 }, 0); tl.fromTo(pr[1], { xPercent: 260, opacity: 0 }, { xPercent: 0, opacity: 1, ease: "power2.out", duration: 0.82 }, 0); }
  }

  // Question scene — section +=Pinned for 1.2 screens (scrub .6), words from scattered positions (±sideways · down · tilt) gather with .04 stagger, .4 power3.out, and at .6 a dark veil covers from the left (.4, no curve)
  document.querySelectorAll(".ow-q").forEach((q) => {
    const words = [...q.querySelectorAll(".ow-q__w")], wipe = q.querySelector(".ow-q__wipe");
    const tl = gsap.timeline({ scrollTrigger: { trigger: q, start: "top top", end: () => `+=${1.2 * innerHeight}`, pin: q.querySelector(".ow-q__pin"), scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true } });
    tl.addLabel("words", 0);
    words.forEach((w, k) => { const a = { x: (Math.random() - 0.5) * 240, y: 60 + Math.random() * 80, r: (Math.random() - 0.5) * 24 }; tl.fromTo(w, { x: a.x, y: a.y, rotate: a.r, opacity: 0 }, { x: 0, y: 0, rotate: 0, opacity: 1, ease: "power3.out", duration: 0.4 }, `words+=${0.04 * k}`); });
    tl.fromTo(wipe, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none", duration: 0.4 }, 0.6);
  });

  // Project stage heading letters — while the section travels from the bottom of the screen to the top, they go from 90px sideways at opacity .06 into place (scrub .8, .12 stagger)
  const top = document.querySelectorAll(".ow-proj__top span");
  if (top.length) gsap.fromTo(top, { x: 90, opacity: 0.06 }, { x: 0, opacity: 1, ease: "power3.out", stagger: 0.12, scrollTrigger: { trigger: ".ow-proj", start: "top bottom", end: "top top", scrub: 0.8 } });

  // Text lines — when they reach 88% of the screen, each line rises 40px from below in .72s, .1s later than the previous one
  document.querySelectorAll(".ow-blog__row").forEach((r, i) => gsap.from(r, { autoAlpha: 0, y: 40, duration: 0.72, ease: "expo.out", delay: i * 0.1, scrollTrigger: { trigger: r, start: "top 88%" } }));

  // Company video and project stage pins (parts) are attached by fx-core at DOMContentLoaded, so they get created later than this file’s pins — left as is, later sections would
  // Measured as if two fixed lengths (1260+3600px) came earlier, so the third question scene stuck on and covered the spot of the Work wall. Re-set up in document order and measure again
  addEventListener("DOMContentLoaded", () => {
    ScrollTrigger.sort((a, b) => (!a.trigger || !b.trigger || a.trigger === b.trigger ? 0 : a.trigger.compareDocumentPosition(b.trigger) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    ScrollTrigger.refresh();
  });
})();
