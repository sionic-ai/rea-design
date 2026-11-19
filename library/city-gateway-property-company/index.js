// First page — three big title blocks gather from anywhere within ±300px left and right (2.4s expo.out), and pressing the fork door adds the hero entrance to the same timeline (original c-hero-title·c-portail values)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const k = reduce ? 0 : 1;
  const words = [...document.querySelectorAll(".cm-hero__title > span")];
  const title = gsap.timeline({ paused: !!window.cmIntro, defaults: { duration: 2.4 * k, ease: "expo.out" } });
  if (words.length) {
    gsap.set(words, { opacity: 0 });
    title.fromTo(words, { x: () => gsap.utils.random(-300, 300) * k, opacity: 0 }, { x: 0, opacity: 1 });
  }

  const gate = document.querySelector(".cm-portal");
  gate?.addEventListener("fx:open", (e) => {
    const { tl } = e.detail;
    const hero = document.querySelector(".cm-hero");
    const header = document.querySelector(".cm-header");
    const visual = hero?.querySelector(".cm-hero__bg");
    const content = hero ? [...hero.querySelectorAll(".cm-hero__figures > *")] : [];
    const line = hero?.querySelector(".cm-line");
    // The ”0” slot in the original code is 0.8s before the press (timeline 0) — the original GSAP pushes negative positions forward and moves the playhead along with them,
    // At the moment of pressing the number row is already 0.8s in, and the big title · second number entrance start at the press moment (at). So the split door clears 2.4s after pressing (original measured 2.45s)
    if (visual) tl.from(visual, { scale: 0.5, opacity: 1, clearProps: "transform,opacity", duration: 2.8 * k }, 0);
    if (content.length) tl.from(content, { y: 60, opacity: 0, clearProps: "transform", ease: "expo.out", stagger: 0.03 * k }, 0);
    if (header) tl.from(header, { yPercent: -100, clearProps: "transform" }, "<");
    tl.call(() => title.restart(), [], `<+=${0.8 * k}`);
    if (content.length) tl.from(content, { yPercent: 100, clearProps: "transform", ease: "expo.out", stagger: 0.3 * k }, "<");
    if (line) tl.from(line, { opacity: 0 }, "<");
  });
})();
