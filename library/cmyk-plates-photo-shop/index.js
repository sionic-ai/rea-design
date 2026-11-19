// Hero loader: once per session. Original timeline values as-is (curve is the GSAP default power1.out, anything with no duration is .5s)
(() => {
  const intro = document.querySelector(".yc-intro");
  if (!intro) return;
  if (yc.reduce || sessionStorage.getItem("yc-intro") === "done") {
    intro.classList.add("is-done");
    return;
  }
  const dim = getComputedStyle(document.documentElement).getPropertyValue("--kf-dim").trim();
  const desk = innerWidth > 860;
  const logo = document.querySelector(".yc-logo");
  const dark = document.querySelector(".yc-dark");
  const head = document.querySelector(".yc-head");
  const mv = document.querySelector(".yc-home__img");
  const mvInner = document.querySelector(".yc-home__img .yc-ph > *");
  const credit = document.querySelector(".yc-home__credit");
  const copy = document.querySelector(".yc-home__copy");

  if (desk) {
    gsap.set([logo, dark, copy], { opacity: 0 });
    gsap.set(head, { x: "1.5rem", opacity: 0 });
    gsap.set(mv, { scale: 1.1, opacity: 0 });
    gsap.set(credit, { y: "1rem", opacity: 0 });
  } else {
    gsap.set(mvInner, { scale: 1.1, opacity: 0 });
  }

  const q = (s) => intro.querySelectorAll(s);
  const tl = gsap.timeline();
  tl.to(intro, { duration: 0.8 });
  tl.to(q(".is-main .is-lr"), { scale: 1, duration: 0.2 });
  tl.to(q(".is-main .is-tb"), { scale: 1, duration: 0.2 });
  tl.to(q(".is-main .is-rl"), { scale: 1, duration: 0.2 });
  tl.to(q(".is-main .is-bt"), { scale: 1, duration: 0.2 });
  tl.to(q(".is-sub i"), { scale: 1, duration: 0.2 });
  tl.to(q("i"), { backgroundColor: dim, duration: 0.4 });
  tl.to(q(".is-main"), { x: -10, y: -8, duration: 0.6 }, "<=");
  tl.to(q(".is-sub"), { x: 10, y: 8, duration: 0.6 }, "<=");
  tl.to(intro, { duration: 0.4 });
  tl.to(intro, { opacity: 0 });
  tl.to(intro, { zIndex: -1, visibility: "hidden", duration: 0 }, "<+0.4");
  if (desk) {
    tl.to(mv, { scale: 1, opacity: 1, duration: 1.5 });
    tl.to(dark, { opacity: 1, duration: 0.6 });
    tl.to(logo, { opacity: 1, duration: 0.8 }, "<=");
    tl.to(head, { x: "0rem", opacity: 1, duration: 0.8 }, "<=");
    tl.to(credit, { y: "0rem", opacity: 1, duration: 0.6 }, "<+0.2");
    // Original calls an element that does not exist here (.news) — it just takes up space and animates nothing. Left as an empty slot to match the timeline
    tl.to({}, { duration: 0.6 }, "<+0.2");
    tl.to(copy, { opacity: 1, duration: 0.6 }, "<+0.2");
  } else {
    tl.to(mvInner, { scale: 1, opacity: 1, duration: 1 });
  }
  sessionStorage.setItem("yc-intro", "done");
})();
