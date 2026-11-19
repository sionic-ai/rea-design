// News item: header entrance (chip unfolds, date .5s · reading time .6s, 100% from below in 1s expo.out), pill showing the amount read (00–100),
// When a subheading passes 6rem above the screen top, its row in the table of contents darkens. The phone pill rises from 200% below in .8s gl.quicky once in the body
(() => {
  const { gsap, ScrollTrigger, reduce } = window.P;
  const tag = document.querySelector("[data-ahead-tag]");
  const date = document.querySelector("[data-ahead-date]"), time = document.querySelector("[data-ahead-time]");
  const body = document.querySelector("[data-article-body]");
  const pill = document.querySelector("[data-progress]"), mpill = document.querySelector("[data-progress-m]");
  const anchors = [...document.querySelectorAll("[data-anchor]")];
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);

  if (!reduce) {
    window.P.tagPrep(tag);
    gsap.set([date, time], { yPercent: 100 });
    gsap.set(mpill, { yPercent: 200 });
  }
  window.P.appear(() => {
    if (reduce) return;
    gsap.timeline({ defaults: { duration: 1, ease: "expo.out" } })
      .add(window.P.tagShow(tag), 0)
      .to(date, { yPercent: 0 }, 0.5)
      .to(time, { yPercent: 0 }, "<+=0.1");
  });

  const setActive = (n) => anchors.forEach((a, k) => a.classList.toggle("is-on", k === n));
  setActive(0);
  window.P.ready(() => {
    ScrollTrigger.create({
      trigger: body, start: "top bottom", end: "bottom bottom",
      onUpdate: (st) => { const v = Math.round(st.progress * 100); pill.textContent = String(v).padStart(2, "0"); mpill.textContent = String(v); },
      onEnter: () => !reduce && gsap.to(mpill, { yPercent: 0, ease: "gl.quicky", duration: 0.8, overwrite: true }),
      onLeaveBack: () => !reduce && gsap.to(mpill, { yPercent: 200, ease: "gl.quicky", duration: 0.8, overwrite: true }),
    });
    anchors.forEach((a, n) => {
      const h = document.querySelector(a.getAttribute("href"));
      if (h) ScrollTrigger.create({ trigger: h, start: () => `top top+=${6 * rem()}px`, onEnter: () => setActive(n), onLeaveBack: () => setActive(Math.max(0, n - 1)) });
    });
  });
  anchors.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const h = document.querySelector(a.getAttribute("href"));
    if (window.P.lenis) window.P.lenis.scrollTo(h, { offset: -6 * rem() + 1 });
    else h.scrollIntoView();
  }));
})();
