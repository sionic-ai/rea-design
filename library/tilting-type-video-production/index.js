// Home: Hero parallax · statement line pinned stacking · work card cover stacking · client logo flow · service hover transition.
// Original value: Hero video y = height/4 × (min(width,1440)/1440) scrub · line photo off .2s · card enters 1.25→1, when covered 1→.75 + transparent (scrub, no curve)
// Service video window inset center→0 · inner .75→1 over 1s expo.inOut (picking one plays the video from the start), description line .8s after a .6s delay, the other titles .1
(() => {
  const { rem, isXL } = SD;
  const root = document.documentElement;
  const first = document.querySelector("[data-cl-first]");
  const setL0 = () => root.style.setProperty("--l0", `${first.offsetHeight + rem(3)}px`);
  setL0();
  addEventListener("resize", setL0);
  document.fonts.ready.then(() => { setL0(); ScrollTrigger.refresh(); });

  // One set of client logo cells — flow and cloning are handled by the boost-drag-rows part
  document.querySelectorAll("[data-track]").forEach((t, k) => {
    t.innerHTML = Array.from({ length: 8 }, (_, i) => `<div class="clients__item"><span class="wf-logo">Client logo ${k * 8 + i + 1}</span></div>`).join("");
  });

  const mm = gsap.matchMedia();
  mm.add({ xl: "(min-width: 1200px)", tall: "(min-height: 600px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    const { xl, tall, motion } = ctx.conditions;
    if (!motion) return;

    // Hero parallax
    const cm = document.querySelector(".cover__media");
    const vid = cm.querySelector(".cover__vid");
    gsap.to(vid, { y: () => (cm.offsetHeight / 4) * (Math.min(innerWidth, 1440) / 1440), ease: "none", scrollTrigger: { trigger: cm, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });

    // Manifesto — pinned on desktop only, raising lines one by one
    const content = document.querySelector("[data-cover-copy]");
    const btn = document.querySelector("[data-cover-btn]");
    if (xl) {
      const lines = [...document.querySelectorAll("[data-cl]")].map((el) => {
        const text = el.querySelector(".cl-text");
        const thumbs = [...el.querySelectorAll(".cl-thumb")];
        const chars = SD.splitChars(text);
        const left = thumbs.slice(0, 3), right = thumbs.slice(3);
        return { el, thumbs, seq: [...left, ...chars, ...right] };
      });
      const stack = document.querySelector(".cl-stack");
      root.style.setProperty("--lh", `${lines[0].el.offsetHeight}px`);
      lines.forEach((l) => gsap.set(l.seq, { autoAlpha: 0, rotateX: 90, transformOrigin: "bottom" }));
      let cur = -1;
      const show = (i) => {
        const tl = gsap.timeline();
        if (cur > -1 && lines[cur].thumbs.length) gsap.killTweensOf(lines[cur].thumbs);
        if (cur > -1 && lines[cur].thumbs.length) tl.to(lines[cur].thumbs, { autoAlpha: 0, duration: 0.2, ease: "alpha", overwrite: "auto" });
        gsap.killTweensOf(lines[i].seq);
        gsap.set(lines[i].seq, { autoAlpha: 0, rotateX: 90 });
        SD.riseIn(lines[i].seq, "<", tl);
        cur = i;
      };
      const hide = () => {
        gsap.killTweensOf(lines[cur].seq);
        gsap.to(lines[cur].seq, { autoAlpha: 0, duration: 0.2, ease: "alpha" });
        cur -= 1;
      };
      const steps = lines.length - 1;
      const travel = () => lines.slice(0, -1).reduce((s, l) => s + l.el.offsetHeight, 0);
      ScrollTrigger.create({
        trigger: ".cl-pin",
        start: "top top",
        end: () => `+=${steps * innerHeight * 0.45}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        animation: gsap.fromTo(stack, { y: 0 }, { y: () => -travel(), ease: "none" }),
        onUpdate: (self) => {
          const want = self.progress <= 0 && self.direction < 0 ? -1 : Math.round(self.progress * steps);
          while (cur < want) show(cur + 1);
          while (cur > want) hide();
        },
        onLeaveBack: () => { while (cur > -1) hide(); },
      });
      ScrollTrigger.create({ trigger: ".cl-pin", start: "top top", onEnter: () => cur < 0 && show(0) });
      [content, btn].forEach((el) => {
        gsap.set(el, { autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: el, start: "center center",
          onEnter: () => gsap.to(el, { autoAlpha: 1, duration: 0.4, ease: "alpha", overwrite: true }),
          onLeaveBack: () => gsap.to(el, { autoAlpha: 0, duration: 0.2, ease: "alpha", overwrite: true }),
        });
      });
    }

    // Work header — ‹Work› rises letter by letter, the three lines on the right each come in .1s later
    const wt = document.querySelector("[data-works-title]");
    const tlChars = SD.splitChars(wt.querySelector(".works__tl"));
    const trLines = SD.splitChars(wt.querySelector(".works__tr")) && wt.querySelector(".works__tr")._lines;
    SD.riseSet([...tlChars, ...trLines]);
    const ttl = gsap.timeline({ paused: true });
    SD.riseIn(tlChars, 0, ttl);
    trLines.forEach((ln, i) => ttl.to(ln, { autoAlpha: 1, duration: 0.4, ease: "alpha" }, i * 0.1 + 0.2).to(ln, { rotateX: 0, duration: 0.8, ease: "expo.out" }, "<"));
    ScrollTrigger.create({ trigger: ".works__stack", start: xl ? "top top" : "top center", onEnter: () => ttl.play() });

    // Work card stacking — position measured as distance from the top of the group, like the original (cards are sticky so their own position can’t be trusted)
    const works = [...document.querySelectorAll("[data-work]")];
    const at = (i) => wt.offsetHeight + works.slice(0, i).reduce((s, w) => s + w.offsetHeight, 0);
    if (xl && tall) {
      const st = document.querySelector(".works__stack");
      gsap.to(wt, { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: st, start: () => `${wt.offsetHeight}px bottom`, end: () => `${wt.offsetHeight}px center`, scrub: true, invalidateOnRefresh: true } });
      works.forEach((w, i) => {
        const inner = w.querySelector(".work__in");
        gsap.fromTo(inner, { scale: 1.25 }, { scale: 1, ease: "none", immediateRender: false, scrollTrigger: { trigger: st, start: () => `${at(i)}px bottom`, end: () => `${at(i)}px top`, scrub: true, invalidateOnRefresh: true } });
        if (i < works.length - 1)
          gsap.fromTo(inner, { scale: 1, autoAlpha: 1 }, { scale: 0.75, autoAlpha: 0, ease: "none", immediateRender: false, scrollTrigger: { trigger: st, start: () => `${at(i)}px top`, end: () => `${at(i + 1)}px top`, scrub: true, invalidateOnRefresh: true } });
      });
    }

    // Work video — plays from when the card enters from below until it touches the top (the last card until the end of the group). On phones, each card has its own span
    works.forEach((w, i) => {
      const v = w.querySelector("video");
      if (!v) return;
      const deskStack = xl && tall;
      const total = () => at(works.length);
      ScrollTrigger.create({
        trigger: deskStack ? ".works__stack" : w,
        start: () => (deskStack ? `${at(i)}px bottom` : "top bottom"),
        end: () => (deskStack ? `${i === works.length - 1 ? total() : at(i)}px top` : "bottom top"),
        invalidateOnRefresh: true,
        onToggle: (s) => (s.isActive ? SD.vidPlay(v) : SD.vidPause(v)),
      });
    });

    // Services — hover a title to switch steps
    if (xl) {
      const ts = [...document.querySelectorAll("[data-svc]")];
      const ms = [...document.querySelectorAll("[data-svc-m]")];
      const cs = [...document.querySelectorAll("[data-svc-c]")];
      let on = -1;
      const lines = cs.map((c) => SD.lines(c));
      gsap.set([...ms, ...cs], { autoAlpha: 0 });
      // Original setActiveService: the photo window opens from the center with a 1s expo.inOut, its inside going .75→1, the description panel turns on right away, and the line shows through .8s after a .6s wait
      const go = (i, now) => {
        if (i === on) return;
        const d = now ? 0 : 1;
        if (on > -1) {
          gsap.to([ms[on], cs[on]], { autoAlpha: 0, duration: 0.2 * d, ease: "alpha", overwrite: "auto" });
          const pv = ms[on].querySelector("video");
          pv && SD.vidPause(pv);
        }
        const nv = ms[i].querySelector("video");
        nv && SD.vidPlay(nv, true);
        const box = ms[i].querySelector(".svc__mi");
        const r = ms[i].getBoundingClientRect();
        gsap.set(ms[i], { autoAlpha: 1, overwrite: "auto" });
        if (!now) {
          gsap.set(box, { clipPath: `inset(${r.height / 2}px ${r.width / 2}px round 1rem)` });
          gsap.set(box.firstElementChild, { scale: 0.75 });
        }
        gsap.to(box, { clipPath: "inset(0px 0px round 1rem)", duration: 1 * d, ease: "expo.inOut" });
        gsap.to(box.firstElementChild, { scale: 1, duration: 1 * d, ease: "expo.inOut" });
        gsap.killTweensOf(lines[i]);
        gsap.set(cs[i], { autoAlpha: 1, overwrite: "auto" });
        if (now) gsap.set(lines[i], { autoAlpha: 1 });
        else SD.linesIn(lines[i], 0.6, gsap.timeline().set(lines[i], { autoAlpha: 0 }));
        ts.forEach((t, k) => gsap.to(t, { autoAlpha: k === i ? 1 : 0.1, duration: 0.4 * d, ease: "alpha", overwrite: "auto" }));
        on = i;
      };
      ts.forEach((t, i) => {
        t.addEventListener("mouseenter", () => go(i));
        t.addEventListener("mouseleave", () => go(0));
      });
      go(0, true);
    }
  });

  ScrollTrigger.sort();
  ScrollTrigger.refresh();
})();
