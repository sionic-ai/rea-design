/* Home motion — values straight from the original Webflow IX2 action list (a·a-15·a-22·a-26·a-27·a-28·a-29·a-31·a-63·a-70) */
(() => {
  const { reduce, css } = window.MD;
  const mm = gsap.matchMedia();
  const em = () => parseFloat(getComputedStyle(document.body).fontSize);
  const quart = "quart.out";

  /* ── Hero a: initial state at 0s, at 5.8s the side spheres merge to the center (.8 outQuart), then the sphere grows to 27em and rotates -30°, and
        Crosshair·horizontal and vertical lines are drawn (.8), the head comes down, .4s later four cells open, 1s later a big word slides in, 1.5s later a yellow panel rises ── */
  const hero = document.querySelector(".hero");
  const q = (s) => hero.querySelector(s);
  const navBar = document.querySelector(".nav");
  const navIn = navBar.querySelector(".nav__in");
  const next = q(".next");
  const bigs = { design: q(".big--design"), shop: q(".big--shop"), est: q(".big--est") };
  const desktop = matchMedia("(min-width: 768px)").matches;
  if (reduce) {
    gsap.set(".sph--left", { x: "20em" });
    gsap.set(".sph--right", { x: "-20em" });
    gsap.set(".sph__main", { opacity: 1, width: "27em", height: "27em", rotation: -30 });
    gsap.set(".hero__cross", { width: "2.5em", height: "2.5em" });
    gsap.set(".hero__lh", { width: "100vw" });
    gsap.set(".hero__lv", { height: "100vh" });
    gsap.set(".part--shop", { width: "40.6em" });
    gsap.set(".part--est", { width: "36em" });
    Object.values(bigs).forEach((b) => gsap.set(b, { display: "block" }));
    gsap.set(next, { display: "flex", y: 0 });
  } else {
    // Initial state (group 0)
    gsap.set(navBar, { y: -100 });
    gsap.set(navIn, { display: "none" });
    gsap.set(next, { y: 100, display: "none" });
    gsap.set(bigs.est, { x: "5em" });
    gsap.set(bigs.shop, { x: "3em" });
    gsap.set(bigs.design, { x: "1em" });
    const tl = gsap.timeline({ delay: 5.8 });
    // Group 1 — the original puts left at -20em and pushes it +20em along x to gather in the center
    tl.to(".sph--left", { x: "20em", duration: 0.8, ease: quart }, 0)
      .to(".sph--right", { x: "-20em", duration: 0.8, ease: quart }, 0)
      .to(".sph__main", { opacity: 1, duration: 0.8, ease: quart }, 0);
    // Group 2 — after group 1 finishes (.8)
    const g2 = 0.8;
    tl.to(".sph__main", { width: "27em", height: "27em", duration: 0.8, ease: quart }, g2)
      .to(".sph__main", { rotation: -30, duration: 0.5, ease: "power1.inOut" }, g2)
      .to(".hero__cross", { width: "2.5em", height: "2.5em", duration: 0.5, ease: "power1.inOut" }, g2)
      .fromTo(".hero__lv", { y: 0 }, { y: 3.75, height: "100vh", duration: 0.8, ease: quart, immediateRender: false }, g2)
      .to(".hero__lh", { width: "100vw", duration: 0.8, ease: quart }, g2)
      .set(navIn, { display: "flex" }, g2)
      .to(navBar, { y: 0, duration: 0.8, ease: quart }, g2)
      .to(".part--shop", { width: "40.6em", duration: 0.6, ease: "power1.inOut" }, g2 + 0.4)
      .to(".part--est", { width: "36em", duration: 0.6, ease: "power1.inOut" }, g2 + 0.4)
      .set(Object.values(bigs), { display: "block" }, g2 + 1)
      .to(bigs.shop, { x: 0, duration: 1, ease: quart }, g2 + 1)
      .to(bigs.est, { x: 0, duration: 1, ease: quart }, g2 + 1)
      .to(bigs.design, { x: "-5em", duration: 1, ease: quart }, g2 + 1)
      .set(next, { display: "flex" }, g2 + 1.5)
      .to(next, { y: 0, duration: 0.8, ease: quart }, g2 + 1.5)
      .add(() => next.querySelectorAll("[data-split]").forEach((el) => el._mdSplit?.play()), g2 + 1.5);
  }

  /* ── 3-in-1 a-31: progress from when the section enters the screen until it leaves (original SCROLLING_IN_VIEW, smoothing 50)
        30%: two texts visible · yellow sphere 36em, pushed to 28.75vw/5vw → 40%: texts vanish → 47%: sphere 9em in place ── */
  const scrubView = (trigger, build) => {
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: 0.5, invalidateOnRefresh: true } });
    build(tl);
    tl.to({}, { duration: Math.max(0, 1 - tl.duration()) });
    return tl;
  };
  if (!reduce) {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const three = document.querySelector(".three");
      const y = three.querySelector(".three__yellow"), t1 = three.querySelector(".three__title"), t2 = three.querySelector(".three__lead");
      gsap.set(y, { width: "9em", height: "9em", x: 0, y: 0, top: "4.9em", left: "1.1em" });
      scrubView(three, (tl) => {
        tl.set([t1, t2], { opacity: 0 }, 0)
          .fromTo(y, { width: "9em", height: "9em", x: 0, y: 0 }, { width: "36em", height: "36em", x: "28.75vw", y: "5vw", duration: 0.3 }, 0)
          .to([t1, t2], { opacity: 1, duration: 0.3 }, 0)
          .to([t1, t2], { opacity: 0, duration: 0.1 }, 0.3)
          .to(y, { width: "9em", height: "9em", x: 0, y: 0, duration: 0.17 }, 0.3);
      });

      /* ── Design and estimate horizontal slides a-26/27/28: progress 38→67%(-83.5%) · 29→77%(-171%) · 35→69%(-92%) ── */
      document.querySelectorAll(".cam-box").forEach((box) => {
        const wrap = box.querySelector(".cam__wrap");
        const [k0, k1] = box.dataset.k.split(",").map(Number);
        const x = Number(box.dataset.x);
        if (!wrap || !x) return;
        scrubView(box, (tl) => {
          tl.set(wrap, { xPercent: 0 }, 0).to(wrap, { xPercent: x, duration: k1 - k0 }, k0);
        });
      });

      /* ── Strengths a-22: the gap between 6%→93% shrinks from 100%→0 as cells move left, and the heading slides out to -140% at 84→86% ── */
      const ben = document.querySelector(".ben");
      const track = ben.querySelector(".ben__track"), head = ben.querySelector(".ben__head");
      scrubView(ben, (tl) => {
        tl.fromTo(track, { x: 0 }, { x: () => -(track.scrollWidth - innerWidth), duration: 0.87 }, 0.06)
          .fromTo(head, { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: -140, duration: 0.02 }, 0.84);
      });
      // Headline change a-23/24 — around the middle of the benefits section (sensor 440vh) the first text vanishes in .3s and the second one appears
      const t1b = ben.querySelector(".ben__t1"), t2b = ben.querySelector(".ben__t2");
      ScrollTrigger.create({
        trigger: ben, start: () => "top+=" + innerHeight * 4.4 + " bottom",
        onEnter: () => { gsap.to(t1b, { opacity: 0, duration: 0.3, ease: "ease" }); gsap.to(t2b, { opacity: 1, duration: 0.3, ease: "ease" }); },
        onLeaveBack: () => { gsap.to(t1b, { opacity: 1, duration: 0.3, ease: "ease" }); gsap.to(t2b, { opacity: 0, duration: 0.3, ease: "ease" }); },
      });

      /* ── Estimate blur a-29/30: from 150vh of the estimate section, the background photo blurs 9px over 80vh ── */
      const est = document.querySelector(".cam-box--est");
      ScrollTrigger.create({ trigger: est, start: () => "top+=" + innerHeight * 1.5 + " bottom", end: () => "top+=" + innerHeight * 2.3 + " bottom", toggleClass: { targets: est, className: "is-blur" } });

      /* ── Demo circle a-15: when the sensor band (original sensor-maximize) 185vh below the section head appears, after .4s the side circles spread ±20em over 1s outQuart, and when it leaves (a-25) they return ── */
      const demo = document.querySelector(".demo");
      const rl = demo.querySelector(".round--l"), rr = demo.querySelector(".round--r");
      ScrollTrigger.create({
        trigger: demo, start: () => "top+=" + innerHeight * 1.85 + " bottom",
        onEnter: () => { gsap.to(rr, { x: "20em", duration: 1, delay: 0.4, ease: quart }); gsap.to(rl, { x: "-20em", duration: 1, delay: 0.4, ease: quart }); },
        onLeaveBack: () => gsap.to([rl, rr], { x: 0, duration: 0.5 }),
      });

      /* ── Footer a-70: when visible, two circles settle from -11em and the links · map rise into place from below in 1 second outCubic ── */
      const foot = document.querySelector(".foot");
      const fr = foot.querySelectorAll(".foot__rounds span:not(:first-child)");
      gsap.set(fr, { x: "-11em", opacity: 0 });
      gsap.set(foot.querySelector(".foot__map"), { y: "17em", opacity: 0 });
      gsap.set(foot.querySelector(".foot__links"), { y: "28em", opacity: 0 });
      gsap.set(foot.querySelector(".foot__logo"), { x: "10em", opacity: 0 });
      gsap.set(foot.querySelector(".foot__claim"), { y: "2em", opacity: 0 });
      ScrollTrigger.create({
        trigger: foot, start: "top 70%", once: true,
        onEnter: () => {
          gsap.to(fr, { x: 0, opacity: 1, duration: 1, ease: "cubic.out" });
          gsap.to([foot.querySelector(".foot__map"), foot.querySelector(".foot__links"), foot.querySelector(".foot__claim")], { y: 0, opacity: 1, duration: 1, ease: "cubic.out" });
          gsap.to(foot.querySelector(".foot__logo"), { x: 0, opacity: 1, duration: 1, ease: "cubic.out" });
        },
      });

      /* ── Left column: current section indicator ── */
      const links = [...document.querySelectorAll(".side__link")];
      [["#design", 0], ["#estimate", 1], ["#shop", 2]].forEach(([sel, i]) => {
        ScrollTrigger.create({ trigger: sel === "#design" ? ".cam-box--1" : sel, start: "top 50%", end: "bottom 50%", onToggle: (s) => s.isActive && links.forEach((l, j) => l.classList.toggle("is-on", j === i)) });
      });
    });
  }

  /* ── Ball parallax a-63: over that card, each ball moves a different distance by horizontal mouse position (0→100%: 5→7, 1→1.5, -3→-4em) ── */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    const card = document.querySelector(".g1--bottom");
    const balls = [...document.querySelectorAll(".balls i")];
    const range = [[5, 7], [1, 1.5], [-3, -4]];
    card?.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect(), p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      balls.forEach((b, i) => gsap.to(b, { x: (range[i][0] + (range[i][1] - range[i][0]) * p) * em(), duration: 0.5, ease: "power2.out", overwrite: true }));
    });
  }

  /* ── Day · night a-9/a-10: .5s outQuart ── */
  const day = document.querySelector(".slide--day");
  document.querySelectorAll("[data-day]").forEach((b) => b.addEventListener("click", () => {
    const isDay = b.dataset.day === "1";
    day.classList.toggle("is-night", !isDay);
    document.querySelectorAll("[data-day]").forEach((x) => x.classList.toggle("is-on", x === b));
  }));

  /* ── Estimate more a-11~13: the tapped tag turns yellow (.5s), only that card shows ── */
  const tags = [...document.querySelectorAll(".tag")], cards = [...document.querySelectorAll(".ecards .ecard")];
  tags.forEach((t, i) => t.addEventListener("click", () => {
    tags.forEach((x) => x.classList.toggle("is-on", x === t));
    cards.forEach((c, j) => c.classList.toggle("is-on", j === i));
  }));
  const rooms = [...document.querySelectorAll(".room")];
  rooms.forEach((r) => r.addEventListener("click", () => rooms.forEach((x) => x.classList.toggle("is-on", x === r))));
})();
