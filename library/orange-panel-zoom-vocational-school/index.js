// Original __top: for the department section, --val goes 0→1 (scrub 1) from when the trigger head touches the top of the screen until 20% and 40% top, for the dream-finding section, --val runs top top → 40% 40%, for the open campus illustration, top bottom → bottom top with airship −30% and −30% · building and light −10%
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const mm = gsap.matchMedia();
  const q = (s) => document.querySelector(s);

  // When the splash clears (fx:done) the wait is released and the video plate rises from 40% below and transparent in 1s expo.out (random .0~.2s delay per plate)
  const hero = q(".ma-hero");
  const medias = document.querySelectorAll(".ma-hero__media");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) gsap.set(medias, { yPercent: 40, opacity: 0 });
  const reveal = () => {
    hero.classList.remove("is-standby");
    if (!reduce) gsap.to(medias, { yPercent: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: () => 0.2 * Math.random() });
  };
  // Hero color: each time the panel turns, pick at random one color different from the current one (original vi = orange·red·green·blue·yellow), turns orange once past 80% of the Hero
  const hues = ["orange", "red", "green", "blue", "yellow"];
  const html = document.documentElement;
  let first = true;
  q(".ma-hero__slider").addEventListener("fx:change", () => {
    if (first) { first = false; return; }
    const now = html.dataset.hue || "orange";
    let next = now;
    while (next === now) next = hues[Math.floor(Math.random() * hues.length)];
    html.dataset.hue = next;
  });
  ScrollTrigger.create({ trigger: ".ma-hero", start: "80% top", end: "bottom top", onEnter: () => (html.dataset.hue = "orange"), onLeaveBack: () => (html.dataset.hue = "orange") });

  const splash = q(".ma-splash");
  if (splash) splash.addEventListener("fx:done", reveal, { once: true }); else reveal();

  mm.add({ pc: "(min-width: 1025px) and (prefers-reduced-motion: no-preference)" }, () => {
    const course = q(".ma-course");
    const cards = [...document.querySelectorAll(".ma-course__card")];
    const nav = [...document.querySelectorAll(".ma-course__nav-item")];
    gsap.set(cards.slice(1), { "--val": 0 });
    const done = [true, false, false];
    const mark = () => { const cur = done[2] ? 2 : done[1] ? 1 : 0; nav.forEach((n, j) => n.classList.toggle("is-current", j === cur)); };
    [["20% top", 1], ["40% top", 2]].forEach(([end, i]) => {
      gsap.to(cards[i], {
        "--val": 1, ease: "none",
        scrollTrigger: { trigger: course, start: "top top", end, scrub: 1, invalidateOnRefresh: true, onUpdate: (st) => { done[i] = st.progress > 0.99; mark(); } },
      });
    });

    const dream = q(".ma-dream");
    gsap.set([q(".ma-dream__pin"), q(".ma-dream__card")], { "--val": 0 });
    gsap.to([q(".ma-dream__pin"), q(".ma-dream__card")], { "--val": 1, ease: "none", scrollTrigger: { trigger: dream, start: "top top", end: "40% 40%", scrub: 1, invalidateOnRefresh: true } });

    // Original sticky-trigger 04 — while the empty slot enters the screen (top bottom → bottom top) the stuck Open Campus rises into place and three pictures move at different speeds
    const st = { trigger: q('[data-space="oc"]'), start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true };
    gsap.to(q(".ma-oc"), { y: "0%", ease: "none", scrollTrigger: st });
    // The original puts CSS translate 10% on the image and GSAP reads it as the start value, going on to −30%·−10% — in practice +10% → −30% (airship) · +10% → −10% (building · light)
    gsap.fromTo(q(".ma-oc__ship"), { xPercent: 10, yPercent: 10 }, { xPercent: -30, yPercent: -30, ease: "none", scrollTrigger: { ...st } });
    gsap.fromTo([q(".ma-oc__campus"), q(".ma-oc__light")], { yPercent: 10 }, { yPercent: -10, ease: "none", scrollTrigger: { ...st } });
    // Original sticky-trigger 05 — from when the blank slot’s top touches the screen bottom until its center does, the video section settles into place
    gsap.to(q(".ma-movie"), { y: "0%", ease: "none", scrollTrigger: { trigger: q('[data-space="movie"]'), start: "top bottom", end: "center bottom", scrub: true, invalidateOnRefresh: true } });
  });

  // Dream-finding chip — choosing one shows that chip’s department on the card (original isSelect · isComplate)
  const depts = ["Department name one", "Department Two Name", "Department Three Name"];
  const card = q(".ma-dream__card"), result = q(".ma-dream__result");
  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".ma-chip");
    if (chip) {
      const on = !chip.classList.contains("is-select");
      document.querySelectorAll(".ma-chip").forEach((c) => c.classList.toggle("is-select", c === chip && on));
      card.classList.toggle("is-picked", on);
      result.textContent = on ? depts[+chip.dataset.dept] : "";
    }
    const sel = e.target.closest(".ma-sel");
    if (sel) {
      document.querySelectorAll(".ma-sel").forEach((s) => s.classList.toggle("is-select", s === sel));
      document.querySelectorAll(".ma-talk").forEach((t) => t.classList.toggle("is-select", t.dataset.i === sel.dataset.i));
    }
    const down = e.target.closest("[data-scroll-to]");
    if (down) gsap.to(window, { scrollTo: q(down.dataset.scrollTo), duration: 1.2, ease: "expo.inOut" });
  });

  // Department card lesson video — on mouse, plays on hover, stops .3s after release (original data-hover=video).
  // At 1024 and below, a card is revealed and played while passing between 60% and 50% of the screen (original ScrollTrigger.batch top 60% · bottom 50%)
  const courseCards = [...document.querySelectorAll(".ma-course__card")];
  const play = (v) => { const p = v.play(); if (p) p.catch(() => v.pause()); };
  if (!("ontouchstart" in document)) {
    courseCards.forEach((card) => {
      const v = card.querySelector("video");
      let stop = null;
      card.addEventListener("mouseenter", () => { clearTimeout(stop); play(v); });
      card.addEventListener("mouseleave", () => { stop = setTimeout(() => v.pause(), 300); });
    });
  }
  mm.add("(max-width: 1024px)", () => {
    courseCards.forEach((card) => {
      const v = card.querySelector("video");
      ScrollTrigger.create({ trigger: card, start: "top 60%", end: "bottom 50%", onToggle: (st) => { card.classList.toggle("is-active", st.isActive); if (st.isActive) play(v); else v.pause(); } });
    });
    return () => courseCards.forEach((c) => { c.classList.remove("is-active"); c.querySelector("video").pause(); });
  });

  // Student carousel — the next student shows right away when 20% of the panel is on screen, then every 2.5s (original intervalTime 2500 · threshold .2), and stops when it leaves.
  // The panel itself appears in .5s when its head touches 65% of the screen (80% at 1024 and below) (original data-st).
  const tube = q(".ma-about__card.is-student");
  if (tube) {
    const mats = [...tube.querySelectorAll(".ma-tube__item")], says = [...tube.querySelectorAll(".ma-tube__say")];
    let cur = 0, slid = false, timer = null;
    const next = () => {
      cur = (cur % mats.length) + 1;
      [mats, says].forEach((list) => list.forEach((m, i) => m.classList.toggle("is-active", i + 1 === cur)));
    };
    if (reduce) { tube.classList.add("is-active"); next(); }
    else {
      new IntersectionObserver(([e]) => {
        clearInterval(timer);
        if (e.isIntersecting) { if (!slid) next(); timer = setInterval(() => { slid = true; next(); }, 2500); }
      }, { threshold: 0.2 }).observe(tube);
      mm.add({ pc: "(min-width: 1025px)", sp: "(max-width: 1024px)" }, (c) => {
        ScrollTrigger.create({ trigger: tube, start: c.conditions.pc ? "top 65%" : "top 80%", end: "bottom bottom", onEnter: () => tube.classList.add("is-active"), onLeaveBack: () => tube.classList.remove("is-active") });
      });
    }
  }

  // Principal’s message speech bubbles — one turns on right when entering the screen, then one more every 1.5s, and when all three are filled they all turn off in one beat (original data-message-current)
  const bubbles = [...document.querySelectorAll(".ma-message__comment li")];
  if (bubbles.length && !reduce) {
    let cur = 0, timer = null;
    const step = () => {
      if (cur === bubbles.length) { cur = 0; bubbles.forEach((b) => b.classList.remove("is-active")); return; }
      bubbles[cur++].classList.add("is-active");
    };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!timer) step(); clearInterval(timer); timer = setInterval(step, 1500); }
      else clearInterval(timer);
    }).observe(q(".ma-message"));
  } else bubbles.forEach((b) => b.classList.add("is-active"));

  // On phone, after the Hero a bottom fixed button row rises (isUpdateFixNavi — when the Hero bottom passes the screen bottom)
  ScrollTrigger.create({ trigger: ".ma-hero", start: "bottom bottom", end: "top top", onEnter: () => document.documentElement.classList.add("is-fix"), onLeaveBack: () => document.documentElement.classList.remove("is-fix") });
})();
