// Investor About — hero parallax, sand and navy section words, masked photo reveal, 10-screen pinned business list
(() => {
  if (!window.gsap) return;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    BA.subHero(document.querySelector(".sub-hero"));
    // Original Static: at 80% of the screen, words rise from 1rem below with a .05 stagger over .5s, and masked photos go 1.1→1 over 1.2s with a .7 stagger (power1.out)
    $$(".ab-static").forEach((sec) => {
      const words = new SplitText($$(".ab-anim", sec), { type: "words" }).words;
      gsap.fromTo(words, { opacity: 0, y: "1rem" }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power1.out", scrollTrigger: { trigger: sec, start: "top 80%" } });
      gsap.fromTo($$(".ab-mask", sec), { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1.2, stagger: 0.7, ease: "power1.out", scrollTrigger: { trigger: sec, start: "top 80%" } });
    });
  });
  mm.add("(min-width: 1121px) and (prefers-reduced-motion: no-preference)", () => {
    // Original Projects: pinned for 10 screens, picks the cell by progress share × number of projects, and on each change text·number .8s, photo width 0↔100% toward the incoming side .8s power1.inOut
    const wrap = document.querySelector(".ab-proj__wrap");
    const texts = $$(".ab-proj__content", wrap), imgs = $$(".ab-proj__img", wrap), nums = $$(".ab-proj__nums span", wrap);
    gsap.set(texts, { opacity: 0, y: "1rem" }); gsap.set(texts[0], { opacity: 1, y: 0 });
    gsap.set(imgs, { width: 0 }); gsap.set(imgs[0], { width: "100%" });
    gsap.set(nums, { opacity: 0, y: "1rem" }); gsap.set(nums[0], { opacity: 1, y: 0 });
    let cur = 0;
    gsap.timeline({
      scrollTrigger: {
        trigger: wrap, start: "top top", pin: true, scrub: true, end: () => `+=${10 * innerHeight}`, invalidateOnRefresh: true,
        onUpdate: (st) => {
          const k = Math.min(texts.length - 1, Math.floor(st.progress * texts.length));
          if (k === cur) return;
          const down = k > cur, a = imgs[cur], b = imgs[k];
          gsap.to(texts[cur], { opacity: 0, y: "1rem", duration: 0.8 });
          gsap.to(texts[k], { opacity: 1, y: 0, duration: 0.8 });
          if (down) { gsap.set(a, { left: 0, right: "auto", zIndex: 0 }); gsap.set(b, { left: "auto", right: 0, zIndex: 1 }); }
          else { gsap.set(a, { left: "auto", right: 0, zIndex: 0 }); gsap.set(b, { left: 0, right: "auto", zIndex: 1 }); }
          gsap.to(a, { width: 0, ease: "power1.inOut", duration: 0.8 });
          gsap.to(b, { width: "100%", ease: "power1.inOut", duration: 0.8 });
          gsap.to(nums[cur], { opacity: 0, y: down ? "-1rem" : "1rem", duration: 0.8 });
          gsap.fromTo(nums[k], { opacity: 0, y: down ? "1rem" : "-1rem" }, { opacity: 1, y: 0, duration: 0.8 });
          cur = k;
        },
      },
    }).to(".ab-proj__fill", { width: "100%", ease: "none" });
  });
})();
