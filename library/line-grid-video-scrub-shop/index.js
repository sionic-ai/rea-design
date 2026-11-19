// Home (original home-scroll): on load the hero photo focus settles from 32% → 40% (1.5s, M0,0 C.25,.1 .25,1 1,1) and the certification badge rises with a .5s overlap,
// Wordmark letters rise from 205px below at .05s stagger (.8s). At 1024↑ the hero flows late at .85 speed, and three pinned sections are tied to scroll.
(() => {
  // Video length (original default — actual length arrives via loadedmetadata), the 3rd video stops at frame 72 of 154 to turn on the caption line
  const S3 = { duration: 6, pause: 72, end: 154 }, S5 = { duration: 14 };
  const ready = (v, d) => new Promise((r) => {
    if (v.readyState >= 1) return r(v.duration || d);
    v.addEventListener("loadedmetadata", () => r(v.duration || d), { once: true });
    setTimeout(() => r(d), 3000);
  });

  PV.page("home", (el) => {
    const $ = (s) => el.querySelector(s), $$ = (s) => [...el.querySelectorAll(s)];
    const hero = $("[data-hero]"), heroD = $("[data-hero-d]"), shift = $("[data-hero-shift]"), heroM = $("[data-hero-m] .pv-hero__img");
    const badge = $("[data-badge]"), chars = $$(".pv-hero__ch > span");
    document.documentElement.classList.add("pv-ready");
    const offs = [];
    // Original performSplit: splits lines with SplitText and wraps each line in a mask (lines are .pv-li — CSS places them below 100%)
    const splits = $$("[data-split]").map((n) => SplitText.create(n, { type: "lines", mask: "lines", linesClass: "pv-li" }));
    offs.push(() => splits.forEach((s) => s.revert()));

    if (PV.reduce) {
      gsap.set([...chars, badge], { y: 0, opacity: 1 });
      gsap.set(el.querySelectorAll(".pv-li"), { y: 0 });
      return () => offs.forEach((f) => f && f());
    }

    // ── On Load ──
    if (innerWidth < PV.DESK) {
      gsap.timeline().fromTo(heroM, { y: 60 }, { duration: 1.5, y: 0 }).to(badge, { duration: 1, opacity: 1, y: 0 }, "-=0.5");
    } else {
      const over = () => Math.max(0, shift.offsetHeight - hero.offsetHeight);
      gsap.timeline()
        .fromTo(shift, { y: () => -0.32 * over() }, { duration: 1.5, ease: "pv", y: () => -0.4 * over() })
        .to(badge, { duration: 1, opacity: 1, y: 0 }, "-=0.5");
    }
    gsap.fromTo(chars, { y: 205 }, { duration: 0.8, stagger: 0.05, y: 0 });

    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${PV.DESK}px)`, () => {
      if (PV.smoother) PV.smoother.effects(heroD, { speed: 0.85, lag: 0 });
      gsap.timeline({ scrollTrigger: { trigger: hero, start: "top+=30% top", end: "bottom top", scrub: true } }).to(heroD, { ease: "none", opacity: 0.6 });

      // 1: the panel pauses once and expands to screen width, then the lines rise and the footnote lights up
      const panel = $("[data-s1-panel]");
      gsap.timeline({ scrollTrigger: { trigger: $("[data-s1]"), start: "top top", end: "bottom bottom", pin: $("[data-s1-wrap]"), scrub: true, invalidateOnRefresh: true } })
        .to(panel, { duration: 1 })
        .to(panel, { duration: 1, width: "100%" })
        .to(panel, { duration: 0, borderLeftColor: "transparent" })
        .to($$("[data-s1-text] .pv-li"), { duration: 1, y: 0, stagger: 0.2 })
        .to($$("[data-s1-big1] .pv-li"), { duration: 1, stagger: 0.4, y: 0 })
        .to($$("[data-s1-big2] .pv-li"), { duration: 1, stagger: 0.4, y: 0 })
        .to($("[data-s1-ref]"), { duration: 1, opacity: 1 })
        .to(panel, { duration: 1 });

      // 3: pushes the video to 72/154 and turns on three callout lines in turn (line 8.06vw · title · row), then erases them and pushes to the end
      const v3 = $("[data-s3-video]"), ptrs = $$("[data-ptr]"), icon = $("[data-s3-icon]");
      ready(v3, S3.duration).then((dur) => {
        if (!el.isConnected) return;
        v3.currentTime = 0;
        const tl = gsap.timeline({ scrollTrigger: { trigger: $("[data-s3]"), start: "top top", end: "bottom bottom", pin: $("[data-s3-wrap]"), scrub: true } })
          .to(v3, { duration: 4, ease: "none", currentTime: dur * (S3.pause / S3.end) });
        ptrs.forEach((p) => {
          tl.to(p.querySelector("[data-ptr-line]"), { duration: 1, opacity: 1, width: "8.0555555556vw" })
            .to(p.querySelector("[data-ptr-title]"), { duration: 1, y: 0 }, "<")
            .to(p.querySelectorAll("[data-ptr-lines] .pv-li"), { delay: 1.2, duration: 1, y: 0, stagger: 0.2 }, "<");
        });
        tl.to(icon, { opacity: 1, stagger: 0.1, y: 0 })
          .to(ptrs[0], { delay: 5, duration: 1, opacity: 0, pointerEvents: "none" })
          .to(ptrs[1], { duration: 1, opacity: 0, pointerEvents: "none" }, "<")
          .to(ptrs[2], { duration: 1, opacity: 0, pointerEvents: "none" }, "<")
          .to(icon, { opacity: 0, y: 0 }, "<")
          .to(v3, { duration: 12, ease: "none", currentTime: dur });
        ScrollTrigger.refresh();
      });

      // 5: the water video runs to the end over 100 frames, meanwhile two paragraphs rise in (10) and go out (5)
      const v5 = $("[data-s5-video]"), water = $("[data-s5-water]"), ind = $("[data-s5-industry]");
      ready(v5, S5.duration).then((dur) => {
        if (!el.isConnected) return;
        v5.currentTime = 0;
        gsap.timeline({ scrollTrigger: { trigger: $("[data-s5]"), start: "top top", end: "bottom bottom", pin: $("[data-s5-wrap]"), scrub: true } })
          .to(v5, { duration: 100, ease: "none", currentTime: dur })
          .to(water.querySelectorAll(".pv-li"), { duration: 10, pointerEvents: "auto", y: 0 }, "<+=0")
          .to(water, { duration: 5, opacity: 0, pointerEvents: "none" }, "<+=30")
          .to(ind.querySelectorAll(".pv-li"), { duration: 10, pointerEvents: "auto", y: 0 }, "<+=5")
          .to(ind, { duration: 5, opacity: 0, pointerEvents: "none" }, "<+=30");
        ScrollTrigger.refresh();
      });
    });
    // Phone: the big number row rises once when it is the only thing visible, and the Section 3 video plays once at double speed when visible
    mm.add(`(max-width: ${PV.DESK - 1}px)`, () => {
      gsap.timeline({ scrollTrigger: { trigger: $("[data-s1-big1]"), start: "center bottom" } })
        .to($$("[data-s1-big1] .pv-li"), { duration: 0.6, stagger: 0.2, y: 0 })
        .to($$("[data-s1-big2] .pv-li"), { duration: 0.6, stagger: 0.2, y: 0 }, "<+=0.5");
      const v3 = $("[data-s3-video]");
      ScrollTrigger.create({ trigger: v3, start: "center bottom", once: true, onEnter: () => { v3.playbackRate = 2; v3.play().catch(() => {}); } });
      offs.push(PV.imageScroll($(".pv-iscroll.is-mobile")));
    });
    offs.push(() => mm.revert());
    return () => offs.forEach((f) => f && f());
  });
})();
