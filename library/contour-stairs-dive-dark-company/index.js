// Hero entrance → contour dive (two beats tied to spots on the camera path pass by) → principles title pinned → stairs light up again at the Footer
(() => {
  const S = window.tpSite;
  const gl = document.querySelector(".tp-webgl");
  const hero = document.querySelector(".tp-hero");
  const header = document.querySelector(".tp-header");
  if (!S || !hero) return;
  const mm = gsap.matchMedia();

  // After 0.5s: header line from −50 above, title words from 150 on the right with .1 stagger, subtitle lines from 100 with .075 stagger (after .5), bottom line from 50 below — all 1s joe.out.
  // Canvas turns on at .5s at the same time and the camera reaches its first position in 3s. Scroll is released when done.
  const title = hero.querySelector(".tp-hero__title"), tag = hero.querySelector(".tp-hero__tag"), foot = hero.querySelector(".tp-hero__foot");
  const intro = () => {
    if (S.reduce) {
      gsap.set([hero, header], { visibility: "visible" });
      gl?.dispatchEvent(new CustomEvent("fx:go"));
      return;
    }
    const words = new SplitText(title, { type: "words" }), lines = new SplitText(tag, { type: "lines" });
    gsap.timeline({ defaults: { ease: "joe.out" }, delay: 0.5, onStart: () => { hero.style.visibility = "visible"; }, onComplete: () => { words.revert(); lines.revert(); S.lenis?.start(); } })
      .fromTo(header, { y: -50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1 }, 0)
      .fromTo(words.words, { x: 150, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1, stagger: 0.1 }, 0)
      .fromTo(lines.lines, { x: 100, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1, stagger: 0.075 }, 0.5)
      .fromTo(foot, { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1 }, 0.5)
      .fromTo(gl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
      .call(() => gl?.dispatchEvent(new CustomEvent("fx:go")), null, "<");
  };
  scrollTo(0, 0);
  history.scrollRestoration = "manual";
  // The original opens after the assets (art, Theatre state) are loaded — it waits for the typeface but no longer than 1.1s (if an external font is late, the first scene slips by over 2s)
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1100))]).then(() => requestAnimationFrame(intro));

  // Text tied to spots along the road: the Hero fades out at 2.0→2.7, and for the two phrases the words enter from −50 on the left at .05 intervals with expo.out and leave to 50 on the right with power2.in
  const seg = (pos, a, b) => Math.max(0, Math.min(1, (pos - a) / (b - a)));
  const heroHide = gsap.to(hero, { autoAlpha: 0, duration: 1, paused: true, immediateRender: false });
  const titles = [...document.querySelectorAll(".tp-dive-title")].map((box) => {
    const split = new SplitText(box.querySelector("h2"), { type: "words" });
    const show = gsap.from(split.words, { x: -50, autoAlpha: 0, duration: 1, stagger: 0.05, ease: "expo.out", paused: true, onStart: () => gsap.set(box, { autoAlpha: 1 }) });
    const hide = gsap.to(split.words, { x: 50, autoAlpha: 0, duration: 1, stagger: 0.05, ease: "power2.in", paused: true, immediateRender: false });
    const [sa, sb] = box.dataset.show.split(",").map(Number), [ha, hb] = box.dataset.hide.split(",").map(Number);
    return { box, show, hide, sa, sb, ha, hb };
  });
  let lastPos = -1;
  gl?.addEventListener("fx:seq", (e) => {
    const p = e.detail.pos;
    if (Math.abs(p - lastPos) < 1e-4) return;
    lastPos = p;
    if (p >= 2) heroHide.progress(seg(p, 2, 2.7));
    titles.forEach((t) => {
      const shown = seg(p, t.sa, t.sb), gone = seg(p, t.ha, t.hb);
      if (gone > 0) { t.show.progress(1); t.hide.progress(gone); gsap.set(t.box, { autoAlpha: gone < 1 ? 1 : 0 }); }
      else { t.hide.progress(0); t.show.progress(shown); gsap.set(t.box, { autoAlpha: shown > 0 ? 1 : 0 }); }
    });
  });

  // Stair panel: the dive-end marker fades while moving from 50% of the screen bottom to touching the top, and the footer marker turns back on with sine.inOut while passing from 40% to 85% from the bottom.
  // The shade behind the header line darkens as the dive ends and clears at the Footer
  const bg = document.querySelector(".tp-header__bg");
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.to(gl, { autoAlpha: 0, ease: "none", immediateRender: false, scrollTrigger: { trigger: "#tp-dive-end", start: "top bottom-=50%", end: "top bottom-=100%", scrub: true } });
    gsap.to(gl, { autoAlpha: 1, ease: "sine.inOut", immediateRender: false, scrollTrigger: { trigger: "#tp-foot-start", start: "top bottom-=40%", end: "top bottom-=85%", scrub: true } });
    gsap.to(bg, { autoAlpha: 1, ease: "none", scrollTrigger: { trigger: "#tp-dive-end", scrub: true } });
    gsap.to(bg, { autoAlpha: 0, ease: "none", immediateRender: false, scrollTrigger: { trigger: "#tp-foot-start", scrub: true } });
  });

  // Principle: the large title enters line by line from x 100 at .075 intervals over 2.5s joe.inOut, and stays pinned at 20% from the top of the screen while the list passes (1024 and up)
  const wrap = document.querySelector(".tp-principles__wrap"), ptitle = document.querySelector(".tp-principles__title"), plist = document.querySelector(".tp-principles__list");
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    document.fonts.ready.then(() => {
      const lines = new SplitText(ptitle, { type: "lines" });
      gsap.from(lines.lines, { x: 100, autoAlpha: 0, stagger: 0.075, duration: 2.5, ease: "joe.inOut", scrollTrigger: { trigger: wrap, start: "top bottom-=15%" }, onComplete: () => lines.revert() });
    });
    ScrollTrigger.create({ trigger: plist, start: "top top+=20%", end: () => `+=${plist.clientHeight - ptitle.clientHeight}`, pin: wrap, pinType: "fixed", invalidateOnRefresh: true });
  });

  // Footer: after the border is drawn, top right → link row (.075 stagger) → contact rise in order from 30 below
  const footer = document.querySelector(".tp-footer");
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    const pick = (n) => footer.querySelectorAll(`[data-stagger="${n}"]`);
    gsap.timeline({ scrollTrigger: { trigger: footer, start: "top 80%" }, delay: 1.5 })
      .fromTo(pick(1), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: "joe.out", duration: 1 }, 0.25)
      .fromTo(pick(2), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.075, ease: "joe.out", duration: 1 }, "<+=0.1")
      .fromTo(pick(3), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.075, ease: "joe.out", duration: 1 }, "<+=0.1");
  });
})();
