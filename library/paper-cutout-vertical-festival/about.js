// Event intro: original numbers as is — 5 pinned hero screens for the intro text · intro y-135 (logo screen bottom → +100%) · shadow pinned +850% ·
// Logo pinned to screen → rests .5 then transparent and y-30 · back picture pinned +1000% (landscape lifts .5 and holds 1.5 · letter photo 1.5→3 · other letter photo 3) ·
// Fixed +400% per body section: heading enters → rest → body enters → rest → both exit at y-80 → rest. Every segment is ease none, one step 1·.5.
// Phone (width under 768, or portrait under 1024) follows the original aboutSP — shadow +400% · logo screen heading and logo drop out in turn · back image +600% · section +200% (only the last one gets a gap).
(() => {
  const mask = SD.glyphMask();
  document.querySelectorAll(".sd-ab-bg__glyph").forEach((el) => { el.style.maskImage = mask; el.style.webkitMaskImage = mask; });

  // As in the original, picked once at the width when first opened
  const sp = innerWidth < 768 || (innerWidth < 1024 && matchMedia("(orientation: portrait)").matches);
  const mm = gsap.matchMedia();
  if (sp) {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set([".sd-ab-section__title", ".sd-ab-section__text"], { opacity: 0, y: 80 });
      gsap.timeline({ scrollTrigger: { trigger: ".sd-ab-objs", start: "top top", end: "+=400%", pin: true, scrub: true } });
      gsap.timeline({ scrollTrigger: { trigger: ".sd-ab-mvwrap", start: "top top", pin: true, scrub: true, anticipatePin: 1 } })
        .to({}, { duration: 0.5 })
        .to(".sd-ab-title", { opacity: 0, y: -30, duration: 0.5, ease: "none" })
        .to({}, { duration: 0.5 })
        .to(".sd-ab-logo", { opacity: 0, y: -30, duration: 0.5, ease: "none" });
      const g1 = document.querySelector(".sd-ab-bg__glyph.type1");
      gsap.set(g1, { scale: 1.2, filter: "blur(20px)" });
      gsap.timeline({ scrollTrigger: { trigger: ".sd-ab-bg", start: "top top", end: "+=600%", pin: true, scrub: true } })
        .to(".sd-ab-bg__type1", { opacity: 1, duration: 0.5, ease: "none" }, 3)
        .to(".sd-ab-bg__type1", { opacity: 0, duration: 0.5, ease: "none" }, "+=3")
        .to(g1, { scale: 1, filter: "blur(0px)", opacity: 0.5, duration: 0.5, ease: "none" }, ">")
        .to(g1, { opacity: 0, duration: 0.5, ease: "none" }, "+=1.5")
        .to(".sd-ab-bg__glyph.type2", { opacity: 0.5, duration: 0.5, ease: "none" }, ">")
        .to({}, { duration: 0.5 });
      const secs = gsap.utils.toArray(".sd-ab-section");
      secs.forEach((sec, i) => {
        const t = sec.querySelector(".sd-ab-section__title"), p = sec.querySelector(".sd-ab-section__text");
        gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "+=200%", pin: true, scrub: true, pinSpacing: i === secs.length - 1 } })
          .to(t, { opacity: 1, y: 0, duration: 0.5, ease: "none" })
          .to({}, { duration: 1.5 })
          .to(t, { opacity: 0, y: -80, duration: 0.5, ease: "none" })
          .to({}, { duration: 1 })
          .to(p, { opacity: 1, y: 0, duration: 0.5, ease: "none" })
          .to({}, { duration: 2 })
          .to(p, { opacity: 0, y: -80, duration: 0.5, ease: "none" })
          .to({}, { duration: 0.5 });
      });
    });
    return;
  }
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const titles = gsap.utils.toArray(".sd-ab-section__title");
    const texts = gsap.utils.toArray(".sd-ab-section__text");
    gsap.set([titles, texts], { opacity: 0, y: 80 });

    ScrollTrigger.create({ trigger: ".sd-ab", start: "top top", end: () => `+=${innerHeight * 5}`, pin: ".sd-ab-heading", pinSpacing: false });
    gsap.to(".sd-ab-title", { y: -135, ease: "none", scrollTrigger: { trigger: ".sd-ab-mv", start: "bottom top", end: "bottom+=100% center", scrub: true } });
    gsap.timeline({ scrollTrigger: { trigger: ".sd-ab-objs", start: "top top", end: "+=850%", pin: true, scrub: true } });
    gsap.timeline({ scrollTrigger: { trigger: ".sd-ab-mv", start: "top top", pin: true, scrub: true, anticipatePin: 1 } })
      .to({}, { duration: 0.5 })
      .to(".sd-ab-logo", { opacity: 0, y: -30, duration: 0.5, ease: "none" });

    const g1 = document.querySelector(".sd-ab-bg__glyph.type1");
    gsap.set(g1, { scale: 1.2, filter: "blur(20px)" });
    gsap.timeline({ scrollTrigger: { trigger: ".sd-ab-bg", start: "top top", end: "+=1000%", pin: true, scrub: true } })
      .to(".sd-ab-bg__type1", { opacity: 1, duration: 0.5, ease: "none" }, 0.5)
      .to(".sd-ab-bg__type1", { opacity: 0, duration: 0.5, ease: "none" }, 1.5)
      .to(g1, { filter: "blur(0px)", scale: 1, opacity: 0.5, duration: 0.5, ease: "none" }, 1.5)
      .to(g1, { opacity: 0, duration: 0.5, ease: "none" }, 3)
      .to(".sd-ab-bg__glyph.type2", { opacity: 0.5, duration: 0.5, ease: "none" }, 3);

    gsap.utils.toArray(".sd-ab-section").forEach((sec, i) => {
      const t = titles[i], p = texts[i];
      gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "+=400%", pin: true, scrub: true } })
        .to(t, { opacity: 1, y: 0, duration: 1, ease: "none" })
        .to({}, { duration: 1 })
        .to(p, { opacity: 1, y: 0, duration: 1, ease: "none" })
        .to({}, { duration: 1 })
        .to(t, { opacity: 0, y: -80, duration: 1, ease: "none" })
        .to(p, { opacity: 0, y: -80, duration: 1, ease: "none" })
        .to({}, { duration: 1 });
    });
  });
})();
