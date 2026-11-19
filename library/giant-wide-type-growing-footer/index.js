/* Home motion — original values: Hero (after .2s) photo stack 0→1.4 .8s power4.out, 1.4→1 at 1.2s · two title letters y ±200%·scaleY 3→1 .8s merging from the center in .2s ·
   Side text letters transparent→ .8s · intro letters .01 stagger scrub .8 (top 80% → bottom 60%) · shutter 1.6s expo.out .2 stagger (last panel power4.out), bottom photo hidden after 2.6s ·
   The three cells unfold from top 75% to bottom 25% */
(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const media = document.querySelector("[data-hero-media]");
    const top = new SplitText("[data-hero-top]", { type: "chars", mask: "chars" });
    const bottom = new SplitText("[data-hero-bottom]", { type: "chars", mask: "chars" });
    const base = new SplitText("[data-hero-base]", { type: "chars" });
    const tl = gsap.timeline({ delay: 0.2, paused: true });
    tl.set(media, { scale: 0 }, 0).set(top.chars, { yPercent: 200, scaleY: 3 }, 0).set(bottom.chars, { yPercent: -200, scaleY: 3 }, 0).set(base.chars, { opacity: 0 }, 0);
    // Like the original, the first image is the end state, and once the document is complete it is reset to the start state and begins
    window.LR.whenComplete(() => tl.restart(true));
    const e = { duration: 0.8, ease: "power4.out", immediateRender: false };
    tl.fromTo(media, { scale: 0 }, { scale: 1.4, ...e }, 0)
      .fromTo(base.chars, { opacity: 0 }, { opacity: 1, stagger: { amount: 0.2, from: "center" }, ...e }, 1.2)
      .fromTo(media, { scale: 1.4 }, { scale: 1, ...e }, 1.2)
      .fromTo(top.chars, { yPercent: 200, scaleY: 3 }, { yPercent: 0, scaleY: 1, stagger: { amount: 0.2, from: "center" }, ...e }, 1.2)
      .fromTo(bottom.chars, { yPercent: -200, scaleY: 3 }, { yPercent: 0, scaleY: 1, stagger: { amount: 0.2, from: "center" }, ...e }, 1.2);

    const what = document.querySelector("[data-what]");
    if (what) {
      const s = new SplitText(what, { type: "words,chars", mask: "chars", wordsClass: "lr-word" });
      gsap.from(s.chars, { opacity: 0, stagger: 0.01, ease: "none", scrollTrigger: { trigger: what, start: "top 80%", end: "bottom 60%", scrub: 0.8 } });
    }

    const wrap = document.querySelector("[data-shutter]");
    if (wrap) {
      const items = [...wrap.children];
      const st = items.map(() => ({ s: 0 }));
      const apply = () => items.forEach((it, i) => it.style.setProperty("--s", st[i].s));
      const stl = gsap.timeline({ paused: true, onUpdate: apply });
      st.forEach((o, i) => stl.to(o, { s: 1, duration: 1.6, ease: i === st.length - 1 ? "power4.out" : "expo.out" }, i * 0.2));
      stl.set(items.slice(0, -1), { autoAlpha: 0 }, 2.6);
      ScrollTrigger.create({ trigger: wrap, start: "top bottom", end: "top 70%", onLeave: () => stl.play(), onLeaveBack: () => { stl.pause(0); apply(); } });
    }
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.querySelectorAll(".shutter__item").forEach((it) => it.style.setProperty("--s", 1));
  });

  document.querySelectorAll("[data-trip]").forEach((card) => {
    ScrollTrigger.create({ trigger: card, start: "top 75%", end: "bottom 25%", toggleClass: "is-on" });
  });
})();
