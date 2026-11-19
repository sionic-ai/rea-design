// Case detail: the hero video blurs and recedes on scroll, a giant word drifts sideways, and work details slide through as a horizontal slider like the original.
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const split = new SplitText(".dt-hero__h", { type: "chars" });
    gsap.timeline({ delay: 0.2 })
      .from(".dt-hero__frame", { x: 120, opacity: 0, duration: 1.4, ease: "power2.out" })
      .from(split.chars, { yPercent: 80, opacity: 0, duration: 0.7, stagger: 0.03, ease: "power2.out" }, 0.4)
      .from([".dt-hero__back", ".dt-hero__sub", ".dt-hero__p"], { y: 16, opacity: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" }, 0.8);
    gsap.to(".dt-hero__frame", { scale: 0.9, filter: "blur(6px)", opacity: 0.4, ease: "none", scrollTrigger: { trigger: ".dt-hero", start: "top top", end: "bottom top", scrub: true } });

    gsap.from(".dt-round .wf-img", { scale: 0.85, borderRadius: 80, ease: "none", scrollTrigger: { trigger: ".dt-round", start: "top bottom", end: "center center", scrub: true } });
    gsap.fromTo(".dt-challenge__word", { xPercent: 12 }, { xPercent: -12, ease: "none", scrollTrigger: { trigger: ".dt-challenge", start: "top bottom", end: "bottom top", scrub: true } });

    bsVideo.bar(document.querySelector(".dt-avatar video"), document.querySelector(".dt-avatar__bar i"));
  });

  // ── Work detail horizontal slider (original single-horizontal-slider.js): from the slot head +400px to the end with scrub 1.5,
  //    Each item slides sideways by its own width in one beat (1), the progress circle advances 283 per beat, and the overall circle makes one full turn by the end.
  //    The next item’s photo window opens fully from a 10% inset rounded window in the latter half of the previous beat (.5 late, .5 long). On reaching an item, its video appears in .3s and plays from the start ──
  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    const hz = document.querySelector(".dt-hz"), wrap = hz.querySelector(".dt-hz__wrap");
    const items = $$(".dt-hz__item", wrap);
    const now = hz.querySelector('[data-ring="current"]'), all = hz.querySelector('[data-ring="total"]');
    const vids = items.map((it) => it.querySelector(".dt-hz__video"));
    const played = new Set();
    let active = -1;
    const show = (i, dir) => {
      if (i === active) return;
      vids.forEach((w, k) => {
        if (!w) return;
        const v = w.querySelector("video");
        if (k === i) { w.classList.add("is-on"); if (dir > 0 && !played.has(k)) { v.currentTime = 0; played.add(k); } v.play().catch(() => {}); }
        else { v.pause(); if (dir < 0 && k > i) { w.classList.remove("is-on"); v.currentTime = 0; played.delete(k); } }
      });
      active = i;
    };
    const tl = gsap.timeline();
    let x = 0;
    items.forEach((item, i) => {
      if (i < items.length - 1) {
        const from = x, to = (x -= item.offsetWidth);
        tl.addLabel(`item-${i}`);
        tl.fromTo(wrap, { x: from }, { x: to, duration: 1, ease: "none", immediateRender: false }, `item-${i}`);
        tl.to(now, { strokeDashoffset: "-=283", duration: 1, ease: "none" }, `item-${i}`);
        tl.to(now, { strokeDashoffset: "-=283", duration: 1, ease: "none" }, `item-${i + 1}`);
      } else tl.addLabel(`item-${i}`);
      const clip = item.querySelector(".dt-hz__clip");
      if (i >= 1) tl.to(clip || {}, { duration: 0.5, delay: 0.5, ease: "none", ...(clip && { "--mask-progress": 1 }) }, `item-${i - 1}`);
    });
    tl.to(all, { strokeDashoffset: 0, duration: (items.length - 1) * 2, ease: "none" }, 0);
    const labels = items.map((_, i) => tl.labels[`item-${i}`]);
    ScrollTrigger.create({
      trigger: hz, start: "top+=400px top", end: "bottom bottom", scrub: 1.5, animation: tl,
      onUpdate: (st) => { const at = tl.time(); let i = 0; labels.forEach((l, k) => { if (at >= l - 1e-3) i = k; }); show(i, st.direction); },
    });
    return () => { vids.forEach((w) => w && w.querySelector("video").pause()); };
  });
  // Phone and reduced motion: videos in vertically stacked items play while visible
  mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
    $$(".dt-hz__video video").forEach((v) => bsVideo.watch(v));
  });
})();
