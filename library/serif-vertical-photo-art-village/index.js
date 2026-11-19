// Home: hero text stays while the photo passes and the photo is pushed 40% later, facility photo parallax, pinned logo push-up, facility vertical title sticking, today’s date (video version in sub.js).
(() => {
  const fv = document.querySelector(".i-fv");
  const contents = fv.querySelector(".i-fv__contents");
  const axs2 = fv.querySelector(".i-fv__axs2");
  const title = document.querySelector(".s-ititle");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const today = document.querySelector("[data-today]");
  if (today) today.textContent = `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} (${["sun", "mon", "tue", "wed", "thu", "fri", "sat"][d.getDay()]})`;

  const mm = gsap.matchMedia();
  mm.add({ pc: "(min-width: 767px)", sp: "(max-width: 766.98px)", motion: "(prefers-reduced-motion: no-preference)" }, ({ conditions: c }) => {
    if (!c.motion) return;
    if (c.pc) {
      ScrollTrigger.create({ trigger: fv, start: "top top", end: () => `bottom bottom+=${rpx(10)}`, onUpdate: (s) => { contents.style.transform = `translateY(${s.progress * (s.end - s.start)}px)`; } });
      ScrollTrigger.create({ trigger: fv, start: () => `bottom bottom+=${rpx(10)}`, end: () => `bottom+=${rpx(100)} bottom+=${rpx(10)}`, onUpdate: (s) => { title.style.transform = `translateY(${-s.progress * rpx(100)}px)`; } });
      gsap.fromTo(axs2, { yPercent: 0 }, { yPercent: 40, ease: "none", scrollTrigger: { trigger: fv, start: "top top", end: () => `bottom+=${innerHeight} bottom`, scrub: true, invalidateOnRefresh: true } });
      fv.querySelectorAll(".i-fv__block").forEach((b) => {
        gsap.fromTo(b.querySelector(".i-fv__block-bg"), { yPercent: 0 }, { yPercent: (0.4 / 1.4) * 100, ease: "none", scrollTrigger: { trigger: b, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
      });
    } else {
      const bgs = fv.querySelectorAll(".i-fv__block-bg");
      ScrollTrigger.create({ trigger: fv, start: "top top", endTrigger: fv.querySelector(".i-fv__main"), end: "bottom top", onUpdate: (s) => { axs2.style.transform = `translateY(${100 * s.progress * (0.2 / 1.2)}%)`; } });
      ScrollTrigger.create({ trigger: fv, start: "top top", end: "bottom top", onUpdate: (s) => { bgs.forEach((b) => { b.style.transform = `translateY(${100 * s.progress * (0.4 / 1.4)}%)`; }); } });
    }
    // The vertical facility title stays attached to the panel end (the margin below the card) — only the restaurant has a 30 top margin, the rest 80
    document.querySelectorAll(".i-fac").forEach((f, i) => {
      const t = f.querySelector(".i-fac__title");
      const top = i === 1 ? (c.pc ? 30 : 15) : (c.pc ? 80 : 50);
      const tail = c.pc ? 20 + 30 : 15 + 10;
      ScrollTrigger.create({ trigger: t, start: () => `top-=${rpx(top)} top`, end: () => `top+=${f.offsetHeight - t.offsetHeight - rpx(tail) - rpx(top)} top`, pin: true, pinSpacing: false });
    });
    return () => { contents.style.transform = ""; title.style.transform = ""; axs2.style.transform = ""; };
  });

  if (reduce) document.querySelectorAll("video[autoplay]").forEach((v) => v.pause());
})();
