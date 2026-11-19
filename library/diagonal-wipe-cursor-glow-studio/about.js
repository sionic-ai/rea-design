// About — original AboutHero (the title’s top and bottom lines and the star frame follow the mouse’s horizontal position with lerp .025, photo cells share weight so the cell under the cursor becomes 42rem, .15 share each · quickTo .15s,
// During one screen pin the photo row rises off the top of the screen), Values (only the hovered row sharp · border glow), Team (orange panel pinned for 3 screens · title blurs · team photo 20×22rem · name row flows)
(() => {
  const ES = window.ES;
  const { q, qa, rem } = ES;
  const lerp = (a, b, t) => a + (b - a) * t;

  const heroRow = (hero, api) => {
    const top = q(".es-ahero-top", hero), bottom = q(".es-ahero-bottom", hero);
    const iconEl = q(".es-ahero-icon", hero);
    const icon = ES.icon(iconEl);
    const wrap = q(".es-ahero-images", hero), inner = q(".es-ahero-images-in", hero);
    const cols = qa(".es-ahero-col", hero);
    if (!ES.reduce) {
      api.intro.moveBlur(iconEl, {}, 0)
        .moveBlur([q(".es-ahero-tl", hero), q(".es-ahero-tr", hero)], { yPercent: 60 }, 0)
        .moveBlur(q(".es-ahero-bi", hero), { yPercent: 60 }, 0.1)
        .clip(cols.map((c) => q(".es-media", c)), { stagger: 0.05, duration: 1 }, 0.2);
    }
    if (ES.mobile || ES.reduce) return () => icon.lottie.destroy();

    // Original Site.mouse starts at 0,0 — before the cursor moves, the title sits to the left and the first column is wide
    const mouse = { x: 0 };
    const move = (e) => { mouse.x = e.clientX; };
    addEventListener("mousemove", move, { passive: true });
    const topSet = gsap.quickSetter(top, "x", "px"), bottomSet = gsap.quickSetter(bottom, "x", "px");
    let topOff = 0, botOff = 0, topX = 0, botX = 0, frame = 0, active = true, progress = 0;
    let n = cols.length, large = 0, gap = 0, w = 0, scale = 0, x0 = [], hs = [], anim = [], t = 0;
    const offsets = () => {
      topOff = innerWidth - top.offsetWidth;
      botOff = innerWidth - bottom.offsetWidth;
      large = rem(42); gap = rem(1);
      w = (innerWidth - rem(4) - large - gap * (n - 1)) / (n - 1);
      scale = large / w - 1;
      let x = 0;
      cols.forEach((c, k) => {
        c.style.width = `${w}px`;
        c.style.transformOrigin = "left center";
        hs[k] = c.offsetHeight;
        x0[k] = x;
        gsap.set(c, { x, scaleX: 1, scaleY: 1 });
        x += w + gap;
      });
      anim = cols.map((c) => ({
        x: gsap.quickTo(c, "x", { duration: 0.15, ease: "power1.out" }), y: gsap.quickTo(c, "y", { duration: 0.15, ease: "power1.out" }),
        sx: gsap.quickTo(c, "scaleX", { duration: 0.15, ease: "power1.out" }), sy: gsap.quickTo(c, "scaleY", { duration: 0.15, ease: "power1.out" }),
      }));
      layout(t, true);
    };
    const layout = (f, instant) => {
      const wts = cols.map((_, k) => Math.max(0, 1 - Math.abs(k - f)));
      const sum = wts.reduce((a, b) => a + b, 0), inv = sum > 0 ? 1 / sum : 0;
      let acc = 0;
      cols.forEach((c, k) => {
        const s = 1 + scale * (wts[k] * inv);
        const y = lerp(((1 - s) * hs[k]) / 2, ((s - 1) * hs[k]) / 2, progress);
        const x = x0[k] + w * acc;
        if (instant) gsap.set(c, { x, y, scaleX: s, scaleY: s });
        else { anim[k].x(x); anim[k].y(y); anim[k].sx(s); anim[k].sy(s); }
        acc += s - 1;
      });
    };
    offsets();
    const ro = new ResizeObserver(() => offsets());
    ro.observe(hero);
    ScrollTrigger.create({ trigger: hero, start: "top top", end: () => `+=${innerHeight * 1.4}`, onLeave: () => { active = false; }, onEnterBack: () => { active = true; } });
    gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: () => `+=${innerHeight}`, scrub: true, pin: wrap, pinSpacing: false, onUpdate: (st) => { progress = st.progress; } } })
      .to(inner, { y: () => -(innerHeight - rem(20)), duration: 1, ease: "none" });
    const loop = () => {
      if (!active) return;
      const pct = (mouse.x / innerWidth) * 100;
      topX = lerp(topX, (topOff / 100) * pct, 0.025);
      botX = lerp(botX, (botOff / 100) * pct, 0.025);
      frame = lerp(frame, ((icon.total - icon.frame * 3) / 100) * pct, 0.025);
      topSet(topX); bottomSet(botX); icon.go(frame);
      const focus = Math.max(0, Math.min(n - 1, (mouse.x / innerWidth) * (n - 1)));
      t += (focus - t) * 0.15;
      layout(t, false);
    };
    gsap.ticker.add(loop);
    return () => { gsap.ticker.remove(loop); removeEventListener("mousemove", move); ro.disconnect(); icon.lottie.destroy(); };
  };

  const values = (sec) => {
    const title = q(".es-mv-title", sec);
    const lines = new SplitText(title, { type: "lines", linesClass: "es-split-line" }).lines;
    if (!ES.reduce) gsap.timeline({ scrollTrigger: { trigger: title, start: "bottom+=20% bottom" } }).moveBlur(lines, { yPercent: 40 });
    ES.text(q(".es-mv-mission-text", sec));
    const items = qa(".es-value", sec);
    items.forEach((v) => {
      const num = q(".es-value-number", v);
      num.innerHTML = [...num.textContent.trim()].map((c) => `<span>${c}</span>`).join("");
      if (!ES.mobile) ES.splitLines(q(".es-value-text", v));
      v.addEventListener("mouseenter", () => items.forEach((o) => { o.classList.toggle("is-active", o === v); o.classList.toggle("is-inactive", o !== v); }));
      v.addEventListener("mouseleave", () => items.forEach((o) => { o.classList.remove("is-inactive"); o.classList.add("is-active"); }));
    });
  };

  const team = (sec) => {
    const members = qa(".es-member", sec);
    const title = q(".es-team-title", sec);
    if (ES.mobile || ES.reduce) {
      ES.title(title);
      members.forEach((m) => ScrollTrigger.create({ trigger: m, start: "top center", end: "bottom center", toggleClass: "is-active" }));
      return;
    }
    const H = () => innerHeight;
    const N = members.length, rowH = rem(11), extra = rem(22) + rem(39.6);
    const re = () => H() * 5, se = () => rowH * N + extra;
    gsap.set(sec, { height: () => re() + se() + H() * 0.2 });
    gsap.timeline({ scrollTrigger: { trigger: q(".es-team-bg", sec), start: "top top", end: () => `+=${H() * 3}`, scrub: true, pin: true, pinSpacing: false } });
    gsap.timeline({ scrollTrigger: { trigger: q(".es-team-title-wrap", sec), start: "center center", end: () => `+=${H() * 3.6}`, scrub: true, pin: true, pinSpacing: false } })
      .fromTo(title, { y: () => H() * -0.3 }, { y: 0, ease: "power1.out", duration: 0.6 }, 0)
      .to(title, { autoAlpha: 0, "--blur": "1rem", ease: "power3.out", duration: 0.6 }, 0.35);
    const intro = q(".es-team-intro", sec), wrap = q(".es-team-members-wrap", sec), img = q(".es-team-intro-image", sec), list = q(".es-team-members", sec), inner = q(".es-team-members-in", sec);
    const step = 4 / N, start = 3;
    let index = -1;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: q(".es-team-inner", sec), start: "top top", end: () => `+=${re() + se()}`, scrub: true, pin: true, pinSpacing: false, invalidateOnRefresh: true },
      defaults: { overwrite: "auto" },
      onUpdate: () => {
        const k = Math.max(0, Math.min(N - 1, Math.round(((tl.time() - start) / 4) * N)));
        if (k !== index) { index = k; members.forEach((m, j) => m.classList.toggle("is-active", j === k)); }
      },
    })
      .fromTo([intro, wrap], { y: () => H() }, { y: 0, ease: "power1.out", duration: 1.5 }, 0)
      .to(img, { width: "20rem", height: "22rem", ease: "power1.inOut", duration: 2 }, 1)
      .fromTo(wrap, { clipPath: "inset(105vh 0 0 0)" }, { clipPath: "inset(0vh 0 0 0)", ease: "power1.out", duration: 2 }, 1)
      .add(() => ES.nav.theme("light"), 2.49).add(() => ES.nav.theme("dark"), 2.5)
      .to(img, { autoAlpha: 0, duration: 0.3 }, 2.6)
      .to(wrap, { y: () => -((H() - rem(49.2)) * 0.5 + list.offsetHeight - H() - rem(1)), duration: 4, ease: "none" }, 3)
      .to(inner, { y: () => `-=${H() * 2}`, duration: 3, ease: "none" }, 7);
    const le = start + (N - 1) * step;
    tl.fromTo(q(".es-team-grid-1", sec), { height: 0 }, { height: "50%", duration: 1 }, le)
      .fromTo(q(".es-team-grid-2", sec), { width: 0 }, { width: "100%", ease: "power1.inOut", duration: 1.5 }, le)
      .fromTo(q(".es-team-grid-3", sec), { y: -rem(41.6) }, { y: 0, duration: 1 }, le);
  };

  ES.pages.about = (root, api) => {
    const offs = [];
    offs.push(heroRow(q(".es-ahero", root), api));
    ES.title(q(".es-ainfo-title", root));
    ES.title(q(".es-ainfo-text", root), { yPercent: 40, filter: "blur(1rem)", stagger: 0.07 });
    const im = q(".es-ainfo-media", root);
    if (!ES.reduce) gsap.timeline({ scrollTrigger: { trigger: im, start: "top bottom", end: "bottom top", scrub: true } }).fromTo(q(".es-media-inner", im), { height: "140%", yPercent: -40 }, { yPercent: 0, ease: "none" });
    values(q(".es-mv", root));
    team(q(".es-team", root));
    offs.push(ES.testimonials(q(".es-testimonials", root)));
    return { destroy: () => offs.forEach((f) => f && f()) };
  };
})();
